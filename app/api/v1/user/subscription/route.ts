import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const subInfo = await getUserSubscription(user.id);

    // Fetch user payment history
    const payments = await prisma.paymentRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        isPaid: subInfo.isPaid,
        tier: subInfo.tier,
        planCode: subInfo.planCode,
        planName: subInfo.planName,
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
        recentPayments: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          providerTxId: p.providerTxId,
          createdAt: p.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/subscription:", error);
    return NextResponse.json(
      { success: false, error: { code: "SUBSCRIPTION_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
