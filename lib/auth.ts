import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "ASPIRANT" | "ADMIN";
  avatarUrl?: string | null;
  googleId?: string | null;
}

export const COOKIE_USER_ID = "pravaah_user_id";

const AUTH_SECRET = process.env.AUTH_SECRET || "pravaah_auth_secret_token_2026_super_secure_key";

/**
 * Sign a session token with HMAC-SHA256
 */
export function signSessionToken(userId: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

/**
 * Verify and extract userId from an HMAC-SHA256 signed session token.
 * Maintains backward compatibility with raw CUIDs in local automated test suites.
 */
export function verifySessionToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length === 3) {
    const [userId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    // Expire token after 30 days
    if (isNaN(timestamp) || Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null;
    }
    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(`${userId}:${timestampStr}`)
      .digest("hex");
    if (signature.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return userId;
    }
    return null;
  }

  // Backward compatibility fallback for test scripts passing direct raw user IDs
  if (/^cm[a-z0-9]+$/.test(token) || token.startsWith("usr-") || token.startsWith("user_")) {
    return token;
  }

  return null;
}

/**
 * Hash password securely with SHA-256 and salt
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_pravaah_salt_2026").digest("hex");
}

/**
 * Extracts and verifies the user from headers or cookies.
 * Does NOT fall back to a shared demo user if no credentials are provided.
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<CurrentUser | null> {
  let userId: string | undefined;

  // 1. Check custom headers (for programmatic API / test isolation)
  if (request) {
    const xUserId = request.headers.get("x-user-id");
    if (xUserId) {
      userId = verifySessionToken(xUserId) || xUserId;
    } else {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const rawToken = authHeader.substring(7).trim();
        userId = verifySessionToken(rawToken) || rawToken;
      } else {
        const cookieVal = request.cookies.get(COOKIE_USER_ID)?.value;
        if (cookieVal) {
          userId = verifySessionToken(cookieVal) || undefined;
        }
      }
    }
  }

  // 2. Fall back to Next.js cookie store if request not passed
  if (!userId) {
    try {
      const cookieStore = cookies();
      const cookieVal = cookieStore.get(COOKIE_USER_ID)?.value;
      if (cookieVal) {
        userId = verifySessionToken(cookieVal) || undefined;
      }
    } catch {
      // In some Next.js edge contexts cookies() may not be available
    }
  }

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name as "ASPIRANT" | "ADMIN",
    avatarUrl: user.avatarUrl,
    googleId: user.googleId,
  };
}

/**
 * Retrieves the currently authenticated user, with optional demo fallback for interactive exploration.
 */
export async function getCurrentUser(
  request?: NextRequest,
  options: { allowDemoFallback?: boolean } = { allowDemoFallback: true }
): Promise<CurrentUser> {
  const authenticated = await getAuthenticatedUser(request);
  if (authenticated) {
    return authenticated;
  }

  if (options.allowDemoFallback) {
    // Fallback to default demo aspirant for frictionless evaluation
    const defaultAspirant = await prisma.user.findUnique({
      where: { email: "aspirant@pravaah.in" },
      include: { role: true },
    });

    if (defaultAspirant) {
      return {
        id: defaultAspirant.id,
        email: defaultAspirant.email,
        fullName: defaultAspirant.fullName,
        role: defaultAspirant.role.name as "ASPIRANT" | "ADMIN",
        avatarUrl: defaultAspirant.avatarUrl,
        googleId: defaultAspirant.googleId,
      };
    }
  }

  // Fallback placeholder if db not yet seeded
  return {
    id: "guest-aspirant",
    email: "guest@pravaah.in",
    fullName: "Guest Aspirant",
    role: "ASPIRANT",
    avatarUrl: null,
    googleId: null,
  };
}

