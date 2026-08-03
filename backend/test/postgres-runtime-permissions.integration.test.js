import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createPool, PostgresRepository } from "../src/db/postgres.js";

const runtimeDatabaseUrl = process.env.RUNTIME_DATABASE_URL || "";

test(
  "least-privileged runtime supports progress, file submission, feedback, and grading",
  { skip: !runtimeDatabaseUrl },
  async () => {
    const pool = createPool({
      databaseUrl: runtimeDatabaseUrl,
      databaseSocket: "",
      databaseSsl: false,
      databasePoolMax: 2,
    });
    const repository = new PostgresRepository(pool);
    const suffix = randomUUID();

    try {
      const privilege = await pool.query(
        "SELECT has_table_privilege(current_user, 'course_modules', 'UPDATE') AS can_update_catalog",
      );
      assert.equal(privilege.rows[0].can_update_catalog, false);

      const interactionPrivileges = await pool.query(
        `SELECT
           has_table_privilege(current_user, 'submission_messages', 'SELECT') AS messages_select,
           has_table_privilege(current_user, 'submission_messages', 'INSERT') AS messages_insert,
           has_table_privilege(current_user, 'submission_messages', 'UPDATE') AS messages_update,
           has_table_privilege(current_user, 'submission_messages', 'DELETE') AS messages_delete,
           has_table_privilege(current_user, 'user_notifications', 'SELECT') AS notifications_select,
           has_table_privilege(current_user, 'user_notifications', 'INSERT') AS notifications_insert,
           has_table_privilege(current_user, 'user_notifications', 'DELETE') AS notifications_delete,
           has_column_privilege(current_user, 'user_notifications', 'read_at', 'UPDATE') AS read_at_update,
           has_column_privilege(current_user, 'user_notifications', 'title', 'UPDATE') AS title_update`,
      );
      assert.deepEqual(interactionPrivileges.rows[0], {
        messages_select: true,
        messages_insert: true,
        messages_update: false,
        messages_delete: false,
        notifications_select: true,
        notifications_insert: true,
        notifications_delete: false,
        read_at_update: true,
        title_update: false,
      });

      const user = await repository.createUser({
        publicId: `ci-progress-${suffix}`,
        email: `ci-progress-${suffix}@example.invalid`,
        passwordHash: "ci-only-non-plaintext-password-hash",
        firstName: "CI",
        lastName: "Student",
        displayName: "CI Student",
        role: "student",
      });
      await pool.query(
        "INSERT INTO course_enrollments (student_user_id, course_code) VALUES ($1, 'ICS4U')",
        [user.id],
      );

      const progress = await repository.upsertStudentModuleProgress(
        user.id,
        "ics4u-m00",
        "in_progress",
      );
      assert.equal(progress.moduleId, "ics4u-m00");
      assert.equal(progress.status, "in_progress");

      const submissionTarget = await repository.createSubmissionTarget(
        {
          displayName: `CI submission target ${suffix}`,
          driveKind: "my_drive",
          driveId: null,
          rootFolderId: `ci-submissions-${suffix}`,
          rootFolderName: "CI Student Submissions",
          credentialType: "service_account",
          credentialRef: `ci-secret-${suffix}`,
        },
        user.id,
      );
      const activeSubmissionTarget = await repository.getActiveSubmissionTarget();
      assert.equal(activeSubmissionTarget.id, submissionTarget.id);

      const submissionId = randomUUID();
      const submissionFileId = randomUUID();
      const submission = await repository.createSubmission(
        {
          id: submissionId,
          studentUserId: user.id,
          studentId: user.publicId,
          studentName: user.displayName,
          studentEmail: user.email,
          studentFirstName: user.firstName,
          studentLastName: user.lastName,
          courseCode: "ICS4U",
          unitNumber: 1,
          curriculumUnitNumber: 1,
          sectionKind: "unit",
          assignmentId: "ics4u-m02-assignment",
          assignmentTitle: "Local Data-Quality Utility",
          attemptNumber: 1,
          note: "CI interaction evidence",
          idempotencyKey: `ci-submission-${suffix}`,
          requestFingerprint: "a".repeat(64),
        },
        [
          {
            id: submissionFileId,
            targetId: activeSubmissionTarget.id,
            driveFileId: `ci-drive-file-${suffix}`,
            driveParentFolderId: `ci-drive-parent-${suffix}`,
            originalName: "ci-submission.pdf",
            storedName: `${submissionFileId}.pdf`,
            relativePath: `CI Student Submissions/ICS4U/${user.publicId}/Unit 1/ics4u-m02-assignment/Attempt 1/${submissionFileId}.pdf`,
            mimeType: "application/pdf",
            sizeBytes: 128,
            sha256: "e".repeat(64),
            webViewLink: "https://drive.google.com/file/d/ci-test/view",
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        ],
      );
      assert.equal(submission.id, submissionId);
      assert.equal(submission.files.length, 1);
      assert.equal(submission.files[0].id, submissionFileId);

      const message = await repository.createSubmissionMessage({
        submissionId,
        author: user,
        messageType: "comment",
        body: "CI verifies the append-only interaction path.",
        idempotencyKey: `ci-message-${suffix}`,
        requestFingerprint: "b".repeat(64),
      });
      assert.equal(message.submissionId, submissionId);

      const grader = await repository.createUser({
        publicId: `ci-teacher-${suffix}`,
        email: `ci-teacher-${suffix}@example.invalid`,
        passwordHash: "ci-only-non-plaintext-password-hash",
        firstName: "CI",
        lastName: "Teacher",
        displayName: "CI Teacher",
        role: "teacher",
      });
      const draftGrade = await repository.createGrade({
        submissionId,
        score: 82,
        feedback: "CI draft feedback must remain private.",
        publish: false,
        grader,
        expectedVersion: 0,
        idempotencyKey: `ci-grade-draft-${suffix}`,
        requestFingerprint: "c".repeat(64),
      });
      assert.equal(draftGrade.score, 82);
      assert.equal(draftGrade.publishedAt, null);

      const studentDraftView = await repository.getSubmission(
        submissionId,
        "student",
      );
      assert.equal(studentDraftView.grade, null);
      assert.equal(studentDraftView.files.length, 1);
      assert.equal(studentDraftView.files[0].id, submissionFileId);
      assert.equal(studentDraftView.messages.length, 1);
      assert.equal(studentDraftView.messages[0].id, message.id);

      const publishedGrade = await repository.createGrade({
        submissionId,
        score: 84,
        feedback: "CI published feedback.",
        publish: true,
        grader,
        expectedVersion: 1,
        idempotencyKey: `ci-grade-publish-${suffix}`,
        requestFingerprint: "d".repeat(64),
      });
      assert.equal(publishedGrade.publishedAt instanceof Date, true);
      const studentPublishedView = await repository.getSubmission(
        submissionId,
        "student",
      );
      assert.equal(studentPublishedView.grade.score, 84);

      const notificationId = randomUUID();
      await pool.query(
        `INSERT INTO user_notifications
          (id, recipient_user_id, actor_user_id, notification_type,
           course_code, submission_id, title, body, href, dedupe_key)
         VALUES ($1,$2,$2,'submission_message','ICS4U',$3,$4,$5,$6,$7)`,
        [
          notificationId,
          user.id,
          submissionId,
          "CI interaction notification",
          "Runtime notification read-state verification.",
          "#/assignment/ics4u-m02-assignment",
          `ci-notification-${suffix}`,
        ],
      );
      const notification = await repository.markNotificationRead(
        user.id,
        notificationId,
      );
      assert.equal(notification.id, notificationId);
      assert.ok(notification.readAt);
    } finally {
      await repository.close();
    }
  },
);
