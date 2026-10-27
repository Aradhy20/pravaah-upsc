import { prisma } from "@/lib/prisma";

export interface EntitlementCheckResult {
  hasAccess: boolean;
  userTier: number;
  requiredTier: number;
  currentPlanName: string;
  reason?: string;
}

/**
 * Retrieves the current effective active subscription for a user.
 * If no active paid subscription is found, falls back to the Free plan (tier 0).
 */
export async function getUserSubscription(userId: string) {
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      currentPeriodEnd: { gte: new Date() },
    },
    include: {
      plan: {
        include: {
          features: true,
        },
      },
    },
    orderBy: { currentPeriodEnd: "desc" },
  });

  if (activeSub) {
    return {
      isPaid: activeSub.plan.tier > 0,
      tier: activeSub.plan.tier,
      planCode: activeSub.plan.code,
      planName: activeSub.plan.name,
      subscription: activeSub,
    };
  }

  // Fallback to Free Plan
  const freePlan = await prisma.plan.findUnique({
    where: { code: "FREE" },
    include: { features: true },
  });

  return {
    isPaid: false,
    tier: 0,
    planCode: "FREE",
    planName: freePlan?.name || "Aspirant Foundation (Free)",
    subscription: null,
  };
}

/**
 * Evaluates whether a user is entitled to a specific feature capability.
 * Enforced on the server side to protect restricted APIs (e.g., Timed Mock Exams).
 */
export async function checkEntitlement(
  userId: string,
  featureCode: string
): Promise<EntitlementCheckResult> {
  const [subInfo, entitlement] = await Promise.all([
    getUserSubscription(userId),
    prisma.featureEntitlement.findUnique({
      where: { featureCode },
    }),
  ]);

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

  const planFeature = await prisma.planFeature.findFirst({
    where: {
      plan: { code: subInfo.planCode },
      featureCode,
    },
  });

  const limitValue = planFeature?.limitValue ?? (featureCode === "BOOKMARKS_LIMIT" ? 5 : 3);
  return {
    allowed: currentCount < limitValue,
    maxAllowed: limitValue,
  };
}
