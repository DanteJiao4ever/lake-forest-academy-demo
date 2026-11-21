CREATE TABLE course_announcements (
  id uuid PRIMARY KEY,
  author_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (btrim(title) <> '' AND char_length(title) <= 160),
  body text NOT NULL CHECK (btrim(body) <> '' AND char_length(body) <= 3000),
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE course_announcement_targets (
  announcement_id uuid NOT NULL REFERENCES course_announcements(id) ON DELETE CASCADE,
  course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
  PRIMARY KEY (announcement_id, course_code)
);

CREATE INDEX course_announcement_targets_course_idx
  ON course_announcement_targets (course_code, announcement_id);

GRANT SELECT, INSERT ON course_announcements, course_announcement_targets TO lfa_app_runtime;
