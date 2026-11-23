import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        targetYear: profile?.targetYear || 2026,
        targetExam: profile?.targetExam || "UPSC_CSE",
        preparationStage: profile?.preparationStage || "BEGINNER",
        preferredLanguage: profile?.preferredLanguage || "en",
        dailyStudyHours: profile?.dailyStudyHours || 4.0,
        optionalSubject: profile?.optionalSubject || null,
        strongSubjects: profile?.strongSubjects ? JSON.parse(profile.strongSubjects) : [],
        weakSubjects: profile?.weakSubjects ? JSON.parse(profile.weakSubjects) : [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/user/preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const {
      targetYear,
      preparationStage,
      preferredLanguage,
      dailyStudyHours,
      optionalSubject,
      strongSubjects,
      weakSubjects,
    } = body;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        targetYear: targetYear ? parseInt(targetYear) : 2026,
        preparationStage: preparationStage || "BEGINNER",
        preferredLanguage: preferredLanguage || "en",
        dailyStudyHours: dailyStudyHours ? parseFloat(dailyStudyHours) : 4.0,
        optionalSubject: optionalSubject || null,
        strongSubjects: strongSubjects ? JSON.stringify(strongSubjects) : "[]",
        weakSubjects: weakSubjects ? JSON.stringify(weakSubjects) : "[]",
      },
      update: {
        targetYear: targetYear !== undefined ? parseInt(targetYear) : undefined,
        preparationStage: preparationStage !== undefined ? preparationStage : undefined,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
        dailyStudyHours: dailyStudyHours !== undefined ? parseFloat(dailyStudyHours) : undefined,
        optionalSubject: optionalSubject !== undefined ? optionalSubject : undefined,
        strongSubjects: strongSubjects !== undefined ? JSON.stringify(strongSubjects) : undefined,
        weakSubjects: weakSubjects !== undefined ? JSON.stringify(weakSubjects) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        targetYear: updatedProfile.targetYear,
        preparationStage: updatedProfile.preparationStage,
        preferredLanguage: updatedProfile.preferredLanguage,
        dailyStudyHours: updatedProfile.dailyStudyHours,
        optionalSubject: updatedProfile.optionalSubject,
        strongSubjects: updatedProfile.strongSubjects ? JSON.parse(updatedProfile.strongSubjects) : [],
        weakSubjects: updatedProfile.weakSubjects ? JSON.parse(updatedProfile.weakSubjects) : [],
      },
    });
  } catch (error: any) {
    console.error("PUT /api/v1/user/preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student preferences" },
      { status: 500 }
    );
  }
}
