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
  let drive;

  beforeEach(async () => {
    const config = loadConfig({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test.invalid/lfa",
      ALLOWED_ORIGINS: origin,
      COOKIE_SECURE: "false",
      BCRYPT_COST: "10",
      CLAMAV_REQUIRED: "false",
      CURRICULUM_DRIVE_ROOT_ID: "canonical-root-test",
      SUBMISSION_TARGET_ROOT_ID: "submission-root",
    });
    repository = new FakeRepository();
    drive = new FakeDrive();
    app = await createApp({
      config,
      repository,
      drive,
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

  test("reports Drive catalog readiness separately without exposing file IDs", async () => {
    const ready = await app.inject({
      method: "GET",
      url: "/health/drive-catalog-ready",
    });
    assert.equal(ready.statusCode, 200, ready.body);
    assert.deepEqual(ready.json(), {
      status: "ready",
      driveCatalog: {
        verificationStatus: "verified",
        activeMaterialCount: 60,
        courseCount: 6,
        minimumCourseDistribution: true,
        lastSyncedAt: "2026-08-03T00:00:00.000Z",
        lastVerificationAt: "2026-08-03T00:00:00.000Z",
      },
    });
    assert.equal(JSON.stringify(ready.json()).includes("driveFileId"), false);
    assert.deepEqual(drive.curriculumReadyChecks, [{
      rootFolderId: "canonical-root-test",
      rootFolderName: "Lotus Academy Formal Course Pilots - Text Based",
    }]);

    repository.driveCatalogStats.active_material_count = 59;
    const incomplete = await app.inject({
      method: "GET",
      url: "/health/drive-catalog-ready",
    });
    assert.equal(incomplete.statusCode, 503);
    assert.equal(incomplete.json().error.code, "DRIVE_CATALOG_NOT_READY");
    assert.equal(incomplete.json().error.details.state, "catalog_incomplete");

    repository.driveCatalogStats.active_material_count = 60;
    repository.driveCatalogStats.verification_status = "pending";
    repository.driveCatalogStats.last_successful_sync_at = null;
    const pending = await app.inject({
      method: "GET",
      url: "/health/drive-catalog-ready",
    });
    assert.equal(pending.statusCode, 503);
    assert.equal(pending.json().error.details.state, "bootstrap_pending");

    drive.curriculumAvailable = false;
    const unreadable = await app.inject({
      method: "GET",
      url: "/health/drive-catalog-ready",
    });
    assert.equal(unreadable.statusCode, 503);
    assert.equal(unreadable.json().error.code, "CURRICULUM_DRIVE_UNAVAILABLE");
  });

  test("returns only enrolled courses and never exposes staff resources to students", async () => {
    const student = await registerStudent();
    const courses = await app.inject({
      method: "GET",
      url: "/v1/courses",
      headers: { origin, cookie: student.cookie },
    });
    assert.deepEqual(courses.json().data.map((course) => course.code), ["MHF4U"]);
    assert.deepEqual(courses.json().data[0].materials, {
      count: 1,
      lastSyncedAt: "2026-08-03T00:00:00.000Z",
      href: "/v1/courses/MHF4U/materials",
    });

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

  test("lists interactive course materials by stable module and enforces enrollment", async () => {
    const student = await registerStudent();
    const materials = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/materials?moduleId=mhf4u-m02&moduleNumber=2&category=Lessons",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(materials.statusCode, 200, materials.body);
    assert.equal(materials.json().data.length, 1);
    assert.deepEqual(materials.json().data[0], {
      id: repository.materials[0].id,
      courseCode: "MHF4U",
      moduleId: "mhf4u-m02",
      moduleNumber: 2,
      unitNumber: 2,
      category: "Lessons",
      name: "Quadratic models.pdf",
      mimeType: "application/pdf",
      sizeBytes: 42,
      driveModifiedAt: "2026-07-20T10:00:00.000Z",
      lastSyncedAt: "2026-08-03T00:00:00.000Z",
      openUrl: `/v1/materials/${repository.materials[0].id}/open`,
    });
    assert.equal(JSON.stringify(materials.json()).includes("drive-material-1"), false);

    const denied = await app.inject({
      method: "GET",
      url: "/v1/courses/SCH4U/materials",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(denied.statusCode, 403);
    assert.equal(denied.json().error.code, "COURSE_ACCESS_DENIED");
  });

  test("hides indexed materials whenever their source is not runtime-verified", async () => {
    const student = await registerStudent("source-gate@example.invalid");
    const source = repository.sources[0];
    const materialId = repository.materials[0].id;
    const cases = [
      { verificationStatus: "pending", lastSuccessfulSyncAt: "2026-08-03T00:00:00.000Z" },
      { verificationStatus: "failed", lastSuccessfulSyncAt: "2026-08-03T00:00:00.000Z" },
      { verificationStatus: "verified", lastSuccessfulSyncAt: null },
    ];

    for (const item of cases) {
      source.verification_status = item.verificationStatus;
      source.last_successful_sync_at = item.lastSuccessfulSyncAt;

      const courses = await app.inject({
        method: "GET",
        url: "/v1/courses",
        headers: { origin, cookie: student.cookie },
      });
      assert.equal(courses.statusCode, 200, courses.body);
      assert.equal(courses.json().data[0].materials.count, 0);
      assert.equal(courses.json().data[0].materials.lastSyncedAt, null);

      const listed = await app.inject({
        method: "GET",
        url: "/v1/courses/MHF4U/materials",
        headers: { origin, cookie: student.cookie },
      });
      assert.equal(listed.statusCode, 200, listed.body);
      assert.deepEqual(listed.json().data, []);

      const opened = await app.inject({
        method: "GET",
        url: `/v1/materials/${materialId}/open`,
        headers: { origin, cookie: student.cookie },
      });
      assert.equal(opened.statusCode, 404, opened.body);
      assert.equal(opened.json().error.code, "MATERIAL_NOT_FOUND");
    }
  });

  test("runs the canonical Drive sync through the stable admin-only endpoint", async () => {
    const teacher = await addFaculty("teacher", allCourses);
    const admin = await addFaculty("teacher_admin", allCourses);

    const denied = await app.inject({
      method: "POST",
      url: "/v1/admin/drive/sync",
      headers: {
        origin,
        cookie: teacher.cookie,
        "x-csrf-token": teacher.csrf,
      },
      payload: { mode: "incremental" },
    });
    assert.equal(denied.statusCode, 403);
    assert.equal(denied.json().error.code, "INSUFFICIENT_ROLE");

    const synced = await app.inject({
      method: "POST",
      url: "/v1/admin/drive/sync",
      headers: {
        origin,
        cookie: admin.cookie,
        "x-csrf-token": admin.csrf,
        "idempotency-key": "canonical-drive-sync-0001",
      },
      payload: { mode: "full" },
    });
    assert.equal(synced.statusCode, 200, synced.body);
    assert.equal(synced.json().data.status, "succeeded");
    assert.equal(synced.json().data.discoveredFileCount, 60);
    assert.match(synced.json().data.statusUrl, /^\/v1\/admin\/drive\/sync-runs\//);
    assert.equal(
      repository.syncRuns[0].source_id,
      "00000000-0000-4000-8000-000000000006",
    );
    assert.equal(repository.syncRuns[0].trigger_type, "manual");
    assert.equal(repository.syncRuns[0].requested_by, admin.user.id);
  });

  test("enforces sequential module progress unless a teacher grants a reasoned override", async () => {
    const student = await registerStudent();
    const courseStarted = await app.inject({
      method: "PUT",
      url: "/v1/me/progress/modules/mhf4u-m00",
      headers: { origin, cookie: student.cookie, "x-csrf-token": student.csrf },
      payload: { status: "in_progress" },
    });
    assert.equal(courseStarted.statusCode, 200);

    const afterStart = await app.inject({
      method: "GET",
      url: "/v1/me/progress?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(afterStart.statusCode, 200);
    assert.deepEqual(
      afterStart.json().data.slice(0, 2).map((module) => [module.moduleNumber, module.status]),
      [[0, "in_progress"], [1, "locked"]],
    );

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

  test("does not treat stored available or locked labels as module unlock authority", async () => {
    const student = await registerStudent();
    repository.moduleProgress.set(`${student.user.id}:mhf4u-m01`, {
      moduleId: "mhf4u-m01",
      status: "available",
      startedAt: null,
      completedAt: null,
    });
    repository.moduleProgress.set(`${student.user.id}:mhf4u-m02`, {
      moduleId: "mhf4u-m02",
      status: "locked",
      startedAt: null,
      completedAt: null,
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/me/progress?courseCode=MHF4U",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.json().data.slice(0, 3).map((module) => [module.moduleNumber, module.status]),
      [[0, "available"], [1, "locked"], [2, "locked"]],
    );
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
