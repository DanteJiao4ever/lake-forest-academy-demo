import { ApiError } from "../lib/errors.js";

const requiredCourseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];
const canonicalComponents = ["01", "02", "05", "06", "07"];
const canonicalExtensions = ["docx", "pdf"];

function sourceRootFolderId(source) {
  return source?.root_folder_id ?? source?.rootFolderId ?? "";
}

function materialCourseCodes(records) {
  return new Set(
    records.map((record) => String(record?.courseCode || "").toUpperCase()),
  );
}

function validateGenericScan(result) {
  const records = Array.isArray(result?.records) ? result.records : [];
  if (!records.length) {
    throw new ApiError(
      422,
      "DRIVE_SYNC_EMPTY",
      "The Drive scan found no eligible course materials; existing materials were left unchanged.",
    );
  }
  const duplicateFileIds = records.length - new Set(
    records.map((record) => String(record?.driveFileId || "")),
  ).size;
  const invalidCourseCodes = [...materialCourseCodes(records)].filter(
    (courseCode) => !requiredCourseCodes.includes(courseCode),
  );
  if (duplicateFileIds || records.some((record) => !record?.driveFileId) || invalidCourseCodes.length) {
    throw new ApiError(
      422,
      "DRIVE_SYNC_INVALID_RECORDS",
      "The Drive scan returned duplicate or unsupported material records; existing materials were left unchanged.",
    );
  }
  const discoveredCourseCodes = new Set(
    (result?.discoveredCourseCodes || []).map((courseCode) =>
      String(courseCode || "").toUpperCase()),
  );
  const indexedCourseCodes = materialCourseCodes(records);
  const incompleteCourseCodes = [...discoveredCourseCodes].filter(
    (courseCode) => !indexedCourseCodes.has(courseCode),
  );
  if (incompleteCourseCodes.length) {
    throw new ApiError(
      422,
      "DRIVE_SYNC_PARTIAL_SCAN",
      `The Drive scan found course folders without eligible materials for: ${incompleteCourseCodes.join(", ")}. Existing materials were left unchanged.`,
      { incompleteCourseCodes },
    );
  }
  return records;
}

function validateCanonicalScan(result) {
  const records = validateGenericScan(result);
  const counts = Object.fromEntries(
    requiredCourseCodes.map((courseCode) => [courseCode, 0]),
  );
  const observedKeys = new Set();
  for (const record of records) {
    const courseCode = String(record.courseCode).toUpperCase();
    counts[courseCode] += 1;
    const relativePath = String(record.relativePath || "").replaceAll("\\", "/");
    const fileName = String(record.fileName || "");
    const match = fileName.match(
      new RegExp(
        `^Lotus_Academy_${courseCode}_(${canonicalComponents.join("|")})_.+\\.(${canonicalExtensions.join("|")})$`,
        "i",
      ),
    );
    const insideStudentMaterials = /(?:^|\/)Student_Materials(?:\/|$)/i.test(
      relativePath,
    );
    const staffOnlyPath = /(?:^|\/)(?:Administration|Staff_Only)(?:\/|$)/i.test(
      relativePath,
    );
    const mimeMatches = !match || (match[2].toLowerCase() === "pdf"
      ? record.mimeType === "application/pdf"
      : record.mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    if (
      !insideStudentMaterials ||
      staffOnlyPath ||
      !fileName ||
      !record.mimeType ||
      !mimeMatches
    ) {
      throw new ApiError(
        422,
        "CANONICAL_DRIVE_INVENTORY_MISMATCH",
        "The canonical Drive scan contained an unexpected file; the existing catalog was left unchanged.",
      );
    }
    if (match) {
      observedKeys.add(`${courseCode}:${match[1]}:${match[2].toLowerCase()}`);
    }
  }
  const completeCounts = requiredCourseCodes.every(
    (courseCode) => counts[courseCode] >= 10,
  );
  const baselineShapePresent = observedKeys.size ===
    requiredCourseCodes.length * canonicalComponents.length * canonicalExtensions.length;
  const discovered = new Set(
    (result?.discoveredCourseCodes || []).map((courseCode) =>
      String(courseCode || "").toUpperCase()),
  );
  const allCoursesDiscovered = requiredCourseCodes.every((courseCode) =>
    discovered.has(courseCode));
  if (
    records.length < 60 ||
    !completeCounts ||
    !baselineShapePresent ||
    !allCoursesDiscovered
  ) {
    throw new ApiError(
      422,
      "CANONICAL_DRIVE_INVENTORY_MISMATCH",
      "The canonical Drive scan must contain all 60 baseline Student_Materials files, with at least 10 files for each of the six courses; the existing catalog was left unchanged.",
      { minimumTotal: 60, observedTotal: records.length, courseCounts: counts },
    );
  }
  return records;
}

function validateCompleteCourseScan(result, source, canonicalRootFolderId) {
  return canonicalRootFolderId && sourceRootFolderId(source) === canonicalRootFolderId
    ? validateCanonicalScan(result)
    : validateGenericScan(result);
}

export class MaterialSyncService {
  constructor({ repository, drive, logger, canonicalRootFolderId = "" }) {
    this.repository = repository;
    this.drive = drive;
    this.logger = logger;
    this.canonicalRootFolderId = canonicalRootFolderId;
  }

  async process(runId) {
    try {
      const run = await this.repository.markSyncRunning(runId);
      if (!run) return this.repository.getSyncRun(runId);
      const source = await this.repository.getDriveSource(run.source_id);
      if (!source || source.status !== "active") {
        throw Object.assign(new Error("The Drive source is not active."), {
          code: "DRIVE_SOURCE_DISABLED",
        });
      }
      const result = await this.drive.listCurriculumFiles(source);
      const records = validateCompleteCourseScan(
        result,
        source,
        this.canonicalRootFolderId,
      );
      await this.repository.finishMaterialSync(
        run,
        records,
        result.skippedCount || 0,
      );
    } catch (error) {
      this.logger?.error(
        { runId, code: error?.code || "DRIVE_SYNC_FAILED" },
        "Drive sync failed",
      );
      try {
        await this.repository.failSync(
          runId,
          error?.code || "DRIVE_SYNC_FAILED",
          error?.statusCode && error.statusCode < 500
            ? error.message
            : "The configured Drive source could not be synchronized.",
        );
      } catch (recordError) {
        this.logger?.error(
          { runId, code: recordError?.code || "SYNC_FAILURE_RECORD_FAILED" },
          "Drive sync failure could not be recorded",
        );
        throw recordError;
      }
    }
    return this.repository.getSyncRun(runId);
  }
}

export async function bootstrapCanonicalDriveCatalog({
  repository,
  drive,
  logger,
  rootFolderId,
  rootFolderName,
}) {
  if (!String(rootFolderId || "").trim()) {
    throw new ApiError(
      503,
      "CURRICULUM_DRIVE_NOT_CONFIGURED",
      "The curriculum Drive root is required for runtime bootstrap.",
    );
  }
  const source = await repository.ensureSystemDriveSource({
    rootFolderId,
    rootFolderName,
  });
  if (!source || source.status !== "active") {
    throw new ApiError(
      503,
      "CANONICAL_DRIVE_SOURCE_UNAVAILABLE",
      "The canonical Drive source is unavailable for runtime bootstrap.",
    );
  }
  const readiness = await repository.driveCatalogReady(rootFolderId);
  const verificationStatus =
    readiness.verification_status ?? readiness.verificationStatus ?? "missing";
  const lastSuccessfulSyncAt =
    readiness.last_successful_sync_at ?? readiness.lastSuccessfulSyncAt ?? null;
  const activeMaterialCount = Number(
    readiness.active_material_count ?? readiness.activeMaterialCount ?? 0,
  );
  const courseCount = Number(
    readiness.course_count ?? readiness.courseCount ?? 0,
  );
  const minimumCourseDistribution = Boolean(
    readiness.minimum_course_distribution ??
      readiness.minimumCourseDistribution,
  );
  if (
    verificationStatus === "verified" &&
    lastSuccessfulSyncAt &&
    activeMaterialCount >= 60 &&
    courseCount === 6 &&
    minimumCourseDistribution
  ) {
    return { status: "already_verified", sourceId: source.id };
  }
  const previousVerificationAt =
    readiness.last_verification_at ?? readiness.lastVerificationAt ?? null;
  const previousVerificationMillis = previousVerificationAt
    ? new Date(previousVerificationAt).getTime()
    : Number.NaN;
  const checkpoint = Number.isFinite(previousVerificationMillis)
    ? previousVerificationMillis.toString(36)
    : "initial";
  const run = await repository.createSyncRun({
    sourceId: source.id,
    mode: "full",
    idempotencyKey: `system-bootstrap-v1:${checkpoint}`,
    actorId: null,
    triggerType: "system_bootstrap",
  });
  const service = new MaterialSyncService({
    repository,
    drive,
    logger,
    canonicalRootFolderId: rootFolderId,
  });
  const completed = await service.process(run.id);
  if (!completed || completed.status !== "succeeded") {
    throw new ApiError(
      503,
      completed?.error_code || completed?.errorCode || "DRIVE_BOOTSTRAP_FAILED",
      "The canonical Drive catalog could not be verified during startup.",
    );
  }
  return completed;
}
