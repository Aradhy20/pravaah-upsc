import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

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
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await request.json();
    const { fullName, targetYear, optionalSubject, dailyGoalMinutes } = body;

    // 1. Full name validation
    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_FULL_NAME",
              message: "Full name must be a string between 2 and 100 characters.",
            },
          },
          { status: 400 }
        );
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { fullName: fullName.trim() },
      });
    }

    // 2. Target year validation (strict upcoming cycles: 2026 - 2035)
    let validatedTargetYear: number | undefined;
    if (targetYear !== undefined) {
      const yearNum = Number(targetYear);
      if (!Number.isInteger(yearNum) || yearNum < 2026 || yearNum > 2035) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TARGET_YEAR",
              message: "Target year must be an upcoming examination cycle between 2026 and 2035.",
            },
          },
          { status: 400 }
        );
      }
      validatedTargetYear = yearNum;
    }

    // 3. Daily study target minutes validation (15 - 720 minutes)
    let validatedDailyMinutes: number | undefined;
    if (dailyGoalMinutes !== undefined) {
      const minNum = Number(dailyGoalMinutes);
      if (!Number.isInteger(minNum) || minNum < 15 || minNum > 720) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_DAILY_MINUTES",
              message: "Daily goal minutes must be an integer between 15 and 720 minutes (15 mins to 12 hours).",
            },
          },
          { status: 400 }
        );
      }
      validatedDailyMinutes = minNum;
    }

    // 4. Optional subject validation
    let sanitizedOptionalSubject: string | null | undefined;
    if (optionalSubject !== undefined) {
      if (optionalSubject === null) {
        sanitizedOptionalSubject = null;
      } else if (typeof optionalSubject === "string") {
        sanitizedOptionalSubject = optionalSubject.trim().slice(0, 80);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_OPTIONAL_SUBJECT",
              message: "Optional subject must be a string or null.",
            },
          },
          { status: 400 }
        );
      }
    }

    // Upsert profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(validatedTargetYear !== undefined ? { targetYear: validatedTargetYear } : {}),
        ...(sanitizedOptionalSubject !== undefined ? { optionalSubject: sanitizedOptionalSubject } : {}),
        ...(validatedDailyMinutes !== undefined ? { dailyGoalMinutes: validatedDailyMinutes } : {}),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        targetYear: validatedTargetYear ?? 2027,
        optionalSubject: sanitizedOptionalSubject ?? null,
        dailyGoalMinutes: validatedDailyMinutes ?? 60,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        fullName: fullName ? fullName.trim() : user.fullName,
        profile: updatedProfile,
      },
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/v1/user/profile:", error);
    return NextResponse.json(
      { success: false, error: { code: "PROFILE_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
