import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/payments/orders/[orderId]/submit-utr
 * 
 * Manual UTR submission and retail UPI workflows have been permanently discontinued.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "FEATURE_DISCONTINUED",
        message:
          "Manual UTR submission is discontinued. Online checkout will be available through Cashfree upon merchant approval.",
      },
    },
    { status: 410 }
  );
}
