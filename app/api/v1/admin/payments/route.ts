import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activateEntitlementForOrder } from "@/lib/payments/upi-gateway";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Authorize admin
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrative privileges required to access financial records.",
          },
        },
        { status: 403 }
      );
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

    // 3. Financial Metrics & Telemetry Aggregation
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
      reviewQueue,
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
      prisma.paymentOrder.findMany({
        where: { status: "UNDER_REVIEW" },
        orderBy: { updatedAt: "desc" },
        take: 15,
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    const filteredTotal = await prisma.paymentOrder.count({ where });

    const receivingAccount = {
      upiId: process.env.UPI_RECEIVING_ID || "jainaradhy123@okicici",
      payeeName: process.env.UPI_PAYEE_NAME || "Aradhy Jain",
      app: process.env.UPI_APPLICATION || "Google Pay",
      bank: process.env.UPI_BANK || "ICICI Bank",
      status: "ACTIVE",
      type: "PERSONAL_RETAIL_VPA",
      verificationMethod: "MANUAL_UTR_REVIEW",
    };

    return NextResponse.json({
      success: true,
      receivingAccount,
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
      reviewQueue: reviewQueue.map((q) => ({
        id: q.id,
        clientOrderId: q.clientOrderId,
        user: q.user,
        amount: q.amount,
        productId: q.productId,
        productType: q.productType,
        utr: q.utr,
        updatedAt: q.updatedAt.toISOString(),
      })),
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
    // 1. Authorize admin
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrative privileges required to perform payment operations.",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, orderId, utr, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    // Locate the order
    const order = await prisma.paymentOrder.findFirst({
      where: {
        OR: [
          { clientOrderId: orderId },
          { gatewayOrderId: orderId },
          { id: orderId },
        ],
      },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order ${orderId} not found` },
        { status: 404 }
      );
    }

    if (action === "verify_utr" || action === "activate_order") {
      const finalUtr = (utr || order.utr || "MANUAL_ADMIN_VERIFIED").trim().toUpperCase();

      // Idempotency: if order is already PAID, return current state without re-creating records
      if (order.status === "PAID") {
        return NextResponse.json({
          success: true,
          message: `Order ${order.clientOrderId} is already verified and paid.`,
          data: {
            orderId: order.clientOrderId,
            status: "PAID",
            utr: order.utr || finalUtr,
            amount: order.amount,
          },
        });
      }

      // Check duplicate UTR on other paid orders
      const existingPaid = await prisma.paymentOrder.findFirst({
        where: {
          utr: finalUtr,
          status: "PAID",
          id: { not: order.id },
        },
      });

      if (existingPaid) {
        return NextResponse.json(
          {
            success: false,
            error: `UTR ${finalUtr} is already attached to paid order ${existingPaid.clientOrderId}`,
          },
          { status: 409 }
        );
      }

      // Activate entitlement transactionally
      await activateEntitlementForOrder({
        paymentOrderId: order.id,
        utr: finalUtr,
        paidAt: new Date(),
      });

      // Also create a confirmed PaymentRecord
      await prisma.paymentRecord.create({
        data: {
          userId: order.userId,
          subscriptionId: order.subscriptionId,
          amount: order.amount,
          currency: "INR",
          status: "SUCCESS",
          provider: "UPI_DIRECT",
          providerTxId: finalUtr,
          paymentMethod: "UPI",
          receiptNumber: `REC_${order.clientOrderId.slice(-8)}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.clientOrderId} verified with UTR ${finalUtr} and subscription activated.`,
        data: {
          orderId: order.clientOrderId,
          status: "PAID",
          utr: finalUtr,
          amount: order.amount,
        },
      });
    }

    if (action === "reject_order") {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          metadataJson: JSON.stringify({
            rejectionReason: reason || "Manual admin rejection: UTR not found on statement",
            rejectedAt: new Date().toISOString(),
            rejectedBy: user.email,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.clientOrderId} marked as FAILED.`,
        data: {
          orderId: order.clientOrderId,
          status: "FAILED",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/payments:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute payment action" },
      { status: 500 }
    );
  }
}
