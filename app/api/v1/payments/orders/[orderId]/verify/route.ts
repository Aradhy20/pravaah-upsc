import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCashfreeProvider, isPaymentSystemEnabled } from "@/lib/payments";
import { activateSubscriptionFromOrder } from "@/lib/payments/subscription-activator";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/payments/orders/[orderId]/verify
 *
 * Explicit payment verification endpoint called when candidate returns from Cashfree checkout.
 * - Queries Cashfree PG Server API
 * - Validates order status, currency, and amount
 * - Activates subscription in PostgreSQL only upon verified SUCCESS
 * - Returns honest status without trusting frontend claims
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ORDER_ID", message: "orderId is required" } },
        { status: 400 }
      );
    }

    const order = await prisma.paymentOrder.findFirst({
      where: {
        OR: [
          { clientOrderId: orderId },
          { gatewayOrderId: orderId },
          { cashfreeOrderId: orderId },
          { id: orderId },
        ],
      },
      include: {
        subscription: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "ORDER_NOT_FOUND", message: `Order '${orderId}' not found.` },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    const currentUser = await getAuthenticatedUser(request);
    if (currentUser && currentUser.role !== "ADMIN" && order.userId !== currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "You do not have access to this order." },
        },
        { status: 403 }
      );
    }

    // If order was already verified as PAID, return success idempotently
    if (order.status === "PAID" && order.subscriptionId) {
      return NextResponse.json({
        success: true,
        verified: true,
        status: "PAID",
        orderId: order.clientOrderId,
        subscriptionId: order.subscriptionId,
        message: "Payment is already verified and subscription is active.",
      });
    }

    // Query Cashfree Server API for truth
    if (!isPaymentSystemEnabled()) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: order.status,
          message: "Payment verification unavailable: Cashfree gateway credentials not configured.",
        },
        { status: 503 }
      );
    }

    const provider = getCashfreeProvider();
    const cfOrderId = order.cashfreeOrderId || order.gatewayOrderId || order.clientOrderId;
    const verification = await provider.verifyPayment(cfOrderId);

    // Validate amount matching to prevent tampering
    if (
      verification.status === "PAID" &&
      Math.abs(verification.amount - order.amount) > 0.5
    ) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: "FAILED",
          error: {
            code: "AMOUNT_MISMATCH",
            message: `Paid amount (₹${verification.amount}) does not match order amount (₹${order.amount}).`,
          },
        },
        { status: 400 }
      );
    }

    if (verification.status === "PAID") {
      // Activate subscription atomically
      const activation = await activateSubscriptionFromOrder({
        orderId: order.id,
        cashfreePaymentId: verification.paymentId,
        paymentMethod: verification.paymentMethod,
        paidAt: verification.paidAt,
      });

      if (!activation.success) {
        return NextResponse.json(
          {
            success: false,
            verified: false,
            error: {
              code: "ACTIVATION_FAILED",
              message: activation.error || "Failed to activate subscription in database.",
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        status: "PAID",
        orderId: order.clientOrderId,
        paymentId: verification.paymentId,
        subscriptionId: activation.subscription?.id,
        subscription: activation.subscription,
      });
    } else {
      // Update order status (PENDING, FAILED, USER_DROPPED, etc.)
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: verification.status,
          lastCheckedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        verified: false,
        status: verification.status,
        orderId: order.clientOrderId,
        message: `Payment status is ${verification.status}. Premium features remain locked until successful payment.`,
      });
    }
  } catch (error: any) {
    console.error("POST /api/v1/payments/orders/[orderId]/verify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VERIFICATION_ERROR",
          message: error.message || "Error verifying payment with Cashfree.",
        },
      },
      { status: 500 }
    );
  }
}
