import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createPaymentOrder, UpiGatewayError } from "@/lib/payments/upi-gateway";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the student
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required to initiate payment order.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and validate payload
    const body = await request.json().catch(() => ({}));
    const {
      productType = "SUBSCRIPTION",
      productId,
      billingInterval = "ANNUAL",
      metadata = {},
    } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PRODUCT",
            message: "Valid productId (e.g. plan code or test ID) is required.",
          },
        },
        { status: 400 }
      );
    }

    const validProductTypes = [
      "SUBSCRIPTION",
      "TEST_SERIES",
      "MAINS_EVALUATION",
      "CURRENT_AFFAIRS",
      "COURSE",
    ];

    if (!validProductTypes.includes(productType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PRODUCT_TYPE",
            message: `productType must be one of: ${validProductTypes.join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    if (
      productType === "SUBSCRIPTION" &&
      !["MONTHLY", "QUARTERLY", "ANNUAL"].includes(billingInterval)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INTERVAL",
            message: "billingInterval must be MONTHLY, QUARTERLY, or ANNUAL.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Create server-side order with authoritative pricing
    const result = await createPaymentOrder({
      userId: user.id,
      productType,
      productId,
      billingInterval,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/payments/create-order:", error);

    if (error instanceof UpiGatewayError || error?.statusCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code || "GATEWAY_ERROR",
            message: error.message,
          },
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATION_FAILED",
          message: error.message || "Failed to create payment order.",
        },
      },
      { status: 500 }
    );
  }
}
