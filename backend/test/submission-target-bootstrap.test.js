import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";
import { bootstrapSystemSubmissionTarget } from "../src/services/submission-target-bootstrap.js";
import { FakeDrive, FakeRepository } from "./fakes.js";

describe("production submission target bootstrap", () => {
  test("server wires the protected target configuration into its own startup bootstrap", async () => {
    const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

    assert.match(server, /import \{ bootstrapSystemSubmissionTarget \}/);
    assert.match(server, /await bootstrapSystemSubmissionTarget\(\{/);
    assert.match(server, /rootFolderId: config\.submissionTargetRootId/);
    assert.match(server, /rootFolderName: config\.submissionTargetRootName/);
    assert.match(
      server,
      /Submission target startup bootstrap failed; upload readiness remains closed/,
    );
  });

  test("creates one actorless target for the exact protected root and is repeatable", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    const input = {
      repository,
      drive,
      rootFolderId: "configured-submission-root",
      rootFolderName: "Lake Forest Learning - Student Submissions",
    };

    const first = await bootstrapSystemSubmissionTarget(input);
    const second = await bootstrapSystemSubmissionTarget(input);

    assert.equal(first.status, "ready");
    assert.equal(second.targetId, first.targetId);
    assert.equal(repository.targets.length, 1);
    assert.equal(repository.targets[0].created_by, null);
    assert.equal(repository.targets[0].configuration_origin, "system_config");
    assert.equal(repository.targets[0].credential_ref, "adc://runtime-service-account");
    assert.equal(Object.hasOwn(first, "rootFolderId"), false);
  });

  test("records Shared Drive topology discovered by the server-side Drive client", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    drive.inspectSubmissionTarget = async () => ({
      driveKind: "shared_drive",
      driveId: "shared-drive-test",
      canAddChildren: true,
      canListChildren: true,
      canTrashChildren: true,
    });

    await bootstrapSystemSubmissionTarget({
      repository,
      drive,
      rootFolderId: "shared-submission-root",
      rootFolderName: "Lake Forest Learning - Student Submissions",
    });

    assert.equal(repository.targets[0].drive_kind, "shared_drive");
    assert.equal(repository.targets[0].drive_id, "shared-drive-test");
  });

  test("fails closed when an existing exact target was disabled", async () => {
    const repository = new FakeRepository();
    repository.targets.push({
      id: "disabled-target",
      drive_kind: "shared_drive",
      drive_id: "submission-shared-drive-test",
      root_folder_id: "configured-submission-root",
      root_folder_name: "Lake Forest Learning - Student Submissions",
      configuration_origin: "admin_api",
      status: "disabled",
      created_by: "admin-user",
    });

    await assert.rejects(
      bootstrapSystemSubmissionTarget({
        repository,
        drive: new FakeDrive(),
        rootFolderId: "configured-submission-root",
        rootFolderName: "Lake Forest Learning - Student Submissions",
      }),
      (error) => error.code === "SUBMISSION_STORAGE_TARGET_MISMATCH",
    );
    assert.equal(repository.targets.length, 1);
    assert.equal(repository.targets[0].status, "disabled");
  });

  test("rejects conflicting metadata on an existing exact-root target without updating it", async () => {
    const repository = new FakeRepository();
    repository.targets.push({
      id: "conflicting-target",
      drive_kind: "shared_drive",
      drive_id: "submission-shared-drive-test",
      root_folder_id: "configured-submission-root",
      root_folder_name: "Unexpected Folder",
      credential_type: "oauth",
      credential_ref: "secret-manager://legacy",
      configuration_origin: "admin_api",
      status: "active",
      created_by: "admin-user",
    });

    await assert.rejects(
      bootstrapSystemSubmissionTarget({
        repository,
        drive: new FakeDrive(),
        rootFolderId: "configured-submission-root",
        rootFolderName: "Lake Forest Learning - Student Submissions",
      }),
      (error) => error.code === "SUBMISSION_STORAGE_TARGET_MISMATCH",
    );
    assert.equal(repository.targets[0].root_folder_name, "Unexpected Folder");
    assert.equal(repository.targets[0].credential_type, "oauth");
  });

  test("reuses an exact administrator-created ADC target without rewriting its audit actor", async () => {
    const repository = new FakeRepository();
    repository.targets.push({
      id: "administrator-target",
      drive_kind: "shared_drive",
      drive_id: "submission-shared-drive-test",
      root_folder_id: "configured-submission-root",
      root_folder_name: "Lake Forest Learning - Student Submissions",
      credential_type: "service_account",
      credential_ref: "adc://runtime-service-account",
      configuration_origin: "admin_api",
      status: "active",
      created_by: "admin-user",
    });

    const result = await bootstrapSystemSubmissionTarget({
      repository,
      drive: new FakeDrive(),
      rootFolderId: "configured-submission-root",
      rootFolderName: "Lake Forest Learning - Student Submissions",
    });

    assert.equal(result.status, "ready");
    assert.equal(result.targetId, "administrator-target");
    assert.equal(repository.targets.length, 1);
    assert.equal(repository.targets[0].configuration_origin, "admin_api");
    assert.equal(repository.targets[0].created_by, "admin-user");
  });

  test("rejects My Drive before inserting a runtime target", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    drive.submissionDriveKind = "my_drive";
    drive.submissionDriveId = null;

    await assert.rejects(
      bootstrapSystemSubmissionTarget({
        repository,
        drive,
        rootFolderId: "configured-submission-root",
        rootFolderName: "Lake Forest Learning - Student Submissions",
      }),
      (error) => error.code === "SUBMISSION_STORAGE_REQUIRES_SHARED_DRIVE",
    );
    assert.equal(repository.targets.length, 0);
  });

  test("rejects a Shared Drive folder when the runtime cannot add children", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();
    drive.submissionCanAddChildren = false;

    await assert.rejects(
      bootstrapSystemSubmissionTarget({
        repository,
        drive,
        rootFolderId: "configured-submission-root",
        rootFolderName: "Lake Forest Learning - Student Submissions",
      }),
      (error) => error.code === "SUBMISSION_STORAGE_NOT_WRITABLE",
    );
    assert.equal(repository.targets.length, 0);
  });

  test("does not inspect Drive when no root is configured", async () => {
    const repository = new FakeRepository();
    const drive = new FakeDrive();

    await assert.rejects(
      bootstrapSystemSubmissionTarget({
        repository,
        drive,
        rootFolderId: "",
        rootFolderName: "Lake Forest Learning - Student Submissions",
      }),
      (error) => error.code === "SUBMISSION_STORAGE_UNAVAILABLE",
    );
    assert.equal(drive.submissionTargetChecks.length, 0);
    assert.equal(repository.targets.length, 0);
  });
});
