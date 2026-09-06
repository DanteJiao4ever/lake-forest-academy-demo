(() => {
  "use strict";

  const DEFAULT_CONFIG = Object.freeze({
    apiOrigin: "",
    healthPath: "/health/ready",
    uploadHealthPath: "/health/upload-ready",
    driveCatalogHealthPath: "/health/drive-catalog-ready",
    passwordResetHealthPath: "/health/password-reset-ready",
    accountSecurityHealthPath: "/health/account-security-ready",
    workspaceAuthHealthPath: "/health/workspace-auth-ready",
    healthTimeoutMs: 3500,
    googleWorkspaceAuthStart: "",
    driveSyncPath: "",
  });
  const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
  const SCRIPT_VERSION = "login-recovery-v2";
  let pendingServiceCheck = null;
  let lastFileConfig = {};

  function setApiStatus(state, message, origin = "") {
    window.LFA_API_STATUS = Object.freeze({
      state,
      message,
      origin,
      checkedAt: new Date().toISOString(),
    });
  }

  function setUploadStatus(state, message, origin = "") {
    window.LFA_UPLOAD_STATUS = Object.freeze({
      state,
      message,
      origin,
      checkedAt: new Date().toISOString(),
    });
  }

  function setDriveCatalogStatus(state, message, origin = "") {
    window.LFA_DRIVE_CATALOG_STATUS = Object.freeze({
      state,
      message,
      origin,
      checkedAt: new Date().toISOString(),
    });
  }

  function localApiOrigin() {
    return LOCAL_HOSTS.has(window.location.hostname)
      ? `http://${window.location.hostname}:8787`
      : "";
  }

  function secureApiOrigin(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      const localHttp =
        url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname);
      if (url.protocol !== "https:" && !localHttp) return null;
      if (url.username || url.password || url.search || url.hash) return null;
      if (url.pathname && url.pathname !== "/") return null;
      return url.origin;
    } catch {
      return null;
    }
  }

  function apiUrl(origin, path) {
    if (!origin) return "";
    const url = new URL(path, `${origin}/`);
    return url.origin === origin ? url.toString() : "";
  }

  function optionalApiUrl(origin, value) {
    const raw = String(value || "").trim();
    if (!origin || !raw) return "";
    try {
      const url = new URL(raw, `${origin}/`);
      return url.origin === origin && !url.username && !url.password
        ? url.toString()
        : "";
    } catch {
      return "";
    }
  }

  function applyEndpointConfiguration(
    origin,
    config = DEFAULT_CONFIG,
    options = {},
  ) {
    const ready = Boolean(origin);
    const uploadReady = ready && options.uploadReady === true;
    const driveCatalogReady =
      ready && options.driveCatalogReady === true;
    const passwordResetReady =
      ready && options.passwordResetReady === true;
    const accountSecurityReady =
      ready && options.accountSecurityReady === true;
    const workspaceAuthReady =
      ready && options.workspaceAuthReady === true;
    const syncEndpoint = ready
      ? optionalApiUrl(origin, config.driveSyncPath)
      : "";
    window.LFA_AUTH_CONFIG = Object.freeze({
      loginEndpoint: ready ? apiUrl(origin, "/v1/auth/login") : "",
      registrationEndpoint: ready ? apiUrl(origin, "/v1/auth/register") : "",
      passwordResetRequestEndpoint: passwordResetReady
        ? apiUrl(origin, "/v1/auth/password-reset-requests")
        : "",
      passwordResetEndpoint: passwordResetReady
        ? apiUrl(origin, "/v1/auth/password-resets")
        : "",
      passwordChangeEndpoint: accountSecurityReady
        ? apiUrl(origin, "/v1/auth/password-change")
        : "",
      enrollmentsEndpoint: ready
        ? apiUrl(origin, "/v1/me/enrollments")
        : "",
      googleWorkspaceAuthStart: workspaceAuthReady
        ? optionalApiUrl(origin, config.googleWorkspaceAuthStart)
        : "",
      workspaceSessionEndpoint: ready
        ? apiUrl(origin, "/v1/auth/session")
        : "",
      workspaceLogoutEndpoint: ready
        ? apiUrl(origin, "/v1/auth/logout")
        : "",
      allowDeviceAccounts: false,
    });
    window.LFA_DRIVE_CONFIG = Object.freeze({
      sourceName: "Lotus Grade 12 Six-Course Library",
      sourceConfigured: Boolean(syncEndpoint),
      uploadReady,
      catalogReady: driveCatalogReady,
      materialsEndpoint: driveCatalogReady
        ? apiUrl(origin, "/v1/materials")
        : "",
      // An administrator must be able to run the first protected verification
      // before the read catalogue can report ready.
      syncEndpoint,
      submissionsEndpoint: ready ? apiUrl(origin, "/v1/submissions") : "",
      gradingEndpoint: ready ? apiUrl(origin, "/v1/grades") : "",
    });
    window.LFA_PLATFORM_API_CONFIG = Object.freeze({
      coursesEndpoint: ready ? apiUrl(origin, "/v1/courses") : "",
      studentProgressEndpoint: ready ? apiUrl(origin, "/v1/me/progress") : "",
      studentGradesEndpoint: ready ? apiUrl(origin, "/v1/me/grades") : "",
      notificationsEndpoint: ready
        ? apiUrl(origin, "/v1/me/notifications")
        : "",
      moduleProgressEndpoint: ready
        ? apiUrl(origin, "/v1/me/progress/modules")
        : "",
      activityProgressEndpoint: ready
        ? apiUrl(origin, "/v1/me/progress/activities")
        : "",
      teacherCoursesEndpoint: ready
        ? apiUrl(origin, "/v1/teacher/courses")
        : "",
      teacherStudentsEndpoint: ready
        ? apiUrl(origin, "/v1/teacher/students")
        : "",
    });
  }

  async function readRuntimeConfig() {
    let fileConfig = lastFileConfig;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`./runtime-config.json?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          fileConfig = payload;
          lastFileConfig = payload;
        }
      }
    } catch {
      // A missing runtime file must never prevent the static portal from opening.
    } finally {
      window.clearTimeout(timeout);
    }
    const injected =
      window.LFA_RUNTIME_CONFIG &&
      typeof window.LFA_RUNTIME_CONFIG === "object" &&
      !Array.isArray(window.LFA_RUNTIME_CONFIG)
        ? window.LFA_RUNTIME_CONFIG
        : {};
    return { ...DEFAULT_CONFIG, ...fileConfig, ...injected };
  }

  async function apiIsReady(
    origin,
    healthPath,
    config,
    timeoutCeilingMs = 10000,
  ) {
    const healthUrl = optionalApiUrl(
      origin,
      String(healthPath || ""),
    );
    if (!healthUrl) return false;
    const requestedTimeout = Number(config.healthTimeoutMs);
    const timeoutMs = Number.isFinite(requestedTimeout)
      ? Math.min(
          timeoutCeilingMs,
          Math.max(1000, Math.round(requestedTimeout)),
        )
      : Math.min(timeoutCeilingMs, DEFAULT_CONFIG.healthTimeoutMs);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) return false;
      const payload = await response.json();
      return payload?.status === "ready";
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function loadScript(fileName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `./${fileName}?v=${SCRIPT_VERSION}`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`${fileName} could not be loaded`));
      document.head.append(script);
    });
  }

  function showStartupError() {
    const root = document.querySelector("#app");
    if (!root) return;
    const main = document.createElement("main");
    main.className = "bootstrap-state bootstrap-state-error";
    main.id = "main-content";
    main.setAttribute("role", "alert");
    const heading = document.createElement("h1");
    heading.textContent = "The learning portal could not open";
    const message = document.createElement("p");
    message.textContent =
      "The public website is still available. Refresh this page to try the learning portal again.";
    main.append(heading, message);
    root.replaceChildren(main);
  }

  async function probeServices(origin, config) {
    const checks = [
      [config.healthPath || DEFAULT_CONFIG.healthPath, 10000],
      [config.uploadHealthPath || DEFAULT_CONFIG.uploadHealthPath, 2500],
      [config.driveCatalogHealthPath || DEFAULT_CONFIG.driveCatalogHealthPath, 2500],
      [config.passwordResetHealthPath || DEFAULT_CONFIG.passwordResetHealthPath, 2500],
      [config.accountSecurityHealthPath || DEFAULT_CONFIG.accountSecurityHealthPath, 2500],
      [config.workspaceAuthHealthPath || DEFAULT_CONFIG.workspaceAuthHealthPath, 2500],
    ];
    const probe = ([path, ceiling]) => apiIsReady(origin, path, config, ceiling);
    const results = await Promise.all(checks.map(probe));
    // A cold start or a transient network failure must not disable login for
    // the whole visit. Retry only failed health GETs, never auth submissions.
    if (results.some((ready) => !ready)) {
      await new Promise((resolve) => window.setTimeout(resolve, 750));
      return Promise.all(checks.map((check, index) =>
        results[index] ? true : probe(check),
      ));
    }
    return results;
  }

  async function configureServices(config) {
    setApiStatus(
      "checking",
      "Checking whether secure school services are ready.",
    );
    setDriveCatalogStatus(
      "checking",
      "Checking whether the secure course-material catalogue is ready.",
    );
    const requestedOrigin = config.apiOrigin || localApiOrigin();
    const origin = secureApiOrigin(requestedOrigin);

    if (origin === null) {
      applyEndpointConfiguration("");
      setUploadStatus(
        "invalid",
        "The school API configuration was rejected. File uploads remain disabled.",
      );
      setDriveCatalogStatus(
        "invalid",
        "The course-material service configuration was rejected.",
      );
      setApiStatus(
        "invalid",
        "The school API configuration was rejected. Secure remote features remain disabled.",
      );
    } else if (!origin) {
      applyEndpointConfiguration("");
      setUploadStatus(
        "disabled",
        "File uploads are awaiting the school API deployment.",
      );
      setDriveCatalogStatus(
        "disabled",
        "Course materials are awaiting the school API deployment.",
      );
      setApiStatus(
        "disabled",
        "Secure sign-in and registration are awaiting the school API deployment. No browser-only password is accepted.",
      );
    } else {
      const [
        coreReady,
        uploadReady,
        driveCatalogHealthReady,
        passwordResetReady,
        accountSecurityReady,
        workspaceAuthReady,
      ] = await probeServices(origin, config);
      if (coreReady) {
        const driveCatalogReady = driveCatalogHealthReady === true;
        applyEndpointConfiguration(origin, config, {
          uploadReady,
          driveCatalogReady,
          passwordResetReady,
          accountSecurityReady,
          workspaceAuthReady,
        });
        setApiStatus(
          "ready",
          uploadReady
            ? "Secure school services are connected."
            : "Secure sign-in is connected. File uploads are temporarily unavailable.",
          origin,
        );
        setUploadStatus(
          uploadReady ? "ready" : "unavailable",
          uploadReady
            ? "Secure file uploads are connected."
            : "Secure file uploads are temporarily unavailable. Work can still be saved as a device draft.",
          origin,
        );
        setDriveCatalogStatus(
          driveCatalogReady ? "ready" : "unavailable",
          driveCatalogReady
            ? "Secure course materials are connected."
            : "Course materials are temporarily unavailable. Courses and other learning tools remain available.",
          origin,
        );
      } else {
        applyEndpointConfiguration("");
        setApiStatus(
          "unavailable",
          "We could not connect to secure school services. Check your internet connection, then try again. Your password has not been submitted.",
          origin,
        );
        setUploadStatus(
          "unavailable",
          "Secure file uploads are temporarily unavailable.",
          origin,
        );
        setDriveCatalogStatus(
          "unavailable",
          "Course materials are temporarily unavailable.",
          origin,
        );
      }
    }

    return window.LFA_API_STATUS;
  }

  function recheckServices() {
    if (pendingServiceCheck) return pendingServiceCheck;
    pendingServiceCheck = readRuntimeConfig()
      .then(configureServices)
      .finally(() => { pendingServiceCheck = null; });
    return pendingServiceCheck;
  }

  async function start() {
    window.LFA_RECHECK_SERVICES = recheckServices;
    await recheckServices();
    await loadScript("course-catalog.js");
    await loadScript("platform-sequences.js");
    await loadScript("app.js");
  }

  start().catch(showStartupError);
})();
