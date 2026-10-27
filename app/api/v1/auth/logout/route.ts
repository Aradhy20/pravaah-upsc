import { NextResponse } from "next/server";
import { COOKIE_USER_ID } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_USER_ID);

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
