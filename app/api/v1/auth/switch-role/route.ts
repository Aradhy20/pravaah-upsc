import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_SESSION_TOKEN, COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Prohibit client-selected role switching in production runtime
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Role switching is strictly disabled in production environments.",
        },
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const targetRole = body.role === "ADMIN" ? "ADMIN" : "ASPIRANT";

    const targetEmail = targetRole === "ADMIN" ? "admin@pravaah.in" : "aspirant@pravaah.in";
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: `Demo user for ${targetRole} not found` } },
        { status: 404 }
      );
    }

    const { token, expiresAt } = await createSession(user.id);

    const cookieStore = cookies();
    cookieStore.set(COOKIE_SESSION_TOKEN, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      expires: expiresAt,
    });
    cookieStore.delete(COOKIE_USER_ID);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
        sessionToken: token,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/switch-role:", error);
    return NextResponse.json(
      { success: false, error: { code: "AUTH_SWITCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
