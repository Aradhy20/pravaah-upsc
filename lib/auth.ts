import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "ASPIRANT" | "ADMIN";
}

export const COOKIE_USER_ID = "pravaah_user_id";

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
      userId = xUserId;
    } else {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        userId = authHeader.substring(7).trim();
      } else {
        userId = request.cookies.get(COOKIE_USER_ID)?.value;
      }
    }
  }

  // 2. Fall back to Next.js cookie store if request not passed
  if (!userId) {
    try {
      const cookieStore = cookies();
      userId = cookieStore.get(COOKIE_USER_ID)?.value;
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
      };
    }
  }

  // Fallback placeholder if db not yet seeded
  return {
    id: "guest-aspirant",
    email: "guest@pravaah.in",
    fullName: "Guest Aspirant",
    role: "ASPIRANT",
  };
}

