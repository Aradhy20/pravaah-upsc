import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json().catch(() => ({}));
    const { reason = "User requested cancellation" } = body;

    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    if (!activeSub) {
      return NextResponse.json(
        { success: false, error: { code: "NO_ACTIVE_SUB", message: "No active paid subscription found." } },
        { status: 404 }
      );
    }

    // Set cancel at period end
    const updated = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    // Record Subscription Event
    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: activeSub.id,
        eventType: "CANCELED",
        payloadJson: JSON.stringify({ reason, requestedAt: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: updated.id,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
        effectiveUntil: updated.currentPeriodEnd,
        message: "Your subscription will not renew after the current billing cycle.",
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/subscription/cancel:", error);
    return NextResponse.json(
      { success: false, error: { code: "CANCEL_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
