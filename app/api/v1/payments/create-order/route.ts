import { NextRequest, NextResponse } from "next/server";
import { PAYMENTS_DISABLED_MESSAGE } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/payments/create-order
 * 
 * Paid checkout is safely disabled while Cashfree merchant account is in review.
 * Returns HTTP 503 with standardized explanation.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "PAYMENTS_DISABLED",
        message: PAYMENTS_DISABLED_MESSAGE,
      },
    },
    { status: 503 }
  );
}
