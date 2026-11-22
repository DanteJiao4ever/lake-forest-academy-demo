import { classroomFixture } from "../backend/test/classroom-rollout-fixture.js";
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import test from 'node:test';
import {chromium} from 'playwright-core';
import {createServer} from 'vite';
const ownerUrl=process.env.INTERACTIVE_TEST_OWNER_URL,runtimeUrl=process.env.INTERACTIVE_TEST_RUNTIME_URL;


test('instructor and mobile learner complete a seminar through the mounted academic workspace', {skip:!(ownerUrl&&runtimeUrl)},async(t)=>{
  await classroomFixture(t, ownerUrl, "MCV4U");
  const pg=createRequire(new URL('../backend/package.json',import.meta.url))('pg');
  const [{createApp},{loadConfig},{csrfTokenFor,sha256},{PostgresRepository},{FakeDrive,FakeScanner}]=await Promise.all([
    import('../backend/src/app.js'),import('../backend/src/config.js'),import('../backend/src/lib/crypto.js'),
    import('../backend/src/db/postgres.js'),import('../backend/test/fakes.js')
  ]);
  const pool=new pg.Pool({connectionString:runtimeUrl}),owner=new pg.Pool({connectionString:ownerUrl});
  const repo=new PostgresRepository(pool);
  const pages=[],users=[],errors=[];
  let browser,app;
  let apiOrigin;
  const server=await createServer({configFile:false,logLevel:'error',server:{host:'127.0.0.1',port:0},plugins:[{
    name:'seminar-test',configureServer(vite){
      vite.middlewares.use((req,res,next)=>{
        if(req.url!=='/seminar-test')return next();
        res.setHeader('Content-Type','text/html');
        res.end('<!doctype html><meta name="viewport" content="width=device-width"><script type="module">import "/src/learning/standalone.tsx";const el=document.createElement("lfa-academic-workspace");el.connection={kind:"seminar",courseCode:"MCV4U",endpoint:'+JSON.stringify(apiOrigin)+',csrf:()=>window.testData.csrf,role:window.testData.role,returnHref:"#/course/mcv4u"};document.body.appendChild(el);</script>');
      });
    }
  }]});
  const title='Seminar QA '+randomUUID();
  try{
    await server.listen();
    const webOrigin=new URL(server.resolvedUrls.local[0]).origin;
    const config=loadConfig({NODE_ENV:'test',DATABASE_URL:runtimeUrl,ALLOWED_ORIGINS:webOrigin,COOKIE_SECURE:'false',CLAMAV_REQUIRED:'false'});
    app=await createApp({config,repository:repo,drive:new FakeDrive(),scanner:new FakeScanner()});
    apiOrigin=await app.listen({host:'127.0.0.1',port:0});
    browser=await chromium.launch({executablePath:process.env.LFA_TEST_BROWSER_EXECUTABLE});
    async function pageFor(role){
      const label=randomUUID(),user=await repo.createUser({publicId:label,email:label+'@example.invalid',passwordHash:'test',firstName:'Test',lastName:'User',displayName:'Test '+role,role});
      users.push(user.id);
      const sql=role==='student'?"INSERT INTO course_enrollments(student_user_id,course_code) VALUES($1,'MCV4U')":"INSERT INTO teacher_course_access(teacher_user_id,course_code) VALUES($1,'MCV4U')";
      await owner.query(sql,[user.id]);
      const id=randomUUID(),token=randomUUID(),csrf=csrfTokenFor(id,config.csrfSecret);
      await repo.createSession({id,userId:user.id,tokenHash:sha256(token),csrfTokenHash:sha256(csrf),expiresAt:new Date(Date.now()+3600000)});
      const context=await browser.newContext({viewport:role==='student'?{width:390,height:844}:{width:1280,height:900}});
      await context.addCookies([{name:config.cookieName,value:token,url:apiOrigin,httpOnly:true,sameSite:'Lax'}]);
      await context.addInitScript(data=>window.testData=data,{csrf,role});
      const page=await context.newPage();pages.push(page);page.setDefaultTimeout(15000);
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(webOrigin+'/seminar-test');await page.getByRole('heading',{name:'Text seminars',exact:true}).waitFor();
      return page;
    }
    const [teacher,student]=await Promise.all([pageFor('teacher'),pageFor('student')]);
    await teacher.getByText('Prepare a seminar',{exact:true}).click();
    await teacher.getByLabel('Seminar title').fill(title);
    await teacher.getByLabel('Board text').fill('## Evidence\n\nCompare $x^2$ with its slope.');
    await teacher.getByLabel('Blind prompt (optional)').fill('Where is the slope positive?');
    await teacher.getByRole('button',{name:'Save prepared seminar'}).click();
    await teacher.getByRole('button',{name:'Release board step 1'}).click();
    await teacher.locator('section .katex').waitFor();
    await student.getByRole('button',{name:title}).click();
    assert.equal(await student.getByText('Where is the slope positive?').count(),0);
    await teacher.getByRole('button',{name:'Open blind responses'}).click();
    const input=student.getByLabel('Private response for your teacher');
    await input.fill('The derivative is positive to the right of zero.');
    await student.getByRole('button',{name:'Submit blind response'}).click();
    await student.getByText('Submitted privately').waitFor();
    const checkbox=teacher.getByRole('checkbox',{name:/The derivative is positive/});
    await checkbox.check();await teacher.getByRole('button',{name:'Share selected responses'}).click();
    await student.getByRole('heading',{name:'Selected perspectives'}).waitFor();
    await student.getByLabel('Comment visible to the class').fill('Compare the negative input too.');
    await student.getByRole('button',{name:'Post class comment'}).click();
    await teacher.getByText('Compare the negative input too.',{exact:true}).waitFor();
    await teacher.getByRole('button',{name:'Finish seminar'}).click();
    await student.getByText('Download class transcript (JSON)').waitFor();
    const download=student.waitForEvent('download');
    await student.getByText('Download class transcript (JSON)').click();
    const file=await download;
    assert.match(file.suggestedFilename(),/^class-transcript-.*\.json$/);
    assert.ok(await student.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(errors,[]);
  }finally{
    await Promise.all(pages.map(p=>p.close().catch(()=>{})));
    await browser?.close();await server.close();await app?.close();
    await owner.query('DELETE FROM text_seminars WHERE created_by=ANY($1::uuid[])',[users]);
    await owner.query('DELETE FROM course_engagement_intervals WHERE student_id=ANY($1::uuid[])',[users]);
    await owner.query('DELETE FROM app_users WHERE id=ANY($1::uuid[])',[users]);
    await Promise.all([pool.end(),owner.end()]);
  }
});
