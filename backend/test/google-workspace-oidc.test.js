import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, test } from "node:test";
import { createApp } from "../src/app.js";
import { GoogleWorkspaceOidc } from "../src/auth/google-workspace-oidc.js";
import { loadConfig } from "../src/config.js";
import { deriveOpaqueToken, sha256 } from "../src/lib/crypto.js";
import { FakeDrive, FakeRepository, FakeScanner } from "./fakes.js";

const origin = "http://127.0.0.1:5173";
const callbackUrl =
  "http://127.0.0.1:8787/v1/auth/google-workspace/callback";
const transactionSecret = "workspace-oauth-test-secret-at-least-32-bytes";

function configuredConfig(overrides = {}) {
  return loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test.invalid/lfa",
    ALLOWED_ORIGINS: origin,
    COOKIE_SECURE: "false",
    BCRYPT_COST: "10",
    CLAMAV_REQUIRED: "false",
    GOOGLE_WORKSPACE_OAUTH_PROVIDER: "google",
    GOOGLE_WORKSPACE_OAUTH_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
    GOOGLE_WORKSPACE_OAUTH_CLIENT_SECRET: "test-client-secret",
    GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET: transactionSecret,
    GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI: callbackUrl,
    GOOGLE_WORKSPACE_FRONTEND_URL: `${origin}/learning/`,
    GOOGLE_WORKSPACE_HOSTED_DOMAIN: "lakeforestacademy.ca",
    ...overrides,
  });
}

function responseCookies(response) {
  const value = response.headers["set-cookie"];
  return Array.isArray(value) ? value : value ? [value] : [];
}

function cookiePair(response, name) {
  const value = responseCookies(response).find((item) =>
    String(item).startsWith(`${name}=`),
  );
  return value ? String(value).split(";", 1)[0] : "";
}

class FakeWorkspaceOidc {
  constructor() {
    this.authorizationRequests = [];
    this.exchangeRequests = [];
    this.identity = {
      issuer: "https://accounts.google.com",
      subject: "workspace-subject-1",
      email: "faculty@lakeforestacademy.ca",
      hostedDomain: "lakeforestacademy.ca",
    };
    this.exchangeError = null;
  }

  async ready() {
    return true;
  }

  authorizationUrl(input) {
    this.authorizationRequests.push(input);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("state", input.state);
    url.searchParams.set("nonce", input.nonce);
    url.searchParams.set("code_challenge", input.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }

  async exchangeAndVerify(input) {
    this.exchangeRequests.push(input);
    if (this.exchangeError) throw this.exchangeError;
    return { ...this.identity };
  }
}

describe("Google Workspace faculty sign-in routes", () => {
  let app;
  let repository;
  let provider;
  let config;

  beforeEach(async () => {
    config = configuredConfig();
    repository = new FakeRepository();
    provider = new FakeWorkspaceOidc();
    app = await createApp({
      config,
      repository,
      drive: new FakeDrive(),
      scanner: new FakeScanner(),
      googleWorkspaceOidc: provider,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  async function addFaculty({
    email = "faculty@lakeforestacademy.ca",
    role = "teacher",
    status = "active",
  } = {}) {
    const user = await repository.createUser({
      publicId: `workspace-${role}-${repository.users.length}`,
      email,
      passwordHash: "test-only-password-hash",
      firstName: "Daniel",
      lastName: "Brooks",
      displayName: "Daniel Brooks",
      role,
    });
    user.status = status;
    return user;
  }

  async function start(returnTo = "teacher/dashboard") {
    return app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/start?portal=faculty&returnTo=${encodeURIComponent(returnTo)}`,
      headers: { origin },
    });
  }

  test("keeps the Workspace readiness gate independent", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health/workspace-auth-ready",
      headers: { origin },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json(), { status: "ready" });
  });

  test("starts a browser-bound state, nonce and PKCE flow without storing raw derivation material", async () => {
    const response = await start();
    assert.equal(response.statusCode, 303, response.body);
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal(response.headers.pragma, "no-cache");
    const authorizationUrl = new URL(response.headers.location);
    const state = authorizationUrl.searchParams.get("state");
    const nonce = authorizationUrl.searchParams.get("nonce");
    const challenge = authorizationUrl.searchParams.get("code_challenge");
    assert.ok(state);
    assert.equal(
      nonce,
      deriveOpaqueToken(
        transactionSecret,
        "workspace-oauth-nonce",
        state,
      ),
    );
    const verifier = deriveOpaqueToken(
      transactionSecret,
      "workspace-oauth-pkce",
      state,
    );
    const expectedChallenge = Buffer.from(
      await crypto.subtle.digest("SHA-256", Buffer.from(verifier)),
    ).toString("base64url");
    assert.equal(challenge, expectedChallenge);
    assert.equal(
      authorizationUrl.searchParams.get("code_challenge_method"),
      "S256",
    );
    const browserCookie = cookiePair(response, config.workspaceOAuthCookieName);
    assert.ok(browserCookie);
    assert.match(
      responseCookies(response).join("\n"),
      /HttpOnly/i,
    );
    assert.match(responseCookies(response).join("\n"), /SameSite=Lax/i);
    assert.equal(repository.workspaceOAuthTransactions.length, 1);
    const stored = repository.workspaceOAuthTransactions[0];
    assert.equal(stored.stateHash, sha256(state));
    assert.notEqual(stored.stateHash, state);
    assert.equal(stored.returnRoute, "teacher/dashboard");
    assert.equal(Object.hasOwn(stored, "nonce"), false);
    assert.equal(Object.hasOwn(stored, "nonceHash"), false);
    assert.equal(Object.hasOwn(stored, "codeVerifier"), false);
    const rawBrowserSecret = browserCookie.split("=", 2)[1];
    assert.equal(stored.browserSecretHash, sha256(rawBrowserSecret));
    assert.notEqual(stored.browserSecretHash, rawBrowserSecret);
  });

  test("binds only a pre-provisioned faculty account and issues the normal session", async () => {
    const faculty = await addFaculty();
    const started = await start();
    const location = new URL(started.headers.location);
    const state = location.searchParams.get("state");
    const browserCookie = cookiePair(
      started,
      config.workspaceOAuthCookieName,
    );
    const callback = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${encodeURIComponent(state)}&code=one-time-code`,
      headers: {
        cookie: browserCookie,
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(callback.statusCode, 303, callback.body);
    assert.equal(callback.headers["cache-control"], "no-store");
    const returned = new URL(callback.headers.location);
    assert.equal(
      returned.hash,
      "#/teacher/dashboard?workspace=connected",
    );
    assert.equal(repository.workspaceIdentities.length, 1);
    assert.equal(repository.workspaceIdentities[0].userId, faculty.id);
    assert.equal(repository.workspaceIdentities[0].subject, "workspace-subject-1");
    assert.equal(provider.exchangeRequests.length, 1);
    assert.equal(provider.exchangeRequests[0].code, "one-time-code");
    assert.equal(
      provider.exchangeRequests[0].codeVerifier,
      deriveOpaqueToken(
        transactionSecret,
        "workspace-oauth-pkce",
        state,
      ),
    );
    const nonce = deriveOpaqueToken(
      transactionSecret,
      "workspace-oauth-nonce",
      state,
    );
    assert.equal(provider.exchangeRequests[0].expectedNonceHash, sha256(nonce));
    const sessionCookie = cookiePair(callback, config.cookieName);
    assert.ok(sessionCookie);
    const session = await app.inject({
      method: "GET",
      url: "/v1/auth/session",
      headers: { origin, cookie: sessionCookie },
    });
    assert.equal(session.statusCode, 200, session.body);
    assert.equal(session.json().user.id, faculty.publicId);
    assert.equal(session.json().user.displayName, "Daniel Brooks");
    assert.ok(session.json().csrfToken);

    const replay = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${encodeURIComponent(state)}&code=replayed-code`,
      headers: {
        cookie: browserCookie,
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(replay.statusCode, 303, replay.body);
    assert.equal(new URL(replay.headers.location).hash, "#/signin/faculty?workspace=expired");
    assert.equal(provider.exchangeRequests.length, 1);
  });

  test("rejects mismatched browser binding and expired transactions before token exchange", async () => {
    const mismatched = await start();
    const mismatchedState = new URL(mismatched.headers.location).searchParams.get(
      "state",
    );
    const mismatchedCallback = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${encodeURIComponent(mismatchedState)}&code=test-code`,
      headers: {
        cookie: `${config.workspaceOAuthCookieName}=wrong-browser-secret`,
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(mismatchedCallback.statusCode, 303, mismatchedCallback.body);
    assert.equal(
      new URL(mismatchedCallback.headers.location).hash,
      "#/signin/faculty?workspace=expired",
    );

    const expired = await start();
    const expiredState = new URL(expired.headers.location).searchParams.get(
      "state",
    );
    repository.workspaceOAuthTransactions.at(-1).expiresAt = new Date(
      Date.now() - 1_000,
    ).toISOString();
    const expiredCallback = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${encodeURIComponent(expiredState)}&code=test-code`,
      headers: {
        cookie: cookiePair(expired, config.workspaceOAuthCookieName),
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(expiredCallback.statusCode, 303, expiredCallback.body);
    assert.equal(
      new URL(expiredCallback.headers.location).hash,
      "#/signin/faculty?workspace=expired",
    );
    assert.equal(provider.exchangeRequests.length, 0);
    assert.equal(repository.sessions.size, 0);
  });

  test("denies students, unknown accounts and a second subject without creating or promoting users", async () => {
    const student = await addFaculty({ role: "student" });
    const run = async () => {
      const started = await start();
      const authUrl = new URL(started.headers.location);
      return app.inject({
        method: "GET",
        url: `/v1/auth/google-workspace/callback?state=${authUrl.searchParams.get("state")}&code=test-code`,
        headers: {
          cookie: cookiePair(started, config.workspaceOAuthCookieName),
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "navigate",
          "sec-fetch-dest": "document",
        },
      });
    };
    const deniedStudent = await run();
    assert.equal(
      new URL(deniedStudent.headers.location).hash,
      "#/signin/faculty?workspace=not-authorized",
    );
    assert.equal(student.role, "student");
    assert.equal(repository.workspaceIdentities.length, 0);
    assert.equal(repository.sessions.size, 0);

    repository.users = [];
    const deniedUnknown = await run();
    assert.equal(
      new URL(deniedUnknown.headers.location).hash,
      "#/signin/faculty?workspace=not-authorized",
    );
    assert.equal(repository.users.length, 0);

    await addFaculty();
    const first = await run();
    assert.equal(
      new URL(first.headers.location).hash,
      "#/teacher/dashboard?workspace=connected",
    );
    provider.identity.subject = "workspace-subject-2";
    const changedSubject = await run();
    assert.equal(
      new URL(changedSubject.headers.location).hash,
      "#/signin/faculty?workspace=not-authorized",
    );
    assert.equal(repository.workspaceIdentities.length, 1);
  });

  test("denies a previously bound faculty identity after the local account is disabled", async () => {
    const faculty = await addFaculty();
    const authenticate = async () => {
      const started = await start();
      const state = new URL(started.headers.location).searchParams.get("state");
      return app.inject({
        method: "GET",
        url: `/v1/auth/google-workspace/callback?state=${encodeURIComponent(state)}&code=test-code`,
        headers: {
          cookie: cookiePair(started, config.workspaceOAuthCookieName),
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "navigate",
          "sec-fetch-dest": "document",
        },
      });
    };

    const initial = await authenticate();
    assert.equal(
      new URL(initial.headers.location).hash,
      "#/teacher/dashboard?workspace=connected",
    );
    assert.equal(repository.workspaceIdentities.length, 1);
    const issuedSessionCount = repository.sessions.size;

    faculty.status = "disabled";
    const disabled = await authenticate();
    assert.equal(disabled.statusCode, 303, disabled.body);
    assert.equal(
      new URL(disabled.headers.location).hash,
      "#/signin/faculty?workspace=not-authorized",
    );
    assert.equal(repository.workspaceIdentities.length, 1);
    assert.equal(repository.sessions.size, issuedSessionCount);
  });

  test("maps provider cancellation safely and rejects open redirects", async () => {
    const openRedirect = await start("https://evil.example/steal");
    assert.equal(openRedirect.statusCode, 422, openRedirect.body);
    assert.equal(repository.workspaceOAuthTransactions.length, 0);

    const started = await start();
    const state = new URL(started.headers.location).searchParams.get("state");
    const callback = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${state}&error=access_denied&error_description=do-not-reflect`,
      headers: {
        cookie: cookiePair(started, config.workspaceOAuthCookieName),
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(callback.statusCode, 303, callback.body);
    assert.equal(
      new URL(callback.headers.location).hash,
      "#/signin/faculty?workspace=cancelled",
    );
    assert.doesNotMatch(callback.headers.location, /do-not-reflect/);
    assert.equal(provider.exchangeRequests.length, 0);
  });

  test("allows only the exact cross-site callback as a top-level navigation", async () => {
    const blocked = await app.inject({
      method: "GET",
      url: "/health/ready",
      headers: { "sec-fetch-site": "cross-site" },
    });
    assert.equal(blocked.statusCode, 403, blocked.body);
    assert.equal(blocked.json().error.code, "CROSS_SITE_REQUEST_BLOCKED");

    const wrongMode = await app.inject({
      method: "GET",
      url: "/v1/auth/google-workspace/callback?state=abcdefghijklmnopqrstuvwxyzABCDEFG&code=x",
      headers: {
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
      },
    });
    assert.equal(wrongMode.statusCode, 403, wrongMode.body);
    assert.equal(wrongMode.json().error.code, "CROSS_SITE_REQUEST_BLOCKED");
  });

  test("returns browser navigation to the faculty portal when OAuth storage is unavailable", async () => {
    repository.createWorkspaceOAuthTransaction = async () => {
      throw new Error("simulated start storage outage");
    };
    const unavailableStart = await start();
    assert.equal(unavailableStart.statusCode, 303, unavailableStart.body);
    assert.equal(
      new URL(unavailableStart.headers.location).hash,
      "#/signin/faculty?workspace=unavailable",
    );

    repository.createWorkspaceOAuthTransaction =
      FakeRepository.prototype.createWorkspaceOAuthTransaction.bind(repository);
    const started = await start();
    const authUrl = new URL(started.headers.location);
    repository.consumeWorkspaceOAuthTransaction = async () => {
      throw new Error("simulated callback storage outage");
    };
    repository.recordAudit = async () => {
      throw new Error("simulated audit outage");
    };
    const unavailableCallback = await app.inject({
      method: "GET",
      url: `/v1/auth/google-workspace/callback?state=${authUrl.searchParams.get("state")}&code=test-code`,
      headers: {
        cookie: cookiePair(started, config.workspaceOAuthCookieName),
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      },
    });
    assert.equal(
      unavailableCallback.statusCode,
      303,
      unavailableCallback.body,
    );
    assert.equal(
      new URL(unavailableCallback.headers.location).hash,
      "#/signin/faculty?workspace=unavailable",
    );
  });
});

test("Workspace readiness and start stay closed when the provider is disabled", async () => {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test.invalid/lfa",
    ALLOWED_ORIGINS: origin,
    COOKIE_SECURE: "false",
    BCRYPT_COST: "10",
    CLAMAV_REQUIRED: "false",
  });
  const repository = new FakeRepository();
  const app = await createApp({
    config,
    repository,
    drive: new FakeDrive(),
    scanner: new FakeScanner(),
  });
  try {
    const readiness = await app.inject({
      method: "GET",
      url: "/health/workspace-auth-ready",
      headers: { origin },
    });
    assert.equal(readiness.statusCode, 503, readiness.body);
    assert.equal(readiness.json().error.code, "WORKSPACE_AUTH_UNAVAILABLE");
    const start = await app.inject({
      method: "GET",
      url: "/v1/auth/google-workspace/start?portal=faculty&returnTo=teacher/dashboard",
      headers: { origin },
    });
    assert.equal(start.statusCode, 303, start.body);
    assert.equal(
      new URL(start.headers.location).hash,
      "#/signin/faculty?workspace=unavailable",
    );
    assert.equal(repository.workspaceOAuthTransactions.length, 0);
  } finally {
    await app.close();
  }
});

test("Google OIDC validates the complete Workspace claim contract", async () => {
  const nonce = "test-nonce";
  const validPayload = {
    iss: "https://accounts.google.com",
    aud: "client-id",
    azp: "client-id",
    exp: Math.floor(Date.now() / 1000) + 300,
    email_verified: true,
    hd: "lakeforestacademy.ca",
    sub: "stable-google-subject",
    email: "Faculty@LakeForestAcademy.ca",
    nonce,
  };
  let payload = { ...validPayload };
  let authorizationOptions;
  const client = {
    generateAuthUrl(options) {
      authorizationOptions = options;
      return "https://accounts.google.com/o/oauth2/v2/auth";
    },
    async getToken() {
      return { tokens: { id_token: "signed-id-token" } };
    },
    async verifyIdToken() {
      return { getPayload: () => payload };
    },
  };
  const provider = new GoogleWorkspaceOidc({
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri: callbackUrl,
    hostedDomain: "lakeforestacademy.ca",
    client,
  });
  provider.authorizationUrl({
    state: "state",
    nonce,
    codeChallenge: "challenge",
  });
  assert.deepEqual(authorizationOptions.scope, ["openid", "email"]);
  assert.equal(authorizationOptions.access_type, "online");
  assert.equal(authorizationOptions.hd, "lakeforestacademy.ca");
  assert.equal(authorizationOptions.code_challenge_method, "S256");
  assert.equal(Object.hasOwn(authorizationOptions, "access_type"), true);
  assert.equal(Object.hasOwn(authorizationOptions, "refresh_token"), false);

  const identity = await provider.exchangeAndVerify({
    code: "one-time-code",
    codeVerifier: "verifier",
    expectedNonceHash: sha256(nonce),
  });
  assert.deepEqual(identity, {
    issuer: "https://accounts.google.com",
    subject: "stable-google-subject",
    email: "faculty@lakeforestacademy.ca",
    hostedDomain: "lakeforestacademy.ca",
  });

  const invalidClaims = [
    { iss: "https://evil.example" },
    { aud: "other-client" },
    { azp: "other-client" },
    { exp: Math.floor(Date.now() / 1000) - 1 },
    { email_verified: false },
    { hd: "other.example" },
    { sub: "" },
    { email: "" },
    { nonce: "different" },
  ];
  for (const change of invalidClaims) {
    payload = { ...validPayload, ...change };
    await assert.rejects(
      provider.exchangeAndVerify({
        code: "one-time-code",
        codeVerifier: "verifier",
        expectedNonceHash: sha256(nonce),
      }),
      (error) =>
        error?.code === "WORKSPACE_AUTHENTICATION_FAILED" &&
        !error?.cause,
    );
  }
});

test("Google OIDC converts upstream outages into a generic unavailable error", async () => {
  const provider = new GoogleWorkspaceOidc({
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri: callbackUrl,
    hostedDomain: "lakeforestacademy.ca",
    client: {
      generateAuthUrl() { return "https://accounts.google.com"; },
      async getToken() {
        const error = new Error("request contained client_secret=leaked-secret");
        error.code = "ETIMEDOUT";
        error.response = { data: { id_token: "leaked-token" } };
        throw error;
      },
      async verifyIdToken() { throw new Error("unreachable"); },
    },
  });
  await assert.rejects(
    provider.exchangeAndVerify({
      code: "code",
      codeVerifier: "verifier",
      expectedNonceHash: sha256("nonce"),
    }),
    (error) =>
      error?.statusCode === 503 &&
      error?.code === "WORKSPACE_AUTH_UNAVAILABLE" &&
      error.message === "Google Workspace sign-in is temporarily unavailable." &&
      !error.cause &&
      !JSON.stringify(error).includes("leaked"),
  );
});

test("Google OIDC treats a sanitized provider 4xx response as denied", async () => {
  const provider = new GoogleWorkspaceOidc({
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri: callbackUrl,
    hostedDomain: "lakeforestacademy.ca",
    client: {
      generateAuthUrl() { return "https://accounts.google.com"; },
      async getToken() {
        const error = new Error("invalid_grant with client_secret=leaked-secret");
        error.response = {
          status: 400,
          data: { id_token: "leaked-token" },
        };
        throw error;
      },
      async verifyIdToken() { throw new Error("unreachable"); },
    },
  });
  await assert.rejects(
    provider.exchangeAndVerify({
      code: "code",
      codeVerifier: "verifier",
      expectedNonceHash: sha256("nonce"),
    }),
    (error) =>
      error?.statusCode === 401 &&
      error?.code === "WORKSPACE_AUTHENTICATION_FAILED" &&
      error.message === "Google Workspace could not verify this faculty account." &&
      !error.cause &&
      !JSON.stringify(error).includes("leaked"),
  );
});

test("Google OIDC treats an unclassified verification exception as denied", async () => {
  const provider = new GoogleWorkspaceOidc({
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri: callbackUrl,
    hostedDomain: "lakeforestacademy.ca",
    client: {
      generateAuthUrl() { return "https://accounts.google.com"; },
      async getToken() {
        return { tokens: { id_token: "signed-but-invalid-id-token" } };
      },
      async verifyIdToken() {
        throw new Error("signature verification detail must not escape");
      },
    },
  });
  await assert.rejects(
    provider.exchangeAndVerify({
      code: "code",
      codeVerifier: "verifier",
      expectedNonceHash: sha256("nonce"),
    }),
    (error) =>
      error?.statusCode === 401 &&
      error?.code === "WORKSPACE_AUTHENTICATION_FAILED" &&
      !error.cause &&
      !JSON.stringify(error).includes("signature verification detail"),
  );
});

test("Workspace migration stores only digests and grants narrow identity updates", async () => {
  const migration = await readFile(
    new URL("../migrations/011_workspace_oauth_v1.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /CREATE TABLE workspace_oauth_transactions/);
  assert.match(migration, /state_hash char\(64\) NOT NULL UNIQUE/);
  assert.match(migration, /browser_secret_hash char\(64\) NOT NULL UNIQUE/);
  assert.doesNotMatch(migration, /code_verifier|refresh_token|access_token|id_token/);
  assert.match(
    migration,
    /UNIQUE \(provider, issuer, subject\)/,
  );
  assert.match(migration, /UNIQUE \(provider, user_id\)/);
  assert.match(
    migration,
    /GRANT UPDATE \(last_verified_email, last_authenticated_at\)/,
  );
  assert.match(migration, /GRANT UPDATE \(consumed_at\)/);
  assert.match(migration, /CREATE TRIGGER workspace_identities_prevent_rebinding/);
  assert.doesNotMatch(
    migration,
    /GRANT SELECT, INSERT, UPDATE\s+ON TABLE workspace_identities/,
  );
});

test("Workspace OAuth configuration fails closed when disabled or incomplete", () => {
  const disabled = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test.invalid/lfa",
    ALLOWED_ORIGINS: origin,
    COOKIE_SECURE: "false",
    BCRYPT_COST: "10",
    CLAMAV_REQUIRED: "false",
    GOOGLE_WORKSPACE_OAUTH_CLIENT_ID: "stale-client-id",
    GOOGLE_WORKSPACE_OAUTH_CLIENT_SECRET: "stale-client-secret",
    GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET: transactionSecret,
    GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI: callbackUrl,
  });
  assert.equal(disabled.workspaceOAuthProvider, "disabled");
  assert.equal(disabled.workspaceOAuthClientId, "");
  assert.equal(disabled.workspaceOAuthClientSecret, "");
  assert.equal(disabled.workspaceOAuthTransactionSecret, "");
  assert.equal(disabled.workspaceOAuthRedirectUri, "");
  assert.throws(
    () =>
      configuredConfig({
        GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET: "too-short",
      }),
    /must contain at least 32 characters/,
  );
  assert.throws(
    () =>
      configuredConfig({
        GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI:
          "https://api.example.test/v1/auth/google-workspace/callback?token=bad",
      }),
    /exact secure Workspace callback URL/,
  );
  assert.throws(
    () =>
      configuredConfig({
        COOKIE_NAME: "same-cookie",
        GOOGLE_WORKSPACE_OAUTH_COOKIE_NAME: "same-cookie",
      }),
    /must differ from COOKIE_NAME/,
  );
});

test("production deployment keeps Workspace auth conditional and secret-backed", async () => {
  const workflow = await readFile(
    new URL("../../.github/workflows/deploy-backend.yml", import.meta.url),
    "utf8",
  );
  assert.match(
    workflow,
    /WORKSPACE_OAUTH_PROVIDER: \$\{\{ vars\.GOOGLE_WORKSPACE_OAUTH_PROVIDER \|\| 'disabled' \}\}/,
  );
  assert.match(
    workflow,
    /GOOGLE_WORKSPACE_OAUTH_CLIENT_SECRET=\{0\}:latest/,
  );
  assert.match(
    workflow,
    /GOOGLE_WORKSPACE_OAUTH_TRANSACTION_SECRET=\{0\}:latest/,
  );
  assert.match(
    workflow,
    /probe "\/health\/workspace-auth-ready" "workspace-auth-ready"/,
  );
  assert.match(
    workflow,
    /if \[\[ "\$WORKSPACE_OAUTH_PROVIDER" == "google" \]\]/,
  );
  assert.match(
    workflow,
    /GOOGLE_WORKSPACE_OAUTH_CLIENT_ID=\$\{\{ env\.WORKSPACE_OAUTH_PROVIDER == 'google' && env\.WORKSPACE_OAUTH_CLIENT_ID \|\| '' \}\}/,
  );
});
