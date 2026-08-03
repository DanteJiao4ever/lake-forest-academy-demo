import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../migrations/009_submission_file_runtime_grants.sql", import.meta.url),
  "utf8",
);

test("submission file runtime grant repair stays least-privilege and append-only", () => {
  assert.match(
    migration,
    /GRANT SELECT ON TABLE drive_submission_targets TO lfa_app_runtime;/i,
  );
  assert.match(
    migration,
    /GRANT SELECT, INSERT ON TABLE submission_files TO lfa_app_runtime;/i,
  );
  assert.doesNotMatch(
    migration,
    /GRANT[^;]*(?:UPDATE|DELETE|TRUNCATE|REFERENCES|TRIGGER)[^;]*TO lfa_app_runtime/i,
  );
  assert.doesNotMatch(
    migration,
    /(?:ALTER|CREATE|DROP)\s+(?:TABLE|ROLE)|DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+\S+\s+SET|TRUNCATE(?:\s+TABLE)?/i,
  );
});
