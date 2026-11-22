import { classroomFixture } from "./classroom-rollout-fixture.js";
import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import pg from "pg";
import {createApp} from "../src/app.js";
import {PostgresRepository} from "../src/db/postgres.js";
import {loadConfig} from "../src/config.js";
import {csrfTokenFor,sha256} from "../src/lib/crypto.js";
import {FakeDrive,FakeScanner} from "./fakes.js";

const ownerUrl=process.env.INTERACTIVE_TEST_OWNER_URL;
const runtimeUrl=process.env.INTERACTIVE_TEST_RUNTIME_URL;
test("Module 0 applies prospectively per section and academic records de-duplicate observed time", {skip:!(ownerUrl && runtimeUrl)}, async(t)=>{
  await classroomFixture(t, ownerUrl, "MHF4U");
  const owner=new pg.Pool({connectionString:ownerUrl});
  const repository=new PostgresRepository(new pg.Pool({connectionString:runtimeUrl}));
  const origin="http://127.0.0.1:5173",course="MHF4U";
  const config=loadConfig({NODE_ENV:"test",DATABASE_URL:runtimeUrl,ALLOWED_ORIGINS:origin,COOKIE_SECURE:"false",CLAMAV_REQUIRED:"false"});
  const app=await createApp({config,repository,drive:new FakeDrive(),scanner:new FakeScanner()});
  const ids=[];
  async function member(role,section) {
    const publicId=randomUUID(),user=await repository.createUser({publicId,email:publicId+"@example.invalid",passwordHash:"local-fixture",firstName:"QA",lastName:"Learner",displayName:"QA learner",role});
    ids.push(user.id);
    if(section) await owner.query("INSERT INTO course_test_members VALUES($1,$2)",[course,user.id]);
    if(role==="student") await repository.replaceEnrollments(user.id,[course]);
    if(role==="teacher") await owner.query("INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,$2)",[user.id,course]);
    const token=randomUUID(),id=randomUUID(),csrf=csrfTokenFor(id,config.csrfSecret);
    await repository.createSession({id,userId:user.id,tokenHash:sha256(token),csrfTokenHash:sha256(csrf),expiresAt:new Date(Date.now()+3600000)});
    return {user,headers:{origin,cookie:config.cookieName+"="+token,"x-csrf-token":csrf}};
  }
  async function request(actor,action,code=200,studentId) {
    const url="/v1/courses/"+course+"/academic-record"+(action?"/actions":studentId?"?studentId="+studentId:"");
    const result=await app.inject({method:action?"POST":"GET",url,headers:actor.headers,payload:action||undefined});
    assert.equal(result.statusCode,code,result.body.slice(0,180));return result.json();
  }
  let admin;
  try {
    const legacy=await member("student",true);admin=await member("teacher_admin",true);
    const faculty=await member("teacher",true),other=await member("teacher",false);
    await request(faculty,{type:"enable"},403);
    await request(admin,{type:"enable"});
    const learner=await member("student",true),regular=await member("student",false);
    assert.equal((await request(legacy)).policy.required,false);
    assert.equal((await request(regular)).policy.required,false);
    const initial=await request(learner);assert.equal(initial.policy.required,true);
    const moduleId=(await owner.query("SELECT id FROM course_modules WHERE course_code=$1 AND module_number=1",[course])).rows[0].id;
    await owner.query(`INSERT INTO student_module_progress(student_user_id,module_id,status,started_at,completed_at)
      SELECT $1,id,'completed',now(),now() FROM course_modules WHERE course_code=$2 AND module_number=0`,[learner.user.id,course]);
    const progress=()=>repository.listStudentProgress(learner.user.id,course);
    assert.equal((await progress()).find(m=>m.moduleId===moduleId).status,"locked");
    await assert.rejects(repository.pool.query("INSERT INTO student_module_progress(student_user_id,module_id,status) VALUES($1,$2,'in_progress')",[learner.user.id,moduleId]),e=>e.constraint==="course_integrity_gate");
    const quiz={type:"quiz",version:initial.policy.version,answers:{sources:0,revision:1,evidence:2}};
    await request(learner,quiz,409);
    await request(learner,{type:"sign",version:initial.policy.version,accepted:true});
    assert.equal((await request(learner,{...quiz,answers:{...quiz.answers,evidence:1}})).policy.required,true);
    assert.equal((await request(learner,quiz)).policy.required,false);
    assert.notEqual((await progress()).find(m=>m.moduleId===moduleId).status,"locked");
    await owner.query(`INSERT INTO course_engagement_intervals(student_id,course_code,test_section,source,observed)
      SELECT $1,$2,true,kind,tstzrange('2026-01-08 15:00Z'::timestamptz+lo*interval '1 second','2026-01-08 15:00Z'::timestamptz+hi*interval '1 second','[)')
      FROM (VALUES ('reading',0,20),('reading',10,25),('writing',20,35)) AS v(kind,lo,hi)`,[learner.user.id,course]);
    const evidence={type:"evidence",studentId:learner.user.publicId,date:"2026-01-08",minutes:5,description:"Reviewed a paper graph.",requestId:randomUUID()};
    await request(other,evidence,404);await request(learner,evidence,403);
    await request(faculty,evidence);await request(faculty,evidence);await request(faculty,{...evidence,minutes:10},409);
    const report=(await request(faculty,null,200,learner.user.publicId)).report;
    assert.deepEqual(report.observedSeconds,{all:35,reading:25,writing:15});assert.equal(report.verified.length,1);
    assert.equal(report.plannedHours,110);
    await request(other,null,404,learner.user.publicId);await request(learner,null,404,regular.user.publicId);
  } finally {
    await owner.query("DELETE FROM course_evidence_records WHERE student_id=ANY($1::uuid[])",[ids]);
    await owner.query("DELETE FROM course_engagement_intervals WHERE student_id=ANY($1::uuid[])",[ids]);
    await owner.query("DELETE FROM course_integrity_attempts WHERE student_id=ANY($1::uuid[])",[ids]);
    if(admin)await owner.query("DELETE FROM course_integrity_rollouts WHERE approved_by=$1",[admin.user.id]);
    await owner.query("DELETE FROM app_users WHERE id=ANY($1::uuid[])",[ids]);
    await app.close();await repository.close();await owner.end();
  }
});
