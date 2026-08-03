import { ApiError } from "../lib/errors.js";

export async function bootstrapSystemSubmissionTarget({
  repository,
  drive,
  rootFolderId,
  rootFolderName,
}) {
  const configuredRootId = String(rootFolderId || "").trim();
  if (!configuredRootId) {
    throw new ApiError(
      503,
      "SUBMISSION_STORAGE_UNAVAILABLE",
      "Submission storage has not been configured.",
    );
  }

  const descriptor = await drive.inspectSubmissionTarget(
    configuredRootId,
    rootFolderName,
  );
  if (descriptor.driveKind !== "shared_drive" || !descriptor.driveId) {
    throw new ApiError(
      503,
      "SUBMISSION_STORAGE_REQUIRES_SHARED_DRIVE",
      "Student submission storage must use a Shared Drive.",
    );
  }
  if (
    descriptor.canAddChildren !== true ||
    descriptor.canListChildren !== true ||
    descriptor.canTrashChildren !== true
  ) {
    throw new ApiError(
      503,
      "SUBMISSION_STORAGE_NOT_WRITABLE",
      "Student submission storage is not writable by the runtime service.",
    );
  }
  const target = await repository.ensureSystemSubmissionTarget({
    rootFolderId: configuredRootId,
    rootFolderName,
    driveKind: descriptor.driveKind,
    driveId: descriptor.driveId,
  });
  const targetRootId = target?.root_folder_id ?? target?.rootFolderId;
  const targetRootName = target?.root_folder_name ?? target?.rootFolderName;
  const targetDriveKind = target?.drive_kind ?? target?.driveKind;
  const targetDriveId = target?.drive_id ?? target?.driveId ?? null;
  const credentialType = target?.credential_type ?? target?.credentialType;
  const credentialRef = target?.credential_ref ?? target?.credentialRef;
  const configurationOrigin =
    target?.configuration_origin ?? target?.configurationOrigin;
  const createdBy = target?.created_by ?? target?.createdBy ?? null;
  const hasValidConfigurationActor =
    (configurationOrigin === "system_config" && createdBy === null) ||
    (configurationOrigin === "admin_api" && Boolean(createdBy));
  if (
    !target ||
    target.status !== "active" ||
    targetRootId !== configuredRootId ||
    targetRootName !== rootFolderName ||
    targetDriveKind !== descriptor.driveKind ||
    targetDriveId !== (descriptor.driveId || null) ||
    credentialType !== "service_account" ||
    credentialRef !== "adc://runtime-service-account" ||
    !hasValidConfigurationActor
  ) {
    throw new ApiError(
      503,
      "SUBMISSION_STORAGE_TARGET_MISMATCH",
      "Submission storage configuration could not be verified.",
    );
  }
  return { status: "ready", targetId: target.id };
}
