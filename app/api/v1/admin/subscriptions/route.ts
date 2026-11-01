import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request, { requiredRole: "ADMIN" });
    if (auth.error) return auth.error;
    const user = auth.user;

    const [subscriptions, recentPayments, statusBreakdown] = await Promise.all([
      prisma.subscription.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
          plan: { select: { code: true, name: true, tier: true } },
          events: { orderBy: { createdAt: "desc" }, take: 3 },
        },
      }),
      prisma.paymentRecord.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, fullName: true } },
        },
      }),
      prisma.subscription.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        recentPayments,
        statusBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/subscriptions:", error);
    return NextResponse.json(
      { success: false, error: { code: "ADMIN_SUBS_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
