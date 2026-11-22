import { requireClassroomRollout } from "./classroom-rollout.js";
import { Readable } from 'node:stream';
import { setTimeout as delay } from 'node:timers/promises';
import { z } from 'zod';
import { PostgresRepository } from '../db/postgres.js';
import { courseCodeSchema, parse, uuidSchema } from '../lib/validation.js';
import { ApiError } from '../lib/errors.js';
import { stableFingerprint } from '../lib/crypto.js';

const text = max => z.string().trim().min(1).max(max).refine(s => !s.includes('\0') && s.isWellFormed());
const boardBlock = z.object({text:text(6000), prompt:text(1000).optional()}).strict();
const creation = z.object({id:uuidSchema,title:text(140),board:z.array(boardBlock).min(1).max(30)}).strict();
const shape = (type, fields = {}) => z.object({type:z.literal(type),requestId:uuidSchema, ...fields}).strict();
const expected = {cursor:z.int().nonnegative()};
const action = z.discriminatedUnion('type', [
  shape('release',expected),shape('open',expected),shape('finish',expected),
  shape('respond',{stepIndex:z.int().nonnegative(),text:text(3000)}),
  shape('spotlight',{...expected,ids:z.array(uuidSchema).min(1).max(3).refine(ids => ids.length === new Set(ids).size)}),
  shape('comment',{stepIndex:z.int().nonnegative(),text:text(3000)}),
  shape('heartbeat',{seconds:z.int().min(0).max(30)})
]);
const afterCursor = z.coerce.number().int().min(0).max(2147483647);
const fail = (status, code, message) => { throw new ApiError(status,code,message); };
const denied = () => fail(403,'COURSE_ACCESS_DENIED','Your account cannot access this seminar.');
const missing = () => fail(404,'SEMINAR_UNAVAILABLE','This seminar is unavailable.');
const conflict = message => fail(409,'SEMINAR_STATE',message);
const staff = user => ['teacher','teacher_admin'].includes(user.role);

async function scope(client,user,courseCode) {
  if (!await new PostgresRepository(client).canAccessCourse(user,courseCode)) denied();
  await requireClassroomRollout(client,courseCode,user.id);
  const {rows:[{section}]} = await client.query('SELECT in_course_test_section($1,$2) AS section',[courseCode,user.id]);
  return {user,courseCode,section};
}

async function getRoom(client,ctx,id,lock=false) {
  const {rows:[room]} = await client.query(
    'SELECT * FROM text_seminars WHERE id=$1 AND course_code=$2 AND test_section=$3' + (lock ? ' FOR UPDATE' : ''),
    [id,ctx.courseCode,ctx.section]);
  if (!room || (!staff(ctx.user) && room.stage === 'prepared')) missing();
  return room;
}

function summary(room) {
  return {id:room.id,title:room.title,stage:room.stage,stepIndex:room.step_index,cursor:room.cursor};
}

function events(client,id,after=0,limit=2147483647) {
  return client.query('SELECT cursor,kind,payload,created_at AS "at" FROM text_seminar_events WHERE room_id=$1 AND cursor>$2 ORDER BY cursor LIMIT $3',[id,after,limit]).then(data => data.rows);
}

async function snapshot(client,ctx,room) {
  const doc = {...summary(room),events:await events(client,room.id)};
  if (staff(ctx.user)) {
    doc.board = room.board;
    doc.pool = (await client.query(
      'SELECT r.id,r.body AS text,u.display_name AS author FROM text_seminar_responses r JOIN app_users u ON r.student_id=u.id WHERE r.room_id=$1 AND r.step_index=$2 ORDER BY r.created_at,r.id',
      [room.id,room.step_index])).rows;
  } else {
    const {rows:[own]} = await client.query('SELECT body AS text FROM text_seminar_responses WHERE room_id=$1 AND step_index=$2 AND student_id=$3',[room.id,room.step_index,ctx.user.id]);
    doc.ownResponse = own?.text ?? null;
  }
  return doc;
}

async function publish(client,room,kind,payload,stage,stepIndex=room.step_index) {
  const {rows:[{cursor}]} = await client.query('UPDATE text_seminars SET cursor=cursor+1,stage=$2,step_index=$3 WHERE id=$1 RETURNING cursor',[room.id,stage,stepIndex]);
  await client.query('INSERT INTO text_seminar_events(room_id,cursor,kind,payload) VALUES($1,$2,$3,$4)',[room.id,cursor,kind,payload]);
}

async function heartbeat(client,ctx,room,seconds) {
  if (staff(ctx.user) || room.stage === 'prepared' || room.stage === 'finished') return;
  // Room is locked by the action transaction. Ignore overlapping tabs and long gaps.
  const args = [room.id,ctx.user.id,ctx.courseCode,ctx.section,seconds];
  await client.query(
    `WITH sample AS (SELECT statement_timestamp() AS t),
        measured AS (SELECT GREATEST(a.last_seen,s.t-($5::int * interval '1 second')) AS since,s.t
                   FROM text_seminar_attendance a,sample s WHERE room_id=$1 AND student_id=$2
                   AND a.last_seen >= s.t - interval '35 seconds')
       INSERT INTO course_engagement_intervals(student_id,course_code,test_section,source,observed)
       SELECT $2,$3,$4,'seminar',tstzrange(since,t,'[)') FROM measured WHERE since<t`,args);
  await client.query('INSERT INTO text_seminar_attendance(room_id,student_id) VALUES($1,$2) ON CONFLICT(room_id,student_id) DO UPDATE SET last_seen=clock_timestamp()',[room.id,ctx.user.id]);
}

async function mutate(client,ctx,room,a) {
  if (['release','open','spotlight','finish'].includes(a.type) && !staff(ctx.user)) denied();
  const fingerprint = stableFingerprint(a);
  const receipt = await client.query('INSERT INTO text_seminar_receipts(room_id,actor_id,request_id,fingerprint) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[room.id,ctx.user.id,a.requestId,fingerprint]);
  if (!receipt.rowCount) {
    const {rows:[prior]} = await client.query('SELECT fingerprint FROM text_seminar_receipts WHERE room_id=$1 AND actor_id=$2 AND request_id=$3',[room.id,ctx.user.id,a.requestId]);
    if (prior.fingerprint !== fingerprint) conflict('This request identifier was used for another action.');
    return;
  }
  if (a.cursor !== undefined && a.cursor !== room.cursor) conflict('The seminar has advanced. Refresh the board.');
  if (a.stepIndex !== undefined && a.stepIndex !== room.step_index) conflict('This prompt has changed.');
  const current = room.board[room.step_index];
  switch (a.type) {
    case 'release': {
      const index = room.step_index + 1;
      const next = room.board[index];
      if (!next || !['prepared','board','discussion'].includes(room.stage) || (room.stage === 'board' && current.prompt)) conflict('Complete the current board step first.');
      return publish(client,room,'board',{text:next.text,stepIndex:index},'board',index);
    }
    case 'open':
      if (room.stage !== 'board' || !current?.prompt) conflict('Release a board step with a blind prompt first.');
      return publish(client,room,'blind',{text:current.prompt,stepIndex:room.step_index},'blind');
    case 'respond': {
      if (staff(ctx.user)) denied();
      if (room.stage !== 'blind') conflict('This blind response pool is closed.');
      const response = await client.query('INSERT INTO text_seminar_responses(room_id,step_index,student_id,body) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[room.id,room.step_index,ctx.user.id,a.text]);
      if (!response.rowCount) conflict('Your response is already recorded.');
      return;
    }
    case 'spotlight': {
      if (room.stage !== 'blind') conflict('Open a blind response pool first.');
      const {rows} = await client.query('SELECT body FROM text_seminar_responses WHERE room_id=$1 AND step_index=$2 AND id=ANY($3::uuid[]) ORDER BY array_position($3::uuid[],id)',[room.id,room.step_index,a.ids]);
      if (rows.length !== a.ids.length) fail(422,'INVALID_SELECTION','Choose responses from this prompt.');
      return publish(client,room,'spotlight',{responses:rows.map(r => r.body),stepIndex:room.step_index},'discussion');
    }
    case 'comment':
      if (room.stage !== 'discussion') conflict('Public comments open after the selected responses appear.');
      return publish(client,room,'comment',{text:a.text,speaker:staff(ctx.user) ? 'Teacher' : 'Class member',stepIndex:room.step_index},'discussion');
    case 'finish':
      if (['prepared','finished'].includes(room.stage)) conflict('Open the seminar before finishing.');
      return publish(client,room,'finished',{},'finished');
    case 'heartbeat': return heartbeat(client,ctx,room,a.seconds);
  }
}

export function registerTextSeminars(app,{repository,requireRoles,requireCsrf}) {
  const path = '/v1/courses/:courseCode/seminars';
  const read = requireRoles('student','teacher','teacher_admin');
  const teach = requireRoles('teacher','teacher_admin');
  function tx(work,write=false) {
    return async (req,reply) => {
      reply.header('Cache-Control','private, no-store');
      const code = parse(courseCodeSchema,req.params.courseCode);
      const client = await repository.pool.connect();
      try {
        await client.query(write ? 'BEGIN' : 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        const ctx = await scope(client,req.auth.user,code);
        const room = req.params.roomId ? await getRoom(client,ctx,parse(uuidSchema,req.params.roomId),write) : null;
        const value = await work(client,ctx,room,req,reply);
        await client.query('COMMIT');
        return value;
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {client.release();}
    };
  }
  app.get(path,{preHandler:[read]},tx(async (client,ctx) => {
    const {rows} = await client.query("SELECT id,title,stage,step_index,cursor FROM text_seminars WHERE course_code=$1 AND test_section=$2 AND ($3 OR stage<>'prepared') ORDER BY created_at DESC,id DESC",[ctx.courseCode,ctx.section,staff(ctx.user)]);
    return {rooms:rows.map(summary),section:ctx.section ? 'TEST' : 'regular'};
  }));
  app.post(path,{bodyLimit:256*1024,preHandler:[teach,requireCsrf]},tx(async (client,ctx,_room,req) => {
    const body = parse(creation,req.body);
    await client.query('INSERT INTO text_seminars(id,course_code,test_section,created_by,title,board) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[body.id,ctx.courseCode,ctx.section,ctx.user.id,body.title,JSON.stringify(body.board)]);
    const room = await getRoom(client,ctx,body.id);
    if (room.created_by !== ctx.user.id || room.title !== body.title || stableFingerprint(room.board) !== stableFingerprint(body.board)) conflict('A different seminar uses that identifier.');
    return snapshot(client,ctx,room);
  },true));
  app.get(path+'/:roomId',{preHandler:[read]},tx(snapshot));
  app.post(path+'/:roomId/actions',{preHandler:[read,requireCsrf]},tx(async (client,ctx,room,req) => {
    const a = parse(action,req.body);
    await mutate(client,ctx,room,a);
    if (a.type === 'heartbeat') return {recorded:true};
    return snapshot(client,ctx,await getRoom(client,ctx,room.id));
  },true));
  app.get(path+'/:roomId/transcript',{preHandler:[read]},tx(async (client,ctx,room,_req,reply) => {
    if (room.stage !== 'finished') conflict('The transcript is available after the seminar ends.');
    reply.header('Content-Disposition','attachment; filename="class-transcript-'+room.id+'.json"');
    return {format:'LFA Class Transcript',courseCode:ctx.courseCode,title:room.title,events:await events(client,room.id)};
  }));
  app.get(path+'/:roomId/stream',{preHandler:[read]},async(req,reply) => {
    const courseCode = parse(courseCodeSchema,req.params.courseCode);
    const id = parse(uuidSchema,req.params.roomId);
    let cursor = parse(afterCursor, req.headers['last-event-id'] || req.query.after || '0');
    async function page() {
      // Each poll rechecks session, section and enrollment, including after revocation.
      await read(req);
      const ctx = await scope(repository.pool,req.auth.user,courseCode);
      const room = await getRoom(repository.pool,ctx,id);
      return {stage:room.stage,cursor:room.cursor,rows:await events(repository.pool,id,cursor,100)};
    }
    const initial = await page();
    if (cursor > initial.cursor) conflict('The event cursor is ahead of this room.');
    const controller = new AbortController();
    reply.raw.once('close',() => controller.abort());
    async function* stream() {
      let next = initial;
      yield 'retry: 2000\n\n';
      try {
        while (!controller.signal.aborted) {
          for (const event of next.rows) {
            cursor = event.cursor;
            yield 'id: '+cursor+'\nevent: board\ndata: '+JSON.stringify(event)+'\n\n';
          }
          if (next.stage === 'finished' && cursor >= next.cursor) return;
          if (next.rows.length < 100) {
            yield ': connected\n\n';
            await delay(1800,undefined,{signal:controller.signal});
          }
          if (!controller.signal.aborted) next = await page();
        }
      } catch (e) {
        if (!controller.signal.aborted) yield 'event: reconnect\ndata: {}\n\n';
      }
    }
    reply.type('text/event-stream; charset=utf-8').header('Cache-Control','no-cache, no-transform').header('X-Accel-Buffering','no');
    return reply.send(Readable.from(stream()));
  });
}
