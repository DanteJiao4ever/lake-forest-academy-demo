# Lake Forest Learning API

This service is the private backend for the static Lake Forest Learning site.
It keeps identity, enrollment, submissions, grade history and authorization in
PostgreSQL and uses a school-controlled Google Drive only as private file
storage. Browser code never receives a database credential, Google credential,
Drive file ID or access token.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Create an empty PostgreSQL 14+ database.
3. Run `pnpm install`, then `pnpm migrate`.
4. Provision faculty without committing a password:

   ```powershell
   $secure = Read-Host -AsSecureString
   $env:LFA_USER_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
   pnpm create-user -- --email james.whitmore@lakeforestacademy.ca --first James --last Whitmore --role teacher --courses SCH4U,ICS4U,SPH4U,MHF4U,MCV4U,BBB4M
   ```

   For non-interactive secret-manager deployments, set `LFA_USER_PASSWORD` to
   the injected secret immediately before the command and unset it afterwards.
   Faculty creation and course grants are committed in one database transaction.

5. Run `pnpm dev`. Process and database checks are available at `/health/live`
   and `/health/ready`; `/health/upload-ready` additionally verifies ClamAV and
   the configured Drive submission root. `/health/account-security-ready`
   advertises the compatible password-change API, while
   `/health/password-reset-ready` verifies the delegated Gmail mailbox.

No user or default password is embedded in this repository. Public student
registration always creates the `student` role. Teacher and administrator roles
can only be provisioned through the trusted CLI/database deployment path.
Registration starts with no active course access. `PUT /v1/me/enrollments` is
the canonical endpoint for selecting from the six configured Grade 12 courses;
the API validates that allowlist before changing authorization.

The approved staff-only submission folder is supplied through
`SUBMISSION_TARGET_ROOT_ID` in deployment configuration. The service account
must have permission to list and add content and to move rollback files to the
trash in that exact folder inside a Shared Drive. Production startup verifies
the folder topology and these capabilities, then
idempotently creates the matching actorless system target before uploads begin.
The identifier is not placed in student-facing configuration; the existing
administrator-only target API retains its management response contract.

## Browser configuration

Configure the frontend with these HTTPS URLs:

```js
window.LFA_AUTH_CONFIG = {
  loginEndpoint: "https://api.lakeforestacademy.ca/v1/auth/login",
  registrationEndpoint: "https://api.lakeforestacademy.ca/v1/auth/register",
  passwordResetRequestEndpoint: "https://api.lakeforestacademy.ca/v1/auth/password-reset-requests",
  passwordResetEndpoint: "https://api.lakeforestacademy.ca/v1/auth/password-resets",
  passwordChangeEndpoint: "https://api.lakeforestacademy.ca/v1/auth/password-change",
  enrollmentsEndpoint: "https://api.lakeforestacademy.ca/v1/me/enrollments",
  googleWorkspaceAuthStart: "",
  workspaceSessionEndpoint: "https://api.lakeforestacademy.ca/v1/auth/session",
  workspaceLogoutEndpoint: "https://api.lakeforestacademy.ca/v1/auth/logout",
  allowDeviceAccounts: false,
};

window.LFA_DRIVE_CONFIG = {
  materialsEndpoint: "https://api.lakeforestacademy.ca/v1/materials",
  syncEndpoint: "https://api.lakeforestacademy.ca/v1/admin/drive/sources/<source-id>/sync",
  submissionsEndpoint: "https://api.lakeforestacademy.ca/v1/submissions",
  gradingEndpoint: "https://api.lakeforestacademy.ca/v1/grades",
};
```

Every frontend request uses `credentials: "include"`. The API issues an opaque,
host-only, `HttpOnly` session cookie. Production cookies are `Secure` and
`SameSite=Lax`, and their name must use the `__Host-` prefix; write requests are
also restricted to `ALLOWED_ORIGINS`.
Authentication responses return a deterministic session-bound `csrfToken`.
Keep it in `sessionStorage` and send it as `X-CSRF-Token` on authenticated
`POST`, `PUT`, `PATCH`, and `DELETE` requests. It is derived as an HMAC of the
opaque session ID using the server-only `CSRF_SECRET`; all tabs in the same
session receive the same value and PostgreSQL stores no raw CSRF token.

## Authentication API

- `POST /v1/auth/register` — personal-email student registration.
- `POST /v1/auth/login` — student or faculty login using `{email,password,portal}`.
- `GET /v1/auth/session` — restores the current cookie session.
- `POST /v1/auth/logout` — revokes the current session and clears the cookie.
- `POST /v1/auth/password-reset-requests` — accepts `{email}` and always returns
  the same `202` envelope for active and unknown accounts.
- `POST /v1/auth/password-resets` — consumes a one-time token with
  `{token,newPassword,confirmPassword}` and revokes every previous session.
- `POST /v1/auth/password-change` — requires the current cookie, CSRF token and
  `{currentPassword,newPassword,confirmPassword}`, then revokes every session.

Other browser contracts:

- `GET|PUT /v1/me/enrollments` — reads or replaces the signed-in student's
  active six-course selection.
- `POST|GET /v1/submissions` — uploads student work or lists the caller's
  authorized submission queue. Lists return one current (latest-attempt) record
  per student and assignment, with earlier attempts in `history` and `versions`.
- `GET /v1/submissions/:submissionId/files/:fileId/open` — streams an
  authorized attachment; it never redirects to a writable Drive URL.
- `PUT /v1/grades/:submissionId` — creates an immutable draft or published
  percentage-grade revision using `If-Match` and `Idempotency-Key`.
- `GET /v1/materials` and `GET /v1/materials/:materialId/open` — lists or opens
  only materials in courses the caller may access.
- `POST|GET /v1/admin/drive/sources`,
  `POST /v1/admin/drive/sources/:sourceId/sync`, and
  `GET /v1/admin/drive/sync-runs/:runId` — `teacher_admin` Drive setup and sync.
- `POST|GET /v1/admin/drive/submission-targets` — `teacher_admin` setup for the
  separate write-enabled submission root.

Successful authentication returns both a nested user and compatibility fields:

```json
{
  "authenticated": true,
  "user": {
    "id": "stu_...",
    "email": "student@example.com",
    "role": "student",
    "firstName": "Avery",
    "lastName": "Chen",
    "displayName": "Avery Chen"
  },
  "email": "student@example.com",
  "role": "student",
  "displayName": "Avery Chen"
}
```

Passwords are stored only as bcrypt hashes. Registration enforces the same
12-128 character, mixed-case, number and symbol policy shown by the frontend,
and rejects passwords containing the email local-part.

Password recovery stores only a SHA-256 digest of each random one-time token;
tokens expire after 30 minutes by default and are consumed atomically with the
password update and session revocation. Production email delivery is disabled
until `PASSWORD_RESET_MAIL_PROVIDER=gmail_api` is explicitly configured. The
service account JSON is preferably supplied through the dedicated protected
`GMAIL_SERVICE_ACCOUNT_JSON_BASE64` setting (with the existing Google
credential setting as a fallback) and must have Workspace domain-wide delegation
for `gmail.send` and `gmail.metadata`, impersonating
`GMAIL_IMPERSONATED_USER`. `PASSWORD_RESET_FROM_EMAIL` must be that same mailbox;
the readiness check verifies its Gmail profile before the frontend exposes email
recovery. The public link is set with `PASSWORD_RESET_URL`. A missing or invalid
mail configuration fails closed and never returns or emails an existing password.

## Lotus Drive mapping

The curriculum source's configured root name is
`Lotus Academy Formal Course Pilots - Text Based`; it is not hard-coded to a
folder called `Courses`. Course folders may include descriptive text, for
example `SCH4U - Chemistry`; the importer recognizes only the six configured
course codes. Within each course it recursively reads `Student_Materials` and
never enters `Administration` or `Staff_Only`. ZIP archives and Drive shortcuts
are skipped. A path containing `Unit n` maps to that unit, otherwise the
material is placed in Unit 1. Assessment/evaluation paths map to `Assessments`,
`Reading_Library` maps to `Resources`, and other student material maps to
`Lessons`. The original relative path is retained for audit and troubleshooting.
Google Docs, Sheets, Slides and Drawings are exported by the backend to DOCX,
XLSX, PPTX or PDF and streamed through the authorized material endpoint; the
browser is never redirected to a private Drive URL.

The submission target's configured root name is
`Lake Forest Learning - Student Submissions`. The API verifies that name before
writing, creates only server-generated folder/file names below it, and returns
backend `openUrl` values rather than Drive IDs.

### Bootstrap the current Drive folders

Set `CURRICULUM_DRIVE_ROOT_ID` in protected deployment configuration and share
that folder with the Cloud Run runtime service account as Viewer. The browser
bundle and repository do not contain the root or file IDs. On production
startup, the API provisions the logical system source and performs an audited,
fail-closed scan. Readiness succeeds only after all six course folders and the
required baseline Student Materials are present; an incomplete scan never
deactivates the last verified catalogue.

A `teacher_admin` can later refresh or retry verification with
`POST /v1/admin/drive/sync`. Students and teachers read only the authorized
course endpoint and open files through `/v1/materials/:id/open`; they never
receive a Drive ID or private Drive URL.

Configure `SUBMISSION_TARGET_ROOT_ID` separately for student uploads. Both
folder IDs belong in deployment configuration, not browser configuration or
source-controlled examples. `SUBMISSION_TARGET_ROOT_NAME` defaults to
`Lake Forest Learning - Student Submissions`; startup fails closed if an
existing exact-root target has conflicting status, topology, name or runtime
credential metadata, if the folder is in My Drive, or if the runtime service
cannot add children. It never silently rewrites an existing row. An exact,
active administrator-created target using runtime ADC is adopted without
changing its audit actor.

The Google Workspace OAuth start/callback endpoints are **not implemented in
this service yet**. Faculty login currently uses the same server-side bcrypt
credential and opaque cookie-session flow as student login. Adding Workspace
OAuth later should link an approved Google identity to an already provisioned
faculty user; it must not create teacher roles from arbitrary Google accounts.

## Container deployment

`Dockerfile` uses Node 24, installs production dependencies from the lockfile,
runs as UID/GID `10001`, listens on Cloud Run's `PORT` (default `8080`), and
contains no environment file or credentials. Build and validate locally with:

```bash
docker build -t lake-forest-learning-api .
docker run --rm -p 8787:8080 --env-file .env lake-forest-learning-api
```

Run migrations as a separate release/Cloud Run job using the same image with
command `node scripts/migrate.js` before directing traffic to a new revision.
Do not run schema migrations concurrently in every web instance; the migration
script uses an advisory lock, but a dedicated release job gives clearer failure
and rollback behavior.

Do not set the production browser configuration to the API host until Cloud Run,
Cloud SQL, HTTPS, CORS and `/health/ready` are working. Configure the browser
bootstrap to use `/health/ready` for authentication and database-backed course
services, and `/health/upload-ready` as the independent Drive-upload check. The
latter also verifies the Drive identity, ClamAV and submission root.
Use `COOKIE_NAME=__Host-lfa_session`, `COOKIE_SECURE=true`, and a 32-byte-or-longer
secret-manager value for `CSRF_SECRET` in the production revision.

The repository workflow `.github/workflows/deploy-backend.yml` is manual-only
and defaults to validation (`apply_changes=false`). It never creates Cloud SQL,
Artifact Registry, secrets, IAM identities, or networking. Before an approved
production run, pre-provision the named resources and set the workflow's
`GCP_*` production-environment variables. It authenticates with GitHub OIDC/WIF,
uses separate runtime and migration database secrets/service accounts, runs the
migration job, deploys a publicly invokable tagged candidate with zero minimum
and three maximum instances, probes database readiness, upload dependencies and
browser CORS on that candidate, and only then moves traffic to that exact
revision. The Cloud SQL connection uses
`INSTANCE_UNIX_SOCKET=/cloudsql/project:region:instance`; set
`DATABASE_SSL=false` because the managed Auth Proxy already encrypts it.

On Cloud Run, prefer Application Default Credentials: share only the two
approved Drive roots with `GCP_RUNTIME_SERVICE_ACCOUNT` and leave both Google
credential environment variables empty. This avoids a long-lived JSON key.

## Operational notes

- Apply `migrations/001_initial.sql` through `pnpm migrate`; migration execution
  is serialized with a PostgreSQL advisory lock.
- Store database URLs and `CSRF_SECRET` in Secret Manager. On Cloud Run, use
  the runtime service identity for Drive instead of a service-account JSON key.
- Share only the approved curriculum root and
  `Lake Forest Learning - Student Submissions` root with the service account.
  Do not grant domain-wide delegation.
- Run ClamAV and set `CLAMAV_REQUIRED=true` in production. Uploads fail closed
  if the required scanner is unavailable.
- Put the API behind HTTPS and a reverse proxy that preserves `Origin` and
  request IDs. Logs deliberately omit cookies, authorization headers, file
  contents, password fields and Google credential errors.
- The manual curriculum-sync request runs to completion in the API request so
  Cloud Run cannot suspend an untracked in-process background job. Set the
  service request timeout above the frontend's two-minute sync window. Move
  larger future libraries to Cloud Tasks or a dedicated Cloud Run Job. A new
  request marks queued runs older than five minutes and running runs older than
  thirty minutes as failed; the final database transaction also verifies that
  the run still owns the active lease before publishing material changes.
- Back up PostgreSQL. Drive is not the authorization database and cannot alone
  reconstruct grade or ownership history.

Run `pnpm test` for injectable fake-database/fake-Drive integration tests; no
production database or Google key is needed.
