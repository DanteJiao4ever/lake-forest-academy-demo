import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  bootstrapCanonicalDriveCatalog,
  MaterialSyncService,
} from "../src/services/material-sync.js";
import { FakeDrive, FakeRepository } from "./fakes.js";

const courseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];

function syncRepository({ sourceRoot = "generic-root" } = {}) {
  const source = {
    id: "source-1",
    root_folder_id: sourceRoot,
    status: "active",
    verification_status: "pending",
  };
  const run = { id: "run-1", source_id: source.id, status: "queued" };
  return {
    run,
    source,
    finishCalls: 0,
    async markSyncRunning(id) {
      if (id !== run.id || run.status !== "queued") return null;
      run.status = "running";
      return { ...run };
    },
    async getSyncRun() { return { ...run }; },
    async getDriveSource() { return source; },
    async finishMaterialSync(_run, records, skippedCount) {
      this.finishCalls += 1;
      run.status = "succeeded";
      run.discovered_file_count = records.length;
      run.skipped_file_count = skippedCount;
      source.verification_status = "verified";
    },
    async failSync(_id, code, message) {
      run.status = "failed";
      run.error_code = code;
      run.error_message = message;
      source.verification_status = "failed";
    },
  };
}

function canonicalRecords() {
  return courseCodes.flatMap((courseCode) =>
    ["01", "02", "05", "06", "07"].flatMap((component) =>
      ["docx", "pdf"].map((extension) => {
        const fileName =
          `Lotus_Academy_${courseCode}_${component}_Student_Material.${extension}`;
        return {
          driveFileId: `${courseCode}-${component}-${extension}`,
          courseCode,
          fileName,
          relativePath: `${courseCode}/Student_Materials/${fileName}`,
          mimeType: extension === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
      }),
    ),
  );
}

describe("durable Drive material sync", () => {
  test("allows a noncanonical source to index its own complete discovered scope", async () => {
    const repository = syncRepository();
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return {
            records: [{ driveFileId: "generic-file", courseCode: "SCH4U" }],
            discoveredCourseCodes: ["SCH4U"],
            skippedCount: 2,
          };
        },
      },
      logger: null,
      canonicalRootFolderId: "configured-canonical-root",
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 1);
    assert.equal(repository.finishCalls, 1);
  });

  test("fails closed when a scan is empty without replacing existing materials", async () => {
    const repository = syncRepository();
    const service = new MaterialSyncService({
      repository,
      drive: { async listCurriculumFiles() { return { records: [] }; } },
      logger: null,
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "failed");
    assert.equal(result.error_code, "DRIVE_SYNC_EMPTY");
    assert.equal(repository.finishCalls, 0);
  });

  test("fails a noncanonical partial scan when a discovered course has no materials", async () => {
    const repository = syncRepository();
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return {
            records: [{ driveFileId: "sch-file", courseCode: "SCH4U" }],
            discoveredCourseCodes: ["SCH4U", "ICS4U"],
          };
        },
      },
      logger: null,
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "failed");
    assert.equal(result.error_code, "DRIVE_SYNC_PARTIAL_SCAN");
    assert.match(result.error_message, /ICS4U/);
    assert.equal(repository.finishCalls, 0);
  });

  test("commits a canonical scan when all six 10-file baselines are present", async () => {
    const repository = syncRepository({ sourceRoot: "configured-root" });
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return {
            records: canonicalRecords(),
            discoveredCourseCodes: courseCodes,
          };
        },
      },
      logger: null,
      canonicalRootFolderId: "configured-root",
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 60);
    assert.equal(repository.finishCalls, 1);
  });

  test("keeps additional eligible Student_Materials after the 60-file baseline", async () => {
    const repository = syncRepository({ sourceRoot: "configured-root" });
    const records = [
      ...canonicalRecords(),
      {
        driveFileId: "SCH4U-extra-study-data",
        courseCode: "SCH4U",
        fileName: "Supplementary Study Data.csv",
        relativePath: "SCH4U/Student_Materials/Supplementary Study Data.csv",
        mimeType: "text/csv",
      },
    ];
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return { records, discoveredCourseCodes: courseCodes };
        },
      },
      logger: null,
      canonicalRootFolderId: "configured-root",
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 61);
    assert.equal(repository.finishCalls, 1);
  });

  test("leaves the existing canonical 60 untouched after a 59-file scan", async () => {
    const repository = syncRepository({ sourceRoot: "configured-root" });
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return {
            records: canonicalRecords().slice(0, 59),
            discoveredCourseCodes: courseCodes,
          };
        },
      },
      logger: null,
      canonicalRootFolderId: "configured-root",
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "failed");
    assert.equal(result.error_code, "CANONICAL_DRIVE_INVENTORY_MISMATCH");
    assert.equal(repository.finishCalls, 0);
  });

  test("rejects an unexpected canonical file even when the total remains 60", async () => {
    const repository = syncRepository({ sourceRoot: "configured-root" });
    const records = canonicalRecords();
    records[0] = { ...records[0], fileName: "unexpected.pdf" };
    const service = new MaterialSyncService({
      repository,
      drive: {
        async listCurriculumFiles() {
          return { records, discoveredCourseCodes: courseCodes };
        },
      },
      logger: null,
      canonicalRootFolderId: "configured-root",
    });
    const result = await service.process("run-1");
    assert.equal(result.status, "failed");
    assert.equal(result.error_code, "CANONICAL_DRIVE_INVENTORY_MISMATCH");
    assert.equal(repository.finishCalls, 0);
  });

  test("records an inaccessible Drive as a failed verification", async () => {
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
    assert.equal(repository.source.verification_status, "failed");
  });
});

describe("production Drive startup bootstrap", () => {
  test("creates an actorless system run and verifies the runtime scan", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    repository.driveCatalogStats.verification_status = "pending";
    repository.driveCatalogStats.last_successful_sync_at = null;
    repository.driveCatalogStats.last_verification_at = null;
    const result = await bootstrapCanonicalDriveCatalog({
      repository,
      drive,
      logger: null,
      rootFolderId: "startup-root-test",
      rootFolderName: "Curriculum Root",
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 60);
    assert.equal(repository.syncRuns[0].trigger_type, "system_bootstrap");
    assert.equal(repository.syncRuns[0].requested_by, null);
    assert.match(repository.syncRuns[0].idempotency_key, /^system-bootstrap-v1:/);
  });

  test("skips startup reconciliation after a real successful verification", async () => {
    const repository = new FakeRepository();
    const result = await bootstrapCanonicalDriveCatalog({
      repository,
      drive: new FakeDrive(),
      logger: null,
      rootFolderId: "canonical-root-test",
      rootFolderName: "Curriculum Root",
    });
    assert.equal(result.status, "already_verified");
    assert.equal(repository.syncRuns.length, 0);
  });

  test("reconciles a legacy successful marker when its catalog is still partial", async () => {
    const repository = new FakeRepository();
    repository.driveCatalogStats.active_material_count = 10;
    repository.driveCatalogStats.course_count = 1;
    repository.driveCatalogStats.minimum_course_distribution = false;
    const result = await bootstrapCanonicalDriveCatalog({
      repository,
      drive: new FakeDrive(),
      logger: null,
      rootFolderId: "canonical-root-test",
      rootFolderName: "Curriculum Root",
    });
    assert.equal(result.status, "succeeded");
    assert.equal(result.discovered_file_count, 60);
    assert.equal(repository.syncRuns.length, 1);
    assert.equal(repository.syncRuns[0].trigger_type, "system_bootstrap");
  });

  test("fails closed rather than starting alongside an in-progress bootstrap", async () => {
    const repository = new FakeRepository();
    repository.driveCatalogStats.verification_status = "pending";
    repository.driveCatalogStats.last_successful_sync_at = null;
    repository.driveCatalogStats.last_verification_at = null;
    const source = await repository.ensureSystemDriveSource({
      rootFolderId: "concurrent-root-test",
      rootFolderName: "Curriculum Root",
    });
    repository.syncRuns.push({
      id: "00000000-0000-4000-8000-000000000099",
      source_id: source.id,
      idempotency_key: "system-bootstrap-v1:initial",
      requested_by: null,
      trigger_type: "system_bootstrap",
      mode: "full",
      status: "running",
    });
    await assert.rejects(
      bootstrapCanonicalDriveCatalog({
        repository,
        drive: new FakeDrive(),
        logger: null,
        rootFolderId: "concurrent-root-test",
        rootFolderName: "Curriculum Root",
      }),
      (error) => error.code === "DRIVE_BOOTSTRAP_FAILED",
    );
    assert.equal(repository.syncRuns.length, 1);
  });

  test("retries a failed bootstrap with a new deterministic audit key", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    const complete = [...drive.curriculumRecords];
    repository.driveCatalogStats.verification_status = "pending";
    repository.driveCatalogStats.last_successful_sync_at = null;
    repository.driveCatalogStats.last_verification_at = null;
    drive.curriculumRecords = complete.slice(0, 59);
    await assert.rejects(
      bootstrapCanonicalDriveCatalog({
        repository,
        drive,
        logger: null,
        rootFolderId: "retry-root-test",
        rootFolderName: "Curriculum Root",
      }),
      (error) => error.code === "CANONICAL_DRIVE_INVENTORY_MISMATCH",
    );
    drive.curriculumRecords = complete;
    const retried = await bootstrapCanonicalDriveCatalog({
      repository,
      drive,
      logger: null,
      rootFolderId: "retry-root-test",
      rootFolderName: "Curriculum Root",
    });
    assert.equal(retried.status, "succeeded");
    assert.equal(repository.syncRuns.length, 2);
    assert.notEqual(
      repository.syncRuns[0].idempotency_key,
      repository.syncRuns[1].idempotency_key,
    );
    assert.equal(repository.syncRuns[1].trigger_type, "system_bootstrap");
  });
});
