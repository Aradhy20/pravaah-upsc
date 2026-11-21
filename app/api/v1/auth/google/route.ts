import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getGoogleOAuthConfig,
  createGoogleOAuthState,
  getGoogleAuthUrl,
  verifyGoogleIdToken,
  findOrCreateGoogleUser,
} from "@/lib/google-auth";
import { COOKIE_USER_ID, signSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const GOOGLE_STATE_COOKIE = "pravaah_google_oauth_state";

/**
 * GET /api/v1/auth/google
 * Initiates the Google OAuth 2.0 flow
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnTo = searchParams.get("returnTo") || "/dashboard";
    const simulate = searchParams.get("simulate") === "true";

    const config = getGoogleOAuthConfig(request.nextUrl.origin);
    const state = createGoogleOAuthState(returnTo);

    const cookieStore = cookies();
    cookieStore.set(GOOGLE_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
      sameSite: "lax",
    });

    // Sandbox / Test simulation mode (when Google credentials are not yet configured in local environment)
    if (simulate || !config.isConfigured) {
      if (!config.isConfigured && !simulate) {
        // If credentials are completely unconfigured, redirect to login with informative query
        // or offer simulated Google auth in development
        if (process.env.NODE_ENV === "development") {
          const testEmail = searchParams.get("testEmail") || "aspirant.google@gmail.com";
          const testName = searchParams.get("testName") || "Google Aspirant";
          const testSub = searchParams.get("testSub") || "google_usr_mock_123456";

          const mockCode = Buffer.from(
            JSON.stringify({ email: testEmail, name: testName, sub: testSub })
          ).toString("base64url");

          const callbackUrl = new URL("/api/v1/auth/google/callback", request.nextUrl.origin);
          callbackUrl.searchParams.set("code", `mock_${mockCode}`);
          callbackUrl.searchParams.set("state", state);

          return NextResponse.redirect(callbackUrl.toString());
        }

        return NextResponse.redirect(
          new URL("/login?error=GOOGLE_CLIENT_NOT_CONFIGURED", request.nextUrl.origin)
        );
      }

      if (simulate) {
        const testEmail = searchParams.get("testEmail") || `simulated_google_${Date.now()}@gmail.com`;
        const testName = searchParams.get("testName") || "Verified Google Aspirant";
        const testSub = `google_mock_${Date.now()}`;

        const mockCode = Buffer.from(
          JSON.stringify({ email: testEmail, name: testName, sub: testSub })
        ).toString("base64url");

        const callbackUrl = new URL("/api/v1/auth/google/callback", request.nextUrl.origin);
        callbackUrl.searchParams.set("code", `mock_${mockCode}`);
        callbackUrl.searchParams.set("state", state);

        return NextResponse.redirect(callbackUrl.toString());
      }
    }

    // Standard Google OAuth 2.0 redirection
    const authUrl = getGoogleAuthUrl(state, config.redirectUri, config.clientId);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Error in GET /api/v1/auth/google:", error);
    return NextResponse.redirect(
      new URL("/login?error=GOOGLE_AUTH_INITIATION_FAILED", request.nextUrl.origin)
    );
  }
}

/**
 * POST /api/v1/auth/google
 * Direct authentication endpoint for Google One Tap or Google ID token exchange
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { credential, idToken, simulate, testUser } = body;

    let googleProfile: {
      email: string;
      fullName: string;
      googleId: string;
      avatarUrl?: string | null;
    };

    // 1. Check for development simulation
    if (simulate && (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || !process.env.GOOGLE_CLIENT_ID)) {
      const email = testUser?.email || `simulated_${Date.now()}@gmail.com`;
      const fullName = testUser?.name || "Simulated Google Aspirant";
      const googleId = testUser?.sub || `google_sim_${Date.now()}`;
      const avatarUrl = testUser?.picture || "https://lh3.googleusercontent.com/a/default-user";

      googleProfile = { email, fullName, googleId, avatarUrl };
    } else {
      const token = credential || idToken;
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MISSING_GOOGLE_CREDENTIAL",
              message: "Google credential / ID token is required",
            },
          },
          { status: 400 }
        );
      }

      // Verify Google ID Token
      googleProfile = await verifyGoogleIdToken(token);
    }

    // 2. Find or Provision User in PostgreSQL
    const { user, isNew } = await findOrCreateGoogleUser(googleProfile);

    // 3. Set Signed Session Cookie
    const cookieStore = cookies();
    cookieStore.set(COOKIE_USER_ID, signSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role.name,
          profile: user.profile,
          isNewAccount: isNew,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/auth/google:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GOOGLE_AUTH_FAILED",
          message: error.message || "Failed to authenticate with Google",
        },
      },
      { status: 401 }
    );
  }
}
