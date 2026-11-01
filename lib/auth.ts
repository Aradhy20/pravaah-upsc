import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "ASPIRANT" | "ADMIN";
}

export const COOKIE_SESSION_TOKEN = "pravaah_session_token";
export const COOKIE_USER_ID = "pravaah_user_id"; // Retained only for legacy cookie clearing

/**
 * Hash password securely with scrypt and a unique cryptographically random salt per password.
 * Format: scrypt:<saltHex>:<keyHex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

/**
 * Verify a plaintext password against a stored hash with constant-time equality check.
 * Supports transparent migration from legacy SHA-256 hashes.
 * Never allows demo bypasses.
 */
export function verifyPassword(
  password: string,
  storedHash: string
): { valid: boolean; needsRehash: boolean } {
  if (!password || !storedHash) {
    return { valid: false, needsRehash: false };
  }

  // 1. Modern scrypt format: scrypt:<salt>:<derivedKey>
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedKey = parts[2];
      try {
        const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
        const bufA = Buffer.from(derivedKey, "hex");
        const bufB = Buffer.from(expectedKey, "hex");
        if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
          return { valid: true, needsRehash: false };
        }
      } catch (e) {
        return { valid: false, needsRehash: false };
      }
    }
    return { valid: false, needsRehash: false };
  }

  // 2. Legacy SHA-256 hash format (with static salt) for seamless user migration
  try {
    const legacyHash = crypto
      .createHash("sha256")
      .update(password + "_pravaah_salt_2026")
      .digest("hex");

    const bufLegacy = Buffer.from(legacyHash, "hex");
    const bufStored = Buffer.from(storedHash, "hex");

    if (bufLegacy.length === bufStored.length && crypto.timingSafeEqual(bufLegacy, bufStored)) {
      return { valid: true, needsRehash: true };
    }
  } catch {
    // Stored hash wasn't valid hex
  }

  return { valid: false, needsRehash: false };
}

/**
 * Hash session token with SHA-256 for secure database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create a new cryptographically secure server-side session.
 * Generates 32 random bytes (64 hex characters) and stores only the SHA-256 hash.
 */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Revoke an active session in the database.
 */
export async function revokeSession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await prisma.session.updateMany({
    where: { tokenHash },
    data: { isRevoked: true },
  });
}

/**
 * Validates a session token string against the database.
 * Confirms existence, non-revocation, and unexpired status.
 */
export async function validateSessionToken(token: string): Promise<CurrentUser | null> {
  if (!token || typeof token !== "string" || token.length < 32) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: { role: true },
      },
    },
  });

  if (!session || session.isRevoked || session.expiresAt <= new Date()) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    fullName: session.user.fullName,
    role: session.user.role.name as "ASPIRANT" | "ADMIN",
  };
}

/**
 * Extracts and verifies the user identity exclusively via valid session tokens.
 * Explicitly rejects x-user-id header and raw user IDs in Bearer headers.
 * Does NOT fall back to a shared demo user.
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<CurrentUser | null> {
  let sessionToken: string | undefined;

  // 1. Extract from incoming request headers or cookies
  if (request) {
    // Strict rejection: x-user-id is ignored and prohibited as an identity source
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const candidate = authHeader.substring(7).trim();
      // Only valid session tokens (hex >= 32 chars) are accepted, never raw cuid user IDs
      if (candidate.length >= 32) {
        sessionToken = candidate;
      }
    } else {
      sessionToken = request.cookies.get(COOKIE_SESSION_TOKEN)?.value;
    }
  }

  // 2. Check Next.js cookie store if request object not passed
  if (!sessionToken) {
    try {
      const cookieStore = cookies();
      sessionToken = cookieStore.get(COOKIE_SESSION_TOKEN)?.value;
    } catch {
      // In some Next.js edge contexts cookies() may not be available
    }
  }

  if (!sessionToken) {
    return null;
  }

  return await validateSessionToken(sessionToken);
}

/**
 * Retrieves the currently authenticated user.
 * Fails closed (returns null) when unauthenticated.
 * Demo fallback is strictly eliminated.
 */
export async function getCurrentUser(
  request?: NextRequest,
  options: { allowDemoFallback?: boolean } = { allowDemoFallback: false }
): Promise<CurrentUser | null> {
  const authenticated = await getAuthenticatedUser(request);
  if (authenticated) {
    return authenticated;
  }

  // Demo fallback is only permitted in explicit development environment when specifically configured
  if (
    options.allowDemoFallback &&
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_LOCAL_DEMO_FALLBACK === "true"
  ) {
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
      };
    }
  }

  return null;
}

/**
 * Strict authentication guardrail helper for API routes.
 * Returns { user } if authenticated, or { error } HTTP 401 / 403 response if not.
 */
export async function requireAuthenticatedUser(
  request: NextRequest,
  options?: { requiredRole?: "ADMIN" }
): Promise<{ user: CurrentUser; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please log in with a valid session.",
          },
        },
        { status: 401 }
      ),
    };
  }

  if (options?.requiredRole && user.role !== options.requiredRole) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: `Access denied. ${options.requiredRole} privileges required.`,
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}
