import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "gg_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. See .env.example for the required environment variables.",
    );
  }
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Builds a signed session token: base64url(payload) + "." + hmac(payload). */
export function createSessionToken() {
  const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/** Returns true if the token is well-formed, correctly signed, and not expired. */
export function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** Constant-time comparison of the submitted password against ADMIN_PASSWORD. */
export function verifyPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error(
      "ADMIN_PASSWORD is not set. See .env.example for the required environment variables.",
    );
  }
  const candidateBuffer = Buffer.from(String(candidate ?? ""));
  const expectedBuffer = Buffer.from(expected);
  if (candidateBuffer.length !== expectedBuffer.length) {
    // Still run a comparison so failure timing doesn't leak the length.
    crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }
  return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
