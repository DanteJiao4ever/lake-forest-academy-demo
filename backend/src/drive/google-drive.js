import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { google } from "googleapis";
import { ApiError } from "../lib/errors.js";

const folderMime = "application/vnd.google-apps.folder";
const shortcutMime = "application/vnd.google-apps.shortcut";
const launchCourseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];
const catalogModuleNumbers = new Set(Array.from({ length: 12 }, (_, index) => index));
const curriculumUnitNumbers = new Set(Array.from({ length: 10 }, (_, index) => index + 1));
const submissionDriveReasonAliases = new Map([
  ["autherror", "auth_error"],
  ["insufficientfilepermissions", "insufficient_file_permissions"],
  ["insufficientpermissions", "insufficient_permissions"],
  ["permissiondenied", "permission_denied"],
  ["forbidden", "forbidden"],
  ["storagequotaexceeded", "storage_quota_exceeded"],
  ["quotaexceeded", "quota_exceeded"],
  ["teamdrivefilelimitexceeded", "team_drive_file_limit_exceeded"],
  ["activeitemcreationlimitexceeded", "active_item_creation_limit_exceeded"],
  ["dailylimitexceeded", "daily_limit_exceeded"],
  ["dailylimitexceededunreg", "daily_limit_exceeded_unregistered"],
  ["downloadquotaexceeded", "download_quota_exceeded"],
  ["ratelimitexceeded", "rate_limit_exceeded"],
  ["userratelimitexceeded", "user_rate_limit_exceeded"],
  ["sharingratelimitexceeded", "sharing_rate_limit_exceeded"],
  ["resourceexhausted", "resource_exhausted"],
  ["backenderror", "backend_error"],
  ["internalerror", "internal_error"],
  ["serviceunavailable", "service_unavailable"],
  ["notfound", "not_found"],
  ["econnreset", "connection_reset"],
  ["enotfound", "host_not_found"],
  ["etimedout", "timed_out"],
]);
const submissionDrivePermissionReasons = new Set([
  "auth_error",
  "insufficient_file_permissions",
  "insufficient_permissions",
  "permission_denied",
  "forbidden",
]);
const submissionDriveQuotaReasons = new Set([
  "storage_quota_exceeded",
  "quota_exceeded",
  "team_drive_file_limit_exceeded",
  "active_item_creation_limit_exceeded",
  "daily_limit_exceeded",
  "daily_limit_exceeded_unregistered",
  "download_quota_exceeded",
]);
const submissionDriveRateLimitReasons = new Set([
  "rate_limit_exceeded",
  "user_rate_limit_exceeded",
  "sharing_rate_limit_exceeded",
  "resource_exhausted",
]);
const googleExportFormats = new Map([
  [
    "application/vnd.google-apps.document",
    {
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: ".docx",
    },
  ],
  [
    "application/vnd.google-apps.spreadsheet",
    {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: ".xlsx",
    },
  ],
  [
    "application/vnd.google-apps.presentation",
    {
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: ".pptx",
    },
  ],
  [
    "application/vnd.google-apps.drawing",
    { mimeType: "application/pdf", extension: ".pdf" },
  ],
]);

function courseCodeFromFolder(name) {
  const upper = String(name || "").toUpperCase();
  return launchCourseCodes.find((code) => new RegExp(`(^|[^A-Z0-9])${code}([^A-Z0-9]|$)`).test(upper)) || "";
}

function isStaffOnlyMaterialPath(parts) {
  return parts.some((part) =>
    /(?:^|[^a-z0-9])(?:administration|staff[_ -]?only|teacher[_ -]?guide|answer[_ -]?key)(?:[^a-z0-9]|$)/i.test(
      String(part || ""),
    ),
  );
}

function escapeQuery(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function catalogNumberFromPath(pathText, label, allowedNumbers) {
  const match = String(pathText || "").match(
    new RegExp(
      `(?:^|[/\\s_-])${label}[\\s_-]*0*(\\d{1,2})(?=$|[/\\s_.-])`,
      "i",
    ),
  );
  if (!match) return null;
  const value = Number(match[1]);
  return allowedNumbers.has(value) ? value : null;
}

function googleUpstreamStatus(error) {
  const candidates = [error?.response?.status, error?.status, error?.code];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isInteger(value) && value >= 100 && value <= 599) return value;
  }
  return null;
}

function googleUpstreamReason(error) {
  const candidates = [
    error?.response?.data?.error?.errors?.[0]?.reason,
    error?.response?.data?.error?.reason,
    error?.response?.data?.error?.status,
    error?.errors?.[0]?.reason,
    error?.reason,
    typeof error?.code === "string" ? error.code : null,
  ];
  for (const candidate of candidates) {
    const key = String(candidate || "").toLowerCase().replaceAll(/[^a-z0-9]+/g, "");
    if (submissionDriveReasonAliases.has(key)) {
      return submissionDriveReasonAliases.get(key);
    }
  }
  return null;
}

function mapSubmissionDriveError(error, operation) {
  if (error instanceof ApiError) return error;
  const upstreamStatus = googleUpstreamStatus(error);
  const knownReason = googleUpstreamReason(error);
  let category = "unavailable";
  if (upstreamStatus === 429 || submissionDriveRateLimitReasons.has(knownReason)) {
    category = "rate_limited";
  } else if (submissionDriveQuotaReasons.has(knownReason)) {
    category = "quota_exceeded";
  } else if (
    upstreamStatus === 401 ||
    upstreamStatus === 403 ||
    submissionDrivePermissionReasons.has(knownReason)
  ) {
    category = "permission_denied";
  }
  const codes = {
    permission_denied: "SUBMISSION_DRIVE_PERMISSION_DENIED",
    quota_exceeded: "SUBMISSION_DRIVE_QUOTA_EXCEEDED",
    rate_limited: "SUBMISSION_DRIVE_RATE_LIMITED",
    unavailable: "SUBMISSION_DRIVE_UNAVAILABLE",
  };
  const mapped = new ApiError(
    503,
    codes[category],
    "Submission storage is temporarily unavailable.",
  );
  mapped.logContext = Object.freeze({
    operation,
    upstreamStatus,
    upstreamReason: knownReason || category,
  });
  return mapped;
}

export async function createGoogleDrive(config) {
  let credentials;
  if (config.googleCredentialsBase64) {
    try {
      credentials = JSON.parse(
        Buffer.from(config.googleCredentialsBase64, "base64").toString("utf8"),
      );
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not valid service-account JSON.");
    }
  } else if (config.googleCredentialsPath) {
    credentials = JSON.parse(await readFile(config.googleCredentialsPath, "utf8"));
  }
  const auth = new google.auth.GoogleAuth({
    ...(credentials ? { credentials } : {}),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return new GoogleDriveStore(google.drive({ version: "v3", auth }));
}

export class GoogleDriveStore {
  constructor(client) {
    this.client = client;
    this.folderCache = new Map();
  }

  async ready(rootFolderId) {
    if (!String(rootFolderId || "").trim()) {
      throw new ApiError(
        503,
        "SUBMISSION_STORAGE_UNAVAILABLE",
        "Submission storage has not been configured.",
      );
    }
    try {
      const root = await this.getMetadata(rootFolderId);
      if (!root || root.trashed || root.mimeType !== folderMime) {
        throw new Error("The configured submission root is not an active folder.");
      }
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        503,
        "SUBMISSION_STORAGE_UNAVAILABLE",
        "Submission storage is temporarily unavailable.",
      );
    }
  }

  async curriculumReady(rootFolderId, expectedRootName = "") {
    if (!String(rootFolderId || "").trim()) {
      throw new ApiError(
        503,
        "CURRICULUM_DRIVE_UNAVAILABLE",
        "Curriculum storage has not been configured.",
      );
    }
    try {
      const root = await this.getMetadata(rootFolderId);
      if (
        !root ||
        root.trashed ||
        root.mimeType !== folderMime ||
        (expectedRootName && root.name !== expectedRootName)
      ) {
        throw new Error("The configured curriculum root is not an active folder.");
      }
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        503,
        "CURRICULUM_DRIVE_UNAVAILABLE",
        "Curriculum storage is temporarily unavailable.",
      );
    }
  }

  requestOptions(driveId) {
    return {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      ...(driveId ? { corpora: "drive", driveId } : {}),
    };
  }

  async getMetadata(fileId) {
    const response = await this.client.files.get({
      fileId,
      fields: "id,name,mimeType,parents,webViewLink,modifiedTime,size,trashed",
      supportsAllDrives: true,
    });
    return response.data;
  }

  async listChildren(parentId, driveId = null) {
    const files = [];
    let pageToken;
    do {
      const response = await this.client.files.list({
        q: `'${escapeQuery(parentId)}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,parents,webViewLink,modifiedTime,size,trashed,shortcutDetails)",
        pageSize: 1000,
        pageToken,
        ...this.requestOptions(driveId),
      });
      files.push(...(response.data.files || []));
      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);
    return files;
  }

  async listCurriculumFiles(source) {
    const root = await this.getMetadata(source.root_folder_id);
    const expectedRootName = source.root_folder_name || source.rootFolderName;
    if (
      root.trashed ||
      root.mimeType !== folderMime ||
      (expectedRootName && root.name !== expectedRootName)
    ) {
      throw new ApiError(
        422,
        "INVALID_FOLDER_STRUCTURE",
        `The configured root must be a readable folder named ${expectedRootName || "as configured"}.`,
      );
    }
    const records = [];
    let skippedCount = 0;
    const discoveredCourseCodes = new Set();
    const courseFolders = await this.listChildren(root.id, source.drive_id);
    for (const course of courseFolders) {
      const courseCode = courseCodeFromFolder(course.name);
      if (course.mimeType !== folderMime || !courseCode) {
        skippedCount += 1;
        continue;
      }
      discoveredCourseCodes.add(courseCode);
      const courseChildren = await this.listChildren(course.id, source.drive_id);
      const studentMaterials = courseChildren.find(
        (item) =>
          item.mimeType === folderMime &&
          item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_") ===
            "student_materials_",
      ) || courseChildren.find(
        (item) =>
          item.mimeType === folderMime &&
          item.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, "") ===
            "student_materials",
      );
      if (!studentMaterials) {
        skippedCount += courseChildren.length || 1;
        continue;
      }
      const queue = [{ id: studentMaterials.id, path: [studentMaterials.name] }];
      while (queue.length) {
        const current = queue.shift();
        const children = await this.listChildren(current.id, source.drive_id);
        for (const item of children) {
          const itemPath = [...current.path, item.name];
          if (isStaffOnlyMaterialPath(itemPath)) {
            skippedCount += 1;
            continue;
          }
          if (item.mimeType === folderMime) {
            queue.push({ id: item.id, path: itemPath });
            continue;
          }
          if (
            item.mimeType === shortcutMime ||
            item.mimeType === "application/zip" ||
            /\.zip$/i.test(item.name)
          ) {
            skippedCount += 1;
            continue;
          }
          if (
            item.mimeType?.startsWith("application/vnd.google-apps.") &&
            !googleExportFormats.has(item.mimeType)
          ) {
            skippedCount += 1;
            continue;
          }
          const pathText = itemPath.join("/");
          const moduleNumber = catalogNumberFromPath(
            pathText,
            "Module",
            catalogModuleNumbers,
          );
          const unitNumber = catalogNumberFromPath(
            pathText,
            "Unit",
            curriculumUnitNumbers,
          );
          const category = /assessment[_ -]?reading[_ -]?library|evidence[_ -]?file|platform[_ -]?delivery|reading[_ -]?library|resources?/i.test(pathText)
            ? "Resources"
            : /assignments?|submission[_ -]?task/i.test(pathText)
              ? "Assignments"
              : /assessment|evaluation/i.test(pathText)
                ? "Assessments"
                : "Lessons";
          records.push({
            driveFileId: item.id,
            parentFolderId: current.id,
            courseCode,
            moduleId:
              moduleNumber === null
                ? null
                : `${courseCode.toLowerCase()}-m${String(moduleNumber).padStart(2, "0")}`,
            unitNumber,
            category,
            fileName: item.name,
            relativePath: `${root.name}/${course.name}/${itemPath.join("/")}`,
            mimeType: item.mimeType || "application/octet-stream",
            webViewLink: item.webViewLink || null,
            modifiedAt: item.modifiedTime || new Date().toISOString(),
            sizeBytes: item.size == null ? null : Number(item.size),
          });
        }
      }
    }
    return {
      records,
      skippedCount,
      discoveredCourseCodes: [...discoveredCourseCodes].sort(),
      materialCourseCodes: [...new Set(records.map((record) => record.courseCode))].sort(),
    };
  }

  async ensureFolder(parentId, name, driveId = null) {
    const key = `${parentId}:${name}`;
    if (this.folderCache.has(key)) return this.folderCache.get(key);
    let response;
    try {
      response = await this.client.files.list({
        q: `'${escapeQuery(parentId)}' in parents and name = '${escapeQuery(name)}' and mimeType = '${folderMime}' and trashed = false`,
        fields: "files(id,name)",
        pageSize: 2,
        ...this.requestOptions(driveId),
      });
    } catch (error) {
      throw mapSubmissionDriveError(error, "submission_folder_list");
    }
    let folderId = response.data.files?.[0]?.id;
    if (!folderId) {
      let created;
      try {
        created = await this.client.files.create({
          requestBody: { name, mimeType: folderMime, parents: [parentId] },
          fields: "id",
          supportsAllDrives: true,
        });
      } catch (error) {
        throw mapSubmissionDriveError(error, "submission_folder_create");
      }
      folderId = created.data.id;
    }
    this.folderCache.set(key, folderId);
    return folderId;
  }

  async uploadSubmission({ target, pathSegments, storedName, mimeType, buffer }) {
    let root;
    try {
      root = await this.getMetadata(target.root_folder_id);
    } catch (error) {
      throw mapSubmissionDriveError(error, "submission_root_metadata");
    }
    const expectedName =
      target.root_folder_name ||
      target.rootFolderName ||
      "Lake Forest Learning - Student Submissions";
    if (root.trashed || root.mimeType !== folderMime || root.name !== expectedName) {
      throw new ApiError(
        422,
        "INVALID_SUBMISSION_ROOT",
        `The submission root must be a readable folder named ${expectedName}.`,
      );
    }
    let parentId = target.root_folder_id;
    for (const segment of pathSegments) {
      parentId = await this.ensureFolder(parentId, segment, target.drive_id);
    }
    let created;
    try {
      created = await this.client.files.create({
        requestBody: { name: storedName, parents: [parentId] },
        media: { mimeType, body: Readable.from(buffer) },
        fields: "id,name,mimeType,parents,webViewLink,createdTime,modifiedTime,size",
        supportsAllDrives: true,
      });
    } catch (error) {
      throw mapSubmissionDriveError(error, "submission_file_create");
    }
    return {
      driveFileId: created.data.id,
      parentFolderId: parentId,
      webViewLink: created.data.webViewLink || null,
      createdAt: created.data.createdTime || new Date().toISOString(),
      modifiedAt: created.data.modifiedTime || new Date().toISOString(),
    };
  }

  async deleteFile(fileId) {
    await this.client.files.delete({ fileId, supportsAllDrives: true });
  }

  async openFile(fileId) {
    const metadata = await this.getMetadata(fileId);
    if (metadata.mimeType?.startsWith("application/vnd.google-apps.")) {
      const exportFormat = googleExportFormats.get(metadata.mimeType);
      if (!exportFormat) {
        throw new ApiError(
          415,
          "GOOGLE_FILE_EXPORT_UNSUPPORTED",
          "This Google file type cannot be exported through the learning platform.",
        );
      }
      const response = await this.client.files.export(
        { fileId, mimeType: exportFormat.mimeType },
        { responseType: "stream" },
      );
      const baseName = String(metadata.name || "material").replace(
        /\.[a-z0-9]{1,8}$/i,
        "",
      );
      return {
        kind: "stream",
        stream: response.data,
        metadata,
        contentType: exportFormat.mimeType,
        fileName: `${baseName}${exportFormat.extension}`,
      };
    }
    const response = await this.client.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );
    return {
      kind: "stream",
      stream: response.data,
      metadata,
      contentType: metadata.mimeType || "application/octet-stream",
      fileName: metadata.name || "material",
    };
  }
}
