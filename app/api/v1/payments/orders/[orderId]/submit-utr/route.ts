import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    orderId: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required to submit payment reference.",
          },
        },
        { status: 401 }
      );
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_ORDER_ID",
            message: "orderId is required.",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawUtr = body.utr;

    if (!rawUtr || typeof rawUtr !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_UTR",
            message: "A valid UPI Transaction Reference / UTR number is required.",
          },
        },
        { status: 400 }
      );
    }

    const cleanedUtr = rawUtr.trim().toUpperCase().replace(/\s+/g, "");

    // Basic format validation: UPI UTRs are typically 12 numeric digits or 8-22 alphanumeric characters
    if (cleanedUtr.length < 6 || cleanedUtr.length > 30) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_UTR_FORMAT",
            message: "Invalid UTR format. Please provide the 12-digit UPI reference number from your payment app.",
          },
        },
        { status: 400 }
      );
    }

    // Reject obvious dummy values
    const dummyPatterns = ["000000", "123456", "TEST", "DEMO", "SAMPLE", "NA", "NULL"];
    if (dummyPatterns.some((d) => cleanedUtr.includes(d))) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REJECTED_UTR_PLACEHOLDER",
            message: "Placeholder or test UTR detected. Please enter your actual UPI transaction reference.",
          },
        },
        { status: 400 }
      );
    }

    // Locate the order
    const order = await prisma.paymentOrder.findFirst({
      where: {
        OR: [
          { clientOrderId: orderId },
          { gatewayOrderId: orderId },
          { id: orderId },
        ],
      },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_NOT_FOUND",
            message: `Order ${orderId} does not exist.`,
          },
        },
        { status: 404 }
      );
    }

    // Authorization check: only order owner or admin can submit UTR
    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You are not authorized to update this order.",
          },
        },
        { status: 403 }
      );
    }

    // Check order status
    if (order.status === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_ALREADY_PAID",
            message: "This order has already been successfully verified and paid.",
          },
        },
        { status: 400 }
      );
    }

    if (order.status === "EXPIRED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ORDER_EXPIRED",
            message: "This order payment window has expired. Please create a new order.",
          },
        },
        { status: 400 }
      );
    }

    // Anti-replay / Duplicate UTR check: ensure UTR is not already used in a PAID order
    const existingPaidWithUtr = await prisma.paymentOrder.findFirst({
      where: {
        utr: cleanedUtr,
        status: "PAID",
        id: { not: order.id },
      },
    });

    if (existingPaidWithUtr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_UTR",
            message: "This UPI Reference Number (UTR) has already been verified for another completed order.",
          },
        },
        { status: 409 }
      );
    }

    // Update order to UNDER_REVIEW
    const updatedOrder = await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        utr: cleanedUtr,
        status: "UNDER_REVIEW",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "UTR submitted successfully. Your transaction is now under verification.",
      data: {
        orderId: updatedOrder.clientOrderId,
        status: updatedOrder.status,
        utr: updatedOrder.utr,
        amount: updatedOrder.amount,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/payments/orders/[orderId]/submit-utr:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to process UTR submission",
        },
      },
      { status: 500 }
    );
  }
}
