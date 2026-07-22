import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, test } from "node:test";
import FormData from "form-data";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { publicId } from "../src/lib/crypto.js";
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
