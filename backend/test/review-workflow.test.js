import assert from "node:assert/strict";
import test from "node:test";
import { localReviewCalendarEnabled, reviewDueAt, transition } from "../src/services/review-workflow.js";

test("the trial calendar requires a local server and exclusively loopback origins in development or test", () => {
  const local = { nodeEnv: "test", host: "127.0.0.1", allowedOrigins: ["http://localhost:5173"] };
  assert.equal(localReviewCalendarEnabled(local), true);
  assert.equal(localReviewCalendarEnabled({ ...local, nodeEnv: "development", host: "::1" }), true);
  for (const change of [
    { nodeEnv: "production" }, { host: "0.0.0.0" }, { allowedOrigins: [] },
    { allowedOrigins: ["http://localhost:5173", "https://lakeforestacademy.ca"] },
    { allowedOrigins: ["https://localhost.example.org"] },
  ]) assert.equal(localReviewCalendarEnabled({ ...local, ...change }), false);
});

test("Toronto trial clock excludes nights, local closure dates, weekends, and handles both DST transitions", () => {
  const policy = { startHour: 9, endHour: 17, weekdays: [1, 2, 3, 4, 5], closures: [] };
  assert.equal(reviewDueAt("2026-03-06T20:00:00Z", policy), "2026-03-16T19:00:00.000Z");
  assert.equal(reviewDueAt("2026-10-30T19:00:00Z", policy), "2026-11-09T20:00:00.000Z");
  assert.equal(
    reviewDueAt("2026-10-30T19:00:00Z", { ...policy, closures: ["2026-11-02"] }),
    "2026-11-10T20:00:00.000Z",
  );
});
test("timed contextual defense uses the server deadline and revision anchors are version specific", () => {
  const c = {
    versions: [{ version: 1, text: "A changing curve." }],
    threads: [],
    defenses: [],
    evidence: { history: [], pasteEvents: [] },
  };
  const w = { contents: c, revision: 1 },
    teacher = { staff: true, user: { displayName: "Teacher" } },
    student = { staff: false, user: { displayName: "Student" } };
  const anchor = { version: 1, start: 2, exact: "changing" };
  assert.throws(
    () =>
      transition(
        w,
        { type: "comment", expectedRevision: 1, anchor: { ...anchor, start: 0 }, text: "Explain" },
        teacher,
      ),
    /passage/,
  );
  w.contents = transition(
    w,
    {
      type: "defense",
      expectedRevision: 1,
      minutes: 1,
      questions: [
        { prompt: "Why?", anchor },
        { prompt: "How?", anchor },
      ],
    },
    teacher,
  ).contents;
  const start = new Date("2026-11-10T15:00:00Z");
  w.contents = transition(w, { type: "startDefense", expectedRevision: 1 }, student, start).contents;
  assert.throws(
    () =>
      transition(
        w,
        { type: "answerDefense", expectedRevision: 1, answers: ["A", "B"] },
        student,
        new Date(+start + 60000),
      ),
    /window/,
  );
  assert.deepEqual(
    transition(
      w,
      { type: "answerDefense", expectedRevision: 1, answers: ["A", "B"] },
      student,
      new Date(+start + 59999),
    ).contents.defenses[0].answers,
    ["A", "B"],
  );
});
