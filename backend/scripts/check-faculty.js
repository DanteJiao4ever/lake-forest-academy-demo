import process from "node:process";
import { createPool } from "../src/db/postgres.js";
import {
  FacultyPreflightError,
  checkFacultyPreflight,
  facultyPreflightDatabaseConfig,
  parseFacultyPreflightArguments,
} from "../src/services/faculty-preflight.js";

let pool;
try {
  const args = process.argv.slice(process.argv[2] === "--" ? 3 : 2);
  if (args.length === 1 && args[0] === "--help") {
    process.stdout.write("Usage: node scripts/check-faculty.js --email faculty@example.org --courses SCH4U,ICS4U\nRead-only application check; --courses is required. This does not verify Google sign-in.\n");
  } else {
    const input = parseFacultyPreflightArguments(args);
    try {
      process.loadEnvFile?.();
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    pool = createPool(facultyPreflightDatabaseConfig());
    const report = await checkFacultyPreflight(pool, input);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exitCode = report.appPreflightReady ? 0 : 1;
  }
} catch (error) {
  const safe = error instanceof FacultyPreflightError ? error : {
    code: "PREFLIGHT_UNAVAILABLE",
    message: "The read-only faculty check could not complete. Verify protected database configuration without printing credentials.",
  };
  process.stderr.write(`${JSON.stringify({ error: { code: safe.code, message: safe.message } })}\n`);
  process.exitCode = 2;
} finally {
  if (pool) {
    try {
      await pool.end();
    } catch {
      process.stderr.write('{"error":{"code":"PREFLIGHT_UNAVAILABLE","message":"The database connection could not close cleanly."}}\n');
      process.exitCode = 2;
    }
  }
}
