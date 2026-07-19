-- Lake Forest Academy Drive import schema (PostgreSQL 14+).
-- Apply through the backend migration system.
-- Requires pgcrypto only for UUID generation; credentials and tokens do not
-- belong in these tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE drive_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name text NOT NULL,
    drive_kind text NOT NULL,
    drive_id text,
    root_folder_id text NOT NULL,
    root_folder_name text NOT NULL DEFAULT 'Courses',
    credential_type text NOT NULL,
    credential_ref text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    change_cursor text,
    last_sync_at timestamptz,
    last_successful_sync_at timestamptz,
    created_by text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT drive_sources_display_name_nonempty
        CHECK (btrim(display_name) <> ''),
    CONSTRAINT drive_sources_kind_valid
        CHECK (drive_kind IN ('shared_drive', 'my_drive')),
    CONSTRAINT drive_sources_drive_id_by_kind
        CHECK (
            (drive_kind = 'shared_drive' AND drive_id IS NOT NULL AND btrim(drive_id) <> '')
            OR
            (drive_kind = 'my_drive' AND drive_id IS NULL)
        ),
    CONSTRAINT drive_sources_root_id_nonempty
        CHECK (btrim(root_folder_id) <> ''),
    CONSTRAINT drive_sources_root_name_courses
        CHECK (root_folder_name = 'Courses'),
    CONSTRAINT drive_sources_credential_type_valid
        CHECK (credential_type IN ('service_account', 'oauth')),
    CONSTRAINT drive_sources_credential_ref_nonempty
        CHECK (btrim(credential_ref) <> ''),
    CONSTRAINT drive_sources_status_valid
        CHECK (status IN ('active', 'disabled', 'error')),
    CONSTRAINT drive_sources_created_by_nonempty
        CHECK (btrim(created_by) <> ''),
    CONSTRAINT drive_sources_timestamps_valid
        CHECK (
            updated_at >= created_at
            AND (last_successful_sync_at IS NULL OR last_sync_at IS NULL
                 OR last_successful_sync_at <= last_sync_at)
        ),
    CONSTRAINT drive_sources_root_unique
        UNIQUE (drive_kind, root_folder_id)
);

COMMENT ON COLUMN drive_sources.credential_ref IS
    'Opaque reference to a secret-manager entry; never a key, OAuth token, client secret, or password.';
COMMENT ON COLUMN drive_sources.change_cursor IS
    'Opaque Google Drive changes cursor, advanced only after a successful committed run.';

CREATE INDEX drive_sources_status_idx
    ON drive_sources (status);

CREATE INDEX drive_sources_last_successful_sync_idx
    ON drive_sources (last_successful_sync_at DESC)
    WHERE status = 'active';

CREATE TABLE drive_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL
        REFERENCES drive_sources(id) ON DELETE RESTRICT,
    drive_file_id text NOT NULL,
    parent_folder_id text,
    course_code text NOT NULL,
    unit_number integer NOT NULL,
    category text NOT NULL,
    file_name text NOT NULL,
    relative_path text NOT NULL,
    mime_type text NOT NULL,
    drive_web_view_link text,
    drive_created_at timestamptz,
    drive_modified_at timestamptz NOT NULL,
    drive_version text,
    size_bytes bigint,
    md5_checksum text,
    is_active boolean NOT NULL DEFAULT true,
    first_seen_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    deactivated_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT drive_materials_file_id_nonempty
        CHECK (btrim(drive_file_id) <> ''),
    CONSTRAINT drive_materials_course_code_valid
        CHECK (course_code ~ '^[A-Z0-9][A-Z0-9_-]{1,23}$'),
    CONSTRAINT drive_materials_unit_number_valid
        CHECK (unit_number BETWEEN 1 AND 999),
    CONSTRAINT drive_materials_category_valid
        CHECK (category IN ('Lessons', 'Resources', 'Assignments', 'Assessments')),
    CONSTRAINT drive_materials_file_name_nonempty
        CHECK (btrim(file_name) <> ''),
    CONSTRAINT drive_materials_relative_path_valid
        CHECK (
            relative_path =
                'Courses/' || course_code || '/Unit ' || unit_number::text || '/'
                || category || '/' || file_name
        ),
    CONSTRAINT drive_materials_mime_type_nonempty
        CHECK (btrim(mime_type) <> ''),
    CONSTRAINT drive_materials_size_valid
        CHECK (size_bytes IS NULL OR size_bytes >= 0),
    CONSTRAINT drive_materials_activity_valid
        CHECK (
            (is_active = true AND deactivated_at IS NULL)
            OR
            (is_active = false AND deactivated_at IS NOT NULL)
        ),
    CONSTRAINT drive_materials_timestamps_valid
        CHECK (
            last_seen_at >= first_seen_at
            AND updated_at >= created_at
            AND (drive_created_at IS NULL OR drive_modified_at >= drive_created_at)
        ),
    CONSTRAINT drive_materials_source_file_unique
        UNIQUE (source_id, drive_file_id)
);

COMMENT ON COLUMN drive_materials.drive_web_view_link IS
    'Drive metadata only. Never treat this link as proof of authorization; authorize every open request.';

CREATE INDEX drive_materials_catalog_idx
    ON drive_materials (course_code, unit_number, category, file_name, id)
    WHERE is_active = true;

CREATE INDEX drive_materials_source_active_idx
    ON drive_materials (source_id, is_active, drive_modified_at DESC);

CREATE INDEX drive_materials_parent_folder_idx
    ON drive_materials (source_id, parent_folder_id);

CREATE INDEX drive_materials_last_seen_idx
    ON drive_materials (source_id, last_seen_at);

CREATE TABLE drive_sync_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid NOT NULL
        REFERENCES drive_sources(id) ON DELETE RESTRICT,
    idempotency_key text,
    mode text NOT NULL,
    trigger_type text NOT NULL,
    requested_by text NOT NULL,
    status text NOT NULL DEFAULT 'queued',
    cursor_before text,
    cursor_after text,
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

    CONSTRAINT drive_sync_runs_mode_valid
        CHECK (mode IN ('incremental', 'full')),
    CONSTRAINT drive_sync_runs_trigger_valid
        CHECK (trigger_type IN ('manual', 'scheduled', 'webhook')),
    CONSTRAINT drive_sync_runs_requested_by_nonempty
        CHECK (btrim(requested_by) <> ''),
    CONSTRAINT drive_sync_runs_status_valid
        CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
    CONSTRAINT drive_sync_runs_counts_nonnegative
        CHECK (
            discovered_file_count >= 0
            AND created_file_count >= 0
            AND updated_file_count >= 0
            AND deactivated_file_count >= 0
            AND skipped_file_count >= 0
        ),
    CONSTRAINT drive_sync_runs_error_state_valid
        CHECK (
            (status = 'failed' AND error_code IS NOT NULL AND error_message IS NOT NULL)
            OR
            (status <> 'failed' AND error_code IS NULL AND error_message IS NULL)
        ),
    CONSTRAINT drive_sync_runs_lifecycle_valid
        CHECK (
            (status = 'queued' AND started_at IS NULL AND finished_at IS NULL)
            OR
            (status = 'running' AND started_at IS NOT NULL AND finished_at IS NULL)
            OR
            (status IN ('succeeded', 'failed', 'cancelled')
             AND started_at IS NOT NULL AND finished_at IS NOT NULL)
        ),
    CONSTRAINT drive_sync_runs_time_order_valid
        CHECK (
            (started_at IS NULL OR started_at >= queued_at)
            AND (finished_at IS NULL OR finished_at >= started_at)
        )
);

COMMENT ON COLUMN drive_sync_runs.error_message IS
    'Redacted operational summary only; never store tokens, credentials, authorization headers, or file contents.';

CREATE UNIQUE INDEX drive_sync_runs_idempotency_unique_idx
    ON drive_sync_runs (source_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX drive_sync_runs_source_recent_idx
    ON drive_sync_runs (source_id, queued_at DESC);

CREATE INDEX drive_sync_runs_status_queued_idx
    ON drive_sync_runs (status, queued_at)
    WHERE status IN ('queued', 'running');

CREATE UNIQUE INDEX drive_sync_runs_one_active_per_source_idx
    ON drive_sync_runs (source_id)
    WHERE status IN ('queued', 'running');

-- The submission destination is deliberately separate from drive_sources.
-- Curriculum sources can be read-only while this target requires write access.
CREATE TABLE drive_submission_targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name text NOT NULL,
    drive_kind text NOT NULL,
    drive_id text,
    root_folder_id text NOT NULL,
    root_folder_name text NOT NULL DEFAULT 'Student Submissions',
    credential_type text NOT NULL,
    credential_ref text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_by text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT drive_submission_targets_display_name_nonempty
        CHECK (btrim(display_name) <> ''),
    CONSTRAINT drive_submission_targets_kind_valid
        CHECK (drive_kind IN ('shared_drive', 'my_drive')),
    CONSTRAINT drive_submission_targets_drive_id_by_kind
        CHECK (
            (drive_kind = 'shared_drive' AND drive_id IS NOT NULL AND btrim(drive_id) <> '')
            OR
            (drive_kind = 'my_drive' AND drive_id IS NULL)
        ),
    CONSTRAINT drive_submission_targets_root_id_nonempty
        CHECK (btrim(root_folder_id) <> ''),
    CONSTRAINT drive_submission_targets_root_name_valid
        CHECK (root_folder_name = 'Student Submissions'),
    CONSTRAINT drive_submission_targets_credential_type_valid
        CHECK (credential_type IN ('service_account', 'oauth')),
    CONSTRAINT drive_submission_targets_credential_ref_nonempty
        CHECK (btrim(credential_ref) <> ''),
    CONSTRAINT drive_submission_targets_status_valid
        CHECK (status IN ('active', 'disabled', 'error')),
    CONSTRAINT drive_submission_targets_created_by_nonempty
        CHECK (btrim(created_by) <> ''),
    CONSTRAINT drive_submission_targets_timestamps_valid
        CHECK (updated_at >= created_at),
    CONSTRAINT drive_submission_targets_root_unique
        UNIQUE (drive_kind, root_folder_id)
);

COMMENT ON COLUMN drive_submission_targets.credential_ref IS
    'Opaque secret-manager reference only; never a Google password, private key, OAuth token, client secret, or access token.';

CREATE INDEX drive_submission_targets_status_idx
    ON drive_submission_targets (status);

CREATE TABLE student_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id text NOT NULL,
    student_display_name text NOT NULL,
    course_code text NOT NULL,
    unit_number integer NOT NULL,
    assignment_id text NOT NULL,
    assignment_title text NOT NULL,
    attempt_number integer NOT NULL DEFAULT 1,
    status text NOT NULL DEFAULT 'submitted',
    idempotency_key text NOT NULL,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT student_submissions_student_id_nonempty
        CHECK (btrim(student_id) <> ''),
    CONSTRAINT student_submissions_student_name_nonempty
        CHECK (btrim(student_display_name) <> ''),
    CONSTRAINT student_submissions_course_code_valid
        CHECK (course_code ~ '^[A-Z0-9][A-Z0-9_-]{1,23}$'),
    CONSTRAINT student_submissions_unit_number_valid
        CHECK (unit_number BETWEEN 1 AND 999),
    CONSTRAINT student_submissions_assignment_id_valid
        CHECK (
            char_length(assignment_id) BETWEEN 1 AND 100
            AND assignment_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'
        ),
    CONSTRAINT student_submissions_assignment_title_nonempty
        CHECK (btrim(assignment_title) <> ''),
    CONSTRAINT student_submissions_attempt_number_valid
        CHECK (attempt_number BETWEEN 1 AND 99),
    CONSTRAINT student_submissions_status_valid
        CHECK (status IN ('submitted', 'rejected', 'withdrawn')),
    CONSTRAINT student_submissions_idempotency_key_nonempty
        CHECK (btrim(idempotency_key) <> ''),
    CONSTRAINT student_submissions_lifecycle_valid
        CHECK (
            (status = 'withdrawn' AND withdrawn_at IS NOT NULL)
            OR
            (status <> 'withdrawn' AND withdrawn_at IS NULL)
        ),
    CONSTRAINT student_submissions_timestamps_valid
        CHECK (
            submitted_at >= created_at
            AND updated_at >= created_at
            AND (withdrawn_at IS NULL OR withdrawn_at >= submitted_at)
        ),
    CONSTRAINT student_submissions_attempt_unique
        UNIQUE (student_id, course_code, assignment_id, attempt_number),
    CONSTRAINT student_submissions_idempotency_unique
        UNIQUE (student_id, idempotency_key)
);

COMMENT ON COLUMN student_submissions.student_id IS
    'Opaque school identity derived from the authenticated session; never accepted from a student upload form.';
COMMENT ON COLUMN student_submissions.idempotency_key IS
    'Required upload idempotency key scoped to the authenticated student.';

CREATE INDEX student_submissions_teacher_queue_idx
    ON student_submissions (
        course_code,
        student_display_name,
        student_id,
        unit_number,
        submitted_at DESC
    )
    WHERE status = 'submitted';

CREATE INDEX student_submissions_student_recent_idx
    ON student_submissions (student_id, submitted_at DESC);

CREATE TABLE submission_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL
        REFERENCES student_submissions(id) ON DELETE RESTRICT,
    target_id uuid NOT NULL
        REFERENCES drive_submission_targets(id) ON DELETE RESTRICT,
    drive_file_id text NOT NULL,
    drive_parent_folder_id text NOT NULL,
    original_file_name text NOT NULL,
    stored_file_name text NOT NULL,
    relative_path text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    sha256_checksum text NOT NULL,
    drive_md5_checksum text,
    drive_web_view_link text,
    drive_version text,
    drive_created_at timestamptz NOT NULL,
    drive_modified_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT submission_files_drive_file_id_nonempty
        CHECK (btrim(drive_file_id) <> ''),
    CONSTRAINT submission_files_parent_id_nonempty
        CHECK (btrim(drive_parent_folder_id) <> ''),
    CONSTRAINT submission_files_original_name_nonempty
        CHECK (btrim(original_file_name) <> ''),
    CONSTRAINT submission_files_stored_name_nonempty
        CHECK (btrim(stored_file_name) <> ''),
    CONSTRAINT submission_files_relative_path_nonempty
        CHECK (btrim(relative_path) <> ''),
    CONSTRAINT submission_files_mime_type_nonempty
        CHECK (btrim(mime_type) <> ''),
    CONSTRAINT submission_files_size_positive
        CHECK (size_bytes > 0),
    CONSTRAINT submission_files_sha256_valid
        CHECK (sha256_checksum ~ '^[0-9a-f]{64}$'),
    CONSTRAINT submission_files_drive_md5_valid
        CHECK (
            drive_md5_checksum IS NULL
            OR drive_md5_checksum ~ '^[0-9a-f]{32}$'
        ),
    CONSTRAINT submission_files_drive_timestamps_valid
        CHECK (drive_modified_at >= drive_created_at),
    CONSTRAINT submission_files_drive_identity_unique
        UNIQUE (target_id, drive_file_id)
);

COMMENT ON COLUMN submission_files.drive_web_view_link IS
    'Private Drive metadata only. API responses return an authorized backend openUrl, not this value.';
COMMENT ON COLUMN submission_files.sha256_checksum IS
    'Server-computed digest used for upload idempotency and integrity checks.';

CREATE INDEX submission_files_submission_idx
    ON submission_files (submission_id, created_at, id);

CREATE INDEX submission_files_parent_idx
    ON submission_files (target_id, drive_parent_folder_id);

-- Grades are append-only revisions. Exactly one revision per submission can be
-- current; only a current revision with published_at is visible to a student.
CREATE TABLE submission_grades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL
        REFERENCES student_submissions(id) ON DELETE RESTRICT,
    version integer NOT NULL,
    score smallint NOT NULL,
    feedback text NOT NULL DEFAULT '',
    graded_by text NOT NULL,
    idempotency_key text NOT NULL,
    is_current boolean NOT NULL DEFAULT true,
    graded_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT submission_grades_version_valid
        CHECK (version >= 1),
    CONSTRAINT submission_grades_score_percentage
        CHECK (score BETWEEN 0 AND 100),
    CONSTRAINT submission_grades_feedback_length
        CHECK (char_length(feedback) <= 10000),
    CONSTRAINT submission_grades_graded_by_nonempty
        CHECK (btrim(graded_by) <> ''),
    CONSTRAINT submission_grades_idempotency_key_nonempty
        CHECK (btrim(idempotency_key) <> ''),
    CONSTRAINT submission_grades_publish_time_valid
        CHECK (published_at IS NULL OR published_at >= graded_at),
    CONSTRAINT submission_grades_created_time_valid
        CHECK (graded_at >= created_at),
    CONSTRAINT submission_grades_version_unique
        UNIQUE (submission_id, version),
    CONSTRAINT submission_grades_grader_idempotency_unique
        UNIQUE (graded_by, idempotency_key)
);

COMMENT ON COLUMN submission_grades.score IS
    'Integer percentage from 0 through 100 inclusive.';
COMMENT ON COLUMN submission_grades.feedback IS
    'Plain-text feedback. Render as text, never as trusted HTML.';

CREATE UNIQUE INDEX submission_grades_one_current_idx
    ON submission_grades (submission_id)
    WHERE is_current = true;

CREATE INDEX submission_grades_student_visible_idx
    ON submission_grades (submission_id, published_at DESC)
    WHERE is_current = true AND published_at IS NOT NULL;

CREATE INDEX submission_grades_grader_recent_idx
    ON submission_grades (graded_by, graded_at DESC);
