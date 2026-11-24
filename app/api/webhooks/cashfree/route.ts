import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCashfreeProvider, getCashfreeConfig } from "@/lib/payments";
import { activateSubscriptionFromOrder } from "@/lib/payments/subscription-activator";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/cashfree
 *
 * Official Cashfree Webhook Handler
 * - Validates HMAC-SHA256 signature and timestamp freshness
 * - Protects against replay attacks
 * - Idempotently activates subscriptions upon PAYMENT_SUCCESS
 * - Records all events in PaymentWebhookEvent audit table
 */
export async function POST(request: NextRequest) {
  let rawBody = "";

  try {
    rawBody = await request.text();

    // 1. Extract headers into normalized lowercase dictionary
    const headers: Record<string, string> = {};
    request.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const provider = getCashfreeProvider();

    // 2. Cryptographic signature and timestamp verification
    const webhookResult = await provider.processWebhook({
      headers,
      rawBody,
    });

    if (!webhookResult.isValid) {
      console.warn("Cashfree webhook signature rejected:", webhookResult.error);

      // Record failed event for security monitoring
      try {
        await prisma.paymentWebhookEvent.create({
          data: {
            eventId: `REJECTED_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            eventType: "SIGNATURE_REJECTED",
            environment: getCashfreeConfig().environment.toLowerCase(),
            signature: headers["x-webhook-signature"] || null,
            rawPayload: rawBody.slice(0, 4000),
            status: "FAILED",
            errorDetails: webhookResult.error || "Invalid signature",
          },
        });
      } catch {}

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_SIGNATURE",
            message: webhookResult.error || "Invalid webhook signature.",
          },
        },
        { status: 401 }
      );
    }

    const { eventId, eventType, orderId, paymentId, status } = webhookResult;

    // 3. Idempotency Check: if this exact event was already processed, acknowledge HTTP 200
    if (eventId) {
      const existing = await prisma.paymentWebhookEvent.findUnique({
        where: { eventId },
      });
      if (existing && existing.status === "PROCESSED") {
        return NextResponse.json(
          { success: true, message: "EVENT_ALREADY_PROCESSED" },
          { status: 200 }
        );
      }
    }

    // 4. Find Associated Order
    let order: any = null;
    if (orderId) {
      order = await prisma.paymentOrder.findFirst({
        where: {
          OR: [
            { clientOrderId: orderId },
            { gatewayOrderId: orderId },
            { cashfreeOrderId: orderId },
            { id: orderId },
          ],
        },
      });
    }

    // 5. Process Specific Event Types
    let processingError: string | null = null;

    if (status === "PAID" || eventType?.includes("PAYMENT_SUCCESS") || eventType?.includes("ORDER_PAID")) {
      if (order) {
        const activation = await activateSubscriptionFromOrder({
          orderId: order.id,
          cashfreePaymentId: paymentId,
          paymentMethod: webhookResult.rawPayload?.data?.payment?.payment_method
            ? JSON.stringify(webhookResult.rawPayload.data.payment.payment_method)
            : undefined,
          paidAt: webhookResult.occurredAt,
        });

        if (!activation.success) {
          processingError = activation.error || "Subscription activation failed";
        }
      } else {
        processingError = `Order '${orderId}' not found in database`;
      }
    } else if (status === "FAILED" || eventType?.includes("PAYMENT_FAILED") || eventType?.includes("USER_DROPPED")) {
      if (order && order.status !== "PAID") {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: status || "FAILED",
            failureReason: webhookResult.rawPayload?.data?.payment?.payment_message || "Payment unsuccessful",
            lastCheckedAt: new Date(),
          },
        });
      }
    } else if (status === "REFUNDED" || eventType?.includes("REFUND")) {
      if (order) {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: "REFUNDED",
            lastCheckedAt: new Date(),
          },
        });
      }
    }

    // 6. Record Processed Event in Database Audit Table
    const recordedEventId = eventId || `EVT_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await prisma.paymentWebhookEvent.upsert({
      where: { eventId: recordedEventId },
      update: {
        status: processingError ? "FAILED" : "PROCESSED",
        errorDetails: processingError,
        processedAt: new Date(),
      },
      create: {
        eventId: recordedEventId,
        eventType: eventType || "UNKNOWN",
        orderId: orderId || null,
        paymentOrderId: order?.id || null,
        environment: getCashfreeConfig().environment.toLowerCase(),
        signature: headers["x-webhook-signature"] || null,
        rawPayload: rawBody.slice(0, 10000),
        status: processingError ? "FAILED" : "PROCESSED",
        errorDetails: processingError,
        occurredAt: webhookResult.occurredAt || new Date(),
      },
    });

    return NextResponse.json({
      success: !processingError,
      eventId: recordedEventId,
      eventType,
      status: "PROCESSED",
    });
  } catch (error: any) {
    console.error("Cashfree webhook processing exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to process webhook.",
        },
      },
      { status: 500 }
    );
  }
}
