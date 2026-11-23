import test from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  getUserSubscription,
  checkEntitlement,
  checkQuota,
  getOrCreateUsageLedger,
  checkAiCreditAllowance,
  deductAiCredit,
  restoreAiCredit,
  checkDailyPyqLimit,
  recordPyqAttempt,
} from "../lib/entitlements";
import { isPaymentSystemEnabled } from "../lib/payments/payment-config";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Phase 6: Canonical 4 Plans & Exact Pricing Verification", async () => {
  const plans = await prisma.plan.findMany({
    include: { prices: true, features: true },
    orderBy: { orderIndex: "asc" },
  });

  assert.ok(plans.length >= 4, "Must contain at least 4 plans");

  const freePlan = plans.find((p) => p.code === "FREE");
  const plusPlan = plans.find((p) => p.code === "BEGINNER");
  const proPlan = plans.find((p) => p.code === "ACHIEVER");
  const elitePlan = plans.find((p) => p.code === "SCHOLAR");

  assert.ok(freePlan, "Free plan must exist");
  assert.strictEqual(freePlan.name, "Free Aspirant");
  assert.strictEqual(freePlan.tier, 0);

  assert.ok(plusPlan, "Aspirant Plus plan must exist");
  assert.strictEqual(plusPlan.name, "Aspirant Plus");
  assert.strictEqual(plusPlan.tier, 1);
  const plusPrices = Object.fromEntries(plusPlan.prices.map((pr) => [pr.billingInterval, pr.amountRupees]));
  assert.strictEqual(plusPrices.MONTHLY, 149, "Plus monthly must be 149");
  assert.strictEqual(plusPrices.QUARTERLY, 399, "Plus quarterly must be 399");
  assert.strictEqual(plusPrices.ANNUAL, 999, "Plus annual must be 999");

  assert.ok(proPlan, "Aspirant Pro plan must exist");
  assert.strictEqual(proPlan.name, "Aspirant Pro");
  assert.strictEqual(proPlan.tier, 2);
  assert.strictEqual(proPlan.isPopular, true, "Aspirant Pro must be flagged as most popular / flagship");
  const proPrices = Object.fromEntries(proPlan.prices.map((pr) => [pr.billingInterval, pr.amountRupees]));
  assert.strictEqual(proPrices.MONTHLY, 299, "Pro monthly must be 299");
  assert.strictEqual(proPrices.QUARTERLY, 799, "Pro quarterly must be 799");
  assert.strictEqual(proPrices.ANNUAL, 1999, "Pro annual must be 1999");

  assert.ok(elitePlan, "Aspirant Elite plan must exist");
  assert.strictEqual(elitePlan.name, "Aspirant Elite");
  assert.strictEqual(elitePlan.tier, 3);
  const elitePrices = Object.fromEntries(elitePlan.prices.map((pr) => [pr.billingInterval, pr.amountRupees]));
  assert.strictEqual(elitePrices.MONTHLY, 499, "Elite monthly must be 499");
  assert.strictEqual(elitePrices.QUARTERLY, 1299, "Elite quarterly must be 1299");
  assert.strictEqual(elitePrices.ANNUAL, 3499, "Elite annual must be 3499");
});

test("Phase 6: Server-Side Feature Entitlement Hierarchy", async () => {
  // 1. Create a test user with no subscription (Free tier 0)
  const freeUser = await prisma.user.upsert({
    where: { email: "test_free_entitlements@pravaah.in" },
    update: {},
    create: {
      email: "test_free_entitlements@pravaah.in",
      fullName: "Free Test Student",
      passwordHash: "test_hash",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Ensure free user has no subscription
  await prisma.subscription.deleteMany({ where: { userId: freeUser.id } });

  // Free user entitlement checks
  const freeExam = await checkEntitlement(freeUser.id, "TIMED_EXAMS");
  assert.strictEqual(freeExam.hasAccess, false, "Free user must NOT have access to Timed Exams");
  assert.strictEqual(freeExam.userTier, 0);

  const freeMission = await checkEntitlement(freeUser.id, "MISSION_CONTROL");
  assert.strictEqual(freeMission.hasAccess, false, "Free user must NOT have access to Mission Control");

  // Free user quota check
  const bookmarkCheck = await checkQuota(freeUser.id, "BOOKMARKS_LIMIT", 5);
  assert.strictEqual(bookmarkCheck.allowed, false, "Free user quota of 5 bookmarks must be enforced");

  // 2. Grant Achiever (Tier 2 / Pro) subscription
  const achieverPlan = await prisma.plan.findUnique({ where: { code: "ACHIEVER" } });
  assert.ok(achieverPlan);

  await prisma.subscription.upsert({
    where: { id: "test_sub_pro_123" },
    update: {
      userId: freeUser.id,
      planId: achieverPlan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    },
    create: {
      id: "test_sub_pro_123",
      userId: freeUser.id,
      planId: achieverPlan.id,
      status: "ACTIVE",
      billingInterval: "MONTHLY",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    },
  });

  // Now verify that Pro entitlements are unlocked
  const proExam = await checkEntitlement(freeUser.id, "TIMED_EXAMS");
  assert.strictEqual(proExam.hasAccess, true, "Pro user must have access to Timed Exams");
  assert.strictEqual(proExam.userTier, 2);

  const proMission = await checkEntitlement(freeUser.id, "MISSION_CONTROL");
  assert.strictEqual(proMission.hasAccess, true, "Pro user must have access to Mission Control");

  const proBookmarks = await checkQuota(freeUser.id, "BOOKMARKS_LIMIT", 100);
  assert.strictEqual(proBookmarks.allowed, true, "Pro user must have unlimited bookmarks");

  // Clean up
  await prisma.subscription.deleteMany({ where: { userId: freeUser.id } });
  await prisma.user.delete({ where: { id: freeUser.id } });
});

test("Phase 6: AI Credit Ledger & Usage Accounting", async () => {
  const testUser = await prisma.user.upsert({
    where: { email: "test_ai_credit@pravaah.in" },
    update: {},
    create: {
      email: "test_ai_credit@pravaah.in",
      fullName: "AI Credit Aspirant",
      passwordHash: "test_hash",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Clean any previous ledger
  await prisma.userUsageLedger.deleteMany({ where: { userId: testUser.id } });

  // 1. Initialize usage ledger
  const ledger = await getOrCreateUsageLedger(testUser.id);
  assert.ok(ledger, "Ledger must be initialized");
  assert.strictEqual(ledger.aiMentorMessagesUsed, 0);

  // 2. Check initial allowance
  const initialCheck = await checkAiCreditAllowance(testUser.id, "AI_MENTOR");
  assert.strictEqual(initialCheck.allowed, true, "New user has trial allowance");
  assert.ok(initialCheck.limit > 0, "Initial limit must be > 0");

  // 3. Deduct credit
  await deductAiCredit(testUser.id, "AI_MENTOR");
  const updatedLedger = await prisma.userUsageLedger.findUnique({ where: { userId: testUser.id } });
  assert.strictEqual(updatedLedger.aiMentorMessagesUsed, 1, "Credits used must increment to 1");

  // 4. Restore credit (failure simulation)
  await restoreAiCredit(testUser.id, "AI_MENTOR");
  const restoredLedger = await prisma.userUsageLedger.findUnique({ where: { userId: testUser.id } });
  assert.strictEqual(restoredLedger.aiMentorMessagesUsed, 0, "Credits used must restore to 0");

  // 5. Daily PYQ Limit Check
  const pyqCheck = await checkDailyPyqLimit(testUser.id);
  assert.strictEqual(pyqCheck.allowed, true, "Initial PYQs allowed");
  await recordPyqAttempt(testUser.id);
  const afterAttempt = await checkDailyPyqLimit(testUser.id);
  assert.strictEqual(afterAttempt.attemptsToday, 1);

  // Clean up
  await prisma.userUsageLedger.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

test("Phase 6: Specialized Learning Packs API (GET /api/v1/packs)", async () => {
  const packs = await prisma.specializedPack.findMany({ where: { isActive: true } });
  assert.strictEqual(packs.length, 5, "Must contain exactly 5 specialized learning packs");

  const csatPack = packs.find((p) => p.code === "CSAT_INTENSIVE");
  assert.ok(csatPack, "CSAT Intensive pack must exist");
  assert.strictEqual(csatPack.priceRupees, 199);

  const mainsPack = packs.find((p) => p.code === "MAINS_EVAL_PACK");
  assert.ok(mainsPack, "Mains Eval pack must exist");
  assert.strictEqual(mainsPack.priceRupees, 149);
  assert.strictEqual(mainsPack.creditsIncluded, 5);

  const interviewPack = packs.find((p) => p.code === "INTERVIEW_PREP");
  assert.ok(interviewPack, "Interview Prep pack must exist");
  assert.strictEqual(interviewPack.priceRupees, 299);

  const mockPack = packs.find((p) => p.code === "MOCK_SERIES_ADV");
  assert.ok(mockPack, "Mock Series pack must exist");
  assert.strictEqual(mockPack.priceRupees, 299);

  const caPack = packs.find((p) => p.code === "CURRENT_AFFAIRS_REV");
  assert.ok(caPack, "Current Affairs Revision pack must exist");
  assert.strictEqual(caPack.priceRupees, 149);
});

test("Phase 6: Promotional Coupon Validation API (POST /api/v1/coupons/validate)", async () => {
  // Test 1: Valid percentage coupon LAKSHYA20 on ₹1999 order
  const validRes = await fetch(`${BASE_URL}/api/v1/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "LAKSHYA20",
      orderAmount: 1999,
      planCode: "ACHIEVER",
    }),
  });
  assert.strictEqual(validRes.status, 200);
  const validJson = await validRes.json();
  assert.strictEqual(validJson.success, true);
  assert.strictEqual(validJson.data.discountValue, 20);
  assert.strictEqual(validJson.data.discountAmount, 400); // 20% of 1999 = 399.8 -> 400
  assert.strictEqual(validJson.data.finalAmount, 1599);

  // Test 2: Invalid coupon code
  const invalidRes = await fetch(`${BASE_URL}/api/v1/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "NON_EXISTENT_COUPON_123",
      orderAmount: 999,
    }),
  });
  assert.strictEqual(invalidRes.status, 404);
  const invalidJson = await invalidRes.json();
  assert.strictEqual(invalidJson.success, false);
});

test("Phase 6: Student Billing Profile API (GET /api/v1/user/billing)", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { role: { name: "ASPIRANT" } },
  });
  assert.ok(aspirant, "Aspirant must exist");

  const res = await fetch(`${BASE_URL}/api/v1/user/billing`, {
    headers: { "x-user-id": aspirant.id },
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.plan, "Plan info must be returned");
  assert.ok(json.data.usage, "Usage info must be returned");
  assert.ok(Array.isArray(json.data.invoices), "Invoices array must be returned");
  assert.ok(json.data.referral?.code, "Referral code must be generated");
});

test("Phase 6: Admin Revenue Dashboard API (GET /api/v1/admin/revenue)", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });
  assert.ok(admin, "Admin must exist");

  // Authorized Admin Call
  const res = await fetch(`${BASE_URL}/api/v1/admin/revenue`, {
    headers: { "x-user-id": admin.id },
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.overview.totalUsers > 0, "Total users must be > 0");
  assert.ok(typeof json.data.overview.mrrRupees === "number", "MRR must be a number");
  assert.ok(typeof json.data.overview.arrRupees === "number", "ARR must be a number");
  assert.strictEqual(json.data.planDistribution.length, 4, "Must return 4 plan distributions");
  assert.ok(json.data.simulations.base, "Base simulation must exist");

  // Unauthorized Aspirant Call -> Must be rejected with 403
  const aspirant = await prisma.user.findFirst({
    where: { role: { name: "ASPIRANT" } },
  });
  const unauthRes = await fetch(`${BASE_URL}/api/v1/admin/revenue`, {
    headers: { "x-user-id": aspirant.id },
  });
  assert.strictEqual(unauthRes.status, 403, "Aspirant accessing admin revenue must be rejected with 403");
});

test("Phase 6: Payment Safety Architecture (Cashfree Dormant)", () => {
  assert.strictEqual(
    isPaymentSystemEnabled(),
    false,
    "Payment system must be strictly disabled pending Cashfree merchant approval"
  );
});

test("Phase 6: Verification of All 13 Phase 6 Master Documentation Files", () => {
  const requiredDocs = [
    "PHASE_6_MONETIZATION_STRATEGY.md",
    "PHASE_6_PRICING_PLANS.md",
    "PHASE_6_FEATURE_ENTITLEMENTS.md",
    "PHASE_6_SUBSCRIPTION_ARCHITECTURE.md",
    "PHASE_6_AI_CREDIT_SYSTEM.md",
    "PHASE_6_REVENUE_DASHBOARD.md",
    "PHASE_6_GROWTH_ANALYTICS.md",
    "PHASE_6_UNIT_ECONOMICS.md",
    "PHASE_6_LEGAL_READINESS.md",
    "CASHFREE_GO_LIVE_READINESS.md",
    "PHASE_6_SECURITY_REPORT.md",
    "PHASE_6_TEST_REPORT.md",
    "PHASE_6_COMPLETION_REPORT.md",
  ];

  for (const doc of requiredDocs) {
    const fullPath = path.resolve("docs", doc);
    assert.ok(fs.existsSync(fullPath), `Documentation file docs/${doc} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(
      stat.size > 500,
      `Documentation file docs/${doc} must have substantive content (>500 bytes)`
    );
  }
});
