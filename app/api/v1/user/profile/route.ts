import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profile: profile
          ? {
              targetYear: profile.targetYear ?? 2027,
              optionalSubject: profile.optionalSubject ?? null,
              dailyGoalMinutes: profile.dailyGoalMinutes ?? 60,
            }
          : {
              targetYear: 2027,
              optionalSubject: null,
              dailyGoalMinutes: 60,
            },
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/profile:", error);
    return NextResponse.json(
      { success: false, error: { code: "PROFILE_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { fullName, targetYear, optionalSubject, dailyGoalMinutes } = body;

    // Update user's fullName if provided
    if (fullName !== undefined && fullName.trim().length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fullName: fullName.trim() },
      });
    }

    // Upsert profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(targetYear !== undefined ? { targetYear: Number(targetYear) } : {}),
        ...(optionalSubject !== undefined ? { optionalSubject } : {}),
        ...(dailyGoalMinutes !== undefined
          ? { dailyGoalMinutes: Number(dailyGoalMinutes) }
          : {}),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        targetYear: targetYear ?? 2027,
        optionalSubject: optionalSubject ?? null,
        dailyGoalMinutes: dailyGoalMinutes ?? 60,
      },
    });

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/v1/user/profile:", error);
    return NextResponse.json(
      { success: false, error: { code: "PROFILE_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
