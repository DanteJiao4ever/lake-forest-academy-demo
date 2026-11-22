CREATE TABLE review_section_pilots (
  course_code text NOT NULL REFERENCES courses(code), test_section boolean NOT NULL,
  enabled_at timestamptz NOT NULL DEFAULT now(),
  start_hour integer NOT NULL DEFAULT 9 CHECK(start_hour BETWEEN 0 AND 22),
  end_hour integer NOT NULL DEFAULT 17 CHECK(end_hour BETWEEN 1 AND 23 AND end_hour > start_hour),
  weekdays integer[] NOT NULL DEFAULT '{1,2,3,4,5}' CHECK(cardinality(weekdays)>0 AND weekdays <@ ARRAY[0,1,2,3,4,5,6]),
  closures date[] NOT NULL DEFAULT '{}',
  PRIMARY KEY(course_code,test_section)
);
INSERT INTO review_section_pilots(course_code,test_section) VALUES ('MCV4U',true);
CREATE TABLE review_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_code text NOT NULL, test_section boolean NOT NULL,
  student_id uuid NOT NULL REFERENCES app_users, opened_by uuid NOT NULL REFERENCES app_users,
  submission_id uuid UNIQUE REFERENCES student_submissions, reader_id uuid REFERENCES interactive_lesson_readers,
  card_id text, title text NOT NULL, submitted_at timestamptz NOT NULL, opened_at timestamptz NOT NULL DEFAULT now(),
  waiting_since timestamptz, released_at timestamptz, revision integer NOT NULL DEFAULT 1,
  contents jsonb NOT NULL, UNIQUE(reader_id,card_id),
  FOREIGN KEY(course_code,test_section) REFERENCES review_section_pilots,
  CHECK ((submission_id IS NOT NULL AND reader_id IS NULL AND card_id IS NULL) OR
         (submission_id IS NULL AND reader_id IS NOT NULL AND card_id IS NOT NULL))
);
CREATE INDEX review_queue ON review_works(course_code,test_section,waiting_since);
CREATE TABLE review_action_receipts (
  user_id uuid NOT NULL REFERENCES app_users, request_id uuid NOT NULL,
  fingerprint text NOT NULL, work_id uuid NOT NULL REFERENCES review_works, PRIMARY KEY(user_id,request_id)
);
GRANT SELECT,INSERT ON review_works,review_action_receipts,review_section_pilots TO lfa_app_runtime;
GRANT UPDATE(contents,waiting_since,released_at,revision) ON review_works TO lfa_app_runtime;
GRANT UPDATE(start_hour,end_hour,weekdays,closures) ON review_section_pilots TO lfa_app_runtime;
