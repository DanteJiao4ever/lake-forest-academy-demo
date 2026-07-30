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

function cookieFrom(response) {
  return String(response.headers["set-cookie"]).split(";")[0];
}

function multipartPayload(fields, file) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  form.append("files", file.buffer, {
    filename: file.name,
    contentType: file.type,
  });
  return {
    payload: form.getBuffer(),
    headers: {
      ...form.getHeaders(),
      "content-length": form.getLengthSync(),
    },
  };
}

describe("Final Evaluation submission classification", () => {
  let app;
  let repository;
  let drive;

  beforeEach(async () => {
    repository = new FakeRepository();
    drive = new FakeDrive();
    app = await createApp({
      config: loadConfig({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://test.invalid/lfa",
        ALLOWED_ORIGINS: origin,
        COOKIE_SECURE: "false",
        BCRYPT_COST: "10",
        CLAMAV_REQUIRED: "false",
        SUBMISSION_TARGET_ROOT_ID: "1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK",
      }),
      repository,
      drive,
      scanner: new FakeScanner(),
    });
  });

  afterEach(async () => {
    await app.close();
  });

  async function registerStudent() {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { origin },
      payload: {
        firstName: "Avery",
        lastName: "Chen",
        email: "avery.final@example.com",
        password: "StrongPass2026!",
        confirmPassword: "StrongPass2026!",
        portal: "student",
      },
    });
    assert.equal(response.statusCode, 201, response.body);
    return {
      body: response.json(),
      cookie: cookieFrom(response),
      user: repository.users.at(-1),
    };
  }

  async function loginTeacher() {
    const password = `Test-${randomBytes(12).toString("base64url")}aA1!`;
    const teacher = await repository.createUser({
      publicId: publicId("teacher"),
      email: "james.final@example.invalid",
      passwordHash: await hashPassword(password, 10),
      firstName: "James",
      lastName: "Whitmore",
      displayName: "James Whitmore",
      role: "teacher",
    });
    await repository.setTeacherCourses(teacher.id, ["MHF4U"]);
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: {
        email: teacher.email,
        password,
        portal: "faculty",
      },
    });
    assert.equal(response.statusCode, 200, response.body);
    return { cookie: cookieFrom(response), teacher };
  }

  test("uses an explicit Final Evaluation API section, Drive folder, and teacher bucket", async () => {
    const student = await registerStudent();
    await repository.replaceEnrollments(student.user.id, ["MHF4U"]);

    const assignmentId = "mhf4u-m11-capstone-assignment";
    repository.assignments.set(assignmentId, {
      id: assignmentId,
      courseCode: "MHF4U",
      moduleId: "mhf4u-m11",
      moduleNumber: 11,
      // Kept only because the legacy database columns remain NOT NULL.
      unitNumber: 11,
      curriculumUnitNumber: null,
      sectionKind: "final_evaluation",
      sectionLabel: "Final Evaluation",
      title: "MHF4U Culminating Performance",
      instructions: "Submit the authenticated culminating performance.",
      rubric: [],
      weightPercent: 10,
      submissionMode: "project",
      availableFrom: null,
      dueAt: null,
      availableUntil: null,
      maxAttempts: 99,
      status: "active",
    });
    repository.unlockOverrides.push({
      id: "final-evaluation-override",
      studentUserId: student.user.id,
      moduleId: "mhf4u-m11",
      teacherUserId: "teacher-fixture",
      reason: "Final evaluation readiness confirmed",
      expiresAt: null,
      active: true,
    });

    const assignments = await app.inject({
      method: "GET",
      url: "/v1/courses/MHF4U/assignments",
      headers: { origin, cookie: student.cookie },
    });
    assert.equal(assignments.statusCode, 200, assignments.body);
    const finalAssignment = assignments
      .json()
      .data.find((item) => item.id === assignmentId);
    assert.deepEqual(
      {
        unitNumber: finalAssignment.unitNumber,
        curriculumUnitNumber: finalAssignment.curriculumUnitNumber,
        sectionKind: finalAssignment.sectionKind,
        sectionLabel: finalAssignment.sectionLabel,
      },
      {
        unitNumber: 11,
        curriculumUnitNumber: null,
        sectionKind: "final_evaluation",
        sectionLabel: "Final Evaluation",
      },
    );

    const form = multipartPayload(
      {
        courseCode: "MHF4U",
        // A stale client value must not control either storage classification or Drive paths.
        unitNumber: 4,
        assignmentId,
        assignmentTitle: "MHF4U Culminating Performance",
        attemptNumber: 1,
        note: "Authenticated culminating evidence",
        integrityConfirmed: "true",
      },
      {
        name: "culminating-performance.pdf",
        type: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF"),
      },
    );
    const submitted = await app.inject({
      method: "POST",
      url: "/v1/submissions",
      headers: {
        origin,
        cookie: student.cookie,
        "x-csrf-token": student.body.csrfToken,
        "idempotency-key": "final-evaluation-submit-0001",
        ...form.headers,
      },
      payload: form.payload,
    });
    assert.equal(submitted.statusCode, 201, submitted.body);
    assert.deepEqual(
      {
        unitNumber: submitted.json().data.unitNumber,
        curriculumUnitNumber: submitted.json().data.curriculumUnitNumber,
        sectionKind: submitted.json().data.sectionKind,
        sectionLabel: submitted.json().data.sectionLabel,
        unit: submitted.json().data.unit,
      },
      {
        unitNumber: 11,
        curriculumUnitNumber: null,
        sectionKind: "final_evaluation",
        sectionLabel: "Final Evaluation",
        unit: "Final Evaluation",
      },
    );
    assert.deepEqual(drive.uploads[0].pathSegments, [
      "MHF4U",
      student.user.publicId,
      "Final Evaluation",
      assignmentId,
      "Attempt 1",
    ]);
    assert.equal(drive.uploads[0].pathSegments.includes("Unit 11"), false);
    assert.equal(repository.submissions[0].unitNumber, 11);
    assert.equal(repository.submissions[0].sectionKind, "final_evaluation");

    const faculty = await loginTeacher();
    const teacherQueue = await app.inject({
      method: "GET",
      url: "/v1/submissions?scope=teacher&courseCode=MHF4U",
      headers: { origin, cookie: faculty.cookie },
    });
    assert.equal(teacherQueue.statusCode, 200, teacherQueue.body);
    const course = teacherQueue
      .json()
      .data.find((item) => item.courseCode === "MHF4U");
    const teacherStudent = course.students.find(
      (item) => item.studentId === student.user.publicId,
    );
    const finalBucket = teacherStudent.units.find(
      (item) => item.sectionKind === "final_evaluation",
    );
    assert.deepEqual(
      {
        unitNumber: finalBucket.unitNumber,
        curriculumUnitNumber: finalBucket.curriculumUnitNumber,
        sectionLabel: finalBucket.sectionLabel,
      },
      {
        unitNumber: 11,
        curriculumUnitNumber: null,
        sectionLabel: "Final Evaluation",
      },
    );
    assert.equal(finalBucket.submissions[0].unit, "Final Evaluation");
    assert.equal(
      teacherStudent.units.some((item) => item.sectionLabel === "Unit 11"),
      false,
    );
  });
});
