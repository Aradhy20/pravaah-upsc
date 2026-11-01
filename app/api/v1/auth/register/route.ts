import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, COOKIE_SESSION_TOKEN, COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, targetYear = 2027, optionalSubject = "General" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PAYLOAD", message: "email, password, and fullName are required" },
        },
        { status: 400 }
      );
    }

    if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_NAME", message: "Full name must be between 2 and 100 characters." },
        },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "WEAK_PASSWORD", message: "Password must be at least 8 characters long." },
        },
        { status: 400 }
      );
    }

    const yearNum = Number(targetYear);
    if (isNaN(yearNum) || yearNum < 2026 || yearNum > 2035) {
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

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" },
        },
        { status: 409 }
      );
    }

    let role = await prisma.role.findUnique({
      where: { name: "ASPIRANT" },
    });

    if (!role) {
      role = await prisma.role.create({
        data: { name: "ASPIRANT", description: "Standard Civil Services Aspirant" },
      });
    }

    // Hash password with scrypt and unique random salt
    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        passwordHash,
        roleId: role.id,
        profile: {
          create: {
            targetYear: yearNum,
            optionalSubject: optionalSubject ? String(optionalSubject).trim() : null,
            dailyGoalMinutes: 60,
          },
        },
      },
      include: {
        role: true,
        profile: true,
      },
    });

    // Create session
    const { token, expiresAt } = await createSession(user.id);

    // Set authentication session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_SESSION_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      expires: expiresAt,
    });

    cookieStore.delete(COOKIE_USER_ID);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
          profile: user.profile,
          sessionToken: token,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/register:", error);
    return NextResponse.json(
      { success: false, error: { code: "REGISTRATION_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
