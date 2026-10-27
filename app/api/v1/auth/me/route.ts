import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserSubscription } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          user: null,
          subscription: { tier: 0, planName: "Guest", isPaid: false },
        },
      });
    }

    const [subscription, userRecord] = await Promise.all([
      getUserSubscription(user.id),
      prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profile: userRecord?.profile || null,
        },
        subscription,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/auth/me:", error);
    return NextResponse.json(
      { success: false, error: { code: "AUTH_CHECK_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
