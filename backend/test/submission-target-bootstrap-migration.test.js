import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../migrations/010_submission_target_system_bootstrap.sql",
  import.meta.url,
);

test("submission target bootstrap migration is actorless, expand-only, and least-privileged", async () => {
  const migration = await readFile(migrationUrl, "utf8");

  assert.match(migration, /ADD COLUMN configuration_origin text NOT NULL DEFAULT 'admin_api'/i);
  assert.match(migration, /ALTER COLUMN created_by DROP NOT NULL/i);
  assert.match(
    migration,
    /configuration_origin = 'system_config' AND created_by IS NULL/i,
  );
  assert.match(
    migration,
    /GRANT SELECT, INSERT ON TABLE drive_submission_targets TO lfa_app_runtime/i,
  );
  assert.match(
    migration,
    /REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER\s+ON TABLE drive_submission_targets FROM lfa_app_runtime/i,
  );
  assert.doesNotMatch(migration, /GRANT\s+[^;\n]*\bUPDATE\b/i);
  assert.doesNotMatch(migration, /GRANT\s+[^;\n]*\bDELETE\b/i);
  assert.doesNotMatch(migration, /INSERT INTO drive_submission_targets/i);
});
