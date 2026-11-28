import { prisma } from "@/lib/prisma";

export interface EntitlementCheckResult {
  hasAccess: boolean;
  userTier: number;
  requiredTier: number;
  currentPlanName: string;
  reason?: string;
}

const FALLBACK_FEATURE_ENTITLEMENTS: Record<string, { minTier: number; name: string }> = {
  TIMED_EXAMS: { minTier: 1, name: "Timed Examination Simulator" },
  ADVANCED_ANALYTICS: { minTier: 1, name: "Subject & Weakness Analytics" },
  MISTAKE_REVISION: { minTier: 1, name: "Mistake Notebook & Spaced Repetition" },
  CSAT_COACH: { minTier: 1, name: "CSAT Practice & Diagnostics" },
  MISSION_CONTROL: { minTier: 2, name: "Pravaah Mission Control" },
  SYLLABUS_MAP: { minTier: 2, name: "Syllabus Intelligence Map" },
  PRELIMS_READINESS: { minTier: 2, name: "Prelims Readiness Analytics" },
  AI_MENTOR: { minTier: 2, name: "Pravaah AI Personal Mentor" },
  MAINS_EVALUATION: { minTier: 2, name: "Mains Answer Evaluation Credits" },
  CURRENT_AFFAIRS: { minTier: 3, name: "Current Affairs Deep Packages" },
  PRIORITY_SUPPORT: { minTier: 3, name: "Priority Support Desk" },
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
  } catch (err: any) {
    console.warn("getUserSubscription database query warning:", err.message);
  }

  // Fallback to Free Plan
  try {
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
    const dbEntitlement = await prisma.featureEntitlement.findUnique({
      where: { featureCode },
    });
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

/**
 * Retrieves or initializes the monthly usage ledger for an aspirant.
 * Cycles monthly based on the active subscription or calendar month.
 */
export async function getOrCreateUsageLedger(userId: string) {
  const subInfo = await getUserSubscription(userId);
  const now = new Date();
  const periodEnd = subInfo.subscription
    ? new Date(subInfo.subscription.currentPeriodEnd)
    : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Determine limits based on plan tier
  let aiMentorLimit = 5; // Introductory trial allowance for Free aspirants
  let mainsEvalLimit = 1; // Introductory trial evaluation for Free aspirants
  let pyqDailyLimit = 15;

  if (subInfo.tier === 1) {
    // Aspirant Plus
    aiMentorLimit = 15;
    mainsEvalLimit = 2;
    pyqDailyLimit = 50;
  } else if (subInfo.tier === 2) {
    // Aspirant Pro (Flagship)
    aiMentorLimit = 100;
    mainsEvalLimit = 5;
    pyqDailyLimit = 9999;
  } else if (subInfo.tier >= 3) {
    // Aspirant Elite
    aiMentorLimit = 300;
    mainsEvalLimit = 15;
    pyqDailyLimit = 9999;
  }

  // Also check if user has purchased specialized learning packs
  try {
    const activePackPurchases = await prisma.userPackPurchase.findMany({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: { gte: now },
      },
    });

    for (const p of activePackPurchases) {
      if (p.creditsRemaining > 0) {
        mainsEvalLimit += p.creditsRemaining;
      }
    }
  } catch (err) {
    // Ignore pack query warning if table is cold
  }

  try {
    const ledger = await prisma.userUsageLedger.upsert({
      where: { userId },
      update: {
        aiMentorMessagesLimit: aiMentorLimit,
        mainsEvaluationsLimit: mainsEvalLimit,
        pyqDailyLimit,
      },
      create: {
        userId,
        periodStart: now,
        periodEnd,
        aiMentorMessagesUsed: 0,
        aiMentorMessagesLimit: aiMentorLimit,
        mainsEvaluationsUsed: 0,
        mainsEvaluationsLimit: mainsEvalLimit,
        pyqAttemptsToday: 0,
        pyqDailyLimit,
      },
    });

    // Reset daily PYQ counter if last attempt was on a previous day
    if (ledger.lastPyqAttemptDate) {
      const lastDate = new Date(ledger.lastPyqAttemptDate).toDateString();
      if (lastDate !== now.toDateString()) {
        return await prisma.userUsageLedger.update({
          where: { userId },
          data: {
            pyqAttemptsToday: 0,
            lastPyqAttemptDate: now,
          },
        });
      }
    }

    return ledger;
  } catch (err: any) {
    console.warn("Usage ledger fallback:", err.message);
    return {
      id: `ledger_${userId}`,
      userId,
      periodStart: now,
      periodEnd,
      aiMentorMessagesUsed: 0,
      aiMentorMessagesLimit: aiMentorLimit,
      mainsEvaluationsUsed: 0,
      mainsEvaluationsLimit: mainsEvalLimit,
      pyqAttemptsToday: 0,
      pyqDailyLimit,
      lastPyqAttemptDate: null,
      createdAt: now,
      updatedAt: now,
    };
  }
}

/**
 * Verifies whether the student has sufficient AI credits before execution.
 */
export async function checkAiCreditAllowance(
  userId: string,
  type: "AI_MENTOR" | "MAINS_EVALUATION"
): Promise<{ allowed: boolean; remaining: number; limit: number; used: number }> {
  const ledger = await getOrCreateUsageLedger(userId);
  const used = type === "AI_MENTOR" ? ledger.aiMentorMessagesUsed : ledger.mainsEvaluationsUsed;
  const limit = type === "AI_MENTOR" ? ledger.aiMentorMessagesLimit : ledger.mainsEvaluationsLimit;

  return {
    allowed: used < limit,
    remaining: Math.max(0, limit - used),
    limit,
    used,
  };
}

/**
 * Deducts AI credit atomically upon successful execution.
 */
export async function deductAiCredit(
  userId: string,
  type: "AI_MENTOR" | "MAINS_EVALUATION"
) {
  try {
    if (type === "AI_MENTOR") {
      return await prisma.userUsageLedger.update({
        where: { userId },
        data: {
          aiMentorMessagesUsed: { increment: 1 },
        },
      });
    } else {
      return await prisma.userUsageLedger.update({
        where: { userId },
        data: {
          mainsEvaluationsUsed: { increment: 1 },
        },
      });
    }
  } catch (err: any) {
    console.warn("deductAiCredit ledger warning:", err.message);
    return null;
  }
}

/**
 * Restores AI credit if an upstream operation fails unexpectedly.
 */
export async function restoreAiCredit(
  userId: string,
  type: "AI_MENTOR" | "MAINS_EVALUATION"
) {
  try {
    const ledger = await getOrCreateUsageLedger(userId);
    if (type === "AI_MENTOR") {
      if (ledger.aiMentorMessagesUsed > 0) {
        await prisma.userUsageLedger.update({
          where: { userId },
          data: { aiMentorMessagesUsed: { decrement: 1 } },
        });
      }
    } else {
      if (ledger.mainsEvaluationsUsed > 0) {
        await prisma.userUsageLedger.update({
          where: { userId },
          data: { mainsEvaluationsUsed: { decrement: 1 } },
        });
      }
    }
  } catch (err: any) {
    console.warn("restoreAiCredit ledger warning:", err.message);
  }
}

/**
 * Checks daily PYQ practice limits to maintain ethical freemium boundaries.
 */
export async function checkDailyPyqLimit(
  userId: string
): Promise<{ allowed: boolean; attemptsToday: number; dailyLimit: number }> {
  try {
    const ledger = await getOrCreateUsageLedger(userId);
    return {
      allowed: ledger.pyqAttemptsToday < ledger.pyqDailyLimit,
      attemptsToday: ledger.pyqAttemptsToday,
      dailyLimit: ledger.pyqDailyLimit,
    };
  } catch {
    return {
      allowed: true,
      attemptsToday: 0,
      dailyLimit: 15,
    };
  }
}

/**
 * Increments daily PYQ practice counter.
 */
export async function recordPyqAttempt(userId: string) {
  try {
    const now = new Date();
    return await prisma.userUsageLedger.update({
      where: { userId },
      data: {
        pyqAttemptsToday: { increment: 1 },
        lastPyqAttemptDate: now,
      },
    });
  } catch (err: any) {
    console.warn("recordPyqAttempt ledger warning:", err.message);
    return null;
  }
}
