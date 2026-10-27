import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Pravaah UPSC Plans, Pricing & Entitlements...");

  // 1. Feature Entitlements
  const entitlements = [
    {
      featureCode: "TIMED_EXAMS",
      name: "Timed Examination Simulator",
      description: "Access to 2-hour authentic UPSC CSE examination player with strict negative marking",
      minTier: 2, // Achiever
    },
    {
      featureCode: "ADVANCED_ANALYTICS",
      name: "Diagnostic Weakness Detector",
      description: "Granular subject accuracy breakdown and automated weak topic identification (<60%)",
      minTier: 2, // Achiever
    },
    {
      featureCode: "UNLIMITED_BOOKMARKS",
      name: "Unlimited Bookmarks",
      description: "Save unlimited questions for high-priority revision without quota limits",
      minTier: 2, // Achiever
    },
    {
      featureCode: "UNLIMITED_NOTES",
      name: "Unlimited Study Notes",
      description: "Maintain comprehensive textbook cross-references on questions",
      minTier: 2, // Achiever
    },
    {
      featureCode: "PRIORITY_ACCESS",
      name: "Priority Access & Verification Audit",
      description: "Priority access to freshly verified paper releases and coverage reports",
      minTier: 3, // Scholar
    },
  ];

  for (const ent of entitlements) {
    await prisma.featureEntitlement.upsert({
      where: { featureCode: ent.featureCode },
      update: { name: ent.name, description: ent.description, minTier: ent.minTier },
      create: ent,
    });
  }

  // 2. Plans & Features
  const plansData = [
    {
      code: "FREE",
      name: "Aspirant Foundation",
      tagline: "Essential UPSC PYQ practice with official answer keys",
      tier: 0,
      isPopular: false,
      orderIndex: 1,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 0, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 0, discountPercent: 0 },
        { billingInterval: "ANNUAL", amountRupees: 0, discountPercent: 0 },
      ],
      features: [
        { featureCode: "PYQ_BROWSE", featureName: "Browse official UPSC CSE PYQs (GS1 & CSAT)", isIncluded: true, limitValue: null },
        { featureCode: "LEARN_SOLVE", featureName: "Interactive Learn Mode with instant feedback", isIncluded: true, limitValue: null },
        { featureCode: "EXPLANATIONS", featureName: "Core concept summaries and official answer keys", isIncluded: true, limitValue: null },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Personal bookmarks quota", isIncluded: true, limitValue: 5 },
        { featureCode: "NOTES_LIMIT", featureName: "Private study notes quota", isIncluded: true, limitValue: 3 },
        { featureCode: "TIMED_EXAMS", featureName: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Syllabus weakness diagnostic detector", isIncluded: false, limitValue: null },
        { featureCode: "MISTAKE_REVISION", featureName: "Automated spaced mistake queue", isIncluded: false, limitValue: null },
      ],
    },
    {
      code: "BEGINNER",
      name: "Syllabus Sprint",
      tagline: "Focused subject-wise practice for foundation building",
      tier: 1,
      isPopular: false,
      orderIndex: 2,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 399, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 999, discountPercent: 16 },
        { billingInterval: "ANNUAL", amountRupees: 2999, discountPercent: 37 },
      ],
      features: [
        { featureCode: "PYQ_BROWSE", featureName: "Browse official UPSC CSE PYQs (GS1 & CSAT)", isIncluded: true, limitValue: null },
        { featureCode: "LEARN_SOLVE", featureName: "Interactive Learn Mode with instant feedback", isIncluded: true, limitValue: null },
        { featureCode: "EXPLANATIONS", featureName: "Detailed pedagogical explanations & elimination notes", isIncluded: true, limitValue: null },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Personal bookmarks allowance", isIncluded: true, limitValue: 50 },
        { featureCode: "NOTES_LIMIT", featureName: "Private study notes allowance", isIncluded: true, limitValue: 50 },
        { featureCode: "TIMED_EXAMS", featureName: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Basic subject accuracy breakdown", isIncluded: true, limitValue: null },
        { featureCode: "MISTAKE_REVISION", featureName: "Mistake review list", isIncluded: true, limitValue: null },
      ],
    },
    {
      code: "ACHIEVER",
      name: "Prelims Pro",
      tagline: "Complete examination simulator with authentic UPSC scoring",
      tier: 2,
      isPopular: true,
      orderIndex: 3,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 799, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 1899, discountPercent: 20 },
        { billingInterval: "ANNUAL", amountRupees: 5499, discountPercent: 42 },
      ],
      features: [
        { featureCode: "PYQ_BROWSE", featureName: "Complete historical UPSC PYQ library (GS1 & CSAT)", isIncluded: true, limitValue: null },
        { featureCode: "LEARN_SOLVE", featureName: "Unlimited Learn Mode with confidence tracking", isIncluded: true, limitValue: null },
        { featureCode: "EXPLANATIONS", featureName: "Full pedagogical explanations, elimination & source citations", isIncluded: true, limitValue: null },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Unlimited bookmarks with custom tags", isIncluded: true, limitValue: null },
        { featureCode: "NOTES_LIMIT", featureName: "Unlimited private study notes", isIncluded: true, limitValue: null },
        { featureCode: "TIMED_EXAMS", featureName: "Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)", isIncluded: true, limitValue: null },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Diagnostic Weak Topic Detector (<60% accuracy threshold)", isIncluded: true, limitValue: null },
        { featureCode: "MISTAKE_REVISION", featureName: "Automated Spaced Mistake Repetition Engine", isIncluded: true, limitValue: null },
      ],
    },
    {
      code: "SCHOLAR",
      name: "Ranker Suite",
      tagline: "For comprehensive multi-year revision and mock test mastery",
      tier: 3,
      isPopular: false,
      orderIndex: 4,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 1299, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 2999, discountPercent: 23 },
        { billingInterval: "ANNUAL", amountRupees: 8999, discountPercent: 42 },
      ],
      features: [
        { featureCode: "PYQ_BROWSE", featureName: "Complete historical UPSC PYQ library (GS1 & CSAT)", isIncluded: true, limitValue: null },
        { featureCode: "LEARN_SOLVE", featureName: "Unlimited Learn Mode with confidence tracking", isIncluded: true, limitValue: null },
        { featureCode: "EXPLANATIONS", featureName: "Full pedagogical explanations, elimination & source citations", isIncluded: true, limitValue: null },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Unlimited bookmarks with export capabilities", isIncluded: true, limitValue: null },
        { featureCode: "NOTES_LIMIT", featureName: "Unlimited study notes with PDF syllabus linking", isIncluded: true, limitValue: null },
        { featureCode: "TIMED_EXAMS", featureName: "Unlimited Full Exam Simulations & custom topic mocks", isIncluded: true, limitValue: null },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Comprehensive telemetry, time-per-question curve & weak topics", isIncluded: true, limitValue: null },
        { featureCode: "MISTAKE_REVISION", featureName: "Automated Spaced Mistake Repetition Engine", isIncluded: true, limitValue: null },
        { featureCode: "PRIORITY_ACCESS", featureName: "Priority question bank coverage updates & editorial reviews", isIncluded: true, limitValue: null },
      ],
    },
  ];

  for (const p of plansData) {
    const plan = await prisma.plan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        tagline: p.tagline,
        tier: p.tier,
        isPopular: p.isPopular,
        orderIndex: p.orderIndex,
        isActive: true,
      },
      create: {
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        tier: p.tier,
        isPopular: p.isPopular,
        orderIndex: p.orderIndex,
        isActive: true,
      },
    });

    // Prices
    for (const pr of p.prices) {
      await prisma.planPrice.upsert({
        where: {
          planId_billingInterval: {
            planId: plan.id,
            billingInterval: pr.billingInterval,
          },
        },
        update: {
          amountRupees: pr.amountRupees,
          discountPercent: pr.discountPercent,
          isActive: true,
        },
        create: {
          planId: plan.id,
          billingInterval: pr.billingInterval,
          amountRupees: pr.amountRupees,
          discountPercent: pr.discountPercent,
          isActive: true,
        },
      });
    }

    // Features
    for (const f of p.features) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureCode: {
            planId: plan.id,
            featureCode: f.featureCode,
          },
        },
        update: {
          featureName: f.featureName,
          isIncluded: f.isIncluded,
          limitValue: f.limitValue,
        },
        create: {
          planId: plan.id,
          featureCode: f.featureCode,
          featureName: f.featureName,
          isIncluded: f.isIncluded,
          limitValue: f.limitValue,
        },
      });
    }
  }

  // 3. Ensure Demo Aspirant has an active subscription to ACHIEVER (Prelims Pro)
  const aspirant = await prisma.user.findUnique({
    where: { email: "aspirant@pravaah.in" },
  });

  const achieverPlan = await prisma.plan.findUnique({
    where: { code: "ACHIEVER" },
  });

  if (aspirant && achieverPlan) {
    const existingSub = await prisma.subscription.findFirst({
      where: { userId: aspirant.id, status: "ACTIVE" },
    });

    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          userId: aspirant.id,
          planId: achieverPlan.id,
          billingInterval: "ANNUAL",
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
          cancelAtPeriodEnd: false,
          providerSubId: "sub_demo_aspirant_achiever",
        },
      });
      console.log("✅ Seeded active Achiever subscription for aspirant@pravaah.in");
    }
  }

  console.log("✅ Billing seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
