import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { ApiError } from "../src/lib/errors.js";

export class FakeRepository {
  constructor() {
    this.users = [];
    this.sessions = new Map();
    this.enrollments = new Map();
    this.teacherCourses = new Map();
    this.submissions = [];
    this.grades = [];
    this.audit = [];
    this.assignments = new Map([
      ["a1", { id: "a1", courseCode: "MHF4U", unitNumber: 2, title: "Quadratic Models Investigation", maxAttempts: 99 }],
    ]);
    this.target = {
      id: randomUUID(),
      root_folder_id: "1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK",
      drive_id: null,
    };
    this.materials = [
      {
        id: randomUUID(),
        course_code: "MHF4U",
        unit_number: 2,
        category: "Lessons",
        file_name: "Quadratic models.pdf",
        mime_type: "application/pdf",
        size_bytes: 42,
        drive_modified_at: "2026-07-20T10:00:00.000Z",
        drive_file_id: "drive-material-1",
      },
    ];
    this.sources = [];
    this.targets = [];
    this.syncRuns = [];
  }

  async ready() { return true; }
  async close() {}

  async createStudentWithEnrollments(user, courseCodes) {
    if (this.users.some((item) => item.email === user.email)) {
      throw new ApiError(409, "EMAIL_ALREADY_REGISTERED", "An account already exists for this email address.");
    }
    const created = { ...user, id: randomUUID(), status: "active" };
    this.users.push(created);
    this.enrollments.set(created.id, [...courseCodes]);
    return created;
  }

  async createUser(user) {
    const created = { ...user, id: randomUUID(), status: "active" };
    this.users.push(created);
    return created;
  }

  async findUserByEmail(email) {
    return this.users.find((user) => user.email === email) || null;
  }

  async setTeacherCourses(userId, courseCodes) {
    this.teacherCourses.set(userId, [...courseCodes]);
  }

  async createSession({ id, userId, tokenHash, csrfTokenHash, expiresAt }) {
    const session = { id, userId, tokenHash, csrfTokenHash, expiresAt };
    this.sessions.set(tokenHash, session);
    return session;
  }

  async getSessionUser(tokenHash) {
    const session = this.sessions.get(tokenHash);
    if (!session || new Date(session.expiresAt) <= new Date()) return null;
    const user = this.users.find((item) => item.id === session.userId);
    return user
      ? { sessionId: session.id, csrfTokenHash: session.csrfTokenHash, expiresAt: session.expiresAt, user }
      : null;
  }

  async rotateSessionCsrf(sessionId, csrfTokenHash) {
    const session = [...this.sessions.values()].find((item) => item.id === sessionId);
    if (session) session.csrfTokenHash = csrfTokenHash;
  }

  async deleteSession(sessionId) {
    for (const [key, session] of this.sessions) {
      if (session.id === sessionId) this.sessions.delete(key);
    }
  }

  async listEnrollments(userId) {
    return this.enrollments.get(userId) || [];
  }

  async replaceEnrollments(userId, codes) {
    this.enrollments.set(userId, [...codes]);
    return codes;
  }

  async canAccessCourse(user, courseCode) {
    if (user.role === "teacher_admin") return true;
    const courses = user.role === "student"
      ? this.enrollments.get(user.id) || []
      : this.teacherCourses.get(user.id) || [];
    return courses.includes(courseCode);
  }

  async listAccessibleCourseCodes(user) {
    if (user.role === "teacher_admin") return ["SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M"];
    return user.role === "student"
      ? this.enrollments.get(user.id) || []
      : this.teacherCourses.get(user.id) || [];
  }

  async getAssignment(id) { return this.assignments.get(id) || null; }
  async getActiveSubmissionTarget() { return this.target; }

  async findSubmissionByIdempotency(userId, key) {
    return this.submissions.find((item) => item.studentUserId === userId && item.idempotencyKey === key) || null;
  }

  async getLatestSubmissionAttempt(studentUserId, courseCode, assignmentId) {
    const latest = this.submissions
      .filter(
        (item) =>
          item.studentUserId === studentUserId &&
          item.courseCode === courseCode &&
          item.assignmentId === assignmentId,
      )
      .sort(
        (a, b) =>
          b.attemptNumber - a.attemptNumber ||
          new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0),
      )[0];
    return latest
      ? { id: latest.id, attemptNumber: latest.attemptNumber }
      : null;
  }

  async createSubmission(input, files) {
    const record = {
      ...input,
      files: files.map((file) => ({
        id: file.id,
        name: file.originalName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        driveFileId: file.driveFileId,
      })),
      status: "submitted",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      grade: null,
    };
    this.submissions.unshift(record);
    return record;
  }

  async listSubmissions(user, filters) {
    let records = [...this.submissions];
    if (user.role === "student") records = records.filter((item) => item.studentUserId === user.id);
    if (user.role === "teacher") {
      const allowed = this.teacherCourses.get(user.id) || [];
      records = records.filter((item) => allowed.includes(item.courseCode));
    }
    if (filters.courseCode) records = records.filter((item) => item.courseCode === filters.courseCode);
    if (filters.unitNumber) records = records.filter((item) => item.unitNumber === filters.unitNumber);
    if (filters.assignmentId) records = records.filter((item) => item.assignmentId === filters.assignmentId);
    if (filters.studentId) records = records.filter((item) => item.studentId === filters.studentId);
    return records.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) + 1);
  }

  async getSubmission(id, role = "teacher") {
    const found = this.submissions.find((item) => item.id === id);
    if (!found) return null;
    if (role === "student" && found.grade && !found.grade.publishedAt) {
      return { ...found, grade: null };
    }
    return found;
  }

  async getSubmissionFile(submissionId, fileId) {
    const submission = this.submissions.find((item) => item.id === submissionId);
    const file = submission?.files.find((item) => item.id === fileId);
    return file
      ? {
          id: file.id,
          drive_file_id: file.driveFileId,
          original_file_name: file.name,
          mime_type: file.mimeType,
          student_user_id: submission.studentUserId,
          course_code: submission.courseCode,
        }
      : null;
  }

  async createGrade(input) {
    const replay = this.grades.find((item) => item.graderId === input.grader.id && item.idempotencyKey === input.idempotencyKey);
    if (replay) {
      if (replay.requestFingerprint !== input.requestFingerprint) {
        throw new ApiError(409, "IDEMPOTENCY_KEY_REUSED", "The key was reused.");
      }
      return replay.grade;
    }
    const submission = this.submissions.find((item) => item.id === input.submissionId);
    const current = submission?.currentGrade || null;
    const version = current?.version || 0;
    if (version !== input.expectedVersion) {
      throw new ApiError(412, "GRADE_VERSION_CONFLICT", "This grade changed in another session.");
    }
    const now = new Date().toISOString();
    const grade = {
      submissionId: input.submissionId,
      score: input.score,
      feedback: input.feedback,
      gradedBy: input.grader.publicId,
      gradedAt: now,
      publishedAt: input.publish ? now : null,
      version: version + 1,
      etag: `"grade-v${version + 1}"`,
    };
    submission.currentGrade = grade;
    if (input.publish) submission.grade = grade;
    this.grades.push({ graderId: input.grader.id, idempotencyKey: input.idempotencyKey, requestFingerprint: input.requestFingerprint, grade });
    return grade;
  }

  async listMaterials(filters) {
    return this.materials.filter((item) => filters.allowedCourseCodes.includes(item.course_code));
  }
  async getMaterial(id) { return this.materials.find((item) => item.id === id) || null; }
  async recordAudit(event) { this.audit.push(event); }

  async createSubmissionTarget(input, actorId) {
    const row = {
      id: randomUUID(), display_name: input.displayName, drive_kind: input.driveKind,
      drive_id: input.driveId || null, root_folder_id: input.rootFolderId,
      root_folder_name: input.rootFolderName, credential_type: input.credentialType,
      status: "active", created_by: actorId, created_at: new Date().toISOString(),
    };
    this.targets.push(row);
    return row;
  }
  async listSubmissionTargets() { return this.targets; }
}

export class FakeDrive {
  constructor() {
    this.uploads = [];
    this.deleted = [];
    this.readyChecks = [];
    this.available = true;
  }

  async ready(rootFolderId) {
    this.readyChecks.push(rootFolderId);
    if (!this.available) {
      throw new ApiError(
        503,
        "SUBMISSION_STORAGE_UNAVAILABLE",
        "Submission storage is temporarily unavailable.",
      );
    }
    return true;
  }

  async uploadSubmission(input) {
    const driveFileId = `drive-${this.uploads.length + 1}`;
    this.uploads.push({ ...input, driveFileId });
    const now = new Date().toISOString();
    return {
      driveFileId,
      parentFolderId: "parent-folder",
      webViewLink: "https://drive.google.com/file/d/private/view",
      createdAt: now,
      modifiedAt: now,
    };
  }

  async deleteFile(id) { this.deleted.push(id); }

  async openFile() {
    return {
      kind: "stream",
      stream: Readable.from(Buffer.from("private file")),
      metadata: { mimeType: "application/pdf" },
    };
  }
}

export class FakeScanner {
  constructor() { this.scans = 0; this.available = true; }
  async ready() {
    if (!this.available) {
      throw new ApiError(
        503,
        "MALWARE_SCANNER_UNAVAILABLE",
        "File scanning is temporarily unavailable.",
      );
    }
    return true;
  }
  async scan() { this.scans += 1; return { clean: true }; }
}
