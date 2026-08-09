import { z } from "zod";

const truthy = new Set(["1", "true", "yes", "on"]);

function booleanValue(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return truthy.has(String(value).toLowerCase());
}

function integerValue(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
}

const configSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  databaseUrl: z.string().min(1),
  databaseSocket: z.string(),
  databaseSsl: z.boolean(),
  databasePoolMax: z.number().int().min(1).max(20),
  allowedOrigins: z.array(z.string().url()).min(1),
  cookieName: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  cookieSecure: z.boolean(),
  sessionTtlHours: z.number().int().min(1).max(24 * 30),
  bcryptCost: z.number().int().min(10).max(15),
  csrfSecret: z.string().min(16),
  passwordResetTokenTtlMinutes: z.number().int().min(10).max(60),
  passwordResetRequestCooldownSeconds: z.number().int().min(30).max(15 * 60),
  passwordResetUrl: z.string().url(),
  passwordResetMailProvider: z.enum(["disabled", "gmail_api"]),
  passwordResetFromEmail: z.union([z.literal(""), z.string().email()]),
  passwordResetFromName: z.string().trim().min(1).max(100),
  gmailImpersonatedUser: z.union([z.literal(""), z.string().email()]),
  gmailCredentialsBase64: z.string(),
  gmailCredentialsPath: z.string(),
  workspaceOAuthProvider: z.enum(["disabled", "google"]),
  workspaceOAuthClientId: z.string(),
  workspaceOAuthClientSecret: z.string(),
  workspaceOAuthTransactionSecret: z.string(),
  workspaceOAuthRedirectUri: z.union([z.literal(""), z.string().url()]),
  workspaceOAuthHostedDomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
    ),
  workspaceOAuthFrontendUrl: z.string().url(),
  workspaceOAuthTransactionTtlMinutes: z.number().int().min(5).max(15),
  workspaceOAuthCookieName: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  maxUploadFiles: z.number().int().min(1).max(20),
  maxFileBytes: z.number().int().min(1024).max(100 * 1024 * 1024),
  maxRequestBytes: z.number().int().min(1024).max(250 * 1024 * 1024),
  clamavHost: z.string().min(1),
  clamavPort: z.number().int().min(1).max(65535),
  clamavRequired: z.boolean(),
  googleCredentialsBase64: z.string(),
  googleCredentialsPath: z.string(),
  curriculumDriveRootId: z.string(),
  curriculumDriveRootName: z.string().min(1),
  submissionTargetRootId: z.string(),
  submissionTargetRootName: z.string().min(1),
});

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const workspaceOAuthProvider =
    env.GOOGLE_WORKSPACE_OAUTH_PROVIDER || "disabled";
  const config = configSchema.parse({
    nodeEnv,
    host: env.HOST || "127.0.0.1",
    port: integerValue(env.PORT, 8787),
    databaseUrl:
      env.DATABASE_URL ||
      (nodeEnv === "test" ? "postgresql://test.invalid/lfa" : ""),
    databaseSocket: env.INSTANCE_UNIX_SOCKET || "",
    databaseSsl: booleanValue(env.DATABASE_SSL, nodeEnv === "production"),
    databasePoolMax: integerValue(env.DATABASE_POOL_MAX, nodeEnv === "production" ? 5 : 10),
    allowedOrigins: String(
      env.ALLOWED_ORIGINS ||
        "https://lakeforestacademy.ca,https://www.lakeforestacademy.ca,http://localhost:5173,http://127.0.0.1:5173",
    )
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    cookieName:
      env.COOKIE_NAME ||
      (nodeEnv === "production" ? "__Host-lfa_session" : "lfa_session"),
    cookieSecure: booleanValue(env.COOKIE_SECURE, nodeEnv === "production"),
    sessionTtlHours: integerValue(env.SESSION_TTL_HOURS, 12),
    bcryptCost: integerValue(env.BCRYPT_COST, 12),
    csrfSecret:
      env.CSRF_SECRET ||
      (nodeEnv === "test" ? "test-only-csrf-secret-at-least-32-bytes" : ""),
    passwordResetTokenTtlMinutes: integerValue(
      env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
      30,
    ),
    passwordResetRequestCooldownSeconds: integerValue(
      env.PASSWORD_RESET_REQUEST_COOLDOWN_SECONDS,
      60,
    ),
    passwordResetUrl:
      env.PASSWORD_RESET_URL ||
      "https://lakeforestacademy.ca/learning/#/reset-password",
    passwordResetMailProvider:
      env.PASSWORD_RESET_MAIL_PROVIDER || "disabled",
    passwordResetFromEmail: env.PASSWORD_RESET_FROM_EMAIL || "",
    passwordResetFromName:
      env.PASSWORD_RESET_FROM_NAME || "Lake Forest Academy",
    gmailImpersonatedUser: env.GMAIL_IMPERSONATED_USER || "",
    gmailCredentialsBase64:
      env.GMAIL_SERVICE_ACCOUNT_JSON_BASE64 || "",
    gmailCredentialsPath:
      env.GMAIL_APPLICATION_CREDENTIALS || "",
    workspaceOAuthProvider,
    workspaceOAuthClientId:
      workspaceOAuthProvider === "google"
        ? env.GOOGLE_WORKSPACE_OAUTH_CLIENT_ID || ""
        : "",
    workspaceOAuthClientSecret:
      workspaceOAuthProvider === "google"
        ? env.GOOGLE_WORKSPACE_OAUTH_CLIENT_SECRET || ""
        : "",
    workspaceOAuthTransactionSecret:
      workspaceOAuthProvider === "google"
        ? env.GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET || ""
        : "",
    workspaceOAuthRedirectUri:
      workspaceOAuthProvider === "google"
        ? env.GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI || ""
        : "",
    workspaceOAuthHostedDomain:
      env.GOOGLE_WORKSPACE_HOSTED_DOMAIN || "lakeforestacademy.ca",
    workspaceOAuthFrontendUrl:
      env.GOOGLE_WORKSPACE_FRONTEND_URL ||
      "https://lakeforestacademy.ca/learning/",
    workspaceOAuthTransactionTtlMinutes: integerValue(
      env.GOOGLE_WORKSPACE_OAUTH_TRANSACTION_TTL_MINUTES,
      10,
    ),
    workspaceOAuthCookieName:
      env.GOOGLE_WORKSPACE_OAUTH_COOKIE_NAME ||
      (nodeEnv === "production"
        ? "__Host-lfa_workspace_oauth"
        : "lfa_workspace_oauth"),
    maxUploadFiles: integerValue(env.MAX_UPLOAD_FILES, 1),
    maxFileBytes: integerValue(env.MAX_FILE_BYTES, 25 * 1024 * 1024),
    maxRequestBytes: integerValue(
      env.MAX_REQUEST_BYTES,
      28 * 1024 * 1024,
    ),
    clamavHost: env.CLAMAV_HOST || "127.0.0.1",
    clamavPort: integerValue(env.CLAMAV_PORT, 3310),
    clamavRequired: booleanValue(
      env.CLAMAV_REQUIRED,
      nodeEnv === "production",
    ),
    googleCredentialsBase64: env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 || "",
    googleCredentialsPath: env.GOOGLE_APPLICATION_CREDENTIALS || "",
    curriculumDriveRootId: env.CURRICULUM_DRIVE_ROOT_ID || "",
    curriculumDriveRootName:
      env.CURRICULUM_DRIVE_ROOT_NAME ||
      "Lotus Academy Formal Course Pilots - Text Based",
    submissionTargetRootId: env.SUBMISSION_TARGET_ROOT_ID || "",
    submissionTargetRootName:
      env.SUBMISSION_TARGET_ROOT_NAME ||
      "Lake Forest Learning - Student Submissions",
  });

  if (config.nodeEnv === "production" && !config.cookieSecure) {
    throw new Error("COOKIE_SECURE must be true in production.");
  }
  if (
    config.nodeEnv === "production" &&
    !config.cookieName.startsWith("__Host-")
  ) {
    throw new Error("COOKIE_NAME must use the __Host- prefix in production.");
  }
  if (config.nodeEnv === "production" && config.csrfSecret.length < 32) {
    throw new Error("CSRF_SECRET must contain at least 32 characters in production.");
  }
  if (config.nodeEnv === "production" && !config.curriculumDriveRootId.trim()) {
    throw new Error("CURRICULUM_DRIVE_ROOT_ID is required in production.");
  }
  if (
    config.passwordResetMailProvider === "gmail_api" &&
    (!config.passwordResetFromEmail || !config.gmailImpersonatedUser)
  ) {
    throw new Error(
      "PASSWORD_RESET_FROM_EMAIL and GMAIL_IMPERSONATED_USER are required when PASSWORD_RESET_MAIL_PROVIDER=gmail_api.",
    );
  }
  if (
    config.passwordResetMailProvider === "gmail_api" &&
    config.passwordResetFromEmail.toLowerCase() !==
      config.gmailImpersonatedUser.toLowerCase()
  ) {
    throw new Error(
      "PASSWORD_RESET_FROM_EMAIL must match GMAIL_IMPERSONATED_USER unless verified Send As support is implemented.",
    );
  }
  const workspaceOAuthValues = [
    config.workspaceOAuthClientId,
    config.workspaceOAuthClientSecret,
    config.workspaceOAuthTransactionSecret,
    config.workspaceOAuthRedirectUri,
  ];
  if (
    config.workspaceOAuthProvider === "google" &&
    workspaceOAuthValues.some((value) => !value)
  ) {
    throw new Error(
      "GOOGLE_WORKSPACE_OAUTH_CLIENT_ID, GOOGLE_WORKSPACE_OAUTH_CLIENT_SECRET, GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET and GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI are required when GOOGLE_WORKSPACE_OAUTH_PROVIDER=google.",
    );
  }
  if (config.workspaceOAuthProvider === "google") {
    const redirectUri = new URL(config.workspaceOAuthRedirectUri);
    const frontendUrl = new URL(config.workspaceOAuthFrontendUrl);
    const secureRedirect = redirectUri.protocol === "https:" ||
      (config.nodeEnv !== "production" && redirectUri.protocol === "http:");
    if (
      !secureRedirect ||
      (config.nodeEnv === "production" &&
        redirectUri.origin !== "https://api.lakeforestacademy.ca") ||
      redirectUri.username ||
      redirectUri.password ||
      redirectUri.search ||
      redirectUri.hash ||
      redirectUri.pathname !== "/v1/auth/google-workspace/callback"
    ) {
      throw new Error(
        "GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI must be the exact secure Workspace callback URL.",
      );
    }
    if (
      frontendUrl.username ||
      frontendUrl.password ||
      frontendUrl.search ||
      frontendUrl.hash ||
      frontendUrl.pathname !== "/learning/" ||
      (config.nodeEnv === "production" && frontendUrl.protocol !== "https:") ||
      !config.allowedOrigins.includes(frontendUrl.origin)
    ) {
      throw new Error(
        "GOOGLE_WORKSPACE_FRONTEND_URL must use an allowed application origin without credentials, query or fragment.",
      );
    }
    if (
      config.nodeEnv === "production" &&
      !config.workspaceOAuthCookieName.startsWith("__Host-")
    ) {
      throw new Error(
        "GOOGLE_WORKSPACE_OAUTH_COOKIE_NAME must use the __Host- prefix in production.",
      );
    }
    if (config.workspaceOAuthCookieName === config.cookieName) {
      throw new Error(
        "GOOGLE_WORKSPACE_OAUTH_COOKIE_NAME must differ from COOKIE_NAME.",
      );
    }
    if (config.workspaceOAuthTransactionSecret.length < 32) {
      throw new Error(
        "GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET must contain at least 32 characters.",
      );
    }
  }
  return Object.freeze(config);
}
