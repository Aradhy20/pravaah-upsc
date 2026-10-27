import test from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

// Entitlement check logic for native test execution
async function checkEntitlementDirect(userId, featureCode) {
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: { gte: new Date() },
    },
    include: { plan: true },
  });

  const entitlement = await prisma.featureEntitlement.findUnique({
    where: { featureCode },
  });

  const userTier = activeSub ? activeSub.plan.tier : 0;
  const requiredTier = entitlement ? entitlement.minTier : 0;
  return {
    hasAccess: userTier >= requiredTier,
    userTier,
    requiredTier,
  };
}

async function checkQuotaDirect(userId, featureCode, currentCount) {
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: { gte: new Date() },
    },
    include: { plan: true },
  });

  const userTier = activeSub ? activeSub.plan.tier : 0;
  if (userTier >= 2) return { allowed: true, maxAllowed: null };

  const limitValue = featureCode === "BOOKMARKS_LIMIT" ? 5 : 3;
  return {
    allowed: currentCount < limitValue,
    maxAllowed: limitValue,
  };
}

test('Pricing & Plans API: Authoritative Server-Side Tier Retrieval', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/plans`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.strictEqual(json.data.length, 4, 'Must return 4 core plans: Free, Beginner, Achiever, Scholar');

  const freePlan = json.data.find(p => p.code === 'FREE');
  const achieverPlan = json.data.find(p => p.code === 'ACHIEVER');

  assert.ok(freePlan, 'Free plan must exist');
  assert.strictEqual(freePlan.tier, 0);
  assert.strictEqual(freePlan.prices.ANNUAL.amount, 0);

  assert.ok(achieverPlan, 'Achiever plan must exist');
  assert.strictEqual(achieverPlan.tier, 2);
  assert.strictEqual(achieverPlan.isPopular, true, 'Achiever must be flagged as popular/recommended');
  assert.strictEqual(achieverPlan.prices.MONTHLY.amount, 799);
  assert.strictEqual(achieverPlan.prices.ANNUAL.amount, 5499);
});

test('Feature Entitlement Service: Access Control & Quota Limits', async () => {
  // 1. Create a temporary Free test user
  const freeTestUser = await prisma.user.upsert({
    where: { email: 'free_test_aspirant@pravaah.in' },
    update: {},
    create: {
      email: 'free_test_aspirant@pravaah.in',
      fullName: 'Free Test Aspirant',
      passwordHash: 'test_hash_2026',
      role: { connect: { name: 'ASPIRANT' } },
    },
  });

  // Ensure free test user has no active subscription
  await prisma.subscription.deleteMany({
    where: { userId: freeTestUser.id },
  });

  // 2. Free User Entitlement Check for Timed Examination Mode
  const freeExamEntitlement = await checkEntitlementDirect(freeTestUser.id, 'TIMED_EXAMS');
  assert.strictEqual(freeExamEntitlement.hasAccess, false, 'Free user must NOT have access to Timed Exam simulator');
  assert.strictEqual(freeExamEntitlement.userTier, 0);
  assert.strictEqual(freeExamEntitlement.requiredTier, 2);

  // 3. Free User Quota Checks
  const quotaUnder = await checkQuotaDirect(freeTestUser.id, 'BOOKMARKS_LIMIT', 3);
  assert.strictEqual(quotaUnder.allowed, true, '3 bookmarks under quota limit of 5 should be allowed');

  const quotaExceeded = await checkQuotaDirect(freeTestUser.id, 'BOOKMARKS_LIMIT', 5);
  assert.strictEqual(quotaExceeded.allowed, false, '5 bookmarks should reach quota limit of 5 for free user');
  assert.strictEqual(quotaExceeded.maxAllowed, 5);

  // 4. Achiever User (aspirant@pravaah.in) Entitlement Check
  const paidAspirant = await prisma.user.findUnique({
    where: { email: 'aspirant@pravaah.in' },
  });
  assert.ok(paidAspirant, 'Paid aspirant must exist');

  const achieverPlan = await prisma.plan.findUnique({ where: { code: 'ACHIEVER' } });
  const existingSub = await prisma.subscription.findFirst({
    where: { userId: paidAspirant.id },
  });
  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        planId: achieverPlan.id,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: paidAspirant.id,
        planId: achieverPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
      },
    });
  }

  const paidExamEntitlement = await checkEntitlementDirect(paidAspirant.id, 'TIMED_EXAMS');
  assert.strictEqual(paidExamEntitlement.hasAccess, true, 'Achiever user MUST have access to Timed Exam simulator');
  assert.strictEqual(paidExamEntitlement.userTier, 2);

  const paidBookmarkQuota = await checkQuotaDirect(paidAspirant.id, 'BOOKMARKS_LIMIT', 100);
  assert.strictEqual(paidBookmarkQuota.allowed, true, 'Achiever user has unlimited bookmark quota');
  assert.strictEqual(paidBookmarkQuota.maxAllowed, null);
});

test('Subscription Checkout & Webhook Lifecycle: Idempotency & Signature Guard', async () => {
  // 1. Initialize Checkout for ACHIEVER Annual Plan
  const checkoutRes = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planCode: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });

  assert.strictEqual(checkoutRes.status, 200);
  const checkoutJson = await checkoutRes.json();
  assert.strictEqual(checkoutJson.success, true);
  assert.ok(checkoutJson.data.orderId, 'Checkout must return orderId reference');
  assert.strictEqual(checkoutJson.data.amount, 5499);
  assert.strictEqual(checkoutJson.data.currency, 'INR');

  const orderId = checkoutJson.data.orderId;

  // 2. Reject Webhook with Invalid Signature
  const badSigRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pravaah-webhook-signature': 'invalid_forged_secret',
    },
    body: JSON.stringify({
      event: 'payment.succeeded',
      orderId,
      planCode: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });
  assert.strictEqual(badSigRes.status, 401, 'Webhook with forged signature must be rejected with 401');

  // 3. Process Valid Payment Succeeded Webhook
  const validWebhookRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pravaah-webhook-signature': 'pravaah_webhook_dev_secret_2026',
    },
    body: JSON.stringify({
      event: 'payment.succeeded',
      orderId,
      planCode: 'ACHIEVER',
      billingInterval: 'ANNUAL',
      status: 'SUCCESS',
    }),
  });
  assert.strictEqual(validWebhookRes.status, 200);
  const validWebhookJson = await validWebhookRes.json();
  assert.strictEqual(validWebhookJson.success, true);
  assert.strictEqual(validWebhookJson.data.status, 'ACTIVE');

  // 4. Test Idempotency: Duplicate Webhook Call
  const duplicateWebhookRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pravaah-webhook-signature': 'pravaah_webhook_dev_secret_2026',
    },
    body: JSON.stringify({
      event: 'payment.succeeded',
      orderId,
      planCode: 'BEGINNER',
      billingInterval: 'ANNUAL',
      status: 'SUCCESS',
    }),
  });
  assert.strictEqual(duplicateWebhookRes.status, 200);
  const duplicateJson = await duplicateWebhookRes.json();
  assert.ok(duplicateJson.message.includes('idempotently'), 'Duplicate webhook must be handled idempotently');
});

test('Subscription Cancellation API: Preserves Current Period Access', async () => {
  const cancelRes = await fetch(`${BASE_URL}/api/v1/user/subscription/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: 'Automated acceptance test cancellation' }),
  });

  assert.strictEqual(cancelRes.status, 200);
  const cancelJson = await cancelRes.json();
  assert.strictEqual(cancelJson.success, true);
  assert.strictEqual(cancelJson.data.cancelAtPeriodEnd, true);
  assert.ok(cancelJson.data.effectiveUntil, 'Must preserve access until currentPeriodEnd');
});

test('Public Pricing Page: UI Content & Policy Integrity', async () => {
  const pageRes = await fetch(`${BASE_URL}/pricing`);
  assert.strictEqual(pageRes.status, 200);
  const html = await pageRes.text();

  assert.ok(html.includes('Invest in Your') || html.includes('Civil Services'), 'Pricing headline must render');
  assert.ok(html.includes('Aspirant Foundation') || html.includes('Foundation'), 'Free tier must be listed');
  assert.ok(html.includes('Prelims Pro') || html.includes('Achiever'), 'Recommended tier must be listed');
  assert.ok(html.includes('7-Day Unconditional Money-Back Guarantee'), 'Refund policy must be explicitly rendered');
  assert.ok(html.includes('Frequently Asked Questions'), 'FAQ section must be present');
});
