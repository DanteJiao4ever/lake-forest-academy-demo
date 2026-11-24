-- Course packs are an opt-in layer for existing test sections. All release,
-- configuration and formative evidence records are append-only at runtime.
-- An owner approves a non-legacy template by exact content and policy ID.
-- The runtime can consume approvals but cannot create them.
CREATE TABLE pacing_template_approvals (
  course_code text NOT NULL REFERENCES courses(code),
  version text NOT NULL,
  manifest_sha256 text NOT NULL CHECK (manifest_sha256 ~ '^[a-f0-9]{64}$'),
  policy_id text NOT NULL,
  PRIMARY KEY (course_code, version)
);
GRANT SELECT ON pacing_template_approvals TO lfa_app_runtime;
CREATE TABLE pacing_pack_versions (
  course_code text NOT NULL REFERENCES courses(code),
  version text NOT NULL,
  manifest_sha256 text NOT NULL CHECK (manifest_sha256 ~ '^[a-f0-9]{64}$'),
  policy jsonb NOT NULL,
  PRIMARY KEY (course_code, version)
);
CREATE TABLE pacing_section_configs (
  revision bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_code text NOT NULL,
  version text NOT NULL,
  enabled boolean NOT NULL,
  mode text NOT NULL CHECK (mode IN ('mastery_gated','weekly_drip','hybrid')),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date),
  weeks int CHECK (weeks BETWEEN 1 AND 104),
  author_id uuid NOT NULL REFERENCES app_users(id),
  saved_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (course_code,version) REFERENCES pacing_pack_versions
);
CREATE INDEX pacing_section_latest ON pacing_section_configs(course_code, revision DESC);
CREATE TABLE pacing_student_configs (
  revision bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_code text NOT NULL,
  version text NOT NULL,
  student_id uuid NOT NULL REFERENCES app_users(id),
  inherit boolean NOT NULL,
  mode text CHECK (mode IN ('mastery_gated','weekly_drip','hybrid')),
  start_date date,
  end_date date,
  weeks int CHECK (weeks BETWEEN 1 AND 104),
  author_id uuid NOT NULL REFERENCES app_users(id),
  saved_at timestamptz NOT NULL DEFAULT now(),
  CHECK (inherit OR (mode IS NOT NULL AND start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date)),
  FOREIGN KEY (course_code,version) REFERENCES pacing_pack_versions
);
CREATE INDEX pacing_student_latest ON pacing_student_configs(course_code, student_id, revision DESC);
CREATE TABLE pacing_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES app_users(id),
  course_code text NOT NULL,
  version text NOT NULL,
  module_number int NOT NULL CHECK (module_number >= 0),
  kind text NOT NULL CHECK (kind IN ('exercise','checkpoint','midterm','booking')),
  item_id text NOT NULL,
  attempt_number int NOT NULL CHECK (attempt_number > 0),
  request_id uuid NOT NULL,
  payload jsonb NOT NULL,
  result jsonb NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (course_code,version) REFERENCES pacing_pack_versions,
  UNIQUE (student_id,request_id),
  UNIQUE (student_id,course_code,version,module_number,kind,item_id,attempt_number)
);
CREATE TABLE pacing_attempt_reviews (
  attempt_id uuid PRIMARY KEY REFERENCES pacing_attempts(id),
  teacher_id uuid NOT NULL REFERENCES app_users(id),
  request_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision IN ('met','revise','confirmed','declined')),
  feedback text NOT NULL,
  saved_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id,request_id)
);
GRANT SELECT, INSERT ON pacing_pack_versions, pacing_section_configs, pacing_student_configs,
  pacing_attempts, pacing_attempt_reviews TO lfa_app_runtime;
GRANT USAGE ON SEQUENCE pacing_section_configs_revision_seq, pacing_student_configs_revision_seq TO lfa_app_runtime;
