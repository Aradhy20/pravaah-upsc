import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: { isActive: true },
        },
        features: {
          orderBy: { featureCode: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const formatted = plans.map((p) => {
      const priceMap: Record<string, { amount: number; discountPercent: number }> = {};
      p.prices.forEach((pr) => {
        priceMap[pr.billingInterval] = {
          amount: pr.amountRupees,
          discountPercent: pr.discountPercent,
        };
      });

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        tier: p.tier,
        isPopular: p.isPopular,
        prices: priceMap,
        features: p.features.map((f) => ({
          code: f.featureCode,
          name: f.featureName,
          isIncluded: f.isIncluded,
          limitValue: f.limitValue,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted.length > 0 ? formatted : FALLBACK_PLANS,
    });
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/plans:", error.message);
    return NextResponse.json({
      success: true,
      data: FALLBACK_PLANS,
    });
  }
}

const FALLBACK_PLANS = [
  {
    id: "plan_free",
    code: "FREE",
    name: "Aspirant Foundation",
    tagline: "Essential UPSC PYQ practice with official answer keys",
    tier: 0,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 0, discountPercent: 0 },
      QUARTERLY: { amount: 0, discountPercent: 0 },
      ANNUAL: { amount: 0, discountPercent: 0 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "1995-2024 Prelims PYQs", isIncluded: true, limitValue: null },
      { code: "COMMUNITY_ACCESS", name: "Community Forum", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_beginner",
    code: "BEGINNER",
    name: "Syllabus Sprint",
    tagline: "Focused subject-wise practice for foundation building",
    tier: 1,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 399, discountPercent: 0 },
      QUARTERLY: { amount: 999, discountPercent: 16 },
      ANNUAL: { amount: 2999, discountPercent: 37 },
    },
    features: [
      { code: "UNLIMITED_PYQ", name: "Unlimited Concept Search & Focus Mode", isIncluded: true, limitValue: null },
      { code: "NCERT_INTEGRATION", name: "NCERT Chapter Linkages", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_achiever",
    code: "ACHIEVER",
    name: "Prelims Pro",
    tagline: "Complete examination simulator with authentic UPSC scoring",
    tier: 2,
    isPopular: true,
    prices: {
      MONTHLY: { amount: 799, discountPercent: 0 },
      QUARTERLY: { amount: 1899, discountPercent: 20 },
      ANNUAL: { amount: 5499, discountPercent: 42 },
    },
    features: [
      { code: "ALL_PRELIMS", name: "All Prelims GS1 + GS2 (CSAT)", isIncluded: true, limitValue: null },
      { code: "TIMED_SIMULATOR", name: "Timed Examination Simulator", isIncluded: true, limitValue: null },
      { code: "ELIMINATION_AI", name: "Smart Elimination Techniques", isIncluded: true, limitValue: null },
      { code: "TOPPER_COPIES", name: "Topper Answer Copies", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_scholar",
    code: "SCHOLAR",
    name: "Ranker Suite",
    tagline: "For comprehensive multi-year revision and mock test mastery",
    tier: 3,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 1299, discountPercent: 0 },
      QUARTERLY: { amount: 2999, discountPercent: 23 },
      ANNUAL: { amount: 8999, discountPercent: 42 },
    },
    features: [
      { code: "ALL_FEATURES", name: "All Features + AI Mentorship", isIncluded: true, limitValue: null },
      { code: "MAINS_EVAL", name: "Mains Answer Evaluation", isIncluded: true, limitValue: null },
      { code: "VIDEO_ACADEMY", name: "Video Academy Access", isIncluded: true, limitValue: null },
    ],
  },
];
