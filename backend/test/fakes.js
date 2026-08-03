import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { isDeepStrictEqual } from "node:util";
import { ApiError } from "../src/lib/errors.js";
import { evaluateUnlockPolicy, policyRequires } from "../src/lib/unlock-policy.js";

function unlockCriteria(weightPercent, moduleNumber) {
  return {
    version: 1,
    scope: moduleNumber === 11 ? "course_completion" : "next_module",
    operator: "all",
    derivation: "platform_policy_not_natural_language_parser",
    conditions: [
      { type: "source_module_completed" },
      { type: "required_activity_completed" },
      Number(weightPercent) > 0
        ? { type: "all_gradebook_components_published" }
        : { type: "required_activity_evidence_present" },
    ],
  };
}

export class FakeRepository {
  constructor() {
    this.users = [];
    this.sessions = new Map();
    this.passwordResetTokens = [];
    this.enrollments = new Map();
    this.teacherCourses = new Map();
    this.submissions = [];
    this.grades = [];
    this.audit = [];
    this.courseCatalog = new Map([
      ["MHF4U", { code: "MHF4U", title: "Advanced Functions", status: "active" }],
      ["SCH4U", { code: "SCH4U", title: "Chemistry", status: "active" }],
      ["ICS4U", { code: "ICS4U", title: "Computer Science", status: "active" }],
      ["SPH4U", { code: "SPH4U", title: "Physics", status: "active" }],
      ["MCV4U", { code: "MCV4U", title: "Calculus and Vectors", status: "active" }],
      ["BBB4M", { code: "BBB4M", title: "International Business Fundamentals", status: "active" }],
    ]);
    this.modules = [
      {
        id: "mhf4u-m00", courseCode: "MHF4U", moduleNumber: 0, unitNumber: null,
        title: "Start Here", unitTitle: "Course Orientation", estimatedCreditHours: 0,
        lessons: [],
        resources: [
          { id: "mhf4u-m00-r01", position: 1, title: "Student guide", provider: "LFA", kind: "external_url", url: "https://example.invalid/student", assignedUse: "Read", audience: "student" },
          { id: "mhf4u-m00-r02", position: 2, title: "Teacher answer key", provider: "LFA", kind: "external_url", url: "https://example.invalid/staff", assignedUse: "Review", audience: "staff" },
        ],
        activity: { id: "mhf4u-m00-activity", type: "orientation", title: "Orientation", weightPercent: 0, sequence: [], processCheckpoints: [], authenticationEvidence: [], components: [], isRequired: true },
      },
      {
        id: "mhf4u-m01", courseCode: "MHF4U", moduleNumber: 1, unitNumber: 1,
        title: "Functions", unitTitle: "Functions", estimatedCreditHours: 8,
        lessons: [{ id: "MHF4U-U1-L1", position: 1, title: "Function Models" }],
        resources: [],
        activity: { id: "mhf4u-m01-activity", type: "formative", title: "Readiness Check", weightPercent: 0, sequence: [], processCheckpoints: [], authenticationEvidence: [], components: [], isRequired: true },
      },
      {
        id: "mhf4u-m02", courseCode: "MHF4U", moduleNumber: 2, unitNumber: 1,
        title: "Function Assessment", unitTitle: "Functions", estimatedCreditHours: 14,
        lessons: [], resources: [],
        activity: { id: "mhf4u-m02-activity", type: "coursework", title: "Function Assessment", weightPercent: 10, sequence: [], processCheckpoints: [], authenticationEvidence: [], components: [], isRequired: true },
      },
      {
        id: "mhf4u-m11", courseCode: "MHF4U", moduleNumber: 11, unitNumber: null,
        title: "Final Evaluation", unitTitle: "Final Evaluation", estimatedCreditHours: 10,
        lessons: [], resources: [],
        activity: { id: "mhf4u-m11-activity", type: "final_evaluation", title: "Written Examination", weightPercent: 25, sequence: [], processCheckpoints: [], authenticationEvidence: [], components: [], isRequired: true },
      },
    ];
    this.moduleProgress = new Map();
    this.activityCompletions = new Map();
    this.unlockOverrides = [];
    this.directGrades = [];
    this.gradebookItems = [
      { id: "mhf4u-m02-coursework", courseCode: "MHF4U", moduleActivityId: "mhf4u-m02-activity", category: "coursework", componentKey: "m02-coursework", title: "Exponential and Logarithmic Model Audit", weightPercent: 10, maxScore: 100, submissionMode: "text_or_file", assignmentId: "mhf4u-m02-assignment", position: 1 },
      { id: "mhf4u-m11-written-exam", courseCode: "MHF4U", moduleActivityId: "mhf4u-m11-activity", category: "final_evaluation", componentKey: "m11-written-exam", title: "MHF4U Mandatory Written Examination", weightPercent: 25, maxScore: 100, submissionMode: "supervised", assignmentId: "mhf4u-m11-assignment", position: 2 },
      { id: "mhf4u-participation", courseCode: "MHF4U", moduleActivityId: null, category: "participation", componentKey: "participation", title: "Attendance and Participation", weightPercent: 10, maxScore: 100, submissionMode: "none", assignmentId: null, position: 3 },
      { id: "mhf4u-oral-defence", courseCode: "MHF4U", moduleActivityId: null, category: "final_evaluation", componentKey: "oral-defence", title: "Authenticated Oral Defence", weightPercent: 5, maxScore: 100, submissionMode: "oral_defence", assignmentId: null, position: 4 },
    ];
    this.assignments = new Map([
      ["a1", { id: "a1", courseCode: "MHF4U", moduleId: null, moduleNumber: null, unitNumber: 2, sectionKind: "unit", title: "Quadratic Models Investigation", instructions: "", rubric: [], weightPercent: null, submissionMode: "text_or_file", availableFrom: null, dueAt: null, availableUntil: null, maxAttempts: 99, status: "active" }],
      ["mhf4u-m02-assignment", { id: "mhf4u-m02-assignment", courseCode: "MHF4U", moduleId: "mhf4u-m02", moduleNumber: 2, unitNumber: 1, sectionKind: "unit", title: "Exponential and Logarithmic Model Audit", instructions: "Authenticated modelling report", rubric: [], weightPercent: 10, submissionMode: "text_or_file", availableFrom: null, dueAt: null, availableUntil: null, maxAttempts: 99, status: "active" }],
      ["mhf4u-m11-assignment", { id: "mhf4u-m11-assignment", courseCode: "MHF4U", moduleId: "mhf4u-m11", moduleNumber: 11, unitNumber: 11, sectionKind: "final_evaluation", title: "MHF4U Mandatory Written Examination", instructions: "Supervised examination", rubric: [], weightPercent: 25, submissionMode: "supervised", availableFrom: null, dueAt: null, availableUntil: null, maxAttempts: 99, status: "active" }],
      ["legacy-a1", { id: "legacy-a1", courseCode: "MHF4U", moduleId: null, moduleNumber: null, unitNumber: 1, sectionKind: "unit", title: "Legacy assignment", instructions: "", rubric: [], weightPercent: null, submissionMode: "text_or_file", availableFrom: null, dueAt: null, availableUntil: null, maxAttempts: 99, status: "active" }],
    ]);
    this.target = {
      id: randomUUID(),
      root_folder_id: "1vDhdvq7y15q6AEklYR0wq0PZAH2wkcVK",
      drive_id: null,
    };
    this.materials = [
      {
        id: randomUUID(),
        source_id: "00000000-0000-4000-8000-000000000006",
        course_code: "MHF4U",
        module_id: "mhf4u-m02",
        module_number: 2,
        unit_number: 2,
        category: "Lessons",
        file_name: "Quadratic models.pdf",
        mime_type: "application/pdf",
        size_bytes: 42,
        drive_modified_at: "2026-07-20T10:00:00.000Z",
        source_last_successful_sync_at: "2026-08-03T00:00:00.000Z",
        drive_file_id: "drive-material-1",
        audience: "student",
      },
    ];
    this.sources = [{
      id: "00000000-0000-4000-8000-000000000006",
      display_name: "Lotus Grade 12 Six-Course Library",
      drive_kind: "my_drive",
      drive_id: null,
      root_folder_id: "canonical-root-test",
      root_folder_name: "Lotus Academy Formal Course Pilots - Text Based",
      credential_type: "service_account",
      credential_ref: "adc://runtime-service-account",
      configuration_origin: "system_config",
      status: "active",
      verification_status: "verified",
      last_verification_at: "2026-08-03T00:00:00.000Z",
      last_successful_sync_at: "2026-08-03T00:00:00.000Z",
      created_at: "2026-08-03T00:00:00.000Z",
    }];
    this.driveCatalogStats = {
      canonical_source_active: true,
      verification_status: "verified",
      active_material_count: 60,
      course_count: 6,
      minimum_course_distribution: true,
      last_successful_sync_at: "2026-08-03T00:00:00.000Z",
      last_verification_at: "2026-08-03T00:00:00.000Z",
      last_verification_error_code: null,
    };
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

  async createPasswordResetToken({
    id,
    userId,
    tokenHash,
    expiresAt,
    notBefore,
  }) {
    const recent = this.passwordResetTokens
      .filter((item) => item.userId === userId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];
    if (recent && new Date(recent.createdAt) >= new Date(notBefore)) {
      return { created: false };
    }
    for (const item of this.passwordResetTokens) {
      if (item.userId === userId && !item.consumedAt) {
        item.consumedAt = new Date().toISOString();
      }
    }
    const record = {
      id,
      userId,
      tokenHash,
      expiresAt: new Date(expiresAt).toISOString(),
      consumedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.passwordResetTokens.push(record);
    return { created: true, id, expiresAt: record.expiresAt };
  }

  async revokePasswordResetToken(tokenHash) {
    const token = this.passwordResetTokens.find(
      (item) => item.tokenHash === tokenHash,
    );
    if (token && !token.consumedAt) token.consumedAt = new Date().toISOString();
  }

  async findPasswordResetTokenUser(tokenHash) {
    const token = this.passwordResetTokens.find(
      (item) =>
        item.tokenHash === tokenHash &&
        !item.consumedAt &&
        new Date(item.expiresAt) > new Date(),
    );
    if (!token) return null;
    const user = this.users.find((item) => item.id === token.userId);
    return user?.status === "active" ? user : null;
  }

  async consumePasswordResetToken({ tokenHash, userId, passwordHash }) {
    const token = this.passwordResetTokens.find(
      (item) =>
        item.tokenHash === tokenHash &&
        item.userId === userId &&
        !item.consumedAt &&
        new Date(item.expiresAt) > new Date(),
    );
    if (!token) return false;
    const user = this.users.find(
      (item) => item.id === userId && item.status === "active",
    );
    if (!user) return false;
    user.passwordHash = passwordHash;
    for (const item of this.passwordResetTokens) {
      if (item.userId === userId && !item.consumedAt) {
        item.consumedAt = new Date().toISOString();
      }
    }
    for (const [key, session] of this.sessions) {
      if (session.userId === userId) this.sessions.delete(key);
    }
    return true;
  }

  async updatePasswordAndRevokeSessions({ userId, passwordHash }) {
    const user = this.users.find(
      (item) => item.id === userId && item.status === "active",
    );
    if (!user) throw new ApiError(404, "USER_NOT_FOUND", "The account is unavailable.");
    user.passwordHash = passwordHash;
    for (const [key, session] of this.sessions) {
      if (session.userId === userId) this.sessions.delete(key);
    }
    for (const item of this.passwordResetTokens) {
      if (item.userId === userId && !item.consumedAt) {
        item.consumedAt = new Date().toISOString();
      }
    }
    return true;
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

  async catalogReady() {
    return {
      courses: 6, modules: 72, lessons: 120, resources: 198, activities: 72,
      gradebook_items: 44, assessment_components: 38,
      valid_unlock_policies: 72, final_evaluation_assignments: 8,
      unit_assignments: 30,
      invalid_course_hours: 0, invalid_course_weights: 0,
    };
  }

  async driveCatalogReady() {
    return { ...this.driveCatalogStats };
  }

  materialSourceIsReadable(material) {
    const source = material.source_id
      ? this.sources.find((item) => item.id === material.source_id)
      : this.sources[0];
    return Boolean(
      source &&
      source.status === "active" &&
      source.verification_status === "verified" &&
      source.last_successful_sync_at,
    );
  }

  async listCoursesForUser(user) {
    const allowed = await this.listAccessibleCourseCodes(user);
    return allowed.map((code) => {
      const course = this.courseCatalog.get(code);
      const modules = this.modules.filter((item) => item.courseCode === code);
      const readableMaterials = this.materials.filter(
        (item) =>
          item.course_code === code &&
          this.materialSourceIsReadable(item) &&
          (user.role !== "student" || item.audience === "student"),
      );
      return course
        ? {
            ...course,
            moduleCount: modules.length,
            plannedHours: modules.reduce((total, item) => total + item.estimatedCreditHours, 0),
            materials: {
              count: readableMaterials.length,
              lastSyncedAt: readableMaterials[0]
                ?.source_last_successful_sync_at || null,
              href: `/v1/courses/${encodeURIComponent(code)}/materials`,
            },
          }
        : null;
    }).filter(Boolean);
  }

  async getModule(moduleId) {
    const module = this.modules.find((item) => item.id === moduleId);
    return module ? { ...module, status: "published" } : null;
  }

  async getActivity(activityId) {
    const module = this.modules.find((item) => item.activity?.id === activityId);
    return module
      ? {
          id: activityId,
          moduleId: module.id,
          courseCode: module.courseCode,
          moduleNumber: module.moduleNumber,
          completionCriteria: module.unlockCriteria || unlockCriteria(
            module.activity.weightPercent,
            module.moduleNumber,
          ),
          status: "published",
        }
      : null;
  }

  async listCourseModules(courseCode, { includeStaff = false } = {}) {
    return this.modules
      .filter((item) => item.courseCode === courseCode)
      .map((item) => {
        const {
          processCheckpoints,
          authenticationEvidence,
          ...studentActivity
        } = item.activity || {};
        const studentComponents = (studentActivity.components || []).map(
          ({ processCheckpoints: _processCheckpoints, ...component }) => component,
        );
        return {
          ...item,
          learningFocus: [], coreReadingOrder: [], guidedPractice: "", lowStakesCheck: "",
          feedbackAndUnlock: "Complete the required activity before continuing.",
          unlockRule: {
            ruleText: "Complete the required activity before continuing.",
            criteria: item.unlockCriteria || unlockCriteria(
              item.activity?.weightPercent,
              item.moduleNumber,
            ),
            teacherOverrideAllowed: true,
            overrideReasonRequired: true,
          },
          workloadLabel: "",
          ...(includeStaff ? { teacherPresence: "", evidenceToRetain: "" } : {}),
          resources: item.resources.filter((resource) => includeStaff || resource.audience === "student"),
          activity: includeStaff
            ? { ...item.activity }
            : { ...studentActivity, components: studentComponents },
        };
      });
  }

  async listCourseAssignments(courseCode, { includeInactive = false } = {}) {
    return [...this.assignments.values()].filter(
      (assignment) => assignment.courseCode === courseCode && assignment.moduleId &&
        (includeInactive || assignment.status === "active"),
    );
  }

  async listStudentProgress(studentUserId, courseCode) {
    const modules = this.modules.filter((item) => item.courseCode === courseCode);
    return modules.map((module, index) => {
      const saved = this.moduleProgress.get(`${studentUserId}:${module.id}`);
      const previous = index ? this.moduleProgress.get(`${studentUserId}:${modules[index - 1].id}`) : null;
      const override = this.unlockOverrides.find(
        (item) => item.studentUserId === studentUserId && item.moduleId === module.id && item.active &&
          (!item.expiresAt || new Date(item.expiresAt) > new Date()),
      );
      const recordedStatus = ["in_progress", "completed"].includes(saved?.status)
        ? saved.status
        : null;
      return {
        courseCode,
        moduleId: module.id,
        moduleNumber: module.moduleNumber,
        status: recordedStatus || (module.moduleNumber === 0 || previous?.status === "completed" || override ? "available" : "locked"),
        startedAt: saved?.startedAt || null,
        completedAt: saved?.completedAt || null,
        override: override ? { active: true, reason: override.reason, expiresAt: override.expiresAt } : null,
      };
    });
  }

  async upsertStudentModuleProgress(studentUserId, moduleId, status) {
    const module = this.modules.find((item) => item.id === moduleId);
    if (!module) throw new ApiError(404, "MODULE_NOT_FOUND", "The course module was not found.");
    const courseModules = this.modules.filter((item) => item.courseCode === module.courseCode);
    const index = courseModules.findIndex((item) => item.id === moduleId);
    const previous = index > 0 ? this.moduleProgress.get(`${studentUserId}:${courseModules[index - 1].id}`) : null;
    const override = this.unlockOverrides.find((item) => item.studentUserId === studentUserId && item.moduleId === moduleId && item.active);
    const existing = this.moduleProgress.get(`${studentUserId}:${moduleId}`);
    if (index > 0 && previous?.status !== "completed" && !override && !existing) {
      throw new ApiError(409, "MODULE_LOCKED", "Complete the previous module or ask your teacher for an override.");
    }
    const completion = this.activityCompletions.get(`${studentUserId}:${module.activity.id}`);
    if (status === "completed") {
      const activityCompleted = ["completed", "waived"].includes(completion?.status);
      const policy = evaluateUnlockPolicy(
        module.unlockCriteria || unlockCriteria(
          module.activity.weightPercent,
          module.moduleNumber,
        ),
        {
          source_module_completed: true,
          required_activity_completed: activityCompleted,
          required_activity_evidence_present: Boolean(
            completion?.evidence && Object.keys(completion.evidence).length,
          ),
          all_gradebook_components_published: activityCompleted,
        },
      );
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
    const now = new Date().toISOString();
    const saved = { moduleId, status, startedAt: existing?.startedAt || now, completedAt: status === "completed" ? now : null };
    this.moduleProgress.set(`${studentUserId}:${moduleId}`, saved);
    return saved;
  }

  async upsertStudentActivityCompletion(studentUserId, activityId, status, evidence = {}) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new ApiError(404, "ACTIVITY_NOT_FOUND", "The module activity was not found.");
    const completionKey = `${studentUserId}:${activityId}`;
    const existing = this.activityCompletions.get(completionKey);
    if (
      ["completed", "waived"].includes(existing?.status) &&
      (status !== existing.status || !isDeepStrictEqual(evidence, existing.evidence))
    ) {
      throw new ApiError(
        409,
        "ACTIVITY_COMPLETION_LOCKED",
        "Completed activity evidence is locked and cannot be changed by a student.",
      );
    }
    if (existing && ["completed", "waived"].includes(existing.status)) return existing;
    const module = this.modules.find((item) => item.id === activity.moduleId);
    const policy = evaluateUnlockPolicy(activity.completionCriteria, {
      source_module_completed: true,
      required_activity_completed: true,
      required_activity_evidence_present: true,
      all_gradebook_components_published: true,
    });
    if (!policy.valid) {
      throw new ApiError(
        503,
        "UNLOCK_POLICY_INVALID",
        "The course unlock policy is unavailable. No completion was recorded.",
      );
    }
    if (
      status === "completed" &&
      policyRequires(activity.completionCriteria, "required_activity_evidence_present") &&
      Object.keys(evidence).length === 0
    ) {
      throw new ApiError(
        422,
        "ACTIVITY_EVIDENCE_REQUIRED",
        "Record the required activity evidence before completing this module.",
      );
    }
    if (status === "completed" && Number(module.activity.weightPercent) > 0) {
      const items = this.gradebookItems.filter((item) => item.moduleActivityId === activityId);
      const allItemsGraded = items.length > 0 && items.every((item) => {
        const direct = this.directGrades.find(
          (grade) => grade.studentUserId === studentUserId &&
            grade.gradebookItemId === item.id && grade.publishedAt,
        );
        if (direct) return true;
        const latest = this.submissions
          .filter((submission) =>
            submission.studentUserId === studentUserId &&
            submission.assignmentId === item.assignmentId &&
            submission.status === "submitted")
          .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
        return Boolean(latest?.grade?.publishedAt);
      });
      if (!allItemsGraded) {
        throw new ApiError(
          409,
          "ACTIVITY_GRADE_REQUIRED",
          "All graded components must have a published grade before this activity can be completed.",
        );
      }
    }
    const saved = { activityId, status, evidence, completedAt: status === "completed" ? new Date().toISOString() : null };
    this.activityCompletions.set(completionKey, saved);
    return saved;
  }

  async listCourseRoster(courseCode) {
    return this.users
      .filter((user) => user.role === "student" && (this.enrollments.get(user.id) || []).includes(courseCode))
      .map((user) => ({
        studentId: user.publicId, displayName: user.displayName, email: user.email,
        enrollmentStatus: "active", enrolledAt: null,
        completedModules: this.modules.filter((module) =>
          module.courseCode === courseCode && this.moduleProgress.get(`${user.id}:${module.id}`)?.status === "completed").length,
        totalModules: this.modules.filter((module) => module.courseCode === courseCode).length,
      }));
  }

  async listCourseProgress(courseCode) {
    const roster = await this.listCourseRoster(courseCode);
    const students = await Promise.all(
      roster.map(async (student) => {
        const user = this.users.find((item) => item.publicId === student.studentId);
        return {
          studentId: student.studentId,
          displayName: student.displayName,
          email: student.email,
          modules: user ? await this.listStudentProgress(user.id, courseCode) : [],
        };
      }),
    );
    return { courseCode, students };
  }

  async listCourseGradebook(courseCode) {
    const items = this.gradebookItems.filter((item) => item.courseCode === courseCode);
    const roster = await this.listCourseRoster(courseCode);
    return {
      courseCode,
      items,
      students: roster.map((student) => {
        const user = this.users.find((item) => item.publicId === student.studentId);
        return {
          ...student,
          scores: items.map((item) => {
            const direct = this.directGrades.find((grade) =>
              grade.studentUserId === user.id && grade.gradebookItemId === item.id && grade.isCurrent);
            const directPublished = this.directGrades
              .filter((grade) => grade.studentUserId === user.id &&
                grade.gradebookItemId === item.id && grade.publishedAt)
              .sort((a, b) => b.version - a.version)[0];
            const latestSubmission = this.submissions
              .filter((submission) =>
                submission.studentUserId === user.id && submission.assignmentId === item.assignmentId)
              .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
            const submissionGrade = latestSubmission?.currentGrade || null;
            const grade = direct || submissionGrade;
            const published = directPublished || latestSubmission?.grade || null;
            return {
              itemId: item.id,
              submissionId: direct ? null : latestSubmission?.id || null,
              score: grade?.score ?? null,
              feedback: grade?.feedback ?? null,
              gradedAt: grade?.gradedAt ?? null,
              publishedAt: grade?.publishedAt ?? null,
              version: grade?.version ?? null,
              source: direct ? "direct" : submissionGrade ? "submission" : null,
              latestPublished: published
                ? {
                    score: published.score,
                    feedback: published.feedback,
                    gradedAt: published.gradedAt,
                    publishedAt: published.publishedAt,
                    version: published.version,
                    source: directPublished ? "direct" : "submission",
                  }
                : null,
            };
          }),
        };
      }),
    };
  }

  async createDirectGrade(input) {
    const student = this.users.find((user) =>
      user.publicId === input.studentPublicId && user.role === "student" && user.status === "active");
    const item = this.gradebookItems.find((candidate) =>
      candidate.id === input.gradebookItemId && candidate.courseCode === input.courseCode);
    if (!student || !item || !(this.enrollments.get(student.id) || []).includes(input.courseCode)) {
      throw new ApiError(404, "STUDENT_GRADEBOOK_ITEM_NOT_FOUND", "The enrolled student or gradebook item was not found.");
    }
    if (!["supervised", "none", "oral_defence"].includes(item.submissionMode)) {
      throw new ApiError(422, "DIRECT_GRADE_NOT_ALLOWED", "This gradebook item must be graded through its student submission.");
    }
    if (input.score > item.maxScore) {
      throw new ApiError(422, "GRADE_EXCEEDS_MAXIMUM", "The score cannot exceed the gradebook item's maximum score.");
    }
    const replay = this.directGrades.find((grade) =>
      grade.graderId === input.grader.id && grade.idempotencyKey === input.idempotencyKey);
    if (replay) {
      if (replay.requestFingerprint !== input.requestFingerprint) {
        throw new ApiError(409, "IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used for different grade content.");
      }
      return this.mapDirectGrade(replay);
    }
    const current = this.directGrades.find((grade) =>
      grade.studentUserId === student.id && grade.gradebookItemId === item.id && grade.isCurrent);
    const currentVersion = current?.version || 0;
    if (currentVersion !== input.expectedVersion) {
      throw new ApiError(412, "DIRECT_GRADE_VERSION_CONFLICT", "This grade changed in another session.");
    }
    if (current) current.isCurrent = false;
    const now = new Date().toISOString();
    const saved = {
      id: randomUUID(),
      studentUserId: student.id,
      studentId: student.publicId,
      courseCode: item.courseCode,
      gradebookItemId: item.id,
      score: input.score,
      feedback: input.feedback,
      gradedBy: input.grader.publicId,
      gradedAt: now,
      publishedAt: input.publish ? now : null,
      version: currentVersion + 1,
      isCurrent: true,
      graderId: input.grader.id,
      idempotencyKey: input.idempotencyKey,
      requestFingerprint: input.requestFingerprint,
      source: "direct",
    };
    this.directGrades.push(saved);
    return this.mapDirectGrade(saved);
  }

  mapDirectGrade(grade) {
    return {
      studentId: grade.studentId,
      courseCode: grade.courseCode,
      gradebookItemId: grade.gradebookItemId,
      score: grade.score,
      feedback: grade.feedback,
      gradedBy: grade.gradedBy,
      gradedAt: grade.gradedAt,
      publishedAt: grade.publishedAt,
      version: grade.version,
      etag: `"direct-grade-v${grade.version}"`,
      source: "direct",
    };
  }

  async listStudentPublishedDirectGrades(studentUserId, courseCodes) {
    const latest = new Map();
    for (const grade of this.directGrades) {
      if (grade.studentUserId !== studentUserId || !grade.publishedAt ||
          !courseCodes.includes(grade.courseCode)) continue;
      const current = latest.get(grade.gradebookItemId);
      if (!current || grade.version > current.version) latest.set(grade.gradebookItemId, grade);
    }
    return [...latest.values()]
      .sort((a, b) => {
        const aItem = this.gradebookItems.find((item) => item.id === a.gradebookItemId);
        const bItem = this.gradebookItems.find((item) => item.id === b.gradebookItemId);
        return a.courseCode.localeCompare(b.courseCode) || aItem.position - bItem.position;
      })
      .map((grade) => {
        const item = this.gradebookItems.find((candidate) => candidate.id === grade.gradebookItemId);
        return {
          courseCode: grade.courseCode,
          gradebookItemId: grade.gradebookItemId,
          componentKey: item.componentKey,
          title: item.title,
          category: item.category,
          weightPercent: item.weightPercent,
          maxScore: item.maxScore,
          score: grade.score,
          feedback: grade.feedback,
          gradedBy: grade.gradedBy,
          gradedAt: grade.gradedAt,
          publishedAt: grade.publishedAt,
          version: grade.version,
          etag: `"direct-grade-v${grade.version}"`,
          source: "direct",
        };
      });
  }

  async createModuleUnlockOverride({ teacherUserId, studentPublicId, moduleId, reason, expiresAt }) {
    const student = this.users.find((user) => user.publicId === studentPublicId && user.role === "student");
    const module = this.modules.find((item) => item.id === moduleId);
    if (!student || !module || !(this.enrollments.get(student.id) || []).includes(module.courseCode)) {
      throw new ApiError(404, "STUDENT_MODULE_NOT_FOUND", "The enrolled student or module was not found.");
    }
    this.unlockOverrides.forEach((item) => {
      if (item.studentUserId === student.id && item.moduleId === moduleId) item.active = false;
    });
    const saved = {
      id: randomUUID(), studentUserId: student.id, studentId: student.publicId,
      moduleId, teacherUserId, reason, expiresAt: expiresAt || null, active: true,
    };
    this.unlockOverrides.push(saved);
    return saved;
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
    let records = this.materials.filter(
      (item) =>
        this.materialSourceIsReadable(item) &&
        filters.allowedCourseCodes.includes(item.course_code) &&
        (filters.includeStaff || item.audience !== "staff"),
    );
    if (filters.courseCode) {
      records = records.filter((item) => item.course_code === filters.courseCode);
    }
    if (filters.moduleId) {
      records = records.filter((item) => item.module_id === filters.moduleId);
    }
    if (filters.moduleNumber !== undefined) {
      records = records.filter(
        (item) => item.module_number === filters.moduleNumber,
      );
    }
    if (filters.unitNumber !== undefined) {
      records = records.filter((item) => item.unit_number === filters.unitNumber);
    }
    if (filters.category) {
      records = records.filter((item) => item.category === filters.category);
    }
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return records.slice(offset, offset + limit + 1);
  }
  async getMaterial(id) {
    return this.materials.find(
      (item) => item.id === id && this.materialSourceIsReadable(item),
    ) || null;
  }
  async recordAudit(event) { this.audit.push(event); }

  async createDriveSource(input, actorId) {
    const row = {
      id: randomUUID(),
      display_name: input.displayName,
      drive_kind: input.driveKind,
      drive_id: input.driveId || null,
      root_folder_id: input.rootFolderId,
      root_folder_name: input.rootFolderName,
      credential_type: input.credentialType,
      credential_ref: input.credentialRef,
      configuration_origin: "admin_api",
      status: "active",
      verification_status: "pending",
      last_verification_at: null,
      created_by: actorId,
      created_at: new Date().toISOString(),
    };
    this.sources.push(row);
    return row;
  }

  async listDriveSources() { return [...this.sources]; }

  async ensureSystemDriveSource({ rootFolderId, rootFolderName }) {
    let source = this.sources.find(
      (item) => item.drive_kind === "my_drive" && item.root_folder_id === rootFolderId,
    );
    if (!source) {
      source = {
        id: randomUUID(),
        display_name: "Configured Grade 12 Six-Course Library",
        drive_kind: "my_drive",
        drive_id: null,
        root_folder_id: rootFolderId,
        root_folder_name: rootFolderName,
        credential_type: "service_account",
        credential_ref: "adc://runtime-service-account",
        configuration_origin: "system_config",
        status: "active",
        verification_status: "pending",
        last_verification_at: null,
        last_successful_sync_at: null,
      };
      this.sources.push(source);
    }
    return source;
  }

  async getCanonicalDriveSource(rootFolderId) {
    return this.sources.find(
      (source) =>
        source.drive_kind === "my_drive" &&
        source.root_folder_id === rootFolderId,
    ) || null;
  }

  async getDriveSource(sourceId) {
    return this.sources.find((source) => source.id === sourceId) || null;
  }

  async updateDriveSourceStatus(sourceId, status) {
    const source = await this.getDriveSource(sourceId);
    if (!source) return null;
    source.status = status;
    return source;
  }

  async createSyncRun({
    sourceId,
    mode,
    idempotencyKey,
    actorId,
    triggerType = "manual",
  }) {
    let effectiveIdempotencyKey = idempotencyKey;
    let replay = this.syncRuns.find(
      (run) =>
        run.source_id === sourceId &&
        run.idempotency_key === effectiveIdempotencyKey,
    );
    while (replay && triggerType === "system_bootstrap" && replay.status === "failed") {
      effectiveIdempotencyKey = `system-bootstrap-retry:${replay.id}`;
      replay = this.syncRuns.find(
        (run) =>
          run.source_id === sourceId &&
          run.idempotency_key === effectiveIdempotencyKey,
      );
    }
    if (replay) return replay;
    const run = {
      id: randomUUID(),
      source_id: sourceId,
      mode,
      idempotency_key: effectiveIdempotencyKey,
      requested_by: actorId,
      trigger_type: triggerType,
      status: "queued",
      discovered_file_count: 0,
      created_file_count: 0,
      updated_file_count: 0,
      deactivated_file_count: 0,
      skipped_file_count: 0,
    };
    this.syncRuns.push(run);
    return run;
  }

  async getSyncRun(runId) {
    return this.syncRuns.find((run) => run.id === runId) || null;
  }

  async markSyncRunning(runId) {
    const run = await this.getSyncRun(runId);
    if (!run || run.status !== "queued") return null;
    run.status = "running";
    run.started_at = new Date().toISOString();
    return run;
  }

  async finishMaterialSync(run, records, skippedCount = 0) {
    const stored = await this.getSyncRun(run.id);
    stored.status = "succeeded";
    stored.discovered_file_count = records.length;
    stored.created_file_count = records.length;
    stored.skipped_file_count = skippedCount;
    stored.finished_at = new Date().toISOString();
    const source = await this.getDriveSource(run.source_id);
    source.verification_status = "verified";
    source.last_verification_at = stored.finished_at;
    source.last_successful_sync_at = stored.finished_at;
    source.last_verification_error_code = null;
  }

  async failSync(runId, code, message) {
    const run = await this.getSyncRun(runId);
    if (!run) return;
    run.status = "failed";
    run.error_code = code;
    run.error_message = message;
    run.finished_at = new Date().toISOString();
    const source = await this.getDriveSource(run.source_id);
    if (source) {
      source.verification_status = "failed";
      source.last_verification_at = run.finished_at;
      source.last_verification_error_code = code;
    }
  }

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
    this.curriculumReadyChecks = [];
    this.available = true;
    this.curriculumAvailable = true;
    this.curriculumRecords = [
      "SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M",
    ].flatMap((courseCode) =>
      ["01", "02", "05", "06", "07"].flatMap((component) =>
        ["docx", "pdf"].map((extension) => {
          const fileName =
            `Lotus_Academy_${courseCode}_${component}_Student_Material.${extension}`;
          return {
            driveFileId:
              `drive-${courseCode.toLowerCase()}-${component}-${extension}`,
            parentFolderId: `folder-${courseCode.toLowerCase()}`,
            courseCode,
            moduleId: null,
            unitNumber: null,
            category: component === "02" ? "Assessments" : "Resources",
            fileName,
            relativePath:
              `Lotus Academy Formal Course Pilots - Text Based/${courseCode}/Student_Materials/${fileName}`,
            mimeType: extension === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            webViewLink: null,
            modifiedAt: "2026-08-03T00:00:00.000Z",
            sizeBytes: 100,
          };
        }),
      ),
    );
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

  async curriculumReady(rootFolderId, rootFolderName) {
    this.curriculumReadyChecks.push({ rootFolderId, rootFolderName });
    if (!this.curriculumAvailable) {
      throw new ApiError(
        503,
        "CURRICULUM_DRIVE_UNAVAILABLE",
        "Curriculum storage is temporarily unavailable.",
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

  async listCurriculumFiles() {
    return {
      records: this.curriculumRecords.map((record) => ({ ...record })),
      skippedCount: 0,
      discoveredCourseCodes: [...new Set(
        this.curriculumRecords.map((record) => record.courseCode),
      )],
      materialCourseCodes: [...new Set(
        this.curriculumRecords.map((record) => record.courseCode),
      )],
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
