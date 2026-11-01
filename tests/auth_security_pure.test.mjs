import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

/**
 * Pure cryptographic unit tests for Pravaah UPSC Authentication & Security Handlers.
 * Verifies core security invariants without requiring database writes or network access.
 */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) {
    return { valid: false, needsRehash: false };
  }

  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedKey = parts[2];
      try {
        const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
        const bufA = Buffer.from(derivedKey, "hex");
        const bufB = Buffer.from(expectedKey, "hex");
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          return { valid: true, needsRehash: false };
        }
      } catch (e) {
        return { valid: false, needsRehash: false };
      }
    }
    return { valid: false, needsRehash: false };
  }

  // Legacy SHA-256 fallback format
  try {
    const legacySalt = "pravaah_static_salt_legacy_2025";
    const legacyDerived = crypto
      .createHash("sha256")
      .update(password + legacySalt)
      .digest("hex");
    const bufA = Buffer.from(legacyDerived, "hex");
    const bufB = Buffer.from(storedHash, "hex");
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return { valid: true, needsRehash: true };
    }
  } catch (e) {
    return { valid: false, needsRehash: false };
  }

  return { valid: false, needsRehash: false };
}

function verifyWebhookSignature(payload, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const bufA = Buffer.from(signatureHeader, "utf-8");
  const bufB = Buffer.from(expectedSignature, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateSessionToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

test("Auth Security: Scrypt password hashing produces secure unique salt & key", () => {
  const password = "ValidAspirantPassword2026!";
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  assert.ok(hash1.startsWith("scrypt:"));
  assert.ok(hash2.startsWith("scrypt:"));
  // Unique random salt ensures different hashes for identical passwords
  assert.notEqual(hash1, hash2);

  const verification1 = verifyPassword(password, hash1);
  assert.equal(verification1.valid, true);
  assert.equal(verification1.needsRehash, false);

  const wrongPasswordVerification = verifyPassword("IncorrectPassword999!", hash1);
  assert.equal(wrongPasswordVerification.valid, false);
});

test("Auth Security: Empty or malformed credentials fail safely", () => {
  assert.equal(verifyPassword("", "scrypt:some:hash").valid, false);
  assert.equal(verifyPassword("pass", "").valid, false);
  assert.equal(verifyPassword("pass", "invalid_format").valid, false);
});

test("Auth Security: Legacy SHA-256 fallback validates and flags needsRehash", () => {
  const legacySalt = "pravaah_static_salt_legacy_2025";
  const password = "OldUserPassword!";
  const legacyHash = crypto.createHash("sha256").update(password + legacySalt).digest("hex");

  const result = verifyPassword(password, legacyHash);
  assert.equal(result.valid, true);
  assert.equal(result.needsRehash, true);
});

test("Auth Security: Cryptographic Session token generation has 256-bit entropy and irreversible hash", () => {
  const { token, tokenHash } = generateSessionToken();
  assert.equal(token.length, 64); // 32 bytes hex = 64 characters = 256 bits entropy
  assert.equal(tokenHash.length, 64); // SHA-256 hex = 64 characters
  assert.notEqual(token, tokenHash); // Token and its stored hash are distinct

  // SHA-256 recomputation must match exactly
  const recomputedHash = crypto.createHash("sha256").update(token).digest("hex");
  assert.equal(recomputedHash, tokenHash);
});

test("Webhook Security: HMAC-SHA256 signature validation with timing-safe comparison", () => {
  const secret = "live_webhook_secret_key_prod_2026";
  const payload = JSON.stringify({ event: "payment.captured", amount: 299900 });
  const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  // Valid signature passes
  assert.equal(verifyWebhookSignature(payload, validSignature, secret), true);

  // Tampered payload fails
  const tamperedPayload = JSON.stringify({ event: "payment.captured", amount: 100 });
  assert.equal(verifyWebhookSignature(tamperedPayload, validSignature, secret), false);

  // Forged signature fails
  const forgedSignature = "a".repeat(64);
  assert.equal(verifyWebhookSignature(payload, forgedSignature, secret), false);

  // Length mismatch fails safely without throwing
  assert.equal(verifyWebhookSignature(payload, "short", secret), false);
  assert.equal(verifyWebhookSignature(payload, null, secret), false);
});

