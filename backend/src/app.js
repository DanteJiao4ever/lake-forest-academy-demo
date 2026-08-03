import path from "node:path";
import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { z } from "zod";
import { ApiError, errorEnvelope } from "./lib/errors.js";
import { csrfTokenFor, opaqueToken, publicId, safeTextEqual, sha256, stableFingerprint } from "./lib/crypto.js";
import { assertStrongPassword, hashPassword, normalizeEmail, verifyPassword } from "./lib/passwords.js";
import { assignmentIdSchema, courseCodeSchema, emailSchema, nameSchema, parse, uuidSchema } from "./lib/validation.js";
import { validateUploadedFile } from "./lib/file-validation.js";
import { evaluateUnlockPolicy, policyRequires } from "./lib/unlock-policy.js";
import { MaterialSyncService } from "./services/material-sync.js";
import { UnavailablePasswordResetMailer } from "./mail/password-reset-mailer.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const categories = ["Lessons", "Resources", "Assignments", "Assessments"];
const launchCourseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];
const materialFilterSchema = z.object({
  courseCode: courseCodeSchema.optional(),
  moduleId: assignmentIdSchema.optional(),
  moduleNumber: z.coerce.number().int().min(0).max(11).optional(),
  unitNumber: z.coerce.number().int().min(1).max(999).optional(),
  category: z.enum(categories).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function assertActivityCompletionPolicy(activity, status, evidence) {
  const policy = activity?.completionCriteria;
  const policyCheck = evaluateUnlockPolicy(policy, {
    source_module_completed: true,
    required_activity_completed: true,
    required_activity_evidence_present: true,
    all_gradebook_components_published: true,
  });
  if (!policyCheck.valid) {
    throw new ApiError(
      503,
      "UNLOCK_POLICY_INVALID",
      "The course unlock policy is unavailable. No completion was recorded.",
    );
  }
  if (
    status === "completed" &&
    policyRequires(policy, "required_activity_evidence_present") &&
    (!evidence || Object.keys(evidence).length === 0)
  ) {
    throw new ApiError(
      422,
      "ACTIVITY_EVIDENCE_REQUIRED",
      "Record the required activity evidence before completing this module.",
    );
  }
}

function authResponse(user, csrfToken) {
  const publicUser = {
    id: user.publicId,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
  };
  return {
    authenticated: true,
    user: publicUser,
    email: publicUser.email,
    role: publicUser.role,
    firstName: publicUser.firstName,
    lastName: publicUser.lastName,
    displayName: publicUser.displayName,
    csrfToken,
  };
}

function parseCursor(value) {
  if (!value) return 0;
  try {
    const decoded = Buffer.from(String(value), "base64url").toString("utf8");
    const offset = Number.parseInt(decoded, 10);
    if (!Number.isInteger(offset) || offset < 0) throw new Error("bad cursor");
    return offset;
  } catch {
    throw new ApiError(400, "INVALID_CURSOR", "The pagination cursor is invalid.");
  }
}

function nextCursor(offset, limit, hasMore) {
  return hasMore
    ? Buffer.from(String(offset + limit), "utf8").toString("base64url")
    : null;
}

function idempotencyKey(request, { required = true } = {}) {
  const value = String(request.headers["idempotency-key"] || "").trim();
  if (!value && !required) return "";
  if (!/^[\x21-\x7E]{8,200}$/.test(value)) {
    throw new ApiError(400, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key header is required.");
  }
  return value;
}

function serializeFile(file, submissionId) {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    sizeBytes: Number(file.sizeBytes),
    openUrl: `/v1/submissions/${submissionId}/files/${file.id}/open`,
  };
}

function submissionHistory(records) {
  return [...records]
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .map((record) => ({
      submissionId: record.id,
      attemptNumber: record.attemptNumber,
      fileName: record.files[0]?.name || "",
      fileReceiptId: record.files[0]?.id || "",
      fileSize: Number(record.files[0]?.sizeBytes || 0),
      fileType: record.files[0]?.mimeType || "",
      fileUrl: record.files[0]
        ? `/v1/submissions/${record.id}/files/${record.files[0].id}/open`
        : "",
      openUrl: record.files[0]
        ? `/v1/submissions/${record.id}/files/${record.files[0].id}/open`
        : "",
      submittedAt: record.submittedAt,
      receiptId: record.id,
      status: record.grade?.publishedAt ? "graded" : record.status,
    }));
}

function latestRecord(records) {
  return [...records].sort(
    (a, b) =>
      b.attemptNumber - a.attemptNumber ||
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  )[0];
}

function collapseSubmissions(records, includeStudentInKey = true) {
  const groups = new Map();
  for (const record of records) {
    const key = `${includeStudentInKey ? `${record.studentId}:` : ""}${record.courseCode}:${record.assignmentId}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return [...groups.values()].map((historyRecords) => ({
    record: latestRecord(historyRecords),
    historyRecords:
      latestRecord(historyRecords).historyRecords?.length
        ? latestRecord(historyRecords).historyRecords
        : historyRecords,
  }));
}

function serializeSubmission(record, { includeStudent = false, historyRecords = [record] } = {}) {
  const sectionKind = record.sectionKind || "unit";
  const curriculumUnitNumber =
    sectionKind === "final_evaluation"
      ? null
      : (record.curriculumUnitNumber ?? record.unitNumber);
  const sectionLabel =
    sectionKind === "final_evaluation"
      ? "Final Evaluation"
      : `Unit ${curriculumUnitNumber}`;
  return {
    id: record.id,
    submissionId: record.id,
    ...(includeStudent
      ? {
          studentId: record.studentId,
          studentName: record.studentName,
          studentEmail: record.studentEmail,
          student: {
            id: record.studentId,
            studentId: record.studentId,
            displayName: record.studentName,
            studentName: record.studentName,
            email: record.studentEmail,
            firstName: record.studentFirstName,
            lastName: record.studentLastName,
          },
        }
      : {}),
    courseCode: record.courseCode,
    unitNumber: record.unitNumber,
    curriculumUnitNumber,
    sectionKind,
    sectionLabel,
    unit: sectionLabel,
    assignmentId: record.assignmentId,
    assignmentTitle: record.assignmentTitle,
    attemptNumber: record.attemptNumber,
    note: record.note || "",
    status: record.grade?.publishedAt ? "graded" : record.status,
    submittedAt: record.submittedAt,
    updatedAt: record.updatedAt,
    receiptId: record.id,
    files: record.files.map((file) => serializeFile(file, record.id)),
    history: submissionHistory(historyRecords),
    versions: submissionHistory(historyRecords),
    grade: record.grade,
    ...(record.grade
      ? {
          score: record.grade.score,
          feedback: record.grade.feedback,
          gradedAt: record.grade.gradedAt,
          version: record.grade.version,
          etag: record.grade.etag,
        }
      : {}),
  };
}

function groupTeacherSubmissions(records) {
  const currentRecords = collapseSubmissions(records, true);
  const courses = new Map();
  for (const { record, historyRecords } of currentRecords) {
    if (!courses.has(record.courseCode)) {
      courses.set(record.courseCode, { courseCode: record.courseCode, students: new Map() });
    }
    const course = courses.get(record.courseCode);
    if (!course.students.has(record.studentId)) {
      course.students.set(record.studentId, {
        studentId: record.studentId,
        studentName: record.studentName,
        email: record.studentEmail,
        firstName: record.studentFirstName,
        lastName: record.studentLastName,
        units: new Map(),
      });
    }
    const student = course.students.get(record.studentId);
    const recordSectionKind = record.sectionKind || "unit";
    const sectionKey =
      recordSectionKind === "final_evaluation"
        ? "final_evaluation"
        : `unit:${record.curriculumUnitNumber ?? record.unitNumber}`;
    if (!student.units.has(sectionKey)) {
      const sectionKind = recordSectionKind;
      const curriculumUnitNumber =
        sectionKind === "final_evaluation"
          ? null
          : (record.curriculumUnitNumber ?? record.unitNumber);
      student.units.set(sectionKey, {
        unitNumber: record.unitNumber,
        curriculumUnitNumber,
        sectionKind,
        sectionLabel:
          sectionKind === "final_evaluation"
            ? "Final Evaluation"
            : `Unit ${curriculumUnitNumber}`,
        submissions: [],
      });
    }
    student.units
      .get(sectionKey)
      .submissions.push(
        serializeSubmission(record, {
          includeStudent: false,
          historyRecords,
        }),
      );
  }
  return [...courses.values()].map((course) => ({
    courseCode: course.courseCode,
    students: [...course.students.values()].map((student) => ({
      ...student,
      units: [...student.units.values()].sort((left, right) => {
        if (
          left.sectionKind === "final_evaluation" &&
          right.sectionKind === "final_evaluation"
        ) {
          return 0;
        }
        if (left.sectionKind === "final_evaluation") return 1;
        if (right.sectionKind === "final_evaluation") return -1;
        return Number(left.curriculumUnitNumber) - Number(right.curriculumUnitNumber);
      }),
    })),
  }));
}

function sourceResponse(row) {
  return {
    id: row.id,
    displayName: row.display_name ?? row.displayName,
    driveKind: row.drive_kind ?? row.driveKind,
    driveId: row.drive_id ?? row.driveId ?? null,
    rootFolderId: row.root_folder_id ?? row.rootFolderId,
    rootFolderName: row.root_folder_name ?? row.rootFolderName,
    credentialType: row.credential_type ?? row.credentialType,
    ...((row.configuration_origin ?? row.configurationOrigin)
      ? {
          configurationOrigin:
            row.configuration_origin ?? row.configurationOrigin,
        }
      : {}),
    ...((row.verification_status ?? row.verificationStatus)
      ? {
          verificationStatus:
            row.verification_status ?? row.verificationStatus,
          lastVerificationAt:
            row.last_verification_at ?? row.lastVerificationAt ?? null,
        }
      : {}),
    status: row.status,
    lastSuccessfulSyncAt:
      row.last_successful_sync_at ?? row.lastSuccessfulSyncAt ?? null,
    createdAt: row.created_at ?? row.createdAt,
  };
}

function materialResponse(row) {
  const rawSize = row.size_bytes ?? row.sizeBytes;
  return {
    id: row.id,
    courseCode: row.course_code ?? row.courseCode,
    moduleId: row.module_id ?? row.moduleId ?? null,
    moduleNumber: row.module_number ?? row.moduleNumber ?? null,
    unitNumber: row.unit_number ?? row.unitNumber ?? null,
    category: row.category,
    name: row.file_name ?? row.name,
    mimeType: row.mime_type ?? row.mimeType,
    sizeBytes: rawSize == null ? null : Number(rawSize),
    driveModifiedAt: row.drive_modified_at ?? row.driveModifiedAt,
    lastSyncedAt:
      row.source_last_successful_sync_at ?? row.sourceLastSuccessfulSyncAt ?? null,
    openUrl: `/v1/materials/${row.id}/open`,
  };
}

function syncRunResponse(row) {
  return {
    id: row.id,
    runId: row.id,
    sourceId: row.source_id ?? row.sourceId,
    mode: row.mode,
    trigger: row.trigger_type ?? row.trigger ?? "manual",
    status: row.status,
    discoveredFileCount: row.discovered_file_count ?? row.discoveredFileCount ?? 0,
    createdFileCount: row.created_file_count ?? row.createdFileCount ?? 0,
    updatedFileCount: row.updated_file_count ?? row.updatedFileCount ?? 0,
    deactivatedFileCount: row.deactivated_file_count ?? row.deactivatedFileCount ?? 0,
    skippedFileCount: row.skipped_file_count ?? row.skippedFileCount ?? 0,
    startedAt: row.started_at ?? row.startedAt ?? null,
    finishedAt: row.finished_at ?? row.finishedAt ?? null,
    error: (row.error_code ?? row.errorCode)
      ? {
          code: row.error_code ?? row.errorCode,
          message: row.error_message ?? row.errorMessage,
        }
      : null,
  };
}

export async function createApp({
  config,
  repository,
  drive,
  scanner,
  logger = false,
  syncService,
  passwordResetMailer,
} = {}) {
  if (!config || !repository || !drive || !scanner) {
    throw new Error("config, repository, drive and scanner are required");
  }
  const app = Fastify({
    logger:
      logger ||
      (config.nodeEnv === "test"
        ? false
        : {
            level: "info",
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                "req.headers['x-csrf-token']",
                "body.password",
                "body.currentPassword",
                "body.newPassword",
                "body.confirmPassword",
                "body.token",
              ],
              censor: "[REDACTED]",
            },
          }),
    bodyLimit: config.maxRequestBytes,
    trustProxy: config.nodeEnv === "production",
    genReqId: (request) => String(request.headers["x-request-id"] || `req_${randomUUID()}`).slice(0, 128),
  });
  const allowedOrigins = new Set(config.allowedOrigins);
  const resetMailer =
    passwordResetMailer || new UnavailablePasswordResetMailer();

  await app.register(cookie);
  await app.register(cors, {
    credentials: true,
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Accept", "Content-Type", "Idempotency-Key", "If-Match", "X-CSRF-Token", "X-Request-ID"],
    exposedHeaders: ["ETag", "X-Request-ID"],
  });
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
  });
  await app.register(rateLimit, { global: false, max: 300, timeWindow: "1 minute" });
  await app.register(multipart, {
    limits: {
      files: config.maxUploadFiles,
      fileSize: config.maxFileBytes,
      fields: 20,
      parts: config.maxUploadFiles + 20,
    },
  });

  app.decorateRequest("auth", null);

  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Request-ID", request.id);
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "This browser origin is not allowed.");
    }
    if (request.headers["sec-fetch-site"] === "cross-site") {
      throw new ApiError(403, "CROSS_SITE_REQUEST_BLOCKED", "Cross-site requests are not allowed.");
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error?.code === "FST_REQ_FILE_TOO_LARGE" || error?.statusCode === 413) {
      error = new ApiError(413, "UPLOAD_TOO_LARGE", "The upload exceeds the configured size limit.");
    }
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    if (statusCode >= 500) {
      request.log.error({ err: error, requestId: request.id }, "request failed");
    }
    reply.status(statusCode).send(errorEnvelope(error, request.id));
  });

  const cookieOptions = {
    path: "/",
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "lax",
    maxAge: config.sessionTtlHours * 60 * 60,
  };

  async function authenticate(request) {
    const token = request.cookies[config.cookieName];
    if (!token) throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Sign in to continue.");
    const session = await repository.getSessionUser(sha256(token));
    if (!session) throw new ApiError(401, "SESSION_EXPIRED", "Your session has expired. Sign in again.");
    request.auth = session;
    return session;
  }

  function requireRoles(...roles) {
    return async function roleGuard(request) {
      const session = await authenticate(request);
      if (!roles.includes(session.user.role)) {
        await repository.recordAudit?.({
          requestId: request.id,
          actorUserId: session.user.id,
          action: "authorization.denied",
          resourceType: "api",
          resourceId: request.routeOptions?.url,
          outcome: "denied",
        });
        throw new ApiError(403, "INSUFFICIENT_ROLE", "You do not have permission for this action.");
      }
    };
  }

  async function requireCsrf(request) {
    if (!unsafeMethods.has(request.method)) return;
    if (!request.auth) await authenticate(request);
    const raw = String(request.headers["x-csrf-token"] || "");
    const expected = csrfTokenFor(request.auth.sessionId, config.csrfSecret);
    if (!safeTextEqual(expected, raw)) {
      throw new ApiError(403, "CSRF_TOKEN_INVALID", "The security token is missing or expired. Refresh the session and try again.");
    }
  }

  async function requireCourseAccess(user, courseCode) {
    if (!(await repository.canAccessCourse(user, courseCode))) {
      throw new ApiError(403, "COURSE_ACCESS_DENIED", "You do not have access to this course.");
    }
  }

  async function materialPage(request, forcedCourseCode = null) {
    const query = parse(
      materialFilterSchema,
      request.query || {},
      "INVALID_MATERIAL_FILTER",
    );
    const allowedCourseCodes = forcedCourseCode
      ? [forcedCourseCode]
      : await repository.listAccessibleCourseCodes(request.auth.user);
    if (forcedCourseCode) {
      await requireCourseAccess(request.auth.user, forcedCourseCode);
    } else if (query.courseCode && !allowedCourseCodes.includes(query.courseCode)) {
      throw new ApiError(
        403,
        "COURSE_ACCESS_DENIED",
        "You cannot view materials for this course.",
      );
    }
    const offset = parseCursor(query.cursor);
    const records = await repository.listMaterials({
      ...query,
      courseCode: forcedCourseCode || query.courseCode,
      offset,
      allowedCourseCodes,
      includeStaff: request.auth.user.role !== "student",
    });
    const hasMore = records.length > query.limit;
    return {
      data: records.slice(0, query.limit).map(materialResponse),
      page: {
        nextCursor: nextCursor(offset, query.limit, hasMore),
        limit: query.limit,
      },
    };
  }

  async function issueSession(reply, user) {
    const token = opaqueToken();
    const sessionId = randomUUID();
    const csrfToken = csrfTokenFor(sessionId, config.csrfSecret);
    const expiresAt = new Date(Date.now() + config.sessionTtlHours * 60 * 60 * 1000);
    await repository.createSession({
      id: sessionId,
      userId: user.id,
      tokenHash: sha256(token),
      csrfTokenHash: sha256(csrfToken),
      expiresAt,
    });
    reply.setCookie(config.cookieName, token, cookieOptions);
    return csrfToken;
  }

  app.get("/health/live", async () => ({ status: "ok" }));
  app.get("/health/ready", async () => {
    await repository.ready();
    return { status: "ready" };
  });
  app.get("/health/password-reset-ready", async () => {
    await resetMailer.ready();
    return { status: "ready" };
  });
  app.get("/health/catalog-ready", async (request) => {
    await repository.ready();
    const counts = await repository.catalogReady();
    const expected = {
      courses: 6,
      modules: 72,
      lessons: 120,
      resources: 198,
      activities: 72,
      gradebook_items: 44,
      assessment_components: 38,
      valid_unlock_policies: 72,
      final_evaluation_assignments: 8,
      unit_assignments: 30,
    };
    const ready = Object.entries(expected).every(
      ([key, value]) => Number(counts[key]) === value,
    ) && Number(counts.invalid_course_hours) === 0 &&
      Number(counts.invalid_course_weights) === 0;
    if (!ready) {
      request.log.warn({ counts }, "course catalog is incomplete");
      throw new ApiError(503, "COURSE_CATALOG_NOT_READY", "The course catalog has not passed its integrity checks.");
    }
    return { status: "ready", catalog: counts };
  });
  app.get("/health/upload-ready", async () => {
    await Promise.all([
      repository.ready(),
      scanner.ready(),
      drive.ready(config.submissionTargetRootId),
    ]);
    return { status: "ready" };
  });
  app.get("/health/drive-catalog-ready", async (request) => {
    await repository.ready();
    if (!config.curriculumDriveRootId) {
      throw new ApiError(
        503,
        "CURRICULUM_DRIVE_NOT_CONFIGURED",
        "The curriculum Drive source has not been configured.",
      );
    }
    await drive.curriculumReady(
      config.curriculumDriveRootId,
      config.curriculumDriveRootName,
    );
    const counts = await repository.driveCatalogReady(
      config.curriculumDriveRootId,
    );
    const canonicalSourceActive = Boolean(
      counts.canonical_source_active ?? counts.canonicalSourceActive,
    );
    const verificationStatus =
      counts.verification_status ?? counts.verificationStatus ?? "missing";
    const activeMaterialCount = Number(
      counts.active_material_count ?? counts.activeMaterialCount ?? 0,
    );
    const courseCount = Number(counts.course_count ?? counts.courseCount ?? 0);
    const minimumCourseDistribution = Boolean(
      counts.minimum_course_distribution ?? counts.minimumCourseDistribution,
    );
    const lastSyncedAt =
      counts.last_successful_sync_at ?? counts.lastSuccessfulSyncAt ?? null;
    const lastVerificationAt =
      counts.last_verification_at ?? counts.lastVerificationAt ?? null;
    const lastVerificationErrorCode =
      counts.last_verification_error_code ??
      counts.lastVerificationErrorCode ??
      null;
    if (
      !canonicalSourceActive ||
      verificationStatus !== "verified" ||
      !lastSyncedAt ||
      activeMaterialCount < 60 ||
      courseCount !== 6 ||
      !minimumCourseDistribution
    ) {
      const state = !canonicalSourceActive
        ? "source_unavailable"
        : verificationStatus === "failed"
          ? "verification_failed"
          : verificationStatus !== "verified" || !lastSyncedAt
            ? "bootstrap_pending"
            : "catalog_incomplete";
      request.log.warn(
        {
          state,
          verificationStatus,
          activeMaterialCount,
          courseCount,
          minimumCourseDistribution,
        },
        "Drive course catalog is incomplete",
      );
      throw new ApiError(
        503,
        "DRIVE_CATALOG_NOT_READY",
        "The Drive course catalog is bootstrapped but has not passed runtime verification.",
        {
          state,
          verificationStatus,
          activeMaterialCount,
          courseCount,
          minimumCourseDistribution,
          lastVerificationAt,
          lastVerificationErrorCode,
        },
      );
    }
    return {
      status: "ready",
      driveCatalog: {
        verificationStatus,
        activeMaterialCount,
        courseCount,
        minimumCourseDistribution,
        lastSyncedAt,
        lastVerificationAt,
      },
    };
  });

  const registerSchema = z
    .object({
      firstName: nameSchema,
      lastName: nameSchema,
      email: emailSchema,
      password: z.string().optional(),
      newPassword: z.string().optional(),
      confirmPassword: z.string().optional(),
      portal: z.literal("student").optional(),
    })
    .transform((body) => ({ ...body, password: body.password || body.newPassword || "" }));

  app.post(
    "/v1/auth/register",
    { config: { rateLimit: { max: 8, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const input = parse(registerSchema, request.body, "INVALID_REGISTRATION");
      if (input.confirmPassword && input.confirmPassword !== input.password) {
        throw new ApiError(422, "PASSWORD_CONFIRMATION_MISMATCH", "The password confirmation does not match.");
      }
      assertStrongPassword(input.password, input.email);
      const passwordHash = await hashPassword(input.password, config.bcryptCost);
      const user = await repository.createStudentWithEnrollments({
        publicId: publicId("student"),
        email: normalizeEmail(input.email),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName: `${input.firstName} ${input.lastName}`,
        role: "student",
      }, []);
      const csrfToken = await issueSession(reply, user);
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: user.id,
        action: "auth.register",
        resourceType: "user",
        resourceId: user.publicId,
        outcome: "success",
      });
      reply.status(201).send(authResponse(user, csrfToken));
    },
  );

  const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1).max(128),
    portal: z.enum(["student", "faculty"]).default("student"),
  });

  app.post(
    "/v1/auth/login",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const input = parse(loginSchema, request.body, "INVALID_LOGIN");
      const user = await repository.findUserByEmail(normalizeEmail(input.email));
      const passwordValid = await verifyPassword(input.password, user?.passwordHash);
      const portalValid =
        user &&
        ((input.portal === "student" && user.role === "student") ||
          (input.portal === "faculty" && ["teacher", "teacher_admin"].includes(user.role)));
      if (!user || user.status !== "active" || !passwordValid || !portalValid) {
        await repository.recordAudit?.({
          requestId: request.id,
          action: "auth.login",
          resourceType: "session",
          outcome: "denied",
        });
        throw new ApiError(401, "INVALID_CREDENTIALS", "The email, password or portal is incorrect.");
      }
      const csrfToken = await issueSession(reply, user);
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: user.id,
        action: "auth.login",
        resourceType: "session",
        outcome: "success",
      });
      reply.send(authResponse(user, csrfToken));
    },
  );

  const passwordResetRequestSchema = z.object({
    email: emailSchema,
  });
  const passwordResetSchema = z.object({
    token: z.string().trim().min(32).max(200).regex(/^[A-Za-z0-9_-]+$/),
    newPassword: z.string().min(1).max(128),
    confirmPassword: z.string().min(1).max(128),
  });
  const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(1).max(128),
    confirmPassword: z.string().min(1).max(128),
  });
  const resetRequestResponse = Object.freeze({
    accepted: true,
    message:
      "If an active account matches that email address, a password reset link will be sent.",
  });

  function passwordResetUrl(token) {
    const target = new URL(config.passwordResetUrl);
    if (target.hash) {
      const [route, rawQuery = ""] = target.hash.split("?", 2);
      const params = new URLSearchParams(rawQuery);
      params.set("token", token);
      target.hash = `${route}?${params}`;
    } else {
      target.searchParams.set("token", token);
    }
    return target.toString();
  }

  app.post(
    "/v1/auth/password-reset-requests",
    { config: { rateLimit: { max: 5, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const input = parse(
        passwordResetRequestSchema,
        request.body,
        "INVALID_PASSWORD_RESET_REQUEST",
      );
      if (!resetMailer.isConfigured()) {
        throw new ApiError(
          503,
          "PASSWORD_RESET_EMAIL_UNAVAILABLE",
          "Password reset email is temporarily unavailable.",
        );
      }
      const normalizedEmail = normalizeEmail(input.email);
      try {
        const user = await repository.findUserByEmail(normalizedEmail);
        if (user?.status === "active") {
          const token = opaqueToken();
          const tokenHash = sha256(token);
          const expiresAt = new Date(
            Date.now() + config.passwordResetTokenTtlMinutes * 60 * 1000,
          );
          const notBefore = new Date(
            Date.now() -
              config.passwordResetRequestCooldownSeconds * 1000,
          );
          const grant = await repository.createPasswordResetToken({
            id: randomUUID(),
            userId: user.id,
            tokenHash,
            expiresAt,
            notBefore,
          });
          if (grant?.created) {
            let delivered = false;
            try {
              await resetMailer.sendPasswordReset({
                to: user.email,
                displayName: user.displayName,
                resetUrl: passwordResetUrl(token),
                expiresInMinutes: config.passwordResetTokenTtlMinutes,
              });
              delivered = true;
            } catch (error) {
              await repository.revokePasswordResetToken(tokenHash);
              request.log.error(
                { code: error?.code || "PASSWORD_RESET_EMAIL_FAILED", requestId: request.id },
                "password reset email delivery failed",
              );
            }
            await repository.recordAudit?.({
              requestId: request.id,
              actorUserId: user.id,
              action: "auth.password_reset.email_sent",
              resourceType: "password_reset",
              resourceId: grant.id,
              outcome: delivered ? "success" : "failed",
            });
          }
        }
      } catch (error) {
        request.log.error(
          { code: error?.code || "PASSWORD_RESET_REQUEST_FAILED", requestId: request.id },
          "password reset request could not be processed",
        );
      }
      await repository.recordAudit?.({
        requestId: request.id,
        action: "auth.password_reset.request",
        resourceType: "password_reset",
        outcome: "success",
        details: { emailHash: sha256(normalizedEmail) },
      });
      reply.status(202).send(resetRequestResponse);
    },
  );

  app.post(
    "/v1/auth/password-resets",
    { config: { rateLimit: { max: 10, timeWindow: "15 minutes" } } },
    async (request, reply) => {
      const input = parse(
        passwordResetSchema,
        request.body,
        "INVALID_PASSWORD_RESET",
      );
      if (input.newPassword !== input.confirmPassword) {
        throw new ApiError(
          422,
          "PASSWORD_CONFIRMATION_MISMATCH",
          "The password confirmation does not match.",
        );
      }
      const tokenHash = sha256(input.token);
      const user = await repository.findPasswordResetTokenUser(tokenHash);
      if (!user) {
        await repository.recordAudit?.({
          requestId: request.id,
          action: "auth.password_reset.consume",
          resourceType: "password_reset",
          outcome: "denied",
        });
        throw new ApiError(
          400,
          "PASSWORD_RESET_TOKEN_INVALID",
          "The password reset link is invalid or has expired.",
        );
      }
      assertStrongPassword(input.newPassword, user.email);
      if (await verifyPassword(input.newPassword, user.passwordHash)) {
        throw new ApiError(
          422,
          "PASSWORD_REUSE_NOT_ALLOWED",
          "Choose a password that is different from your current password.",
        );
      }
      const passwordHash = await hashPassword(
        input.newPassword,
        config.bcryptCost,
      );
      const changed = await repository.consumePasswordResetToken({
        tokenHash,
        userId: user.id,
        passwordHash,
      });
      if (!changed) {
        throw new ApiError(
          400,
          "PASSWORD_RESET_TOKEN_INVALID",
          "The password reset link is invalid or has expired.",
        );
      }
      reply.clearCookie(config.cookieName, cookieOptions);
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: user.id,
        action: "auth.password_reset.consume",
        resourceType: "user",
        resourceId: user.publicId,
        outcome: "success",
      });
      reply.send({ changed: true, reauthenticationRequired: true });
    },
  );

  app.post(
    "/v1/auth/password-change",
    {
      preHandler: [authenticate, requireCsrf],
      config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
    },
    async (request, reply) => {
      const input = parse(
        passwordChangeSchema,
        request.body,
        "INVALID_PASSWORD_CHANGE",
      );
      if (input.newPassword !== input.confirmPassword) {
        throw new ApiError(
          422,
          "PASSWORD_CONFIRMATION_MISMATCH",
          "The password confirmation does not match.",
        );
      }
      const currentPasswordValid = await verifyPassword(
        input.currentPassword,
        request.auth.user.passwordHash,
      );
      if (!currentPasswordValid) {
        await repository.recordAudit?.({
          requestId: request.id,
          actorUserId: request.auth.user.id,
          action: "auth.password_change",
          resourceType: "user",
          resourceId: request.auth.user.publicId,
          outcome: "denied",
        });
        throw new ApiError(
          401,
          "CURRENT_PASSWORD_INCORRECT",
          "The current password is incorrect.",
        );
      }
      assertStrongPassword(input.newPassword, request.auth.user.email);
      if (await verifyPassword(input.newPassword, request.auth.user.passwordHash)) {
        throw new ApiError(
          422,
          "PASSWORD_REUSE_NOT_ALLOWED",
          "Choose a password that is different from your current password.",
        );
      }
      const passwordHash = await hashPassword(
        input.newPassword,
        config.bcryptCost,
      );
      await repository.updatePasswordAndRevokeSessions({
        userId: request.auth.user.id,
        passwordHash,
      });
      reply.clearCookie(config.cookieName, cookieOptions);
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: request.auth.user.id,
        action: "auth.password_change",
        resourceType: "user",
        resourceId: request.auth.user.publicId,
        outcome: "success",
      });
      reply.send({ changed: true, reauthenticationRequired: true });
    },
  );

  app.get("/v1/auth/session", async (request) => {
    const session = await authenticate(request);
    const csrfToken = csrfTokenFor(session.sessionId, config.csrfSecret);
    return authResponse(session.user, csrfToken);
  });

  app.post(
    "/v1/auth/logout",
    { preHandler: [authenticate, requireCsrf] },
    async (request, reply) => {
      await repository.deleteSession(request.auth.sessionId);
      reply.clearCookie(config.cookieName, cookieOptions);
      reply.status(204).send();
    },
  );

  app.get(
    "/v1/me/enrollments",
    { preHandler: [requireRoles("student")] },
    async (request) => ({ data: await repository.listEnrollments(request.auth.user.id) }),
  );

  app.put(
    "/v1/me/enrollments",
    { preHandler: [requireRoles("student"), requireCsrf] },
    async (request) => {
      const input = parse(
        z.object({
          courseCodes: z
            .array(z.enum(launchCourseCodes))
            .max(launchCourseCodes.length)
            .default([]),
        }),
        request.body,
        "INVALID_ENROLLMENTS",
      );
      const unique = [...new Set(input.courseCodes)];
      const saved = await repository.replaceEnrollments(request.auth.user.id, unique);
      return { data: saved };
    },
  );

  app.get(
    "/v1/courses",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => ({ data: await repository.listCoursesForUser(request.auth.user) }),
  );

  app.get(
    "/v1/courses/:courseCode/modules",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(courseCodeSchema, request.params.courseCode, "INVALID_COURSE_CODE");
      await requireCourseAccess(request.auth.user, courseCode);
      return {
        data: await repository.listCourseModules(courseCode, {
          includeStaff: request.auth.user.role !== "student",
        }),
      };
    },
  );

  app.get(
    "/v1/courses/:courseCode/materials",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(
        courseCodeSchema,
        request.params.courseCode,
        "INVALID_COURSE_CODE",
      );
      return materialPage(request, courseCode);
    },
  );

  app.get(
    "/v1/courses/:courseCode/assignments",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(courseCodeSchema, request.params.courseCode, "INVALID_COURSE_CODE");
      await requireCourseAccess(request.auth.user, courseCode);
      return {
        data: await repository.listCourseAssignments(courseCode, {
          includeInactive: request.auth.user.role !== "student",
        }),
      };
    },
  );

  app.get(
    "/v1/me/progress",
    { preHandler: [requireRoles("student")] },
    async (request) => {
      const query = parse(
        z.object({ courseCode: courseCodeSchema.optional() }),
        request.query || {},
        "INVALID_PROGRESS_FILTER",
      );
      const courseCodes = query.courseCode
        ? [query.courseCode]
        : await repository.listAccessibleCourseCodes(request.auth.user);
      if (query.courseCode) await requireCourseAccess(request.auth.user, query.courseCode);
      const records = await Promise.all(
        courseCodes.map((courseCode) => repository.listStudentProgress(request.auth.user.id, courseCode)),
      );
      return { data: records.flat() };
    },
  );

  app.get(
    "/v1/me/grades",
    { preHandler: [requireRoles("student")] },
    async (request) => {
      const query = parse(
        z.object({ courseCode: courseCodeSchema.optional() }),
        request.query || {},
        "INVALID_GRADE_FILTER",
      );
      const courseCodes = query.courseCode
        ? [query.courseCode]
        : await repository.listAccessibleCourseCodes(request.auth.user);
      if (query.courseCode) await requireCourseAccess(request.auth.user, query.courseCode);
      return {
        data: await repository.listStudentPublishedDirectGrades(
          request.auth.user.id,
          courseCodes,
        ),
      };
    },
  );

  app.put(
    "/v1/me/progress/modules/:moduleId",
    { preHandler: [requireRoles("student"), requireCsrf] },
    async (request) => {
      const moduleId = parse(assignmentIdSchema, request.params.moduleId, "INVALID_MODULE_ID");
      const body = parse(
        z.object({ status: z.enum(["in_progress", "completed"]) }),
        request.body,
        "INVALID_MODULE_PROGRESS",
      );
      const module = await repository.getModule(moduleId);
      if (!module || module.status !== "published") {
        throw new ApiError(404, "MODULE_NOT_FOUND", "The course module was not found.");
      }
      await requireCourseAccess(request.auth.user, module.courseCode);
      return { data: await repository.upsertStudentModuleProgress(request.auth.user.id, moduleId, body.status) };
    },
  );

  app.put(
    "/v1/me/progress/activities/:activityId",
    { preHandler: [requireRoles("student"), requireCsrf] },
    async (request) => {
      const activityId = parse(assignmentIdSchema, request.params.activityId, "INVALID_ACTIVITY_ID");
      const body = parse(
        z.object({
          status: z.enum(["started", "submitted", "completed"]),
          evidence: z.record(z.string(), z.unknown()).default({}),
        }),
        request.body,
        "INVALID_ACTIVITY_PROGRESS",
      );
      const activity = await repository.getActivity(activityId);
      if (!activity || activity.status !== "published") {
        throw new ApiError(404, "ACTIVITY_NOT_FOUND", "The module activity was not found.");
      }
      await requireCourseAccess(request.auth.user, activity.courseCode);
      assertActivityCompletionPolicy(activity, body.status, body.evidence);
      const progress = await repository.listStudentProgress(request.auth.user.id, activity.courseCode);
      if (progress.find((item) => item.moduleId === activity.moduleId)?.status === "locked") {
        throw new ApiError(409, "MODULE_LOCKED", "Complete the previous module or ask your teacher for an override.");
      }
      return {
        data: await repository.upsertStudentActivityCompletion(
          request.auth.user.id,
          activityId,
          body.status,
          body.evidence,
        ),
      };
    },
  );

  app.route({
    method: ["PUT", "PATCH"],
    url: "/v1/me/progress/modules",
    preHandler: [requireRoles("student"), requireCsrf],
    async handler(request) {
      const body = parse(
        z.object({
          moduleId: assignmentIdSchema,
          status: z.enum(["in_progress", "completed"]),
        }),
        request.body,
        "INVALID_MODULE_PROGRESS",
      );
      const module = await repository.getModule(body.moduleId);
      if (!module || module.status !== "published") {
        throw new ApiError(404, "MODULE_NOT_FOUND", "The course module was not found.");
      }
      await requireCourseAccess(request.auth.user, module.courseCode);
      return {
        data: await repository.upsertStudentModuleProgress(
          request.auth.user.id,
          body.moduleId,
          body.status,
        ),
      };
    },
  });

  app.route({
    method: ["PUT", "PATCH"],
    url: "/v1/me/progress/activities",
    preHandler: [requireRoles("student"), requireCsrf],
    async handler(request) {
      const body = parse(
        z.object({
          activityId: assignmentIdSchema,
          status: z.enum(["started", "submitted", "completed"]),
          evidence: z.record(z.string(), z.unknown()).default({}),
        }),
        request.body,
        "INVALID_ACTIVITY_PROGRESS",
      );
      const activity = await repository.getActivity(body.activityId);
      if (!activity || activity.status !== "published") {
        throw new ApiError(404, "ACTIVITY_NOT_FOUND", "The module activity was not found.");
      }
      await requireCourseAccess(request.auth.user, activity.courseCode);
      assertActivityCompletionPolicy(activity, body.status, body.evidence);
      const progress = await repository.listStudentProgress(request.auth.user.id, activity.courseCode);
      if (progress.find((item) => item.moduleId === activity.moduleId)?.status === "locked") {
        throw new ApiError(409, "MODULE_LOCKED", "Complete the previous module or ask your teacher for an override.");
      }
      return {
        data: await repository.upsertStudentActivityCompletion(
          request.auth.user.id,
          body.activityId,
          body.status,
          body.evidence,
        ),
      };
    },
  });

  app.get(
    "/v1/teacher/courses",
    { preHandler: [requireRoles("teacher", "teacher_admin")] },
    async (request) => ({ data: await repository.listCoursesForUser(request.auth.user) }),
  );

  app.get(
    "/v1/teacher/students",
    { preHandler: [requireRoles("teacher", "teacher_admin")] },
    async (request) => {
      const query = parse(
        z.object({ courseCode: courseCodeSchema.optional() }),
        request.query || {},
        "INVALID_ROSTER_FILTER",
      );
      const courseCodes = query.courseCode
        ? [query.courseCode]
        : await repository.listAccessibleCourseCodes(request.auth.user);
      if (query.courseCode) await requireCourseAccess(request.auth.user, query.courseCode);
      const rosters = await Promise.all(
        courseCodes.map(async (courseCode) =>
          (await repository.listCourseRoster(courseCode)).map((student) => ({ courseCode, ...student }))),
      );
      return { data: rosters.flat() };
    },
  );

  app.get(
    "/v1/teacher/courses/:courseCode/roster",
    { preHandler: [requireRoles("teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(courseCodeSchema, request.params.courseCode, "INVALID_COURSE_CODE");
      await requireCourseAccess(request.auth.user, courseCode);
      return { data: await repository.listCourseRoster(courseCode) };
    },
  );

  app.get(
    "/v1/teacher/courses/:courseCode/progress",
    { preHandler: [requireRoles("teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(courseCodeSchema, request.params.courseCode, "INVALID_COURSE_CODE");
      await requireCourseAccess(request.auth.user, courseCode);
      return { data: await repository.listCourseProgress(courseCode) };
    },
  );

  app.get(
    "/v1/teacher/courses/:courseCode/gradebook",
    { preHandler: [requireRoles("teacher", "teacher_admin")] },
    async (request) => {
      const courseCode = parse(courseCodeSchema, request.params.courseCode, "INVALID_COURSE_CODE");
      await requireCourseAccess(request.auth.user, courseCode);
      return { data: await repository.listCourseGradebook(courseCode) };
    },
  );

  app.put(
    "/v1/teacher/courses/:courseCode/students/:studentId/grades/:gradebookItemId",
    { preHandler: [requireRoles("teacher", "teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const params = parse(
        z.object({
          courseCode: courseCodeSchema,
          studentId: z.string().trim().min(1).max(100),
          gradebookItemId: assignmentIdSchema,
        }),
        request.params,
        "INVALID_DIRECT_GRADE_TARGET",
      );
      const body = parse(
        z.object({
          score: z.number().int().min(0).max(100),
          feedback: z.string().max(10000).default(""),
          publish: z.boolean(),
        }),
        request.body,
        "INVALID_DIRECT_GRADE",
      );
      await requireCourseAccess(request.auth.user, params.courseCode);
      const match = String(request.headers["if-match"] || "").match(
        /^"direct-grade-v(\d+)"$/,
      );
      if (!match) {
        throw new ApiError(
          428,
          "IF_MATCH_REQUIRED",
          "A valid If-Match direct-grade version is required.",
        );
      }
      const key = idempotencyKey(request);
      const requestFingerprint = stableFingerprint({ ...params, ...body });
      const grade = await repository.createDirectGrade({
        ...body,
        courseCode: params.courseCode,
        studentPublicId: params.studentId,
        gradebookItemId: params.gradebookItemId,
        grader: request.auth.user,
        expectedVersion: Number(match[1]),
        idempotencyKey: key,
        requestFingerprint,
      });
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: request.auth.user.id,
        action: body.publish ? "direct-grade.publish" : "direct-grade.draft",
        resourceType: "gradebook_item",
        resourceId: params.gradebookItemId,
        outcome: "success",
        details: {
          courseCode: params.courseCode,
          studentId: params.studentId,
          version: grade.version,
        },
      });
      reply.header("ETag", grade.etag).send({ data: grade });
    },
  );

  app.post(
    "/v1/teacher/students/:studentId/modules/:moduleId/unlock-overrides",
    { preHandler: [requireRoles("teacher", "teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const params = parse(
        z.object({
          studentId: z.string().trim().min(1).max(100),
          moduleId: assignmentIdSchema,
        }),
        request.params,
        "INVALID_UNLOCK_TARGET",
      );
      const body = parse(
        z.object({
          reason: z.string().trim().min(1).max(1000),
          expiresAt: z.string().datetime({ offset: true }).optional(),
        }),
        request.body,
        "INVALID_UNLOCK_OVERRIDE",
      );
      if (body.expiresAt && new Date(body.expiresAt) <= new Date()) {
        throw new ApiError(422, "INVALID_UNLOCK_EXPIRY", "The override expiry must be in the future.");
      }
      const module = await repository.getModule(params.moduleId);
      if (!module || module.status !== "published") {
        throw new ApiError(404, "MODULE_NOT_FOUND", "The course module was not found.");
      }
      await requireCourseAccess(request.auth.user, module.courseCode);
      const override = await repository.createModuleUnlockOverride({
        teacherUserId: request.auth.user.id,
        studentPublicId: params.studentId,
        moduleId: params.moduleId,
        reason: body.reason,
        expiresAt: body.expiresAt || null,
      });
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: request.auth.user.id,
        action: "module.unlock.override",
        resourceType: "course_module",
        resourceId: params.moduleId,
        outcome: "success",
        details: { studentId: params.studentId, courseCode: module.courseCode },
      });
      reply.status(201).send({ data: override });
    },
  );

  app.post(
    "/v1/submissions",
    {
      preHandler: [requireRoles("student"), requireCsrf],
      config: { rateLimit: { max: 20, timeWindow: "1 hour" } },
    },
    async (request, reply) => {
      const key = idempotencyKey(request);
      const fields = {};
      const uploaded = [];
      for await (const part of request.parts()) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();
          if (!buffer.length) throw new ApiError(422, "EMPTY_FILE", "Uploaded files cannot be empty.");
          uploaded.push({ filename: part.filename, mimetype: part.mimetype, buffer });
        } else {
          fields[part.fieldname] = String(part.value ?? "");
        }
      }
      const metadata = parse(
        z.object({
          courseCode: courseCodeSchema,
          // Kept for compatibility with older clients. The assignment record is
          // authoritative because platform module numbers are not OSSD unit numbers.
          unitNumber: z.coerce.number().int().min(1).max(999).optional(),
          assignmentId: assignmentIdSchema,
          assignmentTitle: z.string().trim().min(1).max(300),
          attemptNumber: z.coerce.number().int().min(1).max(99),
          note: z.string().trim().max(10000).default(""),
          integrityConfirmed: z.enum(["true", "1", "yes"]),
          replacesSubmissionId: z.string().uuid().optional().or(z.literal("")),
        }),
        fields,
        "INVALID_SUBMISSION",
      );
      if (metadata.replacesSubmissionId && !uploaded.length) {
        throw new ApiError(
          422,
          "REPLACEMENT_FILE_REQUIRED",
          "Choose a new file when submitting a replacement attempt.",
        );
      }
      const assignment = await repository.getAssignment(metadata.assignmentId);
      if (!assignment || assignment.courseCode !== metadata.courseCode) {
        throw new ApiError(
          422,
          "ASSIGNMENT_MISMATCH",
          "The assignment does not belong to the selected course.",
        );
      }
      if (!["text", "file", "text_or_file", "project"].includes(assignment.submissionMode)) {
        throw new ApiError(
          422,
          "SUBMISSION_MODE_NOT_ALLOWED",
          "This assignment is completed under teacher supervision and does not accept a student upload.",
        );
      }
      if (["file", "project"].includes(assignment.submissionMode) && !uploaded.length) {
        throw new ApiError(
          422,
          "SUBMISSION_FILE_REQUIRED",
          "This assignment requires at least one uploaded file.",
        );
      }
      if (assignment.submissionMode === "text" && !metadata.note) {
        throw new ApiError(
          422,
          "SUBMISSION_NOTE_REQUIRED",
          "This assignment requires a written response.",
        );
      }
      if (assignment.submissionMode === "text" && uploaded.length) {
        throw new ApiError(
          422,
          "SUBMISSION_FILE_NOT_ALLOWED",
          "This assignment accepts a written response without attachments.",
        );
      }
      if (!uploaded.length && !metadata.note) {
        throw new ApiError(422, "EMPTY_SUBMISSION", "Add a note or at least one file.");
      }
      if (metadata.attemptNumber > assignment.maxAttempts) {
        throw new ApiError(422, "ATTEMPT_LIMIT_REACHED", "No additional attempt is allowed for this assignment.");
      }
      if (!(await repository.canAccessCourse(request.auth.user, metadata.courseCode))) {
        throw new ApiError(403, "NOT_ENROLLED", "You are not enrolled in this course.");
      }
      if (assignment.moduleId) {
        const progress = await repository.listStudentProgress(
          request.auth.user.id,
          assignment.courseCode,
        );
        const moduleProgress = progress.find((item) => item.moduleId === assignment.moduleId);
        if (!moduleProgress || moduleProgress.status === "locked") {
          throw new ApiError(
            409,
            "MODULE_LOCKED",
            "This assignment is not available until its module is unlocked.",
          );
        }
      }
      if (metadata.replacesSubmissionId) {
        const replaced = await repository.getSubmission(metadata.replacesSubmissionId, "student");
        if (
          !replaced ||
          replaced.studentUserId !== request.auth.user.id ||
          replaced.courseCode !== metadata.courseCode ||
          replaced.assignmentId !== metadata.assignmentId
        ) {
          throw new ApiError(422, "INVALID_REPLACEMENT", "The replacement does not match your previous submission.");
        }
        if (metadata.attemptNumber !== replaced.attemptNumber + 1) {
          throw new ApiError(409, "ATTEMPT_NUMBER_CONFLICT", "Refresh the assignment before submitting another attempt.");
        }
      }
      const validatedFiles = [];
      for (const file of uploaded) {
        const validated = await validateUploadedFile(file);
        await scanner.scan(file.buffer);
        validatedFiles.push({
          ...file,
          ...validated,
          sha256: sha256(file.buffer),
          sizeBytes: file.buffer.length,
        });
      }
      const fingerprint = stableFingerprint({
        courseCode: assignment.courseCode,
        unitNumber: assignment.unitNumber,
        assignmentId: metadata.assignmentId,
        attemptNumber: metadata.attemptNumber,
        note: metadata.note,
        files: validatedFiles.map((file) => ({ name: file.originalName, sha256: file.sha256 })),
      });
      const replay = await repository.findSubmissionByIdempotency(request.auth.user.id, key, "student");
      if (replay) {
        if (replay.requestFingerprint !== fingerprint) {
          throw new ApiError(409, "IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used for different submission content.");
        }
        return { data: serializeSubmission(replay) };
      }
      const latestAttempt = await repository.getLatestSubmissionAttempt(
        request.auth.user.id,
        metadata.courseCode,
        metadata.assignmentId,
      );
      const expectedAttemptNumber = latestAttempt
        ? latestAttempt.attemptNumber + 1
        : 1;
      if (metadata.attemptNumber !== expectedAttemptNumber) {
        throw new ApiError(
          409,
          "ATTEMPT_NUMBER_CONFLICT",
          "Refresh the assignment before submitting this attempt.",
        );
      }
      if (
        latestAttempt &&
        metadata.replacesSubmissionId !== latestAttempt.id
      ) {
        throw new ApiError(
          409,
          "LATEST_SUBMISSION_REQUIRED",
          "A new attempt must replace your latest submission.",
        );
      }
      const target = validatedFiles.length ? await repository.getActiveSubmissionTarget() : null;
      if (validatedFiles.length && !target) {
        throw new ApiError(503, "SUBMISSION_STORAGE_UNAVAILABLE", "Submission storage has not been configured.");
      }
      const submissionId = randomUUID();
      const driveFiles = [];
      try {
        for (const file of validatedFiles) {
          const storedName = `${randomUUID()}${path.extname(file.originalName).toLowerCase()}`;
          const pathSegments = [
            assignment.courseCode,
            request.auth.user.publicId,
            assignment.sectionKind === "final_evaluation"
              ? "Final Evaluation"
              : `Unit ${assignment.curriculumUnitNumber ?? assignment.unitNumber}`,
            metadata.assignmentId,
            `Attempt ${metadata.attemptNumber}`,
          ];
          const driveFile = await drive.uploadSubmission({
            target,
            pathSegments,
            storedName,
            mimeType: file.mimeType,
            buffer: file.buffer,
          });
          driveFiles.push({
            id: randomUUID(),
            targetId: target.id,
            ...driveFile,
            originalName: file.originalName,
            storedName,
            relativePath: `${target.root_folder_name || target.rootFolderName || "Lake Forest Learning - Student Submissions"}/${pathSegments.join("/")}/${storedName}`,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            sha256: file.sha256,
          });
        }
        const created = await repository.createSubmission(
          {
            id: submissionId,
            studentUserId: request.auth.user.id,
            studentId: request.auth.user.publicId,
            studentName: request.auth.user.displayName,
            studentEmail: request.auth.user.email,
            studentFirstName: request.auth.user.firstName,
            studentLastName: request.auth.user.lastName,
            courseCode: assignment.courseCode,
            unitNumber: assignment.unitNumber,
            curriculumUnitNumber: assignment.curriculumUnitNumber,
            sectionKind: assignment.sectionKind,
            assignmentId: metadata.assignmentId,
            assignmentTitle: assignment.title,
            attemptNumber: metadata.attemptNumber,
            note: metadata.note,
            idempotencyKey: key,
            requestFingerprint: fingerprint,
          },
          driveFiles,
        );
        await repository.recordAudit?.({
          requestId: request.id,
          actorUserId: request.auth.user.id,
          action: "submission.create",
          resourceType: "submission",
          resourceId: submissionId,
          outcome: "success",
          details: { courseCode: metadata.courseCode, assignmentId: metadata.assignmentId, fileCount: driveFiles.length },
        });
        reply.status(201).send({ data: serializeSubmission(created) });
      } catch (error) {
        await Promise.allSettled(driveFiles.map((file) => drive.deleteFile(file.driveFileId)));
        throw error;
      }
    },
  );

  app.get(
    "/v1/submissions",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => {
      if (request.auth.user.role === "student" && request.query?.studentId) {
        throw new ApiError(400, "STUDENT_FILTER_FORBIDDEN", "Students cannot filter by studentId.");
      }
      const query = parse(
        z.object({
          scope: z.enum(["student", "teacher"]).optional(),
          courseCode: courseCodeSchema.optional(),
          unitNumber: z.coerce.number().int().min(1).max(999).optional(),
          assignmentId: assignmentIdSchema.optional(),
          studentId: z.string().trim().max(100).optional(),
          status: z.enum(["submitted", "rejected", "withdrawn"]).optional(),
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).default(50),
        }),
        request.query || {},
        "INVALID_FILTER",
      );
      const offset = parseCursor(query.cursor);
      const records = await repository.listSubmissions(request.auth.user, { ...query, offset });
      const hasMore = records.length > query.limit;
      const pageRecords = records.slice(0, query.limit);
      const staff = request.auth.user.role !== "student";
      const studentCurrent = staff
        ? []
        : collapseSubmissions(pageRecords, false);
      return {
        data: staff
          ? groupTeacherSubmissions(pageRecords)
          : studentCurrent.map(({ record, historyRecords }) =>
              serializeSubmission(record, { historyRecords }),
            ),
        page: { nextCursor: nextCursor(offset, query.limit, hasMore), limit: query.limit },
      };
    },
  );

  app.get(
    "/v1/submissions/:submissionId/files/:fileId/open",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request, reply) => {
      const params = parse(
        z.object({ submissionId: uuidSchema, fileId: uuidSchema }),
        request.params,
        "INVALID_FILE_REFERENCE",
      );
      const file = await repository.getSubmissionFile(params.submissionId, params.fileId);
      if (!file) throw new ApiError(404, "FILE_NOT_FOUND", "The submitted file was not found.");
      const owns = request.auth.user.role === "student" && file.student_user_id === request.auth.user.id;
      const teaches = request.auth.user.role !== "student" && (await repository.canAccessCourse(request.auth.user, file.course_code));
      if (!owns && !teaches) throw new ApiError(403, "FILE_ACCESS_DENIED", "You cannot open this file.");
      const opened = await drive.openFile(file.drive_file_id);
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: request.auth.user.id,
        action: "submission.file.open",
        resourceType: "submission_file",
        resourceId: params.fileId,
        outcome: "success",
      });
      if (opened.kind === "redirect") {
        if (!opened.url) throw new ApiError(502, "DRIVE_FILE_UNAVAILABLE", "The Drive file cannot be opened.");
        return reply.redirect(opened.url, 302);
      }
      const filename = String(file.original_file_name || "submission").replaceAll(/[\r\n"]/g, "_");
      reply.header("Content-Type", file.mime_type || "application/octet-stream");
      reply.header("Content-Disposition", `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
      reply.header("Cache-Control", "private, no-store");
      return reply.send(opened.stream);
    },
  );

  app.put(
    "/v1/grades/:submissionId",
    { preHandler: [requireRoles("teacher", "teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const submissionId = parse(uuidSchema, request.params.submissionId, "INVALID_SUBMISSION_ID");
      const body = parse(
        z.object({
          submissionId: uuidSchema,
          score: z.number().int().min(0).max(100),
          feedback: z.string().max(10000),
          publish: z.boolean(),
        }),
        request.body,
        "INVALID_GRADE",
      );
      if (body.submissionId !== submissionId) {
        throw new ApiError(422, "SUBMISSION_ID_MISMATCH", "The path and body submission IDs must match.");
      }
      const submission = await repository.getSubmission(submissionId, request.auth.user.role);
      if (!submission) throw new ApiError(404, "SUBMISSION_NOT_FOUND", "The submission was not found.");
      if (!(await repository.canAccessCourse(request.auth.user, submission.courseCode))) {
        throw new ApiError(403, "COURSE_ACCESS_DENIED", "You are not assigned to this course.");
      }
      const match = String(request.headers["if-match"] || "").match(/^"grade-v(\d+)"$/);
      if (!match) throw new ApiError(428, "IF_MATCH_REQUIRED", "A valid If-Match grade version is required.");
      const key = idempotencyKey(request);
      const requestFingerprint = stableFingerprint(body);
      const grade = await repository.createGrade({
        ...body,
        grader: request.auth.user,
        expectedVersion: Number(match[1]),
        idempotencyKey: key,
        requestFingerprint,
      });
      await repository.recordAudit?.({
        requestId: request.id,
        actorUserId: request.auth.user.id,
        action: body.publish ? "grade.publish" : "grade.draft",
        resourceType: "submission",
        resourceId: submissionId,
        outcome: "success",
        details: { version: grade.version },
      });
      reply.header("ETag", grade.etag).send({ data: grade });
    },
  );

  app.get(
    "/v1/materials",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request) => materialPage(request),
  );

  app.get(
    "/v1/materials/:materialId/open",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request, reply) => {
      const materialId = parse(uuidSchema, request.params.materialId, "INVALID_MATERIAL_ID");
      const material = await repository.getMaterial(materialId);
      if (!material) throw new ApiError(404, "MATERIAL_NOT_FOUND", "The material was not found.");
      if (request.auth.user.role === "student" && material.audience === "staff") {
        throw new ApiError(403, "MATERIAL_ACCESS_DENIED", "You cannot open this material.");
      }
      if (!(await repository.canAccessCourse(request.auth.user, material.course_code))) {
        throw new ApiError(403, "COURSE_ACCESS_DENIED", "You cannot open this material.");
      }
      const opened = await drive.openFile(material.drive_file_id);
      const filename = String(
        opened.fileName || material.file_name || "material",
      ).replaceAll(/[\r\n"]/g, "_");
      reply.header(
        "Content-Type",
        opened.contentType || material.mime_type || "application/octet-stream",
      );
      reply.header("Content-Disposition", `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
      reply.header("Cache-Control", "private, no-store");
      return reply.send(opened.stream);
    },
  );

  const driveSourceSchema = z
    .object({
      displayName: z.string().trim().min(1).max(200),
      driveKind: z.enum(["shared_drive", "my_drive"]),
      driveId: z.string().trim().min(1).max(300).nullable().optional(),
      rootFolderId: z.string().trim().min(1).max(300),
      rootFolderName: z.string().trim().min(1).max(300).default("Lotus Academy Formal Course Pilots - Text Based"),
      credentialType: z.enum(["service_account", "oauth"]),
      credentialRef: z.string().trim().min(1).max(500),
    })
    .superRefine((value, context) => {
      if (value.driveKind === "shared_drive" && !value.driveId) {
        context.addIssue({ code: "custom", path: ["driveId"], message: "driveId is required for a Shared Drive" });
      }
      if (value.driveKind === "my_drive" && value.driveId) {
        context.addIssue({ code: "custom", path: ["driveId"], message: "driveId must be null for My Drive" });
      }
    });

  app.post(
    "/v1/admin/drive/sources",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const input = parse(driveSourceSchema, request.body, "INVALID_DRIVE_SOURCE");
      const source = await repository.createDriveSource(input, request.auth.user.id);
      reply.status(201).send({ data: sourceResponse(source) });
    },
  );

  app.get(
    "/v1/admin/drive/sources",
    { preHandler: [requireRoles("teacher_admin")] },
    async () => ({ data: (await repository.listDriveSources()).map(sourceResponse) }),
  );

  app.patch(
    "/v1/admin/drive/sources/:sourceId",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request) => {
      const sourceId = parse(uuidSchema, request.params.sourceId, "INVALID_SOURCE_ID");
      const input = parse(z.object({ status: z.enum(["active", "disabled"]) }), request.body, "INVALID_SOURCE_STATUS");
      const source = await repository.updateDriveSourceStatus(sourceId, input.status);
      if (!source) throw new ApiError(404, "SOURCE_NOT_FOUND", "The Drive source was not found.");
      return { data: sourceResponse(source) };
    },
  );

  const materialSync =
    syncService || new MaterialSyncService({
      repository,
      drive,
      logger: app.log,
      canonicalRootFolderId: config.curriculumDriveRootId,
    });

  async function startMaterialSync(request, reply, source) {
    const input = parse(
      z.object({ mode: z.enum(["incremental", "full"]).default("incremental") }),
      request.body || {},
      "INVALID_SYNC_MODE",
    );
    if (source.status !== "active") {
      throw new ApiError(
        409,
        "SOURCE_DISABLED",
        "Enable the Drive source before syncing.",
      );
    }
    const run = await repository.createSyncRun({
      sourceId: source.id,
      mode: input.mode,
      idempotencyKey:
        idempotencyKey(request, { required: false }) || request.id,
      actorId: request.auth.user.id,
    });
    const completed = await materialSync.process(run.id);
    if (!completed) {
      throw new ApiError(
        409,
        "SYNC_RUN_UNAVAILABLE",
        "The Drive sync run could not be started.",
      );
    }
    if (completed.status === "failed") {
      throw new ApiError(
        502,
        completed.error_code || completed.errorCode || "DRIVE_SYNC_FAILED",
        completed.error_message ||
          completed.errorMessage ||
          "The configured Drive source could not be synchronized.",
        {
          runId: completed.id,
          statusUrl: `/v1/admin/drive/sync-runs/${completed.id}`,
        },
      );
    }
    return reply.status(200).send({
      data: {
        ...syncRunResponse(completed),
        statusUrl: `/v1/admin/drive/sync-runs/${completed.id}`,
      },
    });
  }

  app.post(
    "/v1/admin/drive/sync",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const source = await repository.getCanonicalDriveSource(
        config.curriculumDriveRootId,
      );
      if (!source) {
        throw new ApiError(
          503,
          "CANONICAL_DRIVE_SOURCE_UNAVAILABLE",
          "The canonical Drive course source has not been configured.",
        );
      }
      return startMaterialSync(request, reply, source);
    },
  );

  app.post(
    "/v1/admin/drive/sources/:sourceId/sync",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const sourceId = parse(uuidSchema, request.params.sourceId, "INVALID_SOURCE_ID");
      const source = await repository.getDriveSource(sourceId);
      if (!source) throw new ApiError(404, "SOURCE_NOT_FOUND", "The Drive source was not found.");
      return startMaterialSync(request, reply, source);
    },
  );

  app.get(
    "/v1/admin/drive/sync-runs/:runId",
    { preHandler: [requireRoles("teacher_admin")] },
    async (request) => {
      const runId = parse(uuidSchema, request.params.runId, "INVALID_SYNC_RUN_ID");
      const run = await repository.getSyncRun(runId);
      if (!run) throw new ApiError(404, "SYNC_RUN_NOT_FOUND", "The sync run was not found.");
      return { data: syncRunResponse(run) };
    },
  );

  const targetSchema = z
    .object({
      displayName: z.string().trim().min(1).max(200).default("Student Submissions"),
      driveKind: z.enum(["shared_drive", "my_drive"]).default("my_drive"),
      driveId: z.string().trim().min(1).max(300).nullable().optional(),
      rootFolderId: z.string().trim().min(1).max(300).optional(),
      rootFolderName: z.string().trim().min(1).max(300).default("Lake Forest Learning - Student Submissions"),
      credentialType: z.enum(["service_account", "oauth"]).default("service_account"),
      credentialRef: z.string().trim().min(1).max(500),
    })
    .superRefine((value, context) => {
      if (value.driveKind === "shared_drive" && !value.driveId) {
        context.addIssue({ code: "custom", path: ["driveId"], message: "driveId is required for a Shared Drive" });
      }
      if (value.driveKind === "my_drive" && value.driveId) {
        context.addIssue({ code: "custom", path: ["driveId"], message: "driveId must be null for My Drive" });
      }
    });

  app.post(
    "/v1/admin/drive/submission-targets",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const input = parse(targetSchema, request.body, "INVALID_SUBMISSION_TARGET");
      input.rootFolderId = input.rootFolderId || config.submissionTargetRootId;
      if (!input.rootFolderId) throw new ApiError(422, "ROOT_FOLDER_REQUIRED", "Configure the Student Submissions root folder ID.");
      const target = await repository.createSubmissionTarget(input, request.auth.user.id);
      reply.status(201).send({ data: sourceResponse(target) });
    },
  );

  app.get(
    "/v1/admin/drive/submission-targets",
    { preHandler: [requireRoles("teacher_admin")] },
    async () => ({ data: (await repository.listSubmissionTargets()).map(sourceResponse) }),
  );

  return app;
}
