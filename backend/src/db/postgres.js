import pg from "pg";
import { ApiError } from "../lib/errors.js";

const { Pool } = pg;

export function createPool(config) {
  return new Pool({
    connectionString: config.databaseUrl,
    ...(config.databaseSocket ? { host: config.databaseSocket } : {}),
    // Cloud Run's Cloud SQL Unix socket is already encrypted by the managed
    // Auth Proxy. PostgreSQL TLS is only appropriate for direct TCP links.
    ssl:
      !config.databaseSocket && config.databaseSsl
        ? { rejectUnauthorized: true }
        : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "lake-forest-learning-api",
  });
}

function databaseError(error) {
  if (error?.code === "23505") {
    return new ApiError(409, "CONFLICT", "That record already exists.");
  }
  if (error?.code === "23503") {
    return new ApiError(422, "UNKNOWN_REFERENCE", "A referenced record does not exist.");
  }
  return error;
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    publicId: row.public_id,
    email: String(row.email).toLowerCase(),
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
  };
}

function mapSubmission(row) {
  if (!row) return null;
  return {
    id: row.id,
    studentUserId: row.student_user_id,
    studentId: row.student_id,
    studentName: row.student_display_name,
    studentEmail: row.student_email ? String(row.student_email).toLowerCase() : "",
    studentFirstName: row.student_first_name || "",
    studentLastName: row.student_last_name || "",
    courseCode: row.course_code,
    unitNumber: row.unit_number,
    assignmentId: row.assignment_id,
    assignmentTitle: row.assignment_title,
    attemptNumber: row.attempt_number,
    note: row.note,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    requestFingerprint: row.request_fingerprint,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    files: Array.isArray(row.files) ? row.files : [],
    grade: row.grade || null,
    historyRecords: Array.isArray(row.history_records)
      ? row.history_records.map((item) => mapSubmission(item))
      : [],
  };
}

const submissionSelect = `
  SELECT s.*,
         u.email AS student_email,
         u.first_name AS student_first_name,
         u.last_name AS student_last_name,
         COALESCE(files.items, '[]'::json) AS files,
         grade.item AS grade
    FROM student_submissions s
    JOIN app_users u ON u.id = s.student_user_id
    LEFT JOIN LATERAL (
      SELECT json_agg(json_build_object(
        'id', f.id,
        'name', f.original_file_name,
        'storedName', f.stored_file_name,
        'mimeType', f.mime_type,
        'sizeBytes', f.size_bytes,
        'sha256', f.sha256_checksum
      ) ORDER BY f.created_at, f.id) AS items
      FROM submission_files f WHERE f.submission_id = s.id
    ) files ON true
`;

function gradeLateral(role) {
  const predicate =
    role === "student"
      ? "g.published_at IS NOT NULL"
      : "g.is_current = true";
  return `
    LEFT JOIN LATERAL (
      SELECT json_build_object(
        'score', g.score,
        'feedback', g.feedback,
        'gradedBy', g.graded_by,
        'gradedAt', g.graded_at,
        'publishedAt', g.published_at,
        'version', g.version,
        'etag', '"grade-v' || g.version::text || '"'
      ) AS item
      FROM submission_grades g
      WHERE g.submission_id = s.id AND ${predicate}
      ORDER BY g.version DESC LIMIT 1
    ) grade ON true
  `;
}

const historyLateral = `
  LEFT JOIN LATERAL (
    SELECT json_agg(
      json_build_object(
        'id', hs.id,
        'student_user_id', hs.student_user_id,
        'student_id', hs.student_id,
        'student_display_name', hs.student_display_name,
        'student_email', hu.email,
        'student_first_name', hu.first_name,
        'student_last_name', hu.last_name,
        'course_code', hs.course_code,
        'unit_number', hs.unit_number,
        'assignment_id', hs.assignment_id,
        'assignment_title', hs.assignment_title,
        'attempt_number', hs.attempt_number,
        'note', hs.note,
        'status', hs.status,
        'idempotency_key', hs.idempotency_key,
        'request_fingerprint', hs.request_fingerprint,
        'submitted_at', hs.submitted_at,
        'updated_at', hs.updated_at,
        'files', COALESCE((
          SELECT json_agg(json_build_object(
            'id', hf.id,
            'name', hf.original_file_name,
            'storedName', hf.stored_file_name,
            'mimeType', hf.mime_type,
            'sizeBytes', hf.size_bytes,
            'sha256', hf.sha256_checksum
          ) ORDER BY hf.created_at, hf.id)
          FROM submission_files hf WHERE hf.submission_id = hs.id
        ), '[]'::json)
      ) ORDER BY hs.attempt_number, hs.submitted_at, hs.id
    ) AS items
    FROM student_submissions hs
    JOIN app_users hu ON hu.id = hs.student_user_id
    WHERE hs.student_user_id = s.student_user_id
      AND hs.course_code = s.course_code
      AND hs.assignment_id = s.assignment_id
  ) history ON true
`;

export class PostgresRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async ready() {
    await this.pool.query("SELECT 1");
    return true;
  }

  async close() {
    await this.pool.end();
  }

  async createUser(user) {
    try {
      const result = await this.pool.query(
        `INSERT INTO app_users
          (public_id, email, password_hash, first_name, last_name, display_name, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          user.publicId,
          user.email,
          user.passwordHash,
          user.firstName,
          user.lastName,
          user.displayName,
          user.role,
        ],
      );
      return mapUser(result.rows[0]);
    } catch (error) {
      if (error?.code === "23505" && error?.constraint?.includes("email")) {
        throw new ApiError(409, "EMAIL_ALREADY_REGISTERED", "An account already exists for this email address.");
      }
      throw databaseError(error);
    }
  }

  async createStudentWithEnrollments(user, courseCodes) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO app_users
          (public_id, email, password_hash, first_name, last_name, display_name, role)
         VALUES ($1, $2, $3, $4, $5, $6, 'student')
         RETURNING *`,
        [user.publicId, user.email, user.passwordHash, user.firstName, user.lastName, user.displayName],
      );
      for (const code of courseCodes) {
        await client.query(
          `INSERT INTO course_enrollments (student_user_id, course_code, status)
           VALUES ($1, $2, 'active')`,
          [inserted.rows[0].id, code],
        );
      }
      await client.query("COMMIT");
      return mapUser(inserted.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      if (error?.code === "23505" && error?.constraint?.includes("email")) {
        throw new ApiError(409, "EMAIL_ALREADY_REGISTERED", "An account already exists for this email address.");
      }
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async findUserByEmail(email) {
    const result = await this.pool.query(
      "SELECT * FROM app_users WHERE email = $1 LIMIT 1",
      [email],
    );
    return mapUser(result.rows[0]);
  }

  async setTeacherCourses(userId, courseCodes) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM teacher_course_access WHERE teacher_user_id = $1", [userId]);
      for (const code of courseCodes) {
        await client.query(
          "INSERT INTO teacher_course_access (teacher_user_id, course_code) VALUES ($1, $2)",
          [userId, code],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async createSession({ id, userId, tokenHash, csrfTokenHash, expiresAt }) {
    const result = await this.pool.query(
      `INSERT INTO auth_sessions (id, user_id, token_hash, csrf_token_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [id, userId, tokenHash, csrfTokenHash, expiresAt],
    );
    return { id: result.rows[0].id, expiresAt };
  }

  async getSessionUser(tokenHash) {
    const result = await this.pool.query(
      `SELECT s.id AS session_id, s.csrf_token_hash, s.expires_at, u.*
         FROM auth_sessions s
         JOIN app_users u ON u.id = s.user_id
        WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = 'active'
        LIMIT 1`,
      [tokenHash],
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      sessionId: row.session_id,
      csrfTokenHash: row.csrf_token_hash,
      expiresAt: row.expires_at,
      user: mapUser(row),
    };
  }

  async rotateSessionCsrf(sessionId, csrfTokenHash) {
    await this.pool.query(
      "UPDATE auth_sessions SET csrf_token_hash = $2, last_seen_at = now() WHERE id = $1",
      [sessionId, csrfTokenHash],
    );
  }

  async deleteSession(sessionId) {
    await this.pool.query("DELETE FROM auth_sessions WHERE id = $1", [sessionId]);
  }

  async replaceEnrollments(studentUserId, courseCodes) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const valid = await client.query(
        "SELECT code FROM courses WHERE code = ANY($1::text[]) AND status = 'active'",
        [courseCodes],
      );
      if (valid.rowCount !== courseCodes.length) {
        throw new ApiError(422, "UNKNOWN_COURSE", "One or more selected courses are unavailable.");
      }
      await client.query(
        "UPDATE course_enrollments SET status = 'dropped', updated_at = now() WHERE student_user_id = $1",
        [studentUserId],
      );
      for (const code of courseCodes) {
        await client.query(
          `INSERT INTO course_enrollments (student_user_id, course_code, status)
           VALUES ($1, $2, 'active')
           ON CONFLICT (student_user_id, course_code) DO UPDATE
             SET status = 'active', updated_at = now()`,
          [studentUserId, code],
        );
      }
      await client.query("COMMIT");
      return courseCodes;
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async listEnrollments(studentUserId) {
    const result = await this.pool.query(
      `SELECT course_code FROM course_enrollments
       WHERE student_user_id = $1 AND status = 'active' ORDER BY course_code`,
      [studentUserId],
    );
    return result.rows.map((row) => row.course_code);
  }

  async canAccessCourse(user, courseCode) {
    if (user.role === "teacher_admin") return true;
    if (user.role === "student") {
      const result = await this.pool.query(
        `SELECT 1 FROM course_enrollments
         WHERE student_user_id = $1 AND course_code = $2 AND status = 'active'`,
        [user.id, courseCode],
      );
      return result.rowCount > 0;
    }
    if (user.role === "teacher") {
      const result = await this.pool.query(
        "SELECT 1 FROM teacher_course_access WHERE teacher_user_id = $1 AND course_code = $2",
        [user.id, courseCode],
      );
      return result.rowCount > 0;
    }
    return false;
  }

  async listAccessibleCourseCodes(user) {
    if (user.role === "teacher_admin") {
      const result = await this.pool.query("SELECT code FROM courses WHERE status = 'active' ORDER BY code");
      return result.rows.map((row) => row.code);
    }
    if (user.role === "student") return this.listEnrollments(user.id);
    const result = await this.pool.query(
      `SELECT course_code FROM teacher_course_access
       WHERE teacher_user_id = $1 ORDER BY course_code`,
      [user.id],
    );
    return result.rows.map((row) => row.course_code);
  }

  async getAssignment(assignmentId) {
    const result = await this.pool.query(
      "SELECT * FROM assignments WHERE id = $1 AND status = 'active' LIMIT 1",
      [assignmentId],
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      courseCode: row.course_code,
      unitNumber: row.unit_number,
      title: row.title,
      maxAttempts: row.max_attempts,
    };
  }

  async getActiveSubmissionTarget() {
    const result = await this.pool.query(
      `SELECT * FROM drive_submission_targets
       WHERE status = 'active' ORDER BY created_at LIMIT 1`,
    );
    return result.rows[0] || null;
  }

  async createSubmissionTarget(input, actorId) {
    try {
      const result = await this.pool.query(
        `INSERT INTO drive_submission_targets
          (display_name, drive_kind, drive_id, root_folder_id, root_folder_name,
           credential_type, credential_ref, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [input.displayName, input.driveKind, input.driveId, input.rootFolderId,
          input.rootFolderName, input.credentialType, input.credentialRef, actorId],
      );
      return result.rows[0];
    } catch (error) {
      throw databaseError(error);
    }
  }

  async listSubmissionTargets() {
    const result = await this.pool.query(
      `SELECT id, display_name, drive_kind, drive_id, root_folder_id, root_folder_name,
              credential_type, status, created_at, updated_at
         FROM drive_submission_targets ORDER BY created_at`,
    );
    return result.rows;
  }

  async findSubmissionByIdempotency(studentUserId, key, role = "student") {
    const result = await this.pool.query(
      `${submissionSelect}${gradeLateral(role)}
       WHERE s.student_user_id = $1 AND s.idempotency_key = $2 LIMIT 1`,
      [studentUserId, key],
    );
    return mapSubmission(result.rows[0]);
  }

  async getLatestSubmissionAttempt(studentUserId, courseCode, assignmentId) {
    const result = await this.pool.query(
      `SELECT id, attempt_number
         FROM student_submissions
        WHERE student_user_id = $1 AND course_code = $2 AND assignment_id = $3
        ORDER BY attempt_number DESC, submitted_at DESC, id DESC
        LIMIT 1`,
      [studentUserId, courseCode, assignmentId],
    );
    return result.rows[0]
      ? {
          id: result.rows[0].id,
          attemptNumber: Number(result.rows[0].attempt_number),
        }
      : null;
  }

  async createSubmission(input, files) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO student_submissions
          (id, student_user_id, student_id, student_display_name, course_code,
           unit_number, assignment_id, assignment_title, attempt_number, note,
           integrity_confirmed, idempotency_key, request_fingerprint)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12)
         RETURNING *`,
        [input.id, input.studentUserId, input.studentId, input.studentName, input.courseCode,
          input.unitNumber, input.assignmentId, input.assignmentTitle, input.attemptNumber,
          input.note, input.idempotencyKey, input.requestFingerprint],
      );
      for (const file of files) {
        await client.query(
          `INSERT INTO submission_files
            (id, submission_id, target_id, drive_file_id, drive_parent_folder_id,
             original_file_name, stored_file_name, relative_path, mime_type,
             size_bytes, sha256_checksum, drive_web_view_link, drive_created_at, drive_modified_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [file.id, input.id, file.targetId, file.driveFileId, file.driveParentFolderId,
            file.originalName, file.storedName, file.relativePath, file.mimeType,
            file.sizeBytes, file.sha256, file.webViewLink || null,
            file.createdAt, file.modifiedAt],
        );
      }
      await client.query("COMMIT");
      return {
        ...mapSubmission({
          ...inserted.rows[0],
          student_email: input.studentEmail,
          student_first_name: input.studentFirstName,
          student_last_name: input.studentLastName,
          files: files.map((file) => ({
            id: file.id,
            name: file.originalName,
            storedName: file.storedName,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            sha256: file.sha256,
          })),
          grade: null,
        }),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async listSubmissions(user, filters = {}) {
    const values = [];
    const conditions = [];
    const add = (value) => {
      values.push(value);
      return `$${values.length}`;
    };
    if (user.role === "student") {
      conditions.push(`s.student_user_id = ${add(user.id)}`);
    } else if (user.role === "teacher") {
      conditions.push(`EXISTS (
        SELECT 1 FROM teacher_course_access tca
        WHERE tca.teacher_user_id = ${add(user.id)} AND tca.course_code = s.course_code
      )`);
    }
    if (filters.courseCode) conditions.push(`s.course_code = ${add(filters.courseCode)}`);
    if (filters.unitNumber) conditions.push(`s.unit_number = ${add(filters.unitNumber)}`);
    if (filters.assignmentId) conditions.push(`s.assignment_id = ${add(filters.assignmentId)}`);
    if (filters.status) conditions.push(`s.status = ${add(filters.status)}`);
    if (filters.studentId && user.role !== "student") conditions.push(`s.student_id = ${add(filters.studentId)}`);
    const limit = Math.min(filters.limit || 50, 100);
    const offset = Math.max(filters.offset || 0, 0);
    values.push(limit + 1, offset);
    const result = await this.pool.query(
      `WITH filtered AS (
         SELECT s.id, s.student_user_id, s.course_code, s.assignment_id,
                row_number() OVER (
                  PARTITION BY s.student_user_id, s.course_code, s.assignment_id
                  ORDER BY s.attempt_number DESC, s.submitted_at DESC, s.id DESC
                ) AS attempt_rank
           FROM student_submissions s
          ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       )
       ${submissionSelect}${gradeLateral(user.role)}${historyLateral}
       WHERE s.id IN (SELECT id FROM filtered WHERE attempt_rank = 1)
       ORDER BY s.submitted_at DESC, s.id DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    return result.rows.map(mapSubmission);
  }

  async getSubmission(submissionId, role = "teacher") {
    const result = await this.pool.query(
      `${submissionSelect}${gradeLateral(role)} WHERE s.id = $1 LIMIT 1`,
      [submissionId],
    );
    return mapSubmission(result.rows[0]);
  }

  async getSubmissionFile(submissionId, fileId) {
    const result = await this.pool.query(
      `SELECT f.*, s.student_user_id, s.course_code
         FROM submission_files f
         JOIN student_submissions s ON s.id = f.submission_id
        WHERE f.id = $1 AND f.submission_id = $2 LIMIT 1`,
      [fileId, submissionId],
    );
    return result.rows[0] || null;
  }

  async createGrade(input) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const replay = await client.query(
        `SELECT * FROM submission_grades
         WHERE graded_by_user_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [input.grader.id, input.idempotencyKey],
      );
      if (replay.rows[0]) {
        if (replay.rows[0].request_fingerprint !== input.requestFingerprint) {
          throw new ApiError(409, "IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used for different grade content.");
        }
        await client.query("COMMIT");
        return this.#mapGrade(replay.rows[0]);
      }
      const locked = await client.query(
        `SELECT * FROM submission_grades
         WHERE submission_id = $1 AND is_current = true FOR UPDATE`,
        [input.submissionId],
      );
      const currentVersion = locked.rows[0]?.version || 0;
      if (input.expectedVersion !== currentVersion) {
        throw new ApiError(412, "GRADE_VERSION_CONFLICT", "This grade changed in another session. Refresh before publishing.");
      }
      if (locked.rows[0]) {
        await client.query("UPDATE submission_grades SET is_current = false WHERE id = $1", [locked.rows[0].id]);
      }
      const result = await client.query(
        `INSERT INTO submission_grades
          (submission_id, version, score, feedback, graded_by_user_id, graded_by,
           idempotency_key, request_fingerprint, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $9 THEN now() ELSE NULL END)
         RETURNING *`,
        [input.submissionId, currentVersion + 1, input.score, input.feedback,
          input.grader.id, input.grader.publicId, input.idempotencyKey,
          input.requestFingerprint, input.publish],
      );
      await client.query("COMMIT");
      return this.#mapGrade(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  #mapGrade(row) {
    return {
      submissionId: row.submission_id,
      score: row.score,
      feedback: row.feedback,
      gradedBy: row.graded_by,
      gradedAt: row.graded_at,
      publishedAt: row.published_at,
      version: row.version,
      etag: `"grade-v${row.version}"`,
    };
  }

  async listMaterials(filters = {}) {
    const values = [];
    const conditions = ["m.is_active = true"];
    const add = (value) => {
      values.push(value);
      return `$${values.length}`;
    };
    if (filters.courseCode) conditions.push(`m.course_code = ${add(filters.courseCode)}`);
    if (filters.unitNumber) conditions.push(`m.unit_number = ${add(filters.unitNumber)}`);
    if (filters.category) conditions.push(`m.category = ${add(filters.category)}`);
    if (Array.isArray(filters.allowedCourseCodes)) {
      conditions.push(`m.course_code = ANY(${add(filters.allowedCourseCodes)}::text[])`);
    }
    const limit = Math.min(filters.limit || 50, 100);
    const offset = Math.max(filters.offset || 0, 0);
    values.push(limit + 1, offset);
    const result = await this.pool.query(
      `SELECT m.id, m.course_code, m.unit_number, m.category, m.file_name,
              m.mime_type, m.drive_modified_at, m.size_bytes
         FROM drive_materials m
        WHERE ${conditions.join(" AND ")}
        ORDER BY m.course_code, m.unit_number, m.category, m.file_name, m.id
        LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
    return result.rows;
  }

  async getMaterial(materialId) {
    const result = await this.pool.query(
      "SELECT * FROM drive_materials WHERE id = $1 AND is_active = true LIMIT 1",
      [materialId],
    );
    return result.rows[0] || null;
  }

  async createDriveSource(input, actorId) {
    try {
      const result = await this.pool.query(
        `INSERT INTO drive_sources
          (display_name, drive_kind, drive_id, root_folder_id, root_folder_name,
           credential_type, credential_ref, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [input.displayName, input.driveKind, input.driveId, input.rootFolderId,
          input.rootFolderName, input.credentialType, input.credentialRef, actorId],
      );
      return result.rows[0];
    } catch (error) {
      throw databaseError(error);
    }
  }

  async listDriveSources() {
    const result = await this.pool.query(
      `SELECT id, display_name, drive_kind, drive_id, root_folder_id,
              root_folder_name, credential_type, status,
              last_successful_sync_at, created_at
         FROM drive_sources ORDER BY created_at`,
    );
    return result.rows;
  }

  async getDriveSource(sourceId) {
    const result = await this.pool.query("SELECT * FROM drive_sources WHERE id = $1", [sourceId]);
    return result.rows[0] || null;
  }

  async updateDriveSourceStatus(sourceId, status) {
    const result = await this.pool.query(
      "UPDATE drive_sources SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
      [sourceId, status],
    );
    return result.rows[0] || null;
  }

  async createSyncRun({ sourceId, mode, idempotencyKey, actorId }) {
    await this.pool.query(
      `UPDATE drive_sync_runs
          SET status = 'failed', finished_at = now(),
              error_code = 'SYNC_LEASE_EXPIRED',
              error_message = 'The previous sync did not finish and may be retried.'
        WHERE source_id = $1
          AND (
            (status = 'queued' AND queued_at < now() - ($2::int * interval '1 minute'))
            OR
            (status = 'running' AND started_at < now() - ($3::int * interval '1 minute'))
          )`,
      [sourceId, 5, 30],
    );
    if (idempotencyKey) {
      const replay = await this.pool.query(
        "SELECT * FROM drive_sync_runs WHERE source_id = $1 AND idempotency_key = $2",
        [sourceId, idempotencyKey],
      );
      if (replay.rows[0]) return replay.rows[0];
    }
    try {
      const result = await this.pool.query(
        `INSERT INTO drive_sync_runs (source_id, mode, idempotency_key, requested_by)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [sourceId, mode, idempotencyKey || null, actorId],
      );
      return result.rows[0];
    } catch (error) {
      if (error?.code === "23505") {
        throw new ApiError(409, "SYNC_ALREADY_RUNNING", "A sync is already queued or running for this source.");
      }
      throw databaseError(error);
    }
  }

  async getSyncRun(runId) {
    const result = await this.pool.query("SELECT * FROM drive_sync_runs WHERE id = $1", [runId]);
    return result.rows[0] || null;
  }

  async markSyncRunning(runId) {
    const result = await this.pool.query(
      `UPDATE drive_sync_runs SET status = 'running', started_at = now()
       WHERE id = $1 AND status = 'queued' RETURNING *`,
      [runId],
    );
    return result.rows[0] || null;
  }

  async finishMaterialSync(run, records, skippedCount = 0) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const leased = await client.query(
        "SELECT status FROM drive_sync_runs WHERE id = $1 FOR UPDATE",
        [run.id],
      );
      if (leased.rows[0]?.status !== "running") {
        throw new ApiError(
          409,
          "SYNC_LEASE_LOST",
          "This Drive sync is no longer the active run.",
        );
      }
      let created = 0;
      let updated = 0;
      for (const item of records) {
        const result = await client.query(
          `INSERT INTO drive_materials
            (source_id, drive_file_id, parent_folder_id, course_code, unit_number,
             category, file_name, relative_path, mime_type, drive_web_view_link,
             drive_modified_at, size_bytes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (source_id, drive_file_id) DO UPDATE SET
             parent_folder_id = EXCLUDED.parent_folder_id,
             course_code = EXCLUDED.course_code,
             unit_number = EXCLUDED.unit_number,
             category = EXCLUDED.category,
             file_name = EXCLUDED.file_name,
             relative_path = EXCLUDED.relative_path,
             mime_type = EXCLUDED.mime_type,
             drive_web_view_link = EXCLUDED.drive_web_view_link,
             drive_modified_at = EXCLUDED.drive_modified_at,
             size_bytes = EXCLUDED.size_bytes,
             is_active = true, deactivated_at = NULL, last_seen_at = now(), updated_at = now()
           RETURNING (xmax = 0) AS inserted`,
          [run.source_id, item.driveFileId, item.parentFolderId, item.courseCode,
            item.unitNumber, item.category, item.fileName, item.relativePath,
            item.mimeType, item.webViewLink || null, item.modifiedAt,
            item.sizeBytes ?? null],
        );
        if (result.rows[0].inserted) created += 1;
        else updated += 1;
      }
      const ids = records.map((item) => item.driveFileId);
      const deactivated = await client.query(
        `UPDATE drive_materials SET is_active = false, deactivated_at = now(), updated_at = now()
         WHERE source_id = $1 AND is_active = true AND NOT (drive_file_id = ANY($2::text[]))`,
        [run.source_id, ids],
      );
      await client.query(
        `UPDATE drive_sync_runs SET status = 'succeeded', finished_at = now(),
           discovered_file_count = $2, created_file_count = $3,
           updated_file_count = $4, deactivated_file_count = $5,
           skipped_file_count = $6
         WHERE id = $1`,
        [run.id, records.length, created, updated, deactivated.rowCount, skippedCount],
      );
      await client.query(
        `UPDATE drive_sources SET last_sync_at = now(), last_successful_sync_at = now(), updated_at = now()
         WHERE id = $1`,
        [run.source_id],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async failSync(runId, code, message) {
    await this.pool.query(
      `UPDATE drive_sync_runs SET status = 'failed', finished_at = now(),
              error_code = $2, error_message = $3
       WHERE id = $1 AND status IN ('queued', 'running')`,
      [runId, code, message],
    );
  }

  async recordAudit(event) {
    try {
      await this.pool.query(
        `INSERT INTO audit_events
          (request_id, actor_user_id, action, resource_type, resource_id, outcome, details)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
        [event.requestId, event.actorUserId || null, event.action, event.resourceType,
          event.resourceId || null, event.outcome, JSON.stringify(event.details || {})],
      );
    } catch {
      // Audit persistence must not leak request data through a secondary error.
    }
  }
}
