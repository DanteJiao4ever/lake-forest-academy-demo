import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { csrfTokenFor, sha256 } from "../src/lib/crypto.js";
import { PostgresRepository, createPool } from "../src/db/postgres.js";
import { FakeRepository, FakeDrive, FakeScanner } from "./fakes.js";

const origin = "http://127.0.0.1:5173";

test("only faculty can publish, and every selected course must be accessible", async (t) => {
  const repository = new FakeRepository();
  const writes = [];
  repository.publishCourseAnnouncement = async (record) => { writes.push(record); return true; };
  let viewed;
  repository.listCourseAnnouncements = async (codes) => { viewed = codes; return []; };
  const config = loadConfig({
    NODE_ENV: "test", DATABASE_URL: "postgresql://test.invalid/lfa",
    ALLOWED_ORIGINS: origin, COOKIE_SECURE: "false", CLAMAV_REQUIRED: "false",
  });
  const app = await createApp({ config, repository, drive: new FakeDrive(), scanner: new FakeScanner() });
  t.after(() => app.close());

  async function session(role, courses) {
    const user = await repository.createUser({ role });
    if (role === "student") await repository.replaceEnrollments(user.id, courses);
    else await repository.setTeacherCourses(user.id, courses);
    const token = randomUUID();
    const id = randomUUID();
    const csrf = csrfTokenFor(id, config.csrfSecret);
    await repository.createSession({ id, userId: user.id, tokenHash: sha256(token),
      csrfTokenHash: sha256(csrf), expiresAt: new Date(Date.now() + 60000) });
    return { user, headers: { origin, cookie: config.cookieName + "=" + token, "x-csrf-token": csrf } };
  }

  const teacher = await session("teacher", ["SCH4U", "MHF4U"]);
  const student = await session("student", ["MHF4U"]);
  const url = "/v1/announcements";
  const payload = { publicationId: randomUUID(), title: "Lab timetable", body: "Meet at 10.",
    courseCodes: ["sch4u", "MHF4U", "SCH4U"] };
  const post = (headers, overrides) => app.inject({ method: "POST", url, headers, payload: { ...payload, ...overrides } });
  assert.equal((await post(student.headers)).statusCode, 403);
  assert.equal((await post({ ...teacher.headers, "x-csrf-token": "" })).statusCode, 403);
  assert.equal((await post(teacher.headers, { courseCodes: ["MHF4U", "ICS4U"] })).statusCode, 403);
  assert.equal((await post(teacher.headers, { authorUserId: student.user.id })).statusCode, 422);
  assert.deepEqual(writes, []);
  assert.equal((await post(teacher.headers)).statusCode, 201);
  assert.equal(writes[0].authorUserId, teacher.user.id);
  assert.deepEqual(writes[0].courseCodes, ["MHF4U", "SCH4U"]);
  assert.equal((await app.inject({ method: "GET", url })).statusCode, 401);
  assert.equal((await app.inject({ method: "GET", url, headers: student.headers })).statusCode, 200);
  assert.deepEqual(viewed, ["MHF4U"]);
});

test("multi-course announcements commit atomically, retry once, and show only matching courses",
  { skip: !process.env.RUNTIME_DATABASE_URL }, async (t) => {
    const pool = createPool({ databaseUrl: process.env.RUNTIME_DATABASE_URL, databasePoolMax: 2, databaseSsl: false });
    t.after(() => pool.end());
    const repository = new PostgresRepository(pool);
    const publicationId = randomUUID();
    const teacher = await repository.createUser({
      publicId: "faculty-" + publicationId, email: publicationId + "@example.invalid",
      passwordHash: "test-only-unused-hash", firstName: "Test", lastName: "Teacher", displayName: "Test Teacher", role: "teacher",
    });
    const record = { publicationId, authorUserId: teacher.id, title: "New schedule", body: "Bring a notebook.",
      courseCodes: ["ICS4U", "MHF4U"] };
    const results = await Promise.all([repository.publishCourseAnnouncement(record), repository.publishCourseAnnouncement(record)]);
    assert.deepEqual(results.sort(), [false, true]);
    const forOneCourse = (await repository.listCourseAnnouncements(["ICS4U"])).find((item) => item.id === publicationId);
    assert.deepEqual(forOneCourse.courseCodes, ["ICS4U"]);
    assert.equal(forOneCourse.authorName, "Test Teacher");
    const forBoth = (await repository.listCourseAnnouncements(record.courseCodes)).filter((item) => item.id === publicationId);
    assert.equal(forBoth.length, 1);
    assert.deepEqual(forBoth[0].courseCodes, record.courseCodes);
    assert.equal((await repository.listCourseAnnouncements(["SPH4U"])).some((item) => item.id === publicationId), false);
    await assert.rejects(repository.publishCourseAnnouncement({ ...record, body: "Changed" }), { code: "ANNOUNCEMENT_CONFLICT" });
    const invalidId = randomUUID();
    await assert.rejects(repository.publishCourseAnnouncement({ ...record, publicationId: invalidId, courseCodes: ["ICS4U", "UNKNOWN"] }));
    const orphan = await pool.query("SELECT id FROM course_announcements WHERE id = $1", [invalidId]);
    assert.equal(orphan.rowCount, 0);
  });

test("the announcement board passes the authenticated viewer to the section filter", async (t) => {
  const repository = new FakeRepository();
  const student = await repository.createUser({ role: "student" });
  await repository.replaceEnrollments(student.id, ["MCV4U"]);
  let viewer;
  repository.listCourseAnnouncements = async (_courses, viewerId) => {
    viewer = viewerId;
    return [];
  };
  repository.listTestSections = async () => [];
  const config = loadConfig({ NODE_ENV: "test", ALLOWED_ORIGINS: origin });
  const app = await createApp({ config, repository, drive: new FakeDrive(), scanner: new FakeScanner() });
  t.after(() => app.close());
  const token = randomUUID();
  const id = randomUUID();
  await repository.createSession({ id, userId: student.id, tokenHash: sha256(token),
    csrfTokenHash: sha256(csrfTokenFor(id, config.csrfSecret)), expiresAt: new Date(Date.now() + 60000) });
  const response = await app.inject({ method: "GET", url: "/v1/announcements",
    headers: { cookie: config.cookieName + "=" + token } });
  assert.equal(response.statusCode, 200);
  assert.equal(viewer, student.id);
});

test("the regular and test section keep separate boards, rosters and progress within one course",
  { skip: !process.env.SECTION_SETUP_DATABASE_URL || !process.env.RUNTIME_DATABASE_URL }, async (t) => {
    const pool = createPool({ databaseUrl: process.env.RUNTIME_DATABASE_URL, databaseSsl: false });
    const setup = createPool({ databaseUrl: process.env.SECTION_SETUP_DATABASE_URL, databaseSsl: false });
    t.after(async () => { await pool.end(); await setup.end(); });
    const repo = new PostgresRepository(pool);
    const provision = new PostgresRepository(setup);
    const course = "MCV4U";
    async function member(role, isTest) {
      const id = randomUUID();
      const data = { publicId: id, email: id + "@example.invalid", passwordHash: "unused", role,
        firstName: "Section", lastName: "Fixture", displayName: "Section Fixture" };
      const user = role === "teacher" ? await provision.createFacultyWithCourses(data, [course])
        : await repo.createStudentWithEnrollments(data, [course]);
      if (isTest) await setup.query("INSERT INTO course_test_members VALUES ($1,$2)", [course, user.id]);
      return user;
    }
    const regular = await member("student", false);
    const student = await member("student", true);
    const teacher = await member("teacher", true);
    const regularTeacher = await member("teacher", false);
    const publish = async (author) => {
      const id = randomUUID();
      await repo.publishCourseAnnouncement({ publicationId: id, authorUserId: author.id, courseCodes: [course],
        title: "Announcement", body: "Section fixture" });
      return id;
    };
    const regularNotice = await publish(regularTeacher);
    const testNotice = await publish(teacher);
    await repo.replaceEnrollments(student.id, []);
    await repo.replaceEnrollments(student.id, [course]);
    for (const [viewer, visible, hidden] of [[regular, regularNotice, testNotice], [student, testNotice, regularNotice]]) {
      const ids = (await repo.listCourseAnnouncements([course], viewer.id)).map((n) => n.id);
      assert.ok(ids.includes(visible));
      assert.ok(!ids.includes(hidden));
    }
    for (const [faculty, visible, hidden] of [[teacher, student, regular], [regularTeacher, regular, student]]) {
      for (const view of [await repo.listCourseRoster(course, faculty.id),
        (await repo.listCourseProgress(course, faculty.id)).students,
        (await repo.listCourseGradebook(course, faculty.id)).students]) {
        assert.ok(view.some((entry) => entry.studentId === visible.publicId));
        assert.ok(!view.some((entry) => entry.studentId === hidden.publicId));
      }
      assert.equal(await repo.canAccessCourse(faculty, course, hidden.id), false);
      assert.equal(await repo.canAccessCourse(faculty, course, visible.id), true);
    }
  });

test("a regular MCV4U enrolment cannot read an existing test announcement",
  { skip: !process.env.RUNTIME_DATABASE_URL }, async (t) => {
    const pool = createPool({ databaseUrl: process.env.RUNTIME_DATABASE_URL, databaseSsl: false });
    t.after(() => pool.end());
    const repo = new PostgresRepository(pool);
    const id = randomUUID();
    const learner = await repo.createStudentWithEnrollments({ publicId: "student-" + id,
      email: id + "@example.invalid", firstName: "Course", lastName: "Fixture",
      displayName: "Course Fixture", passwordHash: "fixture" }, ["MCV4U"]);
    const author = await repo.createUser({ publicId: "teacher-" + id,
      email: "teacher-" + id + "@example.invalid", firstName: "Test", lastName: "Teacher",
      displayName: "Test Teacher", role: "teacher", passwordHash: "fixture" });
    await pool.query(`WITH inserted AS (
      INSERT INTO course_announcements (id, author_user_id, title, body)
      VALUES ($1,$2,'Test','Fixture') RETURNING id
    ) INSERT INTO course_announcement_targets (announcement_id, course_code, test_section)
      SELECT id,'MCV4U',true FROM inserted`, [id, author.id]);
    const page = await repo.listCourseAnnouncements(["MCV4U"], learner.id);
    assert.equal(page.some((item) => item.id === id), false);
    await assert.rejects(pool.query("INSERT INTO course_test_members VALUES ('MCV4U',$1)", [learner.id]),
      { code: "42501" });
  });
