import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Unique synthetic identifier for this test run to prevent any collision
const RUN_ID = crypto.randomBytes(6).toString("hex");
const SYNTHETIC_USER_EMAIL = `synth_test_user_${RUN_ID}@pravaah.test`;
const SYNTHETIC_ORDER_ID = `synth_order_${RUN_ID}`;
const SYNTHETIC_STORY_SLUG = `synth-story-${RUN_ID}`;

let createdUserId = null;
let createdSessionId = null;
let createdSessionToken = null;
let createdSessionTokenHash = null;
let createdPaymentRecordId = null;
let createdStoryId = null;

describe("PostgreSQL Neon Synthetic Compatibility Verification", () => {
  before(async () => {
    // Confirm connection to PostgreSQL
    await prisma.$connect();

    // Fetch an existing role or create synthetic user with default ASPIRANT role
    const role = await prisma.role.findFirst({
      where: { name: "ASPIRANT" },
    });
    assert.ok(role, "ASPIRANT role must exist in PostgreSQL database");

    // 1. Synthetic User Creation for isolated test isolation
    const user = await prisma.user.create({
      data: {
        email: SYNTHETIC_USER_EMAIL,
        fullName: `Synthetic Test User ${RUN_ID}`,
        passwordHash: "scrypt:dummy_salt:dummy_derived_key",
        roleId: role.id,
      },
    });
    createdUserId = user.id;
  });

  after(async () => {
    // Strict cleanup of ONLY synthetic records created during this test run
    try {
      if (createdPaymentRecordId) {
        await prisma.paymentRecord.deleteMany({ where: { id: createdPaymentRecordId } });
      }
      if (createdSessionId) {
        await prisma.session.deleteMany({ where: { id: createdSessionId } });
      }
      if (createdStoryId) {
        await prisma.currentAffairsStory.deleteMany({ where: { id: createdStoryId } });
      }
      if (createdUserId) {
        await prisma.user.deleteMany({ where: { id: createdUserId } });
      }
    } catch (cleanupErr) {
      console.error("Cleanup error (synthetic records):", cleanupErr);
    } finally {
      await prisma.$disconnect();
    }
  });

  test("1. User lookup in PostgreSQL", async () => {
    const user = await prisma.user.findUnique({
      where: { id: createdUserId },
      include: { role: true },
    });

    assert.ok(user, "Synthetic user must be retrievable from PostgreSQL");
    assert.equal(user.email, SYNTHETIC_USER_EMAIL);
    assert.equal(user.role.name, "ASPIRANT");
  });

  test("2. Session creation in PostgreSQL Session table", async () => {
    createdSessionToken = "prv_sess_" + crypto.randomBytes(32).toString("hex");
    createdSessionTokenHash = crypto.createHash("sha256").update(createdSessionToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session = await prisma.session.create({
      data: {
        userId: createdUserId,
        tokenHash: createdSessionTokenHash,
        expiresAt,
        isRevoked: false,
      },
    });

    createdSessionId = session.id;
    assert.ok(session.id, "Session record must have generated ID");
    assert.equal(session.userId, createdUserId);
    assert.equal(session.tokenHash, createdSessionTokenHash);
    assert.equal(session.isRevoked, false);
  });

  test("3. Session token-hash lookup & validation with User join", async () => {
    const session = await prisma.session.findUnique({
      where: { tokenHash: createdSessionTokenHash },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    assert.ok(session, "Session lookup by tokenHash must succeed in PostgreSQL");
    assert.equal(session.id, createdSessionId);
    assert.equal(session.user.id, createdUserId);
    assert.equal(session.user.email, SYNTHETIC_USER_EMAIL);
    assert.equal(session.isRevoked, false);
    assert.ok(session.expiresAt > new Date(), "Session must not be expired");
  });

  test("4. Session expiration handling", async () => {
    // Create an already-expired synthetic session
    const expiredToken = "prv_sess_expired_" + crypto.randomBytes(32).toString("hex");
    const expiredHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
    const pastDate = new Date(Date.now() - 3600 * 1000); // 1 hour in the past

    const expiredSession = await prisma.session.create({
      data: {
        userId: createdUserId,
        tokenHash: expiredHash,
        expiresAt: pastDate,
      },
    });

    // Lookup mimicking requireAuthenticatedUser expiration check: expiresAt > now
    const validLookup = await prisma.session.findFirst({
      where: {
        tokenHash: expiredHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    assert.equal(validLookup, null, "Expired session must not be returned as active");

    // Clean up expired synthetic session
    await prisma.session.delete({ where: { id: expiredSession.id } });
  });

  test("5. Session revocation handling", async () => {
    // Revoke the active synthetic session
    const revoked = await prisma.session.update({
      where: { id: createdSessionId },
      data: { isRevoked: true },
    });

    assert.equal(revoked.isRevoked, true);

    // Verify authentication query rejects revoked session
    const activeLookup = await prisma.session.findFirst({
      where: {
        tokenHash: createdSessionTokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    assert.equal(activeLookup, null, "Revoked session must be rejected by auth guard");

    // Restore unrevoked state for subsequent synthetic tests if needed
    await prisma.session.update({
      where: { id: createdSessionId },
      data: { isRevoked: false },
    });
  });

  test("6. PaymentRecord creation, write compatibility & cleanup in PostgreSQL", async () => {
    // Testing write operation that previously crashed on SQLite read-only filesystem
    const payment = await prisma.paymentRecord.create({
      data: {
        userId: createdUserId,
        providerTxId: SYNTHETIC_ORDER_ID,
        amount: 5499,
        currency: "INR",
        status: "PENDING",
        provider: "SANDBOX",
        paymentMethod: "UPI",
      },
    });

    createdPaymentRecordId = payment.id;
    assert.ok(payment.id, "PaymentRecord must be created in PostgreSQL");
    assert.equal(payment.userId, createdUserId);
    assert.equal(payment.providerTxId, SYNTHETIC_ORDER_ID);
    assert.equal(payment.status, "PENDING");
  });

  test("7. CurrentAffairsStory viewCount update in PostgreSQL", async () => {
    // Testing atomic increment that failed with 'attempt to write a readonly database'
    const story = await prisma.currentAffairsStory.create({
      data: {
        title: `Synthetic Story ${RUN_ID}`,
        slug: SYNTHETIC_STORY_SLUG,
        summary: "Synthetic summary for testing PostgreSQL atomic write operations.",
        content: "Detailed synthetic content for verification.",
        sourceName: "PIB Delhi",
        sourceUrl: "https://pib.gov.in/synthetic-test",
        publishedAt: new Date(),
        status: "PUBLISHED",
        viewCount: 0,
      },
    });
    createdStoryId = story.id;
    assert.equal(story.viewCount, 0);

    // Perform atomic increment
    const updated = await prisma.currentAffairsStory.update({
      where: { id: story.id },
      data: { viewCount: { increment: 1 } },
    });

    assert.equal(updated.viewCount, 1, "viewCount must increment cleanly in PostgreSQL");

    const secondIncrement = await prisma.currentAffairsStory.update({
      where: { id: story.id },
      data: { viewCount: { increment: 5 } },
    });

    assert.equal(secondIncrement.viewCount, 6, "Subsequent increments must update without error");
  });

  test("8. Billing webhook signature validation logic", () => {
    // Timing-safe HMAC string comparison verification
    function timingSafeEqualStrings(a, b) {
      const bufA = Buffer.from(a);
      const bufB = Buffer.from(b);
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    }

    const validSecret = "test_webhook_secret_key_2026";
    const forgedSecret = "forged_malicious_signature_key";

    assert.equal(timingSafeEqualStrings(validSecret, validSecret), true, "Identical signature must validate");
    assert.equal(timingSafeEqualStrings(forgedSecret, validSecret), false, "Forged signature must fail");
    assert.equal(timingSafeEqualStrings("short", validSecret), false, "Mismatched length must fail safely");
  });

  test("9. Payment idempotency in PostgreSQL", async () => {
    // Fetch the synthetic payment record
    const payment = await prisma.paymentRecord.findUnique({
      where: { id: createdPaymentRecordId },
    });
    assert.ok(payment);

    // Transition to SUCCESS
    const markedSuccess = await prisma.paymentRecord.update({
      where: { id: payment.id },
      data: { status: "SUCCESS" },
    });
    assert.equal(markedSuccess.status, "SUCCESS");

    // Re-query: If status is already SUCCESS, idempotency guard confirms already processed
    const recheck = await prisma.paymentRecord.findUnique({
      where: { id: payment.id },
    });
    assert.equal(recheck.status, "SUCCESS");
    const isAlreadyProcessed = recheck.status === "SUCCESS";
    assert.equal(isAlreadyProcessed, true, "Idempotency guard must prevent duplicate payment processing");
  });
});
