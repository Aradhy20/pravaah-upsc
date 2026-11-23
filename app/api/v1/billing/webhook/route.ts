import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/billing/webhook
 * 
 * Development and browser-triggered payment webhooks are permanently disabled.
 * Hardcoded secrets and mock subscription activation have been removed.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "WEBHOOK_DISABLED",
        message: "Payment webhooks are inactive while Cashfree payment gateway transition is in progress.",
      },
    },
    { status: 503 }
  );
}
