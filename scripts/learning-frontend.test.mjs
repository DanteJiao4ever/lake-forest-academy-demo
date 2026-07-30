import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

function memoryStorage(seed = {}) {
  const records = new Map(Object.entries(seed));
  return {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: (key) => records.delete(key),
  };
}

async function renderPortal(hash, session, options = {}) {
  const appRoot = { innerHTML: "" };
  const classList = {
    contains: () => false,
    add() {},
    remove() {},
    toggle() {},
  };
  const document = {
    title: "",
    activeElement: null,
    body: {
      classList,
      style: { removeProperty() {} },
      append() {},
    },
    querySelector: (selector) => (selector === "#app" ? appRoot : null),
    addEventListener() {},
    createElement: () => ({
      className: "",
      classList,
      style: {},
      append() {},
      remove() {},
      setAttribute() {},
    }),
  };
  const sessionStorage = memoryStorage({
    "lake-forest-learning-session-v1": JSON.stringify(session),
  });
  const location = {
    hash,
    hostname: "lakeforestacademy.ca",
    href: `https://lakeforestacademy.ca/learning/${hash}`,
    assign() {},
  };
  const window = {
    location,
    history: {
      replaceState(_state, _title, nextHash) {
        location.hash = nextHash;
      },
    },
    LFA_API_STATUS: { state: "disabled", message: "" },
    LFA_AUTH_CONFIG: {},
    LFA_DRIVE_CONFIG: {},
    LFA_SUBMISSION_CONFIG: {},
    LFA_PLATFORM_API_CONFIG: options.platformApiConfig || {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (callback) => callback(),
    setTimeout,
    clearTimeout,
    scrollTo() {},
    addEventListener() {},
  };
  const context = vm.createContext({
    window,
    document,
    sessionStorage,
    localStorage: memoryStorage(),
    setTimeout,
    clearTimeout,
    URL,
    Date,
    Intl,
    Math,
    JSON,
    Promise,
    Map,
    Set,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    encodeURIComponent,
    decodeURIComponent,
    structuredClone,
    AbortController,
    fetch:
      options.fetch ||
      (async () => {
        throw new Error("Unexpected platform request");
      }),
  });
  vm.runInContext(await source("public/learning/course-catalog.js"), context);
  vm.runInContext(
    await source("public/learning/platform-sequences.js"),
    context,
  );
  vm.runInContext(await source("public/learning/app.js"), context);
  for (let index = 0; index < (options.settleTurns || 8); index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return appRoot.innerHTML;
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

test("bootstrap loads the permanent course metadata and platform sequence before the app", async () => {
  const bootstrap = await source("public/learning/bootstrap.js");
  const catalog = bootstrap.indexOf('loadScript("course-catalog.js")');
  const sequence = bootstrap.indexOf('loadScript("platform-sequences.js")');
  const app = bootstrap.indexOf('loadScript("app.js")');
  assert.ok(catalog >= 0 && sequence > catalog && app > sequence);
});

test("the permanent six-course catalog contains no offering dates", async () => {
  const catalog = await source("public/learning/course-catalog.js");
  assert.doesNotMatch(catalog, /\b(?:TERM|START_DATE|COMPLETION_DATE)\b/);
  assert.doesNotMatch(catalog, /\b(?:term|startDate|completionDate)\s*:/);
});

test("the browser catalog exposes six courses, 72 modules and 38 assignments", async () => {
  const context = { window: {} };
  vm.runInNewContext(
    await source("public/learning/platform-sequences.js"),
    context,
  );
  const catalog = context.window.LFA_PLATFORM_SEQUENCES;
  assert.equal(catalog.courses.length, 6);
  assert.equal(
    catalog.courses.reduce((sum, course) => sum + course.modules.length, 0),
    72,
  );
  const assignments = catalog.courses.flatMap((course) =>
    course.gradebookItems.filter((item) => item.assignmentKey),
  );
  assert.equal(assignments.length, 38);
  for (const code of ["ICS4U", "BBB4M"]) {
    const course = catalog.coursesByCode[code];
    const finalAssignments = course.gradebookItems.filter(
      (item) => item.moduleKey === `${code}-M11` && item.assignmentKey,
    );
    assert.deepEqual(
      Array.from(finalAssignments, (item) => item.weightPercent),
      [10, 15],
    );
  }
  assert.doesNotMatch(JSON.stringify(catalog), /20\d{2}-\d{2}-\d{2}/);
});

test("student and faculty shells consume modules without browser-only authority", async () => {
  const app = await source("public/learning/app.js");
  assert.match(app, /function studentModuleView\(course, module\)/);
  assert.match(app, /function teacherModuleView\(course, module\)/);
  assert.match(app, /\["teacher", "teacher_admin"\]\.includes\(user\?\.role\)/);
  assert.doesNotMatch(app, /existing\.lessons\s*=\s*existingLessons/);
  assert.match(app, /Browser activity is not treated as the school’s official progress record/);
  assert.match(app, /data-action="set-module-complete"/);
  assert.match(app, /PLATFORM_API_CONFIG\.activityProgressEndpoint/);
  assert.match(app, /status: "completed",\s*evidence:/);
  assert.match(app, /id="unlock-override-form"/);
  const renderedReferences = app.replace(
    /\s*delete course\.(?:term|startDate|completionDate);/g,
    "",
  );
  assert.doesNotMatch(
    renderedReferences,
    /course\.(?:term|startDate|completionDate)/,
  );
});

test("student and faculty module routes render the merged course sequence", async () => {
  const student = await renderPortal("#/course/sch4u", {
    email: "student@lakeforestacademy.ca",
    role: "student",
  });
  assert.match(student, /12-Module Learning Path/);
  assert.equal((student.match(/class="platform-module-row/g) || []).length, 12);

  const studentModule = await renderPortal("#/course/sch4u/module/1", {
    email: "student@lakeforestacademy.ca",
    role: "student",
  });
  assert.match(studentModule, /Required Reading Order/);
  assert.match(studentModule, /Self-Study Resources/);
  assert.match(studentModule, /Guided Practice/);
  assert.match(studentModule, /Feedback &amp; Unlock|Feedback & Unlock/);

  for (const code of ["ics4u", "bbb4m"]) {
    const finalModule = await renderPortal(`#/course/${code}/module/11`, {
      email: "student@lakeforestacademy.ca",
      role: "student",
    });
    assert.equal(
      (finalModule.match(new RegExp(`#/assignment/${code}-m11-`, "g")) || [])
        .length,
      2,
    );
    assert.match(finalModule, /\(10%\)/);
    assert.match(finalModule, /\(15%\)/);
  }

  const facultyModule = await renderPortal(
    "#/teacher/course/sch4u/module/2",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
  );
  assert.match(facultyModule, /Teacher Presence/);
  assert.match(facultyModule, /Evidence to Retain/);
  assert.match(facultyModule, /Create Unlock Override/);

  const facultyCourse = await renderPortal("#/teacher/course/sch4u", {
    email: "administrator@lakeforestacademy.ca",
    displayName: "Academic Administrator",
    role: "teacher_admin",
  });
  assert.equal(
    (facultyCourse.match(/#\/teacher\/course\/sch4u\/module\//g) || [])
      .length,
    12,
  );
  assert.match(facultyCourse, /Connect the secure course service to view the official roster and progress/);
  assert.doesNotMatch(facultyCourse, />undefined</);

  const calendar = await renderPortal("#/calendar", {
    email: "student@lakeforestacademy.ca",
    role: "student",
  });
  assert.match(calendar, /Offering schedule/);
  assert.doesNotMatch(calendar, /Invalid Date/);
});

test("platform contracts include published grades, remote unit numbers and direct-grade concurrency headers", async () => {
  const [bootstrap, app] = await Promise.all([
    source("public/learning/bootstrap.js"),
    source("public/learning/app.js"),
  ]);
  assert.match(bootstrap, /studentGradesEndpoint:[\s\S]*\/v1\/me\/grades/);
  assert.match(app, /gradebookItemId: String\(item\.key \|\| ""\)\.toLowerCase\(\)/);
  assert.match(app, /assignment\.unitNumber\s*=\s*[\s\S]*record\.unitNumber/);
  assert.match(app, /upload\.set\("unitNumber", String\(unitNumber\)\)/);
  assert.doesNotMatch(app, /assignment\.unit\.match/);
  assert.match(app, /"If-Match": `"direct-grade-v\$\{version\}"`/);
  assert.match(app, /"Idempotency-Key": requestIdFor\("direct-grade"\)/);
  assert.match(
    app,
    /students\/\$\{encodeURIComponent\(studentId\)\}\/grades\/\$\{encodeURIComponent\(itemId\)\}/,
  );
  assert.match(
    app,
    /platformEndpoint\(\s*PLATFORM_API_CONFIG\.moduleProgressEndpoint,\s*encodeURIComponent\(moduleId\)/,
  );
  assert.match(
    app,
    /platformEndpoint\(\s*PLATFORM_API_CONFIG\.activityProgressEndpoint,\s*encodeURIComponent\(activityId\)/,
  );
});

test("student progress uses only published direct grades and weights supervised and participation results", async () => {
  const platformApiConfig = {
    coursesEndpoint: "https://api.example.test/v1/courses",
    studentProgressEndpoint: "https://api.example.test/v1/me/progress",
    studentGradesEndpoint: "https://api.example.test/v1/me/grades",
  };
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/me/grades") {
      const grades =
        url.searchParams.get("courseCode") === "MHF4U"
          ? [
              {
                courseCode: "MHF4U",
                gradebookItemId: "mhf4u-m11-written-exam",
                title: "MHF4U Mandatory Written Examination",
                category: "Final evaluation",
                weightPercent: 25,
                maxScore: 100,
                score: 80,
                feedback: "Strong supervised result.",
                publishedAt: "published",
              },
              {
                courseCode: "MHF4U",
                gradebookItemId: "mhf4u-participation",
                title: "Attendance and Participation",
                category: "Participation",
                weightPercent: 10,
                maxScore: 100,
                score: 100,
                feedback: "Consistent seminar contribution.",
                publishedAt: "published",
              },
              {
                courseCode: "MHF4U",
                gradebookItemId: "staff-draft",
                title: "STAFF DRAFT MUST STAY HIDDEN",
                category: "Draft",
                weightPercent: 5,
                maxScore: 100,
                score: 100,
                publishedAt: null,
              },
            ]
          : [];
      return jsonResponse({ data: grades });
    }
    return jsonResponse({ data: [] });
  };
  const html = await renderPortal(
    "#/progress",
    { email: "student@lakeforestacademy.ca", role: "student" },
    { platformApiConfig, fetch, settleTurns: 14 },
  );
  assert.match(html, /Attendance and Participation/);
  assert.match(html, /Consistent seminar contribution/);
  assert.match(html, /MHF4U[\s\S]*?<strong class="grade-score">86%<\/strong>/);
  assert.match(html, /35% weight graded/);
  assert.match(html, /<strong>2<\/strong><span>Published gradebook results<\/span>/);
  assert.doesNotMatch(html, /STAFF DRAFT MUST STAY HIDDEN/);
});

test("teacher direct-entry forms exclude submission work and preserve a prior published result behind a draft", async () => {
  const platformApiConfig = {
    coursesEndpoint: "https://api.example.test/v1/courses",
    teacherCoursesEndpoint: "https://api.example.test/v1/teacher/courses",
  };
  const gradebook = {
    courseCode: "MHF4U",
    items: [
      {
        id: "exam",
        title: "Mandatory Written Examination",
        submissionMode: "supervised",
        weightPercent: 25,
        maxScore: 100,
      },
      {
        id: "participation",
        title: "Attendance and Participation",
        submissionMode: "none",
        weightPercent: 10,
        maxScore: 100,
      },
      {
        id: "coursework",
        title: "Submitted Coursework",
        submissionMode: "text_or_file",
        weightPercent: 10,
        maxScore: 100,
      },
    ],
    students: [
      {
        studentId: "student-1",
        displayName: "Sample Student",
        email: "student@example.test",
        scores: [
          {
            itemId: "exam",
            score: 91,
            feedback: "Current staff draft",
            publishedAt: null,
            version: 3,
            latestPublished: {
              score: 88,
              feedback: "Previously published",
              publishedAt: "published",
              version: 2,
            },
          },
          {
            itemId: "participation",
            score: 100,
            feedback: "Published participation",
            publishedAt: "published",
            version: 1,
            latestPublished: {
              score: 100,
              publishedAt: "published",
              version: 1,
            },
          },
          {
            itemId: "coursework",
            score: 70,
            publishedAt: "published",
            version: 1,
            latestPublished: {
              score: 70,
              publishedAt: "published",
              version: 1,
            },
          },
        ],
      },
    ],
  };
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname.endsWith("/MHF4U/gradebook")) {
      return jsonResponse({ data: gradebook });
    }
    return jsonResponse({ data: [] });
  };
  const html = await renderPortal(
    "#/teacher/course/mhf4u",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    { platformApiConfig, fetch, settleTurns: 14 },
  );
  assert.equal((html.match(/class="direct-grade-form"/g) || []).length, 2);
  assert.match(html, /data-item="exam" data-version="3"/);
  assert.match(html, /name="score"[^>]+value="91"/);
  assert.match(html, /Draft · prior result published/);
  assert.doesNotMatch(html, /data-item="coursework"/);
  assert.match(html, /<td>3<\/td><td>45%<\/td><td>87%<\/td>/);
});
