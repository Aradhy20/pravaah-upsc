import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllCanonicalPlans, normalizePlanCode } from "@/lib/payments/pricing-catalogue";

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

    if (plans.length > 0) {
      const formatted = plans.map((p) => {
        const priceMap: Record<string, { amount: number; discountPercent: number }> = {};
        p.prices.forEach((pr) => {
          priceMap[pr.billingInterval] = {
            amount: pr.amountRupees,
            discountPercent: pr.discountPercent,
          };
        });

        const canonicalCode = normalizePlanCode(p.code);

        return {
          id: p.id,
          code: p.code,
          canonicalCode,
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
    }

    return NextResponse.json({
      success: true,
      data: getFallbackPlans(),
    });
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/plans:", error.message);
    return NextResponse.json({
      success: true,
      data: getFallbackPlans(),
    });
  }
}

function getFallbackPlans() {
  return getAllCanonicalPlans().map((p) => ({
    id: `plan_${p.code.toLowerCase()}`,
    code: p.code,
    canonicalCode: p.code,
    name: p.name,
    tagline: p.tagline,
    tier: p.tier,
    isPopular: p.isPopular,
    prices: {
      MONTHLY: { amount: p.prices.MONTHLY.amountRupees, discountPercent: p.prices.MONTHLY.savingsPercent },
      QUARTERLY: { amount: p.prices.QUARTERLY.amountRupees, discountPercent: p.prices.QUARTERLY.savingsPercent },
      ANNUAL: { amount: p.prices.ANNUAL.amountRupees, discountPercent: p.prices.ANNUAL.savingsPercent },
    },
    features: p.features,
  }));
}
