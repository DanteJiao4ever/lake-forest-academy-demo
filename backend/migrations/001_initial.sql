-- Lake Forest Learning API — PostgreSQL 14+
-- Secrets, password plaintext, cookies and Google tokens never belong here.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE app_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id text NOT NULL UNIQUE,
    email citext NOT NULL UNIQUE,
    password_hash text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    display_name text NOT NULL,
    role text NOT NULL DEFAULT 'student',
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT app_users_public_id_nonempty CHECK (btrim(public_id) <> ''),
    CONSTRAINT app_users_email_nonempty CHECK (btrim(email::text) <> ''),
    CONSTRAINT app_users_names_nonempty CHECK (
        btrim(first_name) <> '' AND btrim(last_name) <> '' AND btrim(display_name) <> ''
    ),
    CONSTRAINT app_users_role_valid CHECK (role IN ('student', 'teacher', 'teacher_admin')),
    CONSTRAINT app_users_status_valid CHECK (status IN ('active', 'disabled')),
    CONSTRAINT app_users_auth_method CHECK (password_hash IS NOT NULL)
);

CREATE INDEX app_users_role_status_idx ON app_users (role, status);

CREATE TABLE auth_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash char(64) NOT NULL UNIQUE,
    csrf_token_hash char(64) NOT NULL,
    expires_at timestamptz NOT NULL,
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT auth_sessions_token_hash_valid CHECK (token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT auth_sessions_csrf_hash_valid CHECK (csrf_token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT auth_sessions_expiry_valid CHECK (expires_at > created_at)
);

CREATE INDEX auth_sessions_user_idx ON auth_sessions (user_id, expires_at DESC);
CREATE INDEX auth_sessions_expiry_idx ON auth_sessions (expires_at);

CREATE TABLE courses (
    code text PRIMARY KEY,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT courses_code_valid CHECK (code ~ '^[A-Z0-9][A-Z0-9_-]{1,23}$'),
    CONSTRAINT courses_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT courses_status_valid CHECK (status IN ('active', 'archived'))
);

INSERT INTO courses (code, title) VALUES
    ('SCH4U', 'Chemistry'),
    ('ICS4U', 'Computer Science'),
    ('SPH4U', 'Physics'),
    ('MHF4U', 'Advanced Functions'),
    ('MCV4U', 'Calculus and Vectors'),
    ('BBB4M', 'International Business Fundamentals')
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title;

CREATE TABLE course_enrollments (
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'active',
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_user_id, course_code),
    CONSTRAINT course_enrollments_status_valid CHECK (status IN ('active', 'dropped', 'completed'))
);

CREATE INDEX course_enrollments_course_idx ON course_enrollments (course_code, status);

CREATE TABLE teacher_course_access (
    teacher_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (teacher_user_id, course_code)
);

CREATE TABLE assignments (
    id text PRIMARY KEY,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    unit_number integer NOT NULL,
    title text NOT NULL,
    max_attempts integer NOT NULL DEFAULT 99,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT assignments_id_valid CHECK (
        char_length(id) BETWEEN 1 AND 100 AND id ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'
    ),
    CONSTRAINT assignments_unit_valid CHECK (unit_number BETWEEN 1 AND 999),
    CONSTRAINT assignments_title_nonempty CHECK (btrim(title) <> ''),
    CONSTRAINT assignments_attempts_valid CHECK (max_attempts BETWEEN 1 AND 99),
    CONSTRAINT assignments_status_valid CHECK (status IN ('active', 'closed', 'archived'))
);

CREATE INDEX assignments_course_unit_idx ON assignments (course_code, unit_number, status);

INSERT INTO assignments (id, course_code, unit_number, title) VALUES
    ('a1', 'MHF4U', 2, 'Quadratic Models Investigation'),
    ('a4', 'MHF4U', 4, 'Trigonometric Proof Portfolio'),
    ('sch4u-u1-assessment', 'SCH4U', 1, 'Organic Compound Impact Brief'),
    ('ics4u-u2-assessment', 'ICS4U', 2, 'Software Project Planning Package'),
    ('sph4u-u2-assessment', 'SPH4U', 2, 'Conservation Investigation'),
    ('mcv4u-u2-assessment', 'MCV4U', 2, 'Optimization Model'),
    ('bbb4m-u4-assessment', 'BBB4M', 4, 'International Market-Entry Proposal')
ON CONFLICT (id) DO UPDATE SET
    course_code = EXCLUDED.course_code,
    unit_number = EXCLUDED.unit_number,
    title = EXCLUDED.title,
    updated_at = now();

CREATE TABLE drive_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name text NOT NULL,
    drive_kind text NOT NULL,
    drive_id text,
    root_folder_id text NOT NULL,
    root_folder_name text NOT NULL DEFAULT 'Lotus Academy Formal Course Pilots - Text Based',
    credential_type text NOT NULL,
    credential_ref text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    change_cursor text,
    last_sync_at timestamptz,
    last_successful_sync_at timestamptz,
    created_by uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT drive_sources_display_name_nonempty CHECK (btrim(display_name) <> ''),
    CONSTRAINT drive_sources_kind_valid CHECK (drive_kind IN ('shared_drive', 'my_drive')),
    CONSTRAINT drive_sources_drive_id_by_kind CHECK (
        (drive_kind = 'shared_drive' AND drive_id IS NOT NULL AND btrim(drive_id) <> '') OR
        (drive_kind = 'my_drive' AND drive_id IS NULL)
    ),
    CONSTRAINT drive_sources_root_id_nonempty CHECK (btrim(root_folder_id) <> ''),
    CONSTRAINT drive_sources_root_name_nonempty CHECK (btrim(root_folder_name) <> ''),
    CONSTRAINT drive_sources_credential_type_valid CHECK (credential_type IN ('service_account', 'oauth')),
    CONSTRAINT drive_sources_credential_ref_nonempty CHECK (btrim(credential_ref) <> ''),
    CONSTRAINT drive_sources_status_valid CHECK (status IN ('active', 'disabled', 'error')),
    CONSTRAINT drive_sources_root_unique UNIQUE (drive_kind, root_folder_id)
);

COMMENT ON COLUMN drive_sources.credential_ref IS
    'Opaque secret-manager reference; never a key, OAuth token, client secret or password.';

CREATE TABLE drive_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL REFERENCES drive_sources(id) ON DELETE RESTRICT,
    drive_file_id text NOT NULL,
    parent_folder_id text,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    unit_number integer NOT NULL,
    category text NOT NULL,
    file_name text NOT NULL,
    relative_path text NOT NULL,
    mime_type text NOT NULL,
    drive_web_view_link text,
    drive_modified_at timestamptz NOT NULL,
    size_bytes bigint,
    is_active boolean NOT NULL DEFAULT true,
    first_seen_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    deactivated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT drive_materials_unit_valid CHECK (unit_number BETWEEN 1 AND 999),
    CONSTRAINT drive_materials_category_valid CHECK (category IN ('Lessons', 'Resources', 'Assignments', 'Assessments')),
    CONSTRAINT drive_materials_size_valid CHECK (size_bytes IS NULL OR size_bytes >= 0),
    CONSTRAINT drive_materials_activity_valid CHECK (
        (is_active AND deactivated_at IS NULL) OR (NOT is_active AND deactivated_at IS NOT NULL)
    ),
    CONSTRAINT drive_materials_source_file_unique UNIQUE (source_id, drive_file_id)
);

CREATE INDEX drive_materials_catalog_idx
    ON drive_materials (course_code, unit_number, category, file_name, id)
    WHERE is_active = true;

CREATE TABLE drive_sync_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL REFERENCES drive_sources(id) ON DELETE RESTRICT,
    idempotency_key text,
    mode text NOT NULL,
    trigger_type text NOT NULL DEFAULT 'manual',
    requested_by uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'queued',
    discovered_file_count integer NOT NULL DEFAULT 0,
    created_file_count integer NOT NULL DEFAULT 0,
    updated_file_count integer NOT NULL DEFAULT 0,
    deactivated_file_count integer NOT NULL DEFAULT 0,
    skipped_file_count integer NOT NULL DEFAULT 0,
    error_code text,
    error_message text,
    queued_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz,
    finished_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT drive_sync_runs_mode_valid CHECK (mode IN ('incremental', 'full')),
    CONSTRAINT drive_sync_runs_trigger_valid CHECK (trigger_type IN ('manual', 'scheduled', 'webhook')),
    CONSTRAINT drive_sync_runs_status_valid CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
    CONSTRAINT drive_sync_runs_counts_nonnegative CHECK (
        discovered_file_count >= 0 AND created_file_count >= 0 AND
        updated_file_count >= 0 AND deactivated_file_count >= 0 AND skipped_file_count >= 0
    )
);

CREATE UNIQUE INDEX drive_sync_runs_idempotency_idx
    ON drive_sync_runs (source_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX drive_sync_runs_one_active_idx
    ON drive_sync_runs (source_id) WHERE status IN ('queued', 'running');

CREATE TABLE drive_submission_targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name text NOT NULL,
    drive_kind text NOT NULL,
    drive_id text,
    root_folder_id text NOT NULL,
    root_folder_name text NOT NULL DEFAULT 'Lake Forest Learning - Student Submissions',
    credential_type text NOT NULL,
    credential_ref text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_by uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT submission_targets_name_nonempty CHECK (btrim(display_name) <> ''),
    CONSTRAINT submission_targets_kind_valid CHECK (drive_kind IN ('shared_drive', 'my_drive')),
    CONSTRAINT submission_targets_drive_id_by_kind CHECK (
        (drive_kind = 'shared_drive' AND drive_id IS NOT NULL AND btrim(drive_id) <> '') OR
        (drive_kind = 'my_drive' AND drive_id IS NULL)
    ),
    CONSTRAINT submission_targets_root_name_nonempty CHECK (btrim(root_folder_name) <> ''),
    CONSTRAINT submission_targets_credential_type CHECK (credential_type IN ('service_account', 'oauth')),
    CONSTRAINT submission_targets_status CHECK (status IN ('active', 'disabled', 'error')),
    CONSTRAINT submission_targets_root_unique UNIQUE (drive_kind, root_folder_id)
);

CREATE TABLE student_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    student_id text NOT NULL,
    student_display_name text NOT NULL,
    course_code text NOT NULL REFERENCES courses(code) ON DELETE RESTRICT,
    unit_number integer NOT NULL,
    assignment_id text NOT NULL REFERENCES assignments(id) ON DELETE RESTRICT,
    assignment_title text NOT NULL,
    attempt_number integer NOT NULL DEFAULT 1,
    note text NOT NULL DEFAULT '',
    integrity_confirmed boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'submitted',
    idempotency_key text NOT NULL,
    request_fingerprint char(64) NOT NULL,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT submissions_unit_valid CHECK (unit_number BETWEEN 1 AND 999),
    CONSTRAINT submissions_attempt_valid CHECK (attempt_number BETWEEN 1 AND 99),
    CONSTRAINT submissions_note_length CHECK (char_length(note) <= 10000),
    CONSTRAINT submissions_integrity_required CHECK (integrity_confirmed),
    CONSTRAINT submissions_status_valid CHECK (status IN ('submitted', 'rejected', 'withdrawn')),
    CONSTRAINT submissions_fingerprint_valid CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
    CONSTRAINT submissions_attempt_unique UNIQUE (student_user_id, course_code, assignment_id, attempt_number),
    CONSTRAINT submissions_idempotency_unique UNIQUE (student_user_id, idempotency_key)
);

CREATE INDEX submissions_teacher_queue_idx
    ON student_submissions (course_code, student_display_name, unit_number, submitted_at DESC)
    WHERE status = 'submitted';
CREATE INDEX submissions_student_recent_idx
    ON student_submissions (student_user_id, submitted_at DESC);
CREATE INDEX submissions_assignment_history_idx
    ON student_submissions
       (student_user_id, course_code, assignment_id, attempt_number DESC, submitted_at DESC);

CREATE TABLE submission_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES student_submissions(id) ON DELETE RESTRICT,
    target_id uuid NOT NULL REFERENCES drive_submission_targets(id) ON DELETE RESTRICT,
    drive_file_id text NOT NULL,
    drive_parent_folder_id text NOT NULL,
    original_file_name text NOT NULL,
    stored_file_name text NOT NULL,
    relative_path text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    sha256_checksum char(64) NOT NULL,
    drive_web_view_link text,
    drive_created_at timestamptz NOT NULL,
    drive_modified_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT submission_files_size_positive CHECK (size_bytes > 0),
    CONSTRAINT submission_files_sha256_valid CHECK (sha256_checksum ~ '^[0-9a-f]{64}$'),
    CONSTRAINT submission_files_drive_identity_unique UNIQUE (target_id, drive_file_id)
);

CREATE INDEX submission_files_submission_idx ON submission_files (submission_id, created_at, id);

CREATE TABLE submission_grades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES student_submissions(id) ON DELETE RESTRICT,
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
    CONSTRAINT grades_version_valid CHECK (version >= 1),
    CONSTRAINT grades_score_percentage CHECK (score BETWEEN 0 AND 100),
    CONSTRAINT grades_feedback_length CHECK (char_length(feedback) <= 10000),
    CONSTRAINT grades_fingerprint_valid CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
    CONSTRAINT grades_version_unique UNIQUE (submission_id, version),
    CONSTRAINT grades_grader_idempotency_unique UNIQUE (graded_by_user_id, idempotency_key)
);

CREATE UNIQUE INDEX grades_one_current_idx ON submission_grades (submission_id) WHERE is_current = true;
CREATE INDEX grades_student_visible_idx
    ON submission_grades (submission_id, published_at DESC)
    WHERE is_current = true AND published_at IS NOT NULL;

CREATE TABLE audit_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id text NOT NULL,
    actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    outcome text NOT NULL,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT audit_action_nonempty CHECK (btrim(action) <> ''),
    CONSTRAINT audit_outcome_valid CHECK (outcome IN ('success', 'denied', 'failed'))
);

CREATE INDEX audit_events_actor_recent_idx ON audit_events (actor_user_id, created_at DESC);
CREATE INDEX audit_events_resource_recent_idx ON audit_events (resource_type, resource_id, created_at DESC);

-- Explicitly remove secrets from the default application role's reach if the
-- deployment uses separate owner/runtime roles. The deployment may add its own
-- GRANT statements after creating a least-privileged runtime role.
COMMENT ON COLUMN drive_submission_targets.credential_ref IS
    'Opaque secret-manager reference only; never a Google password, key or token.';
COMMENT ON COLUMN student_submissions.student_id IS
    'Opaque public identity derived from the authenticated user.';
COMMENT ON COLUMN submission_files.drive_file_id IS
    'Private storage metadata; API responses expose only an authorized backend openUrl.';
