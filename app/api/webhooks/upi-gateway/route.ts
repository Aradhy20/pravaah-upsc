import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyWebhookSignature,
  getUpiGatewayConfig,
  activateEntitlementForOrder,
} from "@/lib/payments/upi-gateway";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let rawBody = "";
  try {
    // 1. Read exact raw request body
    rawBody = await request.text();
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to read request body" },
      { status: 400 }
    );
  }

  // 2. Extract Gateway Headers
  const signatureHeader =
    request.headers.get("x-signature") || request.headers.get("X-Signature");
  const eventIdHeader =
    request.headers.get("x-event-id") || request.headers.get("X-Event-Id");
  const eventHeader =
    request.headers.get("x-event") || request.headers.get("X-Event");

  const config = getUpiGatewayConfig();
  const webhookSecret = config.webhookSecret;

  // 3. Cryptographic Signature & Timestamp Verification
  const verification = verifyWebhookSignature({
    signatureHeader,
    rawBody,
    secret: webhookSecret,
    toleranceSeconds: 300, // 5 minutes
  });

  if (!verification.isValid) {
    console.warn(
      `[UPI Webhook] Rejected unauthorized delivery: ${verification.error}`
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_SIGNATURE",
          message: verification.error || "Signature verification failed",
        },
      },
      { status: 401 }
    );
  }

  // 4. Parse Webhook Event JSON
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed JSON payload" },
      { status: 400 }
    );
  }

  const eventId = payload.event_id || eventIdHeader;
  const eventType = payload.event || eventHeader;
  const eventSequence = typeof payload.event_sequence === "number" ? payload.event_sequence : null;
  const occurredAt = payload.occurred_at ? new Date(payload.occurred_at) : new Date();
  const orderData = payload.data || {};
  const gatewayOrderId = orderData.order_id;
  const clientOrderId = orderData.client_order_id;
  const environment = orderData.environment || (config.sandboxMode ? "sandbox" : "live");

  if (!eventId || !eventType) {
    return NextResponse.json(
      { success: false, error: "Missing event_id or event type in webhook payload" },
      { status: 400 }
    );
  }

  // 5. Idempotent Deduplication Check
  const existingEvent = await prisma.paymentWebhookEvent.findUnique({
    where: { eventId },
  });

  if (existingEvent) {
    return NextResponse.json({
      success: true,
      message: "Webhook event already processed idempotently",
      eventId,
      status: existingEvent.status,
    });
  }

  // 6. Find corresponding PaymentOrder
  const order = await prisma.paymentOrder.findFirst({
    where: {
      OR: [
        ...(clientOrderId ? [{ clientOrderId }] : []),
        ...(gatewayOrderId ? [{ gatewayOrderId }] : []),
      ],
    },
  });

  // 7. Persist Webhook Event in Database Ledger
  await prisma.paymentWebhookEvent.create({
    data: {
      eventId,
      eventSequence,
      eventType,
      orderId: gatewayOrderId || clientOrderId || null,
      paymentOrderId: order?.id || null,
      environment,
      signature: signatureHeader || null,
      rawPayload: rawBody,
      status: "PROCESSED",
      occurredAt,
    },
  });

  if (!order) {
    console.warn(
      `[UPI Webhook] Received ${eventType} for unrecorded order (clientOrderId: ${clientOrderId}, gatewayId: ${gatewayOrderId})`
    );
    return NextResponse.json({
      success: true,
      warning: "Order reference not found locally; event recorded in ledger",
    });
  }

  // 8. Event State Transition & Entitlement Fulfillment
  try {
    switch (eventType) {
      case "order.paid": {
        // Handle late payment recovery (order might have been marked EXPIRED previously)
        // If order is already PAID, do not re-provision
        if (order.status !== "PAID") {
          await activateEntitlementForOrder({
            paymentOrderId: order.id,
            utr: orderData.utr || "UPI_WEBHOOK_VERIFIED",
            paidAt: occurredAt,
            eventSequence: eventSequence || undefined,
          });
          console.log(
            `[UPI Webhook] Order ${order.clientOrderId} successfully transitioned to PAID. Entitlement activated.`
          );
        }
        break;
      }

      case "order.expired": {
        // Out-of-order check: do not revert a PAID order back to EXPIRED
        if (order.status !== "PAID") {
          await prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: "EXPIRED" },
          });
          console.log(`[UPI Webhook] Order ${order.clientOrderId} marked as EXPIRED.`);
        } else {
          console.log(
            `[UPI Webhook] Ignored order.expired for already PAID order ${order.clientOrderId}`
          );
        }
        break;
      }

      case "order.under_review": {
        if (order.status !== "PAID") {
          await prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: "UNDER_REVIEW" },
          });
        }
        break;
      }

      case "order.failed": {
        if (order.status !== "PAID") {
          await prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      default:
        console.log(`[UPI Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    return NextResponse.json({
      success: true,
      eventId,
      eventType,
      orderStatus: eventType === "order.paid" ? "PAID" : order.status,
    });
  } catch (error: any) {
    console.error(`[UPI Webhook] Processing error for event ${eventId}:`, error);

    // Record failure in webhook ledger
    await prisma.paymentWebhookEvent.update({
      where: { eventId },
      data: {
        status: "FAILED",
        errorDetails: error.message || String(error),
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal processing error during order fulfillment" },
      { status: 500 }
    );
  }
}
