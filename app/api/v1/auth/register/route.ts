import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE_USER_ID, signSessionToken } from "@/lib/auth";
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

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "WEAK_PASSWORD", message: "Password must be at least 6 characters long" },
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.orm.public.User
      .where({ email: email.toLowerCase().trim() })
      .first();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" },
        },
        { status: 409 }
      );
    }

    let role = await prisma.orm.public.Role.where({ name: "ASPIRANT" }).first();

    if (!role) {
      role = await prisma.orm.public.Role.create({
        name: "ASPIRANT",
        description: "Standard Civil Services Aspirant",
      });
    }

    const user = await prisma.orm.public.User
      .include("role")
      .include("profile")
      .create({
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        passwordHash: hashPassword(password),
        roleId: role.id,
        profile: (p) => p.create({
          targetYear: parseInt(targetYear.toString()),
          optionalSubject,
          dailyGoalMinutes: 60,
        }),
      });

    // Set cryptographically signed authentication session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, signSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
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
    console.error("Error in POST /api/v1/auth/register:", error);
    return NextResponse.json(
      { success: false, error: { code: "REGISTRATION_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
