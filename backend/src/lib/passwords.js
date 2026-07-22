import bcrypt from "bcryptjs";
import { ApiError } from "./errors.js";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function assertStrongPassword(password, email) {
  const value = String(password || "");
  const localPart = normalizeEmail(email).split("@")[0];
  const reasons = [];
  if (value.length < 12 || value.length > 128) reasons.push("12–128 characters");
  if (!/[A-Z]/.test(value)) reasons.push("an uppercase letter");
  if (!/[a-z]/.test(value)) reasons.push("a lowercase letter");
  if (!/\d/.test(value)) reasons.push("a number");
  if (!/[^A-Za-z0-9\s]/.test(value)) reasons.push("a symbol");
  if (
    localPart.length >= 3 &&
    value.toLowerCase().includes(localPart.toLowerCase())
  ) {
    reasons.push("no email name");
  }
  if (reasons.length) {
    throw new ApiError(
      422,
      "WEAK_PASSWORD",
      `Password must include ${reasons.join(", ")}.`,
      [{ field: "password", reason: reasons.join(", ") }],
    );
  }
}

export function hashPassword(password, cost) {
  return bcrypt.hash(password, cost);
}

export function verifyPassword(password, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
}
