import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, test } from "node:test";

const catalogUrl = new URL("../catalog/lfa-course-catalog.json", import.meta.url);
const schemaUrl = new URL("../migrations/003_platform_catalog_schema.sql", import.meta.url);
const seedUrl = new URL("../migrations/004_lotus_grade12_catalog_v1.sql", import.meta.url);
const guardsUrl = new URL("../migrations/005_platform_catalog_guards_v1.sql", import.meta.url);
const appUrl = new URL("../src/app.js", import.meta.url);
const postgresUrl = new URL("../src/db/postgres.js", import.meta.url);

const immutableMigrationDigests = {
  "003_platform_catalog_schema.sql":
    "8012e07b45b47543366ba4dca1dfc5b55fdaceb65748dd11122b3dce0ddb9cde",
  "004_lotus_grade12_catalog_v1.sql":
    "1e39ff7d7e6fb8b8d674417a9f4839b2f5fd320b30da548c4022ecc9e5411b55",
};

function normalizedSha256(value) {
  return createHash("sha256").update(value.replaceAll("\r\n", "\n")).digest("hex");
}

function valuesBlock(sql, startPattern, endPattern) {
  const start = sql.search(startPattern);
  assert.ok(start >= 0, `Missing values block start: ${startPattern}`);
  const remainder = sql.slice(start);
  const end = remainder.search(endPattern);
  assert.ok(end > 0, `Missing values block end: ${endPattern}`);
  return remainder.slice(0, end);
}

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

  test("extends immutable 003/004 migrations only through the additive 005 guard", async () => {
    const [schema, seed, guards] = await Promise.all([
      readFile(schemaUrl, "utf8"),
      readFile(seedUrl, "utf8"),
      readFile(guardsUrl, "utf8"),
    ]);

    assert.equal(
      normalizedSha256(schema),
      immutableMigrationDigests["003_platform_catalog_schema.sql"],
    );
    assert.equal(
      normalizedSha256(seed),
      immutableMigrationDigests["004_lotus_grade12_catalog_v1.sql"],
    );
    assert.doesNotMatch(schema, /\bsection_kind\b/);
    assert.doesNotMatch(seed, /\bsection_kind\b/);

    assert.match(
      guards,
      /ALTER TABLE assignments\s+ADD COLUMN section_kind text NOT NULL DEFAULT 'unit'/,
    );
    assert.match(
      guards,
      /CHECK \(section_kind IN \('unit', 'final_evaluation'\)\)/,
    );
    assert.doesNotMatch(
      guards,
      /ALTER TABLE student_submissions[\s\S]{0,120}ADD COLUMN section_kind/i,
    );
    assert.doesNotMatch(
      guards,
      /ALTER TABLE (?:assignments|student_submissions)[\s\S]{0,120}unit_number/i,
    );
    assert.match(
      guards,
      /COMMENT ON COLUMN student_submissions\.unit_number[\s\S]+Resolve the public section through assignment_id/,
    );
  });

  test("seeds 8 final-evaluation and 30 numbered-unit assignments with 72 explicit unlock rules", async () => {
    const [rawCatalog, guards] = await Promise.all([
      readFile(catalogUrl, "utf8"),
      readFile(guardsUrl, "utf8"),
    ]);
    const catalog = JSON.parse(rawCatalog);
    const modules = catalog.courses.flatMap((course) => course.modules);
    const weightedAssignments = catalog.courses.flatMap((course) =>
      course.gradebookItems.filter((item) => item.assignmentKey),
    );
    const finalAssignments = weightedAssignments.filter(
      (item) => item.category === "final_evaluation",
    );

    assert.equal(modules.length, 72);
    assert.equal(
      modules.filter(
        (module) =>
          module.number === 11 &&
          module.unitNumber === null &&
          module.unitTitle === "Final Evaluation",
      ).length,
      6,
    );
    assert.equal(weightedAssignments.length, 38);
    assert.equal(finalAssignments.length, 8);
    assert.equal(weightedAssignments.length - finalAssignments.length, 30);

    const assignmentSections = valuesBlock(
      guards,
      /UPDATE assignments AS assignment/,
      /ALTER TABLE module_resources/,
    );
    assert.equal(
      [...assignmentSections.matchAll(/\('[^']+', 'final_evaluation'\)/g)].length,
      8,
    );
    assert.equal(
      [...assignmentSections.matchAll(/\('[^']+', 'unit'\)/g)].length,
      30,
    );

    const unlockRules = valuesBlock(
      guards,
      /UPDATE course_modules AS module/,
      /ALTER TABLE course_modules\s+ALTER COLUMN unlock_criteria/,
    );
    assert.equal(
      [...unlockRules.matchAll(/\('[a-z0-9]+-m(?:0\d|1[01])', '\{/g)].length,
      72,
    );
    assert.match(guards, /expected 8 final-evaluation assignments/);
    assert.match(guards, /expected 30 numbered-unit assignments/);
    assert.match(guards, /expected 72 preserved rules with versioned criteria/);
  });

  test("passes the public student identifier consistently to direct grading", async () => {
    const [app, postgres] = await Promise.all([
      readFile(appUrl, "utf8"),
      readFile(postgresUrl, "utf8"),
    ]);
    assert.match(app, /studentPublicId:\s*params\.studentId/);
    assert.match(postgres, /input\.studentPublicId, input\.courseCode, input\.gradebookItemId/);
  });

  test("maps submission policy fields while treating the numeric assignment unit as legacy storage", async () => {
    const [app, postgres] = await Promise.all([
      readFile(appUrl, "utf8"),
      readFile(postgresUrl, "utf8"),
    ]);
    assert.match(postgres, /moduleId:\s*row\.module_id/);
    assert.match(postgres, /submissionMode:\s*row\.submission_mode/);
    assert.match(app, /unitNumber:\s*assignment\.unitNumber/);
    assert.match(app, /sectionKind:\s*assignment\.sectionKind/);
    assert.match(
      app,
      /assignment\.sectionKind === "final_evaluation"[\s\S]+?\? "Final Evaluation"[\s\S]+?: `Unit \$\{assignment\.curriculumUnitNumber \?\? assignment\.unitNumber\}`/,
    );
    assert.doesNotMatch(
      app,
      /const pathSegments = \[[\s\S]{0,240}`Unit \$\{assignment\.unitNumber\}`/,
    );
  });

  test("keeps terminal student activity evidence immutable in the atomic PostgreSQL upsert", async () => {
    const postgres = await readFile(postgresUrl, "utf8");
    assert.match(
      postgres,
      /ON CONFLICT \(student_user_id, activity_id\) DO UPDATE SET[\s\S]+?WHERE existing\.status NOT IN \('completed', 'waived'\)[\s\S]+?existing\.status = EXCLUDED\.status[\s\S]+?existing\.evidence = EXCLUDED\.evidence/,
    );
    assert.match(
      postgres,
      /if \(!result\.rowCount\) \{[\s\S]+?"ACTIVITY_COMPLETION_LOCKED"/,
    );
  });
});
