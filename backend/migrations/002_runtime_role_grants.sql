-- Keep the login role separate from the reusable application privilege set.
-- Future migrations must grant access to each new application table explicitly;
-- broad default privileges are intentionally avoided so internal and audit
-- tables do not become writable by accident.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lfa_app_runtime') THEN
    CREATE ROLE lfa_app_runtime
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'lfa_app_runtime'
      AND (rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'lfa_app_runtime has unsafe role attributes; repair it before migrating';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'lfa_api'
      AND (NOT rolcanlogin OR NOT rolinherit OR rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'lfa_api has unsafe role attributes; repair it before migrating';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_auth_members memberships
    JOIN pg_roles members ON members.oid = memberships.member
    WHERE members.rolname IN ('lfa_app_runtime', 'lfa_api')
  ) THEN
    RAISE EXCEPTION 'runtime roles have unexpected memberships; repair them before migrating';
  END IF;
END $$;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM lfa_app_runtime;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM lfa_app_runtime;
REVOKE ALL ON SCHEMA public FROM lfa_app_runtime;
GRANT USAGE ON SCHEMA public TO lfa_app_runtime;

GRANT SELECT, INSERT ON TABLE app_users TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE auth_sessions TO lfa_app_runtime;
GRANT SELECT ON TABLE courses, teacher_course_access, assignments TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE course_enrollments TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE drive_sources TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE drive_materials TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE drive_sync_runs TO lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE drive_submission_targets TO lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE student_submissions TO lfa_app_runtime;
GRANT SELECT, INSERT ON TABLE submission_files TO lfa_app_runtime;
GRANT SELECT, INSERT, UPDATE ON TABLE submission_grades TO lfa_app_runtime;
GRANT INSERT ON TABLE audit_events TO lfa_app_runtime;
REVOKE ALL ON TABLE schema_migrations FROM lfa_app_runtime;

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO lfa_migrator;
GRANT CONNECT ON DATABASE lfa_learning TO lfa_api;
GRANT lfa_app_runtime TO lfa_api;
