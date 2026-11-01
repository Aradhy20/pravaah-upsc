import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 3 Subscription Journey: Authoritative Plan & Price Verification", async () => {
  // 1. Verify all 4 database tiers are retrievable via public API
  const res = await fetch(`${BASE_URL}/api/v1/plans`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);

  const plans = json.data;
  assert.strictEqual(plans.length, 4, "Must retrieve exactly 4 database tiers (FREE, BEGINNER, ACHIEVER, SCHOLAR)");

  const free = plans.find((p) => p.code === "FREE");
  const beginner = plans.find((p) => p.code === "BEGINNER");
  const achiever = plans.find((p) => p.code === "ACHIEVER");
  const scholar = plans.find((p) => p.code === "SCHOLAR");

  assert.ok(free && beginner && achiever && scholar, "All 4 tiers must be present in plans catalogue");
  assert.strictEqual(free.tier, 0);
  assert.strictEqual(beginner.tier, 1);
  assert.strictEqual(achiever.tier, 2);
  assert.strictEqual(scholar.tier, 3);

  // Authoritative prices
  assert.strictEqual(free.prices.ANNUAL.amount, 0);
  assert.strictEqual(beginner.prices.MONTHLY.amount, 399);
  assert.strictEqual(beginner.prices.ANNUAL.amount, 2999);
  assert.strictEqual(achiever.prices.MONTHLY.amount, 799);
  assert.strictEqual(achiever.prices.ANNUAL.amount, 5499);
  assert.strictEqual(scholar.prices.MONTHLY.amount, 1299);
  assert.strictEqual(scholar.prices.ANNUAL.amount, 8999);
});

test("Day 3 Subscription Journey: Server-Side Price Tamper Resistance & Order Generation", async () => {
  // Create isolated test user
  const email = `sub_journey_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Journey Test Aspirant",
      passwordHash: "secure_hash_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // Attempt checkout for ACHIEVER plan - client attempts to pass a tampered price
  const checkoutRes = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({
      planCode: "ACHIEVER",
      billingInterval: "ANNUAL",
      tamperedPrice: 1, // Client tries to pay ₹1 instead of ₹5499
    }),
  });

  assert.strictEqual(checkoutRes.status, 200);
  const checkoutJson = await checkoutRes.json();
  assert.strictEqual(checkoutJson.success, true);

  // Verify server completely ignored tamperedPrice and used authoritative database price (₹5,499)
  assert.strictEqual(checkoutJson.data.amount, 5499, "Server must enforce ₹5,499 from database");
  assert.strictEqual(checkoutJson.data.planCode, "ACHIEVER");
  assert.strictEqual(checkoutJson.data.currency, "INR");
  assert.ok(checkoutJson.data.orderId, "Must return valid order reference");

  // Verify PENDING payment record was created in Neon DB
  const paymentRecord = await prisma.paymentRecord.findFirst({
    where: { providerTxId: checkoutJson.data.orderId },
  });
  assert.ok(paymentRecord, "PaymentRecord must exist in DB");
  assert.strictEqual(paymentRecord.status, "PENDING");
  assert.strictEqual(paymentRecord.amount, 5499);
  assert.strictEqual(paymentRecord.userId, user.id);

  // Clean up
  await prisma.paymentRecord.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

test("Day 3 Subscription Journey: Webhook Signature Guard & Idempotency", async () => {
  const email = `webhook_guard_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Webhook Guard Aspirant",
      passwordHash: "secure_hash_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // 1. Create order
  const checkoutRes = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({
      planCode: "ACHIEVER",
      billingInterval: "ANNUAL",
    }),
  });
  const checkoutJson = await checkoutRes.json();
  const orderId = checkoutJson.data.orderId;

  // 2. Test Invalid Webhook Signature -> Must be rejected with 401
  const badSigRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pravaah-webhook-signature": "tampered_forged_signature_xyz",
    },
    body: JSON.stringify({
      event: "payment.succeeded",
      orderId,
      planCode: "ACHIEVER",
      status: "SUCCESS",
    }),
  });
  assert.strictEqual(badSigRes.status, 401, "Tampered webhook signature must return 401 Unauthorized");

  // 3. Test Legitimate Webhook -> Activates subscription
  const validWebhookRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pravaah-webhook-signature": "pravaah_webhook_dev_secret_2026",
    },
    body: JSON.stringify({
      event: "payment.succeeded",
      orderId,
      planCode: "ACHIEVER",
      billingInterval: "ANNUAL",
      status: "SUCCESS",
    }),
  });
  assert.strictEqual(validWebhookRes.status, 200);
  const webhookJson = await validWebhookRes.json();
  assert.strictEqual(webhookJson.success, true);
  assert.strictEqual(webhookJson.data.status, "ACTIVE");

  // Verify Subscription in DB
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id },
    include: { plan: true },
  });
  assert.ok(sub);
  assert.strictEqual(sub.plan.code, "ACHIEVER");
  assert.strictEqual(sub.status, "ACTIVE");

  // 4. Test Idempotency: Re-submitting the same webhook should NOT duplicate subscription or error
  const duplicateWebhookRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pravaah-webhook-signature": "pravaah_webhook_dev_secret_2026",
    },
    body: JSON.stringify({
      event: "payment.succeeded",
      orderId,
      planCode: "ACHIEVER",
      billingInterval: "ANNUAL",
      status: "SUCCESS",
    }),
  });
  assert.strictEqual(duplicateWebhookRes.status, 200);
  const dupJson = await duplicateWebhookRes.json();
  assert.strictEqual(dupJson.success, true);
  assert.ok(dupJson.message.includes("idempotently"));

  // Clean up
  await prisma.subscriptionEvent.deleteMany({ where: { subscriptionId: sub.id } });
  await prisma.paymentRecord.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

test("Day 3 Subscription Journey: Self-Serve Cancellation Preserves Paid Access", async () => {
  const email = `cancel_guard_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Cancellation Guard Aspirant",
      passwordHash: "secure_hash_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Create active subscription expiring in 30 days
  const achieverPlan = await prisma.plan.findUnique({ where: { code: "ACHIEVER" } });
  const futureEnd = new Date(Date.now() + 30 * 86400000);
  const sub = await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: achieverPlan.id,
      status: "ACTIVE",
      billingInterval: "MONTHLY",
      currentPeriodStart: new Date(),
      currentPeriodEnd: futureEnd,
      cancelAtPeriodEnd: false,
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // Cancel subscription via user endpoint
  const cancelRes = await fetch(`${BASE_URL}/api/v1/user/subscription/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({ reason: "Switching study focus" }),
  });

  assert.strictEqual(cancelRes.status, 200);
  const cancelJson = await cancelRes.json();
  assert.strictEqual(cancelJson.success, true);
  assert.strictEqual(cancelJson.data.cancelAtPeriodEnd, true);

  // Verify access is STILL active in database
  const updatedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
  assert.strictEqual(updatedSub.cancelAtPeriodEnd, true);
  assert.strictEqual(updatedSub.status, "ACTIVE", "Status must remain ACTIVE until period end");

  // Clean up
  await prisma.subscriptionEvent.deleteMany({ where: { subscriptionId: sub.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});
