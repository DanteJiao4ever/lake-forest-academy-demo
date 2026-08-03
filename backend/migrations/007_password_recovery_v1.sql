-- Password recovery stores only SHA-256 token digests. Raw reset tokens exist
-- only long enough to be placed in the one-time email link.

CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    token_hash char(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT password_reset_tokens_hash_valid
      CHECK (token_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT password_reset_tokens_expiry_valid
      CHECK (expires_at > created_at),
    CONSTRAINT password_reset_tokens_consumed_valid
      CHECK (consumed_at IS NULL OR consumed_at >= created_at)
);

CREATE INDEX password_reset_tokens_user_recent_idx
  ON password_reset_tokens (user_id, created_at DESC);

CREATE INDEX password_reset_tokens_active_expiry_idx
  ON password_reset_tokens (expires_at)
  WHERE consumed_at IS NULL;

COMMENT ON TABLE password_reset_tokens IS
  'One-time, short-lived password reset grants. token_hash is SHA-256; raw tokens are never persisted.';

GRANT SELECT, INSERT, UPDATE ON TABLE password_reset_tokens TO lfa_app_runtime;

-- The runtime may change only password material and its audit timestamp on the
-- user row. Identity, role, status, and profile columns remain read-only.
GRANT UPDATE (password_hash, updated_at) ON TABLE app_users TO lfa_app_runtime;
