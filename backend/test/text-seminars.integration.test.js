import { classroomFixture } from "./classroom-rollout-fixture.js";
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import pg from 'pg';
import { loadConfig } from '../src/config.js';
import { createApp } from '../src/app.js';
import { PostgresRepository } from '../src/db/postgres.js';
import { csrfTokenFor, sha256 } from '../src/lib/crypto.js';
import { FakeDrive, FakeScanner } from './fakes.js';

const ownerUrl=process.env.INTERACTIVE_TEST_OWNER_URL;
const runtimeUrl=process.env.INTERACTIVE_TEST_RUNTIME_URL;
const origin='http://127.0.0.1:5173';
const collection='/v1/courses/MCV4U/seminars';

test('live text seminar, real HTTP streams and two independent API instances', {skip:!(ownerUrl && runtimeUrl)}, async t=>{
  await classroomFixture(t, ownerUrl, "MCV4U");
  const pool=new pg.Pool({connectionString:runtimeUrl}),owner=new pg.Pool({connectionString:ownerUrl});
  const repo=new PostgresRepository(pool);
  const config=loadConfig({NODE_ENV:'test',DATABASE_URL:runtimeUrl,ALLOWED_ORIGINS:origin,COOKIE_SECURE:'false',CLAMAV_REQUIRED:'false'});
  const make=()=>createApp({config,repository:repo,drive:new FakeDrive(),scanner:new FakeScanner()});
  const [first,second]=await Promise.all([make(),make()]);
  const secondUrl=await second.listen({port:0,host:'127.0.0.1'});
  const uuids=[],roomId=randomUUID(),roomPath=collection+'/'+roomId;
  async function member(role='student',section=false,enrolled=true) {
    const label=randomUUID();
    const user=await repo.createUser({publicId:label,email:label+'@example.invalid',passwordHash:'testing',firstName:'Test',lastName:'Seminar',displayName:label,role});
    uuids.push(user.id);
    if(enrolled) await owner.query(role==='student'?"INSERT INTO course_enrollments(student_user_id,course_code) VALUES($1,'MCV4U')":"INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,'MCV4U')",[user.id]);
    if(section) await owner.query("INSERT INTO course_test_members(course_code,user_id) VALUES('MCV4U',$1)",[user.id]);
    const sid=randomUUID(),token=randomUUID(),csrf=csrfTokenFor(sid,config.csrfSecret);
    await repo.createSession({id:sid,userId:user.id,tokenHash:sha256(token),csrfTokenHash:sha256(csrf),expiresAt:new Date(Date.now()+3600000)});
    return {id:user.id,label,headers:{cookie:config.cookieName+'='+token,origin,'x-csrf-token':csrf}};
  }
  async function hit(user,path,body,status=200) {
    const res=await first.inject({method:body?'POST':'GET',url:path,headers:user?.headers||{},payload:body});
    assert.equal(res.statusCode,status,res.body.slice(0,500));return res.json();
  }
  const command=(type,fields={})=>({type,requestId:randomUUID(),...fields});
  let live;
  try {
    const [teacher,student,peer,hidden,other,outsider]=await Promise.all([member('teacher'),member(),member(),member(),member('student',true),member('student',false,false)]);
    const act=(user,body,status=200)=>hit(user,roomPath+'/actions',body,status);
    await t.test('preparation is private and access respects assigned section, course and CSRF',async()=>{
      const body={id:roomId,title:'Reasoning seminar',board:[{text:'A board sketch with $x^2$.',prompt:'What does the graph show?'},{text:'Unreleased second step.'}]};
      await hit(null,collection,undefined,401);
      await hit(outsider,collection,undefined,403);
      await hit(student,collection,body,403);
      await hit({...teacher,headers:{...teacher.headers,'x-csrf-token':'bad'}},collection,body,403);
      assert.equal((await hit(teacher,collection,body)).stage,'prepared');
      assert.equal((await hit(teacher,collection,body)).stage,'prepared');
      assert.equal((await hit(student,collection)).rooms.some(x=>x.id===roomId),false);
      await hit(student,roomPath,undefined,404);
      await act(teacher,command('release',{cursor:0}));
      const view=await hit(student,roomPath);
      assert.equal(view.stage,'board');
      assert.equal(view.board,undefined);
      assert.equal(JSON.stringify(view).includes('Unreleased second step'),false);
      assert.equal(JSON.stringify(view).includes('What does the graph show?'),false);
      await hit(other,roomPath,undefined,404);
      await hit(other,roomPath+'/stream',undefined,404);
      await hit(student,roomPath+'/transcript',undefined,409);
      await act(student,command('open',{cursor:1}),403);
    });
    await t.test('persistent SSE replays to a second process and carries later public board actions',async()=>{
      const controller=new AbortController();
      live=controller;
      const response=await fetch(secondUrl+roomPath+'/stream?after=0',{headers:student.headers,signal:controller.signal});
      assert.equal(response.status,200);
      assert.match(response.headers.get('content-type'),/text\/event-stream/);
      assert.equal(response.headers.get('access-control-allow-credentials'),'true');
      const reader=response.body.getReader(),decoder=new TextDecoder();
      let stream='';
      const until=async mark=>{while(!stream.includes(mark)){const {done,value}=await reader.read();assert.equal(done,false);stream+=decoder.decode(value);}};
      await until('id: 1\n');
      assert.equal(stream.includes('What does the graph show?'),false);
      const open=command('open',{cursor:1});
      await Promise.all([act(teacher,open),act(teacher,open)]);
      await until('id: 2\n');
      assert.match(stream,/What does the graph show/);
      controller.abort();live=undefined;await reader.cancel().catch(()=>{});
      await act(teacher,command('open',{cursor:1}),409);
    });
    await t.test('blind responses are visible only to their author and teacher; public spotlight has 1–3 selected texts and no identities',async()=>{
      const submit=command('respond',{stepIndex:0,text:'Selected reasoning A.'});
      await act(student,submit);await act(student,submit);
      await act(student,command('respond',{stepIndex:0,text:'Repeat.'}),409);
      await act(peer,command('respond',{stepIndex:0,text:'Selected reasoning B.'}));
      await act(hidden,command('respond',{stepIndex:0,text:'Unselected private text.'}));
      const own=await hit(student,roomPath);
      assert.equal(own.ownResponse,'Selected reasoning A.');
      assert.equal(own.pool,undefined);
      assert.equal(JSON.stringify(own).includes('Selected reasoning B'),false);
      assert.equal(own.cursor,2);
      const room=await hit(teacher,roomPath);
      assert.equal(room.pool.length,3);
      const ids=room.pool.filter(r=>!r.text.includes('Unselected')).map(r=>r.id);
      await act(teacher,command('spotlight',{cursor:2,ids:[]}),422);
      await act(teacher,command('spotlight',{cursor:2,ids:[ids[0],ids[0]]}),422);
      await act(teacher,command('spotlight',{cursor:2,ids:[randomUUID()]}),422);
      await act(teacher,command('spotlight',{cursor:2,ids}));
      const spot=(await hit(student,roomPath)).events.at(-1);
      assert.deepEqual(Object.keys(spot.payload).sort(),['responses','stepIndex']);
      assert.deepEqual(spot.payload.responses.sort(),['Selected reasoning A.','Selected reasoning B.']);
      const text=JSON.stringify(spot);
      for(const secret of [student.label,peer.label,hidden.label,'Unselected private text',...ids]) assert.equal(text.includes(secret),false);
      await act(peer,command('respond',{stepIndex:0,text:'Late.'}),409);
      await act(student,command('comment',{stepIndex:0,text:'This part is public.'}));
      await act(teacher,command('comment',{stepIndex:0,text:'Compare their assumptions.'}));
    });
    await t.test('active seminar heartbeat stores attendance and bounded observed ranges once',async()=>{
      await act(student,command('heartbeat',{seconds:0}));
      await owner.query("UPDATE text_seminar_attendance SET last_seen=clock_timestamp()-interval '12 seconds' WHERE room_id=$1 AND student_id=$2",[roomId,student.id]);
      const beat=command('heartbeat',{seconds:10});
      await Promise.all([act(student,beat),act(student,beat)]);
      const {rows:[r]}=await owner.query("SELECT COUNT(*)::int AS n,MAX(EXTRACT(EPOCH FROM upper(observed)-lower(observed)))::float AS seconds FROM course_engagement_intervals WHERE student_id=$1 AND source='seminar'",[student.id]);
      assert.equal(r.n,1);assert.ok(r.seconds>=9 && r.seconds<=10);
    });
    await t.test('finished searchable transcript excludes private material; cursor reconnect skips seen events',async()=>{
      await act(teacher,command('release',{cursor:5}));
      await act(teacher,command('finish',{cursor:6}));
      const transcript=await hit(student,roomPath+'/transcript');
      assert.deepEqual(transcript.events.map(e=>e.cursor),[1,2,3,4,5,6,7]);
      assert.equal(JSON.stringify(transcript).includes('Unselected private text'),false);
      assert.equal(JSON.stringify(transcript).includes('Compare their assumptions.'),true);
      assert.equal(JSON.stringify(transcript).includes(student.label),false);
      const stream=await fetch(secondUrl+roomPath+'/stream?after=0',{headers:{...student.headers,'Last-Event-ID':'5'}});
      const text=await stream.text();
      assert.match(text,/id: 6\n/);assert.match(text,/id: 7\n/);assert.doesNotMatch(text,/id: [1-5]\n/);
      await hit(other,roomPath+'/transcript',undefined,404);
      await act(student,command('comment',{stepIndex:1,text:'After finish'}),409);
    });
  } finally {
    live?.abort();await Promise.all([first.close(),second.close()]);
    await owner.query('DELETE FROM text_seminars WHERE id=$1',[roomId]);
    await owner.query('DELETE FROM course_engagement_intervals WHERE student_id=ANY($1::uuid[])',[uuids]);
    await owner.query('DELETE FROM app_users WHERE id=ANY($1::uuid[])',[uuids]);
    await Promise.all([pool.end(),owner.end()]);
  }
});
