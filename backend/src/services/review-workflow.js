import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { PostgresRepository } from "../db/postgres.js";
import { requireClassroomRollout } from "./classroom-rollout.js";
import { getLesson } from "../lessons/catalog.js";
import { ApiError } from "../lib/errors.js";
import { stableFingerprint } from "../lib/crypto.js";
import { courseCodeSchema, uuidSchema, parse, assignmentIdSchema } from "../lib/validation.js";

const fail = (status, code, message) => {
  throw new ApiError(status, code, message);
};
const invalid = (message) => fail(422, "INVALID_REVIEW", message);
const missing = () => fail(404, "REVIEW_NOT_FOUND", "This work is unavailable.");
const required = (max) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => s.isWellFormed() && !s.includes("\0"));
const anchor = z
  .object({ version: z.int().positive(), start: z.int().nonnegative(), exact: required(4000) })
  .strict();
const request = { requestId: uuidSchema };
const item = { ...request, workId: uuidSchema, expectedRevision: z.int().positive() };
const action = (type, fields) => z.object({ type: z.literal(type), ...fields }).strict();
const schema = z.discriminatedUnion("type", [
  action("calendar", {
    startHour: z.int().min(0).max(22),
    endHour: z.int().min(1).max(23),
    weekdays: z.array(z.int().min(0).max(6)).min(1).max(7),
    closures: z.array(z.iso.date()).max(180),
  }),
  action("enable", {}),
  action("openFile", { ...request, submissionId: uuidSchema, fileId: uuidSchema }),
  action("openSynthesis", { ...request, readerId: uuidSchema, cardId: assignmentIdSchema }),
  action("comment", { ...item, anchor, text: required(4000) }),
  action("revise", { ...item, text: required(16000), explanation: required(4000) }),
  action("revisionDraft", {
    ...item,
    text: z
      .string()
      .max(16000)
      .refine((s) => s.isWellFormed() && !s.includes("\0")),
    pasteWords: z.int().min(0).max(1000000).default(0),
  }),
  action("resolve", { ...item, threadId: uuidSchema }),
  action("reopen", { ...item, threadId: uuidSchema }),
  action("defense", {
    ...item,
    minutes: z.int().min(1).max(120),
    questions: z.array(z.object({ anchor, prompt: required(2000) }).strict()).length(2),
  }),
  action("startDefense", item),
  action("answerDefense", { ...item, answers: z.array(required(4000)).length(2) }),
  action("acceptDefense", item),
  action("release", { ...item, feedback: required(4000), score: z.int().min(0).max(100).optional() }),
]);
const toronto = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
function localParts(date) {
  return Object.fromEntries(
    toronto
      .formatToParts(date)
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
}
function instant(day, hour) {
  const target = day.getTime() + hour * 3600000;
  let guess = target;
  for (let i = 0; i < 3; i++) {
    const p = localParts(guess);
    const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess;
    guess = target - offset;
  }
  return guess;
}
export function reviewDueAt(start, policy) {
  const begin = new Date(start).getTime(),
    p = localParts(begin);
  const day = new Date(Date.UTC(p.year, p.month - 1, p.day));
  const closed = new Set(policy.closures ?? []);
  let remaining = 48 * 3600000;
  for (let i = 0; i < 1700; i++, day.setUTCDate(day.getUTCDate() + 1)) {
    if (!policy.weekdays.includes(day.getUTCDay()) || closed.has(day.toISOString().slice(0, 10))) continue;
    const open = Math.max(begin, instant(day, policy.startHour)),
      end = instant(day, policy.endHour);
    if (end <= open) continue;
    if (remaining <= end - open) return new Date(open + remaining).toISOString();
    remaining -= end - open;
  }
  invalid("The configured trial calendar has insufficient working time.");
}

const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
export function localReviewCalendarEnabled(config) {
  return ["development", "test"].includes(config.nodeEnv) &&
    loopbackHosts.has(config.host) &&
    config.allowedOrigins.length > 0 &&
    config.allowedOrigins.every((origin) => loopbackHosts.has(new URL(origin).hostname));
}

async function readPilot(client, scope, localCalendar) {
  const calendarFields = localCalendar
    ? `,start_hour AS "startHour",end_hour AS "endHour",weekdays,
       ARRAY(SELECT day::text FROM unnest(closures) day) AS closures` : "";
  const { rows } = await client.query(
    `SELECT enabled_at AS "enabledAt"${calendarFields}
     FROM review_section_pilots WHERE course_code=$1 AND test_section=$2`, scope,
  );
  if (!rows.length) return { enabledAt: null, policy: null };
  const { enabledAt, ...calendar } = rows[0];
  return { enabledAt, policy: localCalendar ? calendar : null };
}
const inSection =
  "in_course_test_section($1,u.id)=$2 AND u.role='student' AND u.status='active' AND EXISTS(SELECT 1 FROM course_enrollments e WHERE e.student_user_id=u.id AND e.course_code=$1 AND e.status='active')";
const rawFile = `SELECT s.id AS "submissionId",f.id AS "fileId",f.drive_file_id,f.sha256_checksum,s.student_user_id AS student_id,
 s.assignment_title AS title,f.original_file_name AS filename,s.submitted_at AS "submittedAt",u.display_name AS "studentName"
 FROM student_submissions s JOIN submission_files f ON f.submission_id=s.id JOIN app_users u ON u.id=s.student_user_id
 WHERE s.course_code=$1 AND ${inSection} AND s.status='submitted' AND s.submitted_at >= $3 AND f.mime_type='text/plain' AND f.size_bytes<=65536
 AND NOT EXISTS(SELECT 1 FROM submission_grades g WHERE g.submission_id=s.id AND g.published_at IS NOT NULL)
 AND NOT EXISTS(SELECT 1 FROM submission_messages m WHERE m.submission_id=s.id AND m.message_type='revision_request')
 AND NOT EXISTS(SELECT 1 FROM student_submissions n WHERE n.replaces_submission_id=s.id)
 AND NOT EXISTS(SELECT 1 FROM review_works w WHERE w.submission_id=s.id)`;
const rawSynth = `SELECT r.id AS "readerId",r.user_id AS student_id,u.display_name AS "studentName",r.lesson_id,r.version,
 entry.key AS "cardId", entry.value AS answer,r.cards AS all_cards,(entry.value->>'submittedAt')::timestamptz AS "submittedAt"
 FROM interactive_lesson_readers r JOIN app_users u ON u.id=r.user_id CROSS JOIN LATERAL jsonb_each(r.cards) entry
 WHERE r.course_code=$1 AND r.test_section=$2 AND ${inSection} AND entry.value->>'completed'='true'
 AND entry.value->>'submittedAt' IS NOT NULL AND (entry.value->>'submittedAt')::timestamptz >= $3
 AND NOT EXISTS (SELECT 1 FROM review_works w WHERE w.reader_id=r.id AND w.card_id=entry.key)`;
const workSql = `SELECT w.*,u.display_name AS "studentName",u.email::text AS "studentEmail",s.assignment_id,
 EXISTS(SELECT 1 FROM submission_grades g WHERE g.submission_id=w.submission_id AND g.published_at IS NOT NULL) AS published
 FROM review_works w JOIN app_users u ON u.id=w.student_id LEFT JOIN student_submissions s ON s.id=w.submission_id
 WHERE w.course_code=$1 AND w.test_section=$2 AND ${inSection} AND ($3::boolean OR w.student_id=$4)`;
function summary(w, policy) {
  return {
    id: w.id,
    title: w.title,
    studentName: w.studentName,
    revision: w.revision,
    version: w.contents.versions.at(-1).version,
    kind: w.submission_id ? "file" : "synthesis",
    waitingSince: w.waiting_since,
    dueAt: w.waiting_since && policy ? reviewDueAt(w.waiting_since, policy) : null,
    releasedAt: w.released_at,
    published: w.published,
    submittedAt: w.submitted_at,
    gradeHref: w.submission_id
      ? `#/teacher/submission/${encodeURIComponent(w.studentEmail.toLowerCase())}/${encodeURIComponent(w.assignment_id)}`
      : null,
  };
}
function validateAnchor(a, contents) {
  const v = contents.versions.at(-1);
  if (a.version !== v.version || v.text.slice(a.start, a.start + a.exact.length) !== a.exact)
    fail(409, "REVIEW_ANCHOR_CHANGED", "Select the passage again in the current version.");
}
const onlyStaff = (ctx) => {
  if (!ctx.staff) fail(403, "REVIEW_FACULTY_REQUIRED", "This action requires course faculty.");
};
const onlyStudent = (ctx) => {
  if (ctx.staff) fail(403, "REVIEW_STUDENT_REQUIRED", "Only the author can respond.");
};
function ensure(condition, message) {
  if (!condition) fail(409, "REVIEW_STATE", message);
}
function reviewedDefense(c) {
  return !c.defenses.length || c.defenses.at(-1).acceptedAt;
}
export function transition(work, a, ctx, now = new Date()) {
  const c = structuredClone(work.contents),
    at = now.toISOString(),
    active = c.defenses.at(-1);
  let waiting = work.waiting_since,
    release = work.released_at;
  ensure(!work.published, "This submission grade has already been published.");
  if (a.type !== "reopen") ensure(!release, "This review has already been released.");
  if (a.expectedRevision !== work.revision)
    fail(409, "REVIEW_CHANGED", "This work changed. Reload the latest version.");
  const thread = c.threads.find((t) => t.id === a.threadId);
  switch (a.type) {
    case "comment":
      onlyStaff(ctx);
      validateAnchor(a.anchor, c);
      c.threads.push({
        id: randomUUID(),
        anchor: a.anchor,
        text: a.text,
        author: ctx.user.displayName,
        createdAt: at,
        resolvedAt: null,
      });
      waiting = null;
      break;
    case "revisionDraft": {
      onlyStudent(ctx);
      ensure(
        c.threads.some((t) => !t.resolvedAt),
        "A teacher must request a revision first.",
      );
      c.evidence.revisions ??= [];
      const version = c.versions.length;
      let run = c.evidence.revisions.find((r) => r.version === version);
      if (!run) {
        run = { version, history: [] };
        c.evidence.revisions.push(run);
      }
      const before = c.draft?.text ?? c.versions.at(-1).text;
      let from = 0,
        oldEnd = before.length,
        newEnd = a.text.length;
      while (from < oldEnd && from < newEnd && before[from] === a.text[from]) from++;
      while (oldEnd > from && newEnd > from && before[oldEnd - 1] === a.text[newEnd - 1]) {
        oldEnd--;
        newEnd--;
      }
      if (before !== a.text)
        run.history.push({
          version: run.history.length + 1,
          createdAt: at,
          diff: { from, removed: oldEnd - from, inserted: a.text.slice(from, newEnd) },
        });
      if (a.pasteWords >= 30)
        c.evidence.pasteEvents.push({ cardId: "Revision " + (version + 1), wordCount: a.pasteWords, at });
      c.draft = { text: a.text, version };
      break;
    }
    case "revise":
      onlyStudent(ctx);
      ensure(
        c.threads.some((t) => !t.resolvedAt),
        "A teacher must request a revision first.",
      );
      ensure(c.versions.at(-1).text !== a.text, "Revise the text before submitting your explanation.");
      delete c.draft;
      c.versions.push({ version: c.versions.length + 1, text: a.text, explanation: a.explanation, at });
      if (active && !active.supersededAt) active.supersededAt = at;
      waiting = at;
      break;
    case "resolve":
      onlyStaff(ctx);
      ensure(thread && !thread.resolvedAt, "Choose an open thread.");
      ensure(
        c.versions.at(-1).version > (thread.reopenedVersion ?? thread.anchor.version),
        "Wait for a new revision with an explanation.",
      );
      thread.resolvedAt = at;
      thread.resolvedBy = ctx.user.displayName;
      waiting = waiting ?? at;
      break;
    case "reopen":
      onlyStaff(ctx);
      ensure(thread?.resolvedAt, "Choose a resolved thread.");
      ensure(!c.formativeGrade, "A published formative result is immutable.");
      thread.resolvedAt = null;
      thread.reopenedVersion = c.versions.at(-1).version;
      release = null;
      waiting = null;
      break;
    case "defense":
      onlyStaff(ctx);
      a.questions.forEach((q) => validateAnchor(q.anchor, c));
      ensure(a.questions[0].prompt !== a.questions[1].prompt, "Write two distinct questions.");
      if (active) active.supersededAt = at;
      c.defenses.push({ id: randomUUID(), minutes: a.minutes, questions: a.questions, assignedAt: at });
      waiting = null;
      break;
    case "startDefense":
      onlyStudent(ctx);
      ensure(active && !active.startedAt && !active.supersededAt, "This defense cannot be started.");
      active.startedAt = at;
      active.expiresAt = new Date(now.getTime() + active.minutes * 60000).toISOString();
      break;
    case "answerDefense":
      onlyStudent(ctx);
      ensure(active?.startedAt && !active.answeredAt && !active.supersededAt, "The defense is unavailable.");
      ensure(
        now.getTime() < Date.parse(active.expiresAt),
        "The response window has ended. Contact your teacher for a new defense.",
      );
      active.answers = a.answers;
      active.answeredAt = at;
      waiting = at;
      break;
    case "acceptDefense":
      onlyStaff(ctx);
      ensure(
        active?.answeredAt && !active.supersededAt && !active.acceptedAt,
        "Read the current defense answers first.",
      );
      active.acceptedAt = at;
      active.acceptedBy = ctx.user.displayName;
      waiting = waiting ?? at;
      break;
    case "release":
      onlyStaff(ctx);
      ensure(
        c.threads.length && c.threads.every((t) => t.resolvedAt),
        "Request and resolve a text revision first.",
      );
      ensure(
        reviewedDefense(c) && !active?.supersededAt,
        "Assign and accept a current defense before releasing this work.",
      );
      if (!work.submission_id && !Number.isInteger(a.score)) invalid("Enter a formative synthesis score.");
      if (work.submission_id && a.score !== undefined)
        invalid("Publish the official score in the submission gradebook.");
      if (!work.submission_id) c.formativeGrade = { score: a.score, feedback: a.feedback, at };
      c.releaseFeedback = a.feedback;
      waiting = null;
      release = at;
      break;
    default:
      invalid("Unknown review action.");
  }
  return { contents: c, waiting, release };
}

async function sourceText(drive, row) {
  const opened = await drive.openFile(row.drive_file_id);
  if (!opened.stream) fail(502, "REVIEW_FILE_UNAVAILABLE", "The text file could not be read.");
  const chunks = [];
  let size = 0;
  for await (const chunk of opened.stream) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > 65536) invalid("Choose a plain-text file of 64 KB or less.");
    chunks.push(bytes);
  }
  const bytes = Buffer.concat(chunks);
  if (createHash("sha256").update(bytes).digest("hex") !== row.sha256_checksum)
    fail(409, "REVIEW_FILE_CHANGED", "The file differs from its submitted receipt.");
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).replace(/\r\n?/g, "\n");
  } catch {
    invalid("Choose a UTF-8 text submission.");
  }
  if (!text.trim() || text.includes("\0") || text.length > 16000)
    invalid("Review requires 1–16,000 characters of readable text.");
  return text;
}
function synthSource(row) {
  const lesson = getLesson(row.lesson_id);
  const card = lesson?.cards.find((c) => c.id === row.cardId && c.type === "SynthesisGate");
  if (!card || !row.answer?.answer?.text) return null;
  return {
    title: card.title,
    text: row.answer.answer.text,
    evidence: {
      history: row.answer.history || [],
      pasteEvents: Object.entries(row.all_cards)
        .filter(([, c]) => c.pasteFlag)
        .map(([cardId, c]) => ({ cardId, wordCount: c.answer?.pasteWords || null })),
    },
  };
}
async function openWork(client, ctx, a, drive) {
  onlyStaff(ctx);
  const args = [...ctx.scope, ctx.enabledAt];
  let row, contents, title;
  if (a.type === "openFile") {
    await gradeLock(client, a.submissionId);
    row = (await client.query(rawFile + " AND s.id=$4 AND f.id=$5", [...args, a.submissionId, a.fileId]))
      .rows[0];
    if (!row) missing();
    title = row.title;
    contents = { text: await sourceText(drive, row), evidence: { history: [], pasteEvents: [] } };
  } else {
    row = (await client.query(rawSynth + " AND r.id=$4 AND entry.key=$5", [...args, a.readerId, a.cardId]))
      .rows[0];
    if (!row || !(contents = synthSource(row))) missing();
    title = contents.title;
  }
  const stored = {
    versions: [{ version: 1, text: contents.text, at: row.submittedAt }],
    threads: [],
    defenses: [],
    evidence: contents.evidence,
  };
  const result = await client.query(
    `INSERT INTO review_works(course_code,test_section,student_id,opened_by,submission_id,reader_id,card_id,title,submitted_at,waiting_since,contents)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,$10) ON CONFLICT DO NOTHING RETURNING id`,
    [
      ...ctx.scope,
      row.student_id,
      ctx.user.id,
      a.submissionId ?? null,
      a.readerId ?? null,
      a.cardId ?? null,
      title,
      row.submittedAt,
      stored,
    ],
  );
  if (!result.rowCount) fail(409, "REVIEW_ALREADY_OPEN", "A review has already been opened for this work.");
  return result.rows[0].id;
}
async function gradeLock(client, id) {
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtextextended('submission-message:' || $1::text,0::bigint))",
    [id],
  );
}
function detail(row, ctx) {
  const { evidence, defenses, draft, ...rest } = row.contents;
  return {
    ...summary(row, ctx.policy),
    ...rest,
    ...(!ctx.staff && draft ? { draft } : {}),
    defenses: defenses.map((d) =>
      ctx.staff || d.startedAt
        ? d
        : { id: d.id, minutes: d.minutes, assignedAt: d.assignedAt, supersededAt: d.supersededAt },
    ),
    ...(ctx.staff ? { evidence } : {}),
  };
}
async function getWork(client, ctx, id, lock = false) {
  const q = workSql + " AND w.id=$5";
  const args = [...ctx.scope, ctx.staff, ctx.user.id, id];
  let row = (await client.query(q, args)).rows[0];
  if (!row) missing();
  if (lock) {
    if (row.submission_id) await gradeLock(client, row.submission_id);
    row = (await client.query(q + " FOR UPDATE OF w", args)).rows[0];
    if (!row) missing();
  }
  return row;
}
async function inbox(client, ctx) {
  const { scope, staff, user, enabledAt, policy } = ctx;
  const base = {
    section: scope[1] ? "TEST" : "regular",
    role: user.role,
    enabled: Boolean(enabledAt),
    policy,
    queue: [],
    candidates: [],
  };
  if (!enabledAt) return base;
  const args = [...scope, staff, user.id];
  const { rows } = await client.query(
    workSql + " ORDER BY w.waiting_since ASC NULLS LAST,w.submitted_at,w.id",
    args,
  );
  base.queue = rows.map((w) => summary(w, policy));
  if (staff) {
    const sourceArgs = [...scope, enabledAt];
    const files = (await client.query(rawFile + " ORDER BY s.submitted_at", sourceArgs)).rows;
    const synth = (await client.query(rawSynth, sourceArgs)).rows;
    base.candidates = [
      ...files.map((r) => ({
        kind: "file",
        submissionId: r.submissionId,
        fileId: r.fileId,
        title: r.title + " · " + r.filename,
        studentName: r.studentName,
        submittedAt: r.submittedAt,
      })),
      ...synth.flatMap((r) => {
        const candidate = synthSource(r);
        return candidate
          ? [
              {
                kind: "synthesis",
                readerId: r.readerId,
                cardId: r.cardId,
                title: candidate.title,
                studentName: r.studentName,
                submittedAt: r.submittedAt,
              },
            ]
          : [];
      }),
    ].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  }
  return base;
}

export function registerReviewWorkflow(app, { repository, requireRoles, requireCsrf, drive, config }) {
  const localCalendar = localReviewCalendarEnabled(config);
  const path = "/v1/courses/:courseCode/review-workspace",
    role = requireRoles("teacher_admin", "teacher", "student");
  async function handle(req, reply) {
    const user = req.auth.user,
      course = parse(courseCodeSchema, req.params.courseCode);
    const write = req.method === "POST",
      a = write ? parse(schema, req.body, "INVALID_REVIEW") : null;
    const id = req.params.workId && parse(uuidSchema, req.params.workId);
    reply.header("Cache-Control", "private, no-store");
    const client = await repository.pool.connect();
    try {
      await client.query(write ? "BEGIN" : "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      if (!(await new PostgresRepository(client).canAccessCourse(user, course)))
        fail(403, "COURSE_ACCESS_DENIED", "You do not have access to this course.");
      await requireClassroomRollout(client, course, user.id);
      const section = (await client.query("SELECT in_course_test_section($1,$2) AS test", [course, user.id]))
        .rows[0].test;
      const scope = [course, section],
        ctx = {
          scope,
          user,
          staff: user.role !== "student",
          ...await readPilot(client, scope, localCalendar),
        };
      let response,
        workId = id;
      if (a?.type === "enable" || a?.type === "calendar") {
        if (user.role !== "teacher_admin")
          fail(403, "ADMIN_REQUIRED", "Only a faculty administrator can configure this section's pilot.");
        if (a.type === "enable")
          await client.query(
            "INSERT INTO review_section_pilots(course_code,test_section) VALUES($1,$2) ON CONFLICT DO NOTHING",
            scope,
          );
        else {
          if (!localCalendar) fail(403, "REVIEW_CALENDAR_DISABLED", "Calendar configuration is unavailable.");
          ensure(ctx.enabledAt, "Enable the pilot in this section first.");
          if (a.endHour <= a.startHour) invalid("Closing time must follow opening time.");
          await client.query(
            "UPDATE review_section_pilots SET start_hour=$3,end_hour=$4,weekdays=$5,closures=$6 WHERE course_code=$1 AND test_section=$2",
            [...scope, a.startHour, a.endHour, [...new Set(a.weekdays)], [...new Set(a.closures)]],
          );
        }
        Object.assign(ctx, await readPilot(client, scope, localCalendar));
      } else if (a) {
        ensure(ctx.enabledAt, "The review pilot is disabled in this section.");
        const fingerprint = stableFingerprint({ course, section, a });
        await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,1))", [
          user.id + ":" + a.requestId,
        ]);
        const receipt = (
          await client.query("SELECT * FROM review_action_receipts WHERE user_id=$1 AND request_id=$2", [
            user.id,
            a.requestId,
          ])
        ).rows[0];
        if (receipt) {
          ensure(receipt.fingerprint === fingerprint, "This request ID was already used.");
          workId = receipt.work_id;
        } else {
          if (a.type === "openFile" || a.type === "openSynthesis")
            workId = await openWork(client, ctx, a, drive);
          else {
            const row = await getWork(client, ctx, a.workId, true);
            const result = transition(row, a, ctx);
            await client.query(
              "UPDATE review_works SET revision=revision+1,contents=$2,waiting_since=$3,released_at=$4 WHERE id=$1",
              [row.id, result.contents, result.waiting, result.release],
            );
            workId = row.id;
          }
          await client.query("INSERT INTO review_action_receipts VALUES($1,$2,$3,$4)", [
            user.id,
            a.requestId,
            fingerprint,
            workId,
          ]);
        }
      }
      if (workId) {
        if (!ctx.enabledAt) missing();
        response = detail(await getWork(client, ctx, workId), ctx);
      } else response = await inbox(client, ctx);
      await client.query("COMMIT");
      return response;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  app.get(path, { preHandler: [role] }, handle);
  app.get(path + "/works/:workId", { preHandler: [role] }, handle);
  app.post(path + "/actions", { preHandler: [role, requireCsrf], bodyLimit: 128 * 1024 }, handle);
}
