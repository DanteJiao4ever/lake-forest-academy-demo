# Lake Forest Academy — Lotus Drive import contract

This document defines the contract for importing learning materials from
Lotus's Google Drive into the Lake Forest Academy learning platform.

The current website is a static React/Vite site hosted on GitHub Pages. GitHub
Pages cannot safely hold Google credentials, run scheduled jobs, receive Drive
webhooks, or connect directly to PostgreSQL. A separately deployed HTTPS
backend must own Google authentication, Drive synchronization, database access,
authorization, rate limiting, and audit logs. The browser calls that backend
only.

## Recommended architecture

```text
Lotus / school Google Drive
          |
          | Drive API (server-side credential)
          v
Lake Forest Academy import API ---- PostgreSQL
          ^
          | HTTPS + authenticated school session
          |
Static GitHub Pages learning platform
```

The import API should run under a school-controlled domain such as
`https://api.lakeforestacademy.ca`. Allow CORS only from the production Lake
Forest Academy site and approved local development origins. Teacher/admin
endpoints must require an authenticated school role; a folder ID is not an
authorization mechanism.

## Lotus Drive setup

### Current source selected in the learning portal

The faculty portal currently links to the existing
`OSSD 60 Course Video Library` folder:

`https://drive.google.com/drive/folders/1smgTU600k-yCgkEDW3jBKLG3FrbzlHKe`

The folder already contains the platform's active MHF4U, SBI4U, and ENG4U
course folders. This link is navigation metadata only; it does not grant access.
Automatic indexing remains disabled until the authenticated backend endpoints
are configured.

### Preferred: school Shared Drive

1. A Google Workspace administrator creates a Shared Drive owned by Lake
   Forest Academy, for example `Lake Forest Academy Learning Materials`.
2. Inside it, Lotus creates the root folder `Courses`.
3. Add the backend service-account email as a member with the least-privileged
   role that can read the content. Use write access only if a later feature
   explicitly needs it.
4. Record the Shared Drive ID and `Courses` folder ID in the backend
   configuration. A folder ID may also be shown in the frontend for navigation,
   but the backend must never trust it as authorization.

Shared Drive is preferred because the school, rather than an individual
account, owns the files. Removing or disabling Lotus's account will not orphan
the curriculum.

### Transitional option: Lotus's My Drive

1. Lotus creates the root folder `Courses` in My Drive.
2. Lotus shares only that folder with the backend service-account email as
   Viewer.
3. The backend imports only descendants of that configured root folder.
4. Before Lotus's account changes or is disabled, migrate the materials to a
   school Shared Drive and update the source through the admin API.

For a My Drive source, do not grant domain-wide access and do not share Lotus's
entire Drive. Google shortcuts should be resolved only when their target is
inside the configured root; external shortcut targets should be rejected and
reported in the sync run.

## Folder convention

The importer accepts this exact hierarchy:

```text
Courses/
  {course code}/
    Unit {n}/
      Lessons/
      Resources/
      Assignments/
      Assessments/
```

Example:

```text
Courses/
  MHF4U/
    Unit 1/
      Lessons/
        Function transformations.pdf
      Resources/
        Formula reference.docx
      Assignments/
        Unit 1 practice set.pdf
      Assessments/
        Unit 1 rubric.pdf
```

Rules:

- `{course code}` is uppercase letters, digits, `_`, or `-`, 2–24 characters
  (for example `MHF4U` or `SBI4U`).
- Unit folders match `Unit {n}`, where `{n}` is an integer from 1 to 999.
- Category names are exactly `Lessons`, `Resources`, `Assignments`, or
  `Assessments`.
- Files outside this hierarchy are skipped and counted in
  `skipped_file_count`; they are not silently assigned to a course.
- Folder names are organizational metadata and are not imported as materials.
- A Google file ID is the stable identity. Renaming or moving a file updates
  the same database record.
- A file removed from the root, trashed, or deleted is soft-deleted by setting
  `is_active = false`; historical sync records remain.
- Native Google Docs, Sheets, and Slides remain links to the Drive item unless
  the backend deliberately implements a controlled export format.

## Authentication and secret handling

Use one of these server-side approaches:

### Service account

Recommended for a school Shared Drive and for a My Drive folder explicitly
shared with the service account.

- Grant the service account access only to the Shared Drive or root folder.
- Prefer workload identity / attached runtime identity when the hosting
  platform supports it.
- If a JSON key is unavoidable, store it in the hosting provider's secret
  manager, rotate it, and never commit it.
- Domain-wide delegation is not required for this design and should remain
  disabled unless a separately reviewed requirement proves otherwise.

### OAuth 2.0

Use when Lake Forest Academy requires Lotus to connect interactively.

- The backend starts the authorization-code flow with PKCE and a validated
  `state` value.
- Request the narrowest Drive scope that supports the approved import model.
- The redirect URI terminates at the backend, never at GitHub Pages.
- Encrypt refresh tokens at rest using a managed KMS, or store them in a secret
  manager and persist only a secret reference in PostgreSQL.
- Access tokens are short-lived server-side values and must never be returned
  to the browser.
- Disconnecting a source revokes the Google grant and deletes the stored token
  material.

**No-password rule:** Lotus never gives Lake Forest Academy, a developer, or
the learning platform her Google password. The system accepts only explicit
folder sharing or Google's OAuth consent flow. Never request, log, transmit, or
store a Google password.

The database schema stores credential metadata such as `credential_type` and a
`credential_ref`, not private keys, refresh tokens, client secrets, or access
tokens.

## Import behavior

1. The backend validates that the configured root is named `Courses`, is
   readable, and belongs to the declared My Drive or Shared Drive.
2. The first sync walks the descendants of `Courses` using paginated Drive API
   calls. Shared Drive requests must opt into all-drives support and be scoped
   to the configured drive where applicable.
3. Each valid file is upserted by `(source_id, drive_file_id)`.
4. The backend stores the Drive change cursor only after all database writes in
   the run commit successfully.
5. Later runs use the Drive Changes API when a cursor is available. If Google
   invalidates the cursor, the backend records the reason and performs a
   reconciliation scan.
6. Overlapping syncs for the same source are rejected or serialized with a
   database/advisory lock.
7. Retry Drive `429` and transient `5xx` responses with exponential backoff and
   jitter. Do not retry permanent permission or validation failures forever.
8. A run is idempotent. Repeating a request with the same `Idempotency-Key`
   returns the existing run.

The initial implementation can expose a manual “Sync from Drive” action.
Scheduled sync and Drive notifications belong in the backend and can be added
without changing the browser contract.

## HTTP API contract

All payloads use UTF-8 JSON. Dates are RFC 3339 UTC strings. IDs generated by
Lake Forest Academy are UUIDs. The examples below use `/v1`; the final origin
is configured separately from the static site.

### Create a Drive source

`POST /v1/admin/drive/sources`

Required role: `teacher_admin`.

```http
Authorization: Bearer <school-session-token>
Content-Type: application/json
Idempotency-Key: 3fc61d3a-9077-4461-b67a-40cc41b9a19d
```

```json
{
  "displayName": "Lotus curriculum materials",
  "driveKind": "shared_drive",
  "driveId": "0AJexampleSharedDriveId",
  "rootFolderId": "1ExampleCoursesFolderId",
  "rootFolderName": "Courses",
  "credentialType": "service_account",
  "credentialRef": "secret://lfa-production/drive-import-service-account"
}
```

For `my_drive`, `driveId` must be `null`. `credentialRef` is accepted only by
the trusted backend/admin deployment path; a public browser form must not be
allowed to choose arbitrary secret references.

Success: `201 Created`

```json
{
  "data": {
    "id": "237d4ec2-ce04-4fd0-b4c6-d38e6d0f103b",
    "displayName": "Lotus curriculum materials",
    "driveKind": "shared_drive",
    "driveId": "0AJexampleSharedDriveId",
    "rootFolderId": "1ExampleCoursesFolderId",
    "rootFolderName": "Courses",
    "credentialType": "service_account",
    "status": "active",
    "lastSuccessfulSyncAt": null,
    "createdAt": "2026-07-19T09:00:00Z"
  }
}
```

The response never includes `credentialRef` or credential material.

### List sources

`GET /v1/admin/drive/sources`

Required role: `teacher_admin`.

```json
{
  "data": [
    {
      "id": "237d4ec2-ce04-4fd0-b4c6-d38e6d0f103b",
      "displayName": "Lotus curriculum materials",
      "driveKind": "shared_drive",
      "rootFolderName": "Courses",
      "status": "active",
      "lastSuccessfulSyncAt": "2026-07-19T09:05:24Z"
    }
  ]
}
```

### Start a sync

`POST /v1/admin/drive/sources/{sourceId}/sync`

Required role: `teacher_admin`.

```http
Authorization: Bearer <school-session-token>
Content-Type: application/json
Idempotency-Key: 68aa54d9-306c-4698-89da-c9d723ce1709
```

```json
{
  "mode": "incremental"
}
```

`mode` is `incremental` or `full`. The backend may convert `incremental` to a
full reconciliation when no valid change cursor exists.

Accepted: `202 Accepted`

```json
{
  "data": {
    "runId": "caaee1a7-2a01-45ea-82ba-8d225f62834c",
    "sourceId": "237d4ec2-ce04-4fd0-b4c6-d38e6d0f103b",
    "mode": "incremental",
    "status": "queued",
    "statusUrl": "/v1/admin/drive/sync-runs/caaee1a7-2a01-45ea-82ba-8d225f62834c"
  }
}
```

### Read sync status

`GET /v1/admin/drive/sync-runs/{runId}`

Required role: `teacher_admin`.

```json
{
  "data": {
    "id": "caaee1a7-2a01-45ea-82ba-8d225f62834c",
    "sourceId": "237d4ec2-ce04-4fd0-b4c6-d38e6d0f103b",
    "mode": "incremental",
    "trigger": "manual",
    "status": "succeeded",
    "discoveredFileCount": 42,
    "createdFileCount": 3,
    "updatedFileCount": 2,
    "deactivatedFileCount": 1,
    "skippedFileCount": 4,
    "startedAt": "2026-07-19T09:05:00Z",
    "finishedAt": "2026-07-19T09:05:24Z",
    "error": null
  }
}
```

On failure, `error` contains a safe machine code and a redacted message, for
example:

```json
{
  "code": "DRIVE_PERMISSION_DENIED",
  "message": "The import service can no longer read the configured Courses folder."
}
```

Logs and API responses must redact Google tokens, authorization headers, raw
credential errors, and private file content.

### List imported materials

`GET /v1/materials?courseCode=ENG10&unitNumber=1&category=Lessons&cursor=...&limit=50`

Required role: an authenticated role permitted to view the requested course.
The server, not the client, enforces enrollment and staff access.

```json
{
  "data": [
    {
      "id": "17c5b429-025d-4601-91d1-8ff291139a07",
      "courseCode": "ENG10",
      "unitNumber": 1,
      "category": "Lessons",
      "name": "Introduction to Canadian Literature.pdf",
      "mimeType": "application/pdf",
      "driveModifiedAt": "2026-07-18T16:30:00Z",
      "openUrl": "/v1/materials/17c5b429-025d-4601-91d1-8ff291139a07/open"
    }
  ],
  "page": {
    "nextCursor": null,
    "limit": 50
  }
}
```

`limit` defaults to 50 and must be capped by the server (recommended maximum:
100). Do not expose raw Drive links to unauthorized users.

### Open a material

`GET /v1/materials/{materialId}/open`

After checking the school session and course permission, the backend either:

- returns `302 Found` to a short-lived, permitted destination; or
- streams/proxies a supported file with a safe `Content-Type` and
  `Content-Disposition`.

The browser must not receive a Google access token. Native Google files may
still require the viewer to have an authorized Google account unless the
backend exports or proxies them under a separately approved policy.

### Disable a source

`PATCH /v1/admin/drive/sources/{sourceId}`

Required role: `teacher_admin`.

```json
{
  "status": "disabled"
}
```

Disabling stops new syncs but preserves material and run history. A separate,
explicitly confirmed deletion workflow may revoke OAuth and remove stored
secret material.

### Standard error envelope

```json
{
  "error": {
    "code": "INVALID_FOLDER_STRUCTURE",
    "message": "The root folder must be named Courses.",
    "requestId": "req_01J2Qexample",
    "details": [
      {
        "field": "rootFolderName",
        "reason": "expected Courses"
      }
    ]
  }
}
```

Use appropriate status codes: `400` invalid input, `401` no valid session,
`403` insufficient role or Drive permission, `404` unknown resource, `409`
overlapping/idempotency conflict, `422` valid JSON that violates the folder
contract, `429` throttled, and `500/502/503` for redacted server or upstream
failures.

## Browser configuration

[`sample-config.js`](./sample-config.js) shows the only Drive-related
configuration safe to include in the public frontend. Treat every file emitted
by Vite and every GitHub Pages asset as public, including source maps and commit
history.

The real frontend should fail closed when the import API is unavailable: show
existing cached/published catalog data if supported, disable the manual sync
action, and never fall back to calling Google Drive directly.

## Database

[`schema.sql`](./schema.sql) defines the PostgreSQL source, material, and sync
run records. Apply it through the backend's migration system. Credential values
remain outside PostgreSQL; only a secret-manager reference is stored.

## Production checklist

- Use a Lake Forest Academy-owned Shared Drive for the production source.
- Confirm the backend can read only the approved `Courses` tree.
- Keep Google and database credentials in a managed secret store.
- Restrict CORS, require HTTPS, and validate authenticated school roles.
- Set an explicit content-security policy for the GitHub Pages site.
- Add rate limits and CSRF protection appropriate to the chosen session model.
- Log admin actions and sync run IDs without logging tokens or file contents.
- Add alerting for repeated failed runs or revoked Drive access.
- Test rename, move, trash, restore, duplicate names, pagination, expired
  cursor, `429`, and partial upstream failure cases.
- Back up PostgreSQL and document token/credential rotation and source
  disconnect procedures.
