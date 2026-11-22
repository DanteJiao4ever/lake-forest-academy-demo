import { classroomFixture } from "./classroom-rollout-fixture.js";
import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import pg from "pg";
import {createApp} from "../src/app.js";
import {PostgresRepository} from "../src/db/postgres.js";
import {loadConfig} from "../src/config.js";
import {csrfTokenFor,sha256} from "../src/lib/crypto.js";
import {hashPassword} from "../src/lib/passwords.js";
import {riskSignals} from "../src/services/class-insights.js";
import {FakeDrive,FakeScanner} from "./fakes.js";

test("risk checks use three independent strict thresholds and preserve missing evidence",()=>{
  const now=Date.UTC(2026,0,10), lastActivity=new Date(now-5*86400000);
  const result=riskSignals({lastActivity,recent:[{percent:69},{percent:70}],actual:20,plan:{percent:35}},now);
  assert.equal(result.inactivity.flag,false);assert.equal(result.scores.flag,false);assert.equal(result.progress.flag,false);
  const warning=riskSignals({lastActivity:new Date(lastActivity-1),recent:[{percent:69.9},{percent:30}],actual:19.9,plan:{percent:35}},now);
  assert.equal(warning.inactivity.flag,true);assert.equal(warning.scores.flag,true);assert.equal(warning.progress.flag,true);
  assert.deepEqual(Object.values(riskSignals({lastActivity:null,recent:[],actual:0,plan:null})).map(x=>x.flag),[null,null,null]);
});

const ownerUrl=process.env.INTERACTIVE_TEST_OWNER_URL,runtimeUrl=process.env.INTERACTIVE_TEST_RUNTIME_URL;
test("read-only observer grants, cohort weights, faculty revisions and scoped learning alerts",{skip:!(ownerUrl && runtimeUrl)},async(t)=>{
  await classroomFixture(t, ownerUrl, "MCV4U");
  const pool=new pg.Pool({connectionString:runtimeUrl}),owner=new pg.Pool({connectionString:ownerUrl});
  const repository=new PostgresRepository(pool),origin="http://127.0.0.1:5173";
  const config=loadConfig({NODE_ENV:"test",DATABASE_URL:runtimeUrl,ALLOWED_ORIGINS:origin,COOKIE_SECURE:"false",CLAMAV_REQUIRED:"false"});
  const app=await createApp({config,repository,drive:new FakeDrive(),scanner:new FakeScanner()});
  const password="Development-only-"+randomUUID();
  const hash=await hashPassword(password,10),ids=[];
  async function person(role,testSection=false){
    const publicId=randomUUID(),email=publicId+"@example.invalid";
    const u=await repository.createUser({publicId,email,passwordHash:hash,firstName:"QA",lastName:"Record",displayName:publicId,role});ids.push(u.id);
    if(role==="student")await owner.query("INSERT INTO course_enrollments(student_user_id,course_code) VALUES($1,'MCV4U')",[u.id]);
    if(role==="teacher")await owner.query("INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,'MCV4U')",[u.id]);
    if(testSection)await owner.query("INSERT INTO course_test_members(course_code,user_id) VALUES('MCV4U',$1)",[u.id]);
    const token=randomUUID(),id=randomUUID(),csrf=csrfTokenFor(id,config.csrfSecret);
    await repository.createSession({id,userId:u.id,tokenHash:sha256(token),csrfTokenHash:sha256(csrf),expiresAt:new Date(Date.now()+3600000)});
    return {...u,email,publicId,headers:{cookie:config.cookieName+"="+token,origin,"x-csrf-token":csrf}};
  }
  async function hit(person,url,body=null,code=200){
    const response=await app.inject({method:body?"POST":"GET",url,payload:body||undefined,headers:person.headers});
    assert.equal(response.statusCode,code,response.body.slice(0,700));return response.json();
  }
  try {
    const [student,peer,testStudent,observer,admin,teacher]=await Promise.all([person("student"),person("student"),person("student",true),person("observer"),person("teacher_admin"),person("teacher")]);
    const base="/v1/insights/MCV4U/"+student.publicId;
    const grant=(viewer,action,studentId=student.publicId,code=200)=>hit(viewer,"/v1/insights/grants",{action,studentId,observerEmail:observer.email,courseCode:"MCV4U"},code);
    const save=(viewer,body,code=200)=>hit(viewer,base+"/actions",{requestId:randomUUID(),baseVersion:0,...body},code);
    await t.test("real observer login, no self-claim, separate admin grants limited by section",async()=>{
      const logged=await hit(observer,"/v1/auth/login",{portal:"observer",email:observer.email,password});
      assert.equal(logged.role,"observer");
      await hit(observer,"/v1/auth/login",{portal:"faculty",email:observer.email,password},401);
      assert.deepEqual((await hit(observer,"/v1/insights/scopes")).scopes,[]);
      await hit(observer,base,null,403);await hit(student,base,null,403);
      await grant(teacher,"grant",student.publicId,403);await grant(admin,"grant",testStudent.publicId,403);
      await grant(admin,"grant");
      assert.deepEqual((await hit(observer,"/v1/insights/scopes")).scopes.map(s=>s.studentId),[student.publicId]);
      const r=await hit(observer,base);
      assert.equal(r.studentId,student.publicId);assert.equal(r.grants,undefined);
      assert.equal(r.risk.scores.flag,null);assert.equal(r.risk.progress.flag,null);assert.equal(r.risk.inactivity.flag,null);
      await hit(observer,"/v1/insights/MCV4U/"+peer.publicId,null,403);
      await hit(teacher,"/v1/insights/MCV4U/"+testStudent.publicId,null,403);
      await hit(observer,"/v1/me/progress",null,403);await hit(observer,"/v1/courses/MCV4U/modules",null,403);
      await hit(observer,"/v1/submissions",{test:true},403);assert.equal((await app.inject({method:"PUT",url:"/v1/grades/"+randomUUID(),headers:observer.headers,payload:{}})).statusCode,403);
      await save(observer,{type:"plan",date:"2026-01-01",percent:50},403);
      await hit({...teacher,headers:{...teacher.headers,"x-csrf-token":""}},base+"/actions",{},403);
    });
    await t.test("observer time totals union overlaps and exclude other courses, learners and sections",async()=>{
      const empty=await hit(observer,base);
      const section=empty.section==="TEST";
      assert.deepEqual(empty.learningTime,{plannedHours:110,observedSeconds:0,verifiedMinutes:0});
      await owner.query(`INSERT INTO course_engagement_intervals(student_id,course_code,test_section,source,observed)
        SELECT learner,course,section,source,
          tstzrange(current_date-interval '12 days'+lo*interval '1 second',current_date-interval '12 days'+hi*interval '1 second','[)')
        FROM (VALUES
          ($1::uuid,'MCV4U',$3::boolean,'reading',0,20), ($1,'MCV4U',$3,'reading',5,25),
          ($1,'MCV4U',$3,'writing',15,35), ($1,'MCV4U',$3,'assessment',40,50),
          ($2::uuid,'MCV4U',$3,'reading',60,75), ($1,'MCV4U',NOT $3,'seminar',60,80),
          ($1,'MHF4U',$3,'reading',65,85)
        ) AS spans(learner,course,section,source,lo,hi)`,[student.id,peer.id,section]);
      const description="Private verification worksheet";
      await owner.query(`INSERT INTO course_evidence_records
        (student_id,course_code,test_section,minutes,teacher_id,request_id,activity_date,description)
        SELECT learner,course,section,minutes,$3,gen_random_uuid(),current_date,$4 FROM (VALUES
          ($1::uuid,'MCV4U',$5::boolean,12),($1,'MCV4U',$5,5),($1,'MCV4U',NOT $5,31),
          ($2::uuid,'MCV4U',$5,27),($1,'MHF4U',$5,63)
        ) AS evidence(learner,course,section,minutes)`,[student.id,peer.id,teacher.id,description,section]);
      const report=await hit(observer,base);
      assert.deepEqual(report.learningTime,{plannedHours:110,observedSeconds:45,verifiedMinutes:17});
      assert.ok(!JSON.stringify(report).includes(description));
      await hit(observer,"/v1/courses/MCV4U/academic-record?studentId="+student.publicId,null,403);
    });
    await t.test("strict triggers, immutable versions, rubric changes leave prior evidence and grades intact",async()=>{
      const source=await hit(teacher,base),[first,second]=source.tasks;
      assert.deepEqual(source.courseWeights,{coursework:65,final_evaluation:25,participation:10});
      for(const [i,item] of [first,second].entries()){
        await owner.query(`INSERT INTO student_gradebook_scores(student_user_id,gradebook_item_id,version,score,graded_by_user_id,graded_by,idempotency_key,request_fingerprint,published_at)
          VALUES($1,$2,1,$3,$4,$5,$6,$7,now()-interval '1 hour'*$8)`,[student.id,item.id,i?65:69,teacher.id,teacher.publicId,randomUUID(),sha256(item.id),i]);
      }
      await owner.query("INSERT INTO course_engagement_intervals(student_id,course_code,test_section,source,observed) VALUES($1,'MCV4U',false,'reading',tstzrange(now()-interval '6 days 20 seconds',now()-interval '6 days'))",[student.id]);
      const r=await save(teacher,{type:"plan",date:"2025-01-01",percent:15});
      assert.equal(r.risk.progress.flag,false);assert.equal(r.risk.scores.flag,true);assert.equal(r.risk.inactivity.flag,true);
      const amended=await save(teacher,{type:"plan",date:"2025-01-01",percent:16,baseVersion:1});
      assert.equal(amended.risk.progress.flag,true);
      await save(teacher,{type:"plan",date:"2025-01-01",percent:20},409);
      const taskId=first.id,rubric={type:"rubric",taskId,weights:{K:50,T:50,C:0,A:0},requestId:randomUUID()};
      await Promise.all([save(teacher,rubric),save(teacher,rubric)]);
      const mark=await save(teacher,{type:"evidence",taskId,rubricVersion:1,scores:{K:80,T:60,C:null,A:null},note:"Two annotated solutions from class."});
      assert.equal(mark.records.evidence[taskId].data.taskScore,70);
      assert.deepEqual(mark.ktca,{K:80,T:60,C:null,A:null});
      const changed=await save(teacher,{...rubric,baseVersion:1,requestId:randomUUID(),weights:{K:0,T:0,C:100,A:0}});
      assert.equal(changed.records.evidence[taskId].data.rubricVersion,1);
      assert.equal(changed.records.evidence[taskId].data.weights.K,50);
      assert.equal(changed.publishedAverage,mark.publishedAverage);
      const ratings=Object.fromEntries(["responsibility","organization","independent-work","collaboration","initiative","self-regulation"].map(k=>[k,"G"]));
      const mid=await save(teacher,{type:"skills",period:"midterm",ratings,comment:"Independent revision recorded."});
      assert.equal(mid.records.skills.midterm.data.ratings.collaboration,"G");
      assert.equal(mid.records.skills.final,undefined);assert.equal(mid.publishedAverage,mark.publishedAverage);
      const parent=await hit(observer,base);assert.equal(parent.records.skills.midterm.version,1);
      const {students}=await hit(teacher,"/v1/insights/alerts");assert.ok(students.find(x=>x.studentId===student.publicId)?.risk.progress.flag);
      assert.ok(!students.some(s=>s.studentId===testStudent.publicId));
      assert.deepEqual((await owner.query("SELECT score FROM student_gradebook_scores WHERE student_user_id=$1 ORDER BY score",[student.id])).rows,[{score:65},{score:69}]);
      await grant(admin,"revoke");await hit(observer,base,null,403);assert.deepEqual((await hit(observer,"/v1/insights/scopes")).scopes,[]);
    });
  }finally{
    await app.close();
    if(ids.length){
      await owner.query("DELETE FROM course_evidence_records WHERE student_id=ANY($1::uuid[])",[ids]);
      await owner.query("DELETE FROM course_engagement_intervals WHERE student_id=ANY($1::uuid[])",[ids]);
      await owner.query("DELETE FROM insight_records WHERE author_id=ANY($1::uuid[])",[ids]);
      await owner.query("DELETE FROM observer_course_grants WHERE changed_by=ANY($1::uuid[])",[ids]);
      await owner.query("DELETE FROM student_gradebook_scores WHERE student_user_id=ANY($1::uuid[])",[ids]);
      await owner.query("DELETE FROM app_users WHERE id=ANY($1::uuid[])",[ids]);
    }
    await pool.end();await owner.end();
  }
});
