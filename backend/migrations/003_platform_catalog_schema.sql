-- Database-driven course delivery catalog and progress tracking.
-- This migration is expand-only so the previously deployed API can continue
-- serving while a new Cloud Run revision is validated.

ALTER TABLE drive_materials
  ADD COLUMN audience text NOT NULL DEFAULT 'student';

ALTER TABLE drive_materials
  ADD CONSTRAINT drive_materials_audience_valid
  CHECK (audience IN ('student', 'staff'));

CREATE TABLE course_modules (
    id text PRIMARY KEY,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    module_number smallint NOT NULL,
    unit_number integer,
    title text NOT NULL,
    unit_title text NOT NULL,
    learning_focus jsonb NOT NULL DEFAULT '[]'::jsonb,
    core_reading_order jsonb NOT NULL DEFAULT '[]'::jsonb,
    guided_practice text NOT NULL DEFAULT '',
    low_stakes_check text NOT NULL DEFAULT '',
    feedback_and_unlock text NOT NULL DEFAULT '',
    estimated_credit_hours numeric(6,2) NOT NULL DEFAULT 0,
    workload_label text NOT NULL DEFAULT '',
    teacher_presence text NOT NULL DEFAULT '',
    evidence_to_retain text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT course_modules_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    CONSTRAINT course_modules_number_valid CHECK (module_number BETWEEN 0 AND 99),
    CONSTRAINT course_modules_unit_valid CHECK (unit_number IS NULL OR unit_number BETWEEN 1 AND 999),
    CONSTRAINT course_modules_title_nonempty CHECK (btrim(title) <> '' AND btrim(unit_title) <> ''),
    CONSTRAINT course_modules_json_arrays CHECK (
      jsonb_typeof(learning_focus) = 'array' AND jsonb_typeof(core_reading_order) = 'array'
    ),
    CONSTRAINT course_modules_hours_valid CHECK (estimated_credit_hours >= 0),
    CONSTRAINT course_modules_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT course_modules_course_number_unique UNIQUE (course_code, module_number)
);

CREATE INDEX course_modules_catalog_idx
  ON course_modules (course_code, module_number) WHERE status = 'published';

CREATE TABLE module_lessons (
    id text PRIMARY KEY,
    module_id text NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
    position smallint NOT NULL,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT module_lessons_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'
    ),
    CONSTRAINT module_lessons_position_valid CHECK (position BETWEEN 1 AND 99),
    CONSTRAINT module_lessons_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT module_lessons_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT module_lessons_module_position_unique UNIQUE (module_id, position)
);

CREATE INDEX module_lessons_module_idx ON module_lessons (module_id, position);

CREATE TABLE module_resources (
    id text PRIMARY KEY,
    module_id text NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
    position smallint NOT NULL,
    title text NOT NULL,
    provider text NOT NULL DEFAULT '',
    resource_kind text NOT NULL DEFAULT 'external_url',
    external_url text,
    drive_material_id uuid REFERENCES drive_materials(id) ON DELETE SET NULL,
    assigned_use text NOT NULL DEFAULT '',
    audience text NOT NULL DEFAULT 'student',
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT module_resources_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    CONSTRAINT module_resources_position_valid CHECK (position BETWEEN 1 AND 99),
    CONSTRAINT module_resources_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT module_resources_kind_valid CHECK (resource_kind IN ('external_url', 'drive_material')),
    CONSTRAINT module_resources_target_valid CHECK (
      (resource_kind = 'external_url' AND external_url IS NOT NULL AND btrim(external_url) <> '' AND drive_material_id IS NULL)
      OR
      (resource_kind = 'drive_material' AND drive_material_id IS NOT NULL AND external_url IS NULL)
    ),
    CONSTRAINT module_resources_audience_valid CHECK (audience IN ('student', 'staff')),
    CONSTRAINT module_resources_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT module_resources_module_position_unique UNIQUE (module_id, position)
);

CREATE INDEX module_resources_module_idx ON module_resources (module_id, position);
CREATE INDEX module_resources_drive_material_idx
  ON module_resources (drive_material_id) WHERE drive_material_id IS NOT NULL;

CREATE TABLE module_activities (
    id text PRIMARY KEY,
    module_id text NOT NULL UNIQUE REFERENCES course_modules(id) ON DELETE RESTRICT,
    activity_type text NOT NULL,
    title text NOT NULL,
    course_grade_weight_percent numeric(5,2) NOT NULL DEFAULT 0,
    sequence jsonb NOT NULL DEFAULT '[]'::jsonb,
    evidence_file text,
    task_type text,
    process_checkpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
    authentication_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
    time_minutes integer,
    is_required boolean NOT NULL DEFAULT true,
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT module_activities_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    CONSTRAINT module_activities_type_valid CHECK (
      activity_type IN ('orientation', 'formative', 'coursework', 'final_evaluation')
    ),
    CONSTRAINT module_activities_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT module_activities_weight_valid CHECK (
      course_grade_weight_percent BETWEEN 0 AND 100
    ),
    CONSTRAINT module_activities_json_arrays CHECK (
      jsonb_typeof(sequence) = 'array'
      AND jsonb_typeof(process_checkpoints) = 'array'
      AND jsonb_typeof(authentication_evidence) = 'array'
    ),
    CONSTRAINT module_activities_time_valid CHECK (time_minutes IS NULL OR time_minutes > 0),
    CONSTRAINT module_activities_status_valid CHECK (status IN ('draft', 'published', 'archived'))
);

ALTER TABLE assignments
  ADD COLUMN module_id text REFERENCES course_modules(id) ON DELETE RESTRICT,
  ADD COLUMN instructions text NOT NULL DEFAULT '',
  ADD COLUMN rubric jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN weight_percent numeric(5,2),
  ADD COLUMN submission_mode text NOT NULL DEFAULT 'text_or_file',
  ADD COLUMN available_from timestamptz,
  ADD COLUMN due_at timestamptz,
  ADD COLUMN available_until timestamptz;

ALTER TABLE assignments
  ADD CONSTRAINT assignments_rubric_array CHECK (jsonb_typeof(rubric) = 'array'),
  ADD CONSTRAINT assignments_weight_valid CHECK (weight_percent IS NULL OR weight_percent BETWEEN 0 AND 100),
  ADD CONSTRAINT assignments_submission_mode_valid CHECK (
    submission_mode IN ('none', 'text', 'file', 'text_or_file', 'supervised', 'oral_defence', 'project')
  ),
  ADD CONSTRAINT assignments_schedule_valid CHECK (
    (available_from IS NULL OR due_at IS NULL OR available_from <= due_at)
    AND (due_at IS NULL OR available_until IS NULL OR due_at <= available_until)
  );

CREATE INDEX assignments_module_idx
  ON assignments (module_id, status) WHERE module_id IS NOT NULL;

CREATE TABLE gradebook_items (
    id text PRIMARY KEY,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    module_activity_id text REFERENCES module_activities(id) ON DELETE RESTRICT,
    assignment_id text REFERENCES assignments(id) ON DELETE RESTRICT,
    category text NOT NULL,
    component_key text NOT NULL,
    title text NOT NULL,
    weight_percent numeric(5,2) NOT NULL,
    max_score numeric(8,2) NOT NULL DEFAULT 100,
    submission_mode text NOT NULL DEFAULT 'none',
    position smallint NOT NULL,
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT gradebook_items_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    CONSTRAINT gradebook_items_category_valid CHECK (
      category IN ('coursework', 'final_evaluation', 'participation')
    ),
    CONSTRAINT gradebook_items_component_nonempty CHECK (btrim(component_key) <> ''),
    CONSTRAINT gradebook_items_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT gradebook_items_weight_valid CHECK (weight_percent > 0 AND weight_percent <= 100),
    CONSTRAINT gradebook_items_score_valid CHECK (max_score > 0),
    CONSTRAINT gradebook_items_submission_mode_valid CHECK (
      submission_mode IN ('none', 'text', 'file', 'text_or_file', 'supervised', 'oral_defence', 'project')
    ),
    CONSTRAINT gradebook_items_position_valid CHECK (position BETWEEN 1 AND 99),
    CONSTRAINT gradebook_items_status_valid CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT gradebook_items_component_unique UNIQUE (course_code, component_key),
    CONSTRAINT gradebook_items_position_unique UNIQUE (course_code, position)
);

CREATE INDEX gradebook_items_course_idx
  ON gradebook_items (course_code, position) WHERE status = 'published';

CREATE TABLE assessment_components (
    id text PRIMARY KEY,
    module_activity_id text NOT NULL REFERENCES module_activities(id) ON DELETE RESTRICT,
    gradebook_item_id text NOT NULL UNIQUE REFERENCES gradebook_items(id) ON DELETE RESTRICT,
    position smallint NOT NULL,
    title text NOT NULL,
    component_type text NOT NULL,
    weight_percent numeric(5,2) NOT NULL,
    time_minutes integer,
    process_checkpoints jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT assessment_components_id_valid CHECK (
      char_length(id) BETWEEN 1 AND 100 AND id ~ '^[a-z0-9][a-z0-9._-]*$'
    ),
    CONSTRAINT assessment_components_position_valid CHECK (position BETWEEN 1 AND 20),
    CONSTRAINT assessment_components_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT assessment_components_type_nonempty CHECK (btrim(component_type) <> ''),
    CONSTRAINT assessment_components_weight_valid CHECK (weight_percent > 0 AND weight_percent <= 100),
    CONSTRAINT assessment_components_time_valid CHECK (time_minutes IS NULL OR time_minutes > 0),
    CONSTRAINT assessment_components_checkpoints_array CHECK (jsonb_typeof(process_checkpoints) = 'array'),
    CONSTRAINT assessment_components_activity_position_unique UNIQUE (module_activity_id, position)
);

-- Versioned grades for gradebook items that do not accept a student upload,
-- such as supervised examinations and teacher-entered participation marks.
CREATE TABLE student_gradebook_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    gradebook_item_id text NOT NULL REFERENCES gradebook_items(id) ON DELETE RESTRICT,
    version integer NOT NULL,
    score smallint NOT NULL,
    feedback text NOT NULL DEFAULT '',
    graded_by_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    graded_by text NOT NULL,
    idempotency_key text NOT NULL,
    request_fingerprint char(64) NOT NULL,
    is_current boolean NOT NULL DEFAULT true,
    graded_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT student_gradebook_scores_version_valid CHECK (version >= 1),
    CONSTRAINT student_gradebook_scores_score_valid CHECK (score BETWEEN 0 AND 100),
    CONSTRAINT student_gradebook_scores_feedback_length CHECK (char_length(feedback) <= 10000),
    CONSTRAINT student_gradebook_scores_fingerprint_valid CHECK (
      request_fingerprint ~ '^[0-9a-f]{64}$'
    ),
    CONSTRAINT student_gradebook_scores_version_unique UNIQUE (
      student_user_id, gradebook_item_id, version
    ),
    CONSTRAINT student_gradebook_scores_grader_idempotency_unique UNIQUE (
      graded_by_user_id, idempotency_key
    )
);

CREATE UNIQUE INDEX student_gradebook_scores_one_current_idx
  ON student_gradebook_scores (student_user_id, gradebook_item_id) WHERE is_current = true;
CREATE INDEX student_gradebook_scores_student_visible_idx
  ON student_gradebook_scores (student_user_id, gradebook_item_id, version DESC)
  WHERE published_at IS NOT NULL;

CREATE TABLE student_module_progress (
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    module_id text NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'available',
    started_at timestamptz,
    completed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_user_id, module_id),
    CONSTRAINT student_module_progress_status_valid CHECK (
      status IN ('locked', 'available', 'in_progress', 'completed')
    ),
    CONSTRAINT student_module_progress_time_valid CHECK (
      completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at
    )
);

CREATE INDEX student_module_progress_module_idx ON student_module_progress (module_id, status);

CREATE TABLE student_activity_completions (
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    activity_id text NOT NULL REFERENCES module_activities(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'started',
    evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
    completed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_user_id, activity_id),
    CONSTRAINT student_activity_completions_status_valid CHECK (
      status IN ('started', 'submitted', 'completed', 'waived')
    ),
    CONSTRAINT student_activity_completions_evidence_object CHECK (jsonb_typeof(evidence) = 'object')
);

CREATE TABLE module_unlock_overrides (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    module_id text NOT NULL REFERENCES course_modules(id) ON DELETE RESTRICT,
    granted_by_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    reason text NOT NULL,
    expires_at timestamptz,
    active boolean NOT NULL DEFAULT true,
    revoked_at timestamptz,
    revoked_by_user_id uuid REFERENCES app_users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT module_unlock_overrides_reason_required CHECK (btrim(reason) <> ''),
    CONSTRAINT module_unlock_overrides_expiry_valid CHECK (expires_at IS NULL OR expires_at > created_at),
    CONSTRAINT module_unlock_overrides_revoke_valid CHECK (
      (active AND revoked_at IS NULL AND revoked_by_user_id IS NULL)
      OR
      (NOT active AND revoked_at IS NOT NULL AND revoked_by_user_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX module_unlock_overrides_one_active_idx
  ON module_unlock_overrides (student_user_id, module_id) WHERE active = true;
CREATE INDEX module_unlock_overrides_module_idx ON module_unlock_overrides (module_id, active);

CREATE TABLE catalog_imports (
    version text PRIMARY KEY,
    content_sha256 char(64) NOT NULL,
    course_count integer NOT NULL,
    module_count integer NOT NULL,
    lesson_count integer NOT NULL,
    resource_count integer NOT NULL,
    imported_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT catalog_imports_version_nonempty CHECK (btrim(version) <> ''),
    CONSTRAINT catalog_imports_sha256_valid CHECK (content_sha256 ~ '^[0-9a-f]{64}$'),
    CONSTRAINT catalog_imports_counts_nonnegative CHECK (
      course_count >= 0 AND module_count >= 0 AND lesson_count >= 0 AND resource_count >= 0
    )
);

GRANT SELECT ON TABLE
  course_modules, module_lessons, module_resources, module_activities,
  gradebook_items, assessment_components, catalog_imports
TO lfa_app_runtime;

GRANT SELECT, INSERT, UPDATE ON TABLE
  student_module_progress, student_activity_completions, module_unlock_overrides,
  student_gradebook_scores
TO lfa_app_runtime;
