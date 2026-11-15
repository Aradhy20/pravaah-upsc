import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { signSessionToken, COOKIE_USER_ID, getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // In production, block arbitrary unauthenticated role switching
    if (process.env.NODE_ENV === "production") {
      const caller = await getAuthenticatedUser(request);
      if (!caller || caller.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "Role switching is disabled in production." } },
          { status: 403 }
        );
      }
    }

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

    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, signSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
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
