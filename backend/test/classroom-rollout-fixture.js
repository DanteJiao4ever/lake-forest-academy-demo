import pg from "pg";

// Suites sharing a disposable database exercise both sections. Keep their
// rollout changes serialized and restore the original state after each suite.
export async function classroomFixture(t, ownerUrl, courseCode, enabled = true) {
  const db = new pg.Client({ connectionString: ownerUrl });
  await db.connect();
  await db.query("SELECT pg_advisory_lock(hashtextextended($1,0))", ["classroom fixture " + courseCode]);
  const { rows: original } = await db.query(
    "SELECT test_section, enabled FROM classroom_section_rollouts WHERE course_code=$1", [courseCode],
  );
  t.after(async () => {
    try {
      await db.query("BEGIN");
      await db.query("DELETE FROM classroom_section_rollouts WHERE course_code=$1", [courseCode]);
      for (const row of original) {
        await db.query("INSERT INTO classroom_section_rollouts VALUES ($1,$2,$3)", [courseCode,row.test_section,row.enabled]);
      }
      await db.query("COMMIT");
    } finally {
      await db.end();
    }
  });
  await db.query(`INSERT INTO classroom_section_rollouts(course_code,test_section,enabled)
    VALUES ($1,true,$2), ($1,false,$2)
    ON CONFLICT(course_code,test_section) DO UPDATE SET enabled=excluded.enabled`, [courseCode,enabled]);
  return db;
}
