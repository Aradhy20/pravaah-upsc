import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE_USER_ID, signSessionToken } from "@/lib/auth";
import { ensureUserProfileSchema } from "@/lib/db-sync";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, fullName, targetYear = 2027, optionalSubject = "General" } = body;

    // 1. Validate required fields
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_NAME", message: "Please enter your full name." },
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL", message: "Please provide an email address." },
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL_FORMAT", message: "Please provide a valid email address (e.g. name@example.com)." },
        },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "WEAK_PASSWORD", message: "Password must be at least 6 characters long." },
        },
        { status: 400 }
      );
    }

    // 2. Check for duplicate account
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists. Please sign in instead.",
          },
        },
        { status: 409 }
      );
    }

    // 3. Ensure UserProfile columns and foundational schema exist
    await ensureUserProfileSchema().catch(() => {});

    // 4. Parse profile parameters safely
    const parsedYear = parseInt(String(targetYear), 10) || 2027;
    const cleanOptional = typeof optionalSubject === "string" && optionalSubject.trim() ? optionalSubject.trim() : "General";

    // 5. Execute User, Profile and Default Subscription Creation within Atomic Transaction
    const executeRegistrationTx = async () => {
      return await prisma.$transaction(async (tx) => {
        // A. Ensure Role
        let role = await tx.role.findUnique({
          where: { name: "ASPIRANT" },
        });

        if (!role) {
          role = await tx.role.create({
            data: { name: "ASPIRANT", description: "Standard Civil Services Aspirant" },
          });
        }

        // B. Create User & Profile
        const user = await tx.user.create({
          data: {
            email: cleanEmail,
            fullName: fullName.trim(),
            passwordHash: hashPassword(password),
            roleId: role.id,
            profile: {
              create: {
                targetYear: parsedYear,
                targetExam: "UPSC_CSE",
                optionalSubject: cleanOptional,
                dailyGoalMinutes: 60,
                dailyStudyHours: 4.0,
                preferredLanguage: "en",
                preparationStage: "BEGINNER",
                readinessIndex: 0.0,
              },
            },
          },
          include: {
            role: true,
            profile: true,
          },
        });

        // C. Assign Default Free Subscription (Tier 0)
        const freePlan = await tx.plan.findFirst({
          where: { code: { in: ["FREE", "ASPIRANT_FOUNDATION"] } },
        });

        if (freePlan) {
          const tenYearsLater = new Date();
          tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);

          await tx.subscription.create({
            data: {
              userId: user.id,
              planId: freePlan.id,
              status: "ACTIVE",
              billingInterval: "ANNUAL",
              currentPeriodStart: new Date(),
              currentPeriodEnd: tenYearsLater,
              cancelAtPeriodEnd: false,
            },
          });
        }

        return user;
      });
    };

    let user;
    try {
      user = await executeRegistrationTx();
    } catch (txErr: any) {
      console.warn("Registration transaction initial attempt failed, re-verifying schema:", txErr.message);
      // If column mismatch occurred, re-run schema alteration and retry once
      await ensureUserProfileSchema();
      user = await executeRegistrationTx();
    }

    // 6. Set cryptographically signed authentication session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, signSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
          profile: user.profile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Technical error logging (sanitized, zero passwords/secrets logged)
    console.error("POST /api/v1/auth/register unexpected failure:", {
      message: error?.message,
      code: error?.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REGISTRATION_UNAVAILABLE",
          message: "Registration is temporarily unavailable. Please try again in a few moments.",
        },
      },
      { status: 500 }
    );
  }
}
