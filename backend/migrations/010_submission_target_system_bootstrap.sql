-- Allow the runtime to provision the protected submission target from
-- deployment configuration without fabricating a human administrator actor.
-- Existing administrator-created targets keep the default origin and continue
-- to require a real created_by user.

ALTER TABLE drive_submission_targets
  ADD COLUMN configuration_origin text NOT NULL DEFAULT 'admin_api';

ALTER TABLE drive_submission_targets
  ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE drive_submission_targets
  ADD CONSTRAINT drive_submission_targets_configuration_origin_valid CHECK (
    (configuration_origin = 'admin_api' AND created_by IS NOT NULL)
    OR
    (configuration_origin = 'system_config' AND created_by IS NULL)
  );

COMMENT ON COLUMN drive_submission_targets.configuration_origin IS
  'admin_api requires an audited user actor; system_config is provisioned from protected deployment configuration using runtime ADC.';

-- Runtime bootstrap is insert-only and resolves conflicts with a subsequent
-- SELECT, so the existing least-privilege SELECT/INSERT grant is sufficient.
-- Reassert it here and remove mutation privileges if an earlier manual grant
-- drifted beyond the documented runtime boundary.
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE drive_submission_targets FROM lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE drive_submission_targets TO lfa_app_runtime;
