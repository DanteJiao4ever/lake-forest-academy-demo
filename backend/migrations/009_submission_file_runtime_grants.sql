-- Reassert only the least-privilege runtime access needed by the file-backed
-- submission path. This is intentionally append-only so an already-applied
-- migration checksum is never changed while repairing production ACL drift.

GRANT SELECT ON TABLE drive_submission_targets TO lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE submission_files TO lfa_app_runtime;
