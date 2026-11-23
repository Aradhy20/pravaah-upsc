import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const now = new Date();

    // 1. Total users breakdown
    const totalUsers = await prisma.user.count();
    const paidSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: { gte: now },
        plan: { tier: { gt: 0 } },
      },
      include: {
        plan: {
          include: { prices: true },
        },
      },
    });

    const paidSubscribers = paidSubscriptions.length;
    const freeSubscribers = Math.max(0, totalUsers - paidSubscribers);

    // 2. Plan Distribution
    const planCounts: Record<string, number> = {
      FREE: freeSubscribers,
      BEGINNER: 0,
      ACHIEVER: 0,
      SCHOLAR: 0,
    };

    let calculatedMrr = 0;

    for (const sub of paidSubscriptions) {
      const code = sub.plan.code;
      planCounts[code] = (planCounts[code] || 0) + 1;

      // Find price for this sub's interval
      const priceObj = sub.plan.prices.find((p) => p.billingInterval === sub.billingInterval);
      const amount = priceObj?.amountRupees || 0;

      if (sub.billingInterval === "MONTHLY") {
        calculatedMrr += amount;
      } else if (sub.billingInterval === "QUARTERLY") {
        calculatedMrr += Math.round(amount / 3);
      } else if (sub.billingInterval === "ANNUAL") {
        calculatedMrr += Math.round(amount / 12);
      }
    }

    const calculatedArr = calculatedMrr * 12;

    // 3. Historical Gross Revenue & Refunds from real records
    const successfulPayments = await prisma.paymentRecord.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: true,
    });

    const totalRefunds = await prisma.refundRecord.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    });

    const failedPaymentsCount = await prisma.paymentRecord.count({
      where: { status: "FAILED" },
    });

    const grossRevenue = successfulPayments._sum.amount || 0;
    const totalRefundAmount = totalRefunds._sum.amount || 0;
    const netRevenue = Math.max(0, grossRevenue - totalRefundAmount);

    // 4. Churn & Conversion Rates
    const cancelledCount = await prisma.subscription.count({
      where: {
        status: { in: ["CANCELED", "CANCELLED", "EXPIRED"] },
        plan: { tier: { gt: 0 } },
      },
    });

    const totalEverPaid = paidSubscribers + cancelledCount;
    const churnRate = totalEverPaid > 0 ? Number(((cancelledCount / totalEverPaid) * 100).toFixed(1)) : 0;
    const conversionRate = totalUsers > 0 ? Number(((paidSubscribers / totalUsers) * 100).toFixed(1)) : 0;

    // 5. Estimated AI & Infrastructure Operating Costs
    const usageAggregate = await prisma.userUsageLedger.aggregate({
      _sum: {
        aiMentorMessagesUsed: true,
        mainsEvaluationsUsed: true,
      },
    });

    const totalAiMessages = usageAggregate._sum.aiMentorMessagesUsed || 0;
    const totalMainsEvals = usageAggregate._sum.mainsEvaluationsUsed || 0;

    // Unit economics: ₹0.20 per AI message, ₹5.00 per Mains evaluation
    const estimatedAiCost = Math.round(totalAiMessages * 0.20 + totalMainsEvals * 5.00);
    // Baseline database & server hosting cost: ₹1,500/mo
    const estimatedInfraCost = 1500;
    const estimatedTotalOperatingCost = estimatedAiCost + estimatedInfraCost;
    const contributionMargin = netRevenue > 0
      ? Number((((netRevenue - estimatedTotalOperatingCost) / netRevenue) * 100).toFixed(1))
      : 0;

    // 6. Pricing & Cohort Simulations
    const simulations = {
      conservative: {
        label: "Conservative Model (100 Paid)",
        subscribers: 100,
        mrr: 25400,
        arr: 304800,
        estimatedAiCost: 1800,
        netMargin: "78%",
      },
      base: {
        label: "Base Model (500 Paid)",
        subscribers: 500,
        mrr: 127000,
        arr: 1524000,
        estimatedAiCost: 9000,
        netMargin: "82%",
      },
      growth: {
        label: "Growth Model (1,000 Paid)",
        subscribers: 1000,
        mrr: 254000,
        arr: 3048000,
        estimatedAiCost: 18000,
        netMargin: "85%",
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          freeSubscribers,
          paidSubscribers,
          conversionRatePercent: conversionRate,
          churnRatePercent: churnRate,
          mrrRupees: calculatedMrr,
          arrRupees: calculatedArr,
          grossRevenueRupees: grossRevenue,
          refundAmountRupees: totalRefundAmount,
          netRevenueRupees: netRevenue,
          successfulTransactionsCount: successfulPayments._count,
          failedTransactionsCount: failedPaymentsCount,
        },
        planDistribution: [
          { code: "FREE", name: "Free Aspirant", tier: 0, count: planCounts.FREE || 0 },
          { code: "PLUS", name: "Aspirant Plus", tier: 1, count: planCounts.BEGINNER || 0 },
          { code: "PRO", name: "Aspirant Pro", tier: 2, count: planCounts.ACHIEVER || 0 },
          { code: "ELITE", name: "Aspirant Elite", tier: 3, count: planCounts.SCHOLAR || 0 },
        ],
        unitEconomics: {
          totalAiMessagesProcessed: totalAiMessages,
          totalMainsEvaluationsProcessed: totalMainsEvals,
          estimatedAiCostRupees: estimatedAiCost,
          estimatedInfraCostRupees: estimatedInfraCost,
          estimatedTotalOperatingCostRupees: estimatedTotalOperatingCost,
          contributionMarginPercent: contributionMargin,
        },
        simulations,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/revenue:", error);
    return NextResponse.json(
      { success: false, error: "Internal error compiling executive revenue dashboard" },
      { status: 500 }
    );
  }
}
