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
  allowedOrigins: z.array(z.string().url()).min(1),
  cookieName: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  cookieSecure: z.boolean(),
  sessionTtlHours: z.number().int().min(1).max(24 * 30),
  bcryptCost: z.number().int().min(10).max(15),
  csrfSecret: z.string().min(16),
  maxUploadFiles: z.number().int().min(1).max(20),
  maxFileBytes: z.number().int().min(1024).max(100 * 1024 * 1024),
  maxRequestBytes: z.number().int().min(1024).max(250 * 1024 * 1024),
  clamavHost: z.string().min(1),
  clamavPort: z.number().int().min(1).max(65535),
  clamavRequired: z.boolean(),
  googleCredentialsBase64: z.string(),
  googleCredentialsPath: z.string(),
  submissionTargetRootId: z.string(),
});

export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || "development";
  const config = configSchema.parse({
    nodeEnv,
    host: env.HOST || "127.0.0.1",
    port: integerValue(env.PORT, 8787),
    databaseUrl:
      env.DATABASE_URL ||
      (nodeEnv === "test" ? "postgresql://test.invalid/lfa" : ""),
    databaseSocket: env.INSTANCE_UNIX_SOCKET || "",
    databaseSsl: booleanValue(env.DATABASE_SSL, nodeEnv === "production"),
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
    submissionTargetRootId: env.SUBMISSION_TARGET_ROOT_ID || "",
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
  return Object.freeze(config);
}
