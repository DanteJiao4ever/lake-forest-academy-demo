import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createPool, PostgresRepository } from "../src/db/postgres.js";

const runtimeDatabaseUrl = process.env.RUNTIME_DATABASE_URL || "";

test(
  "least-privileged runtime can start Orientation without catalog write access",
  { skip: !runtimeDatabaseUrl },
  async () => {
    const pool = createPool({
      databaseUrl: runtimeDatabaseUrl,
      databaseSocket: "",
      databaseSsl: false,
      databasePoolMax: 2,
    });
    const repository = new PostgresRepository(pool);
    const suffix = randomUUID();

    try {
      const privilege = await pool.query(
        "SELECT has_table_privilege(current_user, 'course_modules', 'UPDATE') AS can_update_catalog",
      );
      assert.equal(privilege.rows[0].can_update_catalog, false);

      const user = await repository.createUser({
        publicId: `ci-progress-${suffix}`,
        email: `ci-progress-${suffix}@example.invalid`,
        passwordHash: "ci-only-non-plaintext-password-hash",
        firstName: "CI",
        lastName: "Student",
        displayName: "CI Student",
        role: "student",
      });
      await pool.query(
        "INSERT INTO course_enrollments (student_user_id, course_code) VALUES ($1, 'ICS4U')",
        [user.id],
      );

      const progress = await repository.upsertStudentModuleProgress(
        user.id,
        "ics4u-m00",
        "in_progress",
      );
      assert.equal(progress.moduleId, "ics4u-m00");
      assert.equal(progress.status, "in_progress");
    } finally {
      await repository.close();
    }
  },
);
