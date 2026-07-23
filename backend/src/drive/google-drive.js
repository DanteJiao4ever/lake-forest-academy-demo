import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { google } from "googleapis";
import { ApiError } from "../lib/errors.js";

const folderMime = "application/vnd.google-apps.folder";
const shortcutMime = "application/vnd.google-apps.shortcut";
const launchCourseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];
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

function escapeQuery(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
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
    const courseFolders = await this.listChildren(root.id, source.drive_id);
    for (const course of courseFolders) {
      const courseCode = courseCodeFromFolder(course.name);
      if (course.mimeType !== folderMime || !courseCode) {
        skippedCount += 1;
        continue;
      }
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
          if (item.mimeType === folderMime) {
            if (/^(administration|staff[_ -]?only)$/i.test(item.name)) {
              skippedCount += 1;
              continue;
            }
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
          const unitMatch = pathText.match(/(?:^|[/ _-])Unit[ _-]*0*([1-9]\d{0,2})(?:\b|[/ _-])/i);
          const unitNumber = unitMatch ? Number(unitMatch[1]) : 1;
          const category = /assessment|evaluation/i.test(pathText)
            ? "Assessments"
            : /reading[_ -]?library|resources?/i.test(pathText)
              ? "Resources"
              : "Lessons";
          records.push({
            driveFileId: item.id,
            parentFolderId: current.id,
            courseCode,
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
    return { records, skippedCount };
  }

  async ensureFolder(parentId, name, driveId = null) {
    const key = `${parentId}:${name}`;
    if (this.folderCache.has(key)) return this.folderCache.get(key);
    const response = await this.client.files.list({
      q: `'${escapeQuery(parentId)}' in parents and name = '${escapeQuery(name)}' and mimeType = '${folderMime}' and trashed = false`,
      fields: "files(id,name)",
      pageSize: 2,
      ...this.requestOptions(driveId),
    });
    let folderId = response.data.files?.[0]?.id;
    if (!folderId) {
      const created = await this.client.files.create({
        requestBody: { name, mimeType: folderMime, parents: [parentId] },
        fields: "id",
        supportsAllDrives: true,
      });
      folderId = created.data.id;
    }
    this.folderCache.set(key, folderId);
    return folderId;
  }

  async uploadSubmission({ target, pathSegments, storedName, mimeType, buffer }) {
    const root = await this.getMetadata(target.root_folder_id);
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
    const created = await this.client.files.create({
      requestBody: { name: storedName, parents: [parentId] },
      media: { mimeType, body: Readable.from(buffer) },
      fields: "id,name,mimeType,parents,webViewLink,createdTime,modifiedTime,size",
      supportsAllDrives: true,
    });
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
