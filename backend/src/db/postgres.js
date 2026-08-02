import pg from "pg";
import { ApiError } from "../lib/errors.js";
import { evaluateUnlockPolicy } from "../lib/unlock-policy.js";

const { Pool } = pg;
const PLATFORM_COURSE_CODES = Object.freeze([
  "SCH4U",
  "ICS4U",
  "SPH4U",
  "MHF4U",
  "MCV4U",
  "BBB4M",
]);

export function createPool(config) {
  // node-postgres reparses connectionString when it creates each client, so a
  // URL host would otherwise override the Cloud SQL Unix socket.
  const connection = config.databaseSocket
    ? socketConnectionOptions(config.databaseUrl, config.databaseSocket)
    : { connectionString: config.databaseUrl };
  return new Pool({
    ...connection,
    // Cloud Run's Cloud SQL Unix socket is already encrypted by the managed
    // Auth Proxy. PostgreSQL TLS is only appropriate for direct TCP links.
    ssl:
      !config.databaseSocket && config.databaseSsl
        ? { rejectUnauthorized: true }
        : false,
    max: config.databasePoolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: "lake-forest-learning-api",
  });
}

function socketConnectionOptions(connectionString, socket) {
  const parsed = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  if (!parsed.username || !database) {
    throw new Error("DATABASE_URL must include a database user and database name.");
  }
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    host: socket,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 5432,
  };
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
  const sectionKind = row.section_kind || "unit";
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
    curriculumUnitNumber:
      sectionKind === "final_evaluation"
        ? null
        : (row.curriculum_unit_number ?? row.unit_number),
    sectionKind,
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
         a.section_kind,
         CASE WHEN a.section_kind = 'final_evaluation' THEN NULL ELSE a.unit_number END
           AS curriculum_unit_number,
         u.email AS student_email,
         u.first_name AS student_first_name,
         u.last_name AS student_last_name,
         COALESCE(files.items, '[]'::json) AS files,
         grade.item AS grade
    FROM student_submissions s
    JOIN app_users u ON u.id = s.student_user_id
    LEFT JOIN assignments a ON a.id = s.assignment_id
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

  async createFacultyWithCourses(user, courseCodes) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
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
      for (const code of courseCodes) {
        await client.query(
          "INSERT INTO teacher_course_access (teacher_user_id, course_code) VALUES ($1, $2)",
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

  async catalogReady() {
    const result = await this.pool.query(
      `SELECT
         (SELECT count(*)::int FROM courses
           WHERE code = ANY($1::text[]) AND status = 'active') AS courses,
         (SELECT count(*)::int FROM course_modules
           WHERE course_code = ANY($1::text[]) AND status = 'published') AS modules,
         (SELECT count(*)::int FROM module_lessons ml
           JOIN course_modules cm ON cm.id = ml.module_id
          WHERE cm.course_code = ANY($1::text[]) AND ml.status = 'published') AS lessons,
         (SELECT count(*)::int FROM module_resources mr
           JOIN course_modules cm ON cm.id = mr.module_id
          WHERE cm.course_code = ANY($1::text[]) AND mr.status = 'published') AS resources,
         (SELECT count(*)::int FROM module_activities ma
           JOIN course_modules cm ON cm.id = ma.module_id
          WHERE cm.course_code = ANY($1::text[]) AND ma.status = 'published') AS activities,
         (SELECT count(*)::int FROM gradebook_items
           WHERE course_code = ANY($1::text[]) AND status = 'published') AS gradebook_items,
          (SELECT count(*)::int FROM assessment_components ac
            JOIN module_activities ma ON ma.id = ac.module_activity_id
            JOIN course_modules cm ON cm.id = ma.module_id
           WHERE cm.course_code = ANY($1::text[])) AS assessment_components,
          (SELECT count(*)::int FROM course_modules
            WHERE course_code = ANY($1::text[])
              AND btrim(feedback_and_unlock) <> ''
              AND unlock_criteria->>'version' = '1'
              AND unlock_criteria->>'operator' = 'all'
              AND unlock_criteria->>'scope' IN ('next_module', 'course_completion')
              AND jsonb_typeof(unlock_criteria->'conditions') = 'array') AS valid_unlock_policies,
          (SELECT count(*)::int FROM assignments a
            JOIN course_modules cm ON cm.id = a.module_id
           WHERE a.course_code = ANY($1::text[])
             AND a.section_kind = 'final_evaluation'
             AND cm.module_number = 11 AND cm.unit_number IS NULL) AS final_evaluation_assignments,
          (SELECT count(*)::int FROM assignments a
            JOIN course_modules cm ON cm.id = a.module_id
           WHERE a.course_code = ANY($1::text[])
             AND a.section_kind = 'unit'
             AND cm.module_number BETWEEN 1 AND 10
             AND a.unit_number = cm.unit_number) AS unit_assignments,
         (SELECT count(*)::int
            FROM (
              SELECT course_code
               FROM course_modules
               WHERE course_code = ANY($1::text[]) AND status = 'published'
               GROUP BY course_code
              HAVING count(*) <> 12 OR sum(estimated_credit_hours) <> 110
            ) invalid_hours) AS invalid_course_hours,
         (SELECT count(*)::int
            FROM (
              SELECT course_code
                FROM gradebook_items
               WHERE course_code = ANY($1::text[]) AND status = 'published'
               GROUP BY course_code
              HAVING sum(weight_percent) <> 100
            ) invalid_weights) AS invalid_course_weights`,
      [PLATFORM_COURSE_CODES],
    );
    return result.rows[0];
  }

  async listCoursesForUser(user) {
    const allowed = await this.listAccessibleCourseCodes(user);
    const result = await this.pool.query(
      `SELECT c.code, c.title, c.status,
              count(cm.id) FILTER (WHERE cm.status = 'published')::int AS module_count,
              COALESCE(sum(cm.estimated_credit_hours)
                FILTER (WHERE cm.status = 'published'), 0)::numeric AS planned_hours
         FROM courses c
         LEFT JOIN course_modules cm ON cm.course_code = c.code
        WHERE c.code = ANY($1::text[]) AND c.status = 'active'
        GROUP BY c.code, c.title, c.status
        ORDER BY c.code`,
      [allowed],
    );
    return result.rows.map((row) => ({
      code: row.code,
      title: row.title,
      status: row.status,
      moduleCount: Number(row.module_count),
      plannedHours: Number(row.planned_hours),
    }));
  }

  async getModule(moduleId) {
    const result = await this.pool.query(
      `SELECT id, course_code, module_number, unit_number, title, unit_title, status
         FROM course_modules WHERE id = $1 LIMIT 1`,
      [moduleId],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          courseCode: row.course_code,
          moduleNumber: row.module_number,
          unitNumber: row.unit_number,
          title: row.title,
          unitTitle: row.unit_title,
          status: row.status,
        }
      : null;
  }

  async getActivity(activityId) {
    const result = await this.pool.query(
      `SELECT ma.id, ma.module_id, ma.status, ma.sequence,
              cm.course_code, cm.module_number, cm.unlock_criteria
         FROM module_activities ma
         JOIN course_modules cm ON cm.id = ma.module_id
        WHERE ma.id = $1 LIMIT 1`,
      [activityId],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          moduleId: row.module_id,
          courseCode: row.course_code,
          moduleNumber: row.module_number,
          sequence: row.sequence,
          completionCriteria: row.unlock_criteria,
          status: row.status,
        }
      : null;
  }

  async listCourseModules(courseCode, { includeStaff = false } = {}) {
    const modulesResult = await this.pool.query(
      `SELECT * FROM course_modules
        WHERE course_code = $1 AND status = 'published'
        ORDER BY module_number`,
      [courseCode],
    );
    if (!modulesResult.rowCount) return [];
    const moduleIds = modulesResult.rows.map((row) => row.id);
    const [lessonsResult, resourcesResult, activitiesResult, componentsResult] =
      await Promise.all([
        this.pool.query(
          `SELECT id, module_id, position, title
             FROM module_lessons
            WHERE module_id = ANY($1::text[]) AND status = 'published'
            ORDER BY module_id, position`,
          [moduleIds],
        ),
        this.pool.query(
          `SELECT r.id, r.module_id, r.position, r.title, r.provider,
                  r.resource_kind, r.external_url, r.drive_material_id,
                  r.assigned_use, r.audience
             FROM module_resources r
             LEFT JOIN drive_materials dm ON dm.id = r.drive_material_id
            WHERE r.module_id = ANY($1::text[])
              AND r.status = 'published'
              AND ($2::boolean OR r.audience = 'student')
              AND (r.drive_material_id IS NULL OR (dm.is_active = true AND ($2::boolean OR dm.audience = 'student')))
            ORDER BY r.module_id, r.position`,
          [moduleIds, includeStaff],
        ),
        this.pool.query(
          `SELECT * FROM module_activities
            WHERE module_id = ANY($1::text[]) AND status = 'published'
            ORDER BY module_id`,
          [moduleIds],
        ),
        this.pool.query(
          `SELECT ac.*
             FROM assessment_components ac
             JOIN module_activities ma ON ma.id = ac.module_activity_id
            WHERE ma.module_id = ANY($1::text[])
            ORDER BY ac.module_activity_id, ac.position`,
          [moduleIds],
        ),
      ]);
    const lessons = new Map();
    for (const row of lessonsResult.rows) {
      if (!lessons.has(row.module_id)) lessons.set(row.module_id, []);
      lessons.get(row.module_id).push({ id: row.id, position: row.position, title: row.title });
    }
    const resources = new Map();
    for (const row of resourcesResult.rows) {
      if (!resources.has(row.module_id)) resources.set(row.module_id, []);
      resources.get(row.module_id).push({
        id: row.id,
        position: row.position,
        title: row.title,
        provider: row.provider,
        kind: row.resource_kind,
        url: row.external_url || null,
        openUrl: row.drive_material_id ? `/v1/materials/${row.drive_material_id}/open` : null,
        assignedUse: row.assigned_use,
        audience: row.audience,
      });
    }
    const components = new Map();
    for (const row of componentsResult.rows) {
      if (!components.has(row.module_activity_id)) components.set(row.module_activity_id, []);
      components.get(row.module_activity_id).push({
        id: row.id,
        gradebookItemId: row.gradebook_item_id,
        position: row.position,
        title: row.title,
        type: row.component_type,
        weightPercent: Number(row.weight_percent),
        timeMinutes: row.time_minutes,
        ...(includeStaff
          ? { processCheckpoints: row.process_checkpoints }
          : {}),
      });
    }
    const activities = new Map();
    for (const row of activitiesResult.rows) {
      activities.set(row.module_id, {
        id: row.id,
        type: row.activity_type,
        title: row.title,
        weightPercent: Number(row.course_grade_weight_percent),
        sequence: row.sequence,
        evidenceFile: row.evidence_file,
        taskType: row.task_type,
        ...(includeStaff
          ? {
              processCheckpoints: row.process_checkpoints,
              authenticationEvidence: row.authentication_evidence,
            }
          : {}),
        timeMinutes: row.time_minutes,
        isRequired: row.is_required,
        components: components.get(row.id) || [],
      });
    }
    return modulesResult.rows.map((row) => ({
      id: row.id,
      courseCode: row.course_code,
      moduleNumber: row.module_number,
      unitNumber: row.unit_number,
      title: row.title,
      unitTitle: row.unit_title,
      learningFocus: row.learning_focus,
      coreReadingOrder: row.core_reading_order,
      guidedPractice: row.guided_practice,
      lowStakesCheck: row.low_stakes_check,
      feedbackAndUnlock: row.feedback_and_unlock,
      unlockRule: {
        ruleText: row.feedback_and_unlock,
        criteria: row.unlock_criteria,
        teacherOverrideAllowed: true,
        overrideReasonRequired: true,
      },
      estimatedCreditHours: Number(row.estimated_credit_hours),
      workloadLabel: row.workload_label,
      ...(includeStaff
        ? {
            teacherPresence: row.teacher_presence,
            evidenceToRetain: row.evidence_to_retain,
          }
        : {}),
      lessons: lessons.get(row.id) || [],
      resources: resources.get(row.id) || [],
      activity: activities.get(row.id) || null,
    }));
  }

  async listCourseAssignments(courseCode, { includeInactive = false } = {}) {
    const result = await this.pool.query(
      `SELECT a.*, cm.module_number
       FROM assignments a
         JOIN course_modules cm ON cm.id = a.module_id
        WHERE a.course_code = $1 AND ($2::boolean OR a.status = 'active')
        ORDER BY COALESCE(cm.module_number, a.unit_number), a.id`,
      [courseCode, includeInactive],
    );
    return result.rows.map((row) => ({
      id: row.id,
      courseCode: row.course_code,
      moduleId: row.module_id,
      moduleNumber: row.module_number,
      unitNumber: row.unit_number,
      curriculumUnitNumber:
        row.section_kind === "final_evaluation" ? null : row.unit_number,
      sectionKind: row.section_kind || "unit",
      sectionLabel:
        row.section_kind === "final_evaluation"
          ? "Final Evaluation"
          : `Unit ${row.unit_number}`,
      title: row.title,
      instructions: row.instructions,
      rubric: row.rubric,
      weightPercent: row.weight_percent == null ? null : Number(row.weight_percent),
      submissionMode: row.submission_mode,
      availableFrom: row.available_from,
      dueAt: row.due_at,
      availableUntil: row.available_until,
      maxAttempts: row.max_attempts,
      status: row.status,
    }));
  }

  async listStudentProgress(studentUserId, courseCode) {
    const result = await this.pool.query(
      `SELECT cm.id, cm.module_number, p.status AS recorded_status,
              p.started_at, p.completed_at,
              previous.status AS previous_status,
              override.id AS override_id, override.reason AS override_reason,
              override.expires_at AS override_expires_at
         FROM course_modules cm
         LEFT JOIN student_module_progress p
           ON p.module_id = cm.id AND p.student_user_id = $1
         LEFT JOIN course_modules previous_module
           ON previous_module.course_code = cm.course_code
          AND previous_module.module_number = cm.module_number - 1
         LEFT JOIN student_module_progress previous
           ON previous.module_id = previous_module.id AND previous.student_user_id = $1
         LEFT JOIN LATERAL (
           SELECT id, reason, expires_at
             FROM module_unlock_overrides u
            WHERE u.student_user_id = $1 AND u.module_id = cm.id AND u.active = true
              AND (u.expires_at IS NULL OR u.expires_at > now())
            ORDER BY u.created_at DESC LIMIT 1
         ) override ON true
        WHERE cm.course_code = $2 AND cm.status = 'published'
        ORDER BY cm.module_number`,
      [studentUserId, courseCode],
    );
    return result.rows.map((row) => {
      const status = row.recorded_status ||
        (row.module_number === 0 || row.override_id || row.previous_status === "completed"
          ? "available"
          : "locked");
      return {
        courseCode,
        moduleId: row.id,
        moduleNumber: row.module_number,
        status,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        override: row.override_id
          ? { active: true, reason: row.override_reason, expiresAt: row.override_expires_at }
          : null,
      };
    });
  }

  async upsertStudentModuleProgress(studentUserId, moduleId, status) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const available = await client.query(
        `SELECT cm.id, cm.course_code, cm.module_number, cm.unlock_criteria,
                current.status AS current_status,
                previous.status AS previous_status,
                required_activity.id AS required_activity_id,
                activity_completion.status AS activity_completion_status,
                activity_completion.evidence AS activity_completion_evidence,
                EXISTS (
                  SELECT 1 FROM module_unlock_overrides u
                   WHERE u.student_user_id = $1 AND u.module_id = cm.id AND u.active = true
                     AND (u.expires_at IS NULL OR u.expires_at > now())
                ) AS overridden
           FROM course_modules cm
           LEFT JOIN student_module_progress current
             ON current.student_user_id = $1 AND current.module_id = cm.id
           LEFT JOIN course_modules previous_module
             ON previous_module.course_code = cm.course_code
            AND previous_module.module_number = cm.module_number - 1
           LEFT JOIN student_module_progress previous
             ON previous.student_user_id = $1 AND previous.module_id = previous_module.id
           LEFT JOIN module_activities required_activity
             ON required_activity.module_id = cm.id
            AND required_activity.status = 'published'
            AND required_activity.is_required = true
           LEFT JOIN student_activity_completions activity_completion
             ON activity_completion.student_user_id = $1
            AND activity_completion.activity_id = required_activity.id
          WHERE cm.id = $2 AND cm.status = 'published'
          FOR UPDATE OF cm`,
        [studentUserId, moduleId],
      );
      const module = available.rows[0];
      if (!module) throw new ApiError(404, "MODULE_NOT_FOUND", "The course module was not found.");
      const canStart = module.module_number === 0 || module.overridden ||
        module.previous_status === "completed" ||
        ["in_progress", "completed"].includes(module.current_status);
      if (!canStart) throw new ApiError(409, "MODULE_LOCKED", "Complete the previous module or ask your teacher for an override.");
      if (status === "completed") {
        const activityCompleted = ["completed", "waived"].includes(
          module.activity_completion_status,
        );
        const policy = evaluateUnlockPolicy(module.unlock_criteria, {
          source_module_completed: true,
          required_activity_completed:
            !module.required_activity_id || activityCompleted,
          required_activity_evidence_present: Boolean(
            module.activity_completion_evidence &&
              Object.keys(module.activity_completion_evidence).length,
          ),
          // A weighted activity cannot reach completed through this API until
          // every component has a published result (enforced transactionally
          // in upsertStudentActivityCompletion).
          all_gradebook_components_published: activityCompleted,
        });
        if (!policy.valid) {
          throw new ApiError(
            503,
            "UNLOCK_POLICY_INVALID",
            "The course unlock policy is unavailable. No completion was recorded.",
          );
        }
        if (!policy.satisfied) {
          throw new ApiError(
            409,
            "UNLOCK_CRITERIA_UNMET",
            "Complete the required module evidence before closing this module.",
            { unmet: policy.unmet },
          );
        }
      }
      if (
        status === "completed" &&
        module.required_activity_id &&
        !["completed", "waived"].includes(module.activity_completion_status)
      ) {
        throw new ApiError(
          409,
          "ACTIVITY_COMPLETION_REQUIRED",
          "Complete the required module activity before closing this module.",
        );
      }
      const saved = await client.query(
        `INSERT INTO student_module_progress
          (student_user_id, module_id, status, started_at, completed_at)
         VALUES ($1, $2, $3, now(), CASE WHEN $3 = 'completed' THEN now() ELSE NULL END)
         ON CONFLICT (student_user_id, module_id) DO UPDATE SET
           status = EXCLUDED.status,
           started_at = COALESCE(student_module_progress.started_at, EXCLUDED.started_at),
           completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN now() ELSE NULL END,
           updated_at = now()
         RETURNING *`,
        [studentUserId, moduleId, status],
      );
      await client.query("COMMIT");
      const row = saved.rows[0];
      return { moduleId: row.module_id, status: row.status, startedAt: row.started_at, completedAt: row.completed_at };
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async upsertStudentActivityCompletion(studentUserId, activityId, status, evidence = {}) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const gate = await client.query(
        `SELECT ma.id, ma.course_grade_weight_percent,
                gi.id AS gradebook_item_id,
                (
                  EXISTS (
                    SELECT 1
                      FROM student_gradebook_scores direct
                     WHERE direct.student_user_id = $1
                       AND direct.gradebook_item_id = gi.id
                       AND direct.published_at IS NOT NULL
                  )
                  OR EXISTS (
                    SELECT 1
                      FROM student_submissions submission
                      JOIN submission_grades grade
                        ON grade.submission_id = submission.id
                       AND grade.published_at IS NOT NULL
                     WHERE submission.student_user_id = $1
                       AND submission.assignment_id = gi.assignment_id
                       AND submission.status = 'submitted'
                       AND submission.id = (
                         SELECT latest.id
                           FROM student_submissions latest
                          WHERE latest.student_user_id = $1
                            AND latest.assignment_id = gi.assignment_id
                          ORDER BY latest.attempt_number DESC,
                                   latest.submitted_at DESC, latest.id DESC
                          LIMIT 1
                       )
                  )
                ) AS has_published_grade
           FROM module_activities ma
           LEFT JOIN gradebook_items gi
             ON gi.module_activity_id = ma.id AND gi.status = 'published'
          WHERE ma.id = $2 AND ma.status = 'published'
          ORDER BY gi.position`,
        [studentUserId, activityId],
      );
      const activity = gate.rows[0];
      if (!activity) {
        throw new ApiError(404, "ACTIVITY_NOT_FOUND", "The module activity was not found.");
      }
      if (
        status === "completed" &&
        Number(activity.course_grade_weight_percent) > 0 &&
        (
          !gate.rows.some((row) => row.gradebook_item_id) ||
          gate.rows.some((row) => row.gradebook_item_id && !row.has_published_grade)
        )
      ) {
        throw new ApiError(
          409,
          "ACTIVITY_GRADE_REQUIRED",
          "All graded components must have a published grade before this activity can be completed.",
        );
      }
      const result = await client.query(
        `INSERT INTO student_activity_completions AS existing
          (student_user_id, activity_id, status, evidence, completed_at)
         VALUES ($1, $2, $3, $4::jsonb,
                 CASE WHEN $3 IN ('completed', 'waived') THEN now() ELSE NULL END)
         ON CONFLICT (student_user_id, activity_id) DO UPDATE SET
           status = EXCLUDED.status,
           evidence = EXCLUDED.evidence,
           completed_at = CASE
             WHEN existing.status IN ('completed', 'waived') THEN existing.completed_at
             ELSE EXCLUDED.completed_at
           END,
           updated_at = CASE
             WHEN existing.status IN ('completed', 'waived') THEN existing.updated_at
             ELSE now()
           END
         WHERE existing.status NOT IN ('completed', 'waived')
            OR (
              existing.status = EXCLUDED.status
              AND existing.evidence = EXCLUDED.evidence
            )
         RETURNING *`,
        [studentUserId, activityId, status, JSON.stringify(evidence)],
      );
      if (!result.rowCount) {
        throw new ApiError(
          409,
          "ACTIVITY_COMPLETION_LOCKED",
          "Completed activity evidence is locked and cannot be changed by a student.",
        );
      }
      await client.query("COMMIT");
      const row = result.rows[0];
      return {
        activityId: row.activity_id,
        status: row.status,
        evidence: row.evidence,
        completedAt: row.completed_at,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async listCourseRoster(courseCode) {
    const result = await this.pool.query(
      `SELECT u.public_id AS student_id, u.display_name, u.email,
              ce.status AS enrollment_status, ce.enrolled_at,
              (SELECT count(*)::int
                 FROM student_module_progress p
                 JOIN course_modules cm ON cm.id = p.module_id
                WHERE p.student_user_id = u.id AND cm.course_code = ce.course_code
                  AND p.status = 'completed') AS completed_modules,
              (SELECT count(*)::int FROM course_modules cm
                WHERE cm.course_code = ce.course_code AND cm.status = 'published') AS total_modules
         FROM course_enrollments ce
         JOIN app_users u ON u.id = ce.student_user_id
        WHERE ce.course_code = $1 AND ce.status = 'active' AND u.status = 'active'
        ORDER BY u.display_name, u.public_id`,
      [courseCode],
    );
    return result.rows.map((row) => ({
      studentId: row.student_id,
      displayName: row.display_name,
      email: String(row.email).toLowerCase(),
      enrollmentStatus: row.enrollment_status,
      enrolledAt: row.enrolled_at,
      completedModules: row.completed_modules,
      totalModules: row.total_modules,
    }));
  }

  async listCourseProgress(courseCode) {
    const result = await this.pool.query(
      `SELECT u.public_id AS student_id, u.display_name, u.email,
              cm.id AS module_id, cm.module_number,
              progress.status AS recorded_status,
              progress.started_at, progress.completed_at,
              previous_progress.status AS previous_status,
              override.id AS override_id,
              override.reason AS override_reason,
              override.expires_at AS override_expires_at
         FROM course_enrollments enrollment
         JOIN app_users u
           ON u.id = enrollment.student_user_id
          AND u.role = 'student'
          AND u.status = 'active'
         JOIN course_modules cm
           ON cm.course_code = enrollment.course_code
          AND cm.status = 'published'
         LEFT JOIN student_module_progress progress
           ON progress.student_user_id = u.id
          AND progress.module_id = cm.id
         LEFT JOIN course_modules previous_module
           ON previous_module.course_code = cm.course_code
          AND previous_module.module_number = cm.module_number - 1
         LEFT JOIN student_module_progress previous_progress
           ON previous_progress.student_user_id = u.id
          AND previous_progress.module_id = previous_module.id
         LEFT JOIN LATERAL (
           SELECT id, reason, expires_at
             FROM module_unlock_overrides unlock_override
            WHERE unlock_override.student_user_id = u.id
              AND unlock_override.module_id = cm.id
              AND unlock_override.active = true
              AND (unlock_override.expires_at IS NULL OR unlock_override.expires_at > now())
            ORDER BY unlock_override.created_at DESC
            LIMIT 1
         ) override ON true
        WHERE enrollment.course_code = $1
          AND enrollment.status = 'active'
        ORDER BY u.display_name, u.public_id, cm.module_number`,
      [courseCode],
    );

    const students = [];
    const byStudent = new Map();
    for (const row of result.rows) {
      let student = byStudent.get(row.student_id);
      if (!student) {
        student = {
          studentId: row.student_id,
          displayName: row.display_name,
          email: String(row.email).toLowerCase(),
          modules: [],
        };
        byStudent.set(row.student_id, student);
        students.push(student);
      }
      const status = row.recorded_status ||
        (row.module_number === 0 || row.override_id || row.previous_status === "completed"
          ? "available"
          : "locked");
      student.modules.push({
        moduleId: row.module_id,
        moduleNumber: row.module_number,
        status,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        override: row.override_id
          ? {
              active: true,
              reason: row.override_reason,
              expiresAt: row.override_expires_at,
            }
          : null,
      });
    }
    return { courseCode, students };
  }

  async listCourseGradebook(courseCode) {
    const [itemsResult, roster] = await Promise.all([
      this.pool.query(
        `SELECT id, category, component_key, title, weight_percent, max_score,
                submission_mode, assignment_id, position
           FROM gradebook_items
          WHERE course_code = $1 AND status = 'published'
          ORDER BY position`,
        [courseCode],
      ),
      this.listCourseRoster(courseCode),
    ]);
    const scoresResult = await this.pool.query(
      `WITH latest AS (
         SELECT DISTINCT ON (s.student_user_id, s.assignment_id)
                s.id, s.student_user_id, s.assignment_id
           FROM student_submissions s
          WHERE s.course_code = $1 AND s.status = 'submitted'
          ORDER BY s.student_user_id, s.assignment_id,
                   s.attempt_number DESC, s.submitted_at DESC
       )
       SELECT u.public_id AS student_id, gi.id AS item_id,
              latest.id AS submission_id,
              CASE WHEN direct.id IS NOT NULL THEN direct.score ELSE g.score END AS score,
              CASE WHEN direct.id IS NOT NULL THEN direct.feedback ELSE g.feedback END AS feedback,
              CASE WHEN direct.id IS NOT NULL THEN direct.graded_at ELSE g.graded_at END AS graded_at,
              CASE WHEN direct.id IS NOT NULL THEN direct.published_at ELSE g.published_at END AS published_at,
              CASE WHEN direct.id IS NOT NULL THEN direct.version ELSE g.version END AS version,
              CASE
                WHEN direct.id IS NOT NULL THEN 'direct'
                WHEN g.id IS NOT NULL THEN 'submission'
                ELSE NULL
              END AS grade_source,
              CASE WHEN direct_published.id IS NOT NULL
                THEN direct_published.score ELSE submission_published.score END AS published_score,
              CASE WHEN direct_published.id IS NOT NULL
                THEN direct_published.feedback ELSE submission_published.feedback END AS published_feedback,
              CASE WHEN direct_published.id IS NOT NULL
                THEN direct_published.graded_at ELSE submission_published.graded_at END AS latest_published_graded_at,
              CASE WHEN direct_published.id IS NOT NULL
                THEN direct_published.published_at ELSE submission_published.published_at END AS latest_published_at,
              CASE WHEN direct_published.id IS NOT NULL
                THEN direct_published.version ELSE submission_published.version END AS published_version,
              CASE
                WHEN direct_published.id IS NOT NULL THEN 'direct'
                WHEN submission_published.id IS NOT NULL THEN 'submission'
                ELSE NULL
              END AS published_source
         FROM course_enrollments ce
         JOIN app_users u ON u.id = ce.student_user_id
         CROSS JOIN gradebook_items gi
         LEFT JOIN latest
           ON latest.student_user_id = u.id AND latest.assignment_id = gi.assignment_id
         LEFT JOIN submission_grades g
           ON g.submission_id = latest.id AND g.is_current = true
         LEFT JOIN student_gradebook_scores direct
           ON direct.student_user_id = u.id
          AND direct.gradebook_item_id = gi.id
          AND direct.is_current = true
         LEFT JOIN LATERAL (
           SELECT published.*
             FROM student_gradebook_scores published
            WHERE published.student_user_id = u.id
              AND published.gradebook_item_id = gi.id
              AND published.published_at IS NOT NULL
            ORDER BY published.version DESC
            LIMIT 1
         ) direct_published ON true
         LEFT JOIN LATERAL (
           SELECT published.*
             FROM submission_grades published
            WHERE published.submission_id = latest.id
              AND published.published_at IS NOT NULL
            ORDER BY published.version DESC
            LIMIT 1
         ) submission_published ON true
        WHERE ce.course_code = $1 AND ce.status = 'active'
          AND gi.course_code = $1 AND gi.status = 'published'
        ORDER BY u.public_id, gi.position`,
      [courseCode],
    );
    const scores = new Map();
    for (const row of scoresResult.rows) {
      if (!scores.has(row.student_id)) scores.set(row.student_id, []);
      scores.get(row.student_id).push({
        itemId: row.item_id,
        submissionId: row.submission_id,
        score: row.score,
        feedback: row.feedback,
        gradedAt: row.graded_at,
        publishedAt: row.published_at,
        version: row.version,
        source: row.grade_source,
        latestPublished: row.published_source
          ? {
              score: row.published_score,
              feedback: row.published_feedback,
              gradedAt: row.latest_published_graded_at,
              publishedAt: row.latest_published_at,
              version: row.published_version,
              source: row.published_source,
            }
          : null,
      });
    }
    return {
      courseCode,
      items: itemsResult.rows.map((row) => ({
        id: row.id,
        category: row.category,
        componentKey: row.component_key,
        title: row.title,
        weightPercent: Number(row.weight_percent),
        maxScore: Number(row.max_score),
        submissionMode: row.submission_mode,
        assignmentId: row.assignment_id,
        position: row.position,
      })),
      students: roster.map((student) => ({ ...student, scores: scores.get(student.studentId) || [] })),
    };
  }

  async createDirectGrade(input) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const target = await client.query(
        `SELECT u.id AS student_user_id, u.public_id AS student_id,
                gi.id AS gradebook_item_id, gi.course_code, gi.max_score,
                gi.submission_mode
           FROM app_users u
           JOIN course_enrollments enrollment
             ON enrollment.student_user_id = u.id
            AND enrollment.course_code = $2
            AND enrollment.status = 'active'
           JOIN gradebook_items gi
             ON gi.course_code = enrollment.course_code
            AND gi.id = $3
            AND gi.status = 'published'
          WHERE u.public_id = $1 AND u.role = 'student' AND u.status = 'active'
          LIMIT 1`,
        [input.studentPublicId, input.courseCode, input.gradebookItemId],
      );
      if (!target.rows[0]) {
        throw new ApiError(
          404,
          "STUDENT_GRADEBOOK_ITEM_NOT_FOUND",
          "The enrolled student or gradebook item was not found.",
        );
      }
      const item = target.rows[0];
      if (!new Set(["supervised", "none", "oral_defence"]).has(item.submission_mode)) {
        throw new ApiError(
          422,
          "DIRECT_GRADE_NOT_ALLOWED",
          "This gradebook item must be graded through its student submission.",
        );
      }
      if (input.score > Number(item.max_score)) {
        throw new ApiError(
          422,
          "GRADE_EXCEEDS_MAXIMUM",
          "The score cannot exceed the gradebook item's maximum score.",
        );
      }
      const replay = await client.query(
        `SELECT * FROM student_gradebook_scores
          WHERE graded_by_user_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [input.grader.id, input.idempotencyKey],
      );
      if (replay.rows[0]) {
        if (replay.rows[0].request_fingerprint !== input.requestFingerprint) {
          throw new ApiError(
            409,
            "IDEMPOTENCY_KEY_REUSED",
            "The idempotency key was already used for different grade content.",
          );
        }
        await client.query("COMMIT");
        return this.#mapDirectGrade(replay.rows[0], {
          studentId: item.student_id,
          courseCode: item.course_code,
        });
      }
      const current = await client.query(
        `SELECT * FROM student_gradebook_scores
          WHERE student_user_id = $1 AND gradebook_item_id = $2 AND is_current = true
          FOR UPDATE`,
        [item.student_user_id, item.gradebook_item_id],
      );
      const currentVersion = current.rows[0]?.version || 0;
      if (input.expectedVersion !== currentVersion) {
        throw new ApiError(
          412,
          "DIRECT_GRADE_VERSION_CONFLICT",
          "This grade changed in another session. Refresh before publishing.",
        );
      }
      if (current.rows[0]) {
        await client.query(
          "UPDATE student_gradebook_scores SET is_current = false WHERE id = $1",
          [current.rows[0].id],
        );
      }
      const inserted = await client.query(
        `INSERT INTO student_gradebook_scores
          (student_user_id, gradebook_item_id, version, score, feedback,
           graded_by_user_id, graded_by, idempotency_key, request_fingerprint,
           published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CASE WHEN $10 THEN now() ELSE NULL END)
         RETURNING *`,
        [
          item.student_user_id,
          item.gradebook_item_id,
          currentVersion + 1,
          input.score,
          input.feedback,
          input.grader.id,
          input.grader.publicId,
          input.idempotencyKey,
          input.requestFingerprint,
          input.publish,
        ],
      );
      await client.query("COMMIT");
      return this.#mapDirectGrade(inserted.rows[0], {
        studentId: item.student_id,
        courseCode: item.course_code,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
  }

  async listStudentPublishedDirectGrades(studentUserId, courseCodes) {
    if (!courseCodes.length) return [];
    const result = await this.pool.query(
      `WITH latest_published AS (
         SELECT DISTINCT ON (score.student_user_id, score.gradebook_item_id)
                score.*
           FROM student_gradebook_scores score
          WHERE score.student_user_id = $1
            AND score.published_at IS NOT NULL
          ORDER BY score.student_user_id, score.gradebook_item_id, score.version DESC
       )
       SELECT score.*, gi.course_code, gi.component_key, gi.title,
              gi.weight_percent, gi.max_score, gi.category
         FROM latest_published score
         JOIN gradebook_items gi ON gi.id = score.gradebook_item_id
        WHERE gi.course_code = ANY($2::text[])
          AND gi.status = 'published'
        ORDER BY gi.course_code, gi.position`,
      [studentUserId, courseCodes],
    );
    return result.rows.map((row) => ({
      courseCode: row.course_code,
      gradebookItemId: row.gradebook_item_id,
      componentKey: row.component_key,
      title: row.title,
      category: row.category,
      weightPercent: Number(row.weight_percent),
      maxScore: Number(row.max_score),
      score: row.score,
      feedback: row.feedback,
      gradedBy: row.graded_by,
      gradedAt: row.graded_at,
      publishedAt: row.published_at,
      version: row.version,
      etag: `"direct-grade-v${row.version}"`,
      source: "direct",
    }));
  }

  #mapDirectGrade(row, { studentId, courseCode }) {
    return {
      studentId,
      courseCode,
      gradebookItemId: row.gradebook_item_id,
      score: row.score,
      feedback: row.feedback,
      gradedBy: row.graded_by,
      gradedAt: row.graded_at,
      publishedAt: row.published_at,
      version: row.version,
      etag: `"direct-grade-v${row.version}"`,
      source: "direct",
    };
  }

  async createModuleUnlockOverride({ teacherUserId, studentPublicId, moduleId, reason, expiresAt }) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const target = await client.query(
        `SELECT u.id AS student_user_id, u.public_id AS student_id,
                cm.id AS module_id, cm.course_code
           FROM app_users u
           CROSS JOIN course_modules cm
           JOIN course_enrollments ce
             ON ce.student_user_id = u.id AND ce.course_code = cm.course_code AND ce.status = 'active'
          WHERE u.public_id = $1 AND u.role = 'student' AND u.status = 'active'
            AND cm.id = $2 AND cm.status = 'published'
          LIMIT 1`,
        [studentPublicId, moduleId],
      );
      if (!target.rows[0]) {
        throw new ApiError(404, "STUDENT_MODULE_NOT_FOUND", "The enrolled student or module was not found.");
      }
      await client.query(
        `UPDATE module_unlock_overrides
            SET active = false, revoked_at = now(), revoked_by_user_id = $3
          WHERE student_user_id = $1 AND module_id = $2 AND active = true`,
        [target.rows[0].student_user_id, moduleId, teacherUserId],
      );
      const inserted = await client.query(
        `INSERT INTO module_unlock_overrides
          (student_user_id, module_id, granted_by_user_id, reason, expires_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [target.rows[0].student_user_id, moduleId, teacherUserId, reason, expiresAt || null],
      );
      await client.query("COMMIT");
      const row = inserted.rows[0];
      return {
        id: row.id,
        studentId: target.rows[0].student_id,
        moduleId: row.module_id,
        reason: row.reason,
        expiresAt: row.expires_at,
        active: row.active,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw databaseError(error);
    } finally {
      client.release();
    }
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
      moduleId: row.module_id,
      unitNumber: row.unit_number,
      curriculumUnitNumber:
        row.section_kind === "final_evaluation" ? null : row.unit_number,
      sectionKind: row.section_kind || "unit",
      title: row.title,
      maxAttempts: row.max_attempts,
      submissionMode: row.submission_mode,
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
          section_kind: input.sectionKind,
          curriculum_unit_number: input.curriculumUnitNumber,
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
    if (!filters.includeStaff) {
      conditions.push("m.audience = 'student'");
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM module_resources restricted
         WHERE restricted.drive_material_id = m.id AND restricted.audience = 'staff'
           AND restricted.status = 'published'
      )`);
    }
    if (Array.isArray(filters.allowedCourseCodes)) {
      conditions.push(`m.course_code = ANY(${add(filters.allowedCourseCodes)}::text[])`);
    }
    const limit = Math.min(filters.limit || 50, 100);
    const offset = Math.max(filters.offset || 0, 0);
    values.push(limit + 1, offset);
    const result = await this.pool.query(
      `SELECT m.id, m.course_code, m.unit_number, m.category, m.file_name,
              m.mime_type, m.drive_modified_at, m.size_bytes, m.audience
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
      `SELECT m.*,
              CASE WHEN m.audience = 'staff' OR EXISTS (
                SELECT 1 FROM module_resources restricted
                 WHERE restricted.drive_material_id = m.id AND restricted.audience = 'staff'
                   AND restricted.status = 'published'
              ) THEN 'staff' ELSE 'student' END AS effective_audience
         FROM drive_materials m
        WHERE m.id = $1 AND m.is_active = true LIMIT 1`,
      [materialId],
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], audience: result.rows[0].effective_audience };
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
