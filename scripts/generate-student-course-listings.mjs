import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { courseGroups } from "../src/data/course-guide.ts";

// This projection is public course-planning information. Enrollment and lessons
// come from the authenticated API.
export function studentListingsScript() {
  const listings = courseGroups.flatMap(group => group.courses.map(course => ({
    ...course, subject: group.title,
  })));
  return "// Generated from src/data/course-guide.ts by scripts/generate-student-course-listings.mjs\nwindow.LFA_COURSE_LISTINGS = " + JSON.stringify(listings, null, 2) + ";\n";
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await writeFile(new URL("../public/learning/course-listings.js", import.meta.url), studentListingsScript());
}
