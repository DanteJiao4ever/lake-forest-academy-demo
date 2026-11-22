import { z } from "zod";
import { ApiError } from "../lib/errors.js";
import { assignmentIdSchema, courseCodeSchema, emailSchema, parse, uuidSchema } from "../lib/validation.js";
import { sha256 } from "../lib/crypto.js";
import { platformLearningTime } from "./learning-time.js";

const dimensions = ["K","T","C","A"];
const skillNames = ["responsibility","organization","independent-work","collaboration","initiative","self-regulation"];
const percentage = z.number().min(0).max(100);
const shortText = z.string().trim().min(1).max(1600).refine((s) => !s.includes("\0") && s.isWellFormed());
const fields = (names, rule) => z.object(Object.fromEntries(names.map(n=>[n,rule]))).strict();
const weights = fields(dimensions,percentage).refine(w=>Math.abs(dimensions.reduce((s,k)=>s+w[k],0)-100)<0.00001,"Weights must add to 100.");
const ratings = fields(skillNames,z.enum(["E","G","S","N"]));
const common = {requestId:uuidSchema,baseVersion:z.int().nonnegative()};
const action = (type,extra) => z.object({...common,type:z.literal(type),...extra}).strict();
const actions = z.discriminatedUnion("type",[
  action("plan",{date:z.iso.date(),percent:percentage}),
  action("skills",{period:z.enum(["midterm","final"]),ratings,comment:shortText}),
  action("rubric",{taskId:assignmentIdSchema,weights}),
  action("evidence",{taskId:assignmentIdSchema,rubricVersion:z.int().positive(),scores:fields(dimensions,percentage.nullable()),note:shortText}),
]);
const grants = z.object({courseCode:courseCodeSchema,studentId:assignmentIdSchema,observerEmail:emailSchema,action:z.enum(["grant","revoke"])}).strict();
const denied = () => { throw new ApiError(403,"INSIGHT_SCOPE_DENIED","You do not have access to this student in this course."); };
const conflict = () => { throw new ApiError(409,"INSIGHT_VERSION_CONFLICT","This record changed. Refresh before saving."); };

const scopeSql = `SELECT u.id,u.public_id AS "studentId",u.display_name AS "studentName",e.course_code AS "courseCode",
       in_course_test_section(e.course_code,u.id) AS "testSection"
  FROM course_enrollments e JOIN app_users u ON u.id=e.student_user_id
  JOIN insight_pilot_courses p ON p.course_code=e.course_code JOIN courses c ON c.code=e.course_code
 WHERE u.status='active' AND u.role='student' AND e.status='active' AND c.status='active'
   AND classroom_rollout_enabled(e.course_code,$1)
   AND ($3::text IS NULL OR e.course_code=$3) AND ($4::text IS NULL OR u.public_id=$4)
   AND in_course_test_section(e.course_code,$1)=in_course_test_section(e.course_code,u.id)
   AND ($2='teacher_admin' OR ($2='teacher' AND EXISTS
          (SELECT 1 FROM teacher_course_access t WHERE t.course_code=e.course_code AND t.teacher_user_id=$1))
        OR ($2='observer' AND EXISTS (SELECT 1 FROM observer_course_grants g WHERE g.active AND g.observer_id=$1
            AND g.student_id=u.id AND g.course_code=e.course_code AND g.test_section=in_course_test_section(e.course_code,u.id))))`;

async function scope(client,user,course,student) {
  const {rows:[s]}=await client.query(scopeSql,[user.id,user.role,course,student]);
  if (!s) denied();
  return s;
}

// Each published task contributes its most recent visible grade, including the
// last published version when a later draft or ungraded attempt exists.
const gradesSql = `SELECT gi.id,gi.title,gi.category,gi.max_score::float8 AS maximum,
       gi.weight_percent::float8 AS weight,g.percent,g.published_at AS "publishedAt"
  FROM gradebook_items gi
  LEFT JOIN LATERAL (
     SELECT percent,published_at FROM (
       SELECT 100.0*d.score/gi.max_score AS percent,d.published_at
       FROM student_gradebook_scores d WHERE d.gradebook_item_id=gi.id AND d.student_user_id=$2 AND d.published_at IS NOT NULL
       UNION ALL
       SELECT sg.score AS percent,sg.published_at FROM student_submissions sub JOIN submission_grades sg ON sg.submission_id=sub.id
       WHERE sub.student_user_id=$2 AND sub.course_code=gi.course_code AND sub.assignment_id=gi.assignment_id
         AND sub.status='submitted' AND sg.published_at IS NOT NULL
     ) published ORDER BY published_at DESC LIMIT 1
  ) g ON true WHERE gi.course_code=$1 AND gi.status='published' ORDER BY gi.position`;

const progressSql = `SELECT count(*)::int AS total,count(*) FILTER (WHERE p.status='completed')::int AS completed
   FROM course_modules m LEFT JOIN student_module_progress p ON p.module_id=m.id AND p.student_user_id=$2
   WHERE m.course_code=$1 AND m.status='published'`;

const activitySql = `SELECT max(stamp) AS last FROM (
   SELECT max(last_heartbeat) AS stamp FROM interactive_lesson_readers r
    JOIN interactive_lesson_bindings b USING(course_code,lesson_id) WHERE b.native_lesson_id IS NOT NULL AND r.course_code=$1 AND user_id=$2 AND test_section=$3
   UNION ALL SELECT max(upper(observed)) FROM course_engagement_intervals WHERE course_code=$1 AND student_id=$2 AND test_section=$3
   UNION ALL SELECT max(submitted_at) FROM student_submissions WHERE course_code=$1 AND student_user_id=$2
   UNION ALL SELECT max(p.updated_at) FROM student_module_progress p JOIN course_modules m ON m.id=p.module_id
        WHERE m.course_code=$1 AND p.student_user_id=$2 AND p.status IN ('completed','in_progress')
   UNION ALL SELECT max(a.updated_at) FROM student_activity_completions a JOIN module_activities ma ON ma.id=a.activity_id
        JOIN course_modules m ON m.id=ma.module_id WHERE m.course_code=$1 AND a.student_user_id=$2 AND a.status<>'waived'
 ) actual`;

export function riskSignals({lastActivity,recent,actual,plan},now=Date.now()) {
  const inactiveDays = lastActivity ? Math.max(0,(now-new Date(lastActivity).getTime())/86400000) : null;
  return {
    inactivity:{flag:inactiveDays === null ? null : inactiveDays>5,lastActivity,days:inactiveDays},
    scores:{flag:recent.length<2 ? null : recent.slice(0,2).every((x)=>x.percent<70),recent:recent.slice(0,2)},
    progress:{flag:actual === null || !plan ? null : plan.percent-actual>15,actual,plan:plan || null},
  };
}

function currentRecords(history) {
  const result={rubric:{},evidence:{},skills:{},plan:{}};
  for (const row of history) result[row.kind][row.key] ??= row;
  return result;
}

async function policyFor(client,course,id) {
  const {rows:[policy]}=await client.query(`SELECT p.version,p.task_weights AS weights FROM course_enrollments e
    JOIN insight_course_policies p ON p.course_code=e.course_code AND p.applies_to_enrolments_from<=e.enrolled_at
    WHERE e.course_code=$1 AND e.student_user_id=$2 ORDER BY p.applies_to_enrolments_from DESC LIMIT 1`,[course,id]);
  return policy;
}

async function detail(client,user,s,summaryOnly=false) {
  const [course,id,section]=[s.courseCode,s.id,s.testSection];
  const policy=await policyFor(client,course,id);
  const {rows:items}=await client.query(gradesSql,[course,id]);
  const tasks=items.map(t=>({...t,weight:policy?.weights[t.id] ?? 0}));
  const {rows:[progress]}=await client.query(progressSql,[course,id]);
  const {rows:[activity]}=await client.query(activitySql,[course,id,section]);
  const {rows:history}=await client.query(`SELECT id,kind,record_key AS key,version,data,created_at AS "createdAt" FROM insight_records
     WHERE course_code=$1 AND test_section=$2 AND (student_id=$3 OR student_id IS NULL)
     ORDER BY version DESC,created_at DESC`,[course,section,id]);
  const records=currentRecords(history);
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const plan=Object.values(records.plan).map(r=>r.data).filter(p=>p.date<=today).sort((a,b)=>b.date.localeCompare(a.date))[0];
  const published=tasks.filter(x=>x.percent!==null).map(x=>({...x,percent:Number(x.percent)})).sort((a,b)=>b.publishedAt-a.publishedAt);
  const actual=progress.total ? 100*progress.completed/progress.total : null;
  const risk=riskSignals({lastActivity:activity.last,actual,plan,recent:published.map(({title,percent,publishedAt})=>({title,percent,publishedAt}))});
  if(summaryOnly) return {courseCode:course,studentId:s.studentId,studentName:s.studentName,risk};
  const {plannedHours,observedSeconds}=await platformLearningTime(client,course,id,section);
  const {rows:[verification]}=await client.query(`SELECT coalesce(sum(minutes),0)::float8 AS minutes
    FROM course_evidence_records WHERE course_code=$1 AND student_id=$2 AND test_section=$3`,[course,id,section]);
  const learningTime={plannedHours,observedSeconds:observedSeconds.all,verifiedMinutes:verification.minutes};
  const ktca={};
  for(const key of dimensions) {
    let sum=0,weight=0;
    for(const entry of Object.values(records.evidence)) {
      const d=entry.data;
      if (d.scores[key]===null || !d.weights[key]) continue;
      const w=d.taskWeight*d.weights[key]/100;
      sum+=w*d.scores[key]; weight+=w;
    }
    ktca[key]=weight ? Math.round(10*sum/weight)/10 : null;
  }
  const covered=published.reduce((n,t)=>n+t.weight,0);
  const courseWeights={};
  for (const t of tasks) courseWeights[t.category]=(courseWeights[t.category]||0)+t.weight;
  const result={studentId:s.studentId,studentName:s.studentName,courseCode:course,section:section?"TEST":"regular",
    policyVersion:policy?.version || null,risk,progress,learningTime,ktca,history,records,tasks,courseWeights,gradedWeight:covered,
    publishedAverage:covered ? Math.round(published.reduce((n,t)=>n+t.weight*t.percent,0)*10/covered)/10 : null};
  if (user.role==="teacher_admin") {
    const {rows}=await client.query(`SELECT u.email::text AS email,g.active,g.changed_at AS "changedAt"
      FROM observer_course_grants g JOIN app_users u ON u.id=g.observer_id WHERE g.student_id=$1 AND g.course_code=$2 AND g.test_section=$3
      ORDER BY u.email`,[id,course,section]);
    result.grants=rows;
  }
  return result;
}

async function save(client,user,s,a) {
  const student = a.type==="rubric" ? null : s.id;
  const key=a.taskId || a.period || a.date;
  const scope=[s.courseCode,s.testSection,student,a.type,key];
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[JSON.stringify(scope)]);
  const {rows:[canonical]}=await client.query("SELECT $1::jsonb::text AS body",[JSON.stringify([scope,a])]);
  const fingerprint=sha256(canonical.body);
  const {rows:[prior]}=await client.query("SELECT fingerprint FROM insight_records WHERE author_id=$1 AND request_id=$2",[user.id,a.requestId]);
  if(prior) { if(prior.fingerprint!==fingerprint) conflict(); return; }
  const {rows:[current]}=await client.query(`SELECT max(version) AS version FROM insight_records WHERE course_code=$1 AND test_section=$2
    AND student_id IS NOT DISTINCT FROM $3::uuid AND kind=$4 AND record_key=$5`,scope);
  if((current.version || 0)!==a.baseVersion) conflict();
  const {baseVersion,requestId,type,...data}=a;
  if(a.taskId) {
    const {rows:[task]}=await client.query("SELECT weight_percent::float8 AS weight FROM gradebook_items WHERE id=$1 AND course_code=$2 AND status='published'",[a.taskId,s.courseCode]);
    if(!task) throw new ApiError(422,"TASK_UNAVAILABLE","Select a published task from this course.");
    if(type==="evidence") {
      const {rows:[rubric]}=await client.query(`SELECT version,data FROM insight_records WHERE kind='rubric' AND record_key=$1 AND course_code=$2 AND test_section=$3 ORDER BY version DESC LIMIT 1`,[a.taskId,s.courseCode,s.testSection]);
      if(!rubric || rubric.version!==a.rubricVersion) conflict();
      const policy=await policyFor(client,s.courseCode,s.id);
      if(!policy || !Object.hasOwn(policy.weights,a.taskId)) throw new ApiError(409,"POLICY_UNAVAILABLE","This task has no weight in the student’s approved policy.");
      data.weights=rubric.data.weights; data.taskWeight=policy.weights[a.taskId]; data.policyVersion=policy.version;
      if(dimensions.some(k=>data.weights[k]>0 && data.scores[k]===null)) throw new ApiError(422,"EVIDENCE_INCOMPLETE","Record a score for every weighted criterion.");
      data.taskScore=Math.round(dimensions.reduce((n,k)=>n+data.weights[k]*(data.scores[k]||0),0)/10)/10;
    }
  }
  await client.query(`INSERT INTO insight_records(course_code,test_section,student_id,kind,record_key,version,data,author_id,request_id,fingerprint)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[...scope,baseVersion+1,data,user.id,requestId,fingerprint]);
}

async function grant(client,user,b) {
  const s=await scope(client,user,b.courseCode,b.studentId);
  const {rows:[observer]}=await client.query(`SELECT id FROM app_users WHERE email=$1 AND role='observer' AND status='active'
    AND ($2='revoke' OR in_course_test_section($3,id)=$4)`,[b.observerEmail,b.action,s.courseCode,s.testSection]);
  if(!observer) throw new ApiError(404,"OBSERVER_UNAVAILABLE","No matching observer account is available for this section.");
  await client.query(`INSERT INTO observer_course_grants(observer_id,student_id,course_code,test_section,active,changed_by)
    VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(observer_id,student_id,course_code,test_section)
    DO UPDATE SET active=excluded.active,changed_by=excluded.changed_by,changed_at=clock_timestamp()`,
    [observer.id,s.id,s.courseCode,s.testSection,b.action==="grant",user.id]);
  await client.query(`INSERT INTO audit_events(request_id,actor_user_id,action,resource_type,resource_id,outcome)
    VALUES($1,$2,$3,'observer_grant',$4,'success')`,[crypto.randomUUID(),user.id,"observer."+b.action,[observer.id,s.courseCode,s.id,s.testSection].join("/")]);
  return detail(client,user,s);
}

export function registerClassInsights(app,{repository,requireRoles,requireCsrf}) {
  const readRoles=requireRoles("observer","teacher","teacher_admin"),writeRoles=requireRoles("teacher","teacher_admin");
  function route(fn,write=false) {
    return async (req,reply) => {
      reply.header("Cache-Control","private, no-store");
      const client=await repository.pool.connect();
      try{
        await client.query(write?"BEGIN":"BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
        const data=await fn(client,req.auth.user,req);
        await client.query("COMMIT"); return data;
      }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
    };
  }
  app.get("/v1/insights/scopes",{preHandler:[readRoles]},route(async (client,user)=>{
    const {rows}=await client.query(scopeSql+' ORDER BY e.course_code,u.display_name,u.public_id',[user.id,user.role,null,null]);
    return {role:user.role,scopes:rows.map(({id,...visible})=>visible)};
  }));
  app.get("/v1/insights/alerts",{preHandler:[writeRoles]},route(async(c,u,req)=>{
    const q=parse(z.object({courseCode:courseCodeSchema.optional(),offset:z.coerce.number().int().min(0).default(0)}).strict(),req.query);
    const {rows}=await c.query(scopeSql+' ORDER BY e.course_code,u.public_id LIMIT 26 OFFSET $5',[u.id,u.role,q.courseCode||null,null,q.offset]);
    const students=[];
    for(const s of rows.slice(0,25)) students.push(await detail(c,u,s,true));
    return {students,nextOffset:rows.length>25?q.offset+25:null};
  }));
  const path="/v1/insights/:courseCode/:studentId";
  const student=(client,user,req)=>scope(client,user,parse(courseCodeSchema,req.params.courseCode),parse(assignmentIdSchema,req.params.studentId));
  app.get(path,{preHandler:[readRoles]},route(async (c,u,r)=>detail(c,u,await student(c,u,r))));
  app.post(path+"/actions",{preHandler:[writeRoles,requireCsrf]},route(async(c,u,r)=>{
    const s=await student(c,u,r);
    await save(c,u,s,parse(actions,r.body)); return detail(c,u,s);
  },true));
  app.post("/v1/insights/grants",{preHandler:[requireRoles("teacher_admin"),requireCsrf]},route((c,u,r)=>grant(c,u,parse(grants,r.body)),true));
}
