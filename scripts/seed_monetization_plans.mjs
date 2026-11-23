/**
 * PRAVAAH UPSC — Phase 6 Monetization & Subscription Seeder
 * Seeds the 4 canonical subscription tiers, specialized learning packs,
 * and promotional coupons.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Phase 6 Monetization Plans, Packs & Coupons...");

  // 1. Core Plans Definition
  const plans = [
    {
      code: "FREE",
      name: "Free Aspirant",
      tagline: "Essential UPSC PYQ practice with official answer keys",
      tier: 0,
      orderIndex: 1,
      isPopular: false,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 0, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 0, discountPercent: 0 },
        { billingInterval: "ANNUAL", amountRupees: 0, discountPercent: 0 },
      ],
      features: [
        { featureCode: "PYQ_PRACTICE", featureName: "Daily PYQ practice allowance", limitValue: 15, isIncluded: true },
        { featureCode: "EXPLANATIONS", featureName: "Basic verified explanations & official key", limitValue: null, isIncluded: true },
        { featureCode: "SYLLABUS_MAP", featureName: "Basic syllabus explorer", limitValue: null, isIncluded: true },
        { featureCode: "DAILY_QUIZ", featureName: "Daily 5-question Prelims quiz", limitValue: null, isIncluded: true },
        { featureCode: "STUDY_PLANNER", featureName: "Basic study planner", limitValue: null, isIncluded: true },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Personal bookmarks allowance", limitValue: 5, isIncluded: true },
        { featureCode: "NOTES_LIMIT", featureName: "Private study notes allowance", limitValue: 3, isIncluded: true },
        { featureCode: "TIMED_EXAMS", featureName: "Timed 2-Hour Examination Simulator", limitValue: null, isIncluded: false },
        { featureCode: "AI_MENTOR", featureName: "Pravaah AI Personal Mentor", limitValue: 0, isIncluded: false },
        { featureCode: "MAINS_EVALUATION", featureName: "Mains answer evaluation credits", limitValue: 0, isIncluded: false },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Prelims Readiness Analytics", limitValue: null, isIncluded: false },
        { featureCode: "PRIORITY_SUPPORT", featureName: "Priority support desk", limitValue: null, isIncluded: false },
      ],
    },
    {
      code: "BEGINNER", // Also aliased as PLUS
      name: "Aspirant Plus",
      tagline: "Structured practice, verified explanations and smart revision",
      tier: 1,
      orderIndex: 2,
      isPopular: false,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 149, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 399, discountPercent: 11 },
        { billingInterval: "ANNUAL", amountRupees: 999, discountPercent: 44 },
      ],
      features: [
        { featureCode: "PYQ_PRACTICE", featureName: "Expanded daily PYQ practice", limitValue: 50, isIncluded: true },
        { featureCode: "EXPLANATIONS", featureName: "Detailed pedagogical explanations & elimination notes", limitValue: null, isIncluded: true },
        { featureCode: "ADVANCED_ANALYTICS", featureName: "Subject-wise performance analytics", limitValue: null, isIncluded: true },
        { featureCode: "MISTAKE_REVISION", featureName: "Mistake Notebook & Spaced Repetition", limitValue: null, isIncluded: true },
        { featureCode: "STUDY_PLANNER", featureName: "Full study planner with target tracking", limitValue: null, isIncluded: true },
        { featureCode: "CSAT_COACH", featureName: "Basic CSAT section drills", limitValue: null, isIncluded: true },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Personal bookmarks allowance", limitValue: 50, isIncluded: true },
        { featureCode: "NOTES_LIMIT", featureName: "Private study notes allowance", limitValue: 50, isIncluded: true },
        { featureCode: "TIMED_EXAMS", featureName: "Timed 2-Hour Examination Simulator", limitValue: null, isIncluded: true },
        { featureCode: "AI_MENTOR", featureName: "Pravaah AI Personal Mentor", limitValue: 0, isIncluded: false },
        { featureCode: "MAINS_EVALUATION", featureName: "Mains answer evaluation credits", limitValue: 0, isIncluded: false },
        { featureCode: "PRIORITY_SUPPORT", featureName: "Priority support desk", limitValue: null, isIncluded: false },
      ],
    },
    {
      code: "ACHIEVER", // Also aliased as PRO (Flagship)
      name: "Aspirant Pro",
      tagline: "AI Personal Mentor, Mission Control, Syllabus Map and Mains Evaluation",
      tier: 2,
      orderIndex: 3,
      isPopular: true,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 299, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 799, discountPercent: 11 },
        { billingInterval: "ANNUAL", amountRupees: 1999, discountPercent: 44 },
      ],
      features: [
        { featureCode: "PYQ_PRACTICE", featureName: "Unlimited PYQ catalog practice", limitValue: null, isIncluded: true },
        { featureCode: "EXPLANATIONS", featureName: "Full verified explanations with primary sources", limitValue: null, isIncluded: true },
        { featureCode: "AI_MENTOR", featureName: "Pravaah AI Personal Mentor (100 messages/mo)", limitValue: 100, isIncluded: true },
        { featureCode: "MISSION_CONTROL", featureName: "Pravaah Mission Control daily cockpit", limitValue: null, isIncluded: true },
        { featureCode: "SYLLABUS_MAP", featureName: "Syllabus Intelligence Map with micro-nodes", limitValue: null, isIncluded: true },
        { featureCode: "PRELIMS_READINESS", featureName: "Prelims Readiness Analytics (0-100 index)", limitValue: null, isIncluded: true },
        { featureCode: "MAINS_EVALUATION", featureName: "Mains answer evaluations (5 credits/mo)", limitValue: 5, isIncluded: true },
        { featureCode: "CSAT_COACH", featureName: "CSAT Survival Coach & speed drills", limitValue: null, isIncluded: true },
        { featureCode: "MISTAKE_REVISION", featureName: "SuperMemo-2 Spaced Repetition engine", limitValue: null, isIncluded: true },
        { featureCode: "TIMED_EXAMS", featureName: "Unlimited Full Exam Simulations", limitValue: null, isIncluded: true },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Unlimited bookmarks with custom tags", limitValue: null, isIncluded: true },
        { featureCode: "NOTES_LIMIT", featureName: "Unlimited private study notes", limitValue: null, isIncluded: true },
        { featureCode: "PRIORITY_SUPPORT", featureName: "Priority support desk", limitValue: null, isIncluded: false },
      ],
    },
    {
      code: "SCHOLAR", // Also aliased as ELITE
      name: "Aspirant Elite",
      tagline: "Higher AI mentor allowance, deep diagnostics and priority support",
      tier: 3,
      orderIndex: 4,
      isPopular: false,
      prices: [
        { billingInterval: "MONTHLY", amountRupees: 499, discountPercent: 0 },
        { billingInterval: "QUARTERLY", amountRupees: 1299, discountPercent: 13 },
        { billingInterval: "ANNUAL", amountRupees: 3499, discountPercent: 41 },
      ],
      features: [
        { featureCode: "PYQ_PRACTICE", featureName: "Unlimited PYQ catalog practice", limitValue: null, isIncluded: true },
        { featureCode: "EXPLANATIONS", featureName: "Full verified explanations with primary sources", limitValue: null, isIncluded: true },
        { featureCode: "AI_MENTOR", featureName: "Pravaah AI Personal Mentor (300 messages/mo)", limitValue: 300, isIncluded: true },
        { featureCode: "MISSION_CONTROL", featureName: "Pravaah Mission Control daily cockpit", limitValue: null, isIncluded: true },
        { featureCode: "SYLLABUS_MAP", featureName: "Syllabus Intelligence Map with micro-nodes", limitValue: null, isIncluded: true },
        { featureCode: "PRELIMS_READINESS", featureName: "Advanced personalized diagnostic reports", limitValue: null, isIncluded: true },
        { featureCode: "MAINS_EVALUATION", featureName: "Mains answer evaluations (15 credits/mo)", limitValue: 15, isIncluded: true },
        { featureCode: "CSAT_COACH", featureName: "Advanced CSAT diagnostics & strategy", limitValue: null, isIncluded: true },
        { featureCode: "CURRENT_AFFAIRS", featureName: "Current Affairs exam converter packages", limitValue: null, isIncluded: true },
        { featureCode: "TIMED_EXAMS", featureName: "Unlimited Full Exam Simulations & mocks", limitValue: null, isIncluded: true },
        { featureCode: "BOOKMARKS_LIMIT", featureName: "Unlimited bookmarks with export", limitValue: null, isIncluded: true },
        { featureCode: "NOTES_LIMIT", featureName: "Unlimited notes with syllabus linking", limitValue: null, isIncluded: true },
        { featureCode: "PRIORITY_SUPPORT", featureName: "Direct priority support desk & WhatsApp SLA", limitValue: null, isIncluded: true },
      ],
    },
  ];

  for (const p of plans) {
    const upsertedPlan = await prisma.plan.upsert({
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

    // Upsert prices
    for (const pr of p.prices) {
      await prisma.planPrice.upsert({
        where: {
          planId_billingInterval: {
            planId: upsertedPlan.id,
            billingInterval: pr.billingInterval,
          },
        },
        update: {
          amountRupees: pr.amountRupees,
          discountPercent: pr.discountPercent,
          isActive: true,
        },
        create: {
          planId: upsertedPlan.id,
          billingInterval: pr.billingInterval,
          amountRupees: pr.amountRupees,
          discountPercent: pr.discountPercent,
          isActive: true,
        },
      });
    }

    // Upsert features
    for (const f of p.features) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureCode: {
            planId: upsertedPlan.id,
            featureCode: f.featureCode,
          },
        },
        update: {
          featureName: f.featureName,
          limitValue: f.limitValue,
          isIncluded: f.isIncluded,
        },
        create: {
          planId: upsertedPlan.id,
          featureCode: f.featureCode,
          featureName: f.featureName,
          limitValue: f.limitValue,
          isIncluded: f.isIncluded,
        },
      });
    }
    console.log(`✅ Upserted plan: ${p.name} (${p.code}) with ${p.prices.length} price tiers`);
  }

  // 2. Specialized Learning Packs
  const packs = [
    {
      code: "CSAT_INTENSIVE",
      name: "CSAT Intensive Practice Pack",
      nameHi: "सीएसैट गहन अभ्यास पैक",
      tagline: "500+ curated quantitative, reasoning and reading comprehension drills",
      category: "CSAT",
      priceRupees: 199,
      creditsIncluded: 0,
      validityDays: 365,
      featuresJson: JSON.stringify([
        "25 Speed Drills with live pacing telemetry",
        "Number systems and divisibility masterclass sets",
        "Passage crux and assumption deconstruction drills",
        "Full CSAT mock series with negative marking analysis"
      ]),
    },
    {
      code: "MAINS_EVAL_PACK",
      name: "Mains Answer Evaluation Pack (5 Answers)",
      nameHi: "मुख्य परीक्षा उत्तर मूल्यांकन पैक (5 उत्तर)",
      tagline: "5 comprehensive answer evaluations with multi-dimensional rubrics",
      category: "MAINS",
      priceRupees: 149,
      creditsIncluded: 5,
      validityDays: 180,
      featuresJson: JSON.stringify([
        "5 detailed answer evaluations across GS1-GS4",
        "Scoring across Demand, Content, Structure, Presentation",
        "Side-by-side comparison with curated model answers",
        "Actionable feedback and value addition citations"
      ]),
    },
    {
      code: "INTERVIEW_PREP",
      name: "UPSC Interview Preparation Pack",
      nameHi: "साक्षात्कार मार्गदर्शन एवं डीएएफ पैक",
      tagline: "Candidate-reported transcripts, situational drills, and DAF analysis",
      category: "INTERVIEW",
      priceRupees: 299,
      creditsIncluded: 0,
      validityDays: 365,
      featuresJson: JSON.stringify([
        "100+ Candidate-reported interview transcripts by board",
        "Situational administrative crisis drills & frameworks",
        "DAF home state, hobby, and education questions mapping",
        "Board-specific perspective and civil service response guides"
      ]),
    },
    {
      code: "MOCK_SERIES_ADV",
      name: "Advanced Mock Test Series (10 Full Mocks)",
      nameHi: "उन्नत मॉक टेस्ट सीरीज़ (10 टेस्ट)",
      tagline: "10 high-fidelity full-length Prelims simulations with rank analytics",
      category: "MOCK",
      priceRupees: 299,
      creditsIncluded: 0,
      validityDays: 365,
      featuresJson: JSON.stringify([
        "10 Full 2-Hour Timed GS1 & CSAT Exam Simulations",
        "UPSC negative marking (+2.0 / -0.666 & +2.5 / -0.833)",
        "Time-per-question curve & elimination trap diagnostics",
        "Readiness index impact and percentile comparisons"
      ]),
    },
    {
      code: "CURRENT_AFFAIRS_REV",
      name: "Current Affairs Revision Pack",
      nameHi: "समसामयिकी रिवीजन एवं पीवाईक्यू लिंक पैक",
      tagline: "Daily news to static syllabus bridges with PIB provenance",
      category: "CURRENT_AFFAIRS",
      priceRupees: 149,
      creditsIncluded: 0,
      validityDays: 180,
      featuresJson: JSON.stringify([
        "PIB, Gazette, and Supreme Court ruling summaries",
        "Static-dynamic conceptual bridges with textbook chapters",
        "Prelims statement-based drills generated from weekly news",
        "Mains quote bank and committee report summaries"
      ]),
    },
  ];

  for (const pack of packs) {
    await prisma.specializedPack.upsert({
      where: { code: pack.code },
      update: {
        name: pack.name,
        nameHi: pack.nameHi,
        tagline: pack.tagline,
        category: pack.category,
        priceRupees: pack.priceRupees,
        featuresJson: pack.featuresJson,
        creditsIncluded: pack.creditsIncluded,
        validityDays: pack.validityDays,
        isActive: true,
      },
      create: pack,
    });
    console.log(`✅ Upserted specialized pack: ${pack.name} (₹${pack.priceRupees})`);
  }

  // 3. Promotional Coupons
  const coupons = [
    {
      code: "LAKSHYA20",
      description: "Launch celebration discount: 20% off on all paid plans",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxRedemptions: 500,
      validFrom: new Date(),
      validUntil: new Date("2027-12-31T23:59:59Z"),
      eligiblePlans: "BEGINNER,ACHIEVER,SCHOLAR,PLUS,PRO,ELITE",
      minOrderValue: 100,
      isActive: true,
    },
    {
      code: "PRAVAAH100",
      description: "Flat ₹100 discount on Aspirant Pro and Aspirant Elite plans",
      discountType: "FIXED",
      discountValue: 100,
      maxRedemptions: 200,
      validFrom: new Date(),
      validUntil: new Date("2027-12-31T23:59:59Z"),
      eligiblePlans: "ACHIEVER,SCHOLAR,PRO,ELITE",
      minOrderValue: 250,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        maxRedemptions: c.maxRedemptions,
        validFrom: c.validFrom,
        validUntil: c.validUntil,
        eligiblePlans: c.eligiblePlans,
        minOrderValue: c.minOrderValue,
        isActive: true,
      },
      create: c,
    });
    console.log(`✅ Upserted coupon: ${c.code}`);
  }

  console.log("🎉 Phase 6 Monetization Seeding Complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
