import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\p{M}][\p{L}\p{M} .'’\-]*$/u);
export const courseCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9][A-Z0-9_-]{1,23}$/);
export const assignmentIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const uuidSchema = z.string().uuid();

export function parse(schema, value, code = "INVALID_REQUEST") {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const error = new Error("The request contains invalid fields.");
  error.statusCode = 422;
  error.code = code;
  error.details = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    reason: issue.message,
  }));
  throw error;
}
