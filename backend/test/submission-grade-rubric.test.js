import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { submissionGradeSchema } from "../src/lib/submission-grade.js";

test("rubric grades require unique named criteria and the rounded points percentage", () => {
  const grade = { submissionId: randomUUID(), score: 63, feedback: "", publish: false };
  const criterion = { label: "Reasoning", points: 5, maximum: 8 };
  const accepts = (rubric, score = grade.score) =>
    submissionGradeSchema.safeParse({ ...grade, rubric, score }).success;
  assert.ok(accepts(undefined));
  assert.ok(accepts([criterion]));
  assert.ok(accepts([{ ...criterion, points: 0 }], 0));
  assert.equal(accepts([criterion], 62), false);
  assert.equal(accepts([criterion, { ...criterion, label: " reasoning " }]), false);
  assert.equal(accepts([{ ...criterion, points: 9 }], 100), false);
  assert.equal(accepts([{ ...criterion, maximum: 0 }], 0), false);
});
