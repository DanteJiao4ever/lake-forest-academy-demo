import { z } from "zod";
import { uuidSchema } from "./validation.js";

const rubricCriterion = z.object({
  label: z.string().trim().min(1).max(100),
  points: z.number().int().min(0).max(100),
  maximum: z.number().int().min(1).max(100),
}).refine((row) => row.points <= row.maximum, { message: "Points exceed the criterion maximum." });

export const submissionGradeSchema = z.object({
  submissionId: uuidSchema,
  score: z.number().int().min(0).max(100),
  feedback: z.string().max(10000),
  publish: z.boolean(),
  rubric: z.array(rubricCriterion).min(1).max(12).optional(),
}).superRefine(({ score, rubric }, ctx) => {
  if (!rubric) return;
  const labels = new Set(rubric.map((row) => row.label.toLowerCase()));
  if (labels.size !== rubric.length) {
    ctx.addIssue({ code: "custom", path: ["rubric"], message: "Each criterion needs its own label." });
  }
  const points = rubric.reduce((sum, row) => sum + row.points, 0);
  const maximum = rubric.reduce((sum, row) => sum + row.maximum, 0);
  if (score !== Math.round(points * 100 / maximum)) {
    ctx.addIssue({ code: "custom", path: ["score"], message: "Score must match the rubric percentage." });
  }
});
