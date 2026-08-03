import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("runtime configuration separates core and upload readiness", async () => {
  const [bootstrap, runtimeConfigSource, viteConfig] = await Promise.all([
    source("public/learning/bootstrap.js"),
    source("public/learning/runtime-config.json"),
    source("vite.config.ts"),
  ]);
  const runtimeConfig = JSON.parse(runtimeConfigSource);

  assert.equal(runtimeConfig.healthPath, "/health/ready");
  assert.equal(runtimeConfig.uploadHealthPath, "/health/upload-ready");
  assert.match(bootstrap, /healthPath:\s*"\/health\/ready"/);
  assert.match(
    bootstrap,
    /uploadHealthPath:\s*"\/health\/upload-ready"/,
  );
  assert.match(
    bootstrap,
    /driveCatalogHealthPath:\s*"\/health\/drive-catalog-ready"/,
  );
  assert.match(
    bootstrap,
    /passwordResetHealthPath:\s*"\/health\/password-reset-ready"/,
  );
  assert.match(
    bootstrap,
    /accountSecurityHealthPath:\s*"\/health\/account-security-ready"/,
  );
  assert.match(viteConfig, /LFA_API_HEALTH_PATH \|\| "\/health\/ready"/);
  assert.match(
    viteConfig,
    /LFA_API_UPLOAD_HEALTH_PATH \|\| "\/health\/upload-ready"/,
  );
});

test("production deployment gates email recovery on delegated Gmail readiness", async () => {
  const workflow = await source(".github/workflows/deploy-backend.yml");

  assert.match(
    workflow,
    /PASSWORD_RESET_MAIL_PROVIDER: \$\{\{ vars\.PASSWORD_RESET_MAIL_PROVIDER \|\| 'disabled' \}\}/,
  );
  assert.match(
    workflow,
    /GMAIL_SERVICE_ACCOUNT_JSON_BASE64=.*GMAIL_CREDENTIALS_SECRET/,
  );
  assert.match(
    workflow,
    /probe "\/health\/password-reset-ready" "password-reset-ready"/,
  );
  assert.match(
    workflow,
    /probe "\/health\/account-security-ready" "account-security-ready"/,
  );
  assert.match(
    workflow,
    /SUBMISSION_TARGET_ROOT_ID: \$\{\{ vars\.SUBMISSION_TARGET_ROOT_ID \}\}/,
  );
  assert.match(
    workflow,
    /SUBMISSION_TARGET_ROOT_ID=\$\{\{ env\.SUBMISSION_TARGET_ROOT_ID \}\}/,
  );
  assert.doesNotMatch(
    workflow,
    /SUBMISSION_TARGET_ROOT_ID=[A-Za-z0-9_-]{20,}/,
  );
});

async function bootstrapConfiguration({
  coreReady = true,
  uploadReady = true,
  driveCatalogReady = true,
  passwordResetReady = true,
  accountSecurityReady = true,
} = {}) {
  const requestedUrls = [];
  const loadedScripts = [];
  const window = {
    location: { hostname: "lakeforestacademy.ca" },
    LFA_RUNTIME_CONFIG: {
      apiOrigin: "https://api.example.test",
      healthPath: "/health/ready",
      uploadHealthPath: "/health/upload-ready",
      driveCatalogHealthPath: "/health/drive-catalog-ready",
      passwordResetHealthPath: "/health/password-reset-ready",
      accountSecurityHealthPath: "/health/account-security-ready",
      healthTimeoutMs: 1000,
      driveSyncPath: "/v1/admin/drive/sources/source-1/sync",
    },
    setTimeout: (...args) => {
      const timer = setTimeout(...args);
      timer.unref?.();
      return timer;
    },
    clearTimeout,
  };
  const document = {
    querySelector: () => null,
    createElement: () => ({}),
    head: {
      append(script) {
        loadedScripts.push(script.src);
        queueMicrotask(() => script.onload?.());
      },
    },
  };
  const readinessResponse = (ready) => ({
    ok: ready,
    json: async () => ({ status: ready ? "ready" : "unavailable" }),
  });
  const fetch = async (request) => {
    const value = String(request);
    requestedUrls.push(value);
    if (value.startsWith("./runtime-config.json")) {
      return { ok: true, json: async () => ({}) };
    }
    const url = new URL(value);
    if (url.pathname === "/health/ready") {
      return readinessResponse(coreReady);
    }
    if (url.pathname === "/health/upload-ready") {
      return readinessResponse(uploadReady);
    }
    if (url.pathname === "/health/drive-catalog-ready") {
      return readinessResponse(driveCatalogReady);
    }
    if (url.pathname === "/health/password-reset-ready") {
      return readinessResponse(passwordResetReady);
    }
    if (url.pathname === "/health/account-security-ready") {
      return readinessResponse(accountSecurityReady);
    }
    throw new Error(`Unexpected bootstrap request: ${value}`);
  };
  const context = vm.createContext({
    window,
    document,
    fetch,
    URL,
    Date,
    AbortController,
    Object,
    String,
    Number,
    Boolean,
    Array,
    Set,
    Promise,
  });

  vm.runInContext(await source("public/learning/bootstrap.js"), context);
  for (let turn = 0; turn < 20 && loadedScripts.length < 3; turn += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }

  return { window, requestedUrls, loadedScripts };
}

test("core readiness opens sign-in while a failed upload check stays isolated", async () => {
  const { window, requestedUrls, loadedScripts } =
    await bootstrapConfiguration({ uploadReady: false });

  assert.equal(window.LFA_API_STATUS.state, "ready");
  assert.equal(window.LFA_UPLOAD_STATUS.state, "unavailable");
  assert.equal(window.LFA_DRIVE_CATALOG_STATUS.state, "ready");
  assert.equal(
    window.LFA_AUTH_CONFIG.loginEndpoint,
    "https://api.example.test/v1/auth/login",
  );
  assert.equal(
    window.LFA_AUTH_CONFIG.passwordResetRequestEndpoint,
    "https://api.example.test/v1/auth/password-reset-requests",
  );
  assert.equal(
    window.LFA_AUTH_CONFIG.passwordResetEndpoint,
    "https://api.example.test/v1/auth/password-resets",
  );
  assert.equal(
    window.LFA_AUTH_CONFIG.passwordChangeEndpoint,
    "https://api.example.test/v1/auth/password-change",
  );
  assert.equal(window.LFA_DRIVE_CONFIG.uploadReady, false);
  assert.equal(window.LFA_DRIVE_CONFIG.catalogReady, true);
  assert.equal(window.LFA_DRIVE_CONFIG.sourceConfigured, true);
  assert.equal("rootFolderId" in window.LFA_DRIVE_CONFIG, false);
  assert.equal("rootFolderUrl" in window.LFA_DRIVE_CONFIG, false);
  assert.equal(
    window.LFA_DRIVE_CONFIG.syncEndpoint,
    "https://api.example.test/v1/admin/drive/sources/source-1/sync",
  );
  assert.equal(
    window.LFA_DRIVE_CONFIG.submissionsEndpoint,
    "https://api.example.test/v1/submissions",
  );
  assert.equal(
    window.LFA_PLATFORM_API_CONFIG.notificationsEndpoint,
    "https://api.example.test/v1/me/notifications",
  );
  assert.ok(requestedUrls.some((url) => url.endsWith("/health/ready")));
  assert.ok(
    requestedUrls.some((url) => url.endsWith("/health/upload-ready")),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.endsWith("/health/drive-catalog-ready"),
    ),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.endsWith("/health/password-reset-ready"),
    ),
  );
  assert.ok(
    requestedUrls.some((url) =>
      url.endsWith("/health/account-security-ready"),
    ),
  );
  assert.deepEqual(loadedScripts, [
    "./course-catalog.js?v=student-teacher-interaction-v1",
    "./platform-sequences.js?v=student-teacher-interaction-v1",
    "./app.js?v=student-teacher-interaction-v1",
  ]);
});

test("password recovery stays hidden until its email sender is ready", async () => {
  const { window } = await bootstrapConfiguration({
    coreReady: true,
    passwordResetReady: false,
  });

  assert.equal(window.LFA_API_STATUS.state, "ready");
  assert.equal(window.LFA_AUTH_CONFIG.passwordResetRequestEndpoint, "");
  assert.equal(window.LFA_AUTH_CONFIG.passwordResetEndpoint, "");
  assert.equal(
    window.LFA_AUTH_CONFIG.passwordChangeEndpoint,
    "https://api.example.test/v1/auth/password-change",
  );
});

test("password change stays hidden until the new account-security API is ready", async () => {
  const { window } = await bootstrapConfiguration({
    coreReady: true,
    accountSecurityReady: false,
  });

  assert.equal(window.LFA_API_STATUS.state, "ready");
  assert.equal(window.LFA_AUTH_CONFIG.passwordChangeEndpoint, "");
  assert.notEqual(window.LFA_AUTH_CONFIG.loginEndpoint, "");
});

test("failed core readiness keeps password sign-in fail-closed", async () => {
  const { window } = await bootstrapConfiguration({
    coreReady: false,
    uploadReady: true,
  });

  assert.equal(window.LFA_API_STATUS.state, "unavailable");
  assert.equal(window.LFA_AUTH_CONFIG.loginEndpoint, "");
  assert.equal(window.LFA_DRIVE_CONFIG.submissionsEndpoint, "");
  assert.equal(window.LFA_DRIVE_CONFIG.uploadReady, false);
  assert.equal(window.LFA_DRIVE_CONFIG.catalogReady, false);
  assert.equal(window.LFA_DRIVE_CONFIG.sourceConfigured, false);
  assert.equal(window.LFA_DRIVE_CATALOG_STATUS.state, "unavailable");
});

test("failed Drive catalogue readiness leaves courses usable and material actions closed", async () => {
  const { window } = await bootstrapConfiguration({
    coreReady: true,
    uploadReady: true,
    driveCatalogReady: false,
  });

  assert.equal(window.LFA_API_STATUS.state, "ready");
  assert.equal(window.LFA_UPLOAD_STATUS.state, "ready");
  assert.equal(window.LFA_DRIVE_CATALOG_STATUS.state, "unavailable");
  assert.equal(window.LFA_DRIVE_CONFIG.catalogReady, false);
  assert.equal(window.LFA_DRIVE_CONFIG.materialsEndpoint, "");
  assert.equal(window.LFA_DRIVE_CONFIG.sourceConfigured, true);
  assert.equal(
    window.LFA_DRIVE_CONFIG.syncEndpoint,
    "https://api.example.test/v1/admin/drive/sources/source-1/sync",
  );
  assert.equal(
    window.LFA_PLATFORM_API_CONFIG.coursesEndpoint,
    "https://api.example.test/v1/courses",
  );

  const html = await renderPortal(
    "#/courses",
    { email: "student@lakeforestacademy.ca", role: "student" },
    {
      platformApiConfig: {
        coursesEndpoint: "https://api.example.test/v1/courses",
      },
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = {
          state: "unavailable",
          message:
            "Course materials are temporarily unavailable. Courses remain available.",
        };
      },
    },
  );
  assert.match(html, /My Courses/);
  assert.match(html, /Open Course/);
  assert.match(html, /Materials Temporarily Unavailable/);
  assert.doesNotMatch(html, /data-action="toggle-course-materials"/);
});

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
  const listeners = new Map();
  const windowSetTimeout = (...args) => {
    const timer = setTimeout(...args);
    timer.unref?.();
    return timer;
  };
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
    querySelector: (selector) =>
      selector === "#app"
        ? appRoot
        : options.querySelector?.(selector) || null,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
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
    ...(options.sessionStorageSeed || {}),
  });
  const localStorage = memoryStorage(options.localStorageSeed || {});
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
    LFA_SUBMISSION_CONFIG: options.submissionConfig || {},
    LFA_PLATFORM_API_CONFIG: options.platformApiConfig || {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: (callback) => callback(),
    setTimeout: windowSetTimeout,
    clearTimeout,
    scrollTo() {},
    addEventListener() {},
  };
  const context = vm.createContext({
    window,
    document,
    sessionStorage,
    localStorage,
    setTimeout,
    clearTimeout,
    URL,
    URLSearchParams,
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
    FormData: options.FormData || FormData,
    File: options.File || class BrowserFile {},
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
  options.beforeApp?.(context.window);
  vm.runInContext(await source("public/learning/app.js"), context);
  for (let index = 0; index < (options.settleTurns ?? 8); index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  if (options.interact) {
    await options.interact({
      appRoot,
      context,
      document,
      listeners,
      localStorage,
      sessionStorage,
      window,
    });
    for (
      let index = 0;
      index < (options.interactionSettleTurns ?? 4);
      index += 1
    ) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
  return options.returnHarness
    ? {
        html: appRoot.innerHTML,
        context,
        document,
        listeners,
        localStorage,
        sessionStorage,
        window,
      }
    : appRoot.innerHTML;
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

test("anonymous session checks preserve the selected faculty sign-in portal", async () => {
  const result = await renderPortal("#/signin/faculty", null, {
    beforeApp(window) {
      window.LFA_AUTH_CONFIG = {
        loginEndpoint: "https://api.example.test/v1/auth/login",
        registrationEndpoint: "https://api.example.test/v1/auth/register",
        workspaceSessionEndpoint: "https://api.example.test/v1/auth/session",
        workspaceLogoutEndpoint: "https://api.example.test/v1/auth/logout",
      };
    },
    fetch: async (request) => {
      const url = new URL(String(request));
      if (url.pathname === "/v1/auth/session") {
        return jsonResponse(
          {
            error: {
              code: "UNAUTHENTICATED",
              message: "Sign in required.",
            },
          },
          401,
        );
      }
      throw new Error(`Unexpected request: ${url.pathname}`);
    },
    settleTurns: 14,
    returnHarness: true,
  });

  assert.equal(result.window.location.hash, "#/signin/faculty");
  assert.match(result.html, /<p class="eyebrow">Faculty Portal<\/p>/);
  assert.match(result.html, /type="submit"[^>]*>Faculty Sign In/);
  assert.doesNotMatch(result.html, /type="submit"[^>]*>Student Sign In/);
});

test("password recovery, reset and authenticated change-password routes are discoverable", async () => {
  const authConfig = {
    passwordResetRequestEndpoint:
      "https://api.example.test/v1/auth/password-reset-requests",
    passwordResetEndpoint:
      "https://api.example.test/v1/auth/password-resets",
    passwordChangeEndpoint:
      "https://api.example.test/v1/auth/password-change",
  };
  const forgot = await renderPortal(
    "#/forgot-password?portal=faculty&email=faculty%40example.test",
    null,
    {
      beforeApp(window) {
        window.LFA_AUTH_CONFIG = authConfig;
      },
    },
  );
  assert.match(forgot, /Reset Your Password/);
  assert.match(forgot, /id="forgot-password-form"/);
  assert.match(forgot, /value="faculty@example\.test"/);
  assert.match(forgot, /Return to Faculty Sign In/);

  const reset = await renderPortal(
    "#/reset-password?token=abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG",
    null,
    {
      beforeApp(window) {
        window.LFA_AUTH_CONFIG = authConfig;
      },
    },
  );
  assert.match(reset, /Choose a New Password/);
  assert.match(reset, /id="reset-password-form"/);
  assert.match(reset, /name="token"/);
  assert.match(reset, /id="confirmPassword"/);

  const studentSecurity = await renderPortal(
    "#/security",
    { email: "student@lakeforestacademy.ca", role: "student" },
    {
      beforeApp(window) {
        window.LFA_AUTH_CONFIG = authConfig;
      },
    },
  );
  assert.match(studentSecurity, /Account Security/);
  assert.match(studentSecurity, /<strong>Account Security<\/strong>/);
  assert.doesNotMatch(studentSecurity, />Page Not Found</);
  assert.match(studentSecurity, /id="change-password-form"/);
  assert.match(studentSecurity, /id="currentPassword"/);

  const teacherSecurity = await renderPortal(
    "#/teacher/security",
    {
      email: "teacher@lakeforestacademy.ca",
      role: "teacher",
      displayName: "Test Teacher",
    },
    {
      beforeApp(window) {
        window.LFA_AUTH_CONFIG = authConfig;
      },
    },
  );
  assert.match(teacherSecurity, /Faculty Learning/);
  assert.match(teacherSecurity, /id="change-password-form"/);
});

const studentPlatformApiConfig = {
  coursesEndpoint: "https://api.example.test/v1/courses",
  studentProgressEndpoint: "https://api.example.test/v1/me/progress",
  studentGradesEndpoint: "https://api.example.test/v1/me/grades",
};

async function lockedStudentPlatformFetch(request) {
  const url = new URL(String(request));
  if (url.pathname === "/v1/me/progress") {
    const courseCode = url.searchParams.get("courseCode");
    return jsonResponse({
      data:
        courseCode === "SCH4U"
          ? [
              {
                moduleKey: "SCH4U-M00",
                moduleNumber: 0,
                status: "in_progress",
              },
              {
                moduleKey: "SCH4U-M01",
                moduleNumber: 1,
                status: "locked",
              },
              {
                moduleKey: "SCH4U-M02",
                moduleNumber: 2,
                status: "locked",
              },
            ]
          : [],
    });
  }
  if (url.pathname === "/v1/courses/SCH4U/assignments") {
    return jsonResponse({
      data: [
        {
          id: "sch4u-m02-assignment",
          moduleNumber: 2,
          unitNumber: 1,
          dueAt: "2099-08-01T16:00:00-04:00",
          status: "open",
        },
      ],
    });
  }
  return jsonResponse({ data: [] });
}

function studentStateStorage(email, overrides = {}) {
  const key = `lake-forest-learning-state-v1:${encodeURIComponent(
    String(email).toLowerCase(),
  )}`;
  return {
    [key]: JSON.stringify({
      enrolledCourseIds: ["sch4u"],
      completed: [],
      guideChecks: { sch4u: [] },
      read: [],
      feedbackRead: [],
      submissions: {},
      ...overrides,
    }),
  };
}

function sch4uPlatformFetch({ progress, submission = null, onRequest } = {}) {
  return async (request, init = {}) => {
    const url = new URL(String(request));
    onRequest?.(url, init);
    if (url.pathname === "/v1/me/progress") {
      return jsonResponse({
        data: url.searchParams.get("courseCode") === "SCH4U" ? progress : [],
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/modules") {
      return jsonResponse({
        data: Array.from({ length: 12 }, (_, moduleNumber) => ({
          id: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
          moduleKey: `SCH4U-M${String(moduleNumber).padStart(2, "0")}`,
          moduleNumber,
        })),
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/assignments") {
      return jsonResponse({
        data: [
          {
            id: "sch4u-m02-assignment",
            moduleId: "sch4u-m02",
            moduleNumber: 2,
            unitNumber: 1,
            status: "active",
          },
        ],
      });
    }
    if (url.pathname === "/v1/me/grades") {
      return jsonResponse({ data: [] });
    }
    if (url.pathname === "/v1/submissions") {
      return jsonResponse({
        data: submission ? [submission] : [],
        page: { nextCursor: null, limit: 100 },
      });
    }
    return jsonResponse({ data: [] });
  };
}

class TestFormData {
  constructor(form) {
    this.values = form.formValues || {};
  }

  get(name) {
    return this.values[name] ?? null;
  }
}

class SubmissionTestFormData {
  constructor(form) {
    this.values = new Map(Object.entries(form?.formValues || {}));
  }

  get(name) {
    return this.values.get(name) ?? null;
  }

  set(name, value) {
    this.values.set(name, value);
  }
}

class SubmissionTestFile {
  constructor(name, type, size = 2048) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.lastModified = Date.parse("2026-08-03T10:00:00.000Z");
  }
}

function interactiveForm(id, dataset, formValues) {
  const alert = {
    className: "form-alert",
    hidden: true,
    textContent: "",
    focus() {},
  };
  const button = { disabled: false, textContent: "Submit" };
  const elements = Object.fromEntries(
    Object.keys(formValues).map((name) => [name, { focus() {} }]),
  );
  return {
    id,
    dataset: { ...dataset },
    formValues,
    elements,
    resetCalled: false,
    querySelector(selector) {
      if (selector === "#assignment-form-alert, .form-alert") return alert;
      if (
        selector === '[type="submit"]' ||
        selector === 'button[type="submit"]'
      ) {
        return button;
      }
      return null;
    },
    matches() {
      return false;
    },
    reset() {
      this.resetCalled = true;
    },
    alert,
    button,
  };
}

function actionTarget(action, dataset = {}) {
  return {
    dataset: { action, ...dataset },
    disabled: false,
    closest(selector) {
      return selector === "[data-action], [data-route]" ? this : null;
    },
  };
}

test("bootstrap loads the permanent course metadata and platform sequence before the app", async () => {
  const bootstrap = await source("public/learning/bootstrap.js");
  const catalog = bootstrap.indexOf('loadScript("course-catalog.js")');
  const sequence = bootstrap.indexOf('loadScript("platform-sequences.js")');
  const app = bootstrap.indexOf('loadScript("app.js")');
  assert.ok(catalog >= 0 && sequence > catalog && app > sequence);
  assert.match(
    bootstrap,
    /const SCRIPT_VERSION = "student-teacher-interaction-v1";/,
  );
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
  assert.doesNotMatch(app, /[路�]/u);
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
  assert.match(student, /#\/course\/sch4u\/module\/SCH4U-M00/);
  assert.doesNotMatch(student, /#\/course\/sch4u\/module\/0(?:["/])/);

  const studentModule = await renderPortal("#/course/sch4u/module/1", {
    email: "student@lakeforestacademy.ca",
    role: "student",
  });
  assert.match(studentModule, /Required Reading Order/);
  assert.match(studentModule, /Self-Study Resources/);
  assert.match(studentModule, /Guided Practice/);
  assert.match(studentModule, /Feedback &amp; Unlock|Feedback & Unlock/);
  assert.doesNotMatch(studentModule, /What to retain/);

  const stableKeyModule = await renderPortal(
    "#/course/sch4u/module/SCH4U-M01",
    { email: "student@lakeforestacademy.ca", role: "student" },
  );
  assert.match(stableKeyModule, /Required Reading Order/);

  const invalidModule = await renderPortal(
    "#/course/sch4u/module/SCH4U-M99",
    { email: "student@lakeforestacademy.ca", role: "student" },
  );
  assert.match(invalidModule, /Page Not Found/);
  assert.doesNotMatch(invalidModule, /Start Here: Learning Chemistry/);

  const missingModuleKey = await renderPortal(
    "#/course/sch4u/module/",
    { email: "student@lakeforestacademy.ca", role: "student" },
  );
  assert.match(missingModuleKey, /Page Not Found/);
  assert.doesNotMatch(missingModuleKey, /Start Here: Learning Chemistry/);

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
  assert.match(
    facultyCourse,
    /#\/teacher\/course\/sch4u\/module\/SCH4U-M00/,
  );
  assert.match(facultyCourse, /Connect the secure course service to view the official roster and progress/);
  assert.doesNotMatch(facultyCourse, />undefined</);

  const invalidFacultyModule = await renderPortal(
    "#/teacher/course/sch4u/module/SCH4U-M99",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
  );
  assert.match(invalidFacultyModule, /Page Not Found/);

  const calendar = await renderPortal("#/calendar", {
    email: "student@lakeforestacademy.ca",
    role: "student",
  });
  assert.match(calendar, /Offering schedule/);
  assert.doesNotMatch(calendar, /Invalid Date/);
});

test("locked module lessons and assignments cannot be opened through deep links or dashboard actions", async () => {
  const options = {
    platformApiConfig: studentPlatformApiConfig,
    fetch: lockedStudentPlatformFetch,
    settleTurns: 14,
  };
  const session = {
    email: "student@lakeforestacademy.ca",
    role: "student",
  };

  const lesson = await renderPortal("#/lesson/SCH4U-U1-L3", session, options);
  assert.match(lesson, /class="module-lock-card"/);
  assert.doesNotMatch(lesson, /Lesson Notes/);

  const assignment = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    session,
    options,
  );
  assert.match(assignment, /class="module-lock-card"/);
  assert.doesNotMatch(assignment, /Assignment Brief|id="assignment-form"/);

  const assignmentList = await renderPortal("#/assignments", session, options);
  assert.match(
    assignmentList,
    /<article class="assessment-task-card is-locked" aria-disabled="true">[\s\S]*?Locked/,
  );
  assert.doesNotMatch(
    assignmentList,
    /href="#\/assignment\/sch4u-m02-assignment"/,
  );

  const state = {
    enrolledCourseIds: ["sch4u"],
    completed: [],
    guideChecks: {
      sch4u: ["overview", "evaluation", "schedule", "technology", "support"],
    },
    read: [],
    feedbackRead: [],
    submissions: {},
  };
  const dashboard = await renderPortal("#/dashboard", session, {
    ...options,
    localStorageSeed: {
      "lake-forest-learning-state-v1": JSON.stringify(state),
    },
  });
  assert.doesNotMatch(dashboard, /#\/lesson\/SCH4U-U1-L1/);
  assert.doesNotMatch(dashboard, /#\/assignment\/sch4u-m02-assignment/);

  let progressRequests = 0;
  const calendar = await renderPortal("#/calendar", session, {
    ...options,
    fetch: async (request) => {
      const url = new URL(String(request));
      if (url.pathname === "/v1/me/progress") progressRequests += 1;
      return lockedStudentPlatformFetch(request);
    },
  });
  assert.ok(progressRequests > 0);
  assert.match(
    calendar,
    /<article class="deadline-row is-locked" aria-disabled="true">[\s\S]*?Safer Organic Product Reformulation Dossier[\s\S]*?Locked/,
  );
  assert.doesNotMatch(
    calendar,
    /href="#\/assignment\/sch4u-m02-assignment"/,
  );
});

test("starting a course records Orientation in progress and keeps the next module locked", async () => {
  let started = false;
  const writes = [];
  const fetch = async (request, options = {}) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/me/progress") {
      return jsonResponse({
        data: [
          {
            courseCode: "SCH4U",
            moduleId: "sch4u-m00",
            moduleKey: "SCH4U-M00",
            moduleNumber: 0,
            status: started ? "in_progress" : "available",
          },
          {
            courseCode: "SCH4U",
            moduleId: "sch4u-m01",
            moduleKey: "SCH4U-M01",
            moduleNumber: 1,
            status: "locked",
          },
        ],
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/modules") {
      return jsonResponse({
        data: [
          { id: "sch4u-m00", moduleKey: "SCH4U-M00", moduleNumber: 0 },
          { id: "sch4u-m01", moduleKey: "SCH4U-M01", moduleNumber: 1 },
        ],
      });
    }
    if (
      url.pathname === "/v1/courses/SCH4U/assignments" ||
      url.pathname === "/v1/me/grades"
    ) {
      return jsonResponse({ data: [] });
    }
    if (
      url.pathname === "/v1/me/progress/modules/sch4u-m00" &&
      options.method === "PUT"
    ) {
      writes.push(options);
      started = true;
      return jsonResponse({
        data: {
          moduleId: "sch4u-m00",
          status: "in_progress",
          startedAt: "2026-08-03T12:00:00.000Z",
          completedAt: null,
        },
      });
    }
    throw new Error(`Unexpected request: ${url.pathname}`);
  };
  const options = {
    platformApiConfig: {
      ...studentPlatformApiConfig,
      moduleProgressEndpoint:
        "https://api.example.test/v1/me/progress/modules",
    },
    fetch,
    settleTurns: 14,
    sessionStorageSeed: {
      "lake-forest-learning-csrf-v1": "csrf-start-course-test",
    },
  };
  const session = {
    email: "student@lakeforestacademy.ca",
    role: "student",
  };
  const result = await renderPortal("#/course/sch4u", session, {
    ...options,
    interact: async ({ listeners }) => {
      const click = listeners.get("click")?.[0];
      assert.equal(typeof click, "function");
      let prevented = false;
      const button = {
        dataset: {
          action: "start-module",
          course: "sch4u",
          module: "SCH4U-M00",
          moduleId: "sch4u-m00",
        },
        disabled: false,
        closest(selector) {
          return selector === "[data-action], [data-route]" ? this : null;
        },
      };
      await click({
        target: button,
        preventDefault() {
          prevented = true;
        },
      });
      assert.equal(prevented, true);
      assert.equal(button.disabled, true);
    },
    returnHarness: true,
  });

  assert.equal(writes.length, 1);
  assert.equal(writes[0].headers["X-CSRF-Token"], "csrf-start-course-test");
  assert.deepEqual(JSON.parse(writes[0].body), { status: "in_progress" });
  assert.equal(
    result.window.location.hash,
    "#/course/sch4u/module/SCH4U-M00",
  );
  assert.match(
    result.html,
    /data-action="start-module"[\s\S]*?Start Course/,
  );
  assert.match(
    result.html,
    /<article class="platform-module-row is-locked" aria-disabled="true">[\s\S]*?SCH4U-M01|<article class="platform-module-row is-locked" aria-disabled="true">[\s\S]*?Locked/,
  );
  assert.doesNotMatch(
    result.html,
    /href="#\/course\/sch4u\/module\/SCH4U-M01"/,
  );

  const refreshed = await renderPortal("#/course/sch4u", session, options);
  assert.match(refreshed, /Continue Orientation/);
  assert.match(refreshed, /In Progress/);
  assert.match(
    refreshed,
    /<article class="platform-module-row is-locked" aria-disabled="true">[\s\S]*?Locked/,
  );
});

test("dashboard Next Step follows authoritative module progress instead of browser lesson completion", async () => {
  const email = "next-step@example.test";
  const session = {
    email,
    firstName: "Avery",
    displayName: "Avery Student",
    role: "student",
  };
  const progress = Array.from({ length: 12 }, (_, moduleNumber) => ({
    courseCode: "SCH4U",
    moduleId: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
    moduleKey: `SCH4U-M${String(moduleNumber).padStart(2, "0")}`,
    moduleNumber,
    status:
      moduleNumber === 0
        ? "completed"
        : moduleNumber === 1
          ? "in_progress"
          : "locked",
  }));
  let progressRequests = 0;
  const fetch = sch4uPlatformFetch({
    progress,
    onRequest(url) {
      if (url.pathname === "/v1/me/progress") progressRequests += 1;
    },
  });
  const completedLessons = Array.from({ length: 5 }, (_, unitIndex) =>
    Array.from(
      { length: 4 },
      (_, lessonIndex) => `SCH4U-U${unitIndex + 1}-L${lessonIndex + 1}`,
    ),
  ).flat();
  const renderWithCompleted = (completed) =>
    renderPortal("#/dashboard", session, {
      platformApiConfig: studentPlatformApiConfig,
      fetch,
      settleTurns: 16,
      localStorageSeed: studentStateStorage(email, { completed }),
    });

  const [emptyBrowserState, completedBrowserState] = await Promise.all([
    renderWithCompleted([]),
    renderWithCompleted(completedLessons),
  ]);
  const primaryHref = (html) =>
    html.match(
      /<section class="welcome">[\s\S]*?<a class="button button-gold" href="([^"]+)"/,
    )?.[1];

  assert.ok(progressRequests >= 2);
  assert.equal(
    primaryHref(emptyBrowserState),
    "#/course/sch4u/module/SCH4U-M01",
  );
  assert.equal(primaryHref(completedBrowserState), primaryHref(emptyBrowserState));
  assert.match(completedBrowserState, /Module 01 · In Progress/);
  assert.doesNotMatch(completedBrowserState, /#\/lesson\/SCH4U-U2-L1/);
});

test("revision requests outrank module work and are the only ordinary submission state that enables replacement", async () => {
  const email = "revision-student@example.test";
  const session = {
    email,
    firstName: "Riley",
    displayName: "Riley Student",
    role: "student",
  };
  const progress = Array.from({ length: 12 }, (_, moduleNumber) => ({
    courseCode: "SCH4U",
    moduleId: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
    moduleKey: `SCH4U-M${String(moduleNumber).padStart(2, "0")}`,
    moduleNumber,
    status:
      moduleNumber < 2
        ? "completed"
        : moduleNumber === 2
          ? "in_progress"
          : "locked",
  }));
  const baseSubmission = {
    id: "11111111-1111-4111-8111-111111111111",
    submissionId: "11111111-1111-4111-8111-111111111111",
    student: {
      id: "revision-student",
      displayName: "Riley Student",
      email,
    },
    courseCode: "SCH4U",
    moduleId: "sch4u-m02",
    moduleNumber: 2,
    assignmentId: "sch4u-m02-assignment",
    assignmentTitle: "Safer Organic Product Reformulation Dossier",
    unitNumber: 1,
    unit: "Unit 1",
    attemptNumber: 1,
    submittedAt: "2026-08-03T10:00:00.000Z",
    receiptId: "11111111-1111-4111-8111-111111111111",
    files: [],
    history: [],
  };
  const optionsFor = (workflowStatus) => ({
    platformApiConfig: studentPlatformApiConfig,
    submissionConfig: {
      submissionsEndpoint: "https://api.example.test/v1/submissions",
      uploadReady: true,
    },
    fetch: sch4uPlatformFetch({
      progress,
      submission: {
        ...baseSubmission,
        status: workflowStatus,
        workflowStatus,
        resubmissionAllowed: workflowStatus === "revision_requested",
      },
    }),
    settleTurns: 16,
    localStorageSeed: studentStateStorage(email),
  });

  const revisionDashboard = await renderPortal(
    "#/dashboard",
    session,
    optionsFor("revision_requested"),
  );
  assert.match(
    revisionDashboard,
    /<section class="welcome">[\s\S]*?href="#\/assignment\/sch4u-m02-assignment"[\s\S]*?Revise Submission/,
  );

  const revisionAssignment = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    session,
    optionsFor("revision_requested"),
  );
  assert.match(revisionAssignment, /data-action="replace-submission"/);
  assert.match(revisionAssignment, /id="submission-message-form"/);

  const revisionWithNewerDeviceDraft = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    session,
    {
      ...optionsFor("revision_requested"),
      localStorageSeed: studentStateStorage(email, {
        submissions: {
          "sch4u-m02-assignment": {
            status: "draft",
            delivery: "device",
            text: "A newer unsent device note.",
            submittedAt: "2099-08-03T10:00:00.000Z",
          },
        },
      }),
    },
  );
  assert.match(revisionWithNewerDeviceDraft, /Revision Requested/);
  assert.match(
    revisionWithNewerDeviceDraft,
    /data-action="resume-device-draft"/,
  );

  const replacementForm = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    session,
    {
      ...optionsFor("revision_requested"),
      interact: async ({ listeners }) => {
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        await click({
          target: actionTarget("replace-submission", {
            id: "sch4u-m02-assignment",
          }),
        });
      },
    },
  );
  assert.match(
    replacementForm,
    /id="submission-file"[^>]*required aria-required="true"/,
  );
  assert.match(replacementForm, /required for this assignment/);

  for (const workflowStatus of ["submitted", "under_review", "graded"]) {
    const html = await renderPortal(
      "#/assignment/sch4u-m02-assignment",
      session,
      optionsFor(workflowStatus),
    );
    assert.doesNotMatch(
      html,
      /data-action="replace-submission"/,
      `${workflowStatus} must not authorize another attempt`,
    );
  }
});

test("notifications load from the secure endpoint and marking one read updates the unread state", async () => {
  const notificationId = "21111111-1111-4111-8111-111111111111";
  const notifications = [
    {
      id: notificationId,
      eventType: "revision_requested",
      title: "Revision requested",
      body: "Review the teacher message before resubmitting.",
      actionUrl: "#/assignment/sch4u-m02-assignment",
      readAt: null,
      createdAt: "2026-08-03T08:00:00.000Z",
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      eventType: "grade_published",
      title: "Grade published",
      body: "Your result is ready.",
      actionUrl: "#/grades",
      readAt: "2026-08-03T07:00:00.000Z",
      createdAt: "2026-08-03T07:00:00.000Z",
    },
  ];
  const requests = [];
  let beforeMarkRead = "";
  const result = await renderPortal(
    "#/notifications",
    {
      email: "notification-student@example.test",
      displayName: "Notification Student",
      role: "student",
    },
    {
      platformApiConfig: {
        notificationsEndpoint:
          "https://api.example.test/v1/me/notifications",
      },
      sessionStorageSeed: {
        "lake-forest-learning-csrf-v1": "csrf-notification-test",
      },
      fetch: async (request, init = {}) => {
        const url = new URL(String(request));
        requests.push({ url, init });
        if (
          url.pathname === "/v1/me/notifications" &&
          (!init.method || init.method === "GET")
        ) {
          return jsonResponse({
            data: notifications,
            unreadCount: notifications.filter((item) => !item.readAt).length,
          });
        }
        if (
          url.pathname === `/v1/me/notifications/${notificationId}` &&
          init.method === "PATCH"
        ) {
          const notification = notifications.find(
            (item) => item.id === notificationId,
          );
          notification.readAt = "2026-08-03T09:00:00.000Z";
          return jsonResponse({ data: notification });
        }
        throw new Error(`Unexpected notification request: ${url.pathname}`);
      },
      settleTurns: 12,
      interact: async ({ appRoot, listeners }) => {
        beforeMarkRead = appRoot.innerHTML;
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        await click({
          target: actionTarget("mark-notification-read", {
            id: notificationId,
          }),
        });
      },
      returnHarness: true,
    },
  );

  assert.match(beforeMarkRead, /aria-label="1 unread notification"/);
  assert.match(
    beforeMarkRead,
    new RegExp(`data-action="mark-notification-read" data-id="${notificationId}"`),
  );
  const patchRequest = requests.find(
    ({ url, init }) =>
      url.pathname === `/v1/me/notifications/${notificationId}` &&
      init.method === "PATCH",
  );
  assert.ok(patchRequest);
  assert.equal(
    patchRequest.init.headers["X-CSRF-Token"],
    "csrf-notification-test",
  );
  assert.deepEqual(JSON.parse(patchRequest.init.body), { read: true });
  assert.doesNotMatch(
    result.html,
    new RegExp(`data-action="mark-notification-read" data-id="${notificationId}"`),
  );
  assert.match(result.html, /Revision requested[\s\S]*?<span class="badge success">Read<\/span>/);
});

test("direct-grade notifications become actionable student Next Steps", async () => {
  const email = "direct-feedback@example.test";
  const notificationId = "29999999-9999-4999-8999-999999999999";
  const requests = [];
  let dashboardHtml = "";
  await renderPortal(
    "#/dashboard",
    { email, firstName: "Taylor", role: "student" },
    {
      platformApiConfig: {
        notificationsEndpoint:
          "https://api.example.test/v1/me/notifications",
      },
      localStorageSeed: studentStateStorage(email),
      fetch: async (request, init = {}) => {
        const url = new URL(String(request));
        requests.push({ url, init });
        if (url.pathname !== "/v1/me/notifications") {
          throw new Error(`Unexpected direct-feedback request: ${url.pathname}`);
        }
        if (init.method === "PATCH") {
          return jsonResponse({
            data: {
              id: notificationId,
              eventType: "grade_published",
              title: "Grade published: Final Examination",
              body: "Your score and feedback are ready.",
              actionUrl: "#/progress",
              readAt: "2026-08-03T09:01:00.000Z",
              createdAt: "2026-08-03T09:00:00.000Z",
            },
            unreadCount: 0,
          });
        }
        if (url.searchParams.get("cursor") === "page-2") {
          return jsonResponse({
            data: [
              {
                id: "28888888-8888-4888-8888-888888888888",
                eventType: "submission_message",
                title: "Earlier message",
                body: "This read notification came from page two.",
                actionUrl: "#/notifications",
                readAt: "2026-08-02T09:00:00.000Z",
                createdAt: "2026-08-02T08:00:00.000Z",
              },
            ],
            unreadCount: 1,
            page: { nextCursor: null, limit: 100 },
          });
        }
        return jsonResponse({
          data: [
            {
              id: notificationId,
              eventType: "grade_published",
              title: "Grade published: Final Examination",
              body: "Your score and feedback are ready.",
              actionUrl: "#/progress",
              readAt: null,
              createdAt: "2026-08-03T09:00:00.000Z",
            },
          ],
          unreadCount: 1,
          page: { nextCursor: "page-2", limit: 100 },
        });
      },
      sessionStorageSeed: {
        "lake-forest-learning-csrf-v1": "csrf-direct-feedback",
      },
      settleTurns: 12,
      interact: async ({ appRoot, listeners }) => {
        dashboardHtml = appRoot.innerHTML;
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        const target = actionTarget("open-notification", {
          id: notificationId,
        });
        target.getAttribute = (name) =>
          name === "href" ? "#/progress" : null;
        await click({ target, preventDefault() {} });
      },
    },
  );

  assert.match(dashboardHtml, /Grade published: Final Examination/);
  assert.match(
    dashboardHtml,
    new RegExp(`data-action="open-notification" data-id="${notificationId}"`),
  );
  assert.match(
    dashboardHtml,
    /aria-label="1 new feedback items\. Open Progress and Grades\."/,
  );
  const patchRequest = requests.find(
    ({ init }) => init.method === "PATCH",
  );
  assert.ok(patchRequest);
  assert.equal(patchRequest.init.headers["X-CSRF-Token"], "csrf-direct-feedback");
  assert.equal(
    requests.some(
      ({ url, init }) =>
        init.method === "GET" &&
        url.searchParams.get("cursor") === "page-2",
    ),
    true,
  );
});

test("faculty Action Inbox filters revision requests and grading drafts by workflow state", async () => {
  const records = [
    {
      id: "31111111-1111-4111-8111-111111111111",
      student: {
        id: "revision-student",
        displayName: "Revision Student",
        email: "revision@example.test",
      },
      courseCode: "SCH4U",
      assignmentId: "sch4u-m02-assignment",
      assignmentTitle: "Safer Organic Product Reformulation Dossier",
      moduleId: "sch4u-m02",
      moduleNumber: 2,
      status: "revision_requested",
      workflowStatus: "revision_requested",
      resubmissionAllowed: true,
      score: 65,
      feedback: "A draft existed before the revision request.",
      publishedAt: null,
      submittedAt: "2026-08-03T08:00:00.000Z",
      receiptId: "REVISION-RECEIPT",
    },
    {
      id: "32222222-2222-4222-8222-222222222222",
      student: {
        id: "draft-student",
        displayName: "Draft Student",
        email: "draft@example.test",
      },
      courseCode: "SCH4U",
      assignmentId: "sch4u-m04-assignment",
      assignmentTitle: "Reaction Systems Investigation",
      moduleId: "sch4u-m04",
      moduleNumber: 4,
      status: "under_review",
      workflowStatus: "under_review",
      submittedAt: "2026-08-03T07:00:00.000Z",
      receiptId: "DRAFT-RECEIPT",
      score: 74,
      feedback: "Unpublished grading draft.",
      publishedAt: null,
    },
  ];
  let revisionHtml = "";
  let draftHtml = "";
  let submissionLoads = 0;
  await renderPortal(
    "#/teacher/submissions",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    {
      submissionConfig: {
        submissionsEndpoint: "https://api.example.test/v1/submissions",
      },
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname === "/v1/submissions") {
          submissionLoads += 1;
          return jsonResponse({
            data: records,
            page: { nextCursor: null, limit: 100 },
          });
        }
        throw new Error(`Unexpected faculty inbox request: ${url.pathname}`);
      },
      settleTurns: 12,
      interact: async ({ appRoot, listeners }) => {
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        await click({
          target: actionTarget("set-teacher-status", { status: "revision" }),
        });
        revisionHtml = appRoot.innerHTML;
        await click({
          target: actionTarget("set-teacher-status", { status: "draft" }),
        });
        draftHtml = appRoot.innerHTML;
      },
    },
  );

  assert.ok(submissionLoads > 0);
  assert.match(revisionHtml, /Revision Student/);
  assert.doesNotMatch(revisionHtml, /Draft Student/);
  assert.match(
    revisionHtml,
    /data-status="revision" aria-pressed="true"/,
  );
  assert.match(draftHtml, /Draft Student/);
  assert.doesNotMatch(draftHtml, /Revision Student/);
  assert.match(draftHtml, /data-status="draft" aria-pressed="true"/);
});

test("faculty device grading drafts are scoped to one teacher and immutable submission attempt", async () => {
  const app = await source("public/learning/app.js");

  assert.match(
    app,
    /return `\$\{submissionScopeKey\(\)\}:\$\{studentRecordKey\(record\.student\)\}:\$\{assignmentKey\}:\$\{submissionKey\}`/,
  );
  assert.match(
    app,
    /if \(record\) \{\s*clearGradingDraft\(record\);\s*record\.submission\.workflowStatus = "revision_requested"/,
  );
});

test("account changes invalidate pending notification and submission responses", async () => {
  const app = await source("public/learning/app.js");

  assert.match(app, /let platformSessionGeneration = 0/);
  assert.match(
    app,
    /function resetPlatformRuntime\(\) \{\s*platformSessionGeneration \+= 1/,
  );
  assert.match(
    app,
    /function platformSessionMatches\(generation, scopeKey\)/,
  );
  assert.match(
    app,
    /async function requestPlatformJson[\s\S]*?StaleSessionError[\s\S]*?saveCsrfToken/,
  );
  assert.match(
    app,
    /async function requestSubmissionEndpoint[\s\S]*?StaleSessionError[\s\S]*?if \(!response\.ok\)/,
  );
  assert.match(
    app,
    /finally \{\s*if \(platformSessionMatches\(requestGeneration, requestScopeKey\)\) \{\s*platformRuntime\.notificationsLoading = false/,
  );
  assert.match(
    app,
    /scalarLabel\(item\.submission\?\.id\) === submissionId/,
  );
});

test("faculty can return an assignment for revision through the secure workflow", async () => {
  const submissionId = "41111111-1111-4111-8111-111111111111";
  const revisionMessage = "Please revise the evidence table and resubmit it.";
  const record = {
    id: submissionId,
    student: {
      id: "revision-return-student",
      displayName: "Return Student",
      email: "return@example.test",
    },
    courseCode: "SCH4U",
    assignmentId: "sch4u-m02-assignment",
    assignmentTitle: "Safer Organic Product Reformulation Dossier",
    moduleId: "sch4u-m02",
    moduleNumber: 2,
    status: "submitted",
    workflowStatus: "submitted",
    submittedAt: "2026-08-03T08:00:00.000Z",
    receiptId: "RETURN-RECEIPT",
    messages: [],
  };
  let revisionRequest = null;
  let submittedForm = null;
  const result = await renderPortal(
    "#/teacher/submission/return%40example.test/sch4u-m02-assignment",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    {
      FormData: TestFormData,
      submissionConfig: {
        submissionsEndpoint: "https://api.example.test/v1/submissions",
      },
      sessionStorageSeed: {
        "lake-forest-learning-csrf-v1": "csrf-revision-return-test",
      },
      fetch: async (request, init = {}) => {
        const url = new URL(String(request));
        if (url.pathname === "/v1/submissions") {
          return jsonResponse({
            data: [record],
            page: { nextCursor: null, limit: 100 },
          });
        }
        if (
          url.pathname === `/v1/submissions/${submissionId}/return` &&
          init.method === "POST"
        ) {
          revisionRequest = { url, init };
          record.status = "revision_requested";
          record.workflowStatus = "revision_requested";
          record.resubmissionAllowed = true;
          record.messages = [
            {
              id: "revision-message-1",
              body: revisionMessage,
              authorRole: "teacher_admin",
              authorName: "Academic Administrator",
              createdAt: "2026-08-03T09:00:00.000Z",
              attemptNumber: 1,
            },
          ];
          return jsonResponse({ data: record.messages[0] }, 201);
        }
        throw new Error(`Unexpected revision request: ${url.pathname}`);
      },
      settleTurns: 12,
      interact: async ({ appRoot, listeners }) => {
        assert.match(appRoot.innerHTML, /id="revision-request-form"/);
        submittedForm = interactiveForm(
          "revision-request-form",
          { submission: submissionId },
          { message: revisionMessage },
        );
        const submit = listeners.get("submit")?.[0];
        assert.equal(typeof submit, "function");
        await submit({ target: submittedForm, preventDefault() {} });
      },
      returnHarness: true,
    },
  );

  assert.ok(revisionRequest);
  assert.equal(revisionRequest.init.method, "POST");
  assert.equal(
    revisionRequest.init.headers["X-CSRF-Token"],
    "csrf-revision-return-test",
  );
  assert.match(
    revisionRequest.init.headers["Idempotency-Key"],
    /^revision-request-/,
  );
  assert.deepEqual(JSON.parse(revisionRequest.init.body), {
    message: revisionMessage,
  });
  assert.equal(submittedForm.resetCalled, true);
  assert.match(result.html, /Revision Requested/);
  assert.match(result.html, /Please revise the evidence table and resubmit it\./);
});

test("student and faculty assignment conversations post messages to the same secure thread", async () => {
  const progress = Array.from({ length: 12 }, (_, moduleNumber) => ({
    courseCode: "SCH4U",
    moduleId: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
    moduleKey: `SCH4U-M${String(moduleNumber).padStart(2, "0")}`,
    moduleNumber,
    status:
      moduleNumber < 2
        ? "completed"
        : moduleNumber === 2
          ? "in_progress"
          : "locked",
  }));
  const cases = [
    {
      role: "student",
      route: "#/assignment/sch4u-m02-assignment",
      email: "thread-student@example.test",
      message: "Could you clarify the evidence required for section two?",
    },
    {
      role: "teacher_admin",
      route:
        "#/teacher/submission/thread-student%40example.test/sch4u-m02-assignment",
      email: "administrator@lakeforestacademy.ca",
      message: "Yes. Include the source table and your calculation notes.",
    },
  ];

  for (const testCase of cases) {
    const submissionId =
      testCase.role === "student"
        ? "51111111-1111-4111-8111-111111111111"
        : "52222222-2222-4222-8222-222222222222";
    const record = {
      id: submissionId,
      student: {
        id: "thread-student",
        displayName: "Thread Student",
        email: "thread-student@example.test",
      },
      courseCode: "SCH4U",
      assignmentId: "sch4u-m02-assignment",
      assignmentTitle: "Safer Organic Product Reformulation Dossier",
      moduleId: "sch4u-m02",
      moduleNumber: 2,
      status: "under_review",
      workflowStatus: "under_review",
      submittedAt: "2026-08-03T08:00:00.000Z",
      receiptId: `THREAD-${testCase.role}`,
      messages: [],
    };
    const requests = [];
    const platformFetch = sch4uPlatformFetch({
      progress,
      submission: record,
    });
    const result = await renderPortal(
      testCase.route,
      {
        email: testCase.email,
        displayName:
          testCase.role === "student"
            ? "Thread Student"
            : "Academic Administrator",
        role: testCase.role,
      },
      {
        FormData: TestFormData,
        platformApiConfig:
          testCase.role === "student" ? studentPlatformApiConfig : {},
        submissionConfig: {
          submissionsEndpoint: "https://api.example.test/v1/submissions",
          uploadReady: true,
        },
        sessionStorageSeed: {
          "lake-forest-learning-csrf-v1": `csrf-thread-${testCase.role}`,
        },
        localStorageSeed:
          testCase.role === "student"
            ? studentStateStorage(testCase.email)
            : {},
        fetch: async (request, init = {}) => {
          const url = new URL(String(request));
          if (
            url.pathname === `/v1/submissions/${submissionId}/messages` &&
            init.method === "POST"
          ) {
            requests.push({ url, init });
            const message = {
              id: `message-${testCase.role}`,
              body: testCase.message,
              authorRole: testCase.role,
              authorName:
                testCase.role === "student"
                  ? "Thread Student"
                  : "Academic Administrator",
              createdAt: "2026-08-03T09:00:00.000Z",
              attemptNumber: 1,
            };
            record.messages.push(message);
            return jsonResponse({ data: message }, 201);
          }
          return platformFetch(request, init);
        },
        settleTurns: 14,
        interact: async ({ appRoot, listeners }) => {
          assert.match(appRoot.innerHTML, /id="submission-message-form"/);
          const form = interactiveForm(
            "submission-message-form",
            { submission: submissionId, role: testCase.role },
            { body: testCase.message },
          );
          const submit = listeners.get("submit")?.[0];
          assert.equal(typeof submit, "function");
          await submit({ target: form, preventDefault() {} });
          assert.equal(form.resetCalled, true);
        },
        returnHarness: true,
      },
    );

    assert.equal(requests.length, 1, `${testCase.role} message request`);
    assert.equal(
      requests[0].init.headers["X-CSRF-Token"],
      `csrf-thread-${testCase.role}`,
    );
    assert.match(
      requests[0].init.headers["Idempotency-Key"],
      /^submission-message-/,
    );
    assert.deepEqual(JSON.parse(requests[0].init.body), {
      body: testCase.message,
    });
    assert.match(result.html, new RegExp(testCase.message.replace(/[?]/g, "\\?")));
  }
});

test("production progress outages fail closed after Orientation", async () => {
  const html = await renderPortal(
    "#/course/sch4u",
    { email: "student@lakeforestacademy.ca", role: "student" },
    {
      beforeApp(window) {
        window.LFA_API_STATUS = {
          state: "unavailable",
          message: "The progress service is temporarily unavailable.",
        };
      },
    },
  );
  assert.match(html, /Progress Service Unavailable/);
  assert.match(
    html,
    /<article class="platform-module-row is-locked" aria-disabled="true">[\s\S]*?Locked/,
  );
  assert.doesNotMatch(
    html,
    /href="#\/course\/sch4u\/module\/SCH4U-M01"/,
  );
});

test("configured progress fails closed while loading or unavailable and preserves published unlocks", async () => {
  const session = {
    email: "student@lakeforestacademy.ca",
    role: "student",
  };
  const protectedRoutes = [
    ["#/course/sch4u/module/SCH4U-M02", /Required Reading Order/],
    ["#/lesson/SCH4U-U1-L3", /Lesson Notes/],
    ["#/assignment/sch4u-m02-assignment", /Assignment Brief|id="assignment-form"/],
  ];
  const delayedFetch = (request) =>
    new Promise((resolve) => {
      setTimeout(() => {
        void lockedStudentPlatformFetch(request).then(resolve);
      }, 30);
    });

  for (const [route, protectedContent] of protectedRoutes) {
    const pending = await renderPortal(route, session, {
      platformApiConfig: studentPlatformApiConfig,
      fetch: delayedFetch,
      settleTurns: 0,
    });
    assert.match(pending, /class="module-lock-card"/);
    assert.doesNotMatch(pending, protectedContent);

    const failed = await renderPortal(route, session, {
      platformApiConfig: studentPlatformApiConfig,
      fetch: async () => {
        throw new Error("Course service unavailable");
      },
      settleTurns: 12,
    });
    assert.match(failed, /class="module-lock-card"/);
    assert.doesNotMatch(failed, protectedContent);
  }

  const failedCalendar = await renderPortal("#/calendar", session, {
    platformApiConfig: studentPlatformApiConfig,
    fetch: async () => {
      throw new Error("Course service unavailable");
    },
    settleTurns: 12,
  });
  assert.doesNotMatch(
    failedCalendar,
    /href="#\/assignment\/sch4u-m02-assignment"/,
  );

  const available = await renderPortal(
    "#/course/sch4u/module/SCH4U-M02",
    session,
    {
      platformApiConfig: studentPlatformApiConfig,
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname === "/v1/me/progress") {
          return jsonResponse({
            data: [
              {
                moduleKey: "SCH4U-M01",
                moduleNumber: 1,
                status: "completed",
              },
              {
                moduleKey: "SCH4U-M02",
                moduleNumber: 2,
                status: "available",
              },
            ],
          });
        }
        return jsonResponse({ data: [] });
      },
      settleTurns: 12,
    },
  );
  assert.doesNotMatch(available, /class="module-lock-card"/);
  assert.match(available, /Required Reading Order/);
});

test("final evaluation assignment labels do not depend on the remote API", async () => {
  const html = await renderPortal("#/teacher/course/sch4u", {
    email: "administrator@lakeforestacademy.ca",
    displayName: "Academic Administrator",
    role: "teacher_admin",
  });
  assert.match(
    html,
    /course-chip">Final Evaluation<[\s\S]*?SCH4U Mandatory Written Examination/,
  );
  assert.doesNotMatch(html, /course-chip">(?:Module|Unit) 11/);
});

test("faculty module details prefer staff-only API fields and normalize final evaluation activity fields", async () => {
  const platformApiConfig = {
    coursesEndpoint: "https://api.example.test/v1/courses",
    teacherCoursesEndpoint: "https://api.example.test/v1/teacher/courses",
    teacherStudentsEndpoint: "https://api.example.test/v1/teacher/students",
  };
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/courses/SCH4U/modules") {
      return jsonResponse({
        data: [
          {
            id: "sch4u-m11",
            moduleNumber: 11,
            unitNumber: null,
            title: "Remote Final Evaluation Title",
            unitTitle: "Final Evaluation",
            learningFocus: ["Remote final learning focus"],
            coreReadingOrder: ["Remote final reading sequence"],
            guidedPractice: "Remote final guided practice",
            lowStakesCheck: "Remote final readiness check",
            feedbackAndUnlock: "Remote final unlock rule",
            estimatedCreditHours: 2.5,
            workloadLabel: "Remote final workload",
            teacherPresence: "STAFF API TEACHER PRESENCE",
            evidenceToRetain: "STAFF API EVIDENCE TO RETAIN",
            activity: {
              id: "sch4u-m11-assessment",
              type: "final_evaluation",
              title: "Remote Mandatory Written Examination",
              weightPercent: 25,
              sequence: ["Remote final assessment sequence"],
              taskType: "Remote supervised examination",
              processCheckpoints: ["Remote process checkpoint"],
              authenticationEvidence: ["Remote identity evidence"],
              isRequired: true,
              components: [],
            },
          },
        ],
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/assignments") {
      return jsonResponse({
        data: [
          {
            id: "sch4u-m11-assignment",
            moduleId: "sch4u-m11",
            moduleKey: "SCH4U-M11",
            moduleNumber: 11,
            unitNumber: 11,
            curriculumUnitNumber: null,
            sectionKind: "final_evaluation",
            sectionLabel: "Final Evaluation",
            title: "Remote Mandatory Written Examination",
            submissionMode: "supervised",
            status: "open",
          },
        ],
      });
    }
    if (url.pathname.endsWith("/gradebook")) {
      return jsonResponse({ data: {} });
    }
    return jsonResponse({ data: [] });
  };
  const html = await renderPortal(
    "#/teacher/course/sch4u/module/SCH4U-M11",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    { platformApiConfig, fetch, settleTurns: 14 },
  );
  assert.match(html, /Remote Final Evaluation Title/);
  assert.match(html, /STAFF API TEACHER PRESENCE/);
  assert.match(html, /STAFF API EVIDENCE TO RETAIN/);
  assert.match(html, /Remote Mandatory Written Examination/);
  assert.match(html, /Remote final assessment sequence/);
  assert.match(html, /Remote process checkpoint/);
  assert.match(html, /Remote identity evidence/);

  const courseHtml = await renderPortal(
    "#/teacher/course/sch4u",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    { platformApiConfig, fetch, settleTurns: 14 },
  );
  assert.match(courseHtml, /course-chip">Final Evaluation/);
  assert.doesNotMatch(courseHtml, /course-chip">Unit 11/);
});

test("faculty course and module views render the official student progress matrix", async () => {
  const app = await source("public/learning/app.js");
  assert.match(
    app,
    /invalidateTeacherProgress\(course\);\s*ensureTeacherPlatformData\(course\)/,
  );
  const platformApiConfig = {
    teacherCoursesEndpoint: "https://api.example.test/v1/teacher/courses",
  };
  const progress = {
    courseCode: "SCH4U",
    students: [
      {
        studentId: "student-1",
        displayName: "Alice Ng",
        email: "alice@example.test",
        modules: Array.from({ length: 12 }, (_, moduleNumber) => ({
          moduleId: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
          moduleNumber,
          status:
            moduleNumber === 0
              ? "completed"
              : moduleNumber === 1
                ? "in_progress"
                : moduleNumber === 2
                  ? "available"
                  : "locked",
          override:
            moduleNumber === 2
              ? {
                  active: true,
                  reason: "Documented accelerated pathway",
                  expiresAt: "2026-08-15T18:00:00.000Z",
                }
              : null,
        })),
      },
      {
        studentId: "student-2",
        displayName: "Noah Patel",
        email: "noah@example.test",
        modules: Array.from({ length: 12 }, (_, moduleNumber) => ({
          moduleId: `sch4u-m${String(moduleNumber).padStart(2, "0")}`,
          moduleNumber,
          status: moduleNumber === 0 ? "available" : "locked",
          override: null,
        })),
      },
    ],
  };
  let progressRequests = 0;
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/teacher/courses/SCH4U/progress") {
      progressRequests += 1;
      return jsonResponse({ data: progress });
    }
    if (url.pathname.endsWith("/roster")) {
      return jsonResponse({ data: progress.students });
    }
    if (url.pathname.endsWith("/gradebook")) {
      return jsonResponse({ data: {} });
    }
    return jsonResponse({ data: [] });
  };
  const session = {
    email: "administrator@lakeforestacademy.ca",
    displayName: "Academic Administrator",
    role: "teacher_admin",
  };
  const courseResult = await renderPortal("#/teacher/course/sch4u", session, {
    platformApiConfig,
    fetch,
    settleTurns: 14,
    interact: async ({ listeners }) => {
      const click = listeners.get("click")?.[0];
      assert.equal(typeof click, "function");
      const button = {
        dataset: {
          action: "refresh-teacher-progress",
          course: "sch4u",
        },
        disabled: false,
        textContent: "Refresh Official Progress",
        closest(selector) {
          if (selector === "[data-action], [data-route]") return button;
          return null;
        },
      };
      await click({ target: button });
    },
    returnHarness: true,
  });
  const course = courseResult.html;
  assert.equal(progressRequests, 2);
  assert.match(course, /Student × Module Matrix/);
  assert.match(course, /aria-label="SCH4U official progress matrix"/);
  assert.match(course, /Last refreshed/);
  assert.match(course, /data-action="refresh-teacher-progress"/);
  assert.equal(
    (course.match(/class="teacher-progress-module-link"/g) || []).length,
    12,
  );
  assert.match(course, /Alice Ng/);
  assert.match(course, /Noah Patel/);
  assert.match(course, /data-status="completed">Completed/);
  assert.match(course, /data-status="in_progress">In Progress/);
  assert.match(course, /Override active/);

  const module = await renderPortal(
    "#/teacher/course/sch4u/module/SCH4U-M02",
    session,
    { platformApiConfig, fetch, settleTurns: 14 },
  );
  assert.match(module, /Student Module Status/);
  assert.match(
    module,
    /aria-label="SCH4U Module 2 official student progress"/,
  );
  assert.match(module, /Alice Ng[\s\S]*?data-status="available">Available/);
  assert.match(module, /Active Override/);
  assert.match(module, /Documented accelerated pathway/);
  assert.match(module, /Noah Patel[\s\S]*?data-status="locked">Locked/);
});

test("faculty progress fails closed when the central endpoint is unavailable", async () => {
  const platformApiConfig = {
    teacherCoursesEndpoint: "https://api.example.test/v1/teacher/courses",
  };
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname.endsWith("/progress")) {
      return jsonResponse(
        { error: { message: "Central progress service unavailable." } },
        503,
      );
    }
    if (url.pathname.endsWith("/roster")) {
      return jsonResponse({
        data: [
          {
            studentId: "student-1",
            displayName: "Roster Aggregate Only",
            email: "aggregate@example.test",
            completedModules: 12,
            totalModules: 12,
          },
        ],
      });
    }
    if (url.pathname.endsWith("/gradebook")) {
      return jsonResponse({ data: {} });
    }
    return jsonResponse({ data: [] });
  };
  const session = {
    email: "administrator@lakeforestacademy.ca",
    displayName: "Academic Administrator",
    role: "teacher_admin",
  };
  const options = {
    platformApiConfig,
    fetch,
    settleTurns: 14,
    localStorageSeed: {
      "lake-forest-learning-state-v1": JSON.stringify({
        enrolledCourseIds: ["sch4u"],
        completed: ["SCH4U-U1-L1", "SCH4U-U1-L2"],
        guideChecks: {},
        read: [],
        feedbackRead: [],
        submissions: {},
      }),
    },
  };
  const course = await renderPortal(
    "#/teacher/course/sch4u",
    session,
    options,
  );
  assert.match(course, /Official Progress Unavailable/);
  assert.match(course, /Central progress service unavailable/);
  assert.match(course, /No browser-only or roster-derived module status is shown/);
  assert.doesNotMatch(course, /aria-label="SCH4U official progress matrix"/);
  assert.doesNotMatch(course, /class="badge [^"]*teacher-progress-status"/);

  const module = await renderPortal(
    "#/teacher/course/sch4u/module/SCH4U-M02",
    session,
    options,
  );
  assert.match(module, /Official Progress Unavailable/);
  assert.doesNotMatch(module, /official student progress"/);
  assert.doesNotMatch(module, /teacher-progress-status/);
});

test("platform contracts include published grades, remote unit numbers and direct-grade concurrency headers", async () => {
  const [bootstrap, app] = await Promise.all([
    source("public/learning/bootstrap.js"),
    source("public/learning/app.js"),
  ]);
  assert.match(bootstrap, /studentGradesEndpoint:[\s\S]*\/v1\/me\/grades/);
  assert.match(app, /gradebookItemId: String\(item\.key \|\| ""\)\.toLowerCase\(\)/);
  assert.match(app, /assignment\.unitNumber\s*=\s*[\s\S]*record\.unitNumber/);
  assert.match(app, /assignment\.moduleKey\s*=/);
  assert.match(app, /assignment\.sectionKind\s*=/);
  assert.match(app, /record\.sectionLabel/);
  assert.match(app, /record\.curriculumUnitNumber/);
  assert.match(app, /upload\.set\("unitNumber", String\(unitNumber\)\)/);
  assert.match(
    app,
    /Number\.isInteger\(unitNumber\)[\s\S]{0,180}unitNumber >= 1[\s\S]{0,180}upload\.set\("unitNumber"/,
  );
  assert.doesNotMatch(app, /assignment\?\.unitNumber == null \? ""/);
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

test("submission grading drafts sync centrally and remain unpublished", async () => {
  const submissionId = "11111111-1111-4111-8111-111111111111";
  const submittedAt = "2026-08-01T14:00:00.000Z";
  const gradedAt = "2026-08-02T03:30:00.000Z";
  let gradeRequest = null;
  let interactionState = null;
  const fetch = async (request, init = {}) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/submissions") {
      return jsonResponse({
        data: [
          {
            id: submissionId,
            submissionId,
            student: {
              id: "student-1",
              displayName: "Sample Student",
              email: "student@example.test",
            },
            courseCode: "SCH4U",
            assignmentId: "sch4u-m02-assignment",
            assignmentTitle: "Safer Organic Product Reformulation Dossier",
            unitNumber: 1,
            unit: "Unit 1",
            status: "submitted",
            submittedAt,
            updatedAt: gradedAt,
            receiptId: submissionId,
            score: 73,
            feedback: "Central draft feedback.",
            gradedAt,
            version: 2,
            etag: '"grade-v2"',
            grade: {
              score: 73,
              feedback: "Central draft feedback.",
              gradedAt,
              publishedAt: null,
              version: 2,
              etag: '"grade-v2"',
            },
          },
        ],
        page: { nextCursor: null, limit: 100 },
      });
    }
    if (url.pathname === `/v1/grades/${submissionId}`) {
      gradeRequest = { init, url };
      return jsonResponse({
        data: {
          submissionId,
          score: 81,
          feedback: "Updated central draft feedback.",
          gradedAt: "2026-08-02T04:00:00.000Z",
          publishedAt: null,
          version: 3,
          etag: '"grade-v3"',
        },
      });
    }
    return jsonResponse({ data: [] });
  };
  const result = await renderPortal(
    "#/teacher/submission/student%40example.test/sch4u-m02-assignment",
    {
      email: "administrator@lakeforestacademy.ca",
      displayName: "Academic Administrator",
      role: "teacher_admin",
    },
    {
      submissionConfig: {
        submissionsEndpoint: "https://api.example.test/v1/submissions",
        gradingEndpoint: "https://api.example.test/v1/grades",
      },
      fetch,
      sessionStorageSeed: {
        "lake-forest-learning-csrf-v1": "csrf-grade-draft-test",
      },
      settleTurns: 14,
      interact: async ({ listeners }) => {
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        const score = {
          value: "81",
          removeAttribute() {},
          setAttribute() {},
        };
        const feedback = {
          value: "Updated central draft feedback.",
          removeAttribute() {},
          setAttribute() {},
        };
        const alert = {
          className: "form-alert is-error",
          hidden: true,
          textContent: "",
          focus() {},
        };
        const status = { className: "grading-status", textContent: "" };
        const form = {
          dataset: {
            assignment: "sch4u-m02-assignment",
            student: "student@example.test",
            submission: submissionId,
          },
          elements: { feedback, score },
          querySelector(selector) {
            if (selector === "#grading-form-alert") return alert;
            if (selector === ".grading-status") return status;
            return null;
          },
        };
        const button = {
          dataset: { action: "save-grade-draft" },
          disabled: false,
          textContent: "Save Draft",
          closest(selector) {
            if (selector === "[data-action], [data-route]") return button;
            if (selector === "#grading-form") return form;
            return null;
          },
        };
        await click({ target: button });
        interactionState = { alert, button, status };
      },
      returnHarness: true,
    },
  );
  assert.ok(gradeRequest, JSON.stringify(interactionState));
  assert.equal(gradeRequest.init.method, "PUT");
  assert.equal(gradeRequest.init.credentials, "include");
  assert.equal(gradeRequest.init.headers["If-Match"], '"grade-v2"');
  assert.equal(
    gradeRequest.init.headers["X-CSRF-Token"],
    "csrf-grade-draft-test",
  );
  assert.match(gradeRequest.init.headers["Idempotency-Key"], /^grade-draft-/);
  assert.deepEqual(JSON.parse(gradeRequest.init.body), {
    submissionId,
    score: 81,
    feedback: "Updated central draft feedback.",
    publish: false,
  });
  assert.equal(
    result.sessionStorage.getItem(
      "lake-forest-learning-grading-drafts-v1",
    ),
    "{}",
  );
  assert.match(result.html, /Draft Saved/);
  assert.match(result.html, /Draft saved to the school record/);
  assert.match(result.html, /value="81"/);
  assert.match(result.html, />Updated central draft feedback\.<\/textarea>/);
  assert.doesNotMatch(result.html, /Returned at 81%/);
});

test("project submissions require a new file and final-evaluation uploads omit empty unit numbers", async () => {
  const app = await source("public/learning/app.js");
  const project = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    { email: "student@lakeforestacademy.ca", role: "student" },
  );
  assert.match(
    project,
    /id="submission-file"[^>]*required aria-required="true"/,
  );
  assert.match(project, /required for this assignment/);
  assert.match(
    app,
    /\(remoteExisting \|\|[\s\S]{0,120}\["file", "project"\]\.includes\(assignment\?\.submissionMode\)\)[\s\S]{0,100}!newFileName/,
  );
  assert.match(
    app,
    /Number\.isInteger\(unitNumber\)[\s\S]{0,180}upload\.set\("unitNumber", String\(unitNumber\)\)/,
  );
});

test("an upload dependency outage preserves submission records but uses device drafts", async () => {
  const session = {
    email: "student@lakeforestacademy.ca",
    role: "student",
  };
  const submissionsEndpoint = "https://api.example.test/v1/submissions";
  const uploadPaused = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: false },
    },
  );
  const uploadConnected = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
    },
  );
  const noteOrFileConnected = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
    },
  );
  const savedDraft = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: false },
      localStorageSeed: {
        "lake-forest-learning-state-v1": JSON.stringify({
          enrolledCourseIds: ["ics4u"],
          completed: [],
          guideChecks: {},
          read: [],
          feedbackRead: [],
          submissions: {
            "ics4u-m11-culminating-assignment": {
              delivery: "device",
              fileName: "culminating-project.pdf",
              submittedAt: "2026-08-02T08:00:00.000Z",
              receiptId: "LFA-DEVICE-DRAFT-1",
              history: [],
            },
          },
        }),
      },
    },
  );
  const localDraftState = (fileName, submittedAt) => ({
    "lake-forest-learning-state-v1": JSON.stringify({
      enrolledCourseIds: ["ics4u"],
      completed: [],
      guideChecks: {},
      read: [],
      feedbackRead: [],
      submissions: {
        "ics4u-m11-culminating-assignment": {
          delivery: "device",
          fileName,
          submittedAt,
          receiptId: `LFA-${fileName}`,
          history: [],
        },
      },
    }),
  });
  const remoteSubmissionFetch = (fileName, submittedAt) => async (request) => {
    const url = new URL(String(request));
    if (url.pathname !== "/v1/submissions") {
      return jsonResponse({ data: [] });
    }
    return jsonResponse({
      data: [
        {
          id: `remote-${fileName}`,
          submissionId: `remote-${fileName}`,
          student: {
            displayName: "Student",
            email: session.email,
          },
          courseCode: "ICS4U",
          assignmentId: "ics4u-m11-culminating-assignment",
          assignmentTitle: "Culminating Programming Project",
          status: "submitted",
          submittedAt,
          receiptId: `REMOTE-${fileName}`,
          fileName,
        },
      ],
      page: { nextCursor: null, limit: 100 },
    });
  };
  const newerLocal = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
      localStorageSeed: localDraftState(
        "newer-device-draft.pdf",
        "2026-08-02T10:00:00.000Z",
      ),
      fetch: remoteSubmissionFetch(
        "older-remote-version.pdf",
        "2026-08-02T09:00:00.000Z",
      ),
      settleTurns: 14,
    },
  );
  const newerRemote = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: false },
      localStorageSeed: localDraftState(
        "stale-device-draft.pdf",
        "2026-08-02T09:00:00.000Z",
      ),
      fetch: remoteSubmissionFetch(
        "newer-remote-version.pdf",
        "2026-08-02T10:00:00.000Z",
      ),
      settleTurns: 14,
    },
  );
  const resumableDraft = await renderPortal(
    "#/assignment/ics4u-m11-culminating-assignment",
    session,
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
      localStorageSeed: localDraftState(
        "resume-device-draft.pdf",
        "2026-08-02T11:00:00.000Z",
      ),
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname === "/v1/submissions") {
          return jsonResponse({
            data: [],
            page: { nextCursor: null, limit: 100 },
          });
        }
        return jsonResponse({ data: [] });
      },
      settleTurns: 14,
      interact: async ({ listeners }) => {
        const click = listeners.get("click")?.[0];
        assert.equal(typeof click, "function");
        await click({
          target: actionTarget("resume-device-draft", {
            id: "ics4u-m11-culminating-assignment",
          }),
        });
      },
    },
  );
  const remoteNoteOnly = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    {
      email: "note-only@example.test",
      firstName: "Note",
      displayName: "Note Student",
      role: "student",
    },
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
      localStorageSeed: studentStateStorage("note-only@example.test"),
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname !== "/v1/submissions") {
          return jsonResponse({ data: [] });
        }
        return jsonResponse({
          data: [
            {
              id: "note-only-central-submission",
              submissionId: "note-only-central-submission",
              student: {
                displayName: "Note Student",
                email: "note-only@example.test",
              },
              courseCode: "SCH4U",
              assignmentId: "sch4u-m02-assignment",
              assignmentTitle: "Safer Organic Product Reformulation Dossier",
              status: "submitted",
              submittedAt: "2026-08-02T12:00:00.000Z",
              receiptId: "NOTE-ONLY-CENTRAL",
              note: "My response is recorded centrally without an attachment.",
              files: [],
            },
          ],
          page: { nextCursor: null, limit: 100 },
        });
      },
      settleTurns: 14,
    },
  );
  const remoteFileBacked = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    {
      email: "drive-file@example.test",
      firstName: "Drive",
      displayName: "Drive File Student",
      role: "student",
    },
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
      localStorageSeed: studentStateStorage("drive-file@example.test"),
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname !== "/v1/submissions") {
          return jsonResponse({ data: [] });
        }
        return jsonResponse({
          data: [
            {
              id: "drive-file-submission",
              submissionId: "drive-file-submission",
              student: {
                displayName: "Drive File Student",
                email: "drive-file@example.test",
              },
              courseCode: "SCH4U",
              assignmentId: "sch4u-m02-assignment",
              assignmentTitle: "Safer Organic Product Reformulation Dossier",
              status: "submitted",
              submittedAt: "2026-08-02T12:30:00.000Z",
              receiptId: "DRIVE-FILE-RECEIPT",
              files: [
                {
                  id: "drive-file-id",
                  name: "reformulation-dossier.pdf",
                  mimeType: "application/pdf",
                  sizeBytes: 4096,
                  openUrl:
                    "/v1/submissions/drive-file-submission/files/drive-file-id/open",
                },
              ],
            },
          ],
          page: { nextCursor: null, limit: 100 },
        });
      },
      settleTurns: 14,
    },
  );

  assert.match(uploadPaused, /Device-Only Draft Mode/);
  assert.match(uploadPaused, /Save Draft on This Device/);
  assert.doesNotMatch(uploadPaused, /Lotus Drive Upload Ready/);
  assert.match(uploadConnected, /Lotus Drive Upload Ready/);
  assert.match(uploadConnected, /> Upload to Lotus Drive</);
  assert.match(
    uploadConnected,
    /accept="\.pdf,\.docx,\.xlsx,\.pptx,\.txt,\.png,\.jpg,\.jpeg"/,
  );
  assert.doesNotMatch(uploadConnected, /accept="[^"]*\.(?:doc|ppt|xls)(?:,|")/);
  assert.match(noteOrFileConnected, /School Submission Service Ready/);
  assert.match(noteOrFileConnected, /> Submit to School Record</);
  assert.match(
    noteOrFileConnected,
    /A note-only submission is saved to the central school record/,
  );
  assert.match(savedDraft, /Saved on This Device/);
  assert.match(savedDraft, /culminating-project\.pdf/);
  assert.match(newerLocal, /older-remote-version\.pdf/);
  assert.match(newerLocal, /newer-device-draft\.pdf/);
  assert.match(newerLocal, /Unsent device draft retained/);
  assert.match(newerRemote, /newer-remote-version\.pdf/);
  assert.match(newerRemote, /stale-device-draft\.pdf/);
  assert.match(resumableDraft, /Submitting this saved draft creates the first official attempt/);
  assert.match(
    resumableDraft,
    /id="submission-file"[^>]*required aria-required="true"/,
  );
  assert.match(remoteNoteOnly, /Submitted to School Record/);
  assert.doesNotMatch(remoteNoteOnly, /Device-Only Draft|Local Draft/);
  assert.match(remoteFileBacked, /Submitted to Lotus Drive/);
  assert.match(remoteFileBacked, /reformulation-dossier\.pdf/);
  assert.doesNotMatch(remoteFileBacked, /Submitted to School Record/);
});

test("legacy submission histories receive stable chronological version numbers", async () => {
  const email = "legacy-history@example.test";
  const submissionsEndpoint = "https://api.example.test/v1/submissions";
  const result = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    {
      email,
      displayName: "Legacy History Student",
      role: "student",
    },
    {
      submissionConfig: { submissionsEndpoint, uploadReady: true },
      localStorageSeed: studentStateStorage(email),
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname !== "/v1/submissions") {
          return jsonResponse({ data: [] });
        }
        return jsonResponse({
          data: [
            {
              id: "legacy-history-current",
              submissionId: "legacy-history-current",
              student: {
                displayName: "Legacy History Student",
                email,
              },
              courseCode: "SCH4U",
              assignmentId: "sch4u-m02-assignment",
              status: "submitted",
              submittedAt: "2026-08-03T11:00:00.000Z",
              receiptId: "LEGACY-V2",
              history: [
                {
                  submittedAt: "2026-08-02T11:00:00.000Z",
                  receiptId: "LEGACY-V1",
                },
                {
                  submittedAt: "2026-08-03T11:00:00.000Z",
                  receiptId: "LEGACY-V2",
                },
              ],
            },
          ],
          page: { nextCursor: null, limit: 100 },
        });
      },
      settleTurns: 14,
    },
  );

  assert.match(result, /<dt>Version<\/dt><dd>2<\/dd>/);
  assert.equal((result.match(/<strong>Version 2<\/strong>/g) || []).length, 1);
  assert.equal((result.match(/<strong>Version 1<\/strong>/g) || []).length, 1);
});

test("background refreshes do not replace a dirty assignment upload form", async () => {
  let resolveNotifications;
  const assignmentForm = {
    dataset: {},
    querySelector() {
      return null;
    },
  };
  const field = (id) => ({
    id,
    closest(selector) {
      return selector === "#assignment-form" ? assignmentForm : null;
    },
  });
  const sentinel = "assignment note, integrity choice and file preview remain mounted";
  const result = await renderPortal(
    "#/assignment/sch4u-m02-assignment",
    {
      email: "draft-preservation@example.test",
      displayName: "Draft Preservation Student",
      role: "student",
    },
    {
      platformApiConfig: {
        notificationsEndpoint:
          "https://api.example.test/v1/me/notifications",
      },
      localStorageSeed: studentStateStorage(
        "draft-preservation@example.test",
      ),
      fetch: async (request) => {
        const url = new URL(String(request));
        if (url.pathname !== "/v1/me/notifications") {
          throw new Error(`Unexpected draft-preservation request: ${url.pathname}`);
        }
        return new Promise((resolve) => {
          resolveNotifications = resolve;
        });
      },
      querySelector(selector) {
        return selector === "#assignment-form" ? assignmentForm : null;
      },
      settleTurns: 0,
      interactionSettleTurns: 8,
      interact: async ({ appRoot, listeners }) => {
        const input = listeners.get("input")?.[0];
        const change = listeners.get("change")?.[0];
        assert.equal(typeof input, "function");
        assert.equal(typeof change, "function");
        input({ target: field("submission-note") });
        assignmentForm.dataset.dirty = "false";
        change({ target: field("submission-integrity") });
        assert.equal(assignmentForm.dataset.dirty, "true");
        appRoot.innerHTML = sentinel;
        resolveNotifications(
          jsonResponse({ data: [], unreadCount: 0 }),
        );
      },
      returnHarness: true,
    },
  );

  assert.equal(result.html, sentinel);
});

test("failed uploads show safe request references without exposing server details", async () => {
  const submitFailedUpload = async ({ errorPayload, headerRequestId }) => {
    const email = "upload-diagnostics@example.test";
    const form = interactiveForm(
      "assignment-form",
      { id: "sch4u-m02-assignment" },
      {
        note: "Safe diagnostic test.",
        file: new SubmissionTestFile("diagnostic-evidence.pdf", "application/pdf"),
        integrity: "confirmed",
      },
    );
    await renderPortal(
      "#/assignment/sch4u-m02-assignment",
      { email, displayName: "Upload Diagnostics", role: "student" },
      {
        FormData: SubmissionTestFormData,
        File: SubmissionTestFile,
        submissionConfig: {
          submissionsEndpoint: "https://api.example.test/v1/submissions",
          uploadReady: true,
        },
        sessionStorageSeed: {
          "lake-forest-learning-csrf-v1": "csrf-upload-diagnostics",
        },
        localStorageSeed: studentStateStorage(email),
        fetch: async (request, init = {}) => {
          const url = new URL(String(request));
          if (url.pathname !== "/v1/submissions") {
            throw new Error(`Unexpected diagnostic request: ${url.pathname}`);
          }
          if (init.method !== "POST") {
            return jsonResponse({
              data: [],
              page: { nextCursor: null, limit: 100 },
            });
          }
          return {
            ok: false,
            status: 500,
            headers: {
              get(name) {
                return name.toLowerCase() === "x-request-id"
                  ? headerRequestId
                  : null;
              },
            },
            text: async () => JSON.stringify({ error: errorPayload }),
          };
        },
        settleTurns: 12,
        interact: async ({ listeners }) => {
          const submitListener = listeners.get("submit")?.[0];
          assert.equal(typeof submitListener, "function");
          await submitListener({ target: form, preventDefault() {} });
        },
      },
    );
    return form.alert.textContent;
  };

  const payloadReference = await submitFailedUpload({
    errorPayload: {
      code: "SUBMISSION_DRIVE_UPLOAD_FAILED",
      message: "Private provider response containing an access token.",
      requestId: "req_payload_1234",
      details: { accessToken: "must-not-render" },
    },
    headerRequestId: "req_header_ignored",
  });
  assert.equal(
    payloadReference,
    "The service could not complete the upload. Your work was not submitted. Reference: req_payload_1234 · Code: SUBMISSION_DRIVE_UPLOAD_FAILED.",
  );
  assert.doesNotMatch(payloadReference, /Private provider|access token|must-not-render/);

  const headerFallback = await submitFailedUpload({
    errorPayload: {
      code: "unsafe code <script>",
      message: "Private database driver details.",
      requestId: "unsafe request <script>",
    },
    headerRequestId: "req_header_5678",
  });
  assert.equal(
    headerFallback,
    "The service could not complete the upload. Your work was not submitted. Reference: req_header_5678.",
  );
  assert.doesNotMatch(headerFallback, /Private database|script|unsafe code/);
});

test("submission UI source contains intended punctuation instead of mojibake", async () => {
  const app = await source("public/learning/app.js");
  assert.doesNotMatch(app, /(?:鈥|路|\uFFFD)/);
  assert.match(app, /Add a short note for your instructor…/);
  assert.match(app, /maximum 25 MB/);
  assert.match(app, /Uploading to Lotus Drive…/);
  assert.match(app, /formatFileSize\(file\.size\)\} · \$\{file\.type/);
});

test("note-only submissions stay central while attachments are identified as Lotus Drive uploads", async () => {
  const submit = async (file) => {
    const email = file
      ? "attachment-delivery@example.test"
      : "note-delivery@example.test";
    let postedForm = null;
    const responseId = file
      ? "51111111-1111-4111-8111-111111111111"
      : "52222222-2222-4222-8222-222222222222";
    const result = await renderPortal(
      "#/assignment/sch4u-m02-assignment",
      { email, displayName: "Delivery Test Student", role: "student" },
      {
        FormData: SubmissionTestFormData,
        File: SubmissionTestFile,
        submissionConfig: {
          submissionsEndpoint: "https://api.example.test/v1/submissions",
          uploadReady: true,
        },
        sessionStorageSeed: {
          "lake-forest-learning-csrf-v1": "csrf-delivery-test",
        },
        localStorageSeed: studentStateStorage(email),
        fetch: async (request, init = {}) => {
          const url = new URL(String(request));
          if (url.pathname !== "/v1/submissions") {
            throw new Error(`Unexpected delivery request: ${url.pathname}`);
          }
          if (init.method !== "POST") {
            return jsonResponse({
              data: [],
              page: { nextCursor: null, limit: 100 },
            });
          }
          postedForm = init.body;
          return jsonResponse(
            {
              data: {
                submission: {
                  id: responseId,
                  submissionId: responseId,
                  assignmentId: "sch4u-m02-assignment",
                  courseCode: "SCH4U",
                  student: {
                    email,
                    displayName: "Delivery Test Student",
                  },
                  note: "Ready for teacher review.",
                  fileName: file?.name || "",
                  submittedAt: "2026-08-03T10:00:00.000Z",
                  receiptId: responseId,
                  status: "submitted",
                },
              },
            },
            201,
          );
        },
        settleTurns: 12,
        interact: async ({ listeners }) => {
          const submitListener = listeners.get("submit")?.[0];
          assert.equal(typeof submitListener, "function");
          await submitListener({
            target: interactiveForm(
              "assignment-form",
              { id: "sch4u-m02-assignment" },
              {
                note: "Ready for teacher review.",
                file,
                integrity: "confirmed",
              },
            ),
            preventDefault() {},
          });
        },
        returnHarness: true,
      },
    );
    return { result, postedForm };
  };

  const noteOnly = await submit(null);
  assert.equal(noteOnly.postedForm.get("files"), null);
  assert.match(noteOnly.result.html, /Submitted to School Record/);
  assert.doesNotMatch(noteOnly.result.html, /Submitted to Lotus Drive/);
  assert.equal(
    (noteOnly.result.html.match(/<strong>Version 1<\/strong>/g) || []).length,
    1,
  );

  const attachment = new SubmissionTestFile(
    "evidence.pdf",
    "application/pdf",
  );
  const withAttachment = await submit(attachment);
  assert.equal(withAttachment.postedForm.get("files"), attachment);
  assert.match(withAttachment.result.html, /Submitted to Lotus Drive/);
});

test("catalog and module links expose only credential-free HTTPS destinations", async () => {
  const session = {
    email: "student@lakeforestacademy.ca",
    role: "student",
  };
  const mutateResources = (window) => {
    window.LFA_DRIVE_CATALOG_STATUS = { state: "ready", message: "" };
    const resources =
      window.LFA_PLATFORM_SEQUENCES.coursesByCode.SCH4U.modules[1]
        .selfStudyResources;
    resources[0].url = "javascript:alert(1)";
    resources[0].openUrl = "/v1/materials/material-1/open";
    resources[1].url = "http://unsafe.example.test/resource";
    resources[1].openUrl = "https://cross-origin.example.test/material";
    resources[2].url = "https://safe.example.test/resource";
  };
  const module = await renderPortal(
    "#/course/sch4u/module/SCH4U-M01",
    session,
    {
      beforeApp: mutateResources,
      platformApiConfig: {
        coursesEndpoint: studentPlatformApiConfig.coursesEndpoint,
      },
    },
  );
  assert.doesNotMatch(
    module,
    /javascript:|http:\/\/unsafe\.example\.test|cross-origin\.example\.test/,
  );
  assert.match(
    module,
    /https:\/\/api\.example\.test\/v1\/materials\/material-1\/open/,
  );
  assert.match(module, /https:\/\/safe\.example\.test\/resource/);
  assert.match(module, /Secure link unavailable/);

  const syllabus = await renderPortal("#/syllabus/sch4u", session);
  assert.match(syllabus, /Course Materials/);
  const catalog = await source("public/learning/course-catalog.js");
  assert.doesNotMatch(
    catalog,
    /studentMaterialsFolderUrl|coursebookUrl|assessmentUrl|curriculumMapUrl/,
  );
  assert.doesNotMatch(
    catalog,
    /drive\.google\.com\/(?:file\/d|drive\/folders)/,
  );
});

test("course lists disclose private Drive materials through course-scoped API links", async () => {
  const requests = [];
  const fetch = async (request) => {
    const url = new URL(String(request));
    requests.push(url.toString());
    if (url.pathname === "/v1/courses") {
      return jsonResponse({
        data: [
          {
            code: "SCH4U",
            materials: {
              count: 2,
              lastSyncedAt: "2026-08-03T08:30:00.000Z",
              href: "/v1/courses/SCH4U/materials",
            },
          },
        ],
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/materials") {
      return jsonResponse({
        data: [
          {
            id: "material-1",
            courseCode: "SCH4U",
            unitNumber: null,
            category: "Lessons",
            name: "SCH4U Coursebook.pdf",
            mimeType: "application/pdf",
            sizeBytes: 2048,
            openUrl: "/v1/materials/material-1/open",
          },
          {
            id: "material-2",
            courseCode: "SCH4U",
            unitNumber: null,
            category: "Assessments",
            name: "SCH4U Assessment Guide.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            openUrl: "/v1/materials/material-2/open",
            webViewLink:
              "https://drive.google.com/file/d/private-file-id/view",
          },
        ],
        page: { nextCursor: null, limit: 100 },
      });
    }
    throw new Error(`Unexpected request: ${url.pathname}`);
  };
  const clickDisclosure = async ({ listeners }) => {
    const button = {
      dataset: {
        action: "toggle-course-materials",
        course: "sch4u",
        context: "student",
      },
      closest(selector) {
        return selector === "[data-action], [data-route]" ? this : null;
      },
    };
    await listeners.get("click")[0]({ target: button });
  };
  const result = await renderPortal(
    "#/courses",
    { email: "student@lakeforestacademy.ca", role: "student" },
    {
      platformApiConfig: {
        coursesEndpoint: "https://api.example.test/v1/courses",
      },
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = { state: "ready", message: "" };
      },
      fetch,
      settleTurns: 16,
      interact: clickDisclosure,
      interactionSettleTurns: 8,
      returnHarness: true,
    },
  );

  assert.match(result.html, /<article class="course-card[^>]*>/);
  assert.doesNotMatch(result.html, /<a class="course-card/);
  assert.match(result.html, /Open Course/);
  assert.match(result.html, /aria-expanded="true"/);
  assert.match(result.html, /SCH4U Coursebook\.pdf/);
  assert.match(result.html, /SCH4U Assessment Guide\.pdf/);
  assert.match(result.html, /Course Resources/);
  assert.doesNotMatch(result.html, /Unit 0/);
  assert.match(
    result.html,
    /https:\/\/api\.example\.test\/v1\/materials\/material-1\/open/,
  );
  assert.doesNotMatch(
    result.html,
    /drive\.google\.com\/file\/d|private-file-id/,
  );
  assert.ok(requests.some((url) => new URL(url).pathname === "/v1/courses"));
  assert.ok(
    requests.some(
      (url) =>
        new URL(url).pathname === "/v1/courses/SCH4U/materials" &&
        new URL(url).searchParams.get("limit") === "100",
    ),
  );

  const assessmentHub = await renderPortal(
    "#/assessments",
    { email: "student@lakeforestacademy.ca", role: "student" },
    {
      platformApiConfig: {
        coursesEndpoint: "https://api.example.test/v1/courses",
      },
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = { state: "ready", message: "" };
      },
      fetch,
      settleTurns: 16,
    },
  );
  assert.match(assessmentHub, /Assessment Centre/);
  assert.match(assessmentHub, /65%[\s\S]*25%[\s\S]*10%/);
  assert.match(assessmentHub, /SCH4U Assessment Guide\.pdf/);
  assert.match(
    assessmentHub,
    /https:\/\/api\.example\.test\/v1\/materials\/material-2\/open/,
  );
  assert.doesNotMatch(
    assessmentHub,
    /drive\.google\.com\/file\/d|private-file-id/,
  );
});

test("faculty course resources are interactive while Drive sync remains admin-only", async () => {
  const fetch = async (request) => {
    const url = new URL(String(request));
    if (url.pathname === "/v1/courses") {
      return jsonResponse({
        data: [
          {
            code: "SCH4U",
            materials: {
              count: 1,
              href: "/v1/courses/SCH4U/materials",
            },
          },
        ],
      });
    }
    if (url.pathname === "/v1/courses/SCH4U/materials") {
      return jsonResponse({
        data: [
          {
            id: "teacher-material-1",
            courseCode: "SCH4U",
            category: "Lessons",
            name: "Teacher-visible Course File.pdf",
            openUrl: "/v1/materials/teacher-material-1/open",
          },
        ],
        page: { nextCursor: null },
      });
    }
    throw new Error(`Unexpected request: ${url.pathname}`);
  };
  const result = await renderPortal(
    "#/teacher/courses",
    {
      email: "james.whitmore@lakeforestacademy.ca",
      role: "teacher",
    },
    {
      platformApiConfig: {
        coursesEndpoint: "https://api.example.test/v1/courses",
      },
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = { state: "ready", message: "" };
        window.LFA_DRIVE_CONFIG = {
          sourceConfigured: true,
          syncEndpoint: "https://api.example.test/v1/admin/drive/sync",
        };
      },
      fetch,
      settleTurns: 16,
      interact: async ({ listeners }) => {
        const button = {
          dataset: {
            action: "toggle-course-materials",
            course: "sch4u",
            context: "teacher",
          },
          closest(selector) {
            return selector === "[data-action], [data-route]" ? this : null;
          },
        };
        await listeners.get("click")[0]({ target: button });
      },
      interactionSettleTurns: 8,
      returnHarness: true,
    },
  );

  assert.match(result.html, /Open Workspace/);
  assert.match(result.html, /aria-expanded="true"/);
  assert.match(result.html, /Teacher-visible Course File\.pdf/);
  assert.doesNotMatch(result.html, /Sync from Drive/);

  const materials = await renderPortal(
    "#/teacher/materials",
    {
      email: "james.whitmore@lakeforestacademy.ca",
      role: "teacher",
    },
    {
      platformApiConfig: {
        coursesEndpoint: "https://api.example.test/v1/courses",
      },
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = { state: "ready", message: "" };
        window.LFA_DRIVE_CONFIG = {
          sourceConfigured: true,
          syncEndpoint: "https://api.example.test/v1/admin/drive/sync",
        };
      },
      fetch,
      settleTurns: 16,
    },
  );
  assert.match(materials, /Course Materials/);
  assert.doesNotMatch(materials, /Sync from Drive/);
});

test("teacher administrators can verify a protected Drive source before the read catalogue is ready", async () => {
  const syncRequests = [];
  const result = await renderPortal(
    "#/teacher/materials",
    {
      email: "platform.admin@lakeforestacademy.ca",
      role: "teacher_admin",
      firstName: "Platform",
      lastName: "Administrator",
      displayName: "Platform Administrator",
      publicId: "admin-1",
    },
    {
      beforeApp(window) {
        window.LFA_DRIVE_CATALOG_STATUS = {
          state: "unavailable",
          message: "The protected course catalogue has not passed verification.",
        };
        window.LFA_DRIVE_CONFIG = {
          sourceName: "Protected Six-Course Library",
          sourceConfigured: true,
          syncEndpoint: "https://api.example.test/v1/admin/drive/sync",
        };
      },
      fetch: async (request, options = {}) => {
        const url = new URL(String(request));
        if (url.pathname === "/v1/admin/drive/sync") {
          syncRequests.push({ url: url.toString(), options });
          return jsonResponse({ data: { status: "queued" } });
        }
        throw new Error(`Unexpected request: ${url.pathname}`);
      },
      interact: async ({ listeners }) => {
        const button = {
          dataset: { action: "sync-drive-materials" },
          closest(selector) {
            return selector === "[data-action], [data-route]" ? this : null;
          },
        };
        await listeners.get("click")[0]({ target: button });
      },
      interactionSettleTurns: 8,
      returnHarness: true,
    },
  );

  assert.match(result.html, /Verification required/);
  assert.match(result.html, /Retry Drive Verification/);
  assert.match(result.html, /data-action="sync-drive-materials"/);
  assert.doesNotMatch(
    result.html,
    /Open Drive Folder|Folder ID|drive\.google\.com\/drive\/folders/,
  );
  assert.equal(syncRequests.length, 1);
  assert.equal(syncRequests[0].options.method, "POST");
});

test("the browser bundle exposes no Drive identifiers or direct file and folder links", async () => {
  const [app, bootstrap, courseCatalog] = await Promise.all([
    source("public/learning/app.js"),
    source("public/learning/bootstrap.js"),
    source("public/learning/course-catalog.js"),
  ]);
  for (const browserSource of [app, bootstrap, courseCatalog]) {
    assert.doesNotMatch(browserSource, /rootFolderId|rootFolderUrl/);
    assert.doesNotMatch(
      browserSource,
      /Open Drive Folder|Folder ID|drive\.google\.com\/(?:file\/d|drive\/folders)/,
    );
  }
  assert.doesNotMatch(
    courseCatalog,
    /\bdrive\s*:|studentMaterialsFolderUrl|coursebookUrl|assessmentUrl|curriculumMapUrl/,
  );
});

test("Drive material cache keys are account- and role-scoped", async () => {
  const app = await source("public/learning/app.js");
  assert.match(
    app,
    /session\?\.publicId \|\| normalizeEmail\(session\?\.email\) \|\| "anonymous"/,
  );
  assert.match(app, /return `\$\{sourceKey\}::\$\{role\}:\$\{accountKey\}`/);
  assert.match(app, /function resetDriveMaterialsForSession\(\)/);
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
