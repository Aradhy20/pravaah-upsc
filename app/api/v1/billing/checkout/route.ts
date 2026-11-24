import { NextRequest } from "next/server";
import { POST as createOrderPost } from "@/app/api/v1/payments/create-order/route";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/billing/checkout
 *
 * Alias route forwarding to official Cashfree order creation handler.
 */
export async function POST(request: NextRequest) {
  return createOrderPost(request);
}
