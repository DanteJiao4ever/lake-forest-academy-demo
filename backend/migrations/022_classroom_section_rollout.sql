-- Operations enables the approved section after the application is ready.
CREATE TABLE classroom_section_rollouts (
  course_code text NOT NULL REFERENCES courses(code),
  test_section boolean NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY (course_code, test_section)
);
INSERT INTO classroom_section_rollouts(course_code,test_section) VALUES ('MCV4U',true);
GRANT SELECT ON classroom_section_rollouts TO lfa_app_runtime;

CREATE FUNCTION classroom_rollout_enabled(code text, actor uuid) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT actor IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.classroom_section_rollouts r WHERE r.course_code=code
      AND r.test_section=public.in_course_test_section(code,actor) AND r.enabled
  )
$$;

-- Keep legacy reads, submissions and progress available when a cohort is paused.
ALTER FUNCTION integrity_allows(uuid,text) RENAME TO integrity_policy_allows;
CREATE FUNCTION integrity_allows(actor uuid, code text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT NOT public.classroom_rollout_enabled(code,actor) OR public.integrity_policy_allows(actor,code)
$$;
