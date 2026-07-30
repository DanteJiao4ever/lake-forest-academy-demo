import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";

const catalogUrl = new URL("../catalog/lfa-course-catalog.json", import.meta.url);
const schemaUrl = new URL("../migrations/003_platform_catalog_schema.sql", import.meta.url);
const seedUrl = new URL("../migrations/004_lotus_grade12_catalog_v1.sql", import.meta.url);
const appUrl = new URL("../src/app.js", import.meta.url);
const postgresUrl = new URL("../src/db/postgres.js", import.meta.url);

describe("course catalog migration contract", () => {
  test("contains every expand-only table and explicit runtime grant", async () => {
    const schema = await readFile(schemaUrl, "utf8");
    for (const table of [
      "course_modules",
      "module_lessons",
      "module_resources",
      "module_activities",
      "gradebook_items",
      "assessment_components",
      "student_gradebook_scores",
      "student_module_progress",
      "student_activity_completions",
      "module_unlock_overrides",
    ]) {
      assert.match(schema, new RegExp(`CREATE TABLE ${table} \\(`));
    }
    assert.match(schema, /module_unlock_overrides_reason_required/);
    assert.match(schema, /GRANT SELECT, INSERT, UPDATE ON TABLE\s+student_module_progress/s);
    assert.match(schema, /student_gradebook_scores_one_current_idx/);
    assert.match(schema, /student_gradebook_scores[\s\S]*TO lfa_app_runtime/);
    assert.doesNotMatch(schema, /DROP TABLE|DROP COLUMN|ALTER COLUMN.+SET NOT NULL/i);
  });

  test("keeps the canonical JSON and deterministic seed in lockstep", async () => {
    const rawCatalog = await readFile(catalogUrl);
    const catalog = JSON.parse(rawCatalog.toString("utf8"));
    const seed = await readFile(seedUrl, "utf8");
    const digest = createHash("sha256").update(rawCatalog).digest("hex");

    assert.equal(catalog.contract, "lfa.course-import.v1");
    assert.equal(catalog.schemaVersion, 1);
    assert.equal(catalog.catalogId, "lotus-grade12-six-course-v1");
    assert.equal(catalog.courses.length, 6);
    assert.equal(catalog.courses.flatMap((course) => course.modules).length, 72);
    assert.equal(
      catalog.courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)).length,
      120,
    );
    assert.equal(
      catalog.courses.flatMap((course) => course.modules.flatMap((module) => module.selfStudyResources)).length,
      198,
    );
    assert.equal(catalog.courses.flatMap((course) => course.gradebookItems).length, 44);
    assert.equal(catalog.totals.weightedAssignments, 38);
    assert.equal(
      catalog.courses
        .flatMap((course) => course.gradebookItems)
        .filter((item) => item.assignmentKey).length,
      38,
    );
    assert.equal(
      catalog.courses.flatMap((course) =>
        course.modules.flatMap((module) => module.assessment.components)).length,
      38,
    );
    for (const course of catalog.courses) {
      assert.deepEqual(course.modules.map((module) => module.number), [...Array(12).keys()]);
      assert.equal(
        course.modules.reduce((total, module) => total + module.estimatedCreditHours, 0),
        110,
      );
      assert.equal(
        course.gradebookItems.reduce((total, item) => total + item.weightPercent, 0),
        100,
      );
      assert.equal(course.modules.every((module) => module.unlockRule.teacherOverrideAllowed), true);
      assert.equal(course.modules.every((module) => module.unlockRule.overrideReasonRequired), true);
    }
    assert.match(seed, new RegExp(digest));
    assert.match(seed, /expected 72 modules/);
    assert.match(seed, /expected 38 assignments/);
    assert.match(seed, /every course must have 12 modules and 110 hours/);
    assert.match(seed, /every gradebook must total 100 percent/);
    assert.doesNotMatch(rawCatalog.toString("utf8"), /\b20\d{2}-\d{2}-\d{2}\b/);
    assert.doesNotMatch(seed, /'(?:20\d{2}-\d{2}-\d{2})(?:T|')/);
    assert.match(seed, /'text_or_file', NULL, NULL, NULL/);
  });

  test("passes the public student identifier consistently to direct grading", async () => {
    const [app, postgres] = await Promise.all([
      readFile(appUrl, "utf8"),
      readFile(postgresUrl, "utf8"),
    ]);
    assert.match(app, /studentPublicId:\s*params\.studentId/);
    assert.match(postgres, /input\.studentPublicId, input\.courseCode, input\.gradebookItemId/);
  });

  test("maps submission policy fields and keeps the database assignment unit authoritative", async () => {
    const [app, postgres] = await Promise.all([
      readFile(appUrl, "utf8"),
      readFile(postgresUrl, "utf8"),
    ]);
    assert.match(postgres, /moduleId:\s*row\.module_id/);
    assert.match(postgres, /submissionMode:\s*row\.submission_mode/);
    assert.match(app, /unitNumber:\s*assignment\.unitNumber/);
    assert.match(app, /`Unit \$\{assignment\.unitNumber\}`/);
  });
});
