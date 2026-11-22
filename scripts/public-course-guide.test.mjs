import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assessmentForCourse, courseGroups, filterCourses, policyYear } from "../src/data/course-guide.ts";

const catalog = JSON.parse(await readFile(new URL("../backend/catalog/lfa-course-catalog.json", import.meta.url), "utf8"));
const courses = (filters = {}) => filterCourses({
  query: "", subject: "", grade: "", courseType: "", ...filters,
}).flatMap((group) => group.courses.map((course) => course.code));

test("course filters preserve the published guide, mixed-level literacy and placement-based ESL", () => {
  assert.equal(courses().length, 42);
  assert.equal(new Set(courses()).size, 42);
  for (const grade of ["11", "12"]) assert.ok(courses({ grade }).includes("OLC4O"));
  assert.deepEqual(courses({ grade: "ESL", courseType: "O", subject: "english-support" }), ["ESLAO", "ESLBO", "ESLCO", "ESLDO", "ESLEO"]);
  assert.deepEqual(courses({ grade: "9", courseType: "W", subject: "science", query: "sNc" }), ["SNC1W"]);
  assert.deepEqual(courses({ grade: "10", courseType: "D", subject: "science" }), ["SNC2D"]);
  assert.deepEqual(courses({ grade: "12", courseType: "W" }), []);
});

function policy(code) {
  for (const group of courseGroups) {
    const course = group.courses.find((row) => row.code === code);
    if (course) return assessmentForCourse(course, group.slug);
  }
  assert.fail(`Missing ${code} in public course guide`);
}

test("all six public course summaries use the active catalogue assessment components", () => {
  assert.equal(policyYear, "2026–27");
  assert.equal(catalog.courses.length, 6);
  for (const course of catalog.courses) {
    const { courseworkPercent, finalEvaluationPercent, participationPercent, writtenExamPercent, culminatingTaskPercent } = course.assessmentFramework;
    const summary = policy(course.code);
    assert.equal(summary.weights, `Classroom work ${courseworkPercent}% · Final evaluation ${finalEvaluationPercent}% · Attendance and participation ${participationPercent}%`, course.code);
    if (course.code === "ICS4U") {
      assert.equal(summary.final, "Written exam 10% · Culminating task 15%.");
      assert.deepEqual([writtenExamPercent,culminatingTaskPercent],[15,10]);
      continue;
    }
    const task = culminatingTaskPercent ? ` · Culminating task ${culminatingTaskPercent}%` : "";
    assert.equal(summary.final, `Written exam ${writtenExamPercent}%${task}.`, course.code);
  }
});

test("course-specific provincial rules account for EQAO, junior Open and senior Open", () => {
  assert.match(policy("MTH1W").final, /EQAO/);
  assert.equal(policy("CHV2O").final, "Written exam 20%.");
  assert.equal(policy("TAS2O").final, "Written exam 10% · Culminating task 10%.");
  assert.match(policy("OLC4O").weights, /Final evaluation 25%/);
  assert.match(policy("OLC4O").final, /written final exam is optional/i);
  assert.match(policy("ESLEO").weights, /placement levels/);
});
