import { NextRequest, NextResponse } from "next/server";
import { revokeSession, COOKIE_SESSION_TOKEN, COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    let token = cookieStore.get(COOKIE_SESSION_TOKEN)?.value;

    if (!token && request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (token) {
      await revokeSession(token);
    }

    // Expire cookies
    cookieStore.delete(COOKIE_SESSION_TOKEN);
    cookieStore.delete(COOKIE_USER_ID);

    return NextResponse.json({
      success: true,
      message: "Logged out successfully. Session revoked.",
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: { code: "LOGOUT_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
