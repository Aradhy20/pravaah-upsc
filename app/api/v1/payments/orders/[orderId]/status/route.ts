import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { verifyOrderStatus, OrderNotFoundError } from "@/lib/payments/upi-gateway";

export const dynamic = "force-dynamic";

interface Params {
  params: {
    orderId: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required to query order status.",
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
            message: "orderId path parameter is required.",
          },
        },
        { status: 400 }
      );
    }

    const result = await verifyOrderStatus(orderId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof OrderNotFoundError || error?.code === "ORDER_NOT_FOUND" || error?.statusCode === 404) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code || "ORDER_NOT_FOUND",
            message: error.message || "Order not found",
          },
        },
        { status: 404 }
      );
    }

    console.error("Error in GET /api/v1/payments/orders/[orderId]/status:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "STATUS_VERIFICATION_FAILED",
          message: error.message || "Failed to verify order status.",
        },
      },
      { status: 500 }
    );
  }
}
