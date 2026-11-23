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
    name: "Free Aspirant",
    tagline: "Essential UPSC PYQ practice with official answer keys",
    tier: 0,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 0, discountPercent: 0 },
      QUARTERLY: { amount: 0, discountPercent: 0 },
      ANNUAL: { amount: 0, discountPercent: 0 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Daily PYQ practice allowance (15 questions/day)", isIncluded: true, limitValue: 15 },
      { code: "EXPLANATIONS", name: "Basic concept summaries and official answer keys", isIncluded: true, limitValue: null },
      { code: "DAILY_QUIZ", name: "Daily 5-question Prelims quiz", isIncluded: true, limitValue: null },
      { code: "SYLLABUS_MAP", name: "Basic syllabus explorer", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks quota", isIncluded: true, limitValue: 5 },
      { code: "NOTES_LIMIT", name: "Private study notes quota", isIncluded: true, limitValue: 3 },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false, limitValue: null },
    ],
  },
  {
    id: "plan_beginner",
    code: "BEGINNER",
    name: "Aspirant Plus",
    tagline: "Structured practice, verified explanations and smart revision",
    tier: 1,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 149, discountPercent: 0 },
      QUARTERLY: { amount: 399, discountPercent: 11 },
      ANNUAL: { amount: 999, discountPercent: 44 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Expanded daily PYQ practice (50 questions/day)", isIncluded: true, limitValue: 50 },
      { code: "EXPLANATIONS", name: "Detailed pedagogical explanations & elimination notes", isIncluded: true, limitValue: null },
      { code: "ADVANCED_ANALYTICS", name: "Subject-wise performance analytics", isIncluded: true, limitValue: null },
      { code: "MISTAKE_REVISION", name: "Mistake Notebook & Spaced Repetition", isIncluded: true, limitValue: null },
      { code: "STUDY_PLANNER", name: "Full study planner with target tracking", isIncluded: true, limitValue: null },
      { code: "CSAT_COACH", name: "Basic CSAT section drills", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks allowance", isIncluded: true, limitValue: 50 },
      { code: "NOTES_LIMIT", name: "Private study notes allowance", isIncluded: true, limitValue: 50 },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_achiever",
    code: "ACHIEVER",
    name: "Aspirant Pro",
    tagline: "AI Personal Mentor, Mission Control, Syllabus Map and Mains Evaluation",
    tier: 2,
    isPopular: true,
    prices: {
      MONTHLY: { amount: 299, discountPercent: 0 },
      QUARTERLY: { amount: 799, discountPercent: 11 },
      ANNUAL: { amount: 1999, discountPercent: 44 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited PYQ catalog practice", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Full verified explanations with primary sources", isIncluded: true, limitValue: null },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor (100 messages/mo)", isIncluded: true, limitValue: 100 },
      { code: "MISSION_CONTROL", name: "Pravaah Mission Control daily cockpit", isIncluded: true, limitValue: null },
      { code: "SYLLABUS_MAP", name: "Syllabus Intelligence Map with micro-nodes", isIncluded: true, limitValue: null },
      { code: "PRELIMS_READINESS", name: "Prelims Readiness Analytics (0-100 index)", isIncluded: true, limitValue: null },
      { code: "MAINS_EVALUATION", name: "Mains answer evaluations (5 credits/mo)", isIncluded: true, limitValue: 5 },
      { code: "CSAT_COACH", name: "CSAT Survival Coach & speed drills", isIncluded: true, limitValue: null },
      { code: "TIMED_EXAMS", name: "Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Unlimited bookmarks with custom tags", isIncluded: true, limitValue: null },
      { code: "NOTES_LIMIT", name: "Unlimited private study notes", isIncluded: true, limitValue: null },
    ],
  },
  {
    id: "plan_scholar",
    code: "SCHOLAR",
    name: "Aspirant Elite",
    tagline: "Higher AI mentor allowance, deep diagnostics and priority support",
    tier: 3,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 499, discountPercent: 0 },
      QUARTERLY: { amount: 1299, discountPercent: 13 },
      ANNUAL: { amount: 3499, discountPercent: 41 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited PYQ catalog practice", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Full verified explanations with primary sources", isIncluded: true, limitValue: null },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor (300 messages/mo)", isIncluded: true, limitValue: 300 },
      { code: "MISSION_CONTROL", name: "Pravaah Mission Control daily cockpit", isIncluded: true, limitValue: null },
      { code: "SYLLABUS_MAP", name: "Syllabus Intelligence Map with micro-nodes", isIncluded: true, limitValue: null },
      { code: "PRELIMS_READINESS", name: "Advanced personalized diagnostic reports", isIncluded: true, limitValue: null },
      { code: "MAINS_EVALUATION", name: "Mains answer evaluations (15 credits/mo)", isIncluded: true, limitValue: 15 },
      { code: "CSAT_COACH", name: "Advanced CSAT diagnostics & strategy", isIncluded: true, limitValue: null },
      { code: "CURRENT_AFFAIRS", name: "Current Affairs exam converter packages", isIncluded: true, limitValue: null },
      { code: "TIMED_EXAMS", name: "Unlimited Full Exam Simulations & custom topic mocks", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Unlimited bookmarks with export capabilities", isIncluded: true, limitValue: null },
      { code: "NOTES_LIMIT", name: "Unlimited study notes with PDF syllabus linking", isIncluded: true, limitValue: null },
      { code: "PRIORITY_SUPPORT", name: "Direct priority support desk & WhatsApp SLA", isIncluded: true, limitValue: null },
    ],
  },
];
