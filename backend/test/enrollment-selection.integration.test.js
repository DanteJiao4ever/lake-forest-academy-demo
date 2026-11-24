import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import { PostgresRepository } from "../src/db/postgres.js";

const ownerUrl = process.env.INTERACTIVE_TEST_OWNER_URL;
const runtimeUrl = process.env.INTERACTIVE_TEST_RUNTIME_URL;
test("only school-verified students can elect newly published courses and old forms preserve them", {
  skip: !(ownerUrl && runtimeUrl),
}, async () => {
  const owner = new pg.Client({ connectionString: ownerUrl });
  await owner.connect();
  const repo = new PostgresRepository(new pg.Pool({ connectionString: runtimeUrl }));
  const student = randomUUID();
  const code = "BEP2O";
  let addedCourse = false;
  try {
    // The public CI database omits the private curriculum payload.
    const added = await owner.query(
      "INSERT INTO courses(code,title,status) VALUES ($1,'CI course','active') ON CONFLICT DO NOTHING", [code],
    );
    addedCourse = added.rowCount === 1;
    await owner.query(`INSERT INTO app_users(id,public_id,email,password_hash,first_name,last_name,display_name)
      VALUES ($1,$2,$3,'disabled','QA','Learner','QA Learner')`, [student, student, student + "@example.invalid"]);
    await assert.rejects(repo.saveCourseSelection(student, [code], 2), { code: "ENROLLMENT_NOT_AVAILABLE" });
    await assert.rejects(repo.pool.query("INSERT INTO formal_student_roster(student_user_id) VALUES ($1)", [student]), { code: "42501" });
    await owner.query("INSERT INTO formal_student_roster(student_user_id) VALUES ($1)", [student]);
    assert.ok((await repo.selectableCourses(student)).includes(code));
    await repo.saveCourseSelection(student, [code], 2);
    await assert.rejects(repo.saveCourseSelection(student, [], 2, []), { code: "ENROLLMENTS_CHANGED" });
    const saved = await owner.query("SELECT * FROM course_enrollments WHERE student_user_id=$1", [student]);
    await repo.saveCourseSelection(student, [code], 2);
    await repo.saveCourseSelection(student, []);
    assert.deepEqual((await owner.query("SELECT * FROM course_enrollments WHERE student_user_id=$1", [student])).rows, saved.rows);
    await owner.query("UPDATE course_enrollments SET status='completed' WHERE student_user_id=$1", [student]);
    await assert.rejects(repo.saveCourseSelection(student, [code], 2), { code: "COURSE_COMPLETED" });
    await repo.saveCourseSelection(student, [], 2);
    assert.equal((await owner.query("SELECT status FROM course_enrollments WHERE student_user_id=$1", [student])).rows[0].status, "completed");
  } finally {
    await owner.query("DELETE FROM app_users WHERE id=$1", [student]);
    if (addedCourse) await owner.query("DELETE FROM courses WHERE code=$1", [code]);
    await repo.close();
    await owner.end();
  }
});
