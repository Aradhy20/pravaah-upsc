import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { planCode, billingInterval = "ANNUAL" } = body;

    if (!planCode || !["BEGINNER", "ACHIEVER", "SCHOLAR"].includes(planCode)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PLAN",
            message: "Valid plan code is required (BEGINNER, ACHIEVER, SCHOLAR).",
          },
        },
        { status: 400 }
      );
    }

    if (!["MONTHLY", "QUARTERLY", "ANNUAL"].includes(billingInterval)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INTERVAL",
            message: "Valid billingInterval is required (MONTHLY, QUARTERLY, ANNUAL).",
          },
        },
        { status: 400 }
      );
    }

    // 1. Authoritative Server-Side Price Verification
    const plan = await prisma.plan.findUnique({
      where: { code: planCode },
      include: {
        prices: {
          where: { billingInterval, isActive: true },
        },
      },
    });

    if (!plan || plan.prices.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRICE_NOT_FOUND",
            message: `Pricing configuration for ${planCode} (${billingInterval}) not found.`,
          },
        },
        { status: 404 }
      );
    }

    const priceConfig = plan.prices[0];
    const amountRupees = priceConfig.amountRupees;
    const currency = priceConfig.currency;

    // 2. Generate idempotency key and order reference
    const orderRef = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const idempotencyKey = crypto
      .createHash("sha256")
      .update(`${user.id}_${plan.id}_${billingInterval}_${amountRupees}_${Date.now()}`)
      .digest("hex");

    // 3. Create Pending PaymentRecord in Database
    const payment = await prisma.paymentRecord.create({
      data: {
        userId: user.id,
        amount: amountRupees,
        currency,
        status: "PENDING",
        provider: "SANDBOX_MOCK",
        providerTxId: orderRef,
        idempotencyKey,
        paymentMethod: "UPI_OR_CARD",
        receiptNumber: `REC-${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: payment.providerTxId,
        paymentId: payment.id,
        planCode: plan.code,
        planName: plan.name,
        billingInterval,
        amount: amountRupees,
        currency,
        discountPercent: priceConfig.discountPercent,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        checkoutUrl: `/checkout/sandbox?orderId=${payment.providerTxId}`,
        sandboxInstructions:
          "In production, this integrates with Razorpay/Stripe checkout. In development/sandbox mode, confirm payment via /api/v1/billing/webhook to activate immediately.",
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/billing/checkout:", error);
    return NextResponse.json(
      { success: false, error: { code: "CHECKOUT_INIT_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
