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
import { MaterialSyncService } from "./services/material-sync.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const categories = ["Lessons", "Resources", "Assignments", "Assessments"];
const launchCourseCodes = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];

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
    unit: `Unit ${record.unitNumber}`,
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
    if (!student.units.has(record.unitNumber)) {
      student.units.set(record.unitNumber, { unitNumber: record.unitNumber, submissions: [] });
    }
    student.units
      .get(record.unitNumber)
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
      units: [...student.units.values()],
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
    status: row.status,
    lastSuccessfulSyncAt:
      row.last_successful_sync_at ?? row.lastSuccessfulSyncAt ?? null,
    createdAt: row.created_at ?? row.createdAt,
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

export async function createApp({ config, repository, drive, scanner, logger = false, syncService } = {}) {
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
                "body.newPassword",
                "body.confirmPassword",
              ],
              censor: "[REDACTED]",
            },
          }),
    bodyLimit: config.maxRequestBytes,
    trustProxy: config.nodeEnv === "production",
    genReqId: (request) => String(request.headers["x-request-id"] || `req_${randomUUID()}`).slice(0, 128),
  });
  const allowedOrigins = new Set(config.allowedOrigins);

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
          unitNumber: z.coerce.number().int().min(1).max(999),
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
      if (!uploaded.length && !metadata.note) {
        throw new ApiError(422, "EMPTY_SUBMISSION", "Add a note or at least one file.");
      }
      if (metadata.replacesSubmissionId && !uploaded.length) {
        throw new ApiError(
          422,
          "REPLACEMENT_FILE_REQUIRED",
          "Choose a new file when submitting a replacement attempt.",
        );
      }
      const assignment = await repository.getAssignment(metadata.assignmentId);
      if (
        !assignment ||
        assignment.courseCode !== metadata.courseCode ||
        assignment.unitNumber !== metadata.unitNumber
      ) {
        throw new ApiError(422, "ASSIGNMENT_MISMATCH", "The assignment does not belong to the selected course and unit.");
      }
      if (metadata.attemptNumber > assignment.maxAttempts) {
        throw new ApiError(422, "ATTEMPT_LIMIT_REACHED", "No additional attempt is allowed for this assignment.");
      }
      if (!(await repository.canAccessCourse(request.auth.user, metadata.courseCode))) {
        throw new ApiError(403, "NOT_ENROLLED", "You are not enrolled in this course.");
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
        courseCode: metadata.courseCode,
        unitNumber: metadata.unitNumber,
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
            metadata.courseCode,
            request.auth.user.publicId,
            `Unit ${metadata.unitNumber}`,
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
            courseCode: metadata.courseCode,
            unitNumber: metadata.unitNumber,
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
    async (request) => {
      const query = parse(
        z.object({
          courseCode: courseCodeSchema.optional(),
          unitNumber: z.coerce.number().int().min(1).max(999).optional(),
          category: z.enum(categories).optional(),
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(100).default(50),
        }),
        request.query || {},
        "INVALID_MATERIAL_FILTER",
      );
      const allowedCourseCodes = await repository.listAccessibleCourseCodes(request.auth.user);
      if (query.courseCode && !allowedCourseCodes.includes(query.courseCode)) {
        throw new ApiError(403, "COURSE_ACCESS_DENIED", "You cannot view materials for this course.");
      }
      const offset = parseCursor(query.cursor);
      const records = await repository.listMaterials({
        ...query,
        offset,
        allowedCourseCodes,
      });
      const hasMore = records.length > query.limit;
      const data = records.slice(0, query.limit).map((row) => ({
        id: row.id,
        courseCode: row.course_code ?? row.courseCode,
        unitNumber: row.unit_number ?? row.unitNumber,
        category: row.category,
        name: row.file_name ?? row.name,
        mimeType: row.mime_type ?? row.mimeType,
        sizeBytes: Number(row.size_bytes ?? row.sizeBytes ?? 0) || null,
        driveModifiedAt: row.drive_modified_at ?? row.driveModifiedAt,
        openUrl: `/v1/materials/${row.id}/open`,
      }));
      return { data, page: { nextCursor: nextCursor(offset, query.limit, hasMore), limit: query.limit } };
    },
  );

  app.get(
    "/v1/materials/:materialId/open",
    { preHandler: [requireRoles("student", "teacher", "teacher_admin")] },
    async (request, reply) => {
      const materialId = parse(uuidSchema, request.params.materialId, "INVALID_MATERIAL_ID");
      const material = await repository.getMaterial(materialId);
      if (!material) throw new ApiError(404, "MATERIAL_NOT_FOUND", "The material was not found.");
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
    syncService || new MaterialSyncService({ repository, drive, logger: app.log });

  app.post(
    "/v1/admin/drive/sources/:sourceId/sync",
    { preHandler: [requireRoles("teacher_admin"), requireCsrf] },
    async (request, reply) => {
      const sourceId = parse(uuidSchema, request.params.sourceId, "INVALID_SOURCE_ID");
      const input = parse(z.object({ mode: z.enum(["incremental", "full"]).default("incremental") }), request.body || {}, "INVALID_SYNC_MODE");
      const source = await repository.getDriveSource(sourceId);
      if (!source) throw new ApiError(404, "SOURCE_NOT_FOUND", "The Drive source was not found.");
      if (source.status !== "active") throw new ApiError(409, "SOURCE_DISABLED", "Enable the Drive source before syncing.");
      const run = await repository.createSyncRun({
        sourceId,
        mode: input.mode,
        idempotencyKey: idempotencyKey(request, { required: false }) || request.id,
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
      reply.status(200).send({
        data: {
          ...syncRunResponse(completed),
          statusUrl: `/v1/admin/drive/sync-runs/${completed.id}`,
        },
      });
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
