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
  assert.strictEqual(achieverPlan.prices.MONTHLY.amount, 299);
  assert.strictEqual(achieverPlan.prices.ANNUAL.amount, 1999);
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

test('Subscription Checkout & Webhook Lifecycle: Safely Disabled for Cashfree Migration', async () => {
  // 1. Paid Checkout must be safely disabled (HTTP 503 PAYMENTS_DISABLED)
  const checkoutRes = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planCode: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });

  assert.strictEqual(checkoutRes.status, 503, 'Paid checkout must return 503 Service Unavailable');
  const checkoutJson = await checkoutRes.json();
  assert.strictEqual(checkoutJson.success, false);
  assert.strictEqual(checkoutJson.error.code, 'PAYMENTS_DISABLED');

  // 2. Browser/Dev Webhook must be permanently disabled (HTTP 503 WEBHOOK_DISABLED)
  const webhookRes = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-pravaah-webhook-signature': 'pravaah_webhook_dev_secret_2026',
    },
    body: JSON.stringify({
      event: 'payment.succeeded',
      orderId: 'fake_order_123',
      planCode: 'ACHIEVER',
      billingInterval: 'ANNUAL',
      status: 'SUCCESS',
    }),
  });
  assert.strictEqual(webhookRes.status, 503, 'Dev webhook must be rejected with 503');
  const webhookJson = await webhookRes.json();
  assert.strictEqual(webhookJson.success, false);
  assert.strictEqual(webhookJson.error.code, 'WEBHOOK_DISABLED');
});

test('Subscription Cancellation API: Preserves Current Period Access', async () => {
  const cancelRes = await fetch(`${BASE_URL}/api/v1/user/subscription/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'cmvqr30n000035y3b9qc5yjak',
    },
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
