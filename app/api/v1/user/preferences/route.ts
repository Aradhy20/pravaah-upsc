import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { ensureUserProfileSchema } from "@/lib/db-sync";

export const dynamic = "force-dynamic";

function safeParseArray(val?: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await ensureUserProfileSchema().catch(() => {});

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        targetYear: profile?.targetYear || 2027,
        targetExam: profile?.targetExam || "UPSC_CSE",
        preparationStage: profile?.preparationStage || "BEGINNER",
        preferredLanguage: profile?.preferredLanguage || "en",
        dailyStudyHours: profile?.dailyStudyHours || 4.0,
        optionalSubject: profile?.optionalSubject || null,
        strongSubjects: safeParseArray(profile?.strongSubjects),
        weakSubjects: safeParseArray(profile?.weakSubjects),
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

    await ensureUserProfileSchema().catch(() => {});

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
        targetYear: targetYear ? parseInt(targetYear) : 2027,
        targetExam: "UPSC_CSE",
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
        strongSubjects: safeParseArray(updatedProfile.strongSubjects),
        weakSubjects: safeParseArray(updatedProfile.weakSubjects),
      },
    });
  } catch (error: any) {
    console.error("PUT /api/v1/user/preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
