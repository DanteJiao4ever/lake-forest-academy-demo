import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export function opaqueToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function stableFingerprint(value) {
  return sha256(JSON.stringify(value));
}

export function safeHashEqual(expectedHex, rawValue) {
  if (!expectedHex || !rawValue) return false;
  const actual = Buffer.from(sha256(rawValue), "hex");
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function csrfTokenFor(sessionId, secret) {
  return createHmac("sha256", secret).update(sessionId).digest("base64url");
}

export function safeTextEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function publicId(role) {
  const prefix = role === "student" ? "stu" : "usr";
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}
