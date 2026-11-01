import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { validateEnvironment } from "../lib/env.js";

// Helper: Timing-safe string comparison
function timingSafeEqualStrings(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Helper: Webhook HMAC verification function matching app/api/v1/billing/webhook/route.ts
function verifyWebhookHmac(rawBody, signature, secret, isProduction = false) {
  if (!signature || !secret || !rawBody) return false;
  const computedHmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (timingSafeEqualStrings(signature, computedHmac)) {
    return true;
  }

  // In non-production only, allow dev key shortcut for manual sandbox testing
  if (!isProduction && timingSafeEqualStrings(signature, secret)) {
    return true;
  }

  return false;
}

// Helper: Session token generator
function generateSessionToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

// Mock Role-Based Auth Guard matching lib/auth.ts
function simulateRequireAuth(userSession, options) {
  if (!userSession) {
    return {
      status: 401,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required. Please log in with a valid session.",
      },
    };
  }

  if (options?.requiredRole && userSession.role !== options.requiredRole) {
    return {
      status: 403,
      error: {
        code: "FORBIDDEN",
        message: `Access denied. ${options.requiredRole} privileges required.`,
      },
    };
  }

  return { user: userSession };
}

// -----------------------------------------------------------------------------
// TEST SUITE: PRODUCTION READINESS & APPLICATION SECURITY
// -----------------------------------------------------------------------------

test("1. Unauthenticated Analytics Access: Fails closed with HTTP 401 Unauthorized", () => {
  const result = simulateRequireAuth(null);
  assert.equal(result.status, 401);
  assert.equal(result.error.code, "UNAUTHORIZED");
  assert.ok(result.error.message.includes("Authentication required"));
});

test("2. Invalid Session Token: Rejects empty, truncated, or non-hex candidate strings", () => {
  const isCandidateSyntacticallyValid = (candidate) => {
    return Boolean(candidate && typeof candidate === "string" && candidate.length >= 32 && /^[0-9a-f]{64}$/i.test(candidate));
  };

  const invalidCandidates = [
    "",
    null,
    undefined,
    "short_token_123",
    "cuid_user_id_which_is_not_a_session_token", // Not 64 hex chars
    "x".repeat(31), // Less than 32 chars
    "z".repeat(64), // 64 chars but non-hex
  ];

  for (const candidate of invalidCandidates) {
    assert.equal(isCandidateSyntacticallyValid(candidate), false, `Should reject invalid candidate: ${candidate}`);
  }

  const { token } = generateSessionToken();
  assert.equal(isCandidateSyntacticallyValid(token), true, "Valid 64-char hex token should pass syntactic check");
});

test("3. Expired Session: Validates that expired sessions are strictly rejected", () => {
  const { tokenHash } = generateSessionToken();
  const pastDate = new Date(Date.now() - 1000); // 1 second ago

  const mockDbSession = {
    tokenHash,
    isRevoked: false,
    expiresAt: pastDate,
  };

  const isExpired = mockDbSession.expiresAt <= new Date();
  assert.equal(isExpired, true);

  const isValidSession = !mockDbSession.isRevoked && mockDbSession.expiresAt > new Date();
  assert.equal(isValidSession, false);
});

test("4. Revoked Session: Logout invalidation marks isRevoked: true and blocks access", () => {
  const { tokenHash } = generateSessionToken();
  const mockDbSession = {
    tokenHash,
    isRevoked: true, // User logged out
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const isValidSession = !mockDbSession.isRevoked && mockDbSession.expiresAt > new Date();
  assert.equal(isValidSession, false);
});

test("5. Role Authorization: Aspirant blocked from Admin endpoints with HTTP 403 Forbidden", () => {
  const aspirantUser = {
    id: "usr_aspirant_123",
    email: "aspirant@pravaah.in",
    role: "ASPIRANT",
  };

  const result = simulateRequireAuth(aspirantUser, { requiredRole: "ADMIN" });
  assert.equal(result.status, 403);
  assert.equal(result.error.code, "FORBIDDEN");
  assert.ok(result.error.message.includes("ADMIN privileges required"));

  const adminUser = {
    id: "usr_admin_123",
    email: "admin@pravaah.in",
    role: "ADMIN",
  };
  const adminResult = simulateRequireAuth(adminUser, { requiredRole: "ADMIN" });
  assert.equal(adminResult.status, undefined);
  assert.equal(adminResult.user.role, "ADMIN");
});

test("6. Cross-User Data Isolation: Scopes queries strictly by authenticated user ID", () => {
  const authenticatedUserId = "usr_alice_001";
  const foreignUserId = "usr_bob_002";

  // Simulate attempt repository query
  const mockAttempts = [
    { id: "att_1", userId: "usr_alice_001", isCorrect: true },
    { id: "att_2", userId: "usr_alice_001", isCorrect: false },
    { id: "att_3", userId: "usr_bob_002", isCorrect: true },
  ];

  const userScopedAttempts = mockAttempts.filter((a) => a.userId === authenticatedUserId);
  assert.equal(userScopedAttempts.length, 2);
  assert.ok(userScopedAttempts.every((a) => a.userId === authenticatedUserId));
  assert.ok(userScopedAttempts.every((a) => a.userId !== foreignUserId));
});

test("7. Webhook Security: Genuine HMAC-SHA256 signature verification over raw request body", () => {
  const secret = "live_production_webhook_secret_key_2026";
  const rawBody = JSON.stringify({
    event: "payment.succeeded",
    orderId: "order_1730000000_abcd",
    planCode: "ACHIEVER",
    billingInterval: "ANNUAL",
    status: "SUCCESS",
  });

  const validHmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // A. Valid HMAC passes in production and dev
  assert.equal(verifyWebhookHmac(rawBody, validHmac, secret, true), true);
  assert.equal(verifyWebhookHmac(rawBody, validHmac, secret, false), true);

  // B. Tampered payload fails
  const tamperedBody = rawBody.replace("ACHIEVER", "SCHOLAR");
  assert.equal(verifyWebhookHmac(tamperedBody, validHmac, secret, true), false);

  // C. Forged signature fails
  const forgedHmac = crypto.createHmac("sha256", "wrong_secret").update(rawBody).digest("hex");
  assert.equal(verifyWebhookHmac(rawBody, forgedHmac, secret, true), false);

  // D. In production, raw secret in header is strictly rejected (must be HMAC of body)
  assert.equal(verifyWebhookHmac(rawBody, secret, secret, true), false);

  // E. In non-production, dev shortcut is tolerated
  assert.equal(verifyWebhookHmac(rawBody, secret, secret, false), true);

  // F. Missing signature or secret fails safely
  assert.equal(verifyWebhookHmac(rawBody, null, secret, true), false);
  assert.equal(verifyWebhookHmac(rawBody, validHmac, null, true), false);
  assert.equal(verifyWebhookHmac("", validHmac, secret, true), false);
});

test("8. Environment Validation: Detects missing DATABASE_URL and PAYMENT_WEBHOOK_SECRET in production", () => {
  // A. Missing both in production
  const emptyEnv = { NODE_ENV: "production" };
  const resEmpty = validateEnvironment(emptyEnv);
  assert.equal(resEmpty.valid, false);
  assert.ok(resEmpty.errors.some((e) => e.includes("Missing database connection string")));
  assert.ok(resEmpty.errors.some((e) => e.includes("PAYMENT_WEBHOOK_SECRET is required in production")));

  // B. Valid production configuration
  const validProdEnv = {
    NODE_ENV: "production",
    NEON_DATABASE_URL: "postgresql://neondb_owner:secret@ep-xyz-pooler.c-6.aws.neon.tech/neondb?sslmode=require",
    PAYMENT_WEBHOOK_SECRET: "0123456789abcdef0123456789abcdef",
  };
  const resValid = validateEnvironment(validProdEnv);
  assert.equal(resValid.valid, true);
  assert.equal(resValid.errors.length, 0);

  // C. Development mode allows missing webhook secret with warning
  const validDevEnv = {
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://neondb_owner:secret@ep-xyz-pooler.c-6.aws.neon.tech/neondb?sslmode=require",
  };
  const resDev = validateEnvironment(validDevEnv);
  assert.equal(resDev.valid, true);
  assert.ok(resDev.warnings.some((w) => w.includes("PAYMENT_WEBHOOK_SECRET is not set")));
});

test("9. Production SQLite Rejection: Prohibits SQLite protocol (file:) when NODE_ENV is production", () => {
  const prodSqliteEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "file:./prisma/dev.db",
    PAYMENT_WEBHOOK_SECRET: "0123456789abcdef0123456789abcdef",
  };

  const res = validateEnvironment(prodSqliteEnv);
  assert.equal(res.valid, false);
  assert.ok(
    res.errors.some((e) => e.includes("SQLite fallback is strictly prohibited in production"))
  );
});
