import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../migrations/008_learning_interactions_v1.sql", import.meta.url),
  "utf8",
);

test("interaction migration is expand-only and preserves legacy submission status", () => {
  assert.match(
    migration,
    /ALTER TABLE student_submissions\s+ADD COLUMN replaces_submission_id uuid/i,
  );
  assert.match(migration, /CREATE TABLE submission_messages/i);
  assert.match(migration, /CREATE TABLE user_notifications/i);
  assert.doesNotMatch(
    migration,
    /ALTER\s+(?:COLUMN\s+)?status|DROP\s+(?:COLUMN|TABLE)|DELETE\s+FROM|TRUNCATE/i,
  );
  assert.match(
    migration,
    /message_type IN \('comment', 'revision_request'\)/i,
  );
  assert.match(
    migration,
    /CREATE UNIQUE INDEX submission_messages_one_revision_request_idx[\s\S]*WHERE message_type = 'revision_request'/i,
  );
});
test("interaction runtime grants are append-only except notification read state", () => {
  assert.match(
    migration,
    /GRANT SELECT, INSERT ON TABLE submission_messages TO lfa_app_runtime;/i,
  );
  assert.match(
    migration,
    /GRANT SELECT, INSERT ON TABLE user_notifications TO lfa_app_runtime;/i,
  );
  assert.match(
    migration,
    /GRANT UPDATE \(read_at\) ON TABLE user_notifications TO lfa_app_runtime;/i,
  );
  assert.doesNotMatch(
    migration,
    /GRANT[^;]*(?:DELETE|TRUNCATE)[^;]*TO lfa_app_runtime/i,
  );
  assert.doesNotMatch(
    migration,
    /GRANT[^;]*UPDATE[^;]*submission_messages[^;]*TO lfa_app_runtime/i,
  );
  assert.doesNotMatch(
    migration,
    /GRANT UPDATE ON TABLE user_notifications TO lfa_app_runtime/i,
  );
});
