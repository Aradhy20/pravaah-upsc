import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getGoogleOAuthConfig,
  verifyGoogleOAuthState,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  findOrCreateGoogleUser,
  GoogleUserProfile,
} from "@/lib/google-auth";
import { COOKIE_USER_ID, signSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE = "pravaah_google_oauth_state";

/**
 * GET /api/v1/auth/google/callback
 * Handles the OAuth redirect callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.warn(`[Google OAuth Callback] Google returned error: ${error}`);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error)}`, request.nextUrl.origin)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/login?error=MISSING_AUTH_CODE", request.nextUrl.origin)
      );
    }

    // 1. Verify CSRF State Token against Cookie
    const cookieStore = cookies();
    const storedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;

    if (!storedState || storedState !== state) {
      console.warn("[Google OAuth Callback] State token mismatch or expired cookie.");
      return NextResponse.redirect(
        new URL("/login?error=INVALID_OAUTH_STATE", request.nextUrl.origin)
      );
    }

    const stateCheck = verifyGoogleOAuthState(state);
    if (!stateCheck.isValid) {
      console.warn(`[Google OAuth Callback] Invalid state: ${stateCheck.error}`);
      return NextResponse.redirect(
        new URL("/login?error=EXPIRED_OAUTH_STATE", request.nextUrl.origin)
      );
    }

    const returnTo = stateCheck.returnTo || "/dashboard";

    let profile: GoogleUserProfile;

    // 2. Handle Development / Sandbox Simulated Code
    if (code.startsWith("mock_")) {
      try {
        const rawMock = Buffer.from(code.replace("mock_", ""), "base64url").toString("utf-8");
        const mockData = JSON.parse(rawMock);
        profile = {
          email: mockData.email || `mock_aspirant_${Date.now()}@gmail.com`,
          fullName: mockData.name || "Google Aspirant",
          googleId: mockData.sub || `google_mock_${Date.now()}`,
          avatarUrl: mockData.picture || "https://lh3.googleusercontent.com/a/default-user",
        };
      } catch {
        return NextResponse.redirect(
          new URL("/login?error=INVALID_MOCK_CODE", request.nextUrl.origin)
        );
      }
    } else {
      // 3. Exchange Authorization Code for Tokens
      const config = getGoogleOAuthConfig(request.nextUrl.origin);
      if (!config.isConfigured) {
        return NextResponse.redirect(
          new URL("/login?error=GOOGLE_CLIENT_NOT_CONFIGURED", request.nextUrl.origin)
        );
      }

      const { accessToken } = await exchangeGoogleCode(
        code,
        config.redirectUri,
        config.clientId,
        config.clientSecret
      );

      // 4. Retrieve User Profile from Google
      profile = await fetchGoogleUserInfo(accessToken);
    }

    // 5. Find or Provision User
    const { user } = await findOrCreateGoogleUser(profile);

    // 6. Set Signed Session Cookie and clear state cookie
    cookieStore.set(COOKIE_USER_ID, signSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    cookieStore.delete(GOOGLE_STATE_COOKIE);

    // 7. Redirect to Destination
    const destinationUrl = new URL(returnTo, request.nextUrl.origin);
    return NextResponse.redirect(destinationUrl);
  } catch (err: any) {
    console.error("[Google OAuth Callback] Unexpected failure:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || "GOOGLE_CALLBACK_FAILED")}`, request.nextUrl.origin)
    );
  }
}
