import crypto from "crypto";
import { prisma } from "./prisma";
import { hashPassword } from "./auth";

export interface GoogleUserProfile {
  email: string;
  fullName: string;
  googleId: string;
  avatarUrl?: string | null;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "pravaah_auth_secret_token_2026_super_secure_key";

export function getGoogleOAuthConfig(reqOrigin?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const appUrl =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    reqOrigin ||
    "http://localhost:3000";

  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/v1/auth/google/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

/**
 * Generate a cryptographically signed CSRF state token
 */
export function createGoogleOAuthState(returnTo = "/dashboard"): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const payload = JSON.stringify({ nonce, timestamp, returnTo });
  const b64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(b64Payload)
    .digest("hex");
  return `${b64Payload}.${signature}`;
}

/**
 * Verify a CSRF state token and ensure it is not expired (< 15 mins)
 */
export function verifyGoogleOAuthState(
  state: string
): { isValid: boolean; returnTo: string; error?: string } {
  if (!state || !state.includes(".")) {
    return { isValid: false, returnTo: "/dashboard", error: "Missing or malformed state token" };
  }

  const [b64Payload, signature] = state.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(b64Payload)
    .digest("hex");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return { isValid: false, returnTo: "/dashboard", error: "State signature verification failed" };
  }

  try {
    const raw = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const data = JSON.parse(raw);

    // Expire state after 15 minutes (900,000 ms)
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
      return { isValid: false, returnTo: "/dashboard", error: "State token has expired" };
    }

    const returnTo =
      typeof data.returnTo === "string" && data.returnTo.startsWith("/")
        ? data.returnTo
        : "/dashboard";

    return { isValid: true, returnTo };
  } catch (err: any) {
    return { isValid: false, returnTo: "/dashboard", error: "Failed to parse state payload" };
  }
}

/**
 * Build the standard Google OAuth 2.0 Consent URL
 */
export function getGoogleAuthUrl(state: string, redirectUri: string, clientId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Google Access & ID Tokens
 */
export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; idToken?: string }> {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return {
    accessToken: json.access_token,
    idToken: json.id_token,
  };
}

/**
 * Fetch verified profile from Google UserInfo endpoint
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch Google user info (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.email) {
    throw new Error("Google account did not return a valid email address");
  }

  return {
    googleId: data.sub,
    email: data.email.toLowerCase().trim(),
    fullName: data.name || data.given_name || data.email.split("@")[0],
    avatarUrl: data.picture || null,
  };
}

/**
 * Verify Google ID token directly (via Google's tokeninfo API)
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserProfile> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google ID token verification failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.email) {
    throw new Error("Invalid Google token: email missing");
  }

  return {
    googleId: data.sub,
    email: data.email.toLowerCase().trim(),
    fullName: data.name || data.email.split("@")[0],
    avatarUrl: data.picture || null,
  };
}

import { ensureUserProfileSchema } from "@/lib/db-sync";

/**
 * Find existing user or provision a new Aspirant account for Google Sign-In
 */
export async function findOrCreateGoogleUser(profile: GoogleUserProfile) {
  const normalizedEmail = profile.email.toLowerCase().trim();

  // Ensure UserProfile columns and foundational schema exist
  await ensureUserProfileSchema().catch(() => {});

  // 1. Try finding by unique Google ID or verified email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: profile.googleId },
        { email: normalizedEmail },
      ],
    },
    include: {
      role: true,
      profile: true,
    },
  });

  // 2. User exists: update Google ID or avatar if needed
  if (user) {
    const updates: any = {};
    if (!user.googleId && profile.googleId) {
      updates.googleId = profile.googleId;
    }
    if (!user.avatarUrl && profile.avatarUrl) {
      updates.avatarUrl = profile.avatarUrl;
    }

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
        include: {
          role: true,
          profile: true,
        },
      });
    }

    return { user, isNew: false };
  }

  // 3. User does not exist: Provision new Aspirant account within atomic transaction
  const executeGoogleProvisioningTx = async () => {
    return await prisma.$transaction(async (tx) => {
      let role = await tx.role.findUnique({
        where: { name: "ASPIRANT" },
      });

      if (!role) {
        role = await tx.role.create({
          data: { name: "ASPIRANT", description: "Standard Civil Services Aspirant" },
        });
      }

      // Generate an unguessable cryptographic password hash for the Google user
      const randomPassword = crypto.randomBytes(32).toString("hex");

      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName: profile.fullName || normalizedEmail.split("@")[0],
          passwordHash: hashPassword(randomPassword),
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl || null,
          roleId: role.id,
          profile: {
            create: {
              targetYear: 2027,
              targetExam: "UPSC_CSE",
              dailyGoalMinutes: 60,
              dailyStudyHours: 4.0,
              preferredLanguage: "en",
              preparationStage: "BEGINNER",
              readinessIndex: 0.0,
              optionalSubject: "General",
            },
          },
        },
        include: {
          role: true,
          profile: true,
        },
      });

      // Default Free Plan Subscription Assignment
      const freePlan = await tx.plan.findFirst({
        where: { code: { in: ["FREE", "ASPIRANT_FOUNDATION"] } },
      });

      if (freePlan) {
        const tenYearsLater = new Date();
        tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);

        await tx.subscription.create({
          data: {
            userId: newUser.id,
            planId: freePlan.id,
            status: "ACTIVE",
            billingInterval: "ANNUAL",
            currentPeriodStart: new Date(),
            currentPeriodEnd: tenYearsLater,
            cancelAtPeriodEnd: false,
          },
        });
      }

      return newUser;
    });
  };

  let newUser;
  try {
    newUser = await executeGoogleProvisioningTx();
  } catch (err: any) {
    console.warn("Google provisioning initial attempt notice, re-verifying schema:", err.message);
    await ensureUserProfileSchema();
    newUser = await executeGoogleProvisioningTx();
  }

  return { user: newUser, isNew: true };
}
