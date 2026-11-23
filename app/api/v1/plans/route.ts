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
      { code: "PYQ_BROWSE", name: "Browse official UPSC CSE PYQs (GS1 & CSAT)", isIncluded: true, limitValue: null },
      { code: "LEARN_SOLVE", name: "Interactive Learn Mode with instant feedback", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Core concept summaries and official answer keys", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks quota", isIncluded: true, limitValue: 5 },
      { code: "NOTES_LIMIT", name: "Private study notes quota", isIncluded: true, limitValue: 3 },
      { code: "ADVANCED_ANALYTICS", name: "Syllabus weakness diagnostic detector", isIncluded: false, limitValue: null },
      { code: "MISTAKE_REVISION", name: "Automated spaced mistake queue", isIncluded: false, limitValue: null },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
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
      { code: "PYQ_BROWSE", name: "Browse official UPSC CSE PYQs (GS1 & CSAT)", isIncluded: true, limitValue: null },
      { code: "LEARN_SOLVE", name: "Interactive Learn Mode with instant feedback", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Detailed pedagogical explanations & elimination notes", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks allowance", isIncluded: true, limitValue: 50 },
      { code: "NOTES_LIMIT", name: "Private study notes allowance", isIncluded: true, limitValue: 50 },
      { code: "ADVANCED_ANALYTICS", name: "Basic subject accuracy breakdown", isIncluded: true, limitValue: null },
      { code: "MISTAKE_REVISION", name: "Mistake review list", isIncluded: true, limitValue: null },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
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
      { code: "PYQ_BROWSE", name: "Complete historical UPSC PYQ library (GS1 & CSAT)", isIncluded: true, limitValue: null },
      { code: "LEARN_SOLVE", name: "Unlimited Learn Mode with confidence tracking", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Full pedagogical explanations, elimination & source citations", isIncluded: true, limitValue: null },
      { code: "TIMED_EXAMS", name: "Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)", isIncluded: true, limitValue: null },
      { code: "ADVANCED_ANALYTICS", name: "Diagnostic Weak Topic Detector (<60% accuracy threshold)", isIncluded: true, limitValue: null },
      { code: "MISTAKE_REVISION", name: "Automated Spaced Mistake Repetition Engine", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Unlimited bookmarks with custom tags", isIncluded: true, limitValue: null },
      { code: "NOTES_LIMIT", name: "Unlimited private study notes", isIncluded: true, limitValue: null },
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
      { code: "PYQ_BROWSE", name: "Complete historical UPSC PYQ library (GS1 & CSAT)", isIncluded: true, limitValue: null },
      { code: "LEARN_SOLVE", name: "Unlimited Learn Mode with confidence tracking", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Full pedagogical explanations, elimination & source citations", isIncluded: true, limitValue: null },
      { code: "TIMED_EXAMS", name: "Unlimited Full Exam Simulations & custom topic mocks", isIncluded: true, limitValue: null },
      { code: "ADVANCED_ANALYTICS", name: "Comprehensive telemetry, time-per-question curve & weak topics", isIncluded: true, limitValue: null },
      { code: "MISTAKE_REVISION", name: "Automated Spaced Mistake Repetition Engine", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Unlimited bookmarks with export capabilities", isIncluded: true, limitValue: null },
      { code: "NOTES_LIMIT", name: "Unlimited study notes with PDF syllabus linking", isIncluded: true, limitValue: null },
      { code: "PRIORITY_ACCESS", name: "Priority question bank coverage updates & editorial reviews", isIncluded: true, limitValue: null },
    ],
  },
];
