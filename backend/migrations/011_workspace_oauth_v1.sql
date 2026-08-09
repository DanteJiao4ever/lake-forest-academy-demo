-- Google Workspace sign-in is available only to pre-provisioned faculty.
-- OAuth authorization codes and Google tokens are never persisted.

CREATE TABLE workspace_oauth_transactions (
    id uuid PRIMARY KEY,
    state_hash char(64) NOT NULL UNIQUE,
    browser_secret_hash char(64) NOT NULL UNIQUE,
    return_route text NOT NULL,
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workspace_oauth_transactions_state_hash_valid
      CHECK (state_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT workspace_oauth_transactions_browser_hash_valid
      CHECK (browser_secret_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT workspace_oauth_transactions_return_route_valid
      CHECK (return_route IN ('teacher/dashboard')),
    CONSTRAINT workspace_oauth_transactions_expiry_valid
      CHECK (expires_at > created_at),
    CONSTRAINT workspace_oauth_transactions_consumed_valid
      CHECK (consumed_at IS NULL OR consumed_at >= created_at)
);

CREATE INDEX workspace_oauth_transactions_active_expiry_idx
  ON workspace_oauth_transactions (expires_at)
  WHERE consumed_at IS NULL;

CREATE TABLE workspace_identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL DEFAULT 'google_workspace',
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    issuer text NOT NULL,
    subject text NOT NULL,
    email_at_binding citext NOT NULL,
    last_verified_email citext NOT NULL,
    hosted_domain_at_binding text NOT NULL,
    bound_at timestamptz NOT NULL DEFAULT now(),
    last_authenticated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT workspace_identities_provider_user_unique
      UNIQUE (provider, user_id),
    CONSTRAINT workspace_identities_issuer_subject_unique
      UNIQUE (provider, issuer, subject),
    CONSTRAINT workspace_identities_provider_valid
      CHECK (provider = 'google_workspace'),
    CONSTRAINT workspace_identities_issuer_nonempty
      CHECK (btrim(issuer) <> ''),
    CONSTRAINT workspace_identities_subject_nonempty
      CHECK (btrim(subject) <> ''),
    CONSTRAINT workspace_identities_email_nonempty
      CHECK (
        btrim(email_at_binding::text) <> '' AND
        btrim(last_verified_email::text) <> ''
      ),
    CONSTRAINT workspace_identities_domain_nonempty
      CHECK (btrim(hosted_domain_at_binding) <> '')
);

CREATE FUNCTION prevent_workspace_identity_rebinding()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.issuer IS DISTINCT FROM OLD.issuer
     OR NEW.subject IS DISTINCT FROM OLD.subject
     OR NEW.email_at_binding IS DISTINCT FROM OLD.email_at_binding
     OR NEW.hosted_domain_at_binding IS DISTINCT FROM OLD.hosted_domain_at_binding
  THEN
    RAISE EXCEPTION 'Workspace identity bindings are immutable'
      USING ERRCODE = '23000';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER workspace_identities_prevent_rebinding
BEFORE UPDATE ON workspace_identities
FOR EACH ROW EXECUTE FUNCTION prevent_workspace_identity_rebinding();

COMMENT ON TABLE workspace_oauth_transactions IS
  'One-time, short-lived Workspace OAuth grants. Raw authorization codes and Google tokens are never stored.';

COMMENT ON TABLE workspace_identities IS
  'Immutable Google issuer/subject bindings for pre-provisioned active faculty accounts.';

GRANT SELECT, INSERT, DELETE
  ON TABLE workspace_oauth_transactions TO lfa_app_runtime;

GRANT UPDATE (consumed_at)
  ON TABLE workspace_oauth_transactions TO lfa_app_runtime;

GRANT SELECT, INSERT
  ON TABLE workspace_identities TO lfa_app_runtime;

GRANT UPDATE (last_verified_email, last_authenticated_at)
  ON TABLE workspace_identities TO lfa_app_runtime;
