import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import { PostgresRepository } from "../src/db/postgres.js";

const ownerUrl = process.env.INTERACTIVE_TEST_OWNER_URL;
test("a replacement keeps both written drafts and the return comment in its authorized section", {
  skip: !ownerUrl,
}, async () => {
  const db = new pg.Client({ connectionString: ownerUrl });
  await db.connect();
  const repo = new PostgresRepository(db);
  try {
    await db.query("BEGIN");
    const [student, classmate, teacher, otherSectionTeacher] = Array.from({ length: 4 }, randomUUID);
    for (const [index, id] of [student, classmate, teacher, otherSectionTeacher].entries()) {
      await db.query(`INSERT INTO app_users(id,public_id,email,password_hash,first_name,last_name,display_name,role)
        VALUES($1,$2,$3,'fixture','QA','Version','QA Version',$4)`, [id,id,id+"@example.invalid",index<2?"student":"teacher"]);
    }
    const {rows:[task]}=await db.query("SELECT id,course_code,title FROM assignments WHERE course_code='MCV4U' AND status='active' ORDER BY id LIMIT 1");
    for(const id of [teacher,otherSectionTeacher])await db.query("INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,$2)",[id,task.course_code]);
    await db.query("INSERT INTO course_test_members(user_id,course_code) VALUES($1,$2)",[otherSectionTeacher,task.course_code]);
    const ids=[randomUUID(),randomUUID()];
    for(const [i,id] of ids.entries())await db.query(`INSERT INTO student_submissions
      (id,student_user_id,student_id,student_display_name,course_code,unit_number,assignment_id,assignment_title,
       attempt_number,note,integrity_confirmed,idempotency_key,request_fingerprint,replaces_submission_id)
      VALUES($1::uuid,$2::uuid,$2::uuid::text,'QA Version',$3,1,$4,$5,$6,$7,true,$1::uuid::text,repeat('a',64),$8)`,
      [id,student,task.course_code,task.id,task.title,i+1,"Written draft "+(i+1),i?ids[0]:null]);
    await db.query(`INSERT INTO submission_messages(submission_id,author_user_id,author_role,message_type,body,idempotency_key,request_fingerprint)
      VALUES($1,$2,'teacher','revision_request','Explain your evidence.','history-fixture',repeat('b',64))`,[ids[0],teacher]);
    const read=(role,id)=>repo.listSubmissions({role,id},{courseCode:task.course_code,assignmentId:task.id,studentId:student});
    for(const [role,id] of [["student",student],["teacher",teacher]]){
      const [latest]=await read(role,id);
      assert.deepEqual(latest.historyRecords.map(row=>row.id),ids);
      assert.deepEqual(latest.historyRecords.map(row=>row.note),["Written draft 1","Written draft 2"]);
      assert.equal(latest.historyRecords[0].messages[0].body,"Explain your evidence.");
      assert.equal(latest.historyRecords[1].messages.length,0);
    }
    assert.equal((await read("student",classmate)).length,0);
    assert.equal((await read("teacher",otherSectionTeacher)).length,0);
  } finally {
    await db.query("ROLLBACK");await db.end();
  }
});
