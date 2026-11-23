import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, planCode, orderAmount = 0 } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or inactive promotional coupon code" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: "This coupon code has expired" },
        { status: 400 }
      );
    }

    if (coupon.currentRedemptions >= coupon.maxRedemptions) {
      return NextResponse.json(
        { success: false, error: "Coupon redemption limit has been reached" },
        { status: 400 }
      );
    }

    if (orderAmount < coupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      );
    }

    // Plan eligibility check
    if (coupon.eligiblePlans && planCode) {
      const allowed = coupon.eligiblePlans.split(",").map((p) => p.trim().toUpperCase());
      const cleanPlan = planCode.trim().toUpperCase();
      if (!allowed.includes(cleanPlan)) {
        return NextResponse.json(
          {
            success: false,
            error: `Coupon is not eligible for plan '${planCode}'`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(orderAmount, coupon.discountValue);
    }

    const finalAmount = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/coupons/validate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
