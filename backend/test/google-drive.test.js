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
      { id: "zip", name: "bulk-export.zip", mimeType: "application/zip", modifiedTime: "2026-07-20T00:00:00Z" },
      { id: "form", name: "Student Survey", mimeType: "application/vnd.google-apps.form", modifiedTime: "2026-07-20T00:00:00Z" },
    ]],
    ["coursebook", [
      { id: "lesson", name: "Unit 3 Reaction Rates.pdf", mimeType: "application/pdf", modifiedTime: "2026-07-20T00:00:00Z", size: "120" },
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

describe("Google Drive curriculum adapter", () => {
  test("indexes only Student_Materials from the real Lotus hierarchy", async () => {
    const drive = new GoogleDriveStore(fakeDriveClient());
    const result = await drive.listCurriculumFiles({
      root_folder_id: "root",
      root_folder_name: "Lotus Academy Formal Course Pilots - Text Based",
      drive_id: null,
    });
    assert.equal(result.records.length, 3);
    assert.equal(result.records.every((item) => item.courseCode === "SCH4U"), true);
    const lesson = result.records.find((item) => item.driveFileId === "lesson");
    assert.equal(lesson.unitNumber, 3);
    assert.equal(lesson.category, "Lessons");
    assert.match(lesson.relativePath, /SCH4U - Chemistry\/Student_Materials\/01 Coursebook/);
    assert.equal(result.records.find((item) => item.driveFileId === "assessment-file").category, "Assessments");
    assert.equal(result.records.find((item) => item.driveFileId === "assessment-file").unitNumber, 1);
    assert.equal(result.records.find((item) => item.driveFileId === "reading-file").category, "Resources");
    assert.equal(result.records.some((item) => item.driveFileId === "zip"), false);
    assert.equal(result.records.some((item) => item.driveFileId === "form"), false);
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
