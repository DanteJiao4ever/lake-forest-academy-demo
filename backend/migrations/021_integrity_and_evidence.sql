-- A prospective rollout applies only to new enrolments in this course section.
CREATE TABLE course_integrity_rollouts (
  course_code text NOT NULL REFERENCES courses(code),
  test_section boolean NOT NULL,
  effective_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  policy_version text NOT NULL DEFAULT 'integrity-v1',
  approved_by uuid NOT NULL REFERENCES app_users(id),
  PRIMARY KEY (course_code,test_section)
);
CREATE TABLE course_integrity_attempts (
  student_id uuid NOT NULL REFERENCES app_users(id), course_code text NOT NULL REFERENCES courses(code),
  test_section boolean NOT NULL, policy_version text NOT NULL,
  signed_at timestamptz NOT NULL, passed_at timestamptz, attempts int NOT NULL DEFAULT 0,
  PRIMARY KEY (student_id,course_code,test_section,policy_version)
);
CREATE FUNCTION integrity_allows(actor uuid, code text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM course_enrollments e
    JOIN course_integrity_rollouts p ON p.course_code=e.course_code
      AND p.test_section=in_course_test_section(e.course_code,e.student_user_id)
    WHERE e.student_user_id=actor AND e.course_code=code AND e.status='active' AND e.enrolled_at>=p.effective_at
      AND NOT EXISTS (SELECT 1 FROM course_integrity_attempts a WHERE a.student_id=actor AND a.course_code=code
           AND a.test_section=p.test_section AND a.policy_version=p.policy_version AND a.passed_at IS NOT NULL)
  )
$$;
CREATE FUNCTION require_course_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE course text; n int;
BEGIN
  IF TG_TABLE_NAME='student_module_progress' THEN
    SELECT course_code,module_number INTO course,n FROM course_modules WHERE id=NEW.module_id;
  ELSIF TG_TABLE_NAME='student_activity_completions' THEN
    SELECT m.course_code,m.module_number INTO course,n FROM course_modules m JOIN module_activities a ON a.module_id=m.id WHERE a.id=NEW.activity_id;
  ELSE
    SELECT a.course_code,COALESCE(m.module_number,1) INTO course,n FROM assignments a LEFT JOIN course_modules m ON m.id=a.module_id WHERE a.id=NEW.assignment_id;
  END IF;
  IF n>0 AND NOT integrity_allows(NEW.student_user_id,course) THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Module 0 integrity requirement is incomplete', CONSTRAINT='course_integrity_gate';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER integrity_module BEFORE INSERT OR UPDATE ON student_module_progress FOR EACH ROW EXECUTE FUNCTION require_course_integrity();
CREATE TRIGGER integrity_activity BEFORE INSERT OR UPDATE ON student_activity_completions FOR EACH ROW EXECUTE FUNCTION require_course_integrity();
CREATE TRIGGER integrity_submission BEFORE INSERT ON student_submissions FOR EACH ROW EXECUTE FUNCTION require_course_integrity();
CREATE TABLE course_engagement_intervals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, student_id uuid NOT NULL REFERENCES app_users(id),
  course_code text NOT NULL REFERENCES courses(code), test_section boolean NOT NULL,
  source text NOT NULL CHECK(source IN ('reading','assessment','writing','seminar')),
  observed tstzrange NOT NULL CHECK (NOT isempty(observed) AND lower(observed) IS NOT NULL AND upper(observed) IS NOT NULL
    AND upper(observed)-lower(observed)<=interval '30 seconds')
);
CREATE INDEX engagement_learner_course ON course_engagement_intervals(student_id,course_code,test_section);
CREATE TABLE course_evidence_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_code text NOT NULL REFERENCES courses(code),
  student_id uuid NOT NULL REFERENCES app_users(id), test_section boolean NOT NULL, teacher_id uuid NOT NULL REFERENCES app_users(id),
  activity_date date NOT NULL, minutes int NOT NULL CHECK(minutes BETWEEN 1 AND 1440), description text NOT NULL,
  request_id uuid NOT NULL, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(teacher_id,request_id)
);
GRANT SELECT,INSERT ON course_integrity_rollouts,course_evidence_records,course_engagement_intervals TO lfa_app_runtime;
GRANT SELECT,INSERT,UPDATE ON course_integrity_attempts TO lfa_app_runtime;
GRANT USAGE ON SEQUENCE course_engagement_intervals_id_seq TO lfa_app_runtime;
