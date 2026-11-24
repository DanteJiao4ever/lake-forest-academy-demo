import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { PostgresRepository } from "../src/db/postgres.js";

const dbUrl = process.env.INTERACTIVE_TEST_OWNER_URL;
test("an unweighted assignment exposes the latest attempt's published feedback only in the teacher's section", {
  skip: !dbUrl,
}, async () => {
  const client = new pg.Client({connectionString: dbUrl});
  await client.connect();
  const code = "QA" + randomUUID().slice(0,8).toUpperCase();
  const assignment = code + "-analysis";
  const teacher = randomUUID(), regular = randomUUID(), pilot = randomUUID();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO courses(code,title) VALUES($1,'Test course')",[code]);
    await client.query("INSERT INTO assignments(id,course_code,unit_number,title) VALUES($1,$2,1,'Case analysis')",[assignment,code]);
    for (const [id,role] of [[regular,"student"],[pilot,"student"],[teacher,"teacher"]]) {
      await client.query(`INSERT INTO app_users(id,public_id,email,password_hash,first_name,last_name,display_name,role)
        VALUES($1,$1::uuid::text,$2,'fixture','Test','User','Test User',$3)`,[id,id+"@example.invalid",role]);
    }
    await client.query("INSERT INTO teacher_course_access VALUES ($1,$2)",[teacher,code]);
    await client.query("INSERT INTO course_enrollments(student_user_id,course_code) VALUES ($1,$3),($2,$3)",[regular,pilot,code]);
    await client.query("INSERT INTO course_test_members(course_code,user_id) VALUES ($1,$2)",[code,pilot]);
    async function submit(student,attempt) {
      const id=randomUUID();
      await client.query(`INSERT INTO student_submissions(id,student_user_id,student_id,student_display_name,course_code,unit_number,
        assignment_id,assignment_title,attempt_number,integrity_confirmed,idempotency_key,request_fingerprint)
        VALUES($1,$2,$2::uuid::text,'Test User',$3,1,$4,'Case analysis',$5,true,$1::uuid::text,repeat('a',64))`,[id,student,code,assignment,attempt]);
      return id;
    }
    async function grade(id,version,score,feedback,released) {
      await client.query("UPDATE submission_grades SET is_current=false WHERE submission_id=$1",[id]);
      await client.query(`INSERT INTO submission_grades(submission_id,version,score,feedback,graded_by_user_id,graded_by,
        idempotency_key,request_fingerprint,published_at) VALUES($1,$2,$3,$4,$5,'Faculty',$6,repeat('a',64),CASE WHEN $7 THEN now() END)`,
      [id,version,score,feedback,teacher,randomUUID(),released]);
    }
    await grade(await submit(pilot,1),1,77,"Other section",true);
    await grade(await submit(regular,1),1,70,"Previous attempt",true);
    const second=await submit(regular,2);
    await grade(second,1,85,"Supported with evidence",true);
    await grade(second,2,95,"Unreleased draft",false);

    await client.query("SET LOCAL ROLE lfa_app_runtime");
    const book=await new PostgresRepository(client).listCourseGradebook(code,teacher);
    assert.deepEqual(book.items,[]);
    assert.deepEqual(book.students.map(s=>s.studentId),[regular]);
    const [student]=book.students;
    assert.deepEqual(student.scores,[]);
    assert.equal(student.assignmentResults.length,1);
    const {publishedAt,...result}=student.assignmentResults[0];
    assert.ok(publishedAt);
    assert.deepEqual(result,{assignmentId:assignment,assignmentTitle:"Case analysis",submissionId:second,attemptNumber:2,
      score:85,feedback:"Supported with evidence",version:1});
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});
