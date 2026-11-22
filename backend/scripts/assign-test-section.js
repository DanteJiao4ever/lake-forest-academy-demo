// Run with the school's provisioning database role. IDs are confirmed public user
// IDs and publication UUIDs. Runtime enrolment APIs cannot change these grants.
import { createPool } from "../src/db/postgres.js";
import { loadConfig } from "../src/config.js";

const [courseCode, userIdsText, noticeIdsText = ""] = process.argv.slice(2);
const userIds = [...new Set((userIdsText || "").split(",").filter(Boolean))];
const noticeIds = [...new Set(noticeIdsText.split(",").filter(Boolean))];
if (!courseCode || !userIds.length || process.argv.length > 5) {
  throw new Error("Usage: node scripts/assign-test-section.js COURSE PUBLIC_USER_IDS [PUBLICATION_IDS]");
}
const pool = createPool(loadConfig());
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const members = await client.query(
    `SELECT u.id, u.role FROM app_users u
      WHERE u.public_id = ANY($2::text[]) AND u.status = 'active' AND (
        (u.role = 'student' AND EXISTS (
          SELECT 1 FROM course_enrollments e WHERE e.student_user_id = u.id
            AND e.course_code = $1 AND e.status = 'active'))
        OR (u.role = 'teacher' AND EXISTS (
          SELECT 1 FROM teacher_course_access t WHERE t.teacher_user_id = u.id AND t.course_code = $1))
      ) FOR SHARE OF u`, [courseCode, userIds]);
  if (members.rowCount !== userIds.length) throw new Error("An account or course assignment did not match.");
  const ids = members.rows.map((member) => member.id);
  await client.query(`INSERT INTO course_test_members (course_code, user_id)
     SELECT $1, unnest($2::uuid[]) ON CONFLICT DO NOTHING`, [courseCode, ids]);
  const notices = await client.query(
    `UPDATE course_announcement_targets target SET test_section = true
       FROM course_announcements notice
      WHERE target.course_code = $1 AND target.announcement_id = notice.id
        AND notice.id = ANY($2::uuid[]) AND notice.author_user_id = ANY($3::uuid[])`,
    [courseCode, noticeIds, ids]);
  if (notices.rowCount !== noticeIds.length) throw new Error("A publication did not match its course and author.");
  await client.query("COMMIT");
  console.log(`Assigned ${members.rowCount} accounts and ${notices.rowCount} existing publications to the ${courseCode} test section.`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
