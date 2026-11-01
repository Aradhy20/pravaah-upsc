import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  createSession,
  COOKIE_SESSION_TOKEN,
  COOKIE_USER_ID,
} from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_PAYLOAD", message: "email and password are required" },
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

    // Verify password securely using scrypt or legacy SHA-256 fallback
    // Demo bypasses are completely eliminated
    const { valid, needsRehash } = verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        },
        { status: 401 }
      );
    }

    // Transparent password migration: upgrade legacy SHA-256 to salted scrypt immediately
    if (needsRehash) {
      try {
        const upgradedHash = hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: upgradedHash },
        });
      } catch (migrationError) {
        console.error("Non-fatal password migration error:", migrationError);
      }
    }

    // Generate cryptographically secure server-side session token
    const { token, expiresAt } = await createSession(user.id);

    // Set secure HttpOnly session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_SESSION_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      expires: expiresAt,
    });

    // Delete obsolete legacy cookie if present
    cookieStore.delete(COOKIE_USER_ID);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        profile: user.profile,
        sessionToken: token, // Returned for programmatic API / mobile clients
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/login:", error);
    return NextResponse.json(
      { success: false, error: { code: "LOGIN_FAILED", message: "Authentication service encountered an error" } },
      { status: 500 }
    );
  }
}
