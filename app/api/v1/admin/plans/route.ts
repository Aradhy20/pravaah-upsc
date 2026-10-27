import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const plans = await prisma.plan.findMany({
      include: {
        prices: true,
        features: {
          orderBy: { featureCode: "asc" },
        },
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/plans:", error);
    return NextResponse.json(
      { success: false, error: { code: "ADMIN_PLANS_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { planId, name, tagline, isPopular, isActive, prices } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "planId is required" } },
        { status: 400 }
      );
    }

    // Update Plan base fields
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        ...(name !== undefined && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(isPopular !== undefined && { isPopular }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Update prices if provided
    if (Array.isArray(prices)) {
      for (const pr of prices) {
        if (pr.billingInterval && pr.amountRupees !== undefined) {
          await prisma.planPrice.updateMany({
            where: {
              planId,
              billingInterval: pr.billingInterval,
            },
            data: {
              amountRupees: pr.amountRupees,
              discountPercent: pr.discountPercent || 0,
            },
          });
        }
      }
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "UPDATE",
        entityType: "PLAN",
        entityId: planId,
        detailsJson: JSON.stringify({ name, tagline, isPopular, isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: "Plan configuration updated successfully.",
    });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/admin/plans:", error);
    return NextResponse.json(
      { success: false, error: { code: "ADMIN_PLAN_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
