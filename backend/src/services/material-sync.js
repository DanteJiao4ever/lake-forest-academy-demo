export class MaterialSyncService {
  constructor({ repository, drive, logger }) {
    this.repository = repository;
    this.drive = drive;
    this.logger = logger;
  }

  async process(runId) {
    try {
      const run = await this.repository.markSyncRunning(runId);
      if (!run) return this.repository.getSyncRun(runId);
      const source = await this.repository.getDriveSource(run.source_id);
      if (!source || source.status !== "active") {
        throw Object.assign(new Error("The Drive source is not active."), {
          code: "DRIVE_SOURCE_DISABLED",
        });
      }
      const result = await this.drive.listCurriculumFiles(source);
      await this.repository.finishMaterialSync(
        run,
        result.records,
        result.skippedCount || 0,
      );
    } catch (error) {
      this.logger?.error(
        { runId, code: error?.code || "DRIVE_SYNC_FAILED" },
        "Drive sync failed",
      );
      try {
        await this.repository.failSync(
          runId,
          error?.code || "DRIVE_SYNC_FAILED",
          error?.statusCode && error.statusCode < 500
            ? error.message
            : "The configured Drive source could not be synchronized.",
        );
      } catch (recordError) {
        this.logger?.error(
          { runId, code: recordError?.code || "SYNC_FAILURE_RECORD_FAILED" },
          "Drive sync failure could not be recorded",
        );
        throw recordError;
      }
    }
    return this.repository.getSyncRun(runId);
  }
}
