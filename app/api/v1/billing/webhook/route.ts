import { NextRequest } from "next/server";
import { POST as cashfreeWebhookPost } from "@/app/api/webhooks/cashfree/route";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/billing/webhook
 *
 * Forwards directly to the official Cashfree webhook processor.
 */
export async function POST(request: NextRequest) {
  return cashfreeWebhookPost(request);
}
