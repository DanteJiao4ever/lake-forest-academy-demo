-- Verification of a student's eligibility is a school operation. The web
-- application's own registration and elective choices cannot grant eligibility.
CREATE TABLE public.formal_student_roster (
  student_user_id uuid PRIMARY KEY REFERENCES public.app_users(id) ON DELETE CASCADE,
  verified_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.formal_student_roster TO lfa_app_runtime;

-- This is also the explicit recovery entry point for restoring the private
-- curriculum into a database previously initialized with public fixtures only.
CREATE FUNCTION public.publish_authored_catalog_v1() RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public AS $$
DECLARE
  codes CONSTANT text[] := ARRAY[
    'BAF3M','BAT4M','BEM1O','BEP2O','BOH4M','CGC1W','CHC2D','CHV2O','ENG2D','ENG3U',
    'ENG4U','ENL1W','ESLAO','ESLBO','ESLCO','ESLDO','ESLEO','HSB4U','HSP3U','ICS3U',
    'MCR3U','MDM4U','MPM2D','MTH1W','OLC4O','SBI3U','SBI4U','SCH3U','SES4U','SNC1W',
    'SNC2D','SPH3U','TAS1O','TAS2O','TEJ3M','TEJ4M'
  ];
  mdm_sha CONSTANT text := '210f9cb61b358285c71db7f920ad009549167065d337b3021f565c400d870327';
  release_id CONSTANT text := 'authored.curriculum.36.publication.v1';
  edition CONSTANT text := '55989a601bdf412e0536f17ddc378c06265785c531992937ca741ed731131d8f';
  content_digest text;
  record_count integer;
  previous_release text;
BEGIN
  IF NOT EXISTS (SELECT FROM public.schema_migrations WHERE name='015_hidden_teaching_drafts_v1.sql'
                  AND checksum='18ca30ca660f2d617a5a4ecd30bb78843c1d0550a3f39dce8691d7252e01c487')
     OR NOT EXISTS (SELECT FROM public.schema_migrations WHERE name='026_course_pack_pacing.sql'
                  AND checksum='ea2dffa0a85883efd882bd3aba1e97c97e63fbe1d80c98b04c26c0b354ee724c')
     OR NOT EXISTS (SELECT FROM public.catalog_imports WHERE version='hidden.authored.curriculum.36.v1'
                  AND content_sha256='0ff521bb82ddd422bd4e763fa1d05f21e08c48714fcfc950ec6ccc3465243947'
                  AND (course_count,module_count,lesson_count)=(36,155,354)) THEN
    RAISE EXCEPTION 'Install the approved private curriculum and pacing migrations before publication';
  END IF;

  SET LOCAL lock_timeout = '15s';
  LOCK TABLE public.courses, public.course_modules, public.module_lessons, public.module_activities,
             public.assignments, public.catalog_imports, public.classroom_section_rollouts
             IN SHARE ROW EXCLUSIVE MODE;
  SELECT content_sha256 INTO previous_release FROM public.catalog_imports WHERE version=release_id;
  IF previous_release IS NOT NULL AND previous_release<>edition THEN
    RAISE EXCEPTION 'The recorded catalog publication has a different edition';
  END IF;

  -- Fingerprint the full set of stable instructional fields, independently of
  -- generated timestamps, database locale, and the intended status changes.
  WITH catalog_rows(kind, resource_id, content) AS (
   SELECT 'course', c.code, jsonb_build_array(c.title)
     FROM public.courses c WHERE c.code = ANY(codes)
   UNION ALL
   SELECT 'module', m.id, jsonb_build_array(m.course_code,m.module_number,m.unit_number,m.title,m.unit_title,m.learning_focus,m.core_reading_order,m.guided_practice,m.low_stakes_check)
     FROM public.course_modules m WHERE m.course_code = ANY(codes) AND m.id LIKE lower(m.course_code)||'-cb%'
   UNION ALL
   SELECT 'lesson', l.id, jsonb_build_array(l.module_id,l.position,l.title)
     FROM public.module_lessons l JOIN public.course_modules m ON m.id=l.module_id
    WHERE m.course_code = ANY(codes) AND m.id LIKE lower(m.course_code)||'-cb%'
   UNION ALL
   SELECT 'activity', a.id, jsonb_build_array(a.module_id,a.activity_type,a.title,a.sequence,a.course_grade_weight_percent,a.process_checkpoints,a.authentication_evidence)
     FROM public.module_activities a JOIN public.course_modules m ON m.id=a.module_id
    WHERE m.course_code = ANY(codes) AND m.id LIKE lower(m.course_code)||'-cb%'
   UNION ALL
   SELECT 'assignment', a.id, jsonb_build_array(a.course_code,a.module_id,a.unit_number,a.title,a.instructions,a.section_kind,a.rubric,a.weight_percent,a.submission_mode)
     FROM public.assignments a WHERE a.course_code = ANY(codes) AND a.module_id LIKE lower(a.course_code)||'-cb%'
  )
  SELECT encode(sha256(convert_to(string_agg(kind||':'||resource_id||':'||content::text,E'\n' ORDER BY kind COLLATE "C",resource_id COLLATE "C"),'UTF8')), 'hex') AS content_digest, count(*) AS total
    INTO content_digest, record_count
    FROM catalog_rows;
  IF content_digest IS DISTINCT FROM edition OR record_count<>891 THEN
    RAISE EXCEPTION 'The historical private curriculum differs from the approved edition';
  END IF;

  -- The student-facing MDM edition already has persistent work and module
  -- identities. Its older book modules and assignments stay out of the course.
  IF NOT EXISTS (SELECT FROM public.pacing_pack_versions WHERE course_code='MDM4U'
                   AND version='1.0.0' AND manifest_sha256=mdm_sha)
     OR NOT EXISTS (SELECT FROM public.pacing_template_approvals WHERE course_code='MDM4U'
                   AND version='1.0.0' AND manifest_sha256=mdm_sha)
     OR (SELECT count(*) FROM public.course_modules WHERE course_code='MDM4U'
                   AND status='published' AND module_number BETWEEN 60 AND 71
                   AND id='mdm4u-m'||lpad((module_number-60)::text,2,'0'))<>12
     OR (SELECT count(*) FROM public.assignments WHERE course_code='MDM4U' AND status='active'
                   AND unit_number BETWEEN 1 AND 5 AND id='mdm4u-u'||unit_number::text)<>5
     OR (SELECT count(*) FROM public.course_modules WHERE course_code='MDM4U' AND status='draft'
                   AND id LIKE 'mdm4u-cb%')<>5
     OR (SELECT count(*) FROM public.assignments WHERE course_code='MDM4U' AND status='archived'
                   AND module_id LIKE 'mdm4u-cb%')<>6
     OR NOT EXISTS (SELECT FROM public.classroom_section_rollouts WHERE course_code='MDM4U'
                   AND test_section AND enabled)
     OR NOT COALESCE((SELECT enabled AND version='1.0.0' FROM public.pacing_section_configs
                   WHERE course_code='MDM4U' ORDER BY revision DESC LIMIT 1), false) THEN
    RAISE EXCEPTION 'Restore the existing MDM4U reader, assessment IDs, and section configuration before publication';
  END IF;
  IF EXISTS (SELECT FROM public.course_modules WHERE course_code=ANY(codes)
                 AND id NOT LIKE lower(course_code)||'-cb%'
                 AND NOT (course_code='MDM4U' AND id ~ '^mdm4u-m(0[0-9]|1[01])$'))
     OR EXISTS (SELECT FROM public.assignments WHERE course_code=ANY(codes)
                 AND (module_id IS NULL OR module_id NOT LIKE lower(course_code)||'-cb%')
                 AND NOT (course_code='MDM4U' AND id ~ '^mdm4u-u[1-5]$')) THEN
    RAISE EXCEPTION 'Unexpected course material or assignment identities; review before enabling this catalog';
  END IF;

  IF previous_release IS NULL THEN
    IF (SELECT count(*) FROM public.courses WHERE code=ANY(codes) AND status='archived')<>36
       OR (SELECT count(*) FROM public.course_modules WHERE course_code=ANY(codes) AND status='draft')<>155
       OR (SELECT count(*) FROM public.module_lessons l JOIN public.course_modules m ON m.id=l.module_id
            WHERE m.course_code=ANY(codes) AND l.status='draft')<>354
       OR (SELECT count(*) FROM public.module_activities a JOIN public.course_modules m ON m.id=a.module_id
            WHERE m.course_code=ANY(codes) AND a.status='draft')<>155
       OR (SELECT count(*) FROM public.assignments WHERE course_code=ANY(codes) AND status='archived')<>191 THEN
      RAISE EXCEPTION 'Private course publication states differ from the approved baseline';
    END IF;

    -- Allocate the course design budget by lesson count. Differences between
    -- rounded cumulative totals ensure that each course adds exactly to its
    -- 55- or 110-hour plan; these are estimates, never earned credit hours.
    WITH units AS (
      SELECT m.id,m.course_code,m.module_number,count(l.id) AS lessons,
             CASE WHEN m.course_code='CHV2O' THEN 55 ELSE 110 END AS hours
        FROM public.course_modules m JOIN public.module_lessons l ON l.module_id=m.id
       WHERE m.course_code=ANY(codes) AND m.course_code<>'MDM4U'
       GROUP BY m.id
    ), allocation AS (
      SELECT *, sum(lessons) OVER (PARTITION BY course_code ORDER BY module_number) AS cumulative,
                sum(lessons) OVER (PARTITION BY course_code) AS total FROM units
    )
    UPDATE public.course_modules m
       SET status='published',
           estimated_credit_hours=round(n.hours*n.cumulative/n.total,2)
                                - round(n.hours*(n.cumulative-n.lessons)/n.total,2)
      FROM allocation n WHERE n.id=m.id;
    UPDATE public.module_lessons l SET status='published' FROM public.course_modules m
     WHERE l.module_id=m.id AND m.course_code=ANY(codes) AND m.course_code<>'MDM4U';
    UPDATE public.module_activities a SET status='published' FROM public.course_modules m
     WHERE a.module_id=m.id AND m.course_code=ANY(codes) AND m.course_code<>'MDM4U';
    UPDATE public.assignments SET status='active' WHERE course_code=ANY(codes) AND course_code<>'MDM4U';
    UPDATE public.courses SET status='active' WHERE code=ANY(codes);
    INSERT INTO public.classroom_section_rollouts(course_code,test_section,enabled) VALUES ('MDM4U',false,true)
      ON CONFLICT (course_code,test_section) DO UPDATE SET enabled=true;
    INSERT INTO public.catalog_imports(version,content_sha256,course_count,module_count,lesson_count,resource_count)
      VALUES (release_id,edition,36,150,336,0);
  END IF;

  IF (SELECT count(*) FROM public.courses WHERE code=ANY(codes) AND status='active')<>36
     OR (SELECT count(*) FROM public.course_modules WHERE course_code=ANY(codes) AND status='published')<>162
     OR (SELECT count(*) FROM public.module_lessons l JOIN public.course_modules m ON m.id=l.module_id
          WHERE m.course_code=ANY(codes) AND l.status='published')<>336
     OR (SELECT count(*) FROM public.module_activities a JOIN public.course_modules m ON m.id=a.module_id
          WHERE m.course_code=ANY(codes) AND a.status='published')<>150
     OR (SELECT count(*) FROM public.assignments WHERE course_code=ANY(codes) AND status='active')<>190
     OR NOT EXISTS (SELECT FROM public.classroom_section_rollouts WHERE course_code='MDM4U' AND NOT test_section AND enabled)
     OR EXISTS (SELECT course_code FROM public.course_modules WHERE course_code=ANY(codes) AND course_code<>'MDM4U'
          GROUP BY course_code HAVING sum(estimated_credit_hours)<>CASE WHEN course_code='CHV2O' THEN 55 ELSE 110 END)
     THEN RAISE EXCEPTION 'Post-publication validation failed'; END IF;
END
$$;
REVOKE ALL ON FUNCTION public.publish_authored_catalog_v1() FROM PUBLIC;

-- An empty public-only CI database contains none of these private resources.
-- If any part of the private release exists, fail closed on partial imports.
DO $apply$
BEGIN
  IF EXISTS (SELECT FROM public.schema_migrations WHERE name='015_hidden_teaching_drafts_v1.sql')
     OR EXISTS (SELECT FROM public.catalog_imports WHERE version='hidden.authored.curriculum.36.v1')
     OR EXISTS (SELECT FROM public.courses WHERE code IN ('SNC1W','MDM4U','ENG4U')) THEN
    PERFORM public.publish_authored_catalog_v1();
  END IF;
END
$apply$;
