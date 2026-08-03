import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, test } from "node:test";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { sha256 } from "../src/lib/crypto.js";
import {
  GmailPasswordResetMailer,
  UnavailablePasswordResetMailer,
} from "../src/mail/password-reset-mailer.js";
import { FakeDrive, FakeRepository, FakeScanner } from "./fakes.js";

const origin = "http://127.0.0.1:5173";

function cookieFrom(response) {
  return String(response.headers["set-cookie"]).split(";")[0];
}

class FakePasswordResetMailer {
  constructor({ fail = false } = {}) {
    this.fail = fail;
    this.messages = [];
  }

  isConfigured() {
    return true;
  }

  async ready() {
    return true;
  }

  async sendPasswordReset(message) {
    this.messages.push(message);
    if (this.fail) throw new Error("simulated delivery failure");
  }
}

describe("password recovery and password change", () => {
  let app;
  let repository;
  let mailer;
  let config;

  beforeEach(async () => {
    config = loadConfig({
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test.invalid/lfa",
      ALLOWED_ORIGINS: origin,
      COOKIE_SECURE: "false",
      BCRYPT_COST: "10",
      CLAMAV_REQUIRED: "false",
      PASSWORD_RESET_URL:
        "https://lakeforestacademy.ca/learning/#/reset-password",
    });
    repository = new FakeRepository();
    mailer = new FakePasswordResetMailer();
    app = await createApp({
      config,
      repository,
      drive: new FakeDrive(),
      scanner: new FakeScanner(),
      passwordResetMailer: mailer,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  async function register(email = "avery.recovery@example.invalid") {
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      headers: { origin },
      payload: {
        firstName: "Avery",
        lastName: "Chen",
        email,
        password: "StrongPass2026!",
        confirmPassword: "StrongPass2026!",
      },
    });
    assert.equal(response.statusCode, 201, response.body);
    return {
      body: response.json(),
      cookie: cookieFrom(response),
      user: repository.users.at(-1),
    };
  }

  test("returns the same accepted response for known and unknown email addresses", async () => {
    const readiness = await app.inject({
      method: "GET",
      url: "/health/password-reset-ready",
    });
    assert.equal(readiness.statusCode, 200, readiness.body);
    const account = await register();
    const known = await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: account.user.email },
    });
    const unknown = await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: "nobody@example.invalid" },
    });

    assert.equal(known.statusCode, 202, known.body);
    assert.equal(unknown.statusCode, 202, unknown.body);
    assert.deepEqual(known.json(), unknown.json());
    assert.equal(mailer.messages.length, 1);
    assert.equal(mailer.messages[0].to, account.user.email);
    assert.match(mailer.messages[0].resetUrl, /#\/reset-password\?token=/);

    const cooledDown = await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: account.user.email },
    });
    assert.equal(cooledDown.statusCode, 202, cooledDown.body);
    assert.deepEqual(cooledDown.json(), known.json());
    assert.equal(mailer.messages.length, 1);
  });

  test("stores only a digest, consumes the token once and revokes every old session", async () => {
    const account = await register();
    const secondLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: {
        email: account.user.email,
        password: "StrongPass2026!",
        portal: "student",
      },
    });
    assert.equal(secondLogin.statusCode, 200, secondLogin.body);
    const secondCookie = cookieFrom(secondLogin);

    const request = await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: account.user.email },
    });
    assert.equal(request.statusCode, 202, request.body);
    const resetUrl = new URL(mailer.messages[0].resetUrl);
    const rawToken = new URLSearchParams(resetUrl.hash.split("?")[1]).get(
      "token",
    );
    assert.ok(rawToken);
    assert.equal(repository.passwordResetTokens.length, 1);
    assert.equal(repository.passwordResetTokens[0].tokenHash, sha256(rawToken));
    assert.notEqual(repository.passwordResetTokens[0].tokenHash, rawToken);

    const reset = await app.inject({
      method: "POST",
      url: "/v1/auth/password-resets",
      headers: { origin },
      payload: {
        token: rawToken,
        newPassword: "NewSecurePass2027!",
        confirmPassword: "NewSecurePass2027!",
      },
    });
    assert.equal(reset.statusCode, 200, reset.body);
    assert.deepEqual(reset.json(), {
      changed: true,
      reauthenticationRequired: true,
    });
    assert.equal(repository.sessions.size, 0);

    for (const cookie of [account.cookie, secondCookie]) {
      const session = await app.inject({
        method: "GET",
        url: "/v1/auth/session",
        headers: { origin, cookie },
      });
      assert.equal(session.statusCode, 401, session.body);
    }

    const replay = await app.inject({
      method: "POST",
      url: "/v1/auth/password-resets",
      headers: { origin },
      payload: {
        token: rawToken,
        newPassword: "AnotherSecure2028!",
        confirmPassword: "AnotherSecure2028!",
      },
    });
    assert.equal(replay.statusCode, 400, replay.body);
    assert.equal(replay.json().error.code, "PASSWORD_RESET_TOKEN_INVALID");

    const oldLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: {
        email: account.user.email,
        password: "StrongPass2026!",
        portal: "student",
      },
    });
    assert.equal(oldLogin.statusCode, 401, oldLogin.body);
    const newLogin = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      headers: { origin },
      payload: {
        email: account.user.email,
        password: "NewSecurePass2027!",
        portal: "student",
      },
    });
    assert.equal(newLogin.statusCode, 200, newLogin.body);
  });

  test("requires the current password and revokes the active session after a change", async () => {
    const account = await register("change.password@example.invalid");
    const headers = {
      origin,
      cookie: account.cookie,
      "x-csrf-token": account.body.csrfToken,
    };
    const denied = await app.inject({
      method: "POST",
      url: "/v1/auth/password-change",
      headers,
      payload: {
        currentPassword: "NotThePassword2026!",
        newPassword: "ChangedSecure2027!",
        confirmPassword: "ChangedSecure2027!",
      },
    });
    assert.equal(denied.statusCode, 401, denied.body);
    assert.equal(denied.json().error.code, "CURRENT_PASSWORD_INCORRECT");

    const changed = await app.inject({
      method: "POST",
      url: "/v1/auth/password-change",
      headers,
      payload: {
        currentPassword: "StrongPass2026!",
        newPassword: "ChangedSecure2027!",
        confirmPassword: "ChangedSecure2027!",
      },
    });
    assert.equal(changed.statusCode, 200, changed.body);
    assert.equal(repository.sessions.size, 0);
  });

  test("rejects an expired reset token without changing the password", async () => {
    const account = await register("expired.reset@example.invalid");
    await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: account.user.email },
    });
    const rawToken = new URLSearchParams(
      new URL(mailer.messages[0].resetUrl).hash.split("?")[1],
    ).get("token");
    repository.passwordResetTokens[0].expiresAt = new Date(
      Date.now() - 1_000,
    ).toISOString();
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/password-resets",
      headers: { origin },
      payload: {
        token: rawToken,
        newPassword: "ExpiredToken2027!",
        confirmPassword: "ExpiredToken2027!",
      },
    });
    assert.equal(response.statusCode, 400, response.body);
    assert.equal(response.json().error.code, "PASSWORD_RESET_TOKEN_INVALID");
  });

  test("fails closed for every address when email delivery is not configured", async () => {
    await app.close();
    app = await createApp({
      config,
      repository,
      drive: new FakeDrive(),
      scanner: new FakeScanner(),
      passwordResetMailer: new UnavailablePasswordResetMailer(),
    });
    const account = await register("closed@example.invalid");
    for (const email of [account.user.email, "unknown@example.invalid"]) {
      const response = await app.inject({
        method: "POST",
        url: "/v1/auth/password-reset-requests",
        headers: { origin },
        payload: { email },
      });
      assert.equal(response.statusCode, 503, response.body);
      assert.equal(
        response.json().error.code,
        "PASSWORD_RESET_EMAIL_UNAVAILABLE",
      );
    }
    const readiness = await app.inject({
      method: "GET",
      url: "/health/password-reset-ready",
    });
    assert.equal(readiness.statusCode, 503, readiness.body);
  });

  test("revokes an undelivered reset token while retaining a uniform accepted response", async () => {
    await app.close();
    mailer = new FakePasswordResetMailer({ fail: true });
    app = await createApp({
      config,
      repository,
      drive: new FakeDrive(),
      scanner: new FakeScanner(),
      passwordResetMailer: mailer,
    });
    const account = await register("mail.failure@example.invalid");
    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/password-reset-requests",
      headers: { origin },
      payload: { email: account.user.email },
    });
    assert.equal(response.statusCode, 202, response.body);
    assert.equal(repository.passwordResetTokens.at(-1).consumedAt !== null, true);
  });

  test("keeps the schema expand-only with least-privilege password update access", async () => {
    const migration = await readFile(
      new URL("../migrations/007_password_recovery_v1.sql", import.meta.url),
      "utf8",
    );
    assert.match(migration, /CREATE TABLE password_reset_tokens/);
    assert.match(migration, /token_hash char\(64\) NOT NULL UNIQUE/);
    assert.match(migration, /token_hash ~ '\^\[0-9a-f\]\{64\}\$'/);
    assert.match(
      migration,
      /GRANT SELECT, INSERT, UPDATE ON TABLE password_reset_tokens TO lfa_app_runtime/,
    );
    assert.match(
      migration,
      /GRANT UPDATE \(password_hash, updated_at\) ON TABLE app_users TO lfa_app_runtime/,
    );
    assert.doesNotMatch(migration, /ALTER TABLE app_users/);
  });
});

test("Gmail delivery emits a multipart reset link without any password", async () => {
  let sent;
  let profileRequest;
  const mailer = new GmailPasswordResetMailer({
    auth: { async getAccessToken() { return "test-token"; } },
    client: {
      users: {
        async getProfile(request) {
          profileRequest = request;
          return {
            data: { emailAddress: "no-reply@lakeforestacademy.ca" },
          };
        },
        messages: {
          async send(message) { sent = message; },
        },
      },
    },
    fromEmail: "no-reply@lakeforestacademy.ca",
    fromName: "Lake Forest Academy",
  });
  assert.equal(await mailer.ready(), true);
  assert.deepEqual(profileRequest, { userId: "me" });
  await mailer.sendPasswordReset({
    to: "student@example.invalid",
    displayName: "Avery Chen",
    resetUrl:
      "https://lakeforestacademy.ca/learning/#/reset-password?token=one-time-token",
    expiresInMinutes: 30,
  });
  assert.equal(sent.userId, "me");
  const mime = Buffer.from(sent.requestBody.raw, "base64url").toString("utf8");
  assert.match(mime, /To: student@example\.invalid/);
  assert.match(mime, /one-time-token/);
  assert.match(mime, /expires in 30 minutes/);
  assert.doesNotMatch(mime, /password\s*:/i);
});

test("Gmail readiness fails closed when the delegated mailbox differs from the sender", async () => {
  const mailer = new GmailPasswordResetMailer({
    auth: { async getAccessToken() { return "test-token"; } },
    client: {
      users: {
        async getProfile() {
          return { data: { emailAddress: "other@lakeforestacademy.ca" } };
        },
      },
    },
    fromEmail: "no-reply@lakeforestacademy.ca",
    fromName: "Lake Forest Academy",
  });

  await assert.rejects(
    mailer.ready(),
    (error) => error?.code === "PASSWORD_RESET_EMAIL_UNAVAILABLE",
  );
});

test("Gmail configuration requires the sender and delegated mailbox to match", () => {
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://test.invalid/lfa",
        ALLOWED_ORIGINS: origin,
        COOKIE_SECURE: "false",
        BCRYPT_COST: "10",
        CLAMAV_REQUIRED: "false",
        PASSWORD_RESET_MAIL_PROVIDER: "gmail_api",
        PASSWORD_RESET_FROM_EMAIL: "no-reply@lakeforestacademy.ca",
        GMAIL_IMPERSONATED_USER: "other@lakeforestacademy.ca",
      }),
    /must match GMAIL_IMPERSONATED_USER/,
  );
});
