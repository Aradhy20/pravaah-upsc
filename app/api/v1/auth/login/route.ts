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

    // Transparently upgrade legacy hash to modern scrypt
    if (needsRehash) {
      try {
        const upgradedHash = hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: upgradedHash },
        });
      } catch (err) {
        console.error("Non-fatal: failed to transparently rehash password:", err);
      }
    }

    // Create cryptographically secure server-side session
    const { token: sessionToken, expiresAt } = await createSession(user.id);

    // Set secure HTTP-only session cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_SESSION_TOKEN, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      expires: expiresAt,
    });

    // Clear legacy insecure user_id cookie if present
    cookieStore.set(COOKIE_USER_ID, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        profile: user.profile,
        sessionToken,
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
