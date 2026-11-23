import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/payments/orders/[orderId]/status
 * 
 * Read-only retrieval of historical order records from database.
 * Does not make external gateway calls or simulate order state changes.
 */
export async function GET(
  _request: NextRequest,
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
          { id: orderId },
        ],
      },
      select: {
        id: true,
        clientOrderId: true,
        amount: true,
        currency: true,
        status: true,
        productType: true,
        productId: true,
        createdAt: true,
        paidAt: true,
        expiresAt: true,
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

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to retrieve order status." } },
      { status: 500 }
    );
  }
}
