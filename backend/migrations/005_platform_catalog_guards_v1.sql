-- Additive guards for unlock policy, public resources, and final-evaluation filing.
-- Generated from the lfa.course-import.v1 catalog; do not edit by hand.

ALTER TABLE assignments
  ADD COLUMN section_kind text NOT NULL DEFAULT 'unit';

ALTER TABLE assignments
  ADD CONSTRAINT assignments_section_kind_valid
  CHECK (section_kind IN ('unit', 'final_evaluation'));

ALTER TABLE course_modules
  ADD COLUMN unlock_criteria jsonb;

UPDATE course_modules
   SET unlock_criteria = '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb
 WHERE unlock_criteria IS NULL;

UPDATE course_modules AS module
   SET unlock_criteria = source.criteria
  FROM (VALUES
    ('sch4u-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sch4u-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sch4u-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sch4u-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sch4u-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sch4u-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sch4u-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('ics4u-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('ics4u-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('sph4u-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('sph4u-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mhf4u-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mhf4u-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('mcv4u-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('mcv4u-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m00', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m01', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m02', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m03', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m04', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m05', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m06', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m07', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m08', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m09', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb),
    ('bbb4m-m10', '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb),
    ('bbb4m-m11', '{"version":1,"scope":"course_completion","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"all_gradebook_components_published"}]}'::jsonb)
  ) AS source(id, criteria)
 WHERE module.id = source.id;

ALTER TABLE course_modules
  ALTER COLUMN unlock_criteria SET NOT NULL,
  ALTER COLUMN unlock_criteria SET DEFAULT '{"version":1,"scope":"next_module","operator":"all","derivation":"platform_policy_not_natural_language_parser","conditions":[{"type":"source_module_completed"},{"type":"required_activity_completed"},{"type":"required_activity_evidence_present"}]}'::jsonb;

ALTER TABLE course_modules
  ADD CONSTRAINT course_modules_unlock_criteria_valid CHECK (
    jsonb_typeof(unlock_criteria) = 'object'
    AND unlock_criteria->>'version' = '1'
    AND unlock_criteria->>'operator' = 'all'
    AND unlock_criteria->>'scope' IN ('next_module', 'course_completion')
    AND jsonb_typeof(unlock_criteria->'conditions') = 'array'
    AND jsonb_array_length(unlock_criteria->'conditions') >= 3
  );

UPDATE assignments AS assignment
   SET section_kind = source.section_kind
  FROM (VALUES
    ('sch4u-m02-assignment', 'unit'),
    ('sch4u-m04-assignment', 'unit'),
    ('sch4u-m06-assignment', 'unit'),
    ('sch4u-m08-assignment', 'unit'),
    ('sch4u-m10-assignment', 'unit'),
    ('sch4u-m11-assignment', 'final_evaluation'),
    ('ics4u-m02-assignment', 'unit'),
    ('ics4u-m04-assignment', 'unit'),
    ('ics4u-m06-assignment', 'unit'),
    ('ics4u-m08-assignment', 'unit'),
    ('ics4u-m10-assignment', 'unit'),
    ('ics4u-m11-culminating-assignment', 'final_evaluation'),
    ('ics4u-m11-written-exam-assignment', 'final_evaluation'),
    ('sph4u-m02-assignment', 'unit'),
    ('sph4u-m04-assignment', 'unit'),
    ('sph4u-m06-assignment', 'unit'),
    ('sph4u-m08-assignment', 'unit'),
    ('sph4u-m10-assignment', 'unit'),
    ('sph4u-m11-assignment', 'final_evaluation'),
    ('mhf4u-m02-assignment', 'unit'),
    ('mhf4u-m04-assignment', 'unit'),
    ('mhf4u-m06-assignment', 'unit'),
    ('mhf4u-m08-assignment', 'unit'),
    ('mhf4u-m10-assignment', 'unit'),
    ('mhf4u-m11-assignment', 'final_evaluation'),
    ('mcv4u-m02-assignment', 'unit'),
    ('mcv4u-m04-assignment', 'unit'),
    ('mcv4u-m06-assignment', 'unit'),
    ('mcv4u-m08-assignment', 'unit'),
    ('mcv4u-m10-assignment', 'unit'),
    ('mcv4u-m11-assignment', 'final_evaluation'),
    ('bbb4m-m02-assignment', 'unit'),
    ('bbb4m-m04-assignment', 'unit'),
    ('bbb4m-m06-assignment', 'unit'),
    ('bbb4m-m08-assignment', 'unit'),
    ('bbb4m-m10-assignment', 'unit'),
    ('bbb4m-m11-culminating-assignment', 'final_evaluation'),
    ('bbb4m-m11-written-exam-assignment', 'final_evaluation')
  ) AS source(id, section_kind)
 WHERE assignment.id = source.id;

ALTER TABLE module_resources
  ADD CONSTRAINT module_resources_external_https CHECK (
    resource_kind <> 'external_url'
    OR external_url ~ '^https://[^[:space:]]+$'
  );

COMMENT ON COLUMN assignments.unit_number IS
  'Legacy storage key. Use section_kind to distinguish Final Evaluation from numbered curriculum units.';
COMMENT ON COLUMN student_submissions.unit_number IS
  'Legacy storage key copied from assignments. Resolve the public section through assignment_id.';
COMMENT ON COLUMN course_modules.unlock_criteria IS
  'Machine-enforced platform policy. feedback_and_unlock remains the authoritative natural-language rule.';

DO $$
BEGIN
  IF (SELECT count(*) FROM assignments a JOIN course_modules m ON m.id = a.module_id WHERE a.section_kind = 'final_evaluation' AND m.module_number = 11 AND m.unit_number IS NULL) <> 8 THEN
    RAISE EXCEPTION 'Catalog guard assertion failed: expected 8 final-evaluation assignments';
  END IF;
  IF (SELECT count(*) FROM assignments a JOIN course_modules m ON m.id = a.module_id WHERE a.section_kind = 'unit' AND m.module_number BETWEEN 1 AND 10 AND a.unit_number = m.unit_number) <> 30 THEN
    RAISE EXCEPTION 'Catalog guard assertion failed: expected 30 numbered-unit assignments';
  END IF;
  IF (SELECT count(*) FROM course_modules WHERE unlock_criteria->>'version' = '1' AND btrim(feedback_and_unlock) <> '') <> 72 THEN
    RAISE EXCEPTION 'Catalog guard assertion failed: expected 72 preserved rules with versioned criteria';
  END IF;
END $$;
