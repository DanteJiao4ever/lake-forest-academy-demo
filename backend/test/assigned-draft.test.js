import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import pg from "pg";
import { PostgresRepository } from "../src/db/postgres.js";
import { loadCoursePack } from "../src/services/course-packs.js";

const sha = value => createHash("sha256").update(value).digest("hex");

test("reading a pinned worksheet and marking reference verifies their independent digests", async t => {
  const root = await mkdtemp(path.join(tmpdir(), "lfa-pinned-book-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dir = path.join(root, "packs/MDM4U/1.0.0");
  const marking = path.join(root, "marking/MDM4U");
  await mkdir(dir, { recursive: true });
  await mkdir(marking, { recursive: true });
  const worksheet = { path: "worksheet.txt", sha256: sha("worksheet") };
  const form = JSON.stringify({ code: "MDM4U", version: "1.0.0", markingSha256: sha("{}"),
    policy: { version_lock: true }, units: [{ worksheet }] });
  const pin = { version: "1.0.0", sha256: sha(form) };
  await writeFile(path.join(dir, "manifest.json"), form);
  await writeFile(path.join(marking, "1.0.0.json"), "{}");
  await writeFile(path.join(dir, worksheet.path), "worksheet");
  const pack = await loadCoursePack("MDM4U", pin, root);
  assert.equal((await pack.worksheet(pack.manifest.units[0])).toString(), "worksheet");
  await writeFile(path.join(dir, worksheet.path), "unapproved worksheet");
  await assert.rejects(pack.worksheet(pack.manifest.units[0]), { code: "PACK_UNAVAILABLE" });
  await writeFile(path.join(marking, "1.0.0.json"), "{ }");
  await assert.rejects(loadCoursePack("MDM4U", pin, root), { code: "PACK_UNAVAILABLE" });
});

test("only the assigned learner sees the archived class while its test rollout is open", {
  skip: !process.env.INTERACTIVE_TEST_OWNER_URL,
}, async () => {
  const db = new pg.Client({ connectionString: process.env.INTERACTIVE_TEST_OWNER_URL });
  await db.connect();
  try {
    await db.query("BEGIN");
    const repo = new PostgresRepository(db);
    const student = { id: randomUUID(), role: "student" };
    const control = { id: randomUUID(), role: "student" };
    for (const { id } of [student, control]) {
      await db.query(`INSERT INTO app_users(id,public_id,email,password_hash,first_name,last_name,display_name)
        VALUES ($1,$2,$3,'fixture','QA','Learner','QA Learner')`, [id, id, id+"@example.invalid"]);
    }
    await db.query(`INSERT INTO courses(code,title,status) VALUES ('MDM4U','QA course','archived')
      ON CONFLICT (code) DO NOTHING`);
    await db.query("INSERT INTO course_test_members(course_code,user_id) VALUES ('MDM4U',$1)", [student.id]);
    await db.query(`INSERT INTO classroom_section_rollouts(course_code,test_section,enabled)
      VALUES ('MDM4U',true,true) ON CONFLICT(course_code,test_section) DO UPDATE SET enabled=true`);
    assert.equal(await repo.canAccessCourse(student, "MDM4U"), true);
    assert.equal(await repo.canAccessCourse(control, "MDM4U"), false);
    assert.deepEqual((await repo.listCoursesForUser(student)).map(c => [c.code,c.status]), [["MDM4U","active"]]);
    assert.deepEqual(await repo.listCoursesForUser(control), []);
    assert.equal((await db.query("SELECT status FROM courses WHERE code='MDM4U'")).rows[0].status, "archived");
    assert.equal((await db.query("SELECT 1 FROM course_enrollments WHERE student_user_id=$1",[student.id])).rowCount, 0);
    await db.query("UPDATE classroom_section_rollouts SET enabled=false WHERE course_code='MDM4U' AND test_section");
    assert.equal(await repo.canAccessCourse(student, "MDM4U"), false);
    assert.deepEqual(await repo.listCoursesForUser(student), []);
  } finally {
    await db.query("ROLLBACK");
    await db.end();
  }
});
