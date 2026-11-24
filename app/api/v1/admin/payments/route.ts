import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCashfreeConfig,
  isPaymentSystemEnabled,
  getCashfreeProvider,
} from "@/lib/payments";
import { activateSubscriptionFromOrder } from "@/lib/payments/subscription-activator";

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
        { cashfreeOrderId: { contains: search, mode: "insensitive" } },
        { cashfreePaymentId: { contains: search, mode: "insensitive" } },
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
      recentWebhookLogs,
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
            select: { id: true, status: true, currentPeriodEnd: true, plan: true },
          },
        },
      }),
      prisma.paymentWebhookEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
    ]);

    const filteredTotal = await prisma.paymentOrder.count({ where });
    const config = getCashfreeConfig();

    const paymentGatewayState = {
      provider: "CASHFREE",
      status: config.isConfigured
        ? config.environment === "PROD"
          ? "LIVE_PRODUCTION"
          : "SANDBOX_ACTIVE"
        : "NEEDS_CONFIGURATION",
      environment: config.environment,
      checkoutEnabled: isPaymentSystemEnabled(),
      apiVersion: config.apiVersion,
      appUrl: config.appUrl,
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
        cashfreeOrderId: o.cashfreeOrderId,
        cashfreePaymentId: o.cashfreePaymentId,
        paymentMethod: o.paymentMethod,
        user: o.user,
        productType: o.productType,
        productId: o.productId,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        environment: o.environment,
        isTest: o.isTest,
        createdAt: o.createdAt.toISOString(),
        paidAt: o.paidAt?.toISOString(),
        verifiedAt: o.verifiedAt?.toISOString(),
        expiresAt: o.expiresAt?.toISOString(),
        subscription: o.subscription,
      })),
      webhookLogs: recentWebhookLogs.map((w) => ({
        id: w.id,
        eventId: w.eventId,
        eventType: w.eventType,
        orderId: w.orderId,
        status: w.status,
        createdAt: w.createdAt.toISOString(),
        processedAt: w.processedAt.toISOString(),
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

/**
 * POST /api/v1/admin/payments
 *
 * Admin action to trigger server-side re-verification of an order with Cashfree.
 * Strictly adheres to security rule: Never allow an admin to falsely mark an
 * unverified transaction as paid without genuine Cashfree API verification.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Strict Server-side Administrator Authorization
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const { orderId, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    if (action === "SYNC_CASHFREE") {
      const order = await prisma.paymentOrder.findFirst({
        where: {
          OR: [
            { clientOrderId: orderId },
            { gatewayOrderId: orderId },
            { cashfreeOrderId: orderId },
            { id: orderId },
          ],
        },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: "Order not found in database." },
          { status: 404 }
        );
      }

      if (!isPaymentSystemEnabled()) {
        return NextResponse.json(
          { success: false, error: "Cashfree gateway credentials not configured on server." },
          { status: 503 }
        );
      }

      const provider = getCashfreeProvider();
      const cfOrderId = order.cashfreeOrderId || order.gatewayOrderId || order.clientOrderId;
      const verification = await provider.verifyPayment(cfOrderId);

      if (verification.status === "PAID") {
        await activateSubscriptionFromOrder({
          orderId: order.id,
          cashfreePaymentId: verification.paymentId,
          paymentMethod: verification.paymentMethod,
          paidAt: verification.paidAt,
        });

        return NextResponse.json({
          success: true,
          message: "Order successfully verified with Cashfree and activated.",
          status: "PAID",
          paymentId: verification.paymentId,
        });
      } else {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: verification.status,
            lastCheckedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Cashfree reports order status as '${verification.status}'. Transaction cannot be marked as paid.`,
          status: verification.status,
        });
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Direct manual status override is prohibited. Use action 'SYNC_CASHFREE' for server verification.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process admin action" },
      { status: 500 }
    );
  }
}
