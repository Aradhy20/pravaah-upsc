import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

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

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        passwordHash: hashPassword(password),
        roleId: role.id,
        profile: {
          create: {
            targetYear: parseInt(targetYear.toString()),
            optionalSubject,
            dailyGoalMinutes: 60,
          },
        },
      },
      include: {
        role: true,
        profile: true,
      },
    });

    // Set authentication session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, user.id, {
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
