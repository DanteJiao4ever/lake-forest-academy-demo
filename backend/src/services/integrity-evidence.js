import { requireClassroomRollout } from "./classroom-rollout.js";
import { z } from "zod";
import { ApiError } from "../lib/errors.js";
import { parse, courseCodeSchema } from "../lib/validation.js";
import { platformLearningTime } from "./learning-time.js";

const policyVersion = "integrity-v1";
const pledge = "I will submit my own reasoning, identify my sources and assistance, and keep the evidence my teacher requests. If I am unsure what help is allowed, I will ask before submitting.";
const questions = [
  {id:"sources",text:"You use a graph from an article. What should you do?",options:["Credit the source and explain your use.","Remove the author's name.","Present it as original data."],answer:0},
  {id:"revision",text:"A tool suggests an argument you do not understand. What is the next step?",options:["Paste it unchanged.","Ask what assistance is allowed and develop an explanation you can defend.","Replace a few words."],answer:1},
  {id:"evidence",text:"Which record best explains how your solution developed?",options:["Only the final mark.","A list of unrelated websites.","Your dated drafts, calculations and explanation of revisions."],answer:2},
];
const answers = z.object({sources:z.int().min(0).max(2),revision:z.int().min(0).max(2),evidence:z.int().min(0).max(2)}).strict();
const action = z.discriminatedUnion("type",[
  z.object({type:z.literal("enable")}).strict(),
  z.object({type:z.literal("sign"),version:z.literal(policyVersion),accepted:z.literal(true)}).strict(),
  z.object({type:z.literal("quiz"),version:z.literal(policyVersion),answers}).strict(),
  z.object({type:z.literal("evidence"),requestId:z.uuid(),studentId:z.string().min(1).max(120),date:z.iso.date(),minutes:z.int().min(1).max(1440),description:z.string().trim().min(4).max(1000)}).strict(),
]);
const fail=(status,code,message)=>{throw new ApiError(status,code,message);};
async function subject(db, actor, course, publicId) {
  const {rows:[student]}=await db.query(`SELECT u.id,u.public_id AS "publicId",u.display_name AS name,
    in_course_test_section(e.course_code,u.id) AS section FROM course_enrollments e JOIN app_users u ON u.id=e.student_user_id
    WHERE e.course_code=$1 AND e.status IN ('active','completed') AND u.role='student' AND
    (u.public_id=$2 OR ($2 IS NULL AND u.id=$3)) AND in_course_test_section(e.course_code,u.id)=in_course_test_section(e.course_code,$3)`,
    [course,publicId||null,actor.id]);
  if(!student || (actor.role==="student" && student.id!==actor.id))fail(404,"LEARNER_NOT_FOUND","No matching student in this course section.");
  return student;
}
async function policyState(db,user,course) {
  const {rows:[row]}=await db.query(`SELECT p.policy_version,p.effective_at,
    NOT integrity_allows($2,$1) AS required,a.signed_at,a.passed_at,a.attempts,
    e.enrolled_at>=p.effective_at AS applies
    FROM course_integrity_rollouts p LEFT JOIN course_enrollments e ON e.course_code=p.course_code AND e.student_user_id=$2 AND e.status='active'
    LEFT JOIN course_integrity_attempts a ON a.course_code=p.course_code AND a.student_id=$2 AND a.test_section=p.test_section AND a.policy_version=p.policy_version
    WHERE p.course_code=$1 AND p.test_section=in_course_test_section($1,$2)`,[course,user.id]);
  return {version:policyVersion,pledge,questions:questions.map(({answer,...q})=>q),enabled:Boolean(row),effectiveAt:row?.effective_at,
    applies:Boolean(row?.applies),required:Boolean(row?.required),signedAt:row?.signed_at,passedAt:row?.passed_at,attempts:row?.attempts||0};
}
async function evidenceReport(db,actor,course,student) {
  const params=[course,student.id,student.section];
  const {plannedHours,observedSeconds}=await platformLearningTime(db,...params);
  const {rows:verified}=await db.query(`SELECT r.activity_date::text AS date,r.minutes,r.description,u.display_name AS "recordedBy",r.recorded_at AS "recordedAt"
    FROM course_evidence_records r JOIN app_users u ON u.id=r.teacher_id WHERE course_code=$1 AND student_id=$2 AND test_section=$3 ORDER BY activity_date,recorded_at`,params);
  const {rows:[events]}=await db.query(`WITH native AS (SELECT r.id,r.cards FROM interactive_lesson_readers r JOIN interactive_lesson_bindings b USING(course_code,lesson_id)
    WHERE r.course_code=$1 AND r.user_id=$2 AND r.test_section=$3 AND b.native_lesson_id IS NOT NULL)
    SELECT (SELECT count(*)::int FROM interactive_lesson_notes n JOIN native ON n.reader_id=native.id) AS annotations,
    (SELECT count(*)::int FROM interactive_lesson_threads t JOIN native ON t.reader_id=native.id) AS questions,
    (SELECT count(*)::int FROM interactive_lesson_replies t JOIN native ON t.reader_id=native.id) AS replies,
    (SELECT coalesce(sum((c.value->>'attempts')::int),0)::int FROM native, LATERAL jsonb_each(cards) c) AS "cardAttempts",
    (SELECT count(*)::int FROM text_seminar_attendance a JOIN text_seminars s ON s.id=a.room_id
      WHERE s.course_code=$1 AND a.student_id=$2 AND s.test_section=$3) AS "seminarsAttended",
    (SELECT count(*)::int FROM text_seminar_responses a JOIN text_seminars s ON s.id=a.room_id
      WHERE s.course_code=$1 AND a.student_id=$2 AND s.test_section=$3) AS "seminarResponses"`,params);
  return {courseCode:course,studentId:student.publicId,studentName:student.name,generatedAt:new Date().toISOString(),
    section:student.section?"TEST":"regular",plannedHours,observedSeconds,verified,events,
    note:"Scheduled hours, observed platform time and teacher-verified learning are separate measures. Source subtotals may overlap. Independent demonstration activities are excluded."};
}
export function registerIntegrityEvidence(app,{repository,requireRoles,requireCsrf,requireCourseAccess}) {
  const path="/v1/courses/:courseCode/academic-record",roles=requireRoles("student","teacher","teacher_admin");
  app.get(path,{preHandler:[roles]},async(req,reply)=>{
    const course=parse(courseCodeSchema,req.params.courseCode),user=req.auth.user;
    await requireCourseAccess(user,course); reply.header("Cache-Control","private, no-store");
    const db=repository.pool;
    await requireClassroomRollout(db,course,user.id);
    const policy=await policyState(db,user,course);
    let students=[];
    if(user.role!=="student") students=(await db.query(`SELECT u.public_id AS id,u.display_name AS name FROM course_enrollments e JOIN app_users u ON u.id=e.student_user_id
      WHERE e.course_code=$1 AND e.status IN ('active','completed') AND in_course_test_section(e.course_code,u.id)=in_course_test_section(e.course_code,$2) ORDER BY u.display_name,u.public_id`,[course,user.id])).rows;
    const student=req.query.studentId || (user.role==="student"?user.publicId:null);
    return {policy,students,report:student?await evidenceReport(db,user,course,await subject(db,user,course,student)):null,role:user.role};
  });
  app.post(path+"/actions",{preHandler:[roles,requireCsrf]},async(req,reply)=>{
    const course=parse(courseCodeSchema,req.params.courseCode),user=req.auth.user,a=parse(action,req.body);
    await requireCourseAccess(user,course); reply.header("Cache-Control","private, no-store");
    const db=await repository.pool.connect();
    try {
      await db.query("BEGIN");
      await requireClassroomRollout(db,course,user.id);
      if(a.type==="enable") {
        if(user.role!=="teacher_admin")fail(403,"ADMIN_REQUIRED","Only academic administrators can enable a new cohort.");
        await db.query(`INSERT INTO course_integrity_rollouts(course_code,test_section,approved_by) VALUES($1,in_course_test_section($1,$2),$2) ON CONFLICT DO NOTHING`,[course,user.id]);
      } else if(a.type==="evidence") {
        if(user.role==="student")fail(403,"TEACHER_REQUIRED","Only teaching staff can verify learning.");
        const s=await subject(db,user,course,a.studentId);
        if(a.date>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()))
          fail(422,"FUTURE_ACTIVITY","Use a completed activity date.");
        const result=await db.query(`INSERT INTO course_evidence_records(student_id,course_code,test_section,teacher_id,request_id,activity_date,minutes,description)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(teacher_id,request_id) DO NOTHING RETURNING id`,[s.id,course,s.section,user.id,a.requestId,a.date,a.minutes,a.description]);
        if(!result.rowCount && !(await db.query(`SELECT 1 FROM course_evidence_records WHERE teacher_id=$1 AND request_id=$2 AND student_id=$3 AND course_code=$4 AND test_section=$5 AND activity_date=$6 AND minutes=$7 AND description=$8`,[user.id,a.requestId,s.id,course,s.section,a.date,a.minutes,a.description])).rowCount)fail(409,"RECORD_CONFLICT","This request was previously used for a different record.");
      } else {
        if(user.role!=="student")fail(403,"STUDENT_REQUIRED","This action belongs to the student.");
        const policy=await policyState(db,user,course);
        if(!policy.applies)fail(409,"COHORT_NOT_ENABLED","This enrolment is outside the enabled cohort.");
        if(a.type==="sign")await db.query(`INSERT INTO course_integrity_attempts(student_id,course_code,test_section,policy_version,signed_at)
          VALUES($1,$2,in_course_test_section($2,$1),$3,now()) ON CONFLICT DO NOTHING`,[user.id,course,a.version]);
        else {
          if(!policy.signedAt)fail(409,"SIGN_FIRST","Read and sign the integrity policy first.");
          const passed=questions.every(q=>q.answer===a.answers[q.id]);
          await db.query(`UPDATE course_integrity_attempts SET attempts=attempts+1,passed_at=CASE WHEN $4 THEN clock_timestamp() END
            WHERE student_id=$1 AND course_code=$2 AND test_section=in_course_test_section($2,$1) AND policy_version=$3 AND passed_at IS NULL`,[user.id,course,a.version,passed]);
        }
      }
      const result=await policyState(db,user,course);await db.query("COMMIT");return {policy:result};
    }catch(err){await db.query("ROLLBACK");throw err;}finally{db.release();}
  });
}
