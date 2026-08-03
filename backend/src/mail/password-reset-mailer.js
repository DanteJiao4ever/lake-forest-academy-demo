import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { google } from "googleapis";
import { ApiError } from "../lib/errors.js";

const gmailSendScope = "https://www.googleapis.com/auth/gmail.send";
const gmailMetadataScope =
  "https://www.googleapis.com/auth/gmail.metadata";

function base64url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function encodedHeader(value) {
  const text = String(value || "").replace(/[\r\n]/g, " ").trim();
  return `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetMessage({ fromEmail, fromName, to, displayName, resetUrl, expiresInMinutes }) {
  const boundary = `lfa-reset-${randomUUID()}`;
  const greetingName = String(displayName || "student").replace(/[\r\n]/g, " ").trim();
  const recipient = String(to || "").replace(/[\r\n]/g, "").trim();
  const subject = "Reset your Lake Forest Learning password";
  const text = [
    `Hello ${greetingName},`,
    "",
    "A request was made to reset your Lake Forest Learning password.",
    `Use this one-time link within ${expiresInMinutes} minutes:`,
    resetUrl,
    "",
    "If you did not request this change, you can ignore this message. Your current password remains unchanged.",
    "",
    "Lake Forest Academy",
  ].join("\r\n");
  const html = [
    `<p>Hello ${escapeHtml(greetingName)},</p>`,
    "<p>A request was made to reset your Lake Forest Learning password.</p>",
    `<p><a href="${escapeHtml(resetUrl)}">Reset password</a></p>`,
    `<p>This one-time link expires in ${expiresInMinutes} minutes.</p>`,
    "<p>If you did not request this change, you can ignore this message. Your current password remains unchanged.</p>",
    "<p>Lake Forest Academy</p>",
  ].join("");
  return [
    `From: ${encodedHeader(fromName)} <${fromEmail}>`,
    `To: ${recipient}`,
    `Subject: ${encodedHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

export class UnavailablePasswordResetMailer {
  constructor(reason = "Password reset email is not configured.") {
    this.reason = reason;
  }

  isConfigured() {
    return false;
  }

  async ready() {
    throw new ApiError(
      503,
      "PASSWORD_RESET_EMAIL_UNAVAILABLE",
      "Password reset email is temporarily unavailable.",
    );
  }

  async sendPasswordReset() {
    return this.ready();
  }
}

export class GmailPasswordResetMailer {
  constructor({ client, auth, fromEmail, fromName }) {
    this.client = client;
    this.auth = auth;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  isConfigured() {
    return true;
  }

  async ready() {
    try {
      await this.auth.getAccessToken();
      const profile = await this.client.users.getProfile({ userId: "me" });
      if (
        String(profile?.data?.emailAddress || "").toLowerCase() !==
        this.fromEmail.toLowerCase()
      ) {
        throw new Error("The delegated Gmail profile does not match the sender.");
      }
      return true;
    } catch {
      throw new ApiError(
        503,
        "PASSWORD_RESET_EMAIL_UNAVAILABLE",
        "Password reset email is temporarily unavailable.",
      );
    }
  }

  async sendPasswordReset(message) {
    const raw = base64url(
      resetMessage({
        ...message,
        fromEmail: this.fromEmail,
        fromName: this.fromName,
      }),
    );
    try {
      await this.client.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });
    } catch {
      throw new ApiError(
        503,
        "PASSWORD_RESET_EMAIL_UNAVAILABLE",
        "Password reset email is temporarily unavailable.",
      );
    }
  }
}

async function serviceAccountCredentials(config) {
  const encoded =
    config.gmailCredentialsBase64 || config.googleCredentialsBase64;
  const credentialPath =
    config.gmailCredentialsPath || config.googleCredentialsPath;
  if (encoded) {
    try {
      return JSON.parse(
        Buffer.from(encoded, "base64").toString("utf8"),
      );
    } catch {
      return null;
    }
  }
  if (credentialPath) {
    try {
      return JSON.parse(await readFile(credentialPath, "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

export async function createPasswordResetMailer(config) {
  if (config.passwordResetMailProvider !== "gmail_api") {
    return new UnavailablePasswordResetMailer();
  }
  const credentials = await serviceAccountCredentials(config);
  if (!credentials?.client_email || !credentials?.private_key) {
    return new UnavailablePasswordResetMailer(
      "Gmail API password reset delivery requires delegated service-account credentials.",
    );
  }
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    subject: config.gmailImpersonatedUser,
    scopes: [gmailSendScope, gmailMetadataScope],
  });
  return new GmailPasswordResetMailer({
    client: google.gmail({ version: "v1", auth }),
    auth,
    fromEmail: config.passwordResetFromEmail,
    fromName: config.passwordResetFromName,
  });
}
