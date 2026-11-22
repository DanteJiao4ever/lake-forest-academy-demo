ALTER TABLE app_users DROP CONSTRAINT app_users_role_valid;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_valid CHECK (role IN ('student','teacher','teacher_admin','observer'));

CREATE TABLE insight_pilot_courses (course_code text PRIMARY KEY REFERENCES courses(code));
INSERT INTO insight_pilot_courses VALUES ('MCV4U');

-- Immutable, privately provisioned policy per entering cohort. Freeze task
-- weights from the approved MCV4U catalog when introducing the pilot.
CREATE TABLE insight_course_policies (
  course_code text NOT NULL REFERENCES insight_pilot_courses,
  version text NOT NULL,
  applies_to_enrolments_from timestamptz NOT NULL,
  task_weights jsonb NOT NULL,
  PRIMARY KEY(course_code,version),
  UNIQUE(course_code,applies_to_enrolments_from)
);
INSERT INTO insight_course_policies(course_code,version,applies_to_enrolments_from,task_weights)
SELECT course_code,'MCV4U-catalog-v1','-infinity',jsonb_object_agg(id,weight_percent)
  FROM gradebook_items WHERE course_code='MCV4U' AND status='published' GROUP BY course_code;
GRANT SELECT ON insight_course_policies TO lfa_app_runtime;

-- Grants are tied to the student's section at issuance. A transfer requires a
-- new grant even if the student remains enrolled in the same named course.
CREATE TABLE observer_course_grants (
  observer_id uuid NOT NULL REFERENCES app_users ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES app_users ON DELETE CASCADE,
  course_code text NOT NULL REFERENCES insight_pilot_courses,
  test_section boolean NOT NULL,
  active boolean NOT NULL,
  changed_by uuid NOT NULL REFERENCES app_users,
  changed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(observer_id,student_id,course_code,test_section)
);

-- Immutable versions. A rubric belongs to the task and section. Plans, skill
-- reports and KTCA evidence belong to the pupil. Evidence includes a copy of
-- the applied version/weights to keep historical interpretation reproducible.
CREATE TABLE insight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL REFERENCES insight_pilot_courses,
  test_section boolean NOT NULL,
  student_id uuid REFERENCES app_users ON DELETE CASCADE,
  kind text NOT NULL CHECK(kind IN ('rubric','plan','skills','evidence')),
  record_key text NOT NULL,
  version integer NOT NULL CHECK(version>0),
  data jsonb NOT NULL,
  author_id uuid NOT NULL REFERENCES app_users,
  created_at timestamptz NOT NULL DEFAULT now(),
  request_id uuid NOT NULL,
  fingerprint text NOT NULL,
  CHECK((kind='rubric')=(student_id IS NULL)),
  UNIQUE(author_id,request_id)
);
CREATE UNIQUE INDEX insight_records_course_version ON insight_records(course_code,test_section,kind,record_key,version) WHERE student_id IS NULL;
CREATE UNIQUE INDEX insight_records_student_version ON insight_records(course_code,test_section,student_id,kind,record_key,version) WHERE student_id IS NOT NULL;

GRANT SELECT ON insight_pilot_courses TO lfa_app_runtime;
GRANT SELECT, INSERT ON observer_course_grants, insight_records TO lfa_app_runtime;
GRANT UPDATE(active,changed_by,changed_at) ON observer_course_grants TO lfa_app_runtime;
