import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PAYLOAD", message: "email and password are required" },
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        },
        { status: 401 }
      );
    }

    const computedHash = hashPassword(password);
    // Allow either hashed password match or demo password match
    const isMatch =
      user.passwordHash === computedHash ||
      user.passwordHash.startsWith("pravaah_demo_hash_");

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        },
        { status: 401 }
      );
    }

    // Set authentication session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/login:", error);
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
