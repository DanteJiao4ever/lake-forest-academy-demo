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
   pnpm create-user -- --email james.whitmore@example.invalid --first James --last Whitmore --role teacher --courses SCH4U,ICS4U,SPH4U,MHF4U,MCV4U,BBB4M
   ```

   For non-interactive secret-manager deployments, set `LFA_USER_PASSWORD` to
   the injected secret immediately before the command and unset it afterwards.

5. Run `pnpm dev`. Health checks are available at `/health/live` and
   `/health/ready`.

No user or default password is embedded in this repository. Public student
registration always creates the `student` role. Teacher and administrator roles
can only be provisioned through the trusted CLI/database deployment path.
Registration starts with no active course access. `PUT /v1/me/enrollments` is
the canonical endpoint for selecting from the six configured Grade 12 courses;
the API validates that allowlist before changing authorization.

The approved staff-only submission folder is identified by
`SUBMISSION_TARGET_ROOT_ID=1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK`. A Drive folder
ID is navigation/configuration metadata rather than a secret, but it still does
not grant access: the service account must be shared onto that exact folder and
the API must create an active submission-target record before uploads begin.

## Browser configuration

Configure the frontend with these HTTPS URLs:

```js
window.LFA_AUTH_CONFIG = {
  loginEndpoint: "https://api.lakeforestacademy.ca/v1/auth/login",
  registrationEndpoint: "https://api.lakeforestacademy.ca/v1/auth/register",
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

Provision a `teacher_admin` with the CLI above (change `--role`), sign in, then
create the two records once. The current curriculum root ID is
`1gwLFDrzh77HkYIV68mCErKkBbHEmikrG`; the submission root ID is
`1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK`. Folder IDs are not secrets. Cookie and
CSRF values below are temporary local shell variables and must not be logged:

```bash
API=https://api.lakeforestacademy.ca
ORIGIN=https://lakeforestacademy.ca

AUTH=$(curl --silent --show-error --fail \
  --cookie-jar /tmp/lfa-cookie \
  -H "Origin: $ORIGIN" -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.invalid","password":"<read-from-secret-manager>","portal":"faculty"}' \
  "$API/v1/auth/login")
CSRF=$(printf '%s' "$AUTH" | jq -r .csrfToken)

SOURCE=$(curl --silent --show-error --fail \
  --cookie /tmp/lfa-cookie -H "Origin: $ORIGIN" \
  -H "X-CSRF-Token: $CSRF" -H 'Content-Type: application/json' \
  -d '{
    "displayName":"Lotus formal course pilots",
    "driveKind":"my_drive",
    "driveId":null,
    "rootFolderId":"1gwLFDrzh77HkYIV68mCErKkBbHEmikrG",
    "rootFolderName":"Lotus Academy Formal Course Pilots - Text Based",
    "credentialType":"service_account",
    "credentialRef":"env://GOOGLE_SERVICE_ACCOUNT_JSON_BASE64"
  }' "$API/v1/admin/drive/sources")
SOURCE_ID=$(printf '%s' "$SOURCE" | jq -r .data.id)

curl --silent --show-error --fail \
  --cookie /tmp/lfa-cookie -H "Origin: $ORIGIN" \
  -H "X-CSRF-Token: $CSRF" -H 'Content-Type: application/json' \
  -d '{
    "displayName":"Lake Forest student submissions",
    "driveKind":"my_drive",
    "driveId":null,
    "rootFolderId":"1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK",
    "rootFolderName":"Lake Forest Learning - Student Submissions",
    "credentialType":"service_account",
    "credentialRef":"env://GOOGLE_SERVICE_ACCOUNT_JSON_BASE64"
  }' "$API/v1/admin/drive/submission-targets"

curl --silent --show-error --fail \
  --cookie /tmp/lfa-cookie -H "Origin: $ORIGIN" \
  -H "X-CSRF-Token: $CSRF" -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: first-lotus-full-sync-2026-07' \
  -d '{"mode":"full"}' "$API/v1/admin/drive/sources/$SOURCE_ID/sync"

rm -f /tmp/lfa-cookie
unset AUTH CSRF SOURCE SOURCE_ID
```

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
Cloud SQL, the Drive identity, HTTPS, CORS and both health checks are working.
Use `COOKIE_NAME=__Host-lfa_session`, `COOKIE_SECURE=true`, and a 32-byte-or-longer
secret-manager value for `CSRF_SECRET` in the production revision.

## Operational notes

- Apply `migrations/001_initial.sql` through `pnpm migrate`; migration execution
  is serialized with a PostgreSQL advisory lock.
- Store the service-account JSON and `DATABASE_URL` in the hosting platform's
  secret manager. Prefer workload identity over a JSON key when available.
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
