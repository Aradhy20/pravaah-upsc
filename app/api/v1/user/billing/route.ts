import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserSubscription, getOrCreateUsageLedger } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access billing dashboard" },
        { status: 401 }
      );
    }

    const [subInfo, usageLedger, payments, packPurchases] = await Promise.all([
      getUserSubscription(user.id),
      getOrCreateUsageLedger(user.id),
      prisma.paymentRecord.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.userPackPurchase.findMany({
        where: { userId: user.id },
        include: { pack: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Referral details
    let referral = await prisma.referral.findFirst({
      where: { referrerUserId: user.id },
    });
    if (!referral) {
      const code = `PRAVAAH-${user.fullName.split(" ")[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      try {
        referral = await prisma.referral.create({
          data: {
            referrerUserId: user.id,
            referralCode: code,
          },
        });
      } catch (e) {
        // Fallback referral record
        referral = {
          id: "ref_default",
          referrerUserId: user.id,
          referredUserId: null,
          referralCode: code,
          status: "ACTIVE",
          rewardPoints: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    const referralsCount = await prisma.referral.count({
      where: { referrerUserId: user.id, status: { in: ["QUALIFIED", "REWARDED"] } },
    });

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          code: subInfo.planCode,
          name: subInfo.planName,
          tier: subInfo.tier,
          isPaid: subInfo.isPaid,
        },
        subscription: subInfo.subscription
          ? {
              id: subInfo.subscription.id,
              status: subInfo.subscription.status,
              billingInterval: subInfo.subscription.billingInterval,
              currentPeriodStart: subInfo.subscription.currentPeriodStart,
              currentPeriodEnd: subInfo.subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subInfo.subscription.cancelAtPeriodEnd,
            }
          : null,
        usage: {
          aiMentorMessagesUsed: usageLedger.aiMentorMessagesUsed,
          aiMentorMessagesLimit: usageLedger.aiMentorMessagesLimit,
          aiMentorRemaining: Math.max(0, usageLedger.aiMentorMessagesLimit - usageLedger.aiMentorMessagesUsed),
          mainsEvaluationsUsed: usageLedger.mainsEvaluationsUsed,
          mainsEvaluationsLimit: usageLedger.mainsEvaluationsLimit,
          mainsEvaluationsRemaining: Math.max(0, usageLedger.mainsEvaluationsLimit - usageLedger.mainsEvaluationsUsed),
          pyqAttemptsToday: usageLedger.pyqAttemptsToday,
          pyqDailyLimit: usageLedger.pyqDailyLimit,
          periodEnd: usageLedger.periodEnd,
        },
        invoices: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          receiptNumber: p.receiptNumber || `INV-${p.id.slice(-6).toUpperCase()}`,
          date: p.createdAt,
        })),
        packs: packPurchases.map((pp) => ({
          id: pp.id,
          name: pp.pack.name,
          category: pp.pack.category,
          purchasePrice: pp.purchasePrice,
          creditsRemaining: pp.creditsRemaining,
          expiresAt: pp.expiresAt,
          status: pp.status,
        })),
        referral: {
          code: referral.referralCode,
          rewardPoints: referral.rewardPoints,
          qualifiedReferrals: referralsCount,
          shareUrl: `https://pravaah-upsc.vercel.app/register?ref=${referral.referralCode}`,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/billing:", error);
    return NextResponse.json(
      { success: false, error: "Internal error retrieving student billing details" },
      { status: 500 }
    );
  }
}
