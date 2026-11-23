import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Unauthenticated visitors default to the free foundation tier without throwing
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          isPaid: false,
          tier: 0,
          planCode: "FREE",
          planName: "Aspirant Foundation (Free)",
          subscription: null,
          recentPayments: [],
        },
      });
    }

    const subInfo = await getUserSubscription(user.id);

    // Fetch user payment history with resilient error guard
    let payments: any[] = [];
    try {
      payments = await prisma.orm.public.PaymentRecord
        .where({ userId: user.id })
        .orderBy((p) => p.createdAt.desc())
        .limit(10)
        .all();
    } catch (paymentErr: any) {
      console.warn("Could not query payment records:", paymentErr.message);
    }

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
