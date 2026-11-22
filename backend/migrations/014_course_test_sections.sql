-- Membership is assigned by school operations. Ordinary enrolment always keeps
-- the account in its assigned section, including after a drop and re-enrolment.
CREATE TABLE course_test_members (
  course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  PRIMARY KEY (course_code, user_id)
);
GRANT SELECT ON course_test_members TO lfa_app_runtime;

CREATE FUNCTION in_course_test_section(code text, member uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM course_test_members
                  WHERE course_code = code AND user_id = member)
$$;

ALTER TABLE course_announcement_targets
  ADD COLUMN test_section boolean NOT NULL DEFAULT false;
