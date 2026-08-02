import assert from "node:assert/strict";
import test from "node:test";
import { PostgresRepository } from "../src/db/postgres.js";

const faculty = {
  publicId: "teacher_test",
  email: "teacher.test@lakeforestacademy.ca",
  passwordHash: "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWX12345",
  firstName: "Test",
  lastName: "Teacher",
  displayName: "Test Teacher",
  role: "teacher",
};

function repositoryHarness({ failCourse } = {}) {
  const queries = [];
  const client = {
    async query(text, values = []) {
      queries.push({ text, values });
      if (text.includes("INSERT INTO app_users")) {
        return {
          rows: [
            {
              id: "internal-teacher-id",
              public_id: faculty.publicId,
              email: faculty.email,
              password_hash: faculty.passwordHash,
              first_name: faculty.firstName,
              last_name: faculty.lastName,
              display_name: faculty.displayName,
              role: faculty.role,
              status: "active",
            },
          ],
        };
      }
      if (
        text.includes("INSERT INTO teacher_course_access") &&
        values[1] === failCourse
      ) {
        const error = new Error("course access failed");
        error.code = "23503";
        throw error;
      }
      return { rows: [], rowCount: 1 };
    },
    release() {},
  };
  return {
    queries,
    repository: new PostgresRepository({
      connect: async () => client,
      end: async () => {},
    }),
  };
}

test("creates faculty and course access in one transaction", async () => {
  const { queries, repository } = repositoryHarness();
  const created = await repository.createFacultyWithCourses(faculty, [
    "SCH4U",
    "MHF4U",
  ]);

  assert.equal(created.email, faculty.email);
  assert.deepEqual(
    queries.map(({ text }) => text.trim().split(/\s+/).slice(0, 2).join(" ")),
    ["BEGIN", "INSERT INTO", "INSERT INTO", "INSERT INTO", "COMMIT"],
  );
});

test("rolls back the faculty user when course access fails", async () => {
  const { queries, repository } = repositoryHarness({ failCourse: "MHF4U" });

  await assert.rejects(
    repository.createFacultyWithCourses(faculty, ["SCH4U", "MHF4U"]),
    /referenced record does not exist/i,
  );
  assert.equal(queries.at(-1).text, "ROLLBACK");
  assert.ok(!queries.some(({ text }) => text === "COMMIT"));
});
