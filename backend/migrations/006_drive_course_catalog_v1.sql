-- Expand the private Drive material index so runtime-discovered files can be
-- attached to the permanent 12-module catalog without changing material IDs.

ALTER TABLE drive_materials
  ADD COLUMN module_id text REFERENCES course_modules(id) ON DELETE SET NULL;

ALTER TABLE drive_materials
  ALTER COLUMN unit_number DROP NOT NULL;

CREATE INDEX drive_materials_course_module_catalog_idx
  ON drive_materials (course_code, module_id, category, file_name, id)
  WHERE is_active = true;

-- Logical bootstrap and runtime verification are deliberately separate. The
-- configured source may exist before the runtime identity proves it can read
-- and reconcile the folder supplied through deployment configuration.
ALTER TABLE drive_sources
  ADD COLUMN configuration_origin text NOT NULL DEFAULT 'admin_api',
  ADD COLUMN verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN last_verification_at timestamptz,
  ADD COLUMN last_verification_error_code text;

ALTER TABLE drive_sources
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE drive_sources
  ADD CONSTRAINT drive_sources_configuration_origin_valid CHECK (
    (configuration_origin = 'admin_api' AND created_by IS NOT NULL)
    OR
    (configuration_origin = 'system_config' AND created_by IS NULL)
  ),
  ADD CONSTRAINT drive_sources_verification_status_valid CHECK (
    verification_status IN ('pending', 'verified', 'failed')
  );

-- Only an earlier committed runtime sync is accepted as legacy proof.
UPDATE drive_sources
   SET verification_status = 'verified',
       last_verification_at = COALESCE(last_successful_sync_at, last_sync_at)
 WHERE last_successful_sync_at IS NOT NULL;

COMMENT ON COLUMN drive_sources.configuration_origin IS
  'admin_api requires an audited user actor; system_config is provisioned from deployment configuration using runtime identity/ADC.';

COMMENT ON COLUMN drive_sources.verification_status IS
  'pending means logical bootstrap only; verified is set only after a complete runtime Drive scan commits; failed records the latest failed verification attempt.';

COMMENT ON COLUMN drive_materials.module_id IS
  'Stable course-module association parsed from an approved Module 00-11 path; NULL denotes a course-level or unclassified material.';

-- Startup bootstrap runs have no human actor and must be distinguishable from
-- manual administrator actions in the durable run ledger.
ALTER TABLE drive_sync_runs
  ALTER COLUMN requested_by DROP NOT NULL;

ALTER TABLE drive_sync_runs
  DROP CONSTRAINT drive_sync_runs_trigger_valid;

ALTER TABLE drive_sync_runs
  ADD CONSTRAINT drive_sync_runs_trigger_valid CHECK (
    trigger_type IN ('manual', 'scheduled', 'webhook', 'system_bootstrap')
  ),
  ADD CONSTRAINT drive_sync_runs_actor_by_trigger CHECK (
    (trigger_type = 'system_bootstrap' AND requested_by IS NULL)
    OR
    (trigger_type <> 'system_bootstrap' AND requested_by IS NOT NULL)
  );

-- No Drive root, file, parent-folder, or web-view identifiers are seeded by
-- this migration. Production startup provisions the configured logical source
-- and imports files only after the runtime scan passes strict preflight.
