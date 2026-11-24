/**
 * PRAVAAH UPSC — CANONICAL PRICING CATALOGUE
 * 
 * Single Source of Truth for all subscription tiers, intervals, savings calculations,
 * and price lookups across frontend UI, server actions, Cashfree order creation,
 * payment verification, and webhook reconciliation.
 *
 * CANONICAL PRICING STRUCTURE:
 * -------------------------------------------------------------------------------------
 * Tier | Code   | Name           | Monthly | Quarterly       | Annual
 * -------------------------------------------------------------------------------------
 * 0    | FREE   | Free Aspirant  | ₹0      | ₹0              | ₹0
 * 1    | PLUS   | Aspirant Plus  | ₹149    | ₹399 (save 11%) | ₹999 (save 44%)
 * 2    | PRO    | Aspirant Pro   | ₹299    | ₹799 (save 11%) | ₹1,999 (save 44%)
 * 3    | ELITE  | Aspirant Elite | ₹499    | ₹1,299 (save 13%) | ₹3,499 (save 42%)
 * -------------------------------------------------------------------------------------
 *
 * NOTE: Legacy annual prices (₹2,999, ₹5,499, ₹8,999) and legacy plan codes
 * (BEGINNER, ACHIEVER, SCHOLAR) are fully resolved and aliased for zero disruption.
 */

export type CanonicalPlanCode = "FREE" | "PLUS" | "PRO" | "ELITE";
export type CanonicalBillingInterval = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface CanonicalPriceDetail {
  amountRupees: number;
  amountPaise: number;
  currency: "INR";
  monthlyEquivalentRupees: number;
  savingsRupees: number;
  savingsPercent: number;
  discountBadge?: string;
}

export interface CanonicalPlanDefinition {
  code: CanonicalPlanCode;
  legacyCode: string;
  name: string;
  tagline: string;
  tier: number;
  isPopular: boolean;
  prices: Record<CanonicalBillingInterval, CanonicalPriceDetail>;
  features: Array<{
    code: string;
    name: string;
    isIncluded: boolean;
    limitValue?: number | null;
  }>;
}

/**
 * Normalizes any legacy or variant plan code to its canonical uppercase enum
 */
export const PLAN_CODE_ALIASES: Record<string, CanonicalPlanCode> = {
  // Canonical
  FREE: "FREE",
  PLUS: "PLUS",
  PRO: "PRO",
  ELITE: "ELITE",

  // Legacy database codes
  BEGINNER: "PLUS",
  ACHIEVER: "PRO",
  SCHOLAR: "ELITE",

  // UI / Display variants
  ASPIRANT_FREE: "FREE",
  ASPIRANT_FOUNDATION: "FREE",
  FOUNDATION: "FREE",
  ASPIRANT_PLUS: "PLUS",
  ASPIRANT_PRO: "PRO",
  ASPIRANT_ELITE: "ELITE",
  ASPIRANT_SCHOLAR: "ELITE",
  PRELIMS_PRO: "PRO",
};

/**
 * Maps a canonical code to all historical and current database identifiers
 */
export const REVERSE_PLAN_CODE_ALIASES: Record<CanonicalPlanCode, string[]> = {
  FREE: ["FREE", "ASPIRANT_FOUNDATION", "FOUNDATION"],
  PLUS: ["PLUS", "BEGINNER", "ASPIRANT_PLUS"],
  PRO: ["PRO", "ACHIEVER", "ASPIRANT_PRO", "PRELIMS_PRO"],
  ELITE: ["ELITE", "SCHOLAR", "ASPIRANT_ELITE", "ASPIRANT_SCHOLAR"],
};

export const INTERVAL_MONTHS: Record<CanonicalBillingInterval, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  ANNUAL: 12,
};

/**
 * Computes exact savings compared to paying month-by-month
 */
export function calculateIntervalSavings(
  monthlyAmount: number,
  periodAmount: number,
  interval: CanonicalBillingInterval
): { savingsRupees: number; savingsPercent: number; monthlyEquivalentRupees: number } {
  const months = INTERVAL_MONTHS[interval] || 1;
  const benchmarkCost = monthlyAmount * months;
  const savingsRupees = Math.max(0, benchmarkCost - periodAmount);
  const savingsPercent =
    benchmarkCost > 0 ? Math.round((savingsRupees / benchmarkCost) * 100) : 0;
  const monthlyEquivalentRupees = Math.round((periodAmount / months) * 100) / 100;

  return {
    savingsRupees,
    savingsPercent,
    monthlyEquivalentRupees,
  };
}

/**
 * Authoritative Canonical Pricing Catalogue
 */
export const CANONICAL_PLANS: Record<CanonicalPlanCode, CanonicalPlanDefinition> = {
  FREE: {
    code: "FREE",
    legacyCode: "FREE",
    name: "Free Aspirant",
    tagline: "Essential UPSC PYQ practice with official answer keys",
    tier: 0,
    isPopular: false,
    prices: {
      MONTHLY: {
        amountRupees: 0,
        amountPaise: 0,
        currency: "INR",
        monthlyEquivalentRupees: 0,
        savingsRupees: 0,
        savingsPercent: 0,
      },
      QUARTERLY: {
        amountRupees: 0,
        amountPaise: 0,
        currency: "INR",
        monthlyEquivalentRupees: 0,
        savingsRupees: 0,
        savingsPercent: 0,
      },
      ANNUAL: {
        amountRupees: 0,
        amountPaise: 0,
        currency: "INR",
        monthlyEquivalentRupees: 0,
        savingsRupees: 0,
        savingsPercent: 0,
      },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Daily authentic PYQ practice (15 questions/day)", isIncluded: true, limitValue: 15 },
      { code: "EXPLANATIONS", name: "Verified answer keys & foundational concept notes", isIncluded: true, limitValue: null },
      { code: "DAILY_QUIZ", name: "Daily 5-question Prelims micro-quiz", isIncluded: true, limitValue: null },
      { code: "SYLLABUS_MAP", name: "Standard syllabus outline explorer", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal question bookmarks", isIncluded: true, limitValue: 5 },
      { code: "NOTES_LIMIT", name: "Private study notes quota", isIncluded: true, limitValue: 3 },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false, limitValue: null },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false, limitValue: null },
    ],
  },
  PLUS: {
    code: "PLUS",
    legacyCode: "BEGINNER",
    name: "Aspirant Plus",
    tagline: "Structured practice, verified explanations and smart revision",
    tier: 1,
    isPopular: false,
    prices: {
      MONTHLY: {
        amountRupees: 149,
        amountPaise: 14900,
        currency: "INR",
        monthlyEquivalentRupees: 149,
        savingsRupees: 0,
        savingsPercent: 0,
      },
      QUARTERLY: {
        amountRupees: 399,
        amountPaise: 39900,
        currency: "INR",
        monthlyEquivalentRupees: 133,
        savingsRupees: 48, // 149*3 = 447 - 399 = 48
        savingsPercent: 11,
        discountBadge: "Save 11%",
      },
      ANNUAL: {
        amountRupees: 999,
        amountPaise: 99900,
        currency: "INR",
        monthlyEquivalentRupees: 83.25,
        savingsRupees: 789, // 149*12 = 1788 - 999 = 789
        savingsPercent: 44,
        discountBadge: "Save 44%",
      },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Expanded daily practice (50 questions/day)", isIncluded: true, limitValue: 50 },
      { code: "EXPLANATIONS", name: "Detailed pedagogical explanations & elimination notes", isIncluded: true, limitValue: null },
      { code: "ADVANCED_ANALYTICS", name: "Subject-wise accuracy and speed analytics", isIncluded: true, limitValue: null },
      { code: "MISTAKE_REVISION", name: "SuperMemo-2 Spaced Repetition Mistake Notebook", isIncluded: true, limitValue: null },
      { code: "STUDY_PLANNER", name: "Target year study tracker", isIncluded: true, limitValue: null },
      { code: "CSAT_COACH", name: "CSAT baseline speed drills", isIncluded: true, limitValue: null },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks allowance", isIncluded: true, limitValue: 50 },
      { code: "NOTES_LIMIT", name: "Private study notes allowance", isIncluded: true, limitValue: 50 },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: true, limitValue: null },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false, limitValue: null },
    ],
  },
  PRO: {
    code: "PRO",
    legacyCode: "ACHIEVER",
    name: "Aspirant Pro",
    tagline: "AI Personal Mentor, Mission Control, Syllabus Map and Mains Evaluation",
    tier: 2,
    isPopular: true,
    prices: {
      MONTHLY: {
        amountRupees: 299,
        amountPaise: 29900,
        currency: "INR",
        monthlyEquivalentRupees: 299,
        savingsRupees: 0,
        savingsPercent: 0,
      },
      QUARTERLY: {
        amountRupees: 799,
        amountPaise: 79900,
        currency: "INR",
        monthlyEquivalentRupees: 266.33,
        savingsRupees: 98, // 299*3 = 897 - 799 = 98
        savingsPercent: 11,
        discountBadge: "Save 11%",
      },
      ANNUAL: {
        amountRupees: 1999,
        amountPaise: 199900,
        currency: "INR",
        monthlyEquivalentRupees: 166.58,
        savingsRupees: 1589, // 299*12 = 3588 - 1999 = 1589
        savingsPercent: 44,
        discountBadge: "Save 44%",
      },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited authentic PYQ catalogue practice", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Complete verified explanations with primary sources", isIncluded: true, limitValue: null },
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
  ELITE: {
    code: "ELITE",
    legacyCode: "SCHOLAR",
    name: "Aspirant Elite",
    tagline: "Higher AI mentor allowance, deep diagnostics and priority support",
    tier: 3,
    isPopular: false,
    prices: {
      MONTHLY: {
        amountRupees: 499,
        amountPaise: 49900,
        currency: "INR",
        monthlyEquivalentRupees: 499,
        savingsRupees: 0,
        savingsPercent: 0,
      },
      QUARTERLY: {
        amountRupees: 1299,
        amountPaise: 129900,
        currency: "INR",
        monthlyEquivalentRupees: 433,
        savingsRupees: 198, // 499*3 = 1497 - 1299 = 198
        savingsPercent: 13,
        discountBadge: "Save 13%",
      },
      ANNUAL: {
        amountRupees: 3499,
        amountPaise: 349900,
        currency: "INR",
        monthlyEquivalentRupees: 291.58,
        savingsRupees: 2489, // 499*12 = 5988 - 3499 = 2489
        savingsPercent: 42,
        discountBadge: "Save 42%",
      },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited authentic PYQ catalogue practice", isIncluded: true, limitValue: null },
      { code: "EXPLANATIONS", name: "Complete verified explanations with primary sources", isIncluded: true, limitValue: null },
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
};

/**
 * Normalizes input string to canonical plan code with fallback to PRO
 */
export function normalizePlanCode(rawCode?: string | null): CanonicalPlanCode {
  if (!rawCode) return "PRO";
  const clean = rawCode.trim().toUpperCase().replace(/[-\s]+/g, "_");
  return PLAN_CODE_ALIASES[clean] || "PRO";
}

/**
 * Normalizes input string to canonical billing interval with fallback to MONTHLY
 */
export function normalizeBillingInterval(rawInterval?: string | null): CanonicalBillingInterval {
  if (!rawInterval) return "MONTHLY";
  const clean = rawInterval.trim().toUpperCase();
  if (clean === "QUARTERLY" || clean === "QUARTER" || clean === "3_MONTHS") return "QUARTERLY";
  if (clean === "ANNUAL" || clean === "YEARLY" || clean === "YEAR" || clean === "12_MONTHS") return "ANNUAL";
  return "MONTHLY";
}

/**
 * Resolves canonical price and savings for any plan code and interval combination
 */
export function resolveCanonicalPrice(
  rawPlanCode?: string | null,
  rawInterval?: string | null
): {
  canonicalCode: CanonicalPlanCode;
  planName: string;
  interval: CanonicalBillingInterval;
  amountRupees: number;
  amountPaise: number;
  currency: "INR";
  monthlyEquivalentRupees: number;
  savingsRupees: number;
  savingsPercent: number;
  discountBadge?: string;
  isFree: boolean;
} {
  const canonicalCode = normalizePlanCode(rawPlanCode);
  const interval = normalizeBillingInterval(rawInterval);
  const plan = CANONICAL_PLANS[canonicalCode];
  const priceDetail = plan.prices[interval];

  return {
    canonicalCode,
    planName: plan.name,
    interval,
    amountRupees: priceDetail.amountRupees,
    amountPaise: priceDetail.amountPaise,
    currency: "INR",
    monthlyEquivalentRupees: priceDetail.monthlyEquivalentRupees,
    savingsRupees: priceDetail.savingsRupees,
    savingsPercent: priceDetail.savingsPercent,
    discountBadge: priceDetail.discountBadge,
    isFree: canonicalCode === "FREE" || priceDetail.amountRupees === 0,
  };
}

/**
 * Returns formatted array of all 4 canonical plans for API and UI consumers
 */
export function getAllCanonicalPlans(): CanonicalPlanDefinition[] {
  return [
    CANONICAL_PLANS.FREE,
    CANONICAL_PLANS.PLUS,
    CANONICAL_PLANS.PRO,
    CANONICAL_PLANS.ELITE,
  ];
}
