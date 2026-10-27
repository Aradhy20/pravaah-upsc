import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-pravaah-webhook-signature");
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "pravaah_webhook_dev_secret_2026";

    // 1. Validate Webhook Authenticity / Signature
    // In production, verify crypto HMAC against request raw body
    if (signature && signature !== webhookSecret) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SIGNATURE", message: "Webhook signature verification failed." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, orderId, planCode, billingInterval = "ANNUAL", status = "SUCCESS", reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_ORDER_ID", message: "orderId is required" } },
        { status: 400 }
      );
    }

    // 2. Fetch PaymentRecord
    const payment = await prisma.paymentRecord.findFirst({
      where: { providerTxId: orderId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: "PAYMENT_NOT_FOUND", message: "No payment record found for orderId" } },
        { status: 404 }
      );
    }

    // 3. Idempotency Check: Do not process twice
    if (payment.status === "SUCCESS" && event === "payment.succeeded") {
      return NextResponse.json({
        success: true,
        message: "Payment event already processed idempotently.",
        paymentId: payment.id,
      });
    }

    // 4. Handle Payment Succeeded
    if (event === "payment.succeeded" || status === "SUCCESS") {
      // Find the plan
      const plan = await prisma.plan.findUnique({
        where: { code: planCode || "ACHIEVER" },
      });

      if (!plan) {
        return NextResponse.json(
          { success: false, error: { code: "PLAN_NOT_FOUND", message: "Plan not found" } },
          { status: 404 }
        );
      }

      // Calculate period days
      const days = billingInterval === "ANNUAL" ? 365 : billingInterval === "QUARTERLY" ? 90 : 30;
      const now = new Date();
      const periodEnd = new Date(now.getTime() + days * 86400000);

      // Upsert Subscription for user
      const existingSub = await prisma.subscription.findFirst({
        where: { userId: payment.userId },
        orderBy: { currentPeriodEnd: "desc" },
      });

      let subId = existingSub?.id;
      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: plan.id,
            billingInterval,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null,
          },
        });
      } else {
        const createdSub = await prisma.subscription.create({
          data: {
            userId: payment.userId,
            planId: plan.id,
            billingInterval,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            providerSubId: `sub_${orderId}`,
          },
        });
        subId = createdSub.id;
      }

      // Update PaymentRecord
      await prisma.paymentRecord.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          subscriptionId: subId,
        },
      });

      // Log Subscription Event
      await prisma.subscriptionEvent.create({
        data: {
          subscriptionId: subId!,
          eventType: "ACTIVATED",
          payloadJson: JSON.stringify({
            orderId,
            amount: payment.amount,
            planCode: plan.code,
            billingInterval,
            processedAt: now,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: subId,
          planName: plan.name,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
        },
      });
    }

    // 5. Handle Payment Failed
    if (event === "payment.failed" || status === "FAILED") {
      await prisma.paymentRecord.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
        },
      });

      // If user had a subscription linked, mark as PAST_DUE
      if (payment.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "PAST_DUE" },
        });

        await prisma.subscriptionEvent.create({
          data: {
            subscriptionId: payment.subscriptionId,
            eventType: "PAYMENT_FAILED",
            payloadJson: JSON.stringify({ orderId, reason: reason || "Bank declined" }),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          paymentStatus: "FAILED",
          message: "Payment marked as failed; paid access not granted.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Event '${event}' handled.`,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/billing/webhook:", error);
    return NextResponse.json(
      { success: false, error: { code: "WEBHOOK_PROCESSING_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
