import { emailSchema } from "../lib/validation.js";

const courseCodes = new Set([
  "SCH4U", "ICS4U", "SPH4U", "MHF4U", "MCV4U", "BBB4M",
]);

export class FacultyPreflightError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function invalidArguments() {
  return new FacultyPreflightError(
    "INVALID_ARGUMENTS",
    "Provide --email and an explicit nonempty --courses list of supported course codes.",
  );
}

export function parseFacultyPreflightArguments(argv) {
  const values = new Map();
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (
      !["--email", "--courses"].includes(key) || values.has(key) ||
      typeof args[index + 1] !== "string" || args[index + 1].startsWith("--")
    ) throw invalidArguments();
    values.set(key, args[index + 1]);
  }
  const email = emailSchema.safeParse(values.get("--email"));
  const requested = (values.get("--courses") || "")
    .split(",").map((code) => code.trim().toUpperCase());
  if (
    !email.success || !requested.length ||
    requested.some((code) => !courseCodes.has(code))
  ) throw invalidArguments();
  return { email: email.data, courses: [...new Set(requested)].sort() };
}

// Deliberately independent of web-service, Drive, Gmail and OAuth configuration.
export function facultyPreflightDatabaseConfig(env = process.env) {
  try {
    const databaseUrl = env.DATABASE_URL || "";
    const parsed = new URL(databaseUrl);
    if (
      !["postgres:", "postgresql:"].includes(parsed.protocol) ||
      !parsed.username || !parsed.pathname.replace(/^\/+/, "")
    ) throw new Error();
    const ssl = String(env.DATABASE_SSL || "").toLowerCase();
    if (ssl && !["true", "false", "1", "0", "yes", "no", "on", "off"].includes(ssl)) {
      throw new Error();
    }
    return {
      databaseUrl,
      databaseSocket: env.INSTANCE_UNIX_SOCKET || "",
      databaseSsl: ssl ? ["true", "1", "yes", "on"].includes(ssl) : env.NODE_ENV === "production",
      databasePoolMax: 1,
    };
  } catch {
    throw new FacultyPreflightError(
      "DATABASE_CONFIGURATION_REQUIRED",
      "Inject a valid DATABASE_URL and database connection settings; no OAuth or account password is required.",
    );
  }
}

function reportFor(email, requested, user, catalog) {
  const eligible = Boolean(user && user.status === "active" &&
    ["teacher", "teacher_admin"].includes(user.role));
  const assigned = catalog.filter((course) => course.assigned).map((course) => course.code);
  const effective = user?.role === "teacher_admin"
    ? catalog.filter((course) => course.status === "active").map((course) => course.code)
    : user?.role === "teacher" ? assigned : [];
  const missing = requested.filter((code) => !effective.includes(code));
  const unavailable = requested.filter((code) =>
    !catalog.some((course) => course.code === code && course.status === "active"));
  const accessReady = eligible && missing.length === 0 && unavailable.length === 0;
  return {
    email,
    account: user ? {
      publicId: user.public_id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      status: user.status,
    } : null,
    appAccountEligible: eligible,
    courseAccess: {
      mode: user?.role === "teacher_admin" ? "administrator_all_active_courses"
        : user?.role === "teacher" ? "assigned_courses" : "none",
      requestedCourseCodes: requested,
      assignedCourseCodes: assigned,
      effectiveCourseCodes: effective,
      missingCourseCodes: missing,
      unavailableCourseCodes: unavailable,
      additionalCourseCodes: effective.filter((code) => !requested.includes(code)),
      ready: accessReady,
    },
    workspaceIdentityBinding: !user ? "account_missing"
      : user.workspace_identity_bound ? "present" : "absent",
    appPreflightReady: accessReady,
    googleSignInVerified: false,
    notice: "Application data only. An absent binding is normal before first Workspace login; an existing binding does not prove the current Google account matches. Verify backend Workspace readiness and complete a real faculty sign-in separately.",
  };
}

export async function checkFacultyPreflight(pool, input) {
  // Revalidate callers as well as the CLI; all query inputs remain parameterized.
  const { email, courses } = parseFacultyPreflightArguments([
    "--email", input?.email, "--courses",
    Array.isArray(input?.courses) ? input.courses.join(",") : "",
  ]);
  let client;
  let transactionStarted = false;
  let destroyConnection = false;
  try {
    client = await pool.connect();
    const query = (text, values = []) => client.query({ text, values, query_timeout: 6_000 });
    await query("BEGIN READ ONLY");
    transactionStarted = true;
    await query("SET LOCAL statement_timeout = '5000ms'");
    await query("SET LOCAL lock_timeout = '1000ms'");
    const users = await query(
      `SELECT u.public_id, u.email::text AS email, u.display_name, u.role, u.status,
              EXISTS (
                SELECT 1 FROM workspace_identities wi
                 WHERE wi.user_id = u.id AND wi.provider = 'google_workspace'
              ) AS workspace_identity_bound
         FROM app_users u
        WHERE u.email = $1
        LIMIT 1`,
      [email],
    );
    const catalog = await query(
      `SELECT c.code, c.status,
              EXISTS (
                SELECT 1 FROM teacher_course_access access
                JOIN app_users u ON u.id = access.teacher_user_id
                 WHERE u.email = $1 AND access.course_code = c.code
              ) AS assigned
         FROM courses c
        ORDER BY c.code`,
      [email],
    );
    const report = reportFor(email, courses, users.rows[0], catalog.rows);
    await query("ROLLBACK");
    transactionStarted = false;
    return report;
  } catch {
    // A client-side timeout may precede the server response; discard the
    // connection after any failed check even when cleanup succeeds.
    destroyConnection = true;
    if (client && transactionStarted) {
      try {
        await client.query({ text: "ROLLBACK", values: [], query_timeout: 6_000 });
      } catch {
        destroyConnection = true;
      }
    }
    throw new FacultyPreflightError(
      "PREFLIGHT_UNAVAILABLE",
      "The read-only faculty check could not complete. Verify database connectivity, migrations and SELECT permissions without printing credentials.",
    );
  } finally {
    client?.release(destroyConnection);
  }
}
