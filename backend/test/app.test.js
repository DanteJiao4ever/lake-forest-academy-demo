import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, test } from "node:test";
import FormData from "form-data";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { publicId } from "../src/lib/crypto.js";
import { ApiError } from "../src/lib/errors.js";
import { hashPassword } from "../src/lib/passwords.js";
import { FakeDrive, FakeRepository, FakeScanner } from "./fakes.js";

const origin = "http://127.0.0.1:5173";
const allCourses = ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];

function cookieFrom(response) {
  return String(response.headers["set-cookie"]).split(";")[0];
}

function multipartPayload(fields, file = null) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  if (file) form.append("files", file.buffer, { filename: file.name, contentType: file.type });
  return { payload: form.getBuffer(), headers: { ...form.getHeaders(), "content-length": form.getLengthSync() } };
}

describe("Lake Forest Learning API", () => {
  let app;
  let repository;
  let drive;
  let scanner;
  let config;

  beforeEach(async () => {
    config = loadConfig({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test.invalid/lfa",
      ALLOWED_ORIGINS: origin,
      COOKIE_SECURE: "false",
      BCRYPT_COST: "10",
      CLAMAV_REQUIRED: "false",
      SUBMISSION_TARGET_ROOT_ID: "1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK",
    });
    repository = new FakeRepository();
    drive = new FakeDrive();
    scanner = new FakeScanner();
    app = await createApp({ config, repository, drive, scanner });
  });

  afterEach(async () => {
    await app.close();
  });

  async function register(email = "avery@example.com") {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { origin },
      payload: {
        firstName: "Avery",
        lastName: "Chen",
        email,
        password: "StrongPass2026!",
        confirmPassword: "StrongPass2026!",
        portal: "student",
      },
    });
    return { response, body: response.json(), cookie: cookieFrom(response) };
  }

  async function addFaculty(role = "teacher") {
    const password = `Test-${randomBytes(12).toString("base64url")}aA1!`;
    const user = await repository.createUser({
      publicId: publicId(role),
      email: role === "teacher" ? "james.whitmore@example.invalid" : "admin@example.invalid",
      passwordHash: await hashPassword(password, 10),
      firstName: role === "teacher" ? "James" : "Admin",
      lastName: role === "teacher" ? "Whitmore" : "User",
      displayName: role === "teacher" ? "James Whitmore" : "Admin User",
      role,
    });
    await repository.setTeacherCourses(user.id, allCourses);
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { email: user.email, password, portal: "faculty" },
    });
    return { user, response, body: response.json(), cookie: cookieFrom(response) };
  }

  async function registerEnrolledStudent(email) {
    const registered = await register(email);
    const user = repository.users.at(-1);
    await repository.replaceEnrollments(user.id, ["MHF4U"]);
    return {
      ...registered,
      user,
      csrf: registered.body.csrfToken,
    };
  }

  test("requires evidence for zero-weight activity completion and records non-empty evidence", async () => {
    const student = await registerEnrolledStudent("evidence-policy@example.invalid");
    const endpoint = "/v1/me/progress/activities/mhf4u-m00-activity";
    const headers = {
      origin,
      cookie: student.cookie,
      "x-csrf-token": student.csrf,
    };

    const empty = await app.inject({
      method: "PUT",
      url: endpoint,
      headers,
      payload: { status: "completed", evidence: {} },
    });
    assert.equal(empty.statusCode, 422, empty.body);
    assert.equal(empty.json().error.code, "ACTIVITY_EVIDENCE_REQUIRED");
    assert.equal(
      repository.activityCompletions.has(
        `${student.user.id}:mhf4u-m00-activity`,
      ),
      false,
    );

    const completed = await app.inject({
      method: "PUT",
      url: endpoint,
      headers,
      payload: {
        status: "completed",
        evidence: { acknowledgement: true },
      },
    });
    assert.equal(completed.statusCode, 200, completed.body);
    assert.deepEqual(completed.json().data.evidence, {
      acknowledgement: true,
    });
  });

  test("keeps completed activity evidence immutable after it unlocks module progression", async () => {
    const student = await registerEnrolledStudent("immutable-evidence@example.invalid");
    const activityEndpoint = "/v1/me/progress/activities/mhf4u-m00-activity";
    const moduleEndpoint = "/v1/me/progress/modules/mhf4u-m00";
    const headers = {
      origin,
      cookie: student.cookie,
      "x-csrf-token": student.csrf,
    };
    const originalEvidence = { acknowledgement: true, source: "orientation" };

    const completedActivity = await app.inject({
      method: "PUT",
      url: activityEndpoint,
      headers,
      payload: { status: "completed", evidence: originalEvidence },
    });
    assert.equal(completedActivity.statusCode, 200, completedActivity.body);
    const originalCompletedAt = completedActivity.json().data.completedAt;

    const completedModule = await app.inject({
      method: "PUT",
      url: moduleEndpoint,
      headers,
      payload: { status: "completed" },
    });
    assert.equal(completedModule.statusCode, 200, completedModule.body);

    const exactRetry = await app.inject({
      method: "PUT",
      url: activityEndpoint,
      headers,
      payload: { status: "completed", evidence: originalEvidence },
    });
    assert.equal(exactRetry.statusCode, 200, exactRetry.body);
    assert.equal(exactRetry.json().data.completedAt, originalCompletedAt);

    for (const payload of [
      { status: "started", evidence: {} },
      { status: "completed", evidence: { acknowledgement: true, source: "replacement" } },
    ]) {
      const changed = await app.inject({
        method: "PUT",
        url: activityEndpoint,
        headers,
        payload,
      });
      assert.equal(changed.statusCode, 409, changed.body);
      assert.equal(changed.json().error.code, "ACTIVITY_COMPLETION_LOCKED");
    }

    assert.deepEqual(
      repository.activityCompletions.get(
        `${student.user.id}:mhf4u-m00-activity`,
      ),
      {
        activityId: "mhf4u-m00-activity",
        status: "completed",
        evidence: originalEvidence,
        completedAt: originalCompletedAt,
      },
    );
    const progress = await repository.listStudentProgress(student.user.id, "MHF4U");
    assert.equal(progress.find((item) => item.moduleId === "mhf4u-m01")?.status, "available");
  });

  test("fails closed when an activity has an unknown unlock criteria version", async () => {
    const student = await registerEnrolledStudent("invalid-policy@example.invalid");
    repository.modules[0].unlockCriteria = {
      version: 999,
      scope: "next_module",
      operator: "all",
      conditions: [
        { type: "source_module_completed" },
        { type: "required_activity_completed" },
        { type: "required_activity_evidence_present" },
      ],
    };

    const response = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m00-activity",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
      },
      payload: {
        status: "completed",
        evidence: { acknowledgement: true },
      },
    });

    assert.equal(response.statusCode, 503, response.body);
    assert.equal(response.json().error.code, "UNLOCK_POLICY_INVALID");
    assert.equal(
      repository.activityCompletions.has(
        `${student.user.id}:mhf4u-m00-activity`,
      ),
      false,
    );
  });

  test("allows a published zero score to satisfy weighted activity completion without a threshold", async () => {
    const student = await registerEnrolledStudent("zero-score@example.invalid");
    const teacher = await addFaculty();

    const override = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.body.csrfToken,
      },
      payload: { reason: "Documented accelerated progression for API testing" },
    });
    assert.equal(override.statusCode, 201, override.body);

    const submission = await repository.createSubmission({
      id: randomUUID(),
      studentUserId: student.user.id,
      studentId: student.user.publicId,
      studentName: student.user.displayName,
      studentEmail: student.user.email,
      studentFirstName: student.user.firstName,
      studentLastName: student.user.lastName,
      courseCode: "MHF4U",
      unitNumber: 1,
      assignmentId: "mhf4u-m02-assignment",
      assignmentTitle: "Exponential and Logarithmic Model Audit",
      attemptNumber: 1,
      note: "Submitted work",
      idempotencyKey: "zero-score-submission",
      requestFingerprint: "0".repeat(64),
    }, []);

    const grade = await app.inject({
      method: "PUT",
      url: `/v1/grades/${submission.id}`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.body.csrfToken,
        "idempotency-key": "zero-score-published-grade",
        "if-match": '"grade-v0"',
      },
      payload: {
        submissionId: submission.id,
        score: 0,
        feedback: "Published evidence without a pass threshold.",
        publish: true,
      },
    });
    assert.equal(grade.statusCode, 200, grade.body);
    assert.equal(grade.json().data.score, 0);
    assert.ok(grade.json().data.publishedAt);

    const completed = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m02-activity",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
      },
      payload: { status: "completed" },
    });
    assert.equal(completed.statusCode, 200, completed.body);
    assert.equal(completed.json().data.status, "completed");
  });

  test("keeps teacher-only module fields out of student responses while exposing them to faculty", async () => {
    const student = await registerEnrolledStudent("module-privacy@example.invalid");
    const teacher = await addFaculty();
    repository.modules.find((module) => module.id === "mhf4u-m02").activity.components = [{
      id: "private-component",
      title: "Authenticated conference",
      processCheckpoints: ["Staff-only checkpoint"],
    }];

    const studentResponse = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/modules",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(studentResponse.statusCode, 200, studentResponse.body);
    for (const module of studentResponse.json().data) {
      assert.equal(Object.hasOwn(module, "teacherPresence"), false);
      assert.equal(Object.hasOwn(module, "evidenceToRetain"), false);
      assert.equal(
        Object.hasOwn(module.activity, "processCheckpoints"),
        false,
      );
      assert.equal(
        Object.hasOwn(module.activity, "authenticationEvidence"),
        false,
      );
      for (const component of module.activity.components || []) {
        assert.equal(Object.hasOwn(component, "processCheckpoints"), false);
      }
    }

    const teacherResponse = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/modules",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(teacherResponse.statusCode, 200, teacherResponse.body);
    for (const module of teacherResponse.json().data) {
      assert.equal(Object.hasOwn(module, "teacherPresence"), true);
      assert.equal(Object.hasOwn(module, "evidenceToRetain"), true);
      assert.equal(
        Object.hasOwn(module.activity, "processCheckpoints"),
        true,
      );
      assert.equal(
        Object.hasOwn(module.activity, "authenticationEvidence"),
        true,
      );
    }
    assert.deepEqual(
      teacherResponse
        .json()
        .data.find((module) => module.id === "mhf4u-m02")
        .activity.components[0].processCheckpoints,
      ["Staff-only checkpoint"],
    );
  });

  test("reports upload readiness only when the database, scanner, and Drive root are available", async () => {
    const response = await app.inject({ method: "GET", url: "/health/upload-ready" });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: "ready" });
    assert.deepEqual(drive.readyChecks, [config.submissionTargetRootId]);
  });

  test("fails upload readiness closed when the malware scanner is unavailable", async () => {
    scanner.available = false;

    const response = await app.inject({ method: "GET", url: "/health/upload-ready" });

    assert.equal(response.statusCode, 503);
    assert.equal(response.json().error.code, "MALWARE_SCANNER_UNAVAILABLE");
  });

  test("registers a server-side student with a hashed password and no implicit course access", async () => {
    const { response, body, cookie } = await register();
    assert.equal(response.statusCode, 201);
    assert.equal(body.authenticated, true);
    assert.equal(body.user.role, "student");
    assert.equal(body.email, "avery@example.com");
    assert.ok(body.csrfToken);
    assert.match(cookie, /^lfa_session=/);
    assert.notEqual(repository.users[0].passwordHash, "StrongPass2026!");
    assert.match(repository.users[0].passwordHash, /^\$2[aby]\$/);
    assert.deepEqual(await repository.listEnrollments(repository.users[0].id), []);

    const duplicate = await register();
    assert.equal(duplicate.response.statusCode, 409);
    assert.equal(duplicate.body.error.code, "EMAIL_ALREADY_REGISTERED");
  });

  test("returns a stable session-bound CSRF token and rejects missing tokens", async () => {
    const registered = await register();
    const missing = await app.inject({
      method: "PUT",
      url: "/v1/me/enrollments",
      headers: { origin, cookie: registered.cookie },
      payload: { courseCodes: ["MHF4U"] },
    });
    assert.equal(missing.statusCode, 403);
    assert.equal(missing.json().error.code, "CSRF_TOKEN_INVALID");

    const restored = await app.inject({
      method: "GET",
      url: "/v1/auth/session",
      headers: { origin, cookie: registered.cookie },
    });
    assert.equal(restored.statusCode, 200);
    const newCsrf = restored.json().csrfToken;
    assert.equal(newCsrf, registered.body.csrfToken);

    const secondTab = await app.inject({
      method: "PUT",
      url: "/v1/me/enrollments",
      headers: { origin, cookie: registered.cookie, "x-csrf-token": registered.body.csrfToken },
      payload: { courseCodes: ["MHF4U"] },
    });
    assert.equal(secondTab.statusCode, 200);

    const valid = await app.inject({
      method: "PUT",
      url: "/v1/me/enrollments",
      headers: { origin, cookie: registered.cookie, "x-csrf-token": newCsrf },
      payload: { courseCodes: ["MHF4U"] },
    });
    assert.equal(valid.statusCode, 200);
    assert.deepEqual(valid.json().data, ["MHF4U"]);

    const unknownCourse = await app.inject({
      method: "PUT",
      url: "/v1/me/enrollments",
      headers: { origin, cookie: registered.cookie, "x-csrf-token": newCsrf },
      payload: { courseCodes: ["FAKE4U"] },
    });
    assert.equal(unknownCourse.statusCode, 422);
    assert.equal(unknownCourse.json().error.code, "INVALID_ENROLLMENTS");
  });

  test("uploads a validated PDF once, hides Drive IDs, and enforces idempotency", async () => {
    const registered = await register();
    await repository.replaceEnrollments(repository.users[0].id, ["MHF4U"]);
    const fields = {
      courseCode: "MHF4U",
      unitNumber: 2,
      assignmentId: "a1",
      assignmentTitle: "Quadratic Models Investigation",
      attemptNumber: 1,
      note: "My analysis",
      integrityConfirmed: "true",
    };
    const file = {
      name: "investigation.pdf",
      type: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    };
    const firstForm = multipartPayload(fields, file);
    const first = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "submission-test-0001",
        ...firstForm.headers,
      },
      payload: firstForm.payload,
    });
    assert.equal(first.statusCode, 201, first.body);
    assert.equal(first.json().data.files[0].name, "investigation.pdf");
    assert.match(first.json().data.files[0].openUrl, /^\/v1\/submissions\//);
    assert.equal(JSON.stringify(first.json()).includes("driveFileId"), false);
    assert.equal(drive.uploads.length, 1);
    assert.deepEqual(drive.uploads[0].pathSegments, ["MHF4U", repository.users[0].publicId, "Unit 2", "a1", "Attempt 1"]);

    const replayForm = multipartPayload(fields, file);
    const replay = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "submission-test-0001",
        ...replayForm.headers,
      },
      payload: replayForm.payload,
    });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(replay.json().data.id, first.json().data.id);
    assert.equal(drive.uploads.length, 1);

    const changedForm = multipartPayload({ ...fields, note: "Changed content" }, file);
    const changed = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "submission-test-0001",
        ...changedForm.headers,
      },
      payload: changedForm.payload,
    });
    assert.equal(changed.statusCode, 409);
    assert.equal(changed.json().error.code, "IDEMPOTENCY_KEY_REUSED");
  });

  test("returns a stable Drive upload code and request ID without upstream details", async () => {
    const logEntries = [];
    await app.close();
    app = await createApp({
      config,
      repository,
      drive,
      scanner,
      logger: {
        level: "error",
        stream: {
          write(line) {
            logEntries.push(JSON.parse(line));
          },
        },
      },
    });
    const registered = await register("upload-diagnostics@example.invalid");
    await repository.replaceEnrollments(repository.users[0].id, ["MHF4U"]);
    drive.uploadSubmission = async () => {
      const error = new ApiError(
        503,
        "SUBMISSION_DRIVE_PERMISSION_DENIED",
        "Submission storage is temporarily unavailable.",
      );
      error.logContext = {
        operation: "submission_file_create",
        upstreamStatus: 403,
        upstreamReason: "insufficient_file_permissions",
      };
      throw error;
    };
    const form = multipartPayload(
      {
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 1,
        note: "Upload diagnostics test",
        integrityConfirmed: "true",
      },
      {
        name: "diagnostics.pdf",
        type: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
      },
    );
    const response = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "x-request-id": "req_upload_permission_test",
        "idempotency-key": "submission-drive-diagnostics-1",
        ...form.headers,
      },
      payload: form.payload,
    });
    assert.equal(response.statusCode, 503, response.body);
    assert.deepEqual(response.json(), {
      error: {
        code: "SUBMISSION_DRIVE_PERMISSION_DENIED",
        message: "The service could not complete the request.",
        requestId: "req_upload_permission_test",
      },
    });
    assert.equal(response.headers["x-request-id"], "req_upload_permission_test");
    assert.equal(response.body.includes("insufficient_file_permissions"), false);
    assert.equal(response.body.includes("403"), false);
    const failureLog = logEntries.find(
      (entry) => entry.requestId === "req_upload_permission_test",
    );
    assert.equal(failureLog.operation, "submission_file_create");
    assert.equal(failureLog.upstreamStatus, 403);
    assert.equal(failureLog.upstreamReason, "insufficient_file_permissions");
    assert.equal(JSON.stringify(failureLog).includes("response.data"), false);
  });

  test("blocks a locked catalog assignment, then uses its authoritative OSSD unit after override", async () => {
    const registered = await register();
    const student = repository.users[0];
    await repository.replaceEnrollments(student.id, ["MHF4U"]);
    const fields = {
      courseCode: "MHF4U",
      // The platform module is 2, while the canonical OSSD assignment unit is 1.
      unitNumber: 2,
      assignmentId: "mhf4u-m02-assignment",
      assignmentTitle: "Exponential and Logarithmic Model Audit",
      attemptNumber: 1,
      note: "Authenticated modelling report",
      integrityConfirmed: "true",
    };
    const file = {
      name: "model-audit.pdf",
      type: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    };
    const lockedForm = multipartPayload(fields, file);
    const locked = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "catalog-locked-submit-01",
        ...lockedForm.headers,
      },
      payload: lockedForm.payload,
    });
    assert.equal(locked.statusCode, 409);
    assert.equal(locked.json().error.code, "MODULE_LOCKED");
    assert.equal(drive.uploads.length, 0);

    const faculty = await addFaculty();
    const override = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
      },
      payload: { reason: "Approved prerequisite equivalency" },
    });
    assert.equal(override.statusCode, 201, override.body);

    const unlockedForm = multipartPayload(fields, file);
    const unlocked = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "catalog-unlocked-submit-1",
        ...unlockedForm.headers,
      },
      payload: unlockedForm.payload,
    });
    assert.equal(unlocked.statusCode, 201, unlocked.body);
    assert.equal(unlocked.json().data.unitNumber, 1);
    assert.equal(repository.submissions[0].unitNumber, 1);
    assert.deepEqual(drive.uploads[0].pathSegments, [
      "MHF4U",
      student.publicId,
      "Unit 1",
      "mhf4u-m02-assignment",
      "Attempt 1",
    ]);
  });

  test("rejects supervised uploads and enforces each student submission mode", async () => {
    const registered = await register();
    await repository.replaceEnrollments(repository.users[0].id, ["MHF4U"]);
    const pdf = {
      name: "response.pdf",
      type: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    };
    const base = {
      courseCode: "MHF4U",
      unitNumber: 11,
      assignmentTitle: "Assessment",
      attemptNumber: 1,
      integrityConfirmed: "true",
    };

    const supervisedForm = multipartPayload({
      ...base,
      assignmentId: "mhf4u-m11-assignment",
      note: "Attempted take-home exam",
    }, pdf);
    const supervised = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "supervised-upload-denied",
        ...supervisedForm.headers,
      },
      payload: supervisedForm.payload,
    });
    assert.equal(supervised.statusCode, 422);
    assert.equal(supervised.json().error.code, "SUBMISSION_MODE_NOT_ALLOWED");

    for (const [id, mode] of [
      ["file-only", "file"],
      ["project-only", "project"],
      ["text-only", "text"],
    ]) {
      repository.assignments.set(id, {
        id,
        courseCode: "MHF4U",
        moduleId: null,
        unitNumber: 1,
        title: id,
        maxAttempts: 1,
        submissionMode: mode,
        status: "active",
      });
    }

    for (const id of ["file-only", "project-only"]) {
      const form = multipartPayload({ ...base, assignmentId: id, note: "Note without file" });
      const response = await app.inject({
        method: "POST",
        url: "/v1/submissions",
        headers: {
          origin,
          cookie: registered.cookie,
          "x-csrf-token": registered.body.csrfToken,
          "idempotency-key": `${id}-requires-file`,
          ...form.headers,
        },
        payload: form.payload,
      });
      assert.equal(response.statusCode, 422);
      assert.equal(response.json().error.code, "SUBMISSION_FILE_REQUIRED");
    }

    const textWithFile = multipartPayload({
      ...base,
      assignmentId: "text-only",
      note: "Written response",
    }, pdf);
    const rejectedAttachment = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "text-mode-no-attachment",
        ...textWithFile.headers,
      },
      payload: textWithFile.payload,
    });
    assert.equal(rejectedAttachment.statusCode, 422);
    assert.equal(rejectedAttachment.json().error.code, "SUBMISSION_FILE_NOT_ALLOWED");
    assert.equal(drive.uploads.length, 0);
  });

  test("rejects a client-supplied attempt number that skips server history", async () => {
    const registered = await register();
    await repository.replaceEnrollments(repository.users[0].id, ["MHF4U"]);
    const form = multipartPayload(
      {
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 2,
        note: "Trying to skip attempt one",
        integrityConfirmed: "true",
      },
      {
        name: "investigation.pdf",
        type: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
      },
    );
    const response = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "submission-skip-attempt-1",
        ...form.headers,
      },
      payload: form.payload,
    });
    assert.equal(response.statusCode, 409);
    assert.equal(response.json().error.code, "ATTEMPT_NUMBER_CONFLICT");
    assert.equal(drive.uploads.length, 0);
  });

  test("rejects a replacement attempt without a new file", async () => {
    const registered = await register();
    const form = multipartPayload({
      courseCode: "MHF4U",
      unitNumber: 2,
      assignmentId: "a1",
      assignmentTitle: "Quadratic Models Investigation",
      attemptNumber: 2,
      note: "Replacement note",
      integrityConfirmed: "true",
      replacesSubmissionId: "e3b48eb0-ae04-4f7a-920f-22f6ce3e7488",
    });
    const response = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: registered.cookie,
        "x-csrf-token": registered.body.csrfToken,
        "idempotency-key": "replacement-test-01",
        ...form.headers,
      },
      payload: form.payload,
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().error.code, "REPLACEMENT_FILE_REQUIRED");
  });

  test("groups the teacher queue and publishes an integer 0-100 grade with optimistic locking", async () => {
    const registered = await register();
    const student = repository.users[0];
    const created = await repository.createSubmission(
      {
        id: "5ba93b35-bfe8-4b8d-a26a-c871915e0e82",
        studentUserId: student.id,
        studentId: student.publicId,
        studentName: student.displayName,
        studentEmail: student.email,
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 1,
        note: "Ready",
        idempotencyKey: "seed-submission",
        requestFingerprint: "a".repeat(64),
      },
      [],
    );
    const latest = await repository.createSubmission(
      {
        ...created,
        id: "12573672-9412-4e0a-b953-27bf57017d42",
        attemptNumber: 2,
        note: "Revised work",
        idempotencyKey: "seed-submission-2",
        requestFingerprint: "c".repeat(64),
      },
      [],
    );
    const faculty = await addFaculty();
    const queue = await app.inject({
      method: "GET",
      url: "/v1/submissions?scope=teacher",
      headers: { origin, cookie: faculty.cookie },
    });
    assert.equal(queue.statusCode, 200);
    assert.equal(queue.json().data[0].courseCode, "MHF4U");
    assert.equal(queue.json().data[0].students[0].studentName, "Avery Chen");
    assert.equal(queue.json().data[0].students[0].units[0].submissions.length, 1);
    assert.equal(queue.json().data[0].students[0].units[0].submissions[0].attemptNumber, 2);
    assert.equal(queue.json().data[0].students[0].units[0].submissions[0].history.length, 2);

    const invalid = await app.inject({
      method: "PUT",
      url: `/v1/grades/${latest.id}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "grade-invalid-001",
        "if-match": '"grade-v0"',
      },
      payload: { submissionId: latest.id, score: 88.5, feedback: "Good", publish: true },
    });
    assert.equal(invalid.statusCode, 422);
    assert.equal(invalid.json().error.code, "INVALID_GRADE");

    const published = await app.inject({
      method: "PUT",
      url: `/v1/grades/${latest.id}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "grade-valid-0001",
        "if-match": '"grade-v0"',
      },
      payload: { submissionId: latest.id, score: 100, feedback: "Excellent reasoning.", publish: true },
    });
    assert.equal(published.statusCode, 200, published.body);
    assert.equal(published.json().data.score, 100);
    assert.equal(published.headers.etag, '"grade-v1"');

    const zero = await app.inject({
      method: "PUT",
      url: `/v1/grades/${latest.id}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "grade-valid-zero",
        "if-match": '"grade-v1"',
      },
      payload: { submissionId: latest.id, score: 0, feedback: "Please revise and resubmit.", publish: true },
    });
    assert.equal(zero.statusCode, 200, zero.body);
    assert.equal(zero.json().data.score, 0);
    assert.equal(zero.headers.etag, '"grade-v2"');

    const stale = await app.inject({
      method: "PUT",
      url: `/v1/grades/${latest.id}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "grade-stale-0001",
        "if-match": '"grade-v0"',
      },
      payload: { submissionId: latest.id, score: 99, feedback: "Changed", publish: true },
    });
    assert.equal(stale.statusCode, 412);
    assert.equal(stale.json().error.code, "GRADE_VERSION_CONFLICT");

    const studentList = await app.inject({
      method: "GET",
      url: "/v1/submissions?courseCode=MHF4U",
      headers: { origin, cookie: registered.cookie },
    });
    assert.equal(studentList.json().data[0].grade.score, 0);
    assert.equal(studentList.json().data.length, 1);
    assert.equal(studentList.json().data[0].attemptNumber, 2);
    assert.equal(studentList.json().data[0].history.length, 2);
  });

  test("blocks cross-student file access and downloads authorized files as attachments", async () => {
    const first = await register("avery@example.com");
    const student = repository.users[0];
    const submission = await repository.createSubmission(
      {
        id: randomUuid("1"), studentUserId: student.id, studentId: student.publicId,
        studentName: student.displayName, studentEmail: student.email,
        studentFirstName: student.firstName, studentLastName: student.lastName,
        courseCode: "MHF4U", unitNumber: 2, assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation", attemptNumber: 1,
        note: "", idempotencyKey: "file-owner-seed", requestFingerprint: "b".repeat(64),
      },
      [{
        id: randomUuid("2"), driveFileId: "drive-private", originalName: "private.pdf",
        mimeType: "application/pdf", sizeBytes: 20,
      }],
    );
    const fileId = submission.files[0].id;
    const second = await register("other@example.com");
    const denied = await app.inject({
      method: "GET",
      url: `/v1/submissions/${submission.id}/files/${fileId}/open`,
      headers: { origin, cookie: second.cookie },
    });
    assert.equal(denied.statusCode, 403);

    const allowed = await app.inject({
      method: "GET",
      url: `/v1/submissions/${submission.id}/files/${fileId}/open`,
      headers: { origin, cookie: first.cookie },
    });
    assert.equal(allowed.statusCode, 200);
    assert.match(allowed.headers["content-disposition"], /^attachment;/);
  });

  test("supports the return, resubmit, grade, and notification workflow without exposing drafts", async () => {
    const student = await registerEnrolledStudent("interaction-student@example.invalid");
    const faculty = await addFaculty();
    const commonFields = {
      courseCode: "MHF4U",
      unitNumber: 2,
      assignmentId: "a1",
      assignmentTitle: "Quadratic Models Investigation",
      note: "My first analysis",
      integrityConfirmed: "true",
    };
    const pdf = {
      name: "investigation.pdf",
      type: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
    };

    const firstForm = multipartPayload({ ...commonFields, attemptNumber: 1 }, pdf);
    const first = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
        "idempotency-key": "interaction-submit-0001",
        ...firstForm.headers,
      },
      payload: firstForm.payload,
    });
    assert.equal(first.statusCode, 201, first.body);
    assert.equal(first.json().data.workflowStatus, "under_review");
    const firstId = first.json().data.id;

    const facultyNotifications = await app.inject({
      method: "GET",
      url: "/v1/me/notifications",
      headers: { origin, cookie: faculty.cookie },
    });
    assert.equal(facultyNotifications.statusCode, 200, facultyNotifications.body);
    assert.equal(facultyNotifications.json().data[0].type, "submission_received");

    const prematureForm = multipartPayload({
      ...commonFields,
      attemptNumber: 2,
      replacesSubmissionId: firstId,
      note: "A premature replacement",
    }, pdf);
    const premature = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
        "idempotency-key": "interaction-premature-1",
        ...prematureForm.headers,
      },
      payload: prematureForm.payload,
    });
    assert.equal(premature.statusCode, 409, premature.body);
    assert.equal(premature.json().error.code, "RESUBMISSION_NOT_REQUESTED");

    const returned = await app.inject({
      method: "POST",
      url: `/v1/submissions/${firstId}/return`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "interaction-return-0001",
      },
      payload: { body: "Please add evidence for your model selection." },
    });
    assert.equal(returned.statusCode, 201, returned.body);
    assert.equal(returned.json().data.type, "revision_request");

    const returnedReplay = await app.inject({
      method: "POST",
      url: `/v1/submissions/${firstId}/return`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "interaction-return-0001",
      },
      payload: { message: "Please add evidence for your model selection." },
    });
    assert.equal(returnedReplay.statusCode, 201, returnedReplay.body);
    assert.equal(returnedReplay.json().data.id, returned.json().data.id);

    const revisionState = await app.inject({
      method: "GET",
      url: "/v1/submissions?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(revisionState.statusCode, 200, revisionState.body);
    assert.equal(revisionState.json().data[0].workflowStatus, "revision_requested");
    assert.equal(revisionState.json().data[0].resubmissionAllowed, true);
    assert.equal(revisionState.json().data[0].messages[0].submissionId, firstId);
    assert.equal(revisionState.json().data[0].messages[0].attemptNumber, 1);

    const secondForm = multipartPayload({
      ...commonFields,
      attemptNumber: 2,
      replacesSubmissionId: firstId,
      note: "Revised analysis with evidence",
    }, { ...pdf, name: "investigation-revised.pdf" });
    const second = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
        "idempotency-key": "interaction-submit-0002",
        ...secondForm.headers,
      },
      payload: secondForm.payload,
    });
    assert.equal(second.statusCode, 201, second.body);
    assert.equal(second.json().data.workflowStatus, "resubmitted");
    assert.equal(second.json().data.replacesSubmissionId, firstId);
    assert.equal(second.json().data.history.length, 2);
    assert.equal(second.json().data.messages[0].submissionId, firstId);
    const secondId = second.json().data.id;

    const comment = await app.inject({
      method: "POST",
      url: `/v1/submissions/${secondId}/messages`,
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
        "idempotency-key": "interaction-comment-001",
      },
      payload: { body: "I added the requested comparison table." },
    });
    assert.equal(comment.statusCode, 201, comment.body);
    assert.equal(comment.json().data.type, "comment");

    const draft = await app.inject({
      method: "PUT",
      url: `/v1/grades/${secondId}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "interaction-grade-draft-1",
        "if-match": '"grade-v0"',
      },
      payload: {
        submissionId: secondId,
        score: 87,
        feedback: "Draft feedback that must stay private.",
        publish: false,
      },
    });
    assert.equal(draft.statusCode, 200, draft.body);

    const teacherDraftQueue = await app.inject({
      method: "GET",
      url: "/v1/submissions?scope=teacher&courseCode=MHF4U",
      headers: { origin, cookie: faculty.cookie },
    });
    assert.equal(teacherDraftQueue.statusCode, 200, teacherDraftQueue.body);
    const teacherDraftSubmission =
      teacherDraftQueue.json().data[0].students[0].units[0].submissions[0];
    assert.equal(teacherDraftSubmission.grade.score, 87);
    assert.equal(teacherDraftSubmission.workflowStatus, "under_review");

    const hiddenDraft = await app.inject({
      method: "GET",
      url: "/v1/submissions?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(hiddenDraft.statusCode, 200, hiddenDraft.body);
    assert.equal(hiddenDraft.json().data[0].grade, null);
    assert.equal("score" in hiddenDraft.json().data[0], false);
    assert.equal(hiddenDraft.json().data[0].workflowStatus, "resubmitted");

    const published = await app.inject({
      method: "PUT",
      url: `/v1/grades/${secondId}`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "interaction-grade-publish-1",
        "if-match": '"grade-v1"',
      },
      payload: {
        submissionId: secondId,
        score: 87,
        feedback: "Clear revision and well-supported reasoning.",
        publish: true,
      },
    });
    assert.equal(published.statusCode, 200, published.body);

    const graded = await app.inject({
      method: "GET",
      url: "/v1/submissions?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(graded.statusCode, 200, graded.body);
    assert.equal(graded.json().data[0].workflowStatus, "graded");
    assert.equal(graded.json().data[0].score, 87);
    assert.equal(graded.json().data[0].history.length, 2);
    assert.equal(
      graded.json().data[0].messages.some((item) =>
        item.submissionId === firstId && item.attemptNumber === 1),
      true,
    );

    const studentNotifications = await app.inject({
      method: "GET",
      url: "/v1/me/notifications",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(studentNotifications.statusCode, 200, studentNotifications.body);
    assert.equal(studentNotifications.json().unreadCount, 2);
    assert.deepEqual(
      new Set(studentNotifications.json().data.map((item) => item.type)),
      new Set(["submission_returned", "grade_published"]),
    );
    assert.equal(
      studentNotifications.json().data.every((item) => item.href === "#/assignment/a1"),
      true,
    );

    const notificationId = studentNotifications.json().data[0].id;
    const readOne = await app.inject({
      method: "PATCH",
      url: `/v1/me/notifications/${notificationId}`,
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
      },
      payload: { read: true },
    });
    assert.equal(readOne.statusCode, 200, readOne.body);
    assert.equal(readOne.json().unreadCount, 1);

    const other = await register("notification-boundary@example.invalid");
    const deniedRead = await app.inject({
      method: "PATCH",
      url: `/v1/me/notifications/${notificationId}`,
      headers: {
        origin,
        cookie: other.cookie,
        "x-csrf-token": other.body.csrfToken,
      },
      payload: { read: true },
    });
    assert.equal(deniedRead.statusCode, 404, deniedRead.body);
    assert.equal(deniedRead.json().error.code, "NOTIFICATION_NOT_FOUND");

    const readAll = await app.inject({
      method: "PATCH",
      url: "/v1/me/notifications",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.csrf,
      },
      payload: { readAll: true },
    });
    assert.equal(readAll.statusCode, 200, readAll.body);
    assert.equal(readAll.json().unreadCount, 0);
  });

  test("enforces return attempt limits and submission message ownership", async () => {
    const owner = await registerEnrolledStudent("message-owner@example.invalid");
    const faculty = await addFaculty();
    const first = await repository.createSubmission(
      {
        id: randomUuid("7"),
        studentUserId: owner.user.id,
        studentId: owner.user.publicId,
        studentName: owner.user.displayName,
        studentEmail: owner.user.email,
        studentFirstName: owner.user.firstName,
        studentLastName: owner.user.lastName,
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 1,
        note: "Ready",
        idempotencyKey: "message-owner-seed",
        requestFingerprint: "d".repeat(64),
      },
      [],
    );
    const other = await register("message-other@example.invalid");
    const forbidden = await app.inject({
      method: "POST",
      url: `/v1/submissions/${first.id}/messages`,
      headers: {
        origin,
        cookie: other.cookie,
        "x-csrf-token": other.body.csrfToken,
        "idempotency-key": "message-cross-owner-1",
      },
      payload: { message: "I should not be able to post here." },
    });
    assert.equal(forbidden.statusCode, 403, forbidden.body);
    assert.equal(forbidden.json().error.code, "SUBMISSION_ACCESS_DENIED");

    repository.assignments.get("a1").maxAttempts = 1;
    const noRemainingAttempt = await app.inject({
      method: "POST",
      url: `/v1/submissions/${first.id}/return`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "return-max-attempt-1",
      },
      payload: { body: "Please revise." },
    });
    assert.equal(noRemainingAttempt.statusCode, 409, noRemainingAttempt.body);
    assert.equal(noRemainingAttempt.json().error.code, "ATTEMPT_LIMIT_REACHED");

    first.status = "withdrawn";
    repository.assignments.get("a1").maxAttempts = 3;
    const inactiveAttempt = await app.inject({
      method: "POST",
      url: `/v1/submissions/${first.id}/return`,
      headers: {
        origin,
        cookie: faculty.cookie,
        "x-csrf-token": faculty.body.csrfToken,
        "idempotency-key": "return-inactive-attempt-1",
      },
      payload: { body: "Please revise." },
    });
    assert.equal(inactiveAttempt.statusCode, 409, inactiveAttempt.body);
    assert.equal(inactiveAttempt.json().error.code, "SUBMISSION_NOT_ACTIVE");
  });

  test("rate limits submission conversation writes", async () => {
    const owner = await registerEnrolledStudent("message-rate-limit@example.invalid");
    const submission = await repository.createSubmission(
      {
        id: randomUuid("8"),
        studentUserId: owner.user.id,
        studentId: owner.user.publicId,
        studentName: owner.user.displayName,
        studentEmail: owner.user.email,
        studentFirstName: owner.user.firstName,
        studentLastName: owner.user.lastName,
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 1,
        note: "Ready",
        idempotencyKey: "message-rate-limit-seed",
        requestFingerprint: "e".repeat(64),
      },
      [],
    );

    for (let index = 0; index < 120; index += 1) {
      const response = await app.inject({
        method: "POST",
        url: `/v1/submissions/${submission.id}/messages`,
        headers: {
          origin,
          cookie: owner.cookie,
          "x-csrf-token": owner.csrf,
          "idempotency-key": `message-rate-limit-${index}`,
        },
        payload: { body: `Conversation entry ${index}.` },
      });
      assert.equal(response.statusCode, 201, response.body);
    }

    const limited = await app.inject({
      method: "POST",
      url: `/v1/submissions/${submission.id}/messages`,
      headers: {
        origin,
        cookie: owner.cookie,
        "x-csrf-token": owner.csrf,
        "idempotency-key": "message-rate-limit-overflow",
      },
      payload: { body: "This write should be rate limited." },
    });
    assert.equal(limited.statusCode, 429, limited.body);

    const secondOwner = await registerEnrolledStudent(
      "message-rate-limit-second@example.invalid",
    );
    const secondSubmission = await repository.createSubmission(
      {
        id: randomUuid("9"),
        studentUserId: secondOwner.user.id,
        studentId: secondOwner.user.publicId,
        studentName: secondOwner.user.displayName,
        studentEmail: secondOwner.user.email,
        studentFirstName: secondOwner.user.firstName,
        studentLastName: secondOwner.user.lastName,
        courseCode: "MHF4U",
        unitNumber: 2,
        assignmentId: "a1",
        assignmentTitle: "Quadratic Models Investigation",
        attemptNumber: 1,
        note: "Ready",
        idempotencyKey: "message-rate-limit-second-seed",
        requestFingerprint: "f".repeat(64),
      },
      [],
    );
    const independentSession = await app.inject({
      method: "POST",
      url: `/v1/submissions/${secondSubmission.id}/messages`,
      headers: {
        origin,
        cookie: secondOwner.cookie,
        "x-csrf-token": secondOwner.csrf,
        "idempotency-key": "message-rate-limit-independent-session",
      },
      payload: { body: "A separate account keeps its own allowance." },
    });
    assert.equal(independentSession.statusCode, 201, independentSession.body);
  });

  test("filters material records by authorized courses and never exposes Drive IDs", async () => {
    const registered = await register();
    await repository.replaceEnrollments(repository.users[0].id, ["MHF4U"]);
    const response = await app.inject({
      method: "GET",
      url: "/v1/materials?courseCode=MHF4U",
      headers: { origin, cookie: registered.cookie },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().data[0].name, "Quadratic models.pdf");
    assert.equal(JSON.stringify(response.json()).includes("drive-material-1"), false);
  });
});

function randomUuid(last) {
  return `00000000-0000-4000-8000-00000000000${last}`;
}
