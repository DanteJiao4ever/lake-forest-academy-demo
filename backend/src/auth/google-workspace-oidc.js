import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../lib/errors.js";
import { normalizeEmail } from "../lib/passwords.js";
import { safeTextEqual, sha256 } from "../lib/crypto.js";

const googleIssuer = "https://accounts.google.com";
const googleIssuers = new Set([googleIssuer, "accounts.google.com"]);
const transientNetworkCodes = new Set([
  "ABORT_ERR",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ERR_NETWORK",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
]);

function unavailable() {
  return new ApiError(
    503,
    "WORKSPACE_AUTH_UNAVAILABLE",
    "Google Workspace sign-in is temporarily unavailable.",
  );
}

function denied() {
  return new ApiError(
    401,
    "WORKSPACE_AUTHENTICATION_FAILED",
    "Google Workspace could not verify this faculty account.",
  );
}

function isUpstreamUnavailable(error) {
  const upstreamStatus = Number(
    error?.response?.status || error?.response?.statusCode || 0,
  );
  if (
    upstreamStatus === 408 ||
    upstreamStatus === 429 ||
    upstreamStatus >= 500
  ) {
    return true;
  }
  const errorCode = String(error?.code || error?.cause?.code || "").toUpperCase();
  return (
    error?.name === "AbortError" ||
    error?.cause?.name === "AbortError" ||
    transientNetworkCodes.has(errorCode)
  );
}

export class UnavailableGoogleWorkspaceOidc {
  isConfigured() {
    return false;
  }

  async ready() {
    throw unavailable();
  }

  authorizationUrl() {
    throw unavailable();
  }

  async exchangeAndVerify() {
    throw unavailable();
  }
}

export class GoogleWorkspaceOidc {
  constructor({
    clientId,
    clientSecret,
    redirectUri,
    hostedDomain,
    client,
  }) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.hostedDomain = String(hostedDomain || "").toLowerCase();
    this.client = client || new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });
  }

  isConfigured() {
    return true;
  }

  async ready() {
    if (
      !this.clientId ||
      !this.redirectUri ||
      !this.hostedDomain ||
      typeof this.client.generateAuthUrl !== "function" ||
      typeof this.client.getToken !== "function" ||
      typeof this.client.verifyIdToken !== "function"
    ) {
      throw unavailable();
    }
    return true;
  }

  authorizationUrl({ state, nonce, codeChallenge }) {
    return this.client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email"],
      prompt: "select_account",
      hd: this.hostedDomain,
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
  }

  async exchangeAndVerify({ code, codeVerifier, expectedNonceHash }) {
    try {
      const tokenResponse = await this.client.getToken({
        code,
        codeVerifier,
        redirect_uri: this.redirectUri,
      });
      const idToken = tokenResponse?.tokens?.id_token;
      if (!idToken) throw denied();
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });
      const payload = ticket?.getPayload?.();
      const audience = Array.isArray(payload?.aud)
        ? payload.aud
        : [payload?.aud];
      const expirySeconds = Number(payload?.exp || 0);
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (
        !payload ||
        !googleIssuers.has(String(payload.iss || "")) ||
        !audience.includes(this.clientId) ||
        (payload.azp && payload.azp !== this.clientId) ||
        expirySeconds <= nowSeconds ||
        payload.email_verified !== true ||
        String(payload.hd || "").toLowerCase() !== this.hostedDomain ||
        !payload.sub ||
        !payload.email ||
        !payload.nonce ||
        !safeTextEqual(expectedNonceHash, sha256(payload.nonce))
      ) {
        throw denied();
      }
      return {
        issuer: googleIssuer,
        subject: String(payload.sub),
        email: normalizeEmail(payload.email),
        hostedDomain: this.hostedDomain,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (isUpstreamUnavailable(error)) throw unavailable();
      throw denied();
    }
  }
}

export function createGoogleWorkspaceOidc(config) {
  if (config.workspaceOAuthProvider !== "google") {
    return new UnavailableGoogleWorkspaceOidc();
  }
  return new GoogleWorkspaceOidc({
    clientId: config.workspaceOAuthClientId,
    clientSecret: config.workspaceOAuthClientSecret,
    redirectUri: config.workspaceOAuthRedirectUri,
    hostedDomain: config.workspaceOAuthHostedDomain,
  });
}
