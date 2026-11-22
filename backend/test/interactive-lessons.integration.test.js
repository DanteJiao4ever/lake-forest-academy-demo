import { classroomFixture } from "./classroom-rollout-fixture.js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "../src/config.js";
import { PostgresRepository } from "../src/db/postgres.js";
import { csrfTokenFor, sha256 } from "../src/lib/crypto.js";

import { FakeDrive, FakeScanner } from "./fakes.js";

// Both URLs must point at a disposable, fully migrated test database. The app
// itself always runs as the runtime role. Only fixture provisioning uses owner.
const ownerUrl = process.env.INTERACTIVE_TEST_OWNER_URL;
const runtimeUrl = process.env.INTERACTIVE_TEST_RUNTIME_URL;
const endpoint = "/v1/courses/MCV4U/interactive-lessons/cia4u-demand-2-3";
const native = endpoint.replace("cia4u-demand-2-3","mcv4u-derivative-graphs");
const origin = "http://127.0.0.1:5173";
const schemaVersion = "1.0";
const request = (type,body) => ({type,version:schemaVersion,requestId:randomUUID(),...body});

test("interactive lessons through real sessions and least-privileged PostgreSQL", {skip:!(ownerUrl && runtimeUrl)}, async (t) => {
  await classroomFixture(t, ownerUrl, "MCV4U");
  const fixtureDir = await mkdtemp(join(tmpdir(),"lfa-fixture-"));
  const closedLesson="qa-deadline-"+randomUUID();
  for (const [fixture,id] of [["fixture-all-cards","cia4u-demand-2-3"],["fixture-pilot","mcv4u-derivative-graphs"],["fixture-pilot",closedLesson]]) {
    const url = new URL("../../scripts/fixtures/lesson-authoring/compiled/"+fixture+".json", import.meta.url);
    const doc = JSON.parse(await readFile(url,"utf8"));
    await writeFile(join(fixtureDir,id+".json"),JSON.stringify({...doc,id,version:schemaVersion,courseCode:id.startsWith("cia")?"CIA4U":"MCV4U"}));
  }
  process.env.LFA_LESSON_CONTENT_DIR = fixtureDir;
  const {createApp} = await import("../src/app.js");
  const {getLesson} = await import("../src/lessons/catalog.js");
  const pool = new pg.Pool({connectionString:runtimeUrl});
  const owner = new pg.Pool({connectionString:ownerUrl});
  const repo = new PostgresRepository(pool);
  const config = loadConfig({NODE_ENV:"test",DATABASE_URL:runtimeUrl,ALLOWED_ORIGINS:origin,COOKIE_SECURE:"false",CLAMAV_REQUIRED:"false"});
  const app = await createApp({config,repository:repo,drive:new FakeDrive(),scanner:new FakeScanner()});
  const created = [];
  async function member(role="student",testSection=false,enrolled=true) {
    const label = randomUUID();
    const user = await repo.createUser({publicId:label,email:label+"@example.invalid",passwordHash:"fixture",firstName:"Sam",lastName:"Lee",displayName:label,role});
    created.push(user.id);
    if (enrolled) {
      const sql = role === "student" ? "INSERT INTO course_enrollments(student_user_id,course_code) VALUES($1,'MCV4U')" :
        "INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,'MCV4U')";
      await owner.query(sql,[user.id]);
    }
    if (testSection) await owner.query("INSERT INTO course_test_members(course_code,user_id) VALUES('MCV4U',$1)",[user.id]);
    const id=randomUUID(),token=randomUUID(),csrf=csrfTokenFor(id,config.csrfSecret);
    await repo.createSession({id,userId:user.id,tokenHash:sha256(token),csrfTokenHash:sha256(csrf),expiresAt:new Date(Date.now()+3600000)});
    return {id:user.id,headers:{origin,cookie:config.cookieName+"="+token,"x-csrf-token":csrf}};
  }
  async function hit(member,body=null,code=200,path=endpoint) {
    const res = await app.inject({method:body?"POST":"GET",url:path+(body?"/actions":""),headers:member?.headers || {},payload:body || undefined});
    assert.equal(res.statusCode,code,res.body.slice(0,500));
    return res.json();
  }
  try {
    const [student,peer,other,teacher,otherTeacher,outsider] = await Promise.all([member(),member(),member("student",true),member("teacher"),member("teacher",true),member("student",false,false)]);
    const own = (body,code) => hit(student,body,code);
    const card = (id,answer,code=200) => own(request("card",{cardId:id,answer}),code);
    const first = await own();
    const paragraph=first.lesson.paragraphs[0];
    const anchor={version:schemaVersion,paragraphId:paragraph.id,exact:paragraph.text.slice(0,20),prefix:"",suffix:paragraph.text.slice(20,40)};
    let question, blindReply;
    await t.test("authorization, native module locks, scope and pre-release response", async () => {
      assert.equal(first.section,"regular");
      assert.equal((await hit(other)).section,"TEST");
      assert.equal(first.nextUnlocked,false);
      assert.equal(first.nextReading,undefined);
      assert.equal(first.lesson.cards.find(c=>c.id==="own-post").teacherModel,undefined);
      assert.equal(first.errorDistribution,undefined);
      await hit(null,null,401);
      await hit(outsider,null,403);
      await hit(student,null,409,native);
      await hit(teacher,null,200,native);
      // Exercise a separately provisioned, closed native lesson without
      // changing the deadline for any shared demonstration course.
      await owner.query(`INSERT INTO interactive_lesson_bindings(course_code,lesson_id,native_lesson_id,closes_at)
         SELECT 'MCV4U',$1,l.id,now()-interval '1 minute' FROM module_lessons l JOIN course_modules m ON m.id=l.module_id
         LEFT JOIN interactive_lesson_bindings b ON b.native_lesson_id=l.id WHERE m.course_code='MCV4U'
         AND m.status='published' AND l.status='published' AND b.lesson_id IS NULL ORDER BY m.module_number,l.position LIMIT 1`,[closedLesson]);
      const closedPath=endpoint.replace("cia4u-demand-2-3",closedLesson);
      await hit(teacher,null,200,closedPath);
      const closed=await hit(teacher,request("card",{cardId:"first-check",answer:{choices:["circle"]}}),409,closedPath);
      assert.equal(closed.error.code,"LESSON_CLOSED");
      await hit(student,null,403,endpoint.replace("MCV4U","MHF4U"));
      await hit(teacher,null,404,endpoint.replace("cia4u-demand-2-3","made-up"));
      await hit({...student,headers:{...student.headers,"x-csrf-token":"invalid"}},request("scratchpad",{text:"secret"}),403);
      await own(request("card",{cardId:"own-post",answer:{text:"word",completed:true}}),422);
      await own(request("card",{cardId:"own-post",answer:{text:"word"},version:"outdated"}),409);
      await card("finish",{text:"evidence ".repeat(65),skills:["initiative","organization"]},409);
      await owner.query("INSERT INTO student_module_progress(student_user_id,module_id,status) VALUES($1,'mcv4u-m01','completed')",[student.id]);
      await hit(student,null,200,native);
      const {data:modules}=await hit(student,null,200,"/v1/courses/MCV4U/modules");
      assert.equal(modules.flatMap(m=>m.lessons).find(l=>l.id==="MCV4U-U1-L3").interactiveLessonId,"mcv4u-derivative-graphs");
      assert.equal(modules.flatMap(m=>m.lessons).some(l=>l.interactiveLessonId==="cia4u-demand-2-3"),false);
    });

    await t.test("atomic retries and concurrent cards, private notes and draft conflicts",async()=>{
      const write=request("card",{cardId:"one-choice",answer:{choices:["square"]}});
      const [a,b]=await Promise.all([own(write),own(write)]);
      assert.equal(a.cards["one-choice"].attempts,1); assert.equal(b.cards["one-choice"].attempts,1);
      await own({...write,answer:{choices:["circle"]}},409);
      await Promise.all([card("one-choice",{choices:["circle"]}),card("many-choices",{choices:["circle","oval"]})]);
      assert.equal((await own()).cards["many-choices"].completed,true);
      const note=await own(request("annotation",{anchor,color:"yellow",text:"private annotation"}));
      assert.equal(note.notes.at(-1).text,"private annotation");
      assert.deepEqual((await hit(peer)).notes,[]);
      await own(request("annotation",{anchor:{...anchor,exact:"fabricated"},color:"yellow"}),422);
      const scratch=await own(request("scratchpad",{text:"private draft"}));
      await own(request("scratchpad",{text:"stale",baseRevision:scratch.revision-1}),409);
      assert.equal((await hit(teacher)).scratchpad,"");
      const save = (text,baseVersion) => request("synthesisDraft",{cardId:"finish",text,skills:[],doc:{type:"doc",content:[{type:"paragraph",content:[{type:"text",text}]}]},baseVersion});
      const v1=await own(save("Fixed fare",0));
      assert.equal(v1.cards["finish"].draft.version,1);
      const v2=await own(save("Fixed bus fare",1));
      assert.deepEqual(v2.cards["finish"].history.at(-1).diff,{from:6,removed:0,inserted:"bus "});
      await own(save("Overwrite",0),409);
      assert.equal((await hit(otherTeacher)).errorDistribution["one-choice"],undefined);
      assert.equal((await hit(teacher)).errorDistribution["one-choice"]["square category"],1);
    });

    await t.test("anchored and post-first discussion, same-section moderation and bookings",async()=>{
      const post=await own(request("question",{anchor,text:"How does the baseline change?"}));
      question=post.threads.find(t=>t.text==="How does the baseline change?").id;
      assert.equal((await hit(other)).threads.length,0);
      await hit(other,request("reply",{threadId:question,text:"Cross section"}),404);
      await hit(otherTeacher,request("endorse",{threadId:question}),404);
      await own(request("endorse",{threadId:question}),403);
      await hit(peer,request("reply",{threadId:question,text:"Hold the fare constant."}));
      await hit(teacher,request("endorse",{threadId:question}));
      const updated=(await own()).threads.find(t=>t.id===question);
      assert.equal(updated.endorsed,true); assert.equal(updated.replies[0].text,"Hold the fare constant.");
      const blind=request("reply",{cardId:"own-post",peerId:"peer-a",text:"I would compare on a school day."});
      await own(blind,403);
      const tooShort=await card("own-post",{text:"one word",pasteWords:0});
      assert.equal(tooShort.lesson.cards.find(c=>c.id==="own-post").peers,undefined);
      const unlocked=await card("own-post",{text:"compare ".repeat(46),pasteWords:30});
      assert.ok(unlocked.lesson.cards.find(c=>c.id==="own-post").peers.length);
      const staff = await hit(teacher);
      assert.equal(staff.pasteReviews[0].cardId,"own-post");
      const candidate = staff.peerCandidates.find(p=>p.text.includes("compare"));
      assert.ok(candidate);
      const feature = request("featurePeer",{readerId:candidate.readerId,cardId:candidate.cardId});
      await hit(otherTeacher,feature,404);
      await own(feature,403);
      await hit(teacher,feature);
      const featured=(await own()).lesson.cards.find(c=>c.id==="own-post").peers.find(p=>p.label==="Class response 1");
      assert.ok(featured.text.includes("compare"));
      assert.equal(featured.studentName,undefined);assert.notEqual(featured.id,candidate.readerId);
      assert.equal((await hit(peer)).lesson.cards.find(c=>c.id==="own-post").peers,undefined);
      const anonymous=await own(request("reply",{cardId:"own-post",peerId:featured.id,text:"Use this evidence."}));
      assert.equal(anonymous.threads.find(t=>t.peerId===featured.id).authorName,"Classmate");
      assert.deepEqual((await hit(otherTeacher)).pasteReviews,[]);
      blindReply=(await own(blind)).threads.find(t=>t.peerId==="peer-a").id;
      assert.equal((await hit(peer)).threads.some(t=>t.id===blindReply),false);
      await hit(peer,request("reply",{threadId:blindReply,text:"peek"}),404);
      await hit(peer,request("card",{cardId:"own-post",answer:{text:"evidence ".repeat(48)}}));
      await hit(peer,request("reply",{threadId:blindReply,text:"I agree with that comparison."}));
      const booking=(await own(request("booking",{timeZone:"Asia/Singapore",preferredAt:new Date(Date.now()+86400000).toISOString()}))).bookings[0];
      assert.equal((await hit(peer)).bookings.length,0);
      await hit(otherTeacher,request("bookingReview",{bookingId:booking.id,status:"declined"}),404);
      await hit(teacher,request("bookingReview",{bookingId:booking.id,status:"confirmed"}));
      assert.equal((await own()).bookings[0].status,"confirmed");
      await hit(teacher,request("bookingReview",{bookingId:booking.id,status:"declined"}),409);
    });

    await t.test("server clock cap, deduplication and final synthesis gate",async()=>{
      const beat=request("heartbeat",{seconds:30});
      const start=await own(beat); assert.equal(start.activeSeconds,0);
      await owner.query("UPDATE interactive_lesson_readers SET last_heartbeat=clock_timestamp()-interval '15 seconds' WHERE user_id=$1 AND lesson_id='cia4u-demand-2-3'",[student.id]);
      await Promise.all([own(request("heartbeat",{seconds:30})),own(request("heartbeat",{seconds:30})),own(beat)]);
      assert.equal((await own()).activeSeconds,15);
      await owner.query("UPDATE interactive_lesson_readers SET last_heartbeat=clock_timestamp()-interval '181 seconds' WHERE user_id=$1 AND lesson_id='cia4u-demand-2-3'",[student.id]);
      assert.equal((await own(request("heartbeat",{seconds:30}))).activeSeconds,15);
      await card("sequence",{stepId:"third",value:6},422);
      await card("exact-number",{value:"7"});
      await card("sliders",{parameters:{price:10,shift:12},history:[{price:10,shift:0},{price:10,shift:12}],value:"32"});
      for(const [stepId,value] of [["first",2],["second",4],["third",6]]) await card("sequence",{stepId,value});
      await card("bad-line",{lineId:"middle",reasonId:"typo"});
      const matrix=getLesson("cia4u-demand-2-3").cards.find(c=>c.id==="sort");
      const remaining=await card(matrix.id,{placements:matrix.private.answers});
      assert.deepEqual(remaining.unmet,["finish"]);
      const text = "Compare the planned trips at a constant fare. ".repeat(10);
      const skills = ["responsibility","initiative"],doc={type:"doc",content:[{type:"paragraph",content:[{type:"text",text}]}]};
      await own(request("synthesisDraft",{cardId:"finish",baseVersion:2,text,skills,doc}));
      const submit=request("card",{cardId:"finish",answer:{text,skills,doc}});
      const [a,b]=await Promise.all([own(submit),own(submit)]);
      assert.equal(a.nextUnlocked,true); assert.equal(b.cards["finish"].attempts,1);
      assert.equal(b.mastery,100); assert.deepEqual(b.unmet,[]); assert.ok(b.nextReading.text);
      const legacy=await owner.query("SELECT module_id FROM student_module_progress WHERE student_user_id=$1",[student.id]);
      assert.deepEqual(legacy.rows,[{module_id:"mcv4u-m01"}]);
    });
  } finally {
    await app.close();
    if (created.length) {
      await owner.query("DELETE FROM interactive_lesson_readers WHERE user_id=ANY($1::uuid[])",[created]);
      await owner.query("DELETE FROM app_users WHERE id=ANY($1::uuid[])",[created]);
    }
    await owner.query("DELETE FROM interactive_lesson_bindings WHERE lesson_id=$1",[closedLesson]);
    await pool.end(); await owner.end(); await rm(fixtureDir,{recursive:true,force:true});
  }
});
