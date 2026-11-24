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
    const planCode = (body.planCode || body.plan || "ACHIEVER").toUpperCase();
    const billingInterval = (body.billingInterval || body.interval || "MONTHLY").toUpperCase();
    const couponCode = body.couponCode ? String(body.couponCode).trim().toUpperCase() : null;

    if (planCode === "FREE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FREE_PLAN_SELECTED",
            message: "The Aspirant Foundation plan is completely free. No checkout order required.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Server-side Plan & Price Lookup (Zero client trust on amount)
    const plan = await prisma.plan.findFirst({
      where: {
        code: planCode,
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
            message: `Plan with code '${planCode}' does not exist or is inactive.`,
          },
        },
        { status: 404 }
      );
    }

    const priceRecord = plan.prices.find(
      (p) => p.billingInterval === billingInterval && p.isActive
    );

    if (!priceRecord) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_BILLING_INTERVAL",
            message: `Billing interval '${billingInterval}' is not configured for plan '${plan.name}'.`,
          },
        },
        { status: 400 }
      );
    }

    let finalAmount = priceRecord.amountRupees;
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
