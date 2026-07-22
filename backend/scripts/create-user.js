import process from "node:process";
import { loadConfig } from "../src/config.js";
import { createPool, PostgresRepository } from "../src/db/postgres.js";
import { publicId } from "../src/lib/crypto.js";
import { assertStrongPassword, hashPassword, normalizeEmail } from "../src/lib/passwords.js";
import { emailSchema, nameSchema, parse } from "../src/lib/validation.js";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

function argumentsMap(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    if (!key || !argv[index + 1]) throw new Error(`Missing value for ${argv[index] || "argument"}`);
    result[key] = argv[index + 1];
  }
  return result;
}

const args = argumentsMap(process.argv.slice(2));
const email = parse(emailSchema, args.email, "INVALID_EMAIL");
const firstName = parse(nameSchema, args.first, "INVALID_FIRST_NAME");
const lastName = parse(nameSchema, args.last, "INVALID_LAST_NAME");
const role = args.role || "teacher";
if (!["student", "teacher", "teacher_admin"].includes(role)) {
  throw new Error("--role must be student, teacher or teacher_admin");
}
const password = process.env.LFA_USER_PASSWORD || "";
if (!password) throw new Error("Set LFA_USER_PASSWORD through a secure environment injection before running this command.");
assertStrongPassword(password, email);

const config = loadConfig();
const repository = new PostgresRepository(createPool(config));
try {
  const user = await repository.createUser({
    publicId: publicId(role),
    email: normalizeEmail(email),
    passwordHash: await hashPassword(password, config.bcryptCost),
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    role,
  });
  if (["teacher", "teacher_admin"].includes(role)) {
    const courses = String(args.courses || "SCH4U,ICS4U,SPH4U,MHF4U,MCV4U,BBB4M")
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean);
    await repository.setTeacherCourses(user.id, courses);
  }
  process.stdout.write(`Created ${user.role} ${user.email} (${user.publicId}).\n`);
} finally {
  await repository.close();
  delete process.env.LFA_USER_PASSWORD;
}
