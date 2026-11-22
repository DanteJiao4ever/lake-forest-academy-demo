-- Private provisioning pairs a compiled lesson with a course. The independent
-- demonstration has a carrier for authentication and no credit-bearing module.
CREATE TABLE interactive_lesson_bindings (
  course_code text NOT NULL REFERENCES courses(code),
  lesson_id text NOT NULL,
  native_lesson_id text UNIQUE REFERENCES module_lessons(id),
  closes_at timestamptz,
  PRIMARY KEY (course_code, lesson_id),
  CHECK (lesson_id <> 'cia4u-demand-2-3' OR (course_code = 'MCV4U' AND native_lesson_id IS NULL)),
  CHECK (lesson_id = 'cia4u-demand-2-3' OR native_lesson_id IS NOT NULL)
);
INSERT INTO interactive_lesson_bindings (course_code, lesson_id) VALUES ('MCV4U','cia4u-demand-2-3');
INSERT INTO interactive_lesson_bindings (course_code,lesson_id,native_lesson_id)
VALUES ('MCV4U','mcv4u-derivative-graphs','MCV4U-U1-L3');

CREATE TABLE interactive_lesson_readers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  lesson_id text NOT NULL,
  version text NOT NULL,
  test_section boolean NOT NULL,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  cards jsonb NOT NULL DEFAULT '{}',
  scratchpad text NOT NULL DEFAULT '',
  revision int NOT NULL DEFAULT 0,
  active_millis bigint NOT NULL DEFAULT 0,
  last_heartbeat timestamptz,
  FOREIGN KEY (course_code,lesson_id) REFERENCES interactive_lesson_bindings,
  UNIQUE (course_code,lesson_id,test_section,version,user_id)
);

CREATE TABLE interactive_lesson_receipts (
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  request_id uuid NOT NULL,
  fingerprint text NOT NULL,
  PRIMARY KEY (reader_id,request_id)
);
CREATE TABLE interactive_lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  anchor jsonb NOT NULL,
  color text NOT NULL CHECK (color IN ('yellow','green','blue','pink')),
  text_body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interactive_lesson_notes_reader ON interactive_lesson_notes (reader_id,created_at);

CREATE TABLE interactive_lesson_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  anchor jsonb,
  card_id text,
  peer_id text,
  text_body text NOT NULL,
  endorsed_by uuid REFERENCES app_users,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((anchor IS NOT NULL AND card_id IS NULL AND peer_id IS NULL)
      OR (anchor IS NULL AND card_id IS NOT NULL AND peer_id IS NOT NULL))
);
CREATE INDEX interactive_lesson_threads_reader ON interactive_lesson_threads (reader_id,created_at);
CREATE TABLE interactive_lesson_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES interactive_lesson_threads ON DELETE CASCADE,
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  text_body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX interactive_lesson_replies_thread ON interactive_lesson_replies (thread_id,created_at);
CREATE TABLE interactive_lesson_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  preferred_at timestamptz NOT NULL,
  time_zone text NOT NULL,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','declined')),
  reviewed_by uuid REFERENCES app_users,
  UNIQUE (reader_id, preferred_at)
);

GRANT SELECT ON interactive_lesson_bindings TO lfa_app_runtime;
GRANT SELECT, INSERT ON interactive_lesson_readers, interactive_lesson_receipts,
  interactive_lesson_notes, interactive_lesson_threads, interactive_lesson_replies, interactive_lesson_bookings TO lfa_app_runtime;
GRANT UPDATE (cards,scratchpad,revision,active_millis,last_heartbeat) ON interactive_lesson_readers TO lfa_app_runtime;
GRANT UPDATE (endorsed_by) ON interactive_lesson_threads TO lfa_app_runtime;
GRANT UPDATE (status,reviewed_by) ON interactive_lesson_bookings TO lfa_app_runtime;

-- Public peer IDs are independent of the student's identity and reader ID.
CREATE TABLE interactive_featured_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id uuid NOT NULL REFERENCES interactive_lesson_readers ON DELETE CASCADE,
  card_id text NOT NULL,
  selected_by uuid NOT NULL REFERENCES app_users,
  featured_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reader_id,card_id)
);
GRANT SELECT,INSERT ON interactive_featured_posts TO lfa_app_runtime;
