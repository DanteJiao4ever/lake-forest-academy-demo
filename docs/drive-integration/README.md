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

## Student submission and grading contract

Drive is the file store for submitted work; PostgreSQL is the source of truth
for ownership, course/unit placement, submission state, and grades. A
successful student upload writes the file to the configured Drive destination
and commits its metadata to PostgreSQL before returning. The teacher portal
reads PostgreSQL, so a completed upload appears without waiting for the
curriculum-materials import job.

Use a separate, staff-only Drive root named `Student Submissions`. The backend
service identity needs write access to this root. Students and browsers never
receive that identity, a Google token, or direct write access. A recommended
storage hierarchy is:

```text
Student Submissions/
  {course code}/
    {opaque student ID}/
      Unit {n}/
        {assignment ID}/
          Attempt {n}/
            {server-generated safe filename}
```

The database maps the opaque student ID to the display name shown to teachers.
Do not put a student's password, email address, session token, or other secret
in a Drive folder or filename. Manual files placed in this tree are not trusted
as submissions; a reconciliation job may report them, but only the
authenticated upload API can create a submission record.

The public frontend uses two base URLs:

- `submissionsEndpoint`: `/v1/submissions`
- `gradingEndpoint`: `/v1/grades`

Both endpoints require the authenticated school session. The backend derives
the acting student or teacher from that session and never accepts a client
assertion of the caller's role.

### Student: upload an assignment

`POST {submissionsEndpoint}`

Required role: `student`. Content type:
`multipart/form-data; boundary=...`. The client must not set the boundary
manually.

```http
Authorization: Bearer <school-session-token>
Idempotency-Key: 3b16e450-bfc0-43b0-8a30-6d6eea25712d
```

Multipart fields:

```text
courseCode=MHF4U
unitNumber=1
assignmentId=unit-1-functions
assignmentTitle=Unit 1 Functions Assignment
attemptNumber=1
files=<one or more binary file parts>
```

`studentId` is deliberately absent. The backend derives it from the session,
verifies enrollment in `courseCode`, confirms that the assignment belongs to
the requested unit, and enforces the attempt policy. It streams each upload
through size, extension, MIME/magic-byte, and malware checks before writing to
Drive. The backend generates the stored filename and path; it must not use a
browser-supplied filename as a filesystem or Drive path.

Success: `201 Created`

```json
{
  "data": {
    "id": "8821aebd-423c-41d8-b0db-761f9b63650a",
    "studentId": "stu_01J4Y8M2",
    "studentName": "Avery Chen",
    "courseCode": "MHF4U",
    "unitNumber": 1,
    "assignmentId": "unit-1-functions",
    "assignmentTitle": "Unit 1 Functions Assignment",
    "attemptNumber": 1,
    "status": "submitted",
    "submittedAt": "2026-07-19T10:15:30Z",
    "files": [
      {
        "id": "6835be47-b296-42a3-a2de-d6282b0709d7",
        "name": "Avery-Chen-Unit-1.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": 284193,
        "openUrl": "/v1/submissions/8821aebd-423c-41d8-b0db-761f9b63650a/files/6835be47-b296-42a3-a2de-d6282b0709d7/open"
      }
    ],
    "grade": null
  }
}
```

The response never exposes a Drive file ID, Drive parent ID, Drive write URL,
Google token, or credential reference. If Drive succeeds but the database
transaction fails, the backend deletes the orphaned Drive object or records it
for a privileged reconciliation job.

`Idempotency-Key` is required. Replaying the same key as the same student with
the same multipart metadata and file digest returns the original result.
Reusing it with different content returns `409 IDEMPOTENCY_KEY_REUSED`.

### Student: list submissions, grades, and feedback

`GET {submissionsEndpoint}?courseCode=MHF4U&unitNumber=1`

Required role: `student`. The server always filters by the authenticated
student. A student-supplied `studentId` filter is rejected rather than used.
Only the current published grade is returned.

```json
{
  "data": [
    {
      "id": "8821aebd-423c-41d8-b0db-761f9b63650a",
      "courseCode": "MHF4U",
      "unitNumber": 1,
      "assignmentId": "unit-1-functions",
      "assignmentTitle": "Unit 1 Functions Assignment",
      "attemptNumber": 1,
      "status": "submitted",
      "submittedAt": "2026-07-19T10:15:30Z",
      "files": [
        {
          "id": "6835be47-b296-42a3-a2de-d6282b0709d7",
          "name": "Avery-Chen-Unit-1.pdf",
          "mimeType": "application/pdf",
          "sizeBytes": 284193,
          "openUrl": "/v1/submissions/8821aebd-423c-41d8-b0db-761f9b63650a/files/6835be47-b296-42a3-a2de-d6282b0709d7/open"
        }
      ],
      "grade": {
        "score": 88,
        "feedback": "Clear method and accurate graph. Label the final intercept.",
        "gradedAt": "2026-07-20T08:22:11Z",
        "version": 1
      }
    }
  ],
  "page": {
    "nextCursor": null,
    "limit": 50
  }
}
```

After a teacher publishes a grade, the next student GET returns the score and
feedback. The score is an integer percentage from `0` through `100`, inclusive.
Draft grade revisions are never returned to students.

### Teacher: list and organize submissions

`GET {submissionsEndpoint}?courseCode=MHF4U&unitNumber=1&cursor=...&limit=50`

Required role: `teacher` or `teacher_admin`. A teacher can read submissions only
for assigned courses; `teacher_admin` can read all courses. Optional
`studentId`, `assignmentId`, and `status` filters are allowed for staff. The
response is organized as course, then student, then unit:

```json
{
  "data": [
    {
      "courseCode": "MHF4U",
      "students": [
        {
          "studentId": "stu_01J4Y8M2",
          "studentName": "Avery Chen",
          "units": [
            {
              "unitNumber": 1,
              "submissions": [
                {
                  "id": "8821aebd-423c-41d8-b0db-761f9b63650a",
                  "assignmentId": "unit-1-functions",
                  "assignmentTitle": "Unit 1 Functions Assignment",
                  "attemptNumber": 1,
                  "status": "submitted",
                  "submittedAt": "2026-07-19T10:15:30Z",
                  "files": [
                    {
                      "id": "6835be47-b296-42a3-a2de-d6282b0709d7",
                      "name": "Avery-Chen-Unit-1.pdf",
                      "mimeType": "application/pdf",
                      "sizeBytes": 284193,
                      "openUrl": "/v1/submissions/8821aebd-423c-41d8-b0db-761f9b63650a/files/6835be47-b296-42a3-a2de-d6282b0709d7/open"
                    }
                  ],
                  "grade": null
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "page": {
    "nextCursor": null,
    "limit": 50
  }
}
```

Grouping is a presentation shape, not authorization. Every returned submission
must pass the staff course-access check before it is included.

### Open a submitted file

`GET {submissionsEndpoint}/{submissionId}/files/{fileId}/open`

Allowed callers are the owning student and staff authorized for the course.
After that check, the backend either streams the file or returns a short-lived
authorized redirect. Never return a Google access token or use knowledge of a
Drive file ID as authorization.

### Teacher: publish or revise a percentage grade

`PUT {gradingEndpoint}/{submissionId}`

Required role: `teacher` or `teacher_admin`, with access to the submission's
course.

```http
Authorization: Bearer <school-session-token>
Content-Type: application/json
Idempotency-Key: 267e42a4-cc90-4f15-a0ad-70fd0ca2396f
If-Match: "grade-v0"
```

```json
{
  "submissionId": "8821aebd-423c-41d8-b0db-761f9b63650a",
  "score": 88,
  "feedback": "Clear method and accurate graph. Label the final intercept.",
  "publish": true
}
```

`score` must be a JSON integer in the inclusive range `0` to `100`; decimal
values, numeric strings, negative values, and values above 100 return
`422 INVALID_SCORE`. `feedback` is plain text with a server-enforced maximum
length (recommended: 10,000 Unicode characters). Render it as text, never raw
HTML.

Success: `200 OK`

```json
{
  "data": {
    "submissionId": "8821aebd-423c-41d8-b0db-761f9b63650a",
    "score": 88,
    "feedback": "Clear method and accurate graph. Label the final intercept.",
    "gradedBy": "usr_james_whitmore",
    "gradedAt": "2026-07-20T08:22:11Z",
    "publishedAt": "2026-07-20T08:22:11Z",
    "version": 1,
    "etag": "\"grade-v1\""
  }
}
```

The path and body `submissionId` must match. `Idempotency-Key` is required and
is scoped to the authenticated grader. `If-Match` prevents two teacher tabs
from silently overwriting one another: a stale version returns
`412 GRADE_VERSION_CONFLICT` with no mutation. A grade revision creates a new
immutable version and marks the previous version non-current; it does not
destroy the audit history. When `publish` is `false`, the version is a staff
draft and remains invisible to the student.

### Submission security and operational rules

- Treat the database as the authorization index and Drive as private object
  storage. Do not enumerate Drive from a public request.
- Restrict upload count, total request size, per-file size, file types, and
  request rate. Reject archives or active content unless specifically needed
  and safely inspected.
- Verify MIME type from file bytes, scan for malware before Drive publication,
  normalize Unicode filenames, and generate collision-resistant stored names.
- Use a separate least-privileged Drive credential for submission writes where
  possible. Store only its secret-manager reference; never store a Google
  password, token, private key, or client secret in PostgreSQL or frontend code.
- Authorize every list, grade, and open request. A student sees only their own
  records; a teacher sees only assigned courses; an administrator's broader
  access must be explicit and audited.
- Record submission creation, file access, grade publication, grade revision,
  and permission failures with actor, request ID, and timestamp. Do not log file
  content, bearer tokens, cookies, or unredacted Google errors.
- Require HTTPS, same-site secure sessions or validated bearer tokens, strict
  CORS, CSRF protection for cookie sessions, and rate limiting.
- Make upload and grading writes idempotent. Use database transactions and
  row/version locking for grade changes, and run a privileged reconciliation
  job for rare Drive/database partial failures.

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
run records plus submission targets, submissions, Drive file metadata, and
versioned grades. Apply it through the backend's migration system. Credential
values remain outside PostgreSQL; only a secret-manager reference is stored.

## Production checklist

- Use a Lake Forest Academy-owned Shared Drive for the production source.
- Confirm the backend can read only the approved `Courses` tree.
- Keep Google and database credentials in a managed secret store.
- Restrict CORS, require HTTPS, and validate authenticated school roles.
- Set an explicit content-security policy for the GitHub Pages site.
- Add rate limits and CSRF protection appropriate to the chosen session model.
- Log admin actions and sync run IDs without logging tokens or file contents.
- Test cross-student and cross-course access denial, duplicate upload retries,
  stale grade versions, scores at `0` and `100`, invalid decimal scores,
  oversized files, MIME mismatches, and malware rejection.
- Add alerting for repeated failed runs or revoked Drive access.
- Test rename, move, trash, restore, duplicate names, pagination, expired
  cursor, `429`, and partial upstream failure cases.
- Back up PostgreSQL and document token/credential rotation and source
  disconnect procedures.
