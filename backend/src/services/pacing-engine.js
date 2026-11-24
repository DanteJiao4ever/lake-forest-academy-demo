import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { ApiError } from "../lib/errors.js";
import { courseCodeSchema, parse, uuidSchema } from "../lib/validation.js";
import { PostgresRepository } from "../db/postgres.js";
import { loadCoursePack } from "./course-packs.js";

const dayMs = 86400000;
const dayIndex = date=>Date.parse(date)/dayMs;
const addDays = (date,n)=>new Date((dayIndex(date)+n)*dayMs).toISOString().slice(0,10);
const torontoDate = ()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const fail = (status,code,message)=>{ throw new ApiError(status,code,message); };
const deny = ()=>fail(403,"PACING_UNAVAILABLE","Course pacing is unavailable for this section.");
const evidenceFields = {version:z.string().min(1).max(32),requestId:uuidSchema,baseAttempt:z.number().int().min(0).max(100000)};
const answer = z.string().trim().min(1).max(6000);
const exerciseSchema = z.object({...evidenceFields,exerciseId:z.string().max(128),answer,reasoning:z.string().trim().min(1).max(6000)}).strict();
const quizSchema = z.object({...evidenceFields,answers:z.record(z.string().max(128),answer)}).strict();
const dateCols = 'start_date::text AS "startDate", end_date::text AS "endDate", weeks, mode, version';
const classQuery='SELECT enabled,'+dateCols+' FROM pacing_section_configs WHERE course_code=$1 ORDER BY revision DESC LIMIT 1';
const scopeSql="SELECT in_course_test_section($1,$2) AND classroom_rollout_enabled($1,$2) AS enabled";
const milestones = [[0.5,"midterm","Midterm assessment"],[0.8,"booking","Final assessment booking"],[1,"completion","Course completion review"]];

const sources = [
  {
    "name": "distribution-lab.md",
    "title": "Discrete and continuous distributions lab",
    "type": "text/plain; charset=utf-8",
    "units": [
      2
    ],
    "digest": "b8d7c9bbc656267b521b66393a4d265eb768650a9b2a6a779ed917fe9971b22b"
  },
  {
    "name": "data-lab.md",
    "title": "Toronto climate investigation and data dictionary",
    "type": "text/plain; charset=utf-8",
    "units": [
      3,
      4,
      5
    ],
    "digest": "bf4ad2eb40f81d9e85b768f5039fc43b4fc76fe6d311e72270af857782dcffa8"
  },
  {
    "name": "toronto-2023.csv",
    "title": "Toronto daily observations (CSV)",
    "type": "text/csv; charset=utf-8",
    "units": [
      3,
      4,
      5
    ],
    "digest": "fc595f5b032eed89fabbac554b18e7e64a95acc626ac7a9c9dd007643a164e12"
  },
  {
    "name": "toronto-distributions.png",
    "title": "Toronto climate charts",
    "type": "image/png",
    "units": [
      3,
      4,
      5
    ],
    "digest": "d323b456755a7ac2d509d1267b8501665b9146de6b89ad6948f188bec5a50ea8"
  }
];
const moduleSources = module => sources.filter(source=>source.units.includes(module.unitNumber));

function configDto({startDate,endDate,weeks,mode}) { return {startDate,endDate,weeks,mode}; }
const attemptSelect = `SELECT a.*,r.decision,r.feedback AS review_feedback FROM pacing_attempts a LEFT JOIN pacing_attempt_reviews r ON r.attempt_id=a.id`;
function attemptDto(a) {
  return {id:a.id,number:a.attempt_number,savedAt:a.saved_at,...a.payload,...a.result,
    ...(a.decision ? {decision:a.decision,teacherFeedback:a.review_feedback} : {})};
}

export function buildTimeline(pack,config,progress,attempts,today=torontoDate()) {
  const count = dayIndex(config.endDate)-dayIndex(config.startDate)+1;
  const total = pack.modules.reduce((sum,m)=>sum+m.minutes,0);
  const days = Array.from({length:count},(_,i)=>({date:addDays(config.startDate,i),minutes:0,modules:[]}));
  let planned=0,completed=0;
  const passed = m=>attempts.some(a=>a.module_number===m.number && a.kind==="checkpoint" && a.result.passed===true);
  const modules=pack.modules.map((m,index)=>{
    const start=planned;
    planned+=m.minutes;
    const first=Math.min(count-1,Math.floor(start*count/total));
    const last=Math.max(first,Math.min(count-1,Math.ceil(planned*count/total)-1));
    if(m.minutes===0) days[first].modules.push(m.number);
    for(let i=first;i<=last;i++) {
      const minutes=Math.min(planned,Math.floor((i+1)*total/count))-Math.max(start,Math.floor(i*total/count));
      if(minutes>0) {days[i].minutes+=minutes;days[i].modules.push(m.number);}
    }
    const old=progress.find(v=>v.moduleNumber===m.number);
    const finished=old && old.status!=="locked" && (old.status==="completed" || passed(m));
    if(finished) completed+=m.minutes;
    const attempted=attempts.some(a=>a.module_number===m.number && ["exercise","checkpoint"].includes(a.kind));
    const releaseDate=addDays(config.startDate,Math.floor(first/7)*7);
    let activityEnd=start;
    const activities=(m.activities??[]).map(({title,minutes})=>{
      activityEnd+=minutes;
      const due=Math.max(first,Math.min(last,Math.ceil(activityEnd*count/total)-1));
      return {title,minutes,targetDate:days[due].date};
    });
    const weekly=config.mode!=="mastery_gated";
    const mastery=config.mode!=="weekly_drip";
    let reason=null;
    if (!old || old.status==="locked") reason=old?.integrityRequired ? "integrity" : "course_module";
    else if (!finished && !old.override?.active && !attempted && old.status!=="in_progress") {
      if (today<config.startDate || (weekly && today<releaseDate)) reason="release_date";
      else if (mastery && index>0 && !passed(pack.modules[index-1])) reason="previous_checkpoint";
    }
    return {id:m.id,number:m.number,title:m.title,minutes:m.minutes,startDate:days[first].date,endDate:days[last].date,
      activities,releaseDate,status:reason?"locked":finished?"completed":attempted?"in_progress":old.status,reason,
      checkpointPassed:passed(m)};
  });
  const progressPercent=Math.floor(100*completed/total);
  return {today,days,modules,progressPercent,endDate:config.endDate,totalMinutes:total,
    weeklyMinutes:Math.round(total*7/count),weeks:Math.ceil(count/7),
    milestones:milestones.map(([fraction,id,title])=>{
      let remaining=0,available=completed;
      for(const m of modules) {
        if(available>=fraction*total) break;
        if(m.status!=="completed" && m.minutes>0){remaining++;available+=m.minutes;}
      }
      return {id,title,date:days[Math.ceil(fraction*count)-1].date,eligible:completed>=fraction*total,remainingModules:remaining};
    })};
}

function exerciseResult(ex,m,body) {
  const key=m[ex.id];
  if (!key) fail(503,"MARKING_UNAVAILABLE","The pinned feedback is unavailable.");
  if (ex.type==="choice" && !ex.choices.includes(body.answer)) fail(422,"INVALID_ANSWER","Choose a listed option.");
  if (ex.type==="numeric" && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(body.answer))
    fail(422,"INVALID_ANSWER","Enter a finite number.");
  if (ex.type==="numeric" && !Number.isFinite(Number(body.answer))) fail(422,"INVALID_ANSWER","Enter a finite number.");
  const correct=ex.type==="choice" ? body.answer===key.answer : ex.type==="numeric" ? Math.abs(Number(body.answer)-Number(key.answer)) <= (key.calculation?.tolerance ?? 0) : null;
  return {correct,feedback:correct===true ? key.solution : (Object.hasOwn(key.distractors??{},body.answer)?key.distractors[body.answer]:key.hint),readingId:ex.readingId,
    ...(correct===null ? {reviewRequired:true} : {})};
}
function quizResult(m,marking,body) {
  const ids=m.checkpoint.exerciseIds;
  if (!isDeepStrictEqual([...ids].sort(),Object.keys(body.answers).sort())) fail(422,"INVALID_CHECKPOINT","Answer each checkpoint question.");
  const missedReadingIds=new Set(),itemFeedback=[];
  let correctCount=0;
  for(const id of ids) {
    const ex=m.exercises.find(x=>x.id===id);
    if (!ex || !["choice","numeric"].includes(ex.type)) fail(503,"CHECKPOINT_UNAVAILABLE","The checkpoint is unavailable.");
    const result=exerciseResult(ex,marking,{answer:body.answers[id]});
    if(ex.ktca) itemFeedback.push({exerciseId:id,correct:result.correct,feedback:result.feedback,readingId:ex.readingId,ktca:ex.ktca});
    if(result.correct) correctCount++;
    else missedReadingIds.add(ex.readingId);
  }
  return {correctCount,total:ids.length,passed:correctCount/ids.length>=m.checkpoint.threshold,missedReadingIds:[...missedReadingIds],...(itemFeedback.length?{itemFeedback}:{})};
}

export function registerCoursePacing(app,{repository,requireRoles,requireCsrf,packRoot}) {
  const base="/v1/courses/:courseCode/pacing";
  function route(method,suffix,handler) {
    app.route({url:base+suffix,method,bodyLimit:65536,preHandler:[requireRoles("student"),...(method==="POST"?[requireCsrf]:[])],
      async handler(request,reply) {
        reply.header("Cache-Control","private, no-store");
        const code=parse(courseCodeSchema,request.params.courseCode);
        const user=request.auth.user;
        if (code !== "MDM4U" || request.query.edition !== undefined || !repository.pool?.connect) deny();
        const db=await repository.pool.connect();
        try {
          await db.query("BEGIN");
          await db.query("SELECT pg_advisory_xact_lock_shared(hashtextextended($1,0))",["pacing-section:"+code]);
          const repo=new PostgresRepository(db);
          if (!await repo.canAccessCourse(user,code)) deny();
          const {rows:[scope]}=await db.query(scopeSql,[code,user.id]);
          if (!scope?.enabled) deny();
          const {rows:[section]}=await db.query(classQuery,[code]);
          if (!section?.enabled) deny();
          const result=await handler({db,repo,user,code,section,baseUrl:"/v1/courses/"+code+"/pacing",request,reply});
          await db.query("COMMIT");
          return result;
        } catch(e) { await db.query("ROLLBACK");throw e; }
        finally { db.release(); }
      }});
  }
  async function packFor(ctx) {
    const {rows:[pin]}=await ctx.db.query("SELECT manifest_sha256 AS sha256,version,policy FROM pacing_pack_versions WHERE course_code=$1 AND version=$2",[ctx.code,ctx.section.version]);
    if(!pin) fail(503,"PACK_UNAVAILABLE","The pinned course materials are temporarily unavailable.");
    const pack=await loadCoursePack(ctx.code,pin,packRoot);
    if(!isDeepStrictEqual(pin.policy,pack.manifest.policy)) fail(503,"POLICY_MISMATCH","The approved assessment policy is unavailable.");
    return pack;
  }
  // Assessment papers and marking guides are outside this student release.
  app.get(base+"/private/:id",async (_request,reply)=>{reply.header("Cache-Control","private, no-store");deny();});
  async function studentContext(ctx) {
    const pack=await packFor(ctx);
    const config=configDto(ctx.section);
    const progress=await ctx.repo.listStudentProgress(ctx.user.id,ctx.code);
    const {rows:attempts}=await ctx.db.query(attemptSelect+` WHERE a.student_id=$1 AND a.course_code=$2 AND a.version=$3 ORDER BY a.saved_at,a.attempt_number`,[ctx.user.id,ctx.code,pack.manifest.version]);
    const timeline=buildTimeline(pack.manifest,config,progress,attempts);
    return {pack,config,attempts,timeline};
  }
  route("GET","",async ctx=>{
    const {pack,config,timeline}=await studentContext(ctx);
    return {enabled:true,courseCode:ctx.code,version:pack.manifest.version,policy:pack.manifest.policy,config,...timeline};
  });

  function getModule(c,number) {
    const n=Number(parse(z.string().regex(/^(0|[1-9]\d?)$/),number));
    const m=c.pack.manifest.modules.find(m=>m.number===n);
    if(!m) fail(404,"MODULE_NOT_FOUND","Choose a course module.");
    const schedule=c.timeline.modules.find(row=>row.number===n);
    if(schedule.status==="locked") fail(409,"MODULE_LOCKED","This module is locked ("+schedule.reason+").");
    return {m,schedule,unit:c.pack.manifest.units.find(u=>u.number===m.unitNumber)};
  }
  function moduleDto(ctx,c,{m,schedule,unit}) {
    const rows=c.attempts.filter(a=>a.module_number===m.number);
    const targetDate=schedule.endDate;
    const assignmentId=m.unitAssignments?.includes(unit?.assignmentId) ? unit.assignmentId : null;
    const itemAttempts=(kind,id)=>rows.filter(a=>a.kind===kind && a.item_id===id).map(attemptDto);
    return {id:m.id,number:m.number,title:m.title,version:c.pack.manifest.version,minutes:m.minutes,
      startDate:schedule.startDate,endDate:targetDate,status:schedule.status,activities:schedule.activities,
      sources:moduleSources(m).map(({title,name})=>({title,url:ctx.baseUrl+"/modules/"+m.number+"/sources/"+name})),
      readings:m.readings.map(({id,title,paragraphs,workedExample,cue})=>({id,title,paragraphs,workedExample,cue,targetDate:schedule.activities[0]?.targetDate??schedule.startDate})),
      exercises:m.exercises.map(({id,type,title,prompt,readingId,choices,reasonPrompt,worksheetRef,ktca,checkpointOnly,readback})=>{
        const attempts=itemAttempts("exercise",id), key=c.pack.marking[id];
        const feedback=attempts.length ? {hint:key.hint,hints:key.hints,solution:key.solution,calculation:key.calculation,rubric:key.rubric} : {};
        return {id,type,title,prompt,readingId,choices,reasonPrompt,worksheetRef,ktca,checkpointOnly,readback:typeof readback==="string"?readback:undefined,targetDate:schedule.activities[1]?.targetDate??targetDate,attempts,...feedback};
      }),
      checkpoint:{id:m.checkpoint.id,threshold:m.checkpoint.threshold,readingIds:m.checkpoint.readingIds,
        exerciseIds:m.checkpoint.exerciseIds,targetDate:schedule.activities[2]?.targetDate??targetDate,attempts:itemAttempts("checkpoint",m.checkpoint.id)},
      assignmentId,unitAssignment:assignmentId?{assignmentId,title:unit.assignmentTitle,instructions:unit.instructions,
        steps:unit.steps,remoteAlternative:unit.remoteAlternative,targetDate,
      }:null,worksheetUrl:unit?ctx.baseUrl+"/modules/"+m.number+"/worksheet":null};
  }
  route("GET","/modules/:number",async ctx=>{
    const c=await studentContext(ctx);
    return moduleDto(ctx,c,getModule(c,ctx.request.params.number));
  });
  route("GET","/modules/:number/worksheet",async ctx=>{
    const c=await studentContext(ctx), {unit}=getModule(c,ctx.request.params.number);
    if(!unit) fail(404,"WORKSHEET_NOT_FOUND","No unit worksheet is available.");
    ctx.reply.type("text/plain; charset=utf-8");
    return (await c.pack.worksheet(unit)).toString("utf8");
  });
  route("GET","/modules/:number/sources/:name",async ctx=>{
    const c=await studentContext(ctx), {m}=getModule(c,ctx.request.params.number);
    const item=moduleSources(m).find(x=>x.name===ctx.request.params.name);
    if(!item) fail(404,"SOURCE_NOT_FOUND","Choose a resource listed in this module.");
    ctx.reply.type(item.type);
    return c.pack.source(item);
  });
  async function writeEvidence(ctx,c,body,kind,moduleNumber,itemId,payload,score) {
    if(body.version!==c.pack.manifest.version) fail(409,"PACK_VERSION_CHANGED","Reload the pinned course pack.");
    const actor=ctx.user.id;
    await ctx.db.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",["pacing-evidence:"+actor]);
    const {rows:[prior]}=await ctx.db.query("SELECT * FROM pacing_attempts WHERE student_id=$1 AND request_id=$2",[actor,body.requestId]);
    if(prior) {
      if(prior.course_code!==ctx.code || prior.version!==body.version || prior.module_number!==moduleNumber ||
        prior.item_id!==itemId || prior.kind!==kind ||
        (body.baseAttempt!=null && prior.attempt_number!==body.baseAttempt+1) || !isDeepStrictEqual(prior.payload,payload))
        fail(409,"RETRY_CONFLICT","This request ID already records different work.");
      return;
    }
    const {rows:[last]}=await ctx.db.query(`SELECT count(*)::int AS count FROM pacing_attempts
      WHERE student_id=$1 AND course_code=$2 AND version=$3 AND module_number=$4 AND kind=$5 AND item_id=$6`,[actor,ctx.code,body.version,moduleNumber,kind,itemId]);
    if(body.baseAttempt!=null && body.baseAttempt!==last.count) fail(409,"ATTEMPT_CONFLICT","Refresh to see the latest attempt.");
    const result=score();
    await ctx.db.query(`INSERT INTO pacing_attempts(student_id,course_code,version,module_number,kind,item_id,attempt_number,request_id,payload,result)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[actor,ctx.code,body.version,moduleNumber,kind,itemId,last.count+1,body.requestId,payload,result]);
  }
  for(const [suffix,kind] of [["attempts","exercise"],["checkpoint","checkpoint"]]) {
    route("POST","/modules/:number/"+suffix,async ctx=>{
      const c=await studentContext(ctx), {m}=getModule(c,ctx.request.params.number);
      if(kind==="exercise") {
        const b=parse(exerciseSchema,ctx.request.body), ex=m.exercises.find(x=>x.id===b.exerciseId);
        if(!ex || ex.checkpointOnly) fail(404,"EXERCISE_NOT_FOUND","Choose an exercise from this module.");
        await writeEvidence(ctx,c,b,kind,m.number,ex.id,{answer:b.answer,reasoning:b.reasoning},()=>exerciseResult(ex,c.pack.marking,b));
      } else {
        const b=parse(quizSchema,ctx.request.body);
        await writeEvidence(ctx,c,b,kind,m.number,m.checkpoint.id,{answers:b.answers},()=>quizResult(m,c.pack.marking,b));
      }
      const updated=await studentContext(ctx);
      return moduleDto(ctx,updated,getModule(updated,ctx.request.params.number));
    });
  }
  function findMilestone(c,id) {
    const milestone=c.timeline.milestones.find(x=>x.id===id);
    if (!milestone) fail(404,"MILESTONE_NOT_FOUND","Choose a course milestone.");
    return milestone;
  }
  async function milestoneDto(c,id) {
    const milestone=findMilestone(c,id);
    const {midterm,final}=c.pack.manifest;
    const source=id==="midterm" ? [["Study guide",midterm.studyGuide],["Mock midterm",midterm.mock]] :
      [["Culminating task",final.culminating],["Exam blueprint",final.blueprint],["Mock final",final.mock]];
    const materials=source.flatMap(([title,lines])=>lines.map(text=>({title,text})));
    return {...milestone,materials,tasks:[],attempts:[],requests:[]};
  }
  route("GET","/milestones/:id",async ctx=>milestoneDto(await studentContext(ctx),ctx.request.params.id));
  route("POST","/milestones/midterm/responses",async ()=>deny());
  route("POST","/milestones/booking/requests",async ()=>deny());
}
