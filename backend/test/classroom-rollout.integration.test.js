import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { PostgresRepository } from "../src/db/postgres.js";
import { csrfTokenFor, sha256 } from "../src/lib/crypto.js";
import { FakeDrive, FakeScanner } from "./fakes.js";
import { classroomFixture } from "./classroom-rollout-fixture.js";

const ownerUrl = process.env.INTERACTIVE_TEST_OWNER_URL;
const runtimeUrl = process.env.INTERACTIVE_TEST_RUNTIME_URL;
test("section release and rollback scope all classroom entry points and preserve saved work", {
  skip: !(ownerUrl && runtimeUrl),
}, async t => {
  const owner = await classroomFixture(t, ownerUrl, "MCV4U", false);
  const runtime = new pg.Pool({ connectionString: runtimeUrl });
  const repository = new PostgresRepository(runtime);
  const origin = "http://127.0.0.1:5173";
  const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: runtimeUrl, ALLOWED_ORIGINS: origin,
    COOKIE_SECURE: "false", CLAMAV_REQUIRED: "false" });
  const app = await createApp({ config, repository, drive: new FakeDrive(), scanner: new FakeScanner() });
  const ids = [];
  const course = "/v1/courses/MCV4U";
  const surfaces = ["/review-workspace","/academic-record","/seminars","/interactive-lessons/cia4u-demand-2-3"];
  const toggle = enabled => owner.query("UPDATE classroom_section_rollouts SET enabled=$1 WHERE course_code='MCV4U' AND test_section", [enabled]);

  async function member(role, section) {
    const publicId = randomUUID();
    const person = await repository.createUser({ publicId, email: publicId + "@example.invalid", passwordHash: "fixture",
      firstName:"QA", lastName:"Classroom", displayName:publicId, role });
    ids.push(person.id);
    if (role === "student") await repository.replaceEnrollments(person.id, ["MCV4U","ICS4U"]);
    if (section) await owner.query("INSERT INTO course_test_members VALUES ('MCV4U',$1), ('ICS4U',$1)", [person.id]);
    const token = randomUUID(), id = randomUUID(), csrf = csrfTokenFor(id, config.csrfSecret);
    await repository.createSession({ id, userId:person.id, tokenHash:sha256(token), csrfTokenHash:sha256(csrf), expiresAt:new Date(Date.now()+3600000) });
    return { publicId, headers:{ origin, cookie:config.cookieName+"="+token, "x-csrf-token":csrf } };
  }
  async function api(person,url,status=200,body) {
    const result = await app.inject({ method:body ? "POST" : "GET", url, headers:person.headers, payload:body });
    assert.equal(result.statusCode,status,url+" "+result.body.slice(0,250));
    return result.json();
  }
  async function catalog(person, enabled) {
    const courses = (await api(person,"/v1/courses")).data;
    assert.equal(courses.find(c => c.code === "MCV4U").classroomEnabled,enabled);
    assert.equal(courses.find(c => c.code === "ICS4U").classroomEnabled,false);
    const modules = (await api(person,course+"/modules")).data;
    const lesson = modules.flatMap(m=>m.lessons).find(l=>l.id==="MCV4U-U1-L3");
    assert.ok(lesson);
    assert.equal(lesson.interactiveLessonId,enabled ? "mcv4u-derivative-graphs" : undefined);
  }

  const room = { id:randomUUID(), title:"Continuity check", board:[{text:"Review the previous result."}] };
  try {
    await assert.rejects(runtime.query("UPDATE classroom_section_rollouts SET enabled=true WHERE false"), {code:"42501"});
    const student = await member("student",true), regular = await member("student",false);
    const admin = await member("teacher_admin",true), regularAdmin = await member("teacher_admin",false);
    for (const path of surfaces) await api(student,course+path,403);
    await catalog(student,false);
    await toggle(true);
    await catalog(student,true);
    await catalog(regular,false);
    for (const path of surfaces) {
      assert.equal((await api(regular,course+path,403)).error.code,"CLASSROOM_NOT_ENABLED");
      await api(student,course.replace("MCV4U","ICS4U")+path,403);
    }
    await api(admin,course+"/seminars",200,room);
    await api(student,course+"/academic-record");
    await api(admin,course+"/review-workspace");
    assert.ok((await api(admin,"/v1/insights/scopes")).scopes.some(s=>s.studentId===student.publicId));
    assert.deepEqual((await api(regularAdmin,"/v1/insights/scopes")).scopes,[]);
    await api(regularAdmin,"/v1/insights/MCV4U/"+regular.publicId,403);
    await toggle(false);
    await catalog(student,false);
    for (const path of surfaces) await api(admin,course+path,403);
    await api(admin,course+"/seminars/"+room.id,403);
    await api(admin,course+"/seminars",403,{...room,id:randomUUID()});
    await api(admin,"/v1/insights/MCV4U/"+student.publicId,403);
    assert.deepEqual((await api(admin,"/v1/insights/alerts?courseCode=MCV4U")).students,[]);
    await toggle(true);
    assert.equal((await api(admin,course+"/seminars/"+room.id)).title,room.title);
  } finally {
    await owner.query("DELETE FROM text_seminars WHERE id=$1",[room.id]);
    await owner.query("DELETE FROM app_users WHERE id=ANY($1::uuid[])",[ids]);
    await app.close();
    await repository.close();
  }
});
