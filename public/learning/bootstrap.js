(() => {
  "use strict";

  const DEFAULT_CONFIG = Object.freeze({
    apiOrigin: "",
    healthPath: "/health/ready",
    uploadHealthPath: "/health/upload-ready",
    healthTimeoutMs: 3500,
    googleWorkspaceAuthStart: "",
    driveSyncPath: "",
  });
  const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
  const SCRIPT_VERSION = "grade12-login-readiness-v3";

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
    window.LFA_AUTH_CONFIG = Object.freeze({
      loginEndpoint: ready ? apiUrl(origin, "/v1/auth/login") : "",
      registrationEndpoint: ready ? apiUrl(origin, "/v1/auth/register") : "",
      enrollmentsEndpoint: ready
        ? apiUrl(origin, "/v1/me/enrollments")
        : "",
      googleWorkspaceAuthStart: ready
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
      rootFolderId: "1gwLFDrzh77HkYIV68mCErKkBbHEmikrG",
      rootFolderUrl:
        "https://drive.google.com/drive/folders/1gwLFDrzh77HkYIV68mCErKkBbHEmikrG",
      uploadReady,
      materialsEndpoint: ready ? apiUrl(origin, "/v1/materials") : "",
      syncEndpoint: uploadReady
        ? optionalApiUrl(origin, config.driveSyncPath)
        : "",
      submissionsEndpoint: ready ? apiUrl(origin, "/v1/submissions") : "",
      gradingEndpoint: ready ? apiUrl(origin, "/v1/grades") : "",
    });
    window.LFA_PLATFORM_API_CONFIG = Object.freeze({
      coursesEndpoint: ready ? apiUrl(origin, "/v1/courses") : "",
      studentProgressEndpoint: ready ? apiUrl(origin, "/v1/me/progress") : "",
      studentGradesEndpoint: ready ? apiUrl(origin, "/v1/me/grades") : "",
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
    let fileConfig = {};
    try {
      const response = await fetch(`./runtime-config.json?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          fileConfig = payload;
        }
      }
    } catch {
      // A missing runtime file must never prevent the static portal from opening.
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

  async function start() {
    setApiStatus(
      "checking",
      "Checking whether secure school services are ready.",
    );
    const config = await readRuntimeConfig();
    const requestedOrigin = config.apiOrigin || localApiOrigin();
    const origin = secureApiOrigin(requestedOrigin);

    if (origin === null) {
      applyEndpointConfiguration("");
      setUploadStatus(
        "invalid",
        "The school API configuration was rejected. File uploads remain disabled.",
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
      setApiStatus(
        "disabled",
        "Secure sign-in and registration are awaiting the school API deployment. No browser-only password is accepted.",
      );
    } else {
      const [coreReady, uploadReady] = await Promise.all([
        apiIsReady(
          origin,
          config.healthPath || DEFAULT_CONFIG.healthPath,
          config,
        ),
        apiIsReady(
          origin,
          config.uploadHealthPath || DEFAULT_CONFIG.uploadHealthPath,
          config,
          2500,
        ),
      ]);
      if (coreReady) {
        applyEndpointConfiguration(origin, config, { uploadReady });
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
      } else {
        applyEndpointConfiguration("");
        setApiStatus(
          "unavailable",
          "Secure school services are temporarily unavailable. Sign-in and registration remain disabled while the public learning page stays available.",
          origin,
        );
        setUploadStatus(
          "unavailable",
          "Secure file uploads are temporarily unavailable.",
          origin,
        );
      }
    }

    await loadScript("course-catalog.js");
    await loadScript("platform-sequences.js");
    await loadScript("app.js");
  }

  start().catch(showStartupError);
})();
