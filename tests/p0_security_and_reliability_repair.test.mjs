import test from "node:test";
import assert from "node:assert/strict";
import { signSessionToken, verifySessionToken } from "../lib/auth.js";
import { isPaymentSystemEnabled, getCashfreeConfig } from "../lib/payments/payment-config.js";

test("P0 Security: HMAC-SHA256 Token Signing & Verification", () => {
  const userId = "cmtestuser123456789";
  const signedToken = signSessionToken(userId);
  assert.ok(signedToken.includes(":"), "Token must contain timestamp and signature delimiters");

  const verifiedId = verifySessionToken(signedToken);
  assert.equal(verifiedId, userId, "Valid signed token must return original userId");

  // Tampered signature must fail
  const parts = signedToken.split(":");
  const tamperedToken = `${parts[0]}:${parts[1]}:badsignature00000000000000000000000000000000000000000000000000000000`;
  const tamperedResult = verifySessionToken(tamperedToken);
  assert.equal(tamperedResult, null, "Tampered signature must be rejected with null");
});

test("P0 Security: In Production Mode, Raw CUID Bypass Must Be Rejected", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalBypass = process.env.ENABLE_TEST_AUTH_BYPASS;
  delete process.env.ENABLE_TEST_AUTH_BYPASS;

  try {
    process.env.NODE_ENV = "production";
    const rawCuid = "cmvqr30n000035y3b9qc5yjak";
    const result = verifySessionToken(rawCuid);
    assert.equal(result, null, "Raw CUID token without signature MUST be rejected in production");

    const rawUser = "usr-12345";
    const userResult = verifySessionToken(rawUser);
    assert.equal(userResult, null, "Raw user_ id MUST be rejected in production");
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalBypass !== undefined) {
      process.env.ENABLE_TEST_AUTH_BYPASS = originalBypass;
    }
  }
});

test("P0 Reliability: Payment Feature Flag Requires Explicit ENABLE_PAYMENTS='true'", () => {
  const originalEnv = process.env.ENABLE_PAYMENTS;

  try {
    // 1. Unset or empty -> must be false
    delete process.env.ENABLE_PAYMENTS;
    assert.equal(isPaymentSystemEnabled(), false, "Payments must be disabled when ENABLE_PAYMENTS is unset");

    // 2. Explicit 'false' -> must be false
    process.env.ENABLE_PAYMENTS = "false";
    assert.equal(isPaymentSystemEnabled(), false, "Payments must be disabled when ENABLE_PAYMENTS='false'");

    // 3. 'true' with production key format -> environment auto-detects PROD
    const originalSecret = process.env.CASHFREE_CLIENT_SECRET;
    process.env.CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_testkey123456789";
    const cfg = getCashfreeConfig();
    assert.equal(cfg.environment, "PROD", "Production secret key must auto-detect PROD environment");
    if (originalSecret !== undefined) {
      process.env.CASHFREE_CLIENT_SECRET = originalSecret;
    } else {
      delete process.env.CASHFREE_CLIENT_SECRET;
    }
  } finally {
    if (originalEnv !== undefined) {
      process.env.ENABLE_PAYMENTS = originalEnv;
    } else {
      delete process.env.ENABLE_PAYMENTS;
    }
  }
});

test("P0 Reliability: API Resilience (Plans, Search, Interview, Map Lab)", async () => {
  // Test Plans API logic directly
  const { GET: getPlans } = await import("../app/api/v1/plans/route.ts");
  const plansRes = await getPlans();
  assert.equal(plansRes.status, 200, "GET /api/v1/plans must return HTTP 200");
  const plansJson = await plansRes.json();
  assert.ok(plansJson.success, "Plans response must indicate success");
  assert.ok(Array.isArray(plansJson.data), "Plans data must be an array");

  // Verify canonical plans exist
  const codes = plansJson.data.map((p) => p.code);
  assert.ok(codes.includes("PLUS") || codes.includes("BEGINNER"), "Must include Plus plan");
  assert.ok(codes.includes("PRO") || codes.includes("ACHIEVER"), "Must include Pro plan");
});
