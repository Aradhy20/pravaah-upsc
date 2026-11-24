import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCashfreeProvider, isPaymentSystemEnabled } from "@/lib/payments";
import { activateSubscriptionFromOrder } from "@/lib/payments/subscription-activator";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/payments/orders/[orderId]/status
 *
 * Retrieves current order status. If order is still PENDING or PROCESSING,
 * actively queries the Cashfree Server API to verify if payment completed,
 * ensuring automatic subscription activation if verified.
 */
export async function GET(
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
        subscription: {
          include: {
            plan: true,
          },
        },
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

    // Optional user authorization: allow owner or admin
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

    // If order is still PENDING/PROCESSING and Cashfree is configured, query Cashfree Server API
    let currentStatus = order.status;
    let paymentId = order.cashfreePaymentId;
    let paymentMethod = order.paymentMethod;

    if (
      (order.status === "PENDING" || order.status === "PROCESSING") &&
      isPaymentSystemEnabled()
    ) {
      try {
        const provider = getCashfreeProvider();
        const cfOrderId = order.cashfreeOrderId || order.gatewayOrderId || order.clientOrderId;
        const verification = await provider.verifyPayment(cfOrderId);

        if (verification.status === "PAID") {
          currentStatus = "PAID";
          paymentId = verification.paymentId || paymentId;
          paymentMethod = verification.paymentMethod || paymentMethod;

          // Activate subscription atomically
          await activateSubscriptionFromOrder({
            orderId: order.id,
            cashfreePaymentId: verification.paymentId,
            paymentMethod: verification.paymentMethod,
            paidAt: verification.paidAt,
          });
        } else if (
          verification.status === "FAILED" ||
          verification.status === "CANCELLED" ||
          verification.status === "USER_DROPPED"
        ) {
          currentStatus = verification.status;
          await prisma.paymentOrder.update({
            where: { id: order.id },
            data: { status: verification.status },
          });
        }
      } catch (err: any) {
        console.warn("Cashfree server verification during status query warning:", err.message);
      }
    }

    // Parse metadata
    let metadata: any = {};
    try {
      if (order.metadataJson) metadata = JSON.parse(order.metadataJson);
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderId: order.clientOrderId,
        cashfreeOrderId: order.cashfreeOrderId || order.gatewayOrderId,
        paymentSessionId: order.paymentSessionId,
        paymentId,
        paymentMethod,
        amount: order.amount,
        currency: order.currency,
        status: currentStatus,
        productType: order.productType,
        productId: order.productId,
        planCode: metadata.planCode || order.productId,
        planName: metadata.planName || order.productId,
        billingInterval: metadata.billingInterval || "MONTHLY",
        subscriptionId: order.subscriptionId,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        verifiedAt: order.verifiedAt,
        expiresAt: order.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/payments/orders/[orderId]/status error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to retrieve order status." } },
      { status: 500 }
    );
  }
}
