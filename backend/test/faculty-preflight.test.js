import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  checkFacultyPreflight,
  facultyPreflightDatabaseConfig,
  parseFacultyPreflightArguments,
} from "../src/services/faculty-preflight.js";

const allCourses = ["BBB4M", "ICS4U", "MCV4U", "MHF4U", "SCH4U", "SPH4U"];
const email = "faculty@lakeforestacademy.ca";
const sensitive = "NEVER-PRINT-DATABASE-PASSWORD-OR-GOOGLE-SUBJECT";

function harness({ user = {}, assigned = allCourses, inactive = [], absent = [], failOn } = {}) {
  const queries = [];
  const releases = [];
  const account = user === null ? null : {
    public_id: "teacher_test",
    email,
    display_name: "Test Faculty",
    role: "teacher",
    status: "active",
    workspace_identity_bound: false,
    // These are intentionally not among the report's explicit public fields.
    password_hash: sensitive,
    subject: sensitive,
    ...user,
  };
  const client = {
    async query(query) {
      queries.push(query);
      if (failOn && query.text.includes(failOn)) throw new Error(sensitive);
      if (query.text.includes("SELECT u.public_id")) return { rows: account ? [account] : [] };
      if (query.text.includes("SELECT c.code")) return { rows: allCourses.filter((code) => !absent.includes(code)).map((code) => ({
        code,
        status: inactive.includes(code) ? "archived" : "active",
        assigned: assigned.includes(code),
      })) };
      return { rows: [] };
    },
    release(destroy) { releases.push(destroy); },
  };
  return { pool: { connect: async () => client }, queries, releases };
}

test("faculty preflight requires explicit courses and normalizes email and course codes", () => {
  assert.deepEqual(parseFacultyPreflightArguments([
    "--", "--email", "  Faculty@LakeForestAcademy.ca  ", "--courses", "sch4u, ics4u,SCH4U",
  ]), { email, courses: ["ICS4U", "SCH4U"] });
  for (const argv of [
    ["--email", email],
    ["--email", email, "--courses", ""],
    ["--email", email, "--courses", "SCH4U,"],
    ["--email", email, "--courses", "UNAPPROVED"],
    ["--email", "invalid", "--courses", "SCH4U"],
    ["--email", email, "--courses", "SCH4U", "--role", "teacher_admin"],
    ["--email", email, "--email", email, "--courses", "SCH4U"],
  ]) assert.throws(() => parseFacultyPreflightArguments(argv), { code: "INVALID_ARGUMENTS" });
});

test("faculty preflight loads only database configuration and sanitizes invalid connection values", () => {
  const databaseUrl = "postgresql://runtime:private@localhost/lfa";
  assert.deepEqual(facultyPreflightDatabaseConfig({ DATABASE_URL: databaseUrl }), {
    databaseUrl, databaseSocket: "", databaseSsl: false, databasePoolMax: 1,
  });
  assert.equal(facultyPreflightDatabaseConfig({ DATABASE_URL: databaseUrl, NODE_ENV: "production" }).databaseSsl, true);
  assert.equal(facultyPreflightDatabaseConfig({ DATABASE_URL: databaseUrl, DATABASE_SSL: "false", NODE_ENV: "production" }).databaseSsl, false);
  assert.equal(facultyPreflightDatabaseConfig({ DATABASE_URL: databaseUrl, INSTANCE_UNIX_SOCKET: "/cloudsql/test" }).databaseSocket, "/cloudsql/test");
  for (const env of [{}, { DATABASE_URL: sensitive }, { DATABASE_URL: databaseUrl, DATABASE_SSL: sensitive }]) {
    assert.throws(() => facultyPreflightDatabaseConfig(env), (error) =>
      error.code === "DATABASE_CONFIGURATION_REQUIRED" && !error.message.includes(sensitive));
  }
});

test("teacher preflight reads all six grants without binding an identity or exposing private fields", async () => {
  const { pool, queries, releases } = harness();
  const report = await checkFacultyPreflight(pool, { email, courses: allCourses });
  assert.equal(report.appAccountEligible, true);
  assert.equal(report.appPreflightReady, true);
  assert.equal(report.workspaceIdentityBinding, "absent");
  assert.equal(report.googleSignInVerified, false);
  assert.equal(report.courseAccess.mode, "assigned_courses");
  assert.deepEqual(report.courseAccess.effectiveCourseCodes, allCourses);
  assert.deepEqual(report.courseAccess.missingCourseCodes, []);
  assert.doesNotMatch(JSON.stringify(report), new RegExp(sensitive));
  assert.deepEqual(Object.keys(report.account).sort(), ["displayName", "email", "publicId", "role", "status"]);
  assert.equal(queries[0].text, "BEGIN READ ONLY");
  assert.equal(queries[1].text, "SET LOCAL statement_timeout = '5000ms'");
  assert.equal(queries[2].text, "SET LOCAL lock_timeout = '1000ms'");
  assert.equal(queries.at(-1).text, "ROLLBACK");
  for (const query of queries) {
    assert.equal(query.query_timeout, 6_000);
    assert.match(query.text.trim(), /^(BEGIN READ ONLY|SET LOCAL|SELECT|ROLLBACK)/);
    assert.doesNotMatch(query.text, /\b(INSERT|UPDATE|DELETE|COMMIT)\b|SELECT\s+\*|password_hash|\bsubject\b/i);
    assert.ok(!query.text.includes(email));
    if (query.text.trim().startsWith("SELECT")) assert.deepEqual(query.values, [email]);
  }
  assert.deepEqual(releases, [false]);
});

test("teacher account eligibility is independent of missing course grants", async () => {
  const { pool } = harness({ assigned: ["SCH4U"] });
  const report = await checkFacultyPreflight(pool, { email, courses: ["SCH4U", "ICS4U"] });
  assert.equal(report.appAccountEligible, true);
  assert.equal(report.appPreflightReady, false);
  assert.deepEqual(report.courseAccess.missingCourseCodes, ["ICS4U"]);
});

test("missing catalog entries and an empty teacher grant set fail requested scope", async () => {
  for (const options of [{ absent: ["ICS4U"] }, { assigned: [] }]) {
    const { pool } = harness(options);
    const report = await checkFacultyPreflight(pool, { email, courses: ["ICS4U"] });
    assert.equal(report.appAccountEligible, true);
    assert.equal(report.appPreflightReady, false);
    assert.deepEqual(report.courseAccess.missingCourseCodes, ["ICS4U"]);
    assert.deepEqual(report.courseAccess.unavailableCourseCodes, options.absent || []);
  }
});

test("teacher admin gets all active courses without teacher assignment rows", async () => {
  const { pool } = harness({ user: { role: "teacher_admin" }, assigned: [] });
  const report = await checkFacultyPreflight(pool, { email, courses: ["ICS4U"] });
  assert.equal(report.appPreflightReady, true);
  assert.equal(report.courseAccess.mode, "administrator_all_active_courses");
  assert.deepEqual(report.courseAccess.assignedCourseCodes, []);
  assert.deepEqual(report.courseAccess.effectiveCourseCodes, allCourses);
  assert.equal(report.courseAccess.additionalCourseCodes.length, 5);
});

test("missing, disabled and student accounts cannot pass faculty preflight", async () => {
  for (const user of [null, { status: "disabled" }, { role: "student" }]) {
    const { pool } = harness({ user });
    const report = await checkFacultyPreflight(pool, { email, courses: ["ICS4U"] });
    assert.equal(report.appAccountEligible, false);
    assert.equal(report.courseAccess.ready, false);
    assert.equal(report.appPreflightReady, false);
    if (user === null) {
      assert.equal(report.account, null);
      assert.equal(report.workspaceIdentityBinding, "account_missing");
    }
  }
});

test("archived courses block requested course readiness for both faculty roles", async () => {
  for (const role of ["teacher", "teacher_admin"]) {
    const { pool } = harness({ user: { role }, inactive: ["ICS4U"] });
    const report = await checkFacultyPreflight(pool, { email, courses: ["ICS4U"] });
    assert.equal(report.appAccountEligible, true);
    assert.equal(report.appPreflightReady, false);
    assert.deepEqual(report.courseAccess.unavailableCourseCodes, ["ICS4U"]);
    // Reflect existing authorization semantics without rewriting permissions.
    assert.equal(report.courseAccess.effectiveCourseCodes.includes("ICS4U"), role === "teacher");
  }
});

test("existing binding is reported but never treated as verified Google sign-in", async () => {
  const { pool } = harness({ user: { workspace_identity_bound: true } });
  const report = await checkFacultyPreflight(pool, { email, courses: ["ICS4U"] });
  assert.equal(report.workspaceIdentityBinding, "present");
  assert.equal(report.googleSignInVerified, false);
  assert.doesNotMatch(JSON.stringify(report), new RegExp(sensitive));
});

test("query failures roll back and return only a sanitized failure", async () => {
  const { pool, queries, releases } = harness({ failOn: "SELECT c.code" });
  await assert.rejects(checkFacultyPreflight(pool, { email, courses: ["ICS4U"] }), (error) =>
    error.code === "PREFLIGHT_UNAVAILABLE" && !error.message.includes(sensitive));
  assert.equal(queries.at(-1).text, "ROLLBACK");
  assert.equal(releases.length, 1);
});

test("connection and rollback failures cannot expose credentials or retain a bad connection", async () => {
  await assert.rejects(checkFacultyPreflight({ connect: async () => { throw new Error(sensitive); } }, {
    email, courses: ["ICS4U"],
  }), (error) => error.code === "PREFLIGHT_UNAVAILABLE" && !error.message.includes(sensitive));
  const { pool, releases } = harness({ failOn: "ROLLBACK" });
  await assert.rejects(checkFacultyPreflight(pool, { email, courses: ["ICS4U"] }), { code: "PREFLIGHT_UNAVAILABLE" });
  assert.deepEqual(releases, [true]);
});

test("invalid direct input is rejected before any database access", async () => {
  let connected = false;
  await assert.rejects(checkFacultyPreflight({ connect: async () => { connected = true; } }, {
    email, courses: [],
  }), { code: "INVALID_ARGUMENTS" });
  assert.equal(connected, false);
});

test("CLI help needs no database and missing explicit courses fails without leaking environment", () => {
  const script = fileURLToPath(new URL("../scripts/check-faculty.js", import.meta.url));
  const env = { ...process.env, DATABASE_URL: sensitive, LFA_USER_PASSWORD: sensitive };
  const help = spawnSync(process.execPath, [script, "--help"], { env, encoding: "utf8", timeout: 10_000 });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /read-only|Read-only/);
  const forwardedHelp = spawnSync(process.execPath, [script, "--", "--help"], { env, encoding: "utf8", timeout: 10_000 });
  assert.equal(forwardedHelp.status, 0, forwardedHelp.stderr);
  const invalid = spawnSync(process.execPath, [script, "--email", email], { env, encoding: "utf8", timeout: 10_000 });
  assert.equal(invalid.status, 2);
  assert.equal(JSON.parse(invalid.stderr).error.code, "INVALID_ARGUMENTS");
  assert.doesNotMatch(help.stdout + help.stderr + invalid.stdout + invalid.stderr, new RegExp(sensitive));
});
