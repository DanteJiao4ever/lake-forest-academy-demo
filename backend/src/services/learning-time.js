// A learner can have overlapping sessions within a source and across sources.
// Union the ranges independently for each source and for the whole course.
export async function platformLearningTime(db, course, studentId, testSection) {
  const {rows: [time]} = await db.query(`
    WITH buckets AS (
      SELECT coalesce(source, 'all') AS source, range_agg(observed) AS spans
      FROM course_engagement_intervals
      WHERE course_code=$1 AND student_id=$2 AND test_section=$3
      GROUP BY GROUPING SETS ((source), ())
    ), durations AS (
      SELECT source, coalesce(sum(extract(epoch FROM upper(span)-lower(span))), 0)::int AS seconds
      FROM buckets LEFT JOIN LATERAL unnest(spans) AS span ON true
      GROUP BY source
    )
    SELECT (SELECT sum(estimated_credit_hours)::float8 FROM course_modules
            WHERE course_code=$1 AND status='published') AS "plannedHours",
           jsonb_object_agg(source, seconds) AS "observedSeconds"
    FROM durations`, [course, studentId, testSection]);
  return time;
}
