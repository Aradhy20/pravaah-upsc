import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  isPaymentSystemEnabled,
  PAYMENTS_DISABLED_MESSAGE,
  getCashfreeProvider,
  getCashfreeConfig,
} from "@/lib/payments";
import {
  normalizePlanCode,
  normalizeBillingInterval,
  resolveCanonicalPrice,
  REVERSE_PLAN_CODE_ALIASES,
} from "@/lib/payments/pricing-catalogue";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/payments/create-order
 *
 * Authenticated endpoint to create a trusted Cashfree payment order.
 * - Enforces server-side price lookup (zero client price manipulation)
 * - Creates an order on Cashfree PG via official API
 * - Persists PENDING PaymentOrder in PostgreSQL
 * - Returns payment_session_id for Cashfree Web Checkout SDK
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please sign in to choose a subscription plan.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Verify payment gateway availability
    if (!isPaymentSystemEnabled()) {
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

    // 3. Parse and validate request payload
    const body = await request.json().catch(() => ({}));
    const rawPlanCode = body.planCode || body.plan || body.productId || "PRO";
    const rawBillingInterval = body.billingInterval || body.interval || "MONTHLY";
    const couponCode = body.couponCode ? String(body.couponCode).trim().toUpperCase() : null;

    const canonicalCode = normalizePlanCode(rawPlanCode);
    const billingInterval = normalizeBillingInterval(rawBillingInterval);

    if (canonicalCode === "FREE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FREE_PLAN_SELECTED",
            message: "The Free Aspirant plan is completely free. No checkout order required.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Server-side Plan & Price Lookup (Zero client trust on amount)
    const candidateCodes = REVERSE_PLAN_CODE_ALIASES[canonicalCode] || [canonicalCode];
    const plan = await prisma.plan.findFirst({
      where: {
        code: { in: candidateCodes },
        isActive: true,
      },
      include: {
        prices: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PLAN_NOT_FOUND",
            message: `Plan with code '${canonicalCode}' does not exist or is inactive.`,
          },
        },
        { status: 404 }
      );
    }

    // Authoritative canonical price resolution
    const canonicalPrice = resolveCanonicalPrice(canonicalCode, billingInterval);
    const priceRecord = plan.prices.find(
      (p) => p.billingInterval === billingInterval && p.isActive
    );

    // If database price matches canonical, use it; otherwise use authoritative canonical price
    const baseAmount = priceRecord?.amountRupees ?? canonicalPrice.amountRupees;
    let finalAmount = baseAmount;
    let discountAmount = 0;

    // Optional Coupon Validation
    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findFirst({
          where: {
            code: couponCode,
            isActive: true,
          },
        });

        if (coupon) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = Math.round((finalAmount * coupon.discountValue) / 100);
          } else {
            discountAmount = coupon.discountValue;
          }
          finalAmount = Math.max(1, finalAmount - discountAmount);
        }
      } catch {
        // Fallback gracefully if Coupon model is not populated
      }
    }

    // 5. Generate Unique Order Identifier
    const clientOrderId = `CF_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const provider = getCashfreeProvider();

    // 6. Call Cashfree Hosted Checkout Order API
    const cfOrder = await provider.createOrder({
      userId: user.id,
      orderId: clientOrderId,
      amount: finalAmount,
      currency: "INR",
      productType: "SUBSCRIPTION",
      productId: plan.code,
      billingInterval: billingInterval as any,
      customerEmail: user.email,
      customerName: user.fullName || "UPSC Aspirant",
      metadata: {
        planId: plan.id,
        planCode: plan.code,
        billingInterval,
        couponCode,
        discountAmount,
      },
    });

    // 7. Persist Pending Order in PostgreSQL
    const order = await prisma.paymentOrder.create({
      data: {
        clientOrderId,
        gatewayOrderId: cfOrder.orderId,
        cashfreeOrderId: cfOrder.orderId,
        paymentSessionId: cfOrder.paymentSessionId,
        planId: plan.id,
        userId: user.id,
        productType: "SUBSCRIPTION",
        productId: plan.code,
        amount: finalAmount,
        amountPaise: Math.round(finalAmount * 100),
        currency: "INR",
        status: "PENDING",
        environment: getCashfreeConfig().environment.toLowerCase(),
        isTest: getCashfreeConfig().environment === "TEST",
        metadataJson: JSON.stringify({
          planId: plan.id,
          planCode: plan.code,
          planName: plan.name,
          billingInterval,
          couponCode,
          discountAmount,
        }),
        expiresAt: cfOrder.expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: clientOrderId,
        cashfreeOrderId: cfOrder.orderId,
        paymentSessionId: cfOrder.paymentSessionId,
        amount: finalAmount,
        currency: "INR",
        plan: {
          id: plan.id,
          name: plan.name,
          code: plan.code,
        },
        billingInterval,
      },
    });
  } catch (error: any) {
    console.error("Error creating Cashfree payment order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATION_FAILED",
          message: error.message || "Failed to create Cashfree payment order.",
        },
      },
      { status: 500 }
    );
  }
}
