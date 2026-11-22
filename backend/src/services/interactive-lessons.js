import { requireClassroomRollout } from "./classroom-rollout.js";
import { z } from "zod";
import { PostgresRepository } from "../db/postgres.js";
import { getLesson, publicLesson, evaluateCard, privateLessonReadiness } from "../lessons/catalog.js";
import { stableFingerprint } from "../lib/crypto.js";
import { ApiError } from "../lib/errors.js";
import { assignmentIdSchema, courseCodeSchema, parse, uuidSchema } from "../lib/validation.js";

const text = (max) => z.string().max(max).refine((s) => !s.includes("\0"), "Invalid text.");
const nonempty = (max) => text(max).refine((s) => s.trim().length > 0, "Text is required.");
const version = nonempty(64);
const anchor = z.object({
  version, paragraphId: assignmentIdSchema, exact: nonempty(4000), prefix: text(256), suffix: text(256),
}).strict();
const common = { requestId: uuidSchema, version };
const shape = (type, fields) => z.object({ ...common, type: z.literal(type), ...fields }).strict();
const diffSchema = z.object({ from: z.int().nonnegative(), removed: z.int().nonnegative(), inserted: text(16000) }).strict();
const skills = z.array(assignmentIdSchema).max(2).refine((s) => new Set(s).size === s.length);
const actionSchema = z.union([
  shape("card", { cardId: assignmentIdSchema, answer: z.record(z.string(), z.unknown()) }),
  shape("synthesisDraft", { cardId: assignmentIdSchema, text: text(16000), skills, doc: z.record(z.string(), z.unknown()), baseVersion: z.int().nonnegative(), diff: diffSchema.optional() }),
  shape("annotation", { anchor, color: z.enum(["yellow","green","blue","pink"]), text: text(4000).default("") }),
  shape("question", { anchor, text: nonempty(4000) }),
  shape("reply", { threadId: uuidSchema, text: nonempty(4000) }),
  shape("reply", { cardId: assignmentIdSchema, peerId: assignmentIdSchema, text: nonempty(4000) }),
  shape("endorse", { threadId: uuidSchema }),
  shape("featurePeer", { cardId: assignmentIdSchema, readerId: uuidSchema }),
  shape("scratchpad", { text: text(16000), baseRevision: z.int().nonnegative().optional() }),
  shape("heartbeat", { seconds: z.number().min(0).max(30), source: z.enum(["reading","assessment","writing"]).default("reading") }),
  shape("booking", { preferredAt: z.iso.datetime({ offset: true }), timeZone: nonempty(64) }),
  shape("bookingReview", { bookingId: uuidSchema, status: z.enum(["confirmed","declined"]) }),
]);

const fail = (status, code, message) => { throw new ApiError(status, code, message); };
const invalid = (message) => fail(422, "INVALID_LESSON_ACTION", message);
const missing = () => fail(404, "LESSON_RECORD_NOT_FOUND", "This lesson record is unavailable.");
const teacherOnly = () => fail(403, "TEACHER_REQUIRED", "This action requires a teacher.");
const emptyReader = () => ({ cards: {}, active_millis: 0, scratchpad: "", revision: 0 });
const findCard = (lesson, id) => lesson.cards.find((card) => card.id === id);
const unmetCards = (lesson, cards) => lesson.cards.filter((c) => c.required && !cards[c.id]?.completed).map((c) => c.id);
const commonScope = "r.course_code=$1 AND r.lesson_id=$2 AND r.test_section=$3";

function quotePosition(paragraph, a) {
  if (!paragraph || !a.exact) return -1;
  let start = -1;
  for (let i = paragraph.indexOf(a.exact); i >= 0; i = paragraph.indexOf(a.exact, i + 1)) {
    if (!paragraph.slice(0, i).endsWith(a.prefix) || !paragraph.slice(i + a.exact.length).startsWith(a.suffix)) continue;
    if (start >= 0) return -1;
    start = i;
  }
  return start;
}

function validateAnchor(lesson, a) {
  if (a.version !== lesson.version) fail(409, "LESSON_VERSION_CHANGED", "Reload the latest lesson before selecting text.");
  const paragraph = lesson.paragraphs.find((p) => p.id === a.paragraphId);
  if (quotePosition(paragraph?.text, a) < 0) invalid("Select a unique passage in the specified paragraph.");
}

function diffText(before, after) {
  let from = 0;
  while (from < before.length && from < after.length && before[from] === after[from]) from++;
  let left = before.length, right = after.length;
  while (left > from && right > from && before[left - 1] === after[right - 1]) { left--; right--; }
  return { from, removed: left - from, inserted: after.slice(from, right) };
}

function validateDraftDoc(doc) {
  const allowed = new Set(["doc","paragraph","text","blockquote","heading","bulletList","orderedList","listItem","hardBreak","hard_break","horizontalRule","codeBlock"]);
  const marks = new Set(["bold","italic","strike","code","underline"]);
  function visit(node, depth) {
    if (depth > 12 || !node || !allowed.has(node.type) || (node.type === "doc") !== (depth === 0)) return false;
    if (Object.keys(node).some((k) => !["type","attrs","marks","content","text"].includes(k))) return false;
    if (node.attrs && (typeof node.attrs !== "object" || Object.entries(node.attrs).some(([k,v]) => !["level","start","type"].includes(k) || (v !== null && !Number.isInteger(v))))) return false;
    if (node.marks && (!Array.isArray(node.marks) || node.marks.some((m) => !m || !marks.has(m.type) || Object.keys(m).length !== 1))) return false;
    if (node.type === "text") return typeof node.text === "string" && !node.text.includes("\0") && !node.content;
    return !node.text && (!node.content || (Array.isArray(node.content) && node.content.every((n) => visit(n, depth+1))));
  }
  if (!visit(doc,0)) invalid("The draft contains unsupported editor content.");
}

async function access(client, user, courseCode, lessonId) {
  const repo = new PostgresRepository(client);
  if (!await repo.canAccessCourse(user, courseCode)) fail(403, "COURSE_ACCESS_DENIED", "You do not have access to this course.");
  await requireClassroomRollout(client, courseCode, user.id);
  const { rows: [binding] } = await client.query(
    `SELECT b.*, l.module_id, in_course_test_section(b.course_code,$3) AS test_section
       FROM interactive_lesson_bindings b
       LEFT JOIN module_lessons l ON l.id=b.native_lesson_id AND l.status='published'
       LEFT JOIN course_modules m ON m.id=l.module_id AND m.status='published' AND m.course_code=b.course_code
      WHERE b.course_code=$1 AND b.lesson_id=$2 AND (b.native_lesson_id IS NULL OR m.id IS NOT NULL)`, [courseCode,lessonId,user.id]);
  const lesson = binding && getLesson(lessonId);
  if (!lesson) missing();
  if (binding.module_id && user.role === "student") {
    const progress = await repo.listStudentProgress(user.id,courseCode);
    const module = progress.find((p) => p.moduleId === binding.module_id);
    if (module?.integrityRequired) fail(409,"MODULE_ZERO_REQUIRED","Sign the Module 0 pledge and pass its quiz before opening this lesson.");
    if (!module || module.status === "locked") fail(409, "MODULE_LOCKED", "Complete the previous module or ask your teacher for an override.");
  }
  return { user, lesson, binding, scope: [courseCode,lessonId,binding.test_section], staff: user.role !== "student" };
}

async function currentReader(client, ctx, lock) {
  const args = [...ctx.scope,ctx.lesson.version,ctx.user.id];
  if (lock) {
    await client.query(`INSERT INTO interactive_lesson_readers(course_code,lesson_id,test_section,version,user_id)
                         VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,args);
  }
  const { rows } = await client.query(`SELECT * FROM interactive_lesson_readers r WHERE ${commonScope} AND version=$4 AND user_id=$5 ${lock ? "FOR UPDATE" : ""}`,args);
  return rows[0] ?? emptyReader();
}

function validateAnswerFields(card, answer) {
  const fields = {
    SocraticReveal: card.mode === "tap" ? ["reveal"] : ["prediction"],
    ConceptCheck: card.mode === "numeric" ? ["value"] : ["choices"],
    PostFirstPrompt: ["text","pasteWords"], AnnotatedExcerpt: ["visited"],
    InteractiveModel: ["parameters","history","value"],
    StepwiseDerivation: card.mode === "fill" ? ["stepId","value"] : ["lineId","reasonId"],
    ContrastMatrix: ["placements"], SynthesisGate: ["text","skills","doc"],
  }[card.type];
  if (!fields || Object.keys(answer).some((key) => !fields.includes(key))) invalid("The answer contains unknown fields.");
  if (answer.doc !== undefined) validateDraftDoc(answer.doc);
}

function resultCard(ctx,r,a) {
  const card = findCard(ctx.lesson,a.cardId);
  if (!card) invalid("Unknown card.");
  validateAnswerFields(card,a.answer);
  const previous = r.cards[card.id] || {};
  if (previous.completed && ["SynthesisGate","PostFirstPrompt"].includes(card.type)) {
    fail(409,"CARD_SUBMITTED","Your response to this prompt has already been submitted.");
  }
  if (card.type === "SynthesisGate" && previous.draft &&
      (a.answer.text !== previous.draft.text || JSON.stringify(a.answer.skills) !== JSON.stringify(previous.draft.skills))) {
    fail(409,"DRAFT_CONFLICT","Save the latest synthesis draft before submitting.");
  }
  if (card.type === "SynthesisGate" && unmetCards(ctx.lesson,r.cards).some((id) => id !== card.id)) {
    fail(409,"LESSON_PREREQUISITES","Complete the required cards before submitting the synthesis.");
  }
  let result;
  try { result = evaluateCard(ctx.lesson,card.id,a.answer,previous); }
  catch (error) { if (error instanceof RangeError || error instanceof TypeError) invalid("The answer does not match this card."); throw error; }
  const mistakeCounts = { ...previous.mistakeCounts };
  for (const mistake of new Set(result.mistakes || [])) mistakeCounts[mistake] = (mistakeCounts[mistake] || 0) + 1;
  return { ...previous,...result,
    ...(card.type === "SynthesisGate" && result.completed && {submittedAt:new Date().toISOString()}),answer:a.answer,attempts:(previous.attempts || 0)+1,
    completed:Boolean(previous.completed || result.completed),pasteFlag:Boolean(previous.pasteFlag || result.pasteFlag),mistakeCounts };
}

function draftCard(ctx, r, a) {
  const card = findCard(ctx.lesson,a.cardId);
  if (card?.type !== "SynthesisGate") invalid("Choose the synthesis card.");
  const current = r.cards[card.id] || {};
  if (current.completed) fail(409,"CARD_SUBMITTED","Your synthesis has already been submitted.");
  const previous = current.draft;
  if (a.baseVersion !== (previous?.version || 0)) fail(409,"DRAFT_CONFLICT","A newer synthesis draft is available. Reload to compare changes.");
  const validSkills = (card.skills || []).map((s) => typeof s === "string" ? s : s.id);
  if (a.skills.some((s) => !validSkills.includes(s))) invalid("Unknown learning skill.");
  validateDraftDoc(a.doc);
  const diff = diffText(previous?.text || "",a.text);
  const version = a.baseVersion + 1;
  const draft = { version,text:a.text,skills:a.skills,doc:a.doc,diff };
  return { ...current,draft,history:[...(current.history || []),{version,diff,createdAt:new Date().toISOString()}] };
}

function visibleBlindCards(ctx, reader) {
  return ctx.lesson.cards.filter((card) => card.type === "PostFirstPrompt" && reader.cards[card.id]?.completed).map((c) => c.id);
}

async function threadAccess(client,ctx,r,id) {
  const { rows } = await client.query(
    `SELECT t.id FROM interactive_lesson_threads t JOIN interactive_lesson_readers r ON r.id=t.reader_id
      WHERE ${commonScope} AND t.id=$4 AND (t.card_id IS NULL OR (r.version=$5 AND t.card_id=ANY($6::text[])))`,
    [...ctx.scope,id,ctx.lesson.version,visibleBlindCards(ctx,r)]);
  if (!rows.length) missing();
}

async function featurePeer(client,ctx,a) {
  if(!ctx.staff) teacherOnly();
  if(findCard(ctx.lesson,a.cardId)?.type!=="PostFirstPrompt") invalid("Select a post-first prompt.");
  const set=[...ctx.scope,ctx.lesson.version,a.cardId];
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[JSON.stringify(set)]);
  const {rows:[candidate]}=await client.query(`SELECT r.id FROM interactive_lesson_readers r JOIN app_users u ON u.id=r.user_id
    WHERE ${commonScope} AND r.version=$4 AND (r.cards->$5->>'completed')::boolean AND r.id=$6 AND u.role='student'`,[...set,a.readerId]);
  if(!candidate) missing();
  const {rows}=await client.query(`SELECT f.reader_id FROM interactive_featured_posts f JOIN interactive_lesson_readers r ON r.id=f.reader_id
    WHERE ${commonScope} AND r.version=$4 AND f.card_id=$5`,set);
  if(rows.some(row=>row.reader_id===candidate.id)) return;
  if(rows.length>=3) fail(409,"FEATURED_POST_LIMIT","Three class responses have already been featured.");
  await client.query("INSERT INTO interactive_featured_posts(reader_id,card_id,selected_by) VALUES($1,$2,$3)",[candidate.id,a.cardId,ctx.user.id]);
}

async function mutate(client,ctx,r,a) {
  switch (a.type) {
    case "card":
    case "synthesisDraft": {
      if (ctx.binding.closes_at && Date.now() >= ctx.binding.closes_at.getTime()) fail(409,"LESSON_CLOSED","The submission deadline has passed.");
      const state = a.type === "card" ? resultCard(ctx,r,a) : draftCard(ctx,r,a);
      await client.query("UPDATE interactive_lesson_readers SET cards=jsonb_set(cards,ARRAY[$2::text],$3::jsonb) WHERE id=$1",[r.id,a.cardId,JSON.stringify(state)]);
      break;
    }
    case "scratchpad":
      if (a.baseRevision !== undefined && a.baseRevision !== r.revision) fail(409,"SCRATCHPAD_CONFLICT","Reload the latest scratchpad before saving.");
      await client.query("UPDATE interactive_lesson_readers SET scratchpad=$2 WHERE id=$1",[r.id,a.text]);
      break;
    case "heartbeat": {
      // All tabs share the row lock and server clock. Fractional elapsed time is
      // retained so interleaved tabs cannot round the same interval up twice.
      const {rows:[sample]} = await client.query(`WITH stamp AS MATERIALIZED (SELECT clock_timestamp() AS t)
        UPDATE interactive_lesson_readers SET active_millis=active_millis +
          CASE WHEN last_heartbeat IS NULL OR stamp.t-last_heartbeat > interval '180 seconds' THEN 0
               ELSE greatest(0,least($2::bigint,floor(extract(epoch FROM (stamp.t-last_heartbeat))*1000)::bigint)) END,
          last_heartbeat=stamp.t FROM stamp WHERE id=$1 RETURNING active_millis,last_heartbeat`,[r.id,Math.floor(a.seconds*1000)]);
      const millis = Number(sample.active_millis) - Number(r.active_millis);
      if (!ctx.staff && ctx.binding.native_lesson_id && millis > 0) {
        await client.query(`INSERT INTO course_engagement_intervals(student_id,course_code,test_section,source,observed)
          VALUES ($1,$2,$3,$4,tstzrange($5::timestamptz - $6::int * interval '1 millisecond',$5,'[)'))`,
          [ctx.user.id,ctx.scope[0],ctx.binding.test_section,a.source,sample.last_heartbeat,millis]);
      }
      break;
    }
    case "annotation":
      validateAnchor(ctx.lesson,a.anchor);
      await client.query("INSERT INTO interactive_lesson_notes(reader_id,anchor,color,text_body) VALUES($1,$2,$3,$4)",[r.id,a.anchor,a.color,a.text]);
      break;
    case "question":
      validateAnchor(ctx.lesson,a.anchor);
      await client.query("INSERT INTO interactive_lesson_threads(reader_id,anchor,text_body) VALUES($1,$2,$3)",[r.id,a.anchor,a.text]);
      break;
    case "reply":
      if (a.threadId) {
        await threadAccess(client,ctx,r,a.threadId);
        await client.query("INSERT INTO interactive_lesson_replies(thread_id,reader_id,text_body) VALUES($1,$2,$3)",[a.threadId,r.id,a.text]);
      } else {
        if (!visibleBlindCards(ctx,r).includes(a.cardId)) fail(403,"POST_FIRST_REQUIRED","Submit your own response before replying.");
        if (!findCard(ctx.lesson,a.cardId)?.private?.peers?.some((p) => p.id === a.peerId)) {
          const {rowCount}=await client.query(`SELECT 1 FROM interactive_featured_posts f JOIN interactive_lesson_readers r ON r.id=f.reader_id
            WHERE ${commonScope} AND r.version=$4 AND f.card_id=$5 AND f.id::text=$6`,[...ctx.scope,ctx.lesson.version,a.cardId,a.peerId]);
          if(!rowCount) invalid("Unknown peer example.");
        }
        await client.query("INSERT INTO interactive_lesson_threads(reader_id,card_id,peer_id,text_body) VALUES($1,$2,$3,$4)",[r.id,a.cardId,a.peerId,a.text]);
      }
      break;
    case "featurePeer":
      await featurePeer(client,ctx,a);
      break;
    case "endorse":
      if (!ctx.staff) teacherOnly();
      await threadAccess(client,ctx,r,a.threadId);
      await client.query("UPDATE interactive_lesson_threads SET endorsed_by=$2 WHERE id=$1",[a.threadId,ctx.user.id]);
      break;
    case "booking": {
      if (ctx.staff) fail(403,"STUDENT_REQUIRED","Students can request an appointment.");
      if (!(Date.parse(a.preferredAt) > Date.now())) invalid("Choose a future appointment time.");
      try { new Intl.DateTimeFormat("en",{timeZone:a.timeZone}); } catch { invalid("Choose a recognized time zone."); }
      await client.query(`INSERT INTO interactive_lesson_bookings(reader_id,preferred_at,time_zone) VALUES($1,$2,$3)
                           ON CONFLICT (reader_id,preferred_at) DO NOTHING`,[r.id,a.preferredAt,a.timeZone]);
      break;
    }
    case "bookingReview": {
      if (!ctx.staff) teacherOnly();
      const { rows: [booking] } = await client.query(`SELECT b.id,b.status,b.preferred_at FROM interactive_lesson_bookings b
        JOIN interactive_lesson_readers r ON r.id=b.reader_id WHERE ${commonScope} AND b.id=$4 FOR UPDATE OF b`,[...ctx.scope,a.bookingId]);
      if (!booking) missing();
      if (booking.status === a.status) break;
      if (booking.status !== "requested") fail(409,"BOOKING_ALREADY_REVIEWED","This request has already been reviewed.");
      if (a.status === "confirmed" && booking.preferred_at.getTime() <= Date.now()) invalid("The requested appointment has passed.");
      await client.query("UPDATE interactive_lesson_bookings SET status=$2,reviewed_by=$3 WHERE id=$1",[booking.id,a.status,ctx.user.id]);
      break;
    }
  }
}

async function snapshot(client,ctx) {
  const reader = await currentReader(client,ctx,false);
  const { cards } = reader;
  const { rows:notes } = await client.query(`SELECT n.id,n.anchor,n.color,n.text_body AS text
    FROM interactive_lesson_notes n JOIN interactive_lesson_readers r ON r.id=n.reader_id
    WHERE ${commonScope} AND r.user_id=$4 ORDER BY n.created_at,n.id`,[...ctx.scope,ctx.user.id]);
  // Anchored conversations survive text revisions. Blind conversations stay with
  // the version whose prompt was answered by both participants.
  const { rows:threads } = await client.query(`SELECT t.id,t.anchor,t.card_id AS "cardId",t.peer_id AS "peerId",
    t.text_body AS text,CASE WHEN t.peer_id IS NULL THEN u.display_name ELSE 'Classmate' END AS "authorName", t.endorsed_by IS NOT NULL AS endorsed,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'text',p.text_body,'authorName',CASE WHEN t.peer_id IS NULL THEN pu.display_name ELSE 'Classmate' END)
                            ORDER BY p.created_at,p.id)
           FROM interactive_lesson_replies p JOIN interactive_lesson_readers pr ON pr.id=p.reader_id
           JOIN app_users pu ON pu.id=pr.user_id WHERE p.thread_id=t.id AND pr.test_section=r.test_section
             AND pr.course_code=r.course_code AND pr.lesson_id=r.lesson_id),'[]'::jsonb) AS replies
    FROM interactive_lesson_threads t JOIN interactive_lesson_readers r ON r.id=t.reader_id JOIN app_users u ON u.id=r.user_id
    WHERE ${commonScope} AND (t.card_id IS NULL OR (r.version=$4 AND t.card_id=ANY($5::text[]))) ORDER BY t.created_at,t.id`,
    [...ctx.scope,ctx.lesson.version,visibleBlindCards(ctx,reader)]);
  const { rows:bookings } = await client.query(`SELECT b.id,b.preferred_at AS "preferredAt",b.time_zone AS "timeZone",
    b.status,u.display_name AS "studentName" FROM interactive_lesson_bookings b
    JOIN interactive_lesson_readers r ON r.id=b.reader_id JOIN app_users u ON u.id=r.user_id
    WHERE ${commonScope} AND ($4::boolean OR r.user_id=$5) ORDER BY b.preferred_at,b.id`,[...ctx.scope,ctx.staff,ctx.user.id]);
  const required = ctx.lesson.cards.filter((c) => c.required).length;
  const unmet = unmetCards(ctx.lesson,cards);
  const nextUnlocked = required > 0 && !unmet.length && ctx.lesson.cards.some((card) => card.type === "SynthesisGate" && cards[card.id]?.completed);
  const result = {
    lesson:publicLesson(ctx.lesson,cards),cards,notes,threads,bookings,role:ctx.user.role,section:ctx.binding.test_section ? "TEST" : "regular",
    scratchpad:reader.scratchpad,revision:reader.revision,activeSeconds:Math.floor(Number(reader.active_millis)/1000),
    mastery:required ? Math.round((required-unmet.length)*100/required) : 0,unmet,nextUnlocked,
  };
  if (nextUnlocked && ctx.lesson.nextReading) result.nextReading = { title:ctx.lesson.nextReading.title,text:ctx.lesson.nextReading.text };
  const {rows:featured}=await client.query(`SELECT f.id,f.card_id AS "cardId",r.cards->f.card_id->'answer'->>'text' AS text
    FROM interactive_featured_posts f JOIN interactive_lesson_readers r ON r.id=f.reader_id
    WHERE ${commonScope} AND r.version=$4 AND f.card_id=ANY($5::text[]) ORDER BY f.featured_at,f.id`,[...ctx.scope,ctx.lesson.version,visibleBlindCards(ctx,reader)]);
  for(const card of result.lesson.cards) {
    if(card.type==="PostFirstPrompt" && Array.isArray(card.peers)) {
      const selected=featured.filter(p=>p.cardId===card.id).map((p,i)=>({id:p.id,label:"Class response "+(i+1),text:p.text}));
      card.peers.push(...selected);
    }
  }
  if (ctx.staff) {
    const prompts=ctx.lesson.cards.filter(c=>c.type==="PostFirstPrompt").map(c=>c.id);
    const {rows:candidates}=await client.query(`SELECT r.id AS "readerId",c.key AS "cardId",u.display_name AS "studentName",
      c.value->'answer'->>'text' AS text,f.id IS NOT NULL AS featured
      FROM interactive_lesson_readers r JOIN app_users u ON u.id=r.user_id CROSS JOIN LATERAL jsonb_each(r.cards) c
        LEFT JOIN interactive_featured_posts f ON f.reader_id=r.id AND f.card_id=c.key
      WHERE ${commonScope} AND r.version=$4 AND u.role='student' AND c.key=ANY($5::text[]) AND (c.value->>'completed')::boolean
      ORDER BY c.key,u.display_name`,[...ctx.scope,ctx.lesson.version,prompts]);
    result.peerCandidates=candidates;
    const { rows } = await client.query(`SELECT c.key AS card,m.key AS mistake,sum(m.value::int)::int AS count
      FROM interactive_lesson_readers r JOIN app_users u ON u.id=r.user_id,
        LATERAL jsonb_each(r.cards) c, LATERAL jsonb_each_text(c.value->'mistakeCounts') m
      WHERE ${commonScope} AND r.version=$4 AND u.role='student' GROUP BY c.key,m.key`,[...ctx.scope,ctx.lesson.version]);
    result.errorDistribution = {};
    for (const row of rows) (result.errorDistribution[row.card] ??= {})[row.mistake] = row.count;
    const flagged = await client.query(`SELECT c.key AS "cardId",u.display_name AS "studentName",
      c.value->'answer'->>'text' AS text
      FROM interactive_lesson_readers r JOIN app_users u ON u.id=r.user_id, LATERAL jsonb_each(r.cards) c
      WHERE ${commonScope} AND r.version=$4 AND u.role='student' AND c.key=ANY($5::text[]) AND (c.value->>'pasteFlag')::boolean
      ORDER BY u.display_name,c.key`,[...ctx.scope,ctx.lesson.version,prompts]);
    result.pasteReviews = flagged.rows;
  }
  return result;
}

async function applyAction(client, ctx, a) {
  if (a.version !== ctx.lesson.version) fail(409,"LESSON_VERSION_CHANGED","Reload the latest lesson before submitting.");
  const r = await currentReader(client,ctx,true);
  // jsonb normalizes object key order for retries from different clients.
  const {rows:[canonical]} = await client.query("SELECT $1::jsonb::text AS body",[JSON.stringify(a)]);
  const fingerprint = stableFingerprint(canonical.body);
  const {rows:[receipt]} = await client.query("SELECT fingerprint FROM interactive_lesson_receipts WHERE reader_id=$1 AND request_id=$2",[r.id,a.requestId]);
  if (receipt) {
    if (receipt.fingerprint !== fingerprint) fail(409,"REQUEST_ID_CONFLICT","The request ID already belongs to a different action.");
    return;
  }
  await mutate(client,ctx,r,a);
  await client.query("INSERT INTO interactive_lesson_receipts(reader_id,request_id,fingerprint) VALUES($1,$2,$3)",[r.id,a.requestId,fingerprint]);
  // Heartbeats never invalidate a concurrent text editor's base revision.
  if (a.type !== "heartbeat") await client.query("UPDATE interactive_lesson_readers SET revision=revision+1 WHERE id=$1",[r.id]);
}

export function registerInteractiveLessons(app,{repository,requireRoles,requireCsrf}) {
  app.get("/health/interactive-lessons-ready", async (_request,reply) => {
    const status = privateLessonReadiness();
    return reply.status(status.ready ? 200 : 503).send({...status,status:status.ready?"ready":"unavailable"});
  });
  const path = "/v1/courses/:courseCode/interactive-lessons/:lessonId";
  const role = requireRoles("student","teacher","teacher_admin");
  async function handle(request,reply) {
    const courseCode = parse(courseCodeSchema,request.params.courseCode);
    const lessonId = parse(assignmentIdSchema,request.params.lessonId);
    const write = request.method === "POST";
    const a = write ? parse(actionSchema,request.body,"INVALID_LESSON_ACTION") : null;
    if (write && containsInvalidText(a)) invalid("The request contains invalid Unicode or excessive nesting.");
    reply.header("Cache-Control","private, no-store");
    const client = await repository.pool.connect();
    try {
      await client.query(write ? "BEGIN" : "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const ctx = await access(client,request.auth.user,courseCode,lessonId);
      if (a) await applyAction(client,ctx,a);
      const result = await snapshot(client,ctx);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally { client.release(); }
  }
  app.get(path,{preHandler:[role]},handle);
  app.post(path+"/actions",{bodyLimit:128*1024,preHandler:[role,requireCsrf]},handle);
}

function containsInvalidText(value, depth = 0) {
  if (depth > 20) return true;
  if (typeof value === "string") return value.includes("\0") || !value.isWellFormed();
  return Boolean(value && typeof value === "object" && Object.entries(value).some(([k,v]) => containsInvalidText(k,depth+1) || containsInvalidText(v,depth+1)));
}
