CREATE TABLE text_seminars (
  id uuid PRIMARY KEY,
  course_code text NOT NULL REFERENCES courses(code),
  test_section boolean NOT NULL,
  created_by uuid NOT NULL REFERENCES app_users(id),
  title text NOT NULL,
  board jsonb NOT NULL CHECK (jsonb_typeof(board)='array'),
  stage text NOT NULL DEFAULT 'prepared' CHECK (stage IN ('prepared','board','blind','discussion','finished')),
  step_index integer NOT NULL DEFAULT -1,
  cursor integer NOT NULL DEFAULT 0 CHECK (cursor >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX text_seminars_section ON text_seminars(course_code,test_section,created_at DESC);

-- A per-room cursor is assigned under the room lock, in commit order. Public
-- events only contain material intentionally released to the class.
CREATE TABLE text_seminar_events (
  room_id uuid NOT NULL REFERENCES text_seminars(id) ON DELETE CASCADE,
  cursor integer NOT NULL,
  kind text NOT NULL CHECK (kind IN ('board','blind','spotlight','comment','finished')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (room_id,cursor)
);
CREATE TABLE text_seminar_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES text_seminars(id) ON DELETE CASCADE,
  step_index integer NOT NULL,
  student_id uuid NOT NULL REFERENCES app_users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (room_id,step_index,student_id)
);
CREATE TABLE text_seminar_receipts (
  room_id uuid NOT NULL REFERENCES text_seminars(id) ON DELETE CASCADE,
  actor_id uuid NOT NULL REFERENCES app_users(id),
  request_id uuid NOT NULL,
  fingerprint text NOT NULL,
  PRIMARY KEY (room_id,actor_id,request_id)
);
CREATE TABLE text_seminar_attendance (
  room_id uuid NOT NULL REFERENCES text_seminars(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES app_users(id),
  first_seen timestamptz NOT NULL DEFAULT clock_timestamp(),
  last_seen timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (room_id,student_id)
);
GRANT SELECT, INSERT ON text_seminars, text_seminar_events, text_seminar_responses,
  text_seminar_receipts, text_seminar_attendance TO lfa_app_runtime;
GRANT UPDATE (stage,step_index,cursor) ON text_seminars TO lfa_app_runtime;
GRANT UPDATE (last_seen) ON text_seminar_attendance TO lfa_app_runtime;
