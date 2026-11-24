// Registrar operation. Run with the migration identity, outside the public API.
import { loadConfig } from "../src/config.js";
import { createPool } from "../src/db/postgres.js";

const [action, publicId, ...extra] = process.argv.slice(2);
if (!["grant", "revoke"].includes(action) || !publicId || extra.length) {
  throw new Error("Usage: node scripts/verify-formal-student.js grant|revoke STUDENT_PUBLIC_ID");
}
const pool = createPool(loadConfig());
const db = await pool.connect();
try {
  await db.query("BEGIN");
  const { rows: [student] } = await db.query(
    "SELECT id FROM app_users WHERE public_id=$1 AND role='student' AND status='active'", [publicId],
  );
  if (!student) throw new Error("No active student matches this exact public ID.");
  await db.query("SELECT pg_advisory_xact_lock(hashtextextended('enrollment:' || $1::text, 0))", [student.id]);
  if (action === "grant") {
    await db.query("INSERT INTO formal_student_roster(student_user_id) VALUES($1) ON CONFLICT DO NOTHING", [student.id]);
  } else {
    await db.query("DELETE FROM formal_student_roster WHERE student_user_id=$1", [student.id]);
  }
  await db.query("COMMIT");
  process.stdout.write(`Formal course-selection eligibility: ${action === "grant" ? "verified" : "removed"}.\n`);
} catch (error) {
  await db.query("ROLLBACK");
  throw error;
} finally {
  db.release();
  await pool.end();
}
