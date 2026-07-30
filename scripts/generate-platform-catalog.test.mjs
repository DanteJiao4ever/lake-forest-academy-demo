import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import {
  buildArtifacts,
  buildArtifactsFromCatalog,
  buildCatalogFromSources,
  CATALOG_ID,
  CONTRACT,
  COURSE_CODES,
  validateCatalog,
} from "./generate-platform-catalog.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = path.join(repositoryRoot, "backend", "catalog", "lfa-course-catalog.json");
const javascriptPath = path.join(repositoryRoot, "public", "learning", "platform-sequences.js");
const sqlPath = path.join(repositoryRoot, "backend", "migrations", "004_lotus_grade12_catalog_v1.sql");
const guardsSqlPath = path.join(
  repositoryRoot,
  "backend",
  "migrations",
  "005_platform_catalog_guards_v1.sql",
);

function walkKeys(value, visit) {
  if (Array.isArray(value)) {
    for (const item of value) walkKeys(item, visit);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    visit(key);
    walkKeys(child, visit);
  }
}

function insertedRowCount(sql, table, nextTable) {
  const start = sql.indexOf(`INSERT INTO ${table} `);
  const end = nextTable ? sql.indexOf(`INSERT INTO ${nextTable} `, start) : sql.indexOf("DO $$", start);
  assert.ok(start >= 0 && end > start, `Could not isolate ${table} seed block`);
  return [...sql.slice(start, end).matchAll(/^  \(/gm)].length;
}

test("checked-in catalog satisfies the lfa.course-import.v1 invariants", () => {
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  validateCatalog(catalog);
  assert.equal(catalog.contract, CONTRACT);
  assert.equal(catalog.catalogId, CATALOG_ID);
  assert.deepEqual(catalog.courseOrder, COURSE_CODES);
  assert.deepEqual(catalog.totals, {
    courses: 6,
    modules: 72,
    lessons: 120,
    resources: 198,
    recordedCreditHours: 660,
    gradebookItems: 44,
    weightedAssignments: 38,
    weightedAssessmentComponents: 38,
  });

  const serialized = JSON.stringify(catalog);
  assert.ok(serialized.includes("1–2 h onboarding"));
  assert.ok(serialized.includes("Châtelier"));
  assert.ok(serialized.includes("E°cell"));
  assert.ok(!/[鈥芒掳璺檚鈩]/u.test(serialized), "catalog must not contain mojibake markers");

  const forbiddenMetadataKeys = new Set([
    "date",
    "generatedat",
    "generated_at",
    "createdat",
    "created_at",
    "updatedat",
    "updated_at",
  ]);
  walkKeys(catalog, (key) => {
    assert.ok(!forbiddenMetadataKeys.has(key.toLowerCase()), `catalog must not contain date metadata field ${key}`);
  });
});

test("browser artifact exposes array and code-indexed views of the same catalog", () => {
  const source = readFileSync(javascriptPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const catalog = sandbox.window.LFA_PLATFORM_CATALOG;
  assert.ok(catalog);
  assert.equal(sandbox.window.LFA_PLATFORM_SEQUENCES, catalog);
  assert.equal(catalog.coursesByCode.MHF4U, catalog.courses.find((course) => course.code === "MHF4U"));
  assert.equal(catalog.coursesByCode.MHF4U.modules[0].key, "MHF4U-M00");
  assert.equal(catalog.coursesByCode.MHF4U.modules[11].key, "MHF4U-M11");
  assert.equal("teacherPresence" in catalog.coursesByCode.MHF4U.modules[2], false);
  assert.equal("evidenceToRetain" in catalog.coursesByCode.MHF4U.modules[2], false);
  assert.equal(
    "authenticationEvidence" in
      catalog.coursesByCode.MHF4U.modules[2].assessment,
    false,
  );
  const forbiddenPublicKeys = new Set([
    "sourceComponents",
    "finalEvaluationComponents",
    "teacherPresence",
    "evidenceToRetain",
    "processCheckpoints",
    "authenticationEvidence",
  ]);
  walkKeys(catalog, (key) => {
    assert.equal(
      forbiddenPublicKeys.has(key),
      false,
      `browser catalog must not expose staff-only key ${key}`,
    );
  });
  for (const course of catalog.courses) {
    for (const module of course.modules) {
      for (const resource of module.selfStudyResources) {
        const url = new URL(resource.url);
        assert.equal(url.protocol, "https:");
        assert.equal(url.username, "");
        assert.equal(url.password, "");
      }
    }
  }
});

test("additive catalog guards classify final evidence and version unlock policy without thresholds", () => {
  const sql = readFileSync(guardsSqlPath, "utf8");
  assert.match(sql, /ADD COLUMN section_kind text NOT NULL DEFAULT 'unit'/);
  assert.match(sql, /expected 8 final-evaluation assignments/);
  assert.match(sql, /expected 30 numbered-unit assignments/);
  assert.match(sql, /expected 72 preserved rules with versioned criteria/);
  assert.match(sql, /platform_policy_not_natural_language_parser/);
  assert.doesNotMatch(sql, /minScore|threshold|percentage/i);
  assert.doesNotMatch(sql, /ALTER TABLE student_submissions\s+ADD COLUMN section_kind/i);
});

test("SQL seed contains the exact catalog row counts and no scheduled dates", () => {
  const sql = readFileSync(sqlPath, "utf8");
  const catalogHash = createHash("sha256").update(readFileSync(catalogPath, "utf8")).digest("hex");
  assert.equal(insertedRowCount(sql, "courses", "course_modules"), 6);
  assert.equal(insertedRowCount(sql, "course_modules", "module_lessons"), 72);
  assert.equal(insertedRowCount(sql, "module_lessons", "module_resources"), 120);
  assert.equal(insertedRowCount(sql, "module_resources", "module_activities"), 198);
  assert.equal(insertedRowCount(sql, "module_activities", "assignments"), 72);
  assert.equal(insertedRowCount(sql, "assignments", "gradebook_items"), 38);
  assert.equal(insertedRowCount(sql, "gradebook_items", "assessment_components"), 44);
  assert.equal(insertedRowCount(sql, "assessment_components", null), 38);
  assert.match(sql, /expected 38 assignments/);
  assert.match(sql, /every course must have 12 modules and 110 hours/);
  assert.match(sql, /every gradebook must total 100 percent/);
  assert.ok(sql.includes(catalogHash), "catalog_imports hash must match the canonical JSON bytes");
  assert.ok(!/\b20\d{2}-\d{2}-\d{2}\b/.test(sql), "seed must not embed calendar dates");
  assert.match(sql, /NULL, NULL, NULL, 'sch4u-m02'/, "assignment schedules remain unset");
});

test("generation is byte-for-byte deterministic and preserves source unlock text when source is supplied", () => {
  const checkedInCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const sourceDirectory = process.env.LFA_PLATFORM_SEQUENCE_SOURCE_DIR
    ? path.resolve(process.env.LFA_PLATFORM_SEQUENCE_SOURCE_DIR)
    : null;
  if (sourceDirectory) assert.ok(existsSync(sourceDirectory), `source directory does not exist: ${sourceDirectory}`);
  const first = sourceDirectory ? buildArtifacts(sourceDirectory) : buildArtifactsFromCatalog(checkedInCatalog);
  const second = sourceDirectory ? buildArtifacts(sourceDirectory) : buildArtifactsFromCatalog(checkedInCatalog);
  assert.equal(first.json, second.json);
  assert.equal(first.javascript, second.javascript);
  assert.equal(first.sql, second.sql);
  assert.equal(first.guardsSql, second.guardsSql);
  assert.equal(first.json, readFileSync(catalogPath, "utf8"));
  assert.equal(first.javascript, readFileSync(javascriptPath, "utf8"));
  assert.equal(first.sql, readFileSync(sqlPath, "utf8"));
  assert.equal(first.guardsSql, readFileSync(guardsSqlPath, "utf8"));

  if (sourceDirectory) {
    const rebuilt = buildCatalogFromSources(sourceDirectory);
    for (const code of COURSE_CODES) {
      const source = JSON.parse(readFileSync(path.join(sourceDirectory, `${code}.json`), "utf8"));
      const generated = rebuilt.courses.find((course) => course.code === code);
      assert.deepEqual(
        generated.modules.map((module) => module.unlockRule.ruleText),
        source.modules.map((module) => module.feedback_and_unlock),
      );
    }
  }
});
