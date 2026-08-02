import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, test } from "node:test";
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

describe("database-driven course catalog API", () => {
  let app;
  let repository;

  beforeEach(async () => {
    const config = loadConfig({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test.invalid/lfa",
      ALLOWED_ORIGINS: origin,
      COOKIE_SECURE: "false",
      BCRYPT_COST: "10",
      CLAMAV_REQUIRED: "false",
      SUBMISSION_TARGET_ROOT_ID: "submission-root",
    });
    repository = new FakeRepository();
    app = await createApp({
      config,
      repository,
      drive: new FakeDrive(),
      scanner: new FakeScanner(),
    });
  });

  afterEach(async () => app.close());

  async function registerStudent(email = "student@example.invalid") {
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
    const body = response.json();
    await repository.replaceEnrollments(repository.users.at(-1).id, ["MHF4U"]);
    return { user: repository.users.at(-1), cookie: cookieFrom(response), csrf: body.csrfToken };
  }

  async function addFaculty(role, courses = ["MHF4U"]) {
    const password = `Test-${randomBytes(12).toString("base64url")}aA1!`;
    const user = await repository.createUser({
      publicId: publicId(role),
      email: `${role}@example.invalid`,
      passwordHash: await hashPassword(password, 10),
      firstName: role === "teacher_admin" ? "Admin" : "Teacher",
      lastName: "User",
      displayName: role === "teacher_admin" ? "Admin User" : "Teacher User",
      role,
    });
    await repository.setTeacherCourses(user.id, courses);
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: { email: user.email, password, portal: "faculty" },
    });
    return { user, cookie: cookieFrom(response), csrf: response.json().csrfToken };
  }

  test("reports the exact catalog acceptance counts", async () => {
    const response = await app.inject({ method: "GET", url: "/health/catalog-ready" });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().catalog.modules, 72);
    assert.equal(response.json().catalog.gradebook_items, 44);
  });

  test("returns only enrolled courses and never exposes staff resources to students", async () => {
    const student = await registerStudent();
    const courses = await app.inject({
      method: "GET",
      url: "/v1/courses",
      headers: { origin, cookie: student.cookie },
    });
    assert.deepEqual(courses.json().data.map((course) => course.code), ["MHF4U"]);

    const modules = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/modules",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(modules.statusCode, 200);
    const resources = modules.json().data.flatMap((module) => module.resources);
    assert.equal(resources.some((resource) => resource.audience === "staff"), false);
    assert.equal(JSON.stringify(modules.json()).includes("Teacher answer key"), false);

    const assignments = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/assignments",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(assignments.statusCode, 200);
    assert.deepEqual(assignments.json().data.map((assignment) => assignment.id), [
      "mhf4u-m02-assignment",
      "mhf4u-m11-assignment",
    ]);

    const staffMaterialId = randomUUID();
    repository.materials.push({
      id: staffMaterialId,
      course_code: "MHF4U",
      unit_number: 1,
      category: "Resources",
      file_name: "Teacher Answer Key.pdf",
      mime_type: "application/pdf",
      size_bytes: 10,
      drive_modified_at: new Date().toISOString(),
      drive_file_id: "private-answer-key",
      audience: "staff",
    });
    const opened = await app.inject({
      method: "GET",
      url: `/v1/materials/${staffMaterialId}/open`,
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(opened.statusCode, 403);
    assert.equal(opened.json().error.code, "MATERIAL_ACCESS_DENIED");
  });

  test("enforces sequential module progress unless a teacher grants a reasoned override", async () => {
    const student = await registerStudent();
    const locked = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m01",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "in_progress" },
    });
    assert.equal(locked.statusCode, 409);
    assert.equal(locked.json().error.code, "MODULE_LOCKED");

    const activity = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { activityId: "mhf4u-m00-activity", status: "completed", evidence: { acknowledgement: true } },
    });
    assert.equal(activity.statusCode, 200);

    const orientation = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { moduleId: "mhf4u-m00", status: "completed" },
    });
    assert.equal(orientation.statusCode, 200);

    const started = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m01",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "in_progress" },
    });
    assert.equal(started.statusCode, 200);
    assert.equal(started.json().data.status, "in_progress");
  });

  test("treats teacher_admin as faculty and requires a non-empty override reason", async () => {
    const student = await registerStudent();
    const teacher = await addFaculty("teacher", ["MHF4U"]);
    const admin = await addFaculty("teacher_admin", allCourses);

    const adminCourses = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses",
      headers: { origin, cookie: admin.cookie },
    });
    assert.equal(adminCourses.statusCode, 200);
    assert.equal(adminCourses.json().data.length, 6);

    const teacherStudents = await app.inject({
      method: "GET",
      url: "/v1/teacher/students?courseCode=MHF4U",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(teacherStudents.statusCode, 200);
    assert.equal(teacherStudents.json().data[0].courseCode, "MHF4U");

    const missingReason = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: { origin, cookie: teacher.cookie, "x-csrf-token": teacher.csrf },
      payload: { reason: "" },
    });
    assert.equal(missingReason.statusCode, 422);

    const created = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: { origin, cookie: teacher.cookie, "x-csrf-token": teacher.csrf },
      payload: { reason: "Documented prerequisite accommodation" },
    });
    assert.equal(created.statusCode, 201);
    assert.equal(created.json().data.reason, "Documented prerequisite accommodation");

    const denied = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/SCH4U/roster",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(denied.statusCode, 403);

    const gradebook = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/MHF4U/gradebook",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(gradebook.statusCode, 200);
    assert.equal(gradebook.json().data.students[0].studentId, student.user.publicId);
  });

  test("returns the official student-by-module progress matrix only to authorized faculty", async () => {
    const student = await registerStudent();
    const teacher = await addFaculty("teacher", ["MHF4U"]);
    const admin = await addFaculty("teacher_admin", allCourses);

    const studentDenied = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/MHF4U/progress",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(studentDenied.statusCode, 403);
    assert.equal(studentDenied.json().error.code, "INSUFFICIENT_ROLE");

    const wrongCourse = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/SCH4U/progress",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(wrongCourse.statusCode, 403);
    assert.equal(wrongCourse.json().error.code, "COURSE_ACCESS_DENIED");

    const orientationActivity = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m00-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed", evidence: { acknowledgement: true } },
    });
    assert.equal(orientationActivity.statusCode, 200);
    const orientation = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m00",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(orientation.statusCode, 200);
    const started = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m01",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "in_progress" },
    });
    assert.equal(started.statusCode, 200);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const override = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: { origin, cookie: teacher.cookie, "x-csrf-token": teacher.csrf },
      payload: {
        reason: "Documented accelerated pathway for this module",
        expiresAt,
      },
    });
    assert.equal(override.statusCode, 201);
    repository.unlockOverrides.push({
      id: randomUUID(),
      studentUserId: student.user.id,
      studentId: student.user.publicId,
      moduleId: "mhf4u-m11",
      teacherUserId: teacher.user.id,
      reason: "Expired test override",
      expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      active: true,
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/MHF4U/progress",
      headers: { origin, cookie: teacher.cookie },
    });
    assert.equal(response.statusCode, 200);
    const matrix = response.json().data;
    assert.equal(matrix.courseCode, "MHF4U");
    assert.equal(matrix.students.length, 1);
    assert.deepEqual(
      matrix.students[0].modules.map((module) => [module.moduleNumber, module.status]),
      [[0, "completed"], [1, "in_progress"], [2, "available"], [11, "locked"]],
    );
    assert.equal(matrix.students[0].studentId, student.user.publicId);
    assert.equal(matrix.students[0].email, student.user.email);
    assert.equal(matrix.students[0].modules[0].completedAt !== null, true);
    assert.deepEqual(matrix.students[0].modules[2].override, {
      active: true,
      reason: "Documented accelerated pathway for this module",
      expiresAt,
    });
    assert.equal(matrix.students[0].modules[3].override, null);
    assert.equal(JSON.stringify(matrix).includes(student.user.id), false);
    assert.equal(JSON.stringify(matrix).includes(teacher.user.id), false);

    const adminResponse = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/MHF4U/progress",
      headers: { origin, cookie: admin.cookie },
    });
    assert.equal(adminResponse.statusCode, 200);
    assert.equal(adminResponse.json().data.students[0].studentId, student.user.publicId);
  });

  test("requires a published submission grade before completing weighted coursework", async () => {
    const student = await registerStudent();
    const teacher = await addFaculty("teacher");
    const override = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m02/unlock-overrides`,
      headers: { origin, cookie: teacher.cookie, "x-csrf-token": teacher.csrf },
      payload: { reason: "Approved accelerated progression" },
    });
    assert.equal(override.statusCode, 201);

    const unsubmitted = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m02-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(unsubmitted.statusCode, 409);
    assert.equal(unsubmitted.json().error.code, "ACTIVITY_GRADE_REQUIRED");

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
      idempotencyKey: "coursework-seed",
      requestFingerprint: "d".repeat(64),
    }, []);

    const ungraded = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m02-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(ungraded.statusCode, 409);
    assert.equal(ungraded.json().error.code, "ACTIVITY_GRADE_REQUIRED");

    const draft = await app.inject({
      method: "PUT",
      url: `/v1/grades/${submission.id}`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "coursework-grade-draft",
        "if-match": '"grade-v0"',
      },
      payload: {
        submissionId: submission.id,
        score: 84,
        feedback: "Draft assessment evidence",
        publish: false,
      },
    });
    assert.equal(draft.statusCode, 200, draft.body);

    const unpublished = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m02-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(unpublished.statusCode, 409);
    assert.equal(unpublished.json().error.code, "ACTIVITY_GRADE_REQUIRED");

    const published = await app.inject({
      method: "PUT",
      url: `/v1/grades/${submission.id}`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "coursework-grade-published",
        "if-match": '"grade-v1"',
      },
      payload: {
        submissionId: submission.id,
        score: 84,
        feedback: "Published assessment evidence",
        publish: true,
      },
    });
    assert.equal(published.statusCode, 200, published.body);

    const revisionDraft = await app.inject({
      method: "PUT",
      url: `/v1/grades/${submission.id}`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "coursework-grade-revision-draft",
        "if-match": '"grade-v2"',
      },
      payload: {
        submissionId: submission.id,
        score: 86,
        feedback: "Unpublished revision after the returned grade",
        publish: false,
      },
    });
    assert.equal(revisionDraft.statusCode, 200, revisionDraft.body);

    const completed = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m02-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(completed.statusCode, 200, completed.body);

    const moduleCompleted = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m02",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(moduleCompleted.statusCode, 200, moduleCompleted.body);
  });

  test("records direct exam and participation grades while students see only published versions", async () => {
    const student = await registerStudent();
    const teacher = await addFaculty("teacher");
    const examUrl = `/v1/teacher/courses/MHF4U/students/${student.user.publicId}/grades/mhf4u-m11-written-exam`;

    const unenrolled = await registerStudent("unenrolled@example.invalid");
    await repository.replaceEnrollments(unenrolled.user.id, []);
    const wrongRoster = await app.inject({
      method: "PUT",
      url: `/v1/teacher/courses/MHF4U/students/${unenrolled.user.publicId}/grades/mhf4u-m11-written-exam`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-wrong-roster-01",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 91, feedback: "Not enrolled", publish: true },
    });
    assert.equal(wrongRoster.statusCode, 404);
    assert.equal(wrongRoster.json().error.code, "STUDENT_GRADEBOOK_ITEM_NOT_FOUND");

    const courseworkDirect = await app.inject({
      method: "PUT",
      url: `/v1/teacher/courses/MHF4U/students/${student.user.publicId}/grades/mhf4u-m02-coursework`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-coursework-denied",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 91, feedback: "Must use submission grading", publish: true },
    });
    assert.equal(courseworkDirect.statusCode, 422);
    assert.equal(courseworkDirect.json().error.code, "DIRECT_GRADE_NOT_ALLOWED");

    const missingCsrf = await app.inject({
      method: "PUT",
      url: examUrl,
      headers: {
        origin,
        cookie: teacher.cookie,
        "idempotency-key": "direct-exam-missing-csrf",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 91, feedback: "Draft", publish: false },
    });
    assert.equal(missingCsrf.statusCode, 403);

    const draft = await app.inject({
      method: "PUT",
      url: examUrl,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-exam-draft-0001",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 91, feedback: "Draft examination result", publish: false },
    });
    assert.equal(draft.statusCode, 200, draft.body);
    assert.equal(draft.headers.etag, '"direct-grade-v1"');
    assert.equal(draft.json().data.publishedAt, null);

    const hidden = await app.inject({
      method: "GET",
      url: "/v1/me/grades?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(hidden.statusCode, 200);
    assert.deepEqual(hidden.json().data, []);

    const publishedExam = await app.inject({
      method: "PUT",
      url: examUrl,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-exam-publish-01",
        "if-match": '"direct-grade-v1"',
      },
      payload: { score: 93, feedback: "Published examination result", publish: true },
    });
    assert.equal(publishedExam.statusCode, 200, publishedExam.body);
    assert.equal(publishedExam.headers.etag, '"direct-grade-v2"');

    const revisionDraft = await app.inject({
      method: "PUT",
      url: examUrl,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-exam-revision-draft",
        "if-match": '"direct-grade-v2"',
      },
      payload: { score: 94, feedback: "Unpublished revision", publish: false },
    });
    assert.equal(revisionDraft.statusCode, 200, revisionDraft.body);
    assert.equal(revisionDraft.headers.etag, '"direct-grade-v3"');

    const publishedSurvivesDraft = await app.inject({
      method: "GET",
      url: "/v1/me/grades?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.deepEqual(
      publishedSurvivesDraft.json().data.map((grade) => [grade.score, grade.version]),
      [[93, 2]],
    );

    const examOverride = await app.inject({
      method: "POST",
      url: `/v1/teacher/students/${student.user.publicId}/modules/mhf4u-m11/unlock-overrides`,
      headers: { origin, cookie: teacher.cookie, "x-csrf-token": teacher.csrf },
      payload: { reason: "Approved final-evaluation access" },
    });
    assert.equal(examOverride.statusCode, 201, examOverride.body);
    const examCompleted = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/activities/mhf4u-m11-activity",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "completed" },
    });
    assert.equal(examCompleted.statusCode, 200, examCompleted.body);

    const participation = await app.inject({
      method: "PUT",
      url: `/v1/teacher/courses/MHF4U/students/${student.user.publicId}/grades/mhf4u-participation`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-participation-01",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 100, feedback: "Participation requirements met", publish: true },
    });
    assert.equal(participation.statusCode, 200, participation.body);

    const oralDefence = await app.inject({
      method: "PUT",
      url: `/v1/teacher/courses/MHF4U/students/${student.user.publicId}/grades/mhf4u-oral-defence`,
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
        "idempotency-key": "direct-oral-defence-01",
        "if-match": '"direct-grade-v0"',
      },
      payload: { score: 88, feedback: "Draft oral defence result", publish: false },
    });
    assert.equal(oralDefence.statusCode, 200, oralDefence.body);
    assert.equal(oralDefence.json().data.source, "direct");

    const visible = await app.inject({
      method: "GET",
      url: "/v1/me/grades?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(visible.statusCode, 200);
    assert.deepEqual(
      visible.json().data.map((grade) => [grade.gradebookItemId, grade.score, grade.source]),
      [
        ["mhf4u-m11-written-exam", 93, "direct"],
        ["mhf4u-participation", 100, "direct"],
      ],
    );

    const gradebook = await app.inject({
      method: "GET",
      url: "/v1/teacher/courses/MHF4U/gradebook",
      headers: { origin, cookie: teacher.cookie },
    });
    const scores = gradebook.json().data.students[0].scores;
    const examScore = scores.find((score) => score.itemId === "mhf4u-m11-written-exam");
    assert.equal(examScore.source, "direct");
    assert.equal(examScore.score, 94);
    assert.equal(examScore.version, 3);
    assert.equal(examScore.publishedAt, null);
    assert.deepEqual(
      {
        score: examScore.latestPublished.score,
        version: examScore.latestPublished.version,
        source: examScore.latestPublished.source,
      },
      { score: 93, version: 2, source: "direct" },
    );
    assert.equal(scores.find((score) => score.itemId === "mhf4u-participation").score, 100);
  });
});
