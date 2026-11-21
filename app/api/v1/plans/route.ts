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
    tagline: "Start your UPSC CSE journey with essential PYQ practice",
    tier: "FREE",
    isPopular: false,
    prices: { MONTHLY: { amount: 0, discountPercent: 0 } },
    features: [
      { code: "PYQ_PRACTICE", name: "1995-2024 Prelims PYQs", isIncluded: true, limitValue: null },
      { code: "COMMUNITY_ACCESS", name: "Community Forum", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_beginner",
    code: "BEGINNER",
    name: "Syllabus Sprint",
    tagline: "Subject-wise mastery with timed practice modes",
    tier: "BEGINNER",
    isPopular: false,
    prices: { MONTHLY: { amount: 499, discountPercent: 0 } },
    features: [
      { code: "UNLIMITED_PYQ", name: "Unlimited Concept Search & Focus Mode", isIncluded: true, limitValue: null },
      { code: "NCERT_INTEGRATION", name: "NCERT Chapter Linkages", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_achiever",
    code: "ACHIEVER",
    name: "Prelims Pro",
    tagline: "Intelligent analytics, elimination techniques & CSAT",
    tier: "ACHIEVER",
    isPopular: true,
    prices: { MONTHLY: { amount: 999, discountPercent: 10 } },
    features: [
      { code: "ALL_PRELIMS", name: "All Prelims GS1 + GS2 (CSAT)", isIncluded: true, limitValue: null },
      { code: "ELIMINATION_AI", name: "Smart Elimination Techniques", isIncluded: true, limitValue: null },
      { code: "TOPPER_COPIES", name: "Topper Answer Copies", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_scholar",
    code: "SCHOLAR",
    name: "Ranker Suite",
    tagline: "End-to-end Prelims, Mains and AI Mentorship",
    tier: "SCHOLAR",
    isPopular: false,
    prices: { MONTHLY: { amount: 1999, discountPercent: 20 } },
    features: [
      { code: "ALL_FEATURES", name: "All Features + AI Mentorship", isIncluded: true, limitValue: null },
      { code: "MAINS_EVAL", name: "Mains Answer Evaluation", isIncluded: true, limitValue: null },
      { code: "VIDEO_ACADEMY", name: "Video Academy Access", isIncluded: true, limitValue: null },
    ],
  },
];
