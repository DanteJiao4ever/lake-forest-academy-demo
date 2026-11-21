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
