#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const CONTRACT = "lfa.course-import.v1";
export const SCHEMA_VERSION = 1;
export const CATALOG_ID = "lotus-grade12-six-course-v1";
export const COURSE_CODES = Object.freeze(["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"]);
export const GRADED_MODULES = Object.freeze([2, 4, 6, 8, 10]);
export const COURSEWORK_WEIGHTS = Object.freeze([10, 12, 14, 14, 15]);

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), "..");
const defaultSourceDirectory = path.join(repositoryRoot, "backend", "catalog", "source");
const defaultJsonOutput = path.join(repositoryRoot, "backend", "catalog", "lfa-course-catalog.json");
const defaultJavaScriptOutput = path.join(repositoryRoot, "public", "learning", "platform-sequences.js");
const defaultSqlOutput = path.join(repositoryRoot, "backend", "migrations", "004_lotus_grade12_catalog_v1.sql");

const asArray = (value) => (Array.isArray(value) ? value : []);
const asString = (value) => (typeof value === "string" ? value : "");
const asNullableString = (value) => {
  const normalized = asString(value).trim();
  return normalized || null;
};
const asNullableNumber = (value) => (Number.isFinite(value) ? Number(value) : null);
const pad2 = (value) => String(value).padStart(2, "0");
const lowerId = (value) => value.toLowerCase();
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function requireString(value, label) {
  assert.equal(typeof value, "string", `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
  return value;
}

function normalizeFinalComponent(courseCode, component, position) {
  const type = requireString(component.type, `${courseCode} final component ${position} type`);
  const isWrittenExam = /written examination/i.test(type);
  const componentKey = isWrittenExam ? "m11-written-exam" : "m11-culminating";
  return {
    key: `${courseCode}-M11-C${pad2(position)}`,
    componentKey,
    position,
    title: requireString(component.title, `${courseCode} final component ${position} title`),
    type,
    weightPercent: Number(component.weight),
    timeMinutes: asNullableNumber(component.minutes),
    processCheckpoints: asArray(component.process_checkpoints).map(String),
    submissionMode: isWrittenExam ? "supervised" : "project",
  };
}

function normalizeAssessment(courseCode, moduleKey, moduleNumber, assessment, finalComponents) {
  const weightPercent = Number(assessment.course_grade_weight_percent ?? 0);
  const processCheckpoints = asArray(assessment.process_checkpoints).map(String);
  const type = requireString(assessment.type, `${moduleKey} assessment type`);
  const rawComponents = moduleNumber === 11
    ? finalComponents.map((component) => ({ ...component }))
    : weightPercent > 0
      ? [{
          key: `${courseCode}-M${pad2(moduleNumber)}-C01`,
          componentKey: `m${pad2(moduleNumber)}-coursework`,
          position: 1,
          title: requireString(assessment.title, `${moduleKey} assessment title`),
          type,
          weightPercent,
          timeMinutes: asNullableNumber(assessment.time_minutes),
          processCheckpoints,
          submissionMode: "text_or_file",
        }]
      : [];
  const components = rawComponents.map((component) => ({
    ...component,
    assignmentKey: rawComponents.length === 1
      ? `${moduleKey}-ASSIGNMENT`
      : `${courseCode}-${component.componentKey.toUpperCase()}-ASSIGNMENT`,
  }));

  const activityType = /orientation/i.test(type)
    ? "orientation"
    : /formative/i.test(type)
      ? "formative"
      : /coursework/i.test(type)
        ? "coursework"
        : "final_evaluation";

  return {
    key: `${moduleKey}-ASSESSMENT`,
    assignmentKey: components.length === 1 ? components[0].assignmentKey : null,
    assignmentKeys: components.map((component) => component.assignmentKey),
    activityType,
    type,
    title: requireString(assessment.title, `${moduleKey} assessment title`),
    weightPercent,
    evidenceFile: asNullableString(assessment.evidence_file),
    sequence: asArray(assessment.sequence).map(String),
    taskType: asNullableString(assessment.task_type),
    processCheckpoints,
    authenticationEvidence: asArray(assessment.authentication_evidence).map(String),
    timeMinutes: asNullableNumber(assessment.time_minutes),
    components,
    required: true,
  };
}

function normalizeModule(courseCode, sourceModule, finalComponents) {
  const number = Number(sourceModule.module_number);
  assert.ok(Number.isInteger(number), `${courseCode} module number must be an integer`);
  const key = `${courseCode}-M${pad2(number)}`;
  const lessonIds = asArray(sourceModule.lesson_ids).map(String);
  const lessonTitles = asArray(sourceModule.lesson_titles).map(String);
  assert.equal(lessonIds.length, lessonTitles.length, `${key} lesson id/title counts differ`);

  const lessons = lessonIds.map((id, index) => ({
    key: id,
    id,
    title: requireString(lessonTitles[index], `${key} lesson ${index + 1} title`),
    order: index + 1,
  }));

  const selfStudyResources = asArray(sourceModule.self_study_resources).map((resource, index) => ({
    key: `${key}-RESOURCE-${pad2(index + 1)}`,
    title: requireString(resource.title, `${key} resource ${index + 1} title`),
    provider: asString(resource.provider),
    url: requireString(resource.url, `${key} resource ${index + 1} URL`),
    assignedUse: asString(resource.assigned_use),
    order: index + 1,
  }));

  const assessment = normalizeAssessment(courseCode, key, number, sourceModule.assessment ?? {}, finalComponents);
  return {
    key,
    number,
    title: requireString(sourceModule.module_title, `${key} title`),
    unitNumber: asNullableNumber(sourceModule.unit_number),
    unitTitle: requireString(sourceModule.unit_title, `${key} unit title`),
    lessonIds,
    lessonTitles,
    lessons,
    learningFocus: asArray(sourceModule.learning_focus).map(String),
    readingSteps: asArray(sourceModule.core_reading_order).map(String),
    selfStudyResources,
    guidedPractice: asString(sourceModule.guided_practice),
    lowStakesCheck: asString(sourceModule.low_stakes_check),
    assessment,
    unlockRule: {
      ruleText: asString(sourceModule.feedback_and_unlock),
      teacherOverrideAllowed: true,
      overrideReasonRequired: true,
    },
    estimatedCreditHours: Number(sourceModule.estimated_credit_hours ?? 0),
    workloadLabel: asString(sourceModule.workload_label),
    teacherPresence: asString(sourceModule.teacher_presence),
    evidenceToRetain: asString(sourceModule.evidence_to_retain),
  };
}

function submissionModeFor(component) {
  if (/written examination/i.test(component.type)) return "supervised";
  if (/culminating/i.test(component.type)) return "project";
  return component.submissionMode || "text_or_file";
}

function buildGradebookItems(courseCode, modules, framework) {
  const items = [];
  for (const module of modules) {
    for (const component of module.assessment.components) {
      items.push({
        key: `${courseCode}-${component.componentKey.toUpperCase()}`,
        courseCode,
        moduleKey: module.key,
        moduleActivityKey: module.assessment.key,
        assignmentKey: component.assignmentKey,
        category: module.number === 11 ? "final_evaluation" : "coursework",
        componentKey: component.componentKey,
        title: component.title,
        type: component.type,
        weightPercent: component.weightPercent,
        maxScore: 100,
        submissionMode: submissionModeFor(component),
        position: items.length + 1,
        evidenceDescription: module.assessment.evidenceFile,
      });
    }
  }

  items.push({
    key: `${courseCode}-PARTICIPATION`,
    courseCode,
    moduleKey: null,
    moduleActivityKey: null,
    assignmentKey: null,
    category: "participation",
    componentKey: "participation",
    title: "Attendance and Participation",
    type: "Attendance and participation evidence",
    weightPercent: framework.participationPercent,
    maxScore: 100,
    submissionMode: "none",
    position: items.length + 1,
    evidenceDescription: framework.participationEvidence,
  });
  return items;
}

function normalizeCourse(source, expectedCode) {
  const metadata = source.course ?? {};
  const code = requireString(metadata.code, `${expectedCode} course code`);
  assert.equal(code, expectedCode, `${expectedCode}.json contains course ${code}`);
  const sourceFramework = source.assessment_framework ?? {};
  const framework = {
    courseworkPercent: Number(sourceFramework.coursework_percent),
    writtenExamPercent: Number(sourceFramework.written_exam_percent),
    culminatingTaskPercent: Number(sourceFramework.culminating_task_percent ?? 0),
    participationPercent: Number(sourceFramework.attendance_and_participation_percent),
    finalEvaluationPercent: Number(sourceFramework.final_evaluation_percent),
    gradedCourseworkModules: asArray(sourceFramework.graded_coursework_modules).map(Number),
    participationEvidence: asString(sourceFramework.participation_evidence),
  };
  const finalEvaluationComponents = asArray(source.final_evaluation_components)
    .map((component, index) => normalizeFinalComponent(code, component, index + 1));
  const modules = asArray(source.modules)
    .map((module) => normalizeModule(code, module, finalEvaluationComponents));
  const gradebookItems = buildGradebookItems(code, modules, framework);

  return {
    code,
    title: requireString(metadata.title, `${code} title`),
    department: asString(metadata.department),
    grade: asString(metadata.grade),
    courseType: asString(metadata.course_type),
    credit: asString(metadata.credit),
    hours: Number(metadata.hours),
    prerequisite: asString(metadata.prerequisite),
    description: asString(metadata.description),
    curriculum: {
      title: asString(metadata.curriculum_title),
      url: asString(metadata.curriculum_url),
    },
    implementationNote: asString(source.implementation_note),
    platformSequenceRules: asArray(source.platform_sequence_rules).map(String),
    assessmentFramework: framework,
    finalEvaluationComponents,
    modules,
    gradebookItems,
    recordedCreditHours: Number(source.recorded_credit_hours),
    sourceComponents: source.source_components ?? {},
  };
}

export function buildCatalogFromSources(sourceDirectory) {
  requireString(sourceDirectory, "source directory");
  const courses = COURSE_CODES.map((code) => {
    const sourcePath = path.join(sourceDirectory, `${code}.json`);
    assert.ok(existsSync(sourcePath), `Missing source file: ${sourcePath}`);
    return normalizeCourse(JSON.parse(readFileSync(sourcePath, "utf8")), code);
  });

  const catalog = {
    contract: CONTRACT,
    schemaVersion: SCHEMA_VERSION,
    catalogId: CATALOG_ID,
    courseOrder: [...COURSE_CODES],
    courses,
    totals: {
      courses: courses.length,
      modules: courses.reduce((sum, course) => sum + course.modules.length, 0),
      lessons: courses.reduce((sum, course) => sum + course.modules.reduce((count, module) => count + module.lessons.length, 0), 0),
      resources: courses.reduce((sum, course) => sum + course.modules.reduce((count, module) => count + module.selfStudyResources.length, 0), 0),
      recordedCreditHours: courses.reduce((sum, course) => sum + course.recordedCreditHours, 0),
      gradebookItems: courses.reduce((sum, course) => sum + course.gradebookItems.length, 0),
      weightedAssignments: courses.reduce(
        (sum, course) => sum + course.gradebookItems.filter((item) => item.assignmentKey).length,
        0,
      ),
      weightedAssessmentComponents: courses.reduce(
        (sum, course) => sum + course.modules.reduce((count, module) => count + module.assessment.components.length, 0),
        0,
      ),
    },
  };
  validateCatalog(catalog);
  return catalog;
}

export function validateCatalog(catalog) {
  assert.equal(catalog.contract, CONTRACT);
  assert.equal(catalog.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(catalog.courseOrder, COURSE_CODES);
  assert.equal(catalog.courses.length, 6);

  const allLessonIds = [];
  for (const course of catalog.courses) {
    assert.equal(course.hours, 110, `${course.code} metadata hours must be 110`);
    assert.equal(course.recordedCreditHours, 110, `${course.code} recorded hours must be 110`);
    assert.equal(course.modules.length, 12, `${course.code} must contain 12 modules`);
    assert.deepEqual(course.modules.map((module) => module.number), Array.from({ length: 12 }, (_, index) => index));
    assert.deepEqual(course.modules.map((module) => module.key), Array.from({ length: 12 }, (_, index) => `${course.code}-M${pad2(index)}`));
    assert.equal(course.modules.reduce((sum, module) => sum + module.estimatedCreditHours, 0), 110, `${course.code} module hours must total 110`);
    assert.equal(course.modules.reduce((sum, module) => sum + module.lessons.length, 0), 20, `${course.code} must contain 20 lessons`);
    assert.equal(course.modules.reduce((sum, module) => sum + module.selfStudyResources.length, 0), 33, `${course.code} must contain 33 resources`);
    assert.deepEqual(course.assessmentFramework.gradedCourseworkModules, GRADED_MODULES);
    assert.deepEqual(GRADED_MODULES.map((number) => course.modules[number].assessment.weightPercent), COURSEWORK_WEIGHTS);
    assert.equal(course.assessmentFramework.courseworkPercent, 65);
    assert.equal(course.assessmentFramework.finalEvaluationPercent, 25);
    assert.equal(course.assessmentFramework.participationPercent, 10);
    assert.equal(course.finalEvaluationComponents.reduce((sum, component) => sum + component.weightPercent, 0), 25);
    assert.equal(course.gradebookItems.reduce((sum, item) => sum + item.weightPercent, 0), 100, `${course.code} gradebook must total 100`);
    assert.ok(course.modules.every((module) => module.unlockRule.ruleText === module.unlockRule.ruleText.trim()), `${course.code} unlock rules must be preserved text`);
    assert.ok(course.modules.every((module) => module.unlockRule.teacherOverrideAllowed && module.unlockRule.overrideReasonRequired));
    allLessonIds.push(...course.modules.flatMap((module) => module.lessonIds));

    const expectedFinalWeights = ["ICS4U", "BBB4M"].includes(course.code) ? [10, 15] : [25];
    assert.deepEqual(course.finalEvaluationComponents.map((component) => component.weightPercent), expectedFinalWeights);
    assert.equal(course.gradebookItems.length, expectedFinalWeights.length + 6);
  }

  assert.equal(new Set(allLessonIds).size, 120, "lesson ids must be globally unique");
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
  return catalog;
}

export function renderJavaScript(catalog) {
  const payload = JSON.stringify(catalog, null, 2);
  return `// Deterministic Lotus Academy Grade 12 platform catalog.\n(function loadLfaPlatformCatalog(global) {\n  \"use strict\";\n  const catalog = ${payload};\n  catalog.coursesByCode = Object.fromEntries(catalog.courses.map((course) => [course.code, course]));\n  global.LFA_PLATFORM_CATALOG = catalog;\n  global.LFA_PLATFORM_SEQUENCES = catalog;\n})(window);\n`;
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNumber(value) {
  return value === null || value === undefined ? "NULL" : String(value);
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value))}::jsonb`;
}

function insertStatement(table, columns, rows, conflictClause) {
  assert.ok(rows.length, `${table} seed rows must not be empty`);
  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  return `INSERT INTO ${table} (${columns.join(", ")}) VALUES\n${values}\n${conflictClause};\n`;
}

export function renderSql(catalog, contentHash = sha256(jsonText(catalog))) {
  validateCatalog(catalog);
  const courseCodesSql = COURSE_CODES.map(sqlString).join(", ");
  const courseRows = catalog.courses.map((course) => [sqlString(course.code), sqlString(course.title), "'active'"]);
  const moduleRows = [];
  const lessonRows = [];
  const resourceRows = [];
  const activityRows = [];
  const assignmentRows = [];
  const gradebookRows = [];
  const componentRows = [];

  for (const course of catalog.courses) {
    for (const module of course.modules) {
      const moduleId = lowerId(module.key);
      const activityId = lowerId(module.assessment.key);
      moduleRows.push([
        sqlString(moduleId), sqlString(course.code), sqlNumber(module.number), sqlNumber(module.unitNumber),
        sqlString(module.title), sqlString(module.unitTitle), sqlJson(module.learningFocus), sqlJson(module.readingSteps),
        sqlString(module.guidedPractice), sqlString(module.lowStakesCheck), sqlString(module.unlockRule.ruleText),
        sqlNumber(module.estimatedCreditHours), sqlString(module.workloadLabel), sqlString(module.teacherPresence),
        sqlString(module.evidenceToRetain), "'published'",
      ]);
      for (const lesson of module.lessons) {
        lessonRows.push([sqlString(lesson.id), sqlString(moduleId), sqlNumber(lesson.order), sqlString(lesson.title), "'published'"]);
      }
      for (const resource of module.selfStudyResources) {
        resourceRows.push([
          sqlString(lowerId(resource.key)), sqlString(moduleId), sqlNumber(resource.order), sqlString(resource.title),
          sqlString(resource.provider), "'external_url'", sqlString(resource.url), "NULL", sqlString(resource.assignedUse),
          "'student'", "'published'",
        ]);
      }
      activityRows.push([
        sqlString(activityId), sqlString(moduleId), sqlString(module.assessment.activityType), sqlString(module.assessment.title),
        sqlNumber(module.assessment.weightPercent), sqlJson(module.assessment.sequence), sqlString(module.assessment.evidenceFile),
        sqlString(module.assessment.taskType), sqlJson(module.assessment.processCheckpoints),
        sqlJson(module.assessment.authenticationEvidence), sqlNumber(module.assessment.timeMinutes), "TRUE", "'published'",
      ]);

      for (const component of module.assessment.components) {
        assignmentRows.push([
          sqlString(lowerId(component.assignmentKey)), sqlString(course.code),
          sqlNumber(module.unitNumber ?? module.number), sqlString(component.title), "99", "'active'",
          sqlString(module.assessment.taskType ?? component.title), "'[]'::jsonb",
          sqlNumber(component.weightPercent), sqlString(submissionModeFor(component)), "NULL", "NULL", "NULL", sqlString(moduleId),
        ]);
      }

      for (const component of module.assessment.components) {
        const gradebookItem = course.gradebookItems.find((item) => item.moduleKey === module.key && item.componentKey === component.componentKey);
        assert.ok(gradebookItem, `Missing gradebook item for ${component.key}`);
        componentRows.push([
          sqlString(lowerId(component.key)), sqlString(activityId), sqlString(lowerId(gradebookItem.key)),
          sqlNumber(component.position), sqlString(component.title), sqlString(component.type),
          sqlNumber(component.weightPercent), sqlNumber(component.timeMinutes), sqlJson(component.processCheckpoints),
        ]);
      }
    }

    for (const item of course.gradebookItems) {
      gradebookRows.push([
        sqlString(lowerId(item.key)), sqlString(course.code), sqlString(item.moduleActivityKey ? lowerId(item.moduleActivityKey) : null),
        sqlString(item.assignmentKey ? lowerId(item.assignmentKey) : null), sqlString(item.category), sqlString(item.componentKey),
        sqlString(item.title), sqlNumber(item.weightPercent), sqlNumber(item.maxScore), sqlString(item.submissionMode),
        sqlNumber(item.position), "'published'",
      ]);
    }
  }

  const statements = [
    "-- Deterministic seed for the Lotus Academy Grade 12 six-course catalog.",
    "-- Generated from the lfa.course-import.v1 source contract; do not edit by hand.",
    "",
    insertStatement(
      "courses",
      ["code", "title", "status"],
      courseRows,
      "ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status",
    ),
    insertStatement(
      "course_modules",
      ["id", "course_code", "module_number", "unit_number", "title", "unit_title", "learning_focus", "core_reading_order", "guided_practice", "low_stakes_check", "feedback_and_unlock", "estimated_credit_hours", "workload_label", "teacher_presence", "evidence_to_retain", "status"],
      moduleRows,
      "ON CONFLICT (course_code, module_number) DO UPDATE SET id = EXCLUDED.id, unit_number = EXCLUDED.unit_number, title = EXCLUDED.title, unit_title = EXCLUDED.unit_title, learning_focus = EXCLUDED.learning_focus, core_reading_order = EXCLUDED.core_reading_order, guided_practice = EXCLUDED.guided_practice, low_stakes_check = EXCLUDED.low_stakes_check, feedback_and_unlock = EXCLUDED.feedback_and_unlock, estimated_credit_hours = EXCLUDED.estimated_credit_hours, workload_label = EXCLUDED.workload_label, teacher_presence = EXCLUDED.teacher_presence, evidence_to_retain = EXCLUDED.evidence_to_retain, status = EXCLUDED.status, updated_at = now()",
    ),
    insertStatement(
      "module_lessons",
      ["id", "module_id", "position", "title", "status"],
      lessonRows,
      "ON CONFLICT (id) DO UPDATE SET module_id = EXCLUDED.module_id, position = EXCLUDED.position, title = EXCLUDED.title, status = EXCLUDED.status, updated_at = now()",
    ),
    insertStatement(
      "module_resources",
      ["id", "module_id", "position", "title", "provider", "resource_kind", "external_url", "drive_material_id", "assigned_use", "audience", "status"],
      resourceRows,
      "ON CONFLICT (id) DO UPDATE SET module_id = EXCLUDED.module_id, position = EXCLUDED.position, title = EXCLUDED.title, provider = EXCLUDED.provider, resource_kind = EXCLUDED.resource_kind, external_url = EXCLUDED.external_url, drive_material_id = EXCLUDED.drive_material_id, assigned_use = EXCLUDED.assigned_use, audience = EXCLUDED.audience, status = EXCLUDED.status, updated_at = now()",
    ),
    insertStatement(
      "module_activities",
      ["id", "module_id", "activity_type", "title", "course_grade_weight_percent", "sequence", "evidence_file", "task_type", "process_checkpoints", "authentication_evidence", "time_minutes", "is_required", "status"],
      activityRows,
      "ON CONFLICT (module_id) DO UPDATE SET id = EXCLUDED.id, activity_type = EXCLUDED.activity_type, title = EXCLUDED.title, course_grade_weight_percent = EXCLUDED.course_grade_weight_percent, sequence = EXCLUDED.sequence, evidence_file = EXCLUDED.evidence_file, task_type = EXCLUDED.task_type, process_checkpoints = EXCLUDED.process_checkpoints, authentication_evidence = EXCLUDED.authentication_evidence, time_minutes = EXCLUDED.time_minutes, is_required = EXCLUDED.is_required, status = EXCLUDED.status, updated_at = now()",
    ),
    insertStatement(
      "assignments",
      ["id", "course_code", "unit_number", "title", "max_attempts", "status", "instructions", "rubric", "weight_percent", "submission_mode", "available_from", "due_at", "available_until", "module_id"],
      assignmentRows,
      "ON CONFLICT (id) DO UPDATE SET course_code = EXCLUDED.course_code, unit_number = EXCLUDED.unit_number, title = EXCLUDED.title, max_attempts = EXCLUDED.max_attempts, status = EXCLUDED.status, instructions = EXCLUDED.instructions, rubric = EXCLUDED.rubric, weight_percent = EXCLUDED.weight_percent, submission_mode = EXCLUDED.submission_mode, available_from = EXCLUDED.available_from, due_at = EXCLUDED.due_at, available_until = EXCLUDED.available_until, module_id = EXCLUDED.module_id, updated_at = now()",
    ),
    insertStatement(
      "gradebook_items",
      ["id", "course_code", "module_activity_id", "assignment_id", "category", "component_key", "title", "weight_percent", "max_score", "submission_mode", "position", "status"],
      gradebookRows,
      "ON CONFLICT (course_code, component_key) DO UPDATE SET id = EXCLUDED.id, module_activity_id = EXCLUDED.module_activity_id, assignment_id = EXCLUDED.assignment_id, category = EXCLUDED.category, title = EXCLUDED.title, weight_percent = EXCLUDED.weight_percent, max_score = EXCLUDED.max_score, submission_mode = EXCLUDED.submission_mode, position = EXCLUDED.position, status = EXCLUDED.status, updated_at = now()",
    ),
    insertStatement(
      "assessment_components",
      ["id", "module_activity_id", "gradebook_item_id", "position", "title", "component_type", "weight_percent", "time_minutes", "process_checkpoints"],
      componentRows,
      "ON CONFLICT (gradebook_item_id) DO UPDATE SET id = EXCLUDED.id, module_activity_id = EXCLUDED.module_activity_id, position = EXCLUDED.position, title = EXCLUDED.title, component_type = EXCLUDED.component_type, weight_percent = EXCLUDED.weight_percent, time_minutes = EXCLUDED.time_minutes, process_checkpoints = EXCLUDED.process_checkpoints, updated_at = now()",
    ),
    `DO $$\nBEGIN\n  IF (SELECT count(*) FROM assignments WHERE course_code = ANY(ARRAY[${courseCodesSql}]::text[]) AND module_id IS NOT NULL) <> 38 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 38 assignments';\n  END IF;\nEND $$;\n`,
    `DO $$\nDECLARE\n  scoped_courses text[] := ARRAY[${courseCodesSql}]::text[];\nBEGIN\n  IF (SELECT count(*) FROM course_modules WHERE course_code = ANY(scoped_courses)) <> 72 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 72 modules';\n  END IF;\n  IF (SELECT count(*) FROM module_lessons l JOIN course_modules m ON m.id = l.module_id WHERE m.course_code = ANY(scoped_courses)) <> 120 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 120 lessons';\n  END IF;\n  IF (SELECT count(*) FROM module_resources r JOIN course_modules m ON m.id = r.module_id WHERE m.course_code = ANY(scoped_courses)) <> 198 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 198 resources';\n  END IF;\n  IF (SELECT count(*) FROM module_activities a JOIN course_modules m ON m.id = a.module_id WHERE m.course_code = ANY(scoped_courses)) <> 72 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 72 activities';\n  END IF;\n  IF (SELECT count(*) FROM gradebook_items WHERE course_code = ANY(scoped_courses)) <> 44 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 44 gradebook items';\n  END IF;\n  IF (SELECT count(*) FROM assessment_components c JOIN module_activities a ON a.id = c.module_activity_id JOIN course_modules m ON m.id = a.module_id WHERE m.course_code = ANY(scoped_courses)) <> 38 THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: expected 38 assessment components';\n  END IF;\n  IF EXISTS (\n    SELECT course_code\n    FROM course_modules\n    WHERE course_code = ANY(scoped_courses)\n    GROUP BY course_code\n    HAVING count(*) <> 12 OR sum(estimated_credit_hours) <> 110\n  ) THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: every course must have 12 modules and 110 hours';\n  END IF;\n  IF EXISTS (\n    SELECT course_code\n    FROM gradebook_items\n    WHERE course_code = ANY(scoped_courses)\n    GROUP BY course_code\n    HAVING sum(weight_percent) <> 100\n  ) THEN\n    RAISE EXCEPTION 'Catalog seed assertion failed: every gradebook must total 100 percent';\n  END IF;\nEND $$;\n`,
    `INSERT INTO catalog_imports (version, content_sha256, course_count, module_count, lesson_count, resource_count)\nVALUES (${sqlString(CATALOG_ID)}, ${sqlString(contentHash)}, 6, 72, 120, 198)\nON CONFLICT (version) DO UPDATE SET\n  content_sha256 = EXCLUDED.content_sha256,\n  course_count = EXCLUDED.course_count,\n  module_count = EXCLUDED.module_count,\n  lesson_count = EXCLUDED.lesson_count,\n  resource_count = EXCLUDED.resource_count;\n`,
  ];

  return `${statements.join("\n").trim()}\n`;
}

export function buildArtifacts(sourceDirectory) {
  const catalog = buildCatalogFromSources(sourceDirectory);
  return buildArtifactsFromCatalog(catalog);
}

export function buildArtifactsFromCatalog(catalog) {
  validateCatalog(catalog);
  const catalogJson = jsonText(catalog);
  return {
    catalog,
    json: catalogJson,
    javascript: renderJavaScript(catalog),
    sql: renderSql(catalog, sha256(catalogJson)),
  };
}

function parseArguments(argv) {
  const options = {
    sourceDirectory: process.env.LFA_PLATFORM_SEQUENCE_SOURCE_DIR || defaultSourceDirectory,
    sourceWasExplicit: Boolean(process.env.LFA_PLATFORM_SEQUENCE_SOURCE_DIR),
    jsonOutput: defaultJsonOutput,
    javascriptOutput: defaultJavaScriptOutput,
    sqlOutput: defaultSqlOutput,
    check: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check") options.check = true;
    else if (argument === "--source-dir") {
      options.sourceDirectory = path.resolve(argv[++index]);
      options.sourceWasExplicit = true;
    }
    else if (argument === "--json-output") options.jsonOutput = path.resolve(argv[++index]);
    else if (argument === "--js-output") options.javascriptOutput = path.resolve(argv[++index]);
    else if (argument === "--sql-output") options.sqlOutput = path.resolve(argv[++index]);
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function usage() {
  return [
    "Usage: node scripts/generate-platform-catalog.mjs --source-dir <directory> [--check]",
    "",
    "Inputs are the six CODE.json lfa.course-import.v1 source documents.",
    "Without --source-dir, the checked-in canonical catalog is used when source files are absent.",
    "Outputs:",
    "  backend/catalog/lfa-course-catalog.json",
    "  public/learning/platform-sequences.js",
    "  backend/migrations/004_lotus_grade12_catalog_v1.sql",
  ].join("\n");
}

function writeOrCheck(outputPath, content, check) {
  if (check) {
    assert.ok(existsSync(outputPath), `Generated artifact is missing: ${outputPath}`);
    assert.equal(readFileSync(outputPath, "utf8"), content, `Generated artifact is stale: ${outputPath}`);
    return;
  }
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, "utf8");
}

export function run(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const hasAllSourceFiles = COURSE_CODES.every((code) => existsSync(path.join(options.sourceDirectory, `${code}.json`)));
  if (options.sourceWasExplicit && !hasAllSourceFiles) {
    throw new Error(`Source directory does not contain all six course files: ${options.sourceDirectory}`);
  }
  const artifacts = hasAllSourceFiles
    ? buildArtifacts(options.sourceDirectory)
    : buildArtifactsFromCatalog(JSON.parse(readFileSync(options.jsonOutput, "utf8")));
  writeOrCheck(options.jsonOutput, artifacts.json, options.check);
  writeOrCheck(options.javascriptOutput, artifacts.javascript, options.check);
  writeOrCheck(options.sqlOutput, artifacts.sql, options.check);
  process.stdout.write(
    `${options.check ? "Verified" : "Generated"} ${artifacts.catalog.totals.courses} courses, `
      + `${artifacts.catalog.totals.modules} modules, ${artifacts.catalog.totals.lessons} lessons, `
      + `${artifacts.catalog.totals.resources} resources, and ${artifacts.catalog.totals.recordedCreditHours} hours.\n`,
  );
}

if (path.resolve(process.argv[1] || "") === path.resolve(scriptPath)) {
  try {
    run();
  } catch (error) {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  }
}
