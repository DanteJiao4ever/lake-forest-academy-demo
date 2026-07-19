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

