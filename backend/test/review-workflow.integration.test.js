import { classroomFixture } from "./classroom-rollout-fixture.js";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { Readable } from "node:stream";
import test from "node:test";
import pg from "pg";
import { PostgresRepository } from "../src/db/postgres.js";
import { loadConfig } from "../src/config.js";
import { csrfTokenFor, sha256 } from "../src/lib/crypto.js";
import { FakeDrive, FakeScanner } from "./fakes.js";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ownerUrl = process.env.INTERACTIVE_TEST_OWNER_URL,
  runtimeUrl = process.env.INTERACTIVE_TEST_RUNTIME_URL;
test(
  "production TEST review and native grade flow without a trial deadline, alongside a local trial on the same records",
  { skip: !ownerUrl || !runtimeUrl },
  async (t) => {
    await classroomFixture(t, ownerUrl, "MCV4U");
    const dir = await mkdtemp(join(tmpdir(), "review-lessons-"));
    const lesson = JSON.parse(
      await readFile(
        new URL("../../scripts/fixtures/lesson-authoring/compiled/fixture-all-cards.json", import.meta.url),
        "utf8",
      ),
    );
    const lessonId = "cia4u-demand-2-3",
      cardId = lesson.cards.find((c) => c.type === "SynthesisGate").id;
    await writeFile(join(dir, lessonId + ".json"), JSON.stringify({ ...lesson, id: lessonId, version: "1.0" }));
    process.env.LFA_LESSON_CONTENT_DIR = dir;
    const { createApp } = await import("../src/app.js");
    const owner = new pg.Pool({ connectionString: ownerUrl }),
      pool = new pg.Pool({ connectionString: runtimeUrl }),
      repo = new PostgresRepository(pool);
    const origin = "http://127.0.0.1:5173";
    const config = loadConfig({
      NODE_ENV: "test",
      DATABASE_URL: runtimeUrl,
      ALLOWED_ORIGINS: origin,
      COOKIE_NAME: "__Host-lfa_session",
      COOKIE_SECURE: "false",
      CLAMAV_REQUIRED: "false",
    });
    const drive = new FakeDrive(),
      fileText = "A model predicts more rides at a fixed fare.";
    drive.openFile = async () => ({ stream: Readable.from([Buffer.from(fileText)]) });
    const prodConfig = loadConfig({
      NODE_ENV: "production", HOST: "127.0.0.1", DATABASE_URL: runtimeUrl,
      ALLOWED_ORIGINS: origin, CSRF_SECRET: config.csrfSecret, CURRICULUM_DRIVE_ROOT_ID: "fixture",
    });
    const dependencies = { repository: repo, drive, scanner: new FakeScanner(), logger: { level: "silent" } };
    const app = await createApp({ config: prodConfig, ...dependencies });
    const local = await createApp({ config, ...dependencies });
    async function member(role, testSection = true) {
      const label = randomUUID();
      const user = await repo.createUser({
        role,
        displayName: label,
        publicId: label,
        email: label + "@example.invalid",
        firstName: "Casey",
        lastName: "Lee",
        passwordHash: "fixture",
      });
      const membership =
        role === "student"
          ? "course_enrollments(student_user_id,course_code)"
          : "teacher_course_access(teacher_user_id,course_code)";
      await owner.query("INSERT INTO " + membership + " VALUES($1,'MCV4U')", [user.id]);
      if (testSection) await owner.query("INSERT INTO course_test_members VALUES('MCV4U',$1)", [user.id]);
      const session = randomUUID(),
        token = randomUUID(),
        csrf = csrfTokenFor(session, config.csrfSecret);
      await repo.createSession({
        id: session,
        userId: user.id,
        tokenHash: sha256(token),
        csrfTokenHash: sha256(csrf),
        expiresAt: new Date(Date.now() + 3600000),
      });
      return { ...user, headers: { origin, cookie: config.cookieName + "=" + token, "x-csrf-token": csrf } };
    }
    const base = "/v1/courses/MCV4U/review-workspace";
    async function hit(member, body, code = 200, path = base, server = app) {
      const res = await server.inject({
        url: path + (body ? "/actions" : ""),
        method: body ? "POST" : "GET",
        headers: member?.headers ?? {},
        payload: body || undefined,
      });
      assert.equal(res.statusCode, code, res.body.slice(0, 800));
      return res.json();
    }
    try {
      const [student, peer, faculty, other, admin] = await Promise.all([
        member("student"),
        member("student"),
        member("teacher"),
        member("teacher", false),
        member("teacher_admin"),
      ]);
      const sub = randomUUID(),
        file = randomUUID(),
        target = randomUUID(),
        stamp = new Date().toISOString();
      await owner.query(
        `INSERT INTO drive_submission_targets(id,display_name,drive_kind,root_folder_id,root_folder_name,credential_type,credential_ref,status,created_by)
      VALUES($1,'Fixture','my_drive',$2,'Fixture','service_account','fixture','disabled',$3)`,
        [target, randomUUID(), faculty.id],
      );
      await repo.createSubmission(
        {
          id: sub,
          studentUserId: student.id,
          studentId: student.publicId,
          studentName: student.displayName,
          courseCode: "MCV4U",
          unitNumber: 2,
          assignmentId: "mcv4u-u2-assessment",
          assignmentTitle: "Optimization Model",
          attemptNumber: 1,
          note: "File",
          idempotencyKey: randomUUID(),
          requestFingerprint: "a".repeat(64),
        },
        [
          {
            id: file,
            targetId: target,
            driveFileId: randomUUID(),
            parentFolderId: "folder",
            originalName: "memo.txt",
            storedName: "memo.txt",
            relativePath: "Fixture/memo.txt",
            mimeType: "text/plain",
            sizeBytes: Buffer.byteLength(fileText),
            sha256: createHash("sha256").update(fileText).digest("hex"),
            createdAt: stamp,
            modifiedAt: stamp,
          },
        ],
      );
      const cards = {
        [cardId]: {
          completed: true,
          submittedAt: stamp,
          answer: { text: fileText },
          history: [{ version: 1, createdAt: stamp, diff: { from: 0, removed: 0, inserted: fileText } }],
        },
        blind: { completed: true, pasteFlag: true, answer: { pasteWords: 32 } },
      };
      const reader = (
        await owner.query(
          "INSERT INTO interactive_lesson_readers(course_code,lesson_id,version,test_section,user_id,cards) VALUES('MCV4U',$1,'1.0',true,$2,$3) RETURNING id",
          [lessonId, student.id, cards],
        )
      ).rows[0].id;
      await hit(null, null, 401);
      assert.equal((await hit(student)).candidates.length, 0);
      const list = await hit(faculty);
      assert.equal(list.enabled, true);
      assert.equal(list.policy, null);
      const localPolicy = (await hit(admin, null, 200, base, local)).policy;
      assert(localPolicy.weekdays.length);
      const editCalendar = { type: "calendar", ...localPolicy };
      assert.equal((await hit(admin, editCalendar, 403)).error.code, "REVIEW_CALENDAR_DISABLED");
      assert.deepEqual((await hit(admin, editCalendar, 200, base, local)).policy, localPolicy);
      assert(list.candidates.some((c) => c.fileId === file));
      assert(list.candidates.some((c) => c.readerId === reader));
      const open = { type: "openFile", submissionId: sub, fileId: file, requestId: randomUUID() };
      await hit({ ...faculty, headers: { ...faculty.headers, "x-csrf-token": "bad" } }, open, 403);
      await hit(student, open, 403);
      let w = await hit(faculty, open);
      assert.equal((await hit(faculty, open)).id, w.id);
      assert.equal(w.versions[0].text, fileText);
      assert.equal(w.dueAt, null);
      assert(w.waitingSince);
      const workPath = base + "/works/" + w.id;
      const trialWork = await hit(student, null, 200, workPath, local);
      assert(Date.parse(trialWork.dueAt) > Date.parse(w.waitingSince));
      assert.equal((await hit(student, null, 200, workPath)).dueAt, null);
      assert.equal((await hit(faculty)).queue.find((item) => item.id === w.id).dueAt, null);
      await hit(peer, null, 404, base + "/works/" + w.id);
      const disabled = { section: "regular", role: "teacher", enabled: false, policy: null, queue: [], candidates: [] };
      assert.deepEqual(await hit(other), disabled);
      assert.deepEqual(await hit(other, null, 200, base, local), disabled);
      await hit(other, null, 404, workPath);
      const grade = () =>
        repo.createGrade({
          submissionId: sub,
          grader: faculty,
          expectedVersion: 0,
          idempotencyKey: randomUUID(),
          requestFingerprint: "f".repeat(64),
          publish: true,
          score: 81,
          feedback: "Final",
        });
      await assert.rejects(grade(), (e) => e.code === "REVIEW_REQUIRED");
      const act = async (user, type, details = {}, code = 200) => {
        const v = await hit(
          user,
          { type, workId: w.id, expectedRevision: w.revision, requestId: randomUUID(), ...details },
          code,
        );
        if (code === 200) w = v;
        return v;
      };
      const anchor = { version: 1, start: 2, exact: "model" };
      await act(faculty, "comment", { anchor, text: "Explain the measurement." });
      await act(faculty, "resolve", { threadId: w.threads[0].id }, 409);
      await act(student, "revisionDraft", { text: fileText + " New evidence.", pasteWords: 30 });
      assert.equal(w.evidence, undefined);
      assert.equal(
        (await hit(faculty, null, 200, base + "/works/" + w.id)).evidence.revisions[0].history.length,
        1,
      );
      await act(student, "revise", { text: fileText + " New evidence.", explanation: "Added a comparison." });
      assert.equal(w.dueAt, null);
      await act(faculty, "resolve", { threadId: w.threads[0].id });
      await act(faculty, "reopen", { threadId: w.threads[0].id });
      await act(faculty, "resolve", { threadId: w.threads[0].id }, 409);
      await act(student, "revise", {
        text: fileText + " I matched a second fare.",
        explanation: "Addressed the reopened thread.",
      });
      await act(faculty, "resolve", { threadId: w.threads[0].id });
      const q = { ...anchor, version: 3 };
      await act(faculty, "defense", {
        minutes: 2,
        questions: [
          { anchor: q, prompt: "Explain the graph." },
          { anchor: q, prompt: "How would you check this claim?" },
        ],
      });
      assert.equal((await hit(student, null, 200, base + "/works/" + w.id)).defenses[0].questions, undefined);
      await act(faculty, "release", { feedback: "Read" }, 409);
      await act(student, "startDefense");
      assert.equal(w.defenses[0].questions.length, 2);
      await act(student, "answerDefense", { answers: ["It compares fares.", "Repeat the survey."] });
      await act(faculty, "acceptDefense");
      await act(faculty, "release", { feedback: "Revision accepted." });
      assert.equal((await grade()).score, 81);
      await act(faculty, "reopen", { threadId: w.threads[0].id }, 409);
      const sw = await hit(faculty, {
        type: "openSynthesis",
        readerId: reader,
        cardId,
        requestId: randomUUID(),
      });
      assert.equal(sw.evidence.history.length, 1);
      assert.equal(sw.evidence.pasteEvents[0].wordCount, 32);
      assert.equal((await hit(student, null, 200, base + "/works/" + sw.id)).evidence, undefined);
    } finally {
      await local.close();
      await app.close();
      await pool.end();
      await owner.end();
      await rm(dir, { recursive: true, force: true });
    }
  },
);
