-- Durable teacher/student discussion and in-app notification primitives.
-- This migration is expand-only so the previous API revision can continue to
-- serve while the interaction-aware revision is validated.

ALTER TABLE student_submissions
  ADD COLUMN replaces_submission_id uuid
    REFERENCES student_submissions(id) ON DELETE RESTRICT;

CREATE UNIQUE INDEX student_submissions_one_replacement_idx
  ON student_submissions (replaces_submission_id)
  WHERE replaces_submission_id IS NOT NULL;

ALTER TABLE student_submissions
  ADD CONSTRAINT student_submissions_replacement_attempt_valid CHECK (
    replaces_submission_id IS NULL OR attempt_number > 1
  );

CREATE TABLE submission_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL
      REFERENCES student_submissions(id) ON DELETE RESTRICT,
    author_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    author_role text NOT NULL,
    message_type text NOT NULL DEFAULT 'comment',
    body text NOT NULL,
    idempotency_key text NOT NULL,
    request_fingerprint char(64) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT submission_messages_author_role_valid CHECK (
      author_role IN ('student', 'teacher', 'teacher_admin')
    ),
    CONSTRAINT submission_messages_type_valid CHECK (
      message_type IN ('comment', 'revision_request')
    ),
    CONSTRAINT submission_messages_body_valid CHECK (
      btrim(body) <> '' AND char_length(body) <= 10000
    ),
    CONSTRAINT submission_messages_fingerprint_valid CHECK (
      request_fingerprint ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT submission_messages_actor_idempotency_unique UNIQUE (
      author_user_id, idempotency_key
    )
);

CREATE INDEX submission_messages_thread_idx
  ON submission_messages (submission_id, created_at, id);

CREATE UNIQUE INDEX submission_messages_one_revision_request_idx
  ON submission_messages (submission_id)
  WHERE message_type = 'revision_request';

CREATE TABLE user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    notification_type text NOT NULL,
    course_code text REFERENCES courses(code) ON DELETE RESTRICT,
    submission_id uuid REFERENCES student_submissions(id) ON DELETE RESTRICT,
    title text NOT NULL,
    body text NOT NULL DEFAULT '',
    href text NOT NULL,
    dedupe_key text NOT NULL,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT user_notifications_type_valid CHECK (
      notification_type IN (
        'submission_received',
        'submission_resubmitted',
        'submission_message',
        'submission_returned',
        'grade_published'
      )
    ),
    CONSTRAINT user_notifications_title_valid CHECK (
      btrim(title) <> '' AND char_length(title) <= 300
    ),
    CONSTRAINT user_notifications_body_valid CHECK (char_length(body) <= 1000),
    CONSTRAINT user_notifications_href_valid CHECK (
      href ~ '^#/[A-Za-z0-9/?=&._%-]+$'
    ),
    CONSTRAINT user_notifications_dedupe_key_valid CHECK (
      btrim(dedupe_key) <> '' AND char_length(dedupe_key) <= 300
    ),
    CONSTRAINT user_notifications_recipient_dedupe_unique UNIQUE (
      recipient_user_id, dedupe_key
    )
);

CREATE INDEX user_notifications_recipient_recent_idx
  ON user_notifications (recipient_user_id, created_at DESC, id DESC);

CREATE INDEX user_notifications_recipient_unread_idx
  ON user_notifications (recipient_user_id, created_at DESC, id DESC)
  WHERE read_at IS NULL;

COMMENT ON COLUMN student_submissions.replaces_submission_id IS
  'Optional immutable link to the immediately preceding attempt. Legacy attempts remain valid with NULL.';

COMMENT ON TABLE submission_messages IS
  'Immutable submission discussion. revision_request is created only by the dedicated faculty return endpoint.';

COMMENT ON TABLE user_notifications IS
  'Per-recipient in-app delivery ledger. dedupe_key makes transactional event delivery retry-safe.';

GRANT SELECT, INSERT ON TABLE submission_messages TO lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE user_notifications TO lfa_app_runtime;
GRANT UPDATE (read_at) ON TABLE user_notifications TO lfa_app_runtime;
