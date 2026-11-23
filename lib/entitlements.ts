import { prisma } from "@/lib/prisma";

export interface EntitlementCheckResult {
  hasAccess: boolean;
  userTier: number;
  requiredTier: number;
  currentPlanName: string;
  reason?: string;
}

const FALLBACK_FEATURE_ENTITLEMENTS: Record<string, { minTier: number; name: string }> = {
  TIMED_EXAMS: { minTier: 2, name: "Timed Examination Simulator" },
  ADVANCED_ANALYTICS: { minTier: 2, name: "Diagnostic Weakness Detector" },
  UNLIMITED_BOOKMARKS: { minTier: 2, name: "Unlimited Bookmarks" },
  UNLIMITED_NOTES: { minTier: 2, name: "Unlimited Study Notes" },
  PRIORITY_ACCESS: { minTier: 3, name: "Priority Access & Verification Audit" },
};

/**
 * Retrieves the current effective active subscription for a user.
 * If no active paid subscription is found, falls back to the Free plan (tier 0).
 */
export async function getUserSubscription(userId: string) {
  try {
    const activeSub = await prisma.orm.public.Subscription
      .where({ userId, status: "ACTIVE" })
      .where((s) => s.currentPeriodEnd.gte(new Date()))
      .include("plan", (plan) => plan.include("features"))
      .orderBy((s) => s.currentPeriodEnd.desc())
      .first();

    if (activeSub) {
      return {
        isPaid: activeSub.plan.tier > 0,
        tier: activeSub.plan.tier,
        planCode: activeSub.plan.code,
        planName: activeSub.plan.name,
        subscription: activeSub,
      };
    }
  } catch (err: any) {
    console.warn("getUserSubscription database query warning:", err.message);
  }

  // Fallback to Free Plan
  try {
    const freePlan = await prisma.orm.public.Plan.include("features").where({ code: "FREE" }).first();

    return {
      isPaid: false,
      tier: 0,
      planCode: "FREE",
      planName: freePlan?.name || "Aspirant Foundation (Free)",
      subscription: null,
    };
  } catch {
    return {
      isPaid: false,
      tier: 0,
      planCode: "FREE",
      planName: "Aspirant Foundation (Free)",
      subscription: null,
    };
  }
}

/**
 * Evaluates whether a user is entitled to a specific feature capability.
 * Enforced on the server side to protect restricted APIs (e.g., Timed Mock Exams).
 */
export async function checkEntitlement(
  userId: string,
  featureCode: string
): Promise<EntitlementCheckResult> {
  let subInfo = {
    isPaid: false,
    tier: 0,
    planCode: "FREE",
    planName: "Aspirant Foundation (Free)",
    subscription: null as any,
  };

  let entitlement: { minTier: number; name: string } | null = null;

  try {
    subInfo = await getUserSubscription(userId);
  } catch (e: any) {
    console.warn("Error getting user subscription:", e.message);
  }

  try {
    const dbEntitlement = await prisma.orm.public.FeatureEntitlement.where({ featureCode }).first();
    if (dbEntitlement) {
      entitlement = dbEntitlement;
    }
  } catch (e: any) {
    console.warn(`FeatureEntitlement query warning for ${featureCode}:`, e.message);
  }

  // Fall back to built-in dictionary if not in DB
  if (!entitlement) {
    entitlement = FALLBACK_FEATURE_ENTITLEMENTS[featureCode] || {
      minTier: 0,
      name: featureCode,
    };
  }

  const requiredTier = entitlement ? entitlement.minTier : 0;
  const hasAccess = subInfo.tier >= requiredTier;

  return {
    hasAccess,
    userTier: subInfo.tier,
    requiredTier,
    currentPlanName: subInfo.planName,
    reason: hasAccess
      ? undefined
      : `Feature '${entitlement?.name || featureCode}' requires ${
          requiredTier === 2 ? "Achiever (Prelims Pro)" : requiredTier === 3 ? "Scholar" : "Beginner"
        } plan or higher. Your current plan: ${subInfo.planName}.`,
  };
}

/**
 * Checks entitlement quota (e.g., max bookmarks or notes for Free/Beginner users)
 */
export async function checkQuota(
  userId: string,
  featureCode: "BOOKMARKS_LIMIT" | "NOTES_LIMIT",
  currentCount: number
): Promise<{ allowed: boolean; maxAllowed: number | null }> {
  const subInfo = await getUserSubscription(userId);

  if (subInfo.tier >= 2) {
    // Achiever and Scholar have unlimited quota
    return { allowed: true, maxAllowed: null };
  }

  const plan = await prisma.orm.public.Plan.where({ code: subInfo.planCode }).first();
  const planFeature = plan
    ? await prisma.orm.public.PlanFeature.where({ planId: plan.id, featureCode }).first()
    : null;

  const limitValue = planFeature?.limitValue ?? (featureCode === "BOOKMARKS_LIMIT" ? 5 : 3);
  return {
    allowed: currentCount < limitValue,
    maxAllowed: limitValue,
  };
}
