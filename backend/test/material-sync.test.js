import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MaterialSyncService } from "../src/services/material-sync.js";

function syncRepository() {
  const run = {
    id: "run-1",
    source_id: "source-1",
    status: "queued",
  };
  return {
    run,
    async markSyncRunning(id) {
      if (id !== run.id || run.status !== "queued") return null;
      run.status = "running";
      return { ...run };
    },
    async getSyncRun() {
      return { ...run };
    },
    async getDriveSource() {
      return { id: "source-1", status: "active" };
    },
    async finishMaterialSync(_run, records, skippedCount) {
      run.status = "succeeded";
      run.discovered_file_count = records.length;
      run.skipped_file_count = skippedCount;
    },
    async failSync(_id, code, message) {
      run.status = "failed";
      run.error_code = code;
      run.error_message = message;
    },
  };
}

describe("durable Drive material sync", () => {
  test("finishes the run before returning to the caller", async () => {
    const repository = syncRepository();
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return { records: [{ driveFileId: "file-1" }], skippedCount: 2 };
        },
      },
      logger: null,
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 1);
    assert.equal(result.skipped_file_count, 2);
  });

  test("records a failed run before returning", async () => {
    const repository = syncRepository();
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          throw Object.assign(new Error("private detail"), {
            code: "DRIVE_UNAVAILABLE",
          });
        },
      },
      logger: null,
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "failed");
    assert.equal(result.error_code, "DRIVE_UNAVAILABLE");
    assert.equal(
      result.error_message,
      "The configured Drive source could not be synchronized.",
    );
  });
});
