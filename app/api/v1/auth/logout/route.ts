import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_SESSION_TOKEN,
  COOKIE_USER_ID,
  revokeSession,
} from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokenFromCookie = cookieStore.get(COOKIE_SESSION_TOKEN)?.value;
    const authHeader = request.headers.get("authorization");
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : undefined;

    const token = tokenFromCookie || tokenFromHeader;

    if (token) {
      await revokeSession(token);
    }

    cookieStore.delete(COOKIE_SESSION_TOKEN);
    cookieStore.delete(COOKIE_USER_ID);

    return NextResponse.json({
      success: true,
      message: "Logged out successfully and session revoked",
    });
  } catch (err: any) {
    console.error("Error in logout:", err);
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  }
}
