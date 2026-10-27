import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        prices: {
          where: { isActive: true },
        },
        features: {
          orderBy: { featureCode: "asc" },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    const formatted = plans.map((p) => {
      const priceMap: Record<string, { amount: number; discountPercent: number }> = {};
      p.prices.forEach((pr) => {
        priceMap[pr.billingInterval] = {
          amount: pr.amountRupees,
          discountPercent: pr.discountPercent,
        };
      });

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        tier: p.tier,
        isPopular: p.isPopular,
        prices: priceMap,
        features: p.features.map((f) => ({
          code: f.featureCode,
          name: f.featureName,
          isIncluded: f.isIncluded,
          limitValue: f.limitValue,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/plans:", error);
    return NextResponse.json(
      { success: false, error: { code: "FETCH_PLANS_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
