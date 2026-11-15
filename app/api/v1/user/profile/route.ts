import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userAuth = await getAuthenticatedUser(request);
    if (!userAuth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = userAuth.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: { select: { name: true } },
        profile: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const activeSub = user.subscriptions[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        targetYear: user.profile?.targetYear || 2026,
        optionalSubject: user.profile?.optionalSubject || "Not Selected",
        dailyGoalMinutes: user.profile?.dailyGoalMinutes || 60,
        planCode: activeSub?.plan?.code || "FREE",
        planName: activeSub?.plan?.name || "Foundation",
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userAuth = await getAuthenticatedUser(request);
    if (!userAuth) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const userId = userAuth.id;

    const body = await request.json();
    const { targetYear, optionalSubject, dailyGoalMinutes, fullName } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && typeof fullName === "string" ? { fullName: fullName.trim() } : {}),
        profile: {
          upsert: {
            create: {
              targetYear: targetYear ? parseInt(targetYear.toString()) : 2026,
              optionalSubject: optionalSubject || "General Studies",
              dailyGoalMinutes: dailyGoalMinutes ? parseInt(dailyGoalMinutes.toString()) : 60,
            },
            update: {
              ...(targetYear !== undefined ? { targetYear: parseInt(targetYear.toString()) } : {}),
              ...(optionalSubject !== undefined ? { optionalSubject: String(optionalSubject) } : {}),
              ...(dailyGoalMinutes !== undefined ? { dailyGoalMinutes: parseInt(dailyGoalMinutes.toString()) } : {}),
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        targetYear: updatedUser.profile?.targetYear,
        optionalSubject: updatedUser.profile?.optionalSubject,
        dailyGoalMinutes: updatedUser.profile?.dailyGoalMinutes,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/v1/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
