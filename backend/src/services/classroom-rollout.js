import { ApiError } from "../lib/errors.js";

export async function requireClassroomRollout(client, courseCode, userId) {
  const { rows: [scope] } = await client.query(
    "SELECT classroom_rollout_enabled($1,$2) AS enabled",
    [courseCode, userId],
  );
  if (!scope.enabled) {
    throw new ApiError(403, "CLASSROOM_NOT_ENABLED", "This workspace is unavailable for your course section.");
  }
}
