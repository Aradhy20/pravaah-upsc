import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-side Administrator Authorization
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    // 2. Build Prisma Filter Conditions
    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { clientOrderId: { contains: search, mode: "insensitive" } },
        { gatewayOrderId: { contains: search, mode: "insensitive" } },
        { utr: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { fullName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // 3. Financial Metrics & Historical Telemetry Aggregation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      paidOrdersCount,
      pendingOrdersCount,
      expiredOrdersCount,
      failedOrdersCount,
      underReviewCount,
      paidSum,
      todayPaidSum,
      monthPaidSum,
      orders,
    ] = await Promise.all([
      prisma.paymentOrder.count(),
      prisma.paymentOrder.count({ where: { status: "PAID" } }),
      prisma.paymentOrder.count({ where: { status: "PENDING" } }),
      prisma.paymentOrder.count({ where: { status: "EXPIRED" } }),
      prisma.paymentOrder.count({ where: { status: "FAILED" } }),
      prisma.paymentOrder.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.paymentOrder.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.paymentOrder.aggregate({
        where: { status: "PAID", paidAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      prisma.paymentOrder.aggregate({
        where: { status: "PAID", paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.paymentOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
          subscription: {
            select: { id: true, status: true, currentPeriodEnd: true },
          },
        },
      }),
    ]);

    const filteredTotal = await prisma.paymentOrder.count({ where });

    const paymentGatewayState = {
      provider: "CASHFREE",
      status: "DISABLED_PENDING_MERCHANT_APPROVAL",
      checkoutEnabled: false,
      message: "Cashfree merchant onboarding is currently under review. Online checkout is safely disabled.",
    };

    return NextResponse.json({
      success: true,
      paymentGatewayState,
      telemetry: {
        totalRevenue: paidSum._sum.amount || 0,
        todayRevenue: todayPaidSum._sum.amount || 0,
        monthRevenue: monthPaidSum._sum.amount || 0,
        totalOrdersCount: totalOrders,
        successfulCount: paidOrdersCount,
        pendingCount: pendingOrdersCount,
        expiredCount: expiredOrdersCount,
        failedCount: failedOrdersCount,
        underReviewCount,
      },
      orders: orders.map((o) => ({
        id: o.id,
        clientOrderId: o.clientOrderId,
        gatewayOrderId: o.gatewayOrderId,
        user: o.user,
        productType: o.productType,
        productId: o.productId,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        environment: o.environment,
        isTest: o.isTest,
        utr: o.utr,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString(),
        expiresAt: o.expiresAt?.toISOString(),
        subscription: o.subscription,
      })),
      pagination: {
        total: filteredTotal,
        page,
        limit,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve financial transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Strict Server-side Administrator Authorization
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MANUAL_OPERATIONS_DISCONTINUED",
          message:
            "Manual payment verification and UTR review workflows have been permanently discontinued. All online transactions will be handled through Cashfree once approved.",
        },
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
