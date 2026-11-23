import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/upi-gateway
 * 
 * Standalone UPI Gateway webhook receiver has been decommissioned.
 * All future webhook ingestion will route through the Cashfree provider.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "GATEWAY_DECOMMISSIONED",
        message: "Standalone UPI gateway webhook receiver has been decommissioned.",
      },
    },
    { status: 503 }
  );
}
