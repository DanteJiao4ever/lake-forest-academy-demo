import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { GoogleDriveStore } from "../src/drive/google-drive.js";

const folder = "application/vnd.google-apps.folder";

function fakeDriveClient() {
  const nodes = new Map([
    ["root", { id: "root", name: "Lotus Academy Formal Course Pilots - Text Based", mimeType: folder }],
  ]);
  const children = new Map([
    ["root", [
      { id: "sch", name: "SCH4U - Chemistry", mimeType: folder },
      { id: "unknown", name: "Archive", mimeType: folder },
    ]],
    ["sch", [
      { id: "student", name: "Student_Materials", mimeType: folder },
      { id: "admin", name: "Administration", mimeType: folder },
      { id: "staff", name: "Staff_Only", mimeType: folder },
    ]],
    ["student", [
      { id: "coursebook", name: "01 Coursebook and Workbook", mimeType: folder },
      { id: "assessment", name: "02 Assessment", mimeType: folder },
      { id: "reading", name: "Reading_Library", mimeType: folder },
      { id: "answer-key", name: "03 STAFF_ONLY Teacher Guide and Answer Key.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "90" },
      { id: "zip", name: "bulk-export.zip", mimeType: "application/zip", modifiedTime: "2026-07-20T00:00:00Z" },
      { id: "form", name: "Student Survey", mimeType: "application/vnd.google-apps.form", modifiedTime: "2026-07-20T00:00:00Z" },
    ]],
    ["coursebook", [
      { id: "lesson", name: "Unit 3 Reaction Rates.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "120" },
      { id: "module-00", name: "Module 00", mimeType: folder },
      { id: "module-11", name: "Module 11", mimeType: folder },
      { id: "module-12", name: "Module 12", mimeType: folder },
      { id: "unit-10", name: "Unit 10", mimeType: folder },
      { id: "unit-11", name: "Unit 11", mimeType: folder },
    ]],
    ["module-00", [
      { id: "orientation", name: "Orientation.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "10" },
    ]],
    ["module-11", [
      { id: "final-module", name: "Final.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "10" },
    ]],
    ["module-12", [
      { id: "invalid-module", name: "Out of range.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "10" },
    ]],
    ["unit-10", [
      { id: "valid-unit", name: "Valid unit.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "10" },
    ]],
    ["unit-11", [
      { id: "invalid-unit", name: "Out of range unit.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "10" },
    ]],
    ["assessment", [
      { id: "assessment-file", name: "Final Evaluation.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "200" },
    ]],
    ["reading", [
      { id: "reading-file", name: "Reference Article.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "80" },
    ]],
  ]);
  return {
    files: {
      async get({ fileId }) { return { data: nodes.get(fileId) }; },
      async list({ q }) {
        const parentId = q.match(/^'([^']+)' in parents/)?.[1];
        return { data: { files: children.get(parentId) || [] } };
      },
    },
  };
}

function upstreamError(status, reason, secret = "sensitive-upstream-message") {
  const error = new Error(secret);
  error.response = {
    status,
    data: {
      error: {
        message: secret,
        errors: [{ reason }],
      },
    },
  };
  return error;
}

function submissionDriveClient({ failAt, error }) {
  return {
    files: {
      async get() {
        if (failAt === "rootMetadata") throw error;
        return {
          data: {
            id: "submission-root",
            name: "Lake Forest Learning - Student Submissions",
            mimeType: folder,
          },
        };
      },
      async list() {
        if (failAt === "folderList") throw error;
        return { data: { files: [] } };
      },
      async create(input) {
        const creatingFolder = input.requestBody?.mimeType === folder;
        if (
          (failAt === "folderCreate" && creatingFolder) ||
          (failAt === "fileCreate" && !creatingFolder)
        ) {
          throw error;
        }
        return {
          data: creatingFolder
            ? { id: "created-folder" }
            : { id: "created-file", createdTime: "2026-08-04T00:00:00.000Z" },
        };
      },
    },
  };
}

describe("Google Drive curriculum adapter", () => {
  test("checks curriculum root readability with a curriculum-specific error", async () => {
    const readable = new GoogleDriveStore(fakeDriveClient());
    assert.equal(
      await readable.curriculumReady(
        "root",
        "Lotus Academy Formal Course Pilots - Text Based",
      ),
      true,
    );
    const unreadable = new GoogleDriveStore({
      files: { async get() { throw new Error("permission denied"); } },
    });
    await assert.rejects(
      unreadable.curriculumReady("root", "Curriculum Root"),
      (error) => error.code === "CURRICULUM_DRIVE_UNAVAILABLE",
    );
  });

  test("indexes only Student_Materials from the real Lotus hierarchy", async () => {
    const drive = new GoogleDriveStore(fakeDriveClient());
    const result = await drive.listCurriculumFiles({
      root_folder_id: "root",
      root_folder_name: "Lotus Academy Formal Course Pilots - Text Based",
      drive_id: null,
    });
    assert.equal(result.records.length, 8);
    assert.equal(result.records.every((item) => item.courseCode === "SCH4U"), true);
    assert.deepEqual(result.discoveredCourseCodes, ["SCH4U"]);
    assert.deepEqual(result.materialCourseCodes, ["SCH4U"]);
    const lesson = result.records.find((item) => item.driveFileId === "lesson");
    assert.equal(lesson.unitNumber, 3);
    assert.equal(lesson.category, "Lessons");
    assert.match(lesson.relativePath, /SCH4U - Chemistry\/Student_Materials\/01 Coursebook/);
    assert.equal(result.records.find((item) => item.driveFileId === "assessment-file").category, "Assessments");
    assert.equal(result.records.find((item) => item.driveFileId === "assessment-file").unitNumber, null);
    assert.equal(result.records.find((item) => item.driveFileId === "reading-file").category, "Resources");
    assert.equal(result.records.find((item) => item.driveFileId === "orientation").moduleId, "sch4u-m00");
    assert.equal(result.records.find((item) => item.driveFileId === "final-module").moduleId, "sch4u-m11");
    assert.equal(result.records.find((item) => item.driveFileId === "invalid-module").moduleId, null);
    assert.equal(result.records.find((item) => item.driveFileId === "valid-unit").unitNumber, 10);
    assert.equal(result.records.find((item) => item.driveFileId === "invalid-unit").unitNumber, null);
    assert.equal(result.records.some((item) => item.driveFileId === "zip"), false);
    assert.equal(result.records.some((item) => item.driveFileId === "form"), false);
    assert.equal(result.records.some((item) => item.driveFileId === "answer-key"), false);
  });

  test("exports Google-native documents through the private API instead of redirecting", async () => {
    const calls = [];
    const drive = new GoogleDriveStore({
      files: {
        async get() {
          return {
            data: {
              id: "google-doc-1",
              name: "Course Guide",
              mimeType: "application/vnd.google-apps.document",
            },
          };
        },
        async export(input, options) {
          calls.push({ input, options });
          return { data: "private-export-stream" };
        },
      },
    });
    const opened = await drive.openFile("google-doc-1");
    assert.equal(opened.kind, "stream");
    assert.equal(opened.fileName, "Course Guide.docx");
    assert.equal(
      opened.contentType,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    assert.equal(opened.stream, "private-export-stream");
    assert.deepEqual(calls[0], {
      input: {
        fileId: "google-doc-1",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      options: { responseType: "stream" },
    });
  });
});

describe("Google Drive submission error mapping", () => {
  const target = {
    root_folder_id: "submission-root",
    root_folder_name: "Lake Forest Learning - Student Submissions",
    drive_id: null,
  };

  for (const scenario of [
    {
      name: "maps a file-create permission error",
      failAt: "fileCreate",
      pathSegments: [],
      status: 403,
      reason: "insufficientFilePermissions",
      code: "SUBMISSION_DRIVE_PERMISSION_DENIED",
      operation: "submission_file_create",
      safeReason: "insufficient_file_permissions",
    },
    {
      name: "maps a file-create storage quota error before generic 403 handling",
      failAt: "fileCreate",
      pathSegments: [],
      status: 403,
      reason: "storageQuotaExceeded",
      code: "SUBMISSION_DRIVE_QUOTA_EXCEEDED",
      operation: "submission_file_create",
      safeReason: "storage_quota_exceeded",
    },
    {
      name: "maps a folder-list rate limit error",
      failAt: "folderList",
      pathSegments: ["SCH4U"],
      status: 429,
      reason: "userRateLimitExceeded",
      code: "SUBMISSION_DRIVE_RATE_LIMITED",
      operation: "submission_folder_list",
      safeReason: "user_rate_limit_exceeded",
    },
    {
      name: "maps a folder-create unavailable error",
      failAt: "folderCreate",
      pathSegments: ["SCH4U"],
      status: 503,
      reason: "backendError",
      code: "SUBMISSION_DRIVE_UNAVAILABLE",
      operation: "submission_folder_create",
      safeReason: "backend_error",
    },
  ]) {
    test(scenario.name, async () => {
      const secret = `secret-${scenario.failAt}`;
      const drive = new GoogleDriveStore(
        submissionDriveClient({
          failAt: scenario.failAt,
          error: upstreamError(scenario.status, scenario.reason, secret),
        }),
      );
      await assert.rejects(
        drive.uploadSubmission({
          target,
          pathSegments: scenario.pathSegments,
          storedName: "safe.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7"),
        }),
        (error) => {
          assert.equal(error.statusCode, 503);
          assert.equal(error.code, scenario.code);
          assert.equal(error.message, "Submission storage is temporarily unavailable.");
          assert.deepEqual(error.logContext, {
            operation: scenario.operation,
            upstreamStatus: scenario.status,
            upstreamReason: scenario.safeReason,
          });
          assert.equal(error.cause, undefined);
          assert.equal(JSON.stringify(error).includes(secret), false);
          return true;
        },
      );
    });
  }

  test("does not copy an unknown upstream reason into diagnostics", async () => {
    const drive = new GoogleDriveStore(
      submissionDriveClient({
        failAt: "rootMetadata",
        error: upstreamError(500, "credential-token-secret-value"),
      }),
    );
    await assert.rejects(
      drive.uploadSubmission({
        target,
        pathSegments: [],
        storedName: "safe.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7"),
      }),
      (error) => {
        assert.equal(error.code, "SUBMISSION_DRIVE_UNAVAILABLE");
        assert.deepEqual(error.logContext, {
          operation: "submission_root_metadata",
          upstreamStatus: 500,
          upstreamReason: "unavailable",
        });
        assert.equal(JSON.stringify(error).includes("credential-token-secret-value"), false);
        return true;
      },
    );
  });
});

describe("Google Drive submission target discovery", () => {
  test("derives Shared Drive topology without returning the protected root ID", async () => {
    const drive = new GoogleDriveStore({
      files: {
        async get() {
          return {
            data: {
              id: "protected-root",
              name: "Lake Forest Learning - Student Submissions",
              mimeType: folder,
              driveId: "shared-drive-test",
              capabilities: {
                canAddChildren: true,
                canListChildren: true,
                canTrashChildren: true,
              },
            },
          };
        },
      },
    });

    const descriptor = await drive.inspectSubmissionTarget(
      "protected-root",
      "Lake Forest Learning - Student Submissions",
    );

    assert.deepEqual(descriptor, {
      driveKind: "shared_drive",
      driveId: "shared-drive-test",
      canAddChildren: true,
      canListChildren: true,
      canTrashChildren: true,
    });
    assert.equal(Object.hasOwn(descriptor, "rootFolderId"), false);
  });

  for (const scenario of [
    {
      name: "permission failures",
      error: upstreamError(403, "insufficientFilePermissions"),
      code: "SUBMISSION_DRIVE_PERMISSION_DENIED",
      reason: "insufficient_file_permissions",
    },
    {
      name: "rate limits",
      error: upstreamError(429, "rateLimitExceeded"),
      code: "SUBMISSION_DRIVE_RATE_LIMITED",
      reason: "rate_limit_exceeded",
    },
    {
      name: "storage quota failures",
      error: upstreamError(403, "storageQuotaExceeded"),
      code: "SUBMISSION_DRIVE_QUOTA_EXCEEDED",
      reason: "storage_quota_exceeded",
    },
    {
      name: "upstream outages",
      error: upstreamError(503, "backendError"),
      code: "SUBMISSION_DRIVE_UNAVAILABLE",
      reason: "backend_error",
    },
  ]) {
    test(`preserves stable diagnostics for ${scenario.name} during discovery`, async () => {
      const drive = new GoogleDriveStore({
        files: { async get() { throw scenario.error; } },
      });

      await assert.rejects(
        drive.inspectSubmissionTarget(
          "protected-root",
          "Lake Forest Learning - Student Submissions",
        ),
        (error) => {
          assert.equal(error.code, scenario.code);
          assert.deepEqual(error.logContext, {
            operation: "submission_root_metadata",
            upstreamStatus: scenario.error.response.status,
            upstreamReason: scenario.reason,
          });
          return true;
        },
      );
    });
  }

  test("moves rollback files to trash with Shared Drive support", async () => {
    const calls = [];
    const drive = new GoogleDriveStore({
      files: {
        async update(input) {
          calls.push(input);
          return { data: { id: input.fileId, trashed: true } };
        },
      },
    });

    await drive.trashFile("uploaded-file-test");

    assert.deepEqual(calls, [{
      fileId: "uploaded-file-test",
      requestBody: { trashed: true },
      fields: "id,trashed",
      supportsAllDrives: true,
    }]);
  });
});
