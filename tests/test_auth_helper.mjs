import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates an authentic server-side cryptographic session for test execution.
 * Writes a SHA-256 token hash to the Session table in the database and returns the plaintext session token.
 */
export async function createAuthenticatedTestSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  let attempts = 0;
  while (attempts < 3) {
    try {
      await prisma.session.create({
        data: {
          userId,
          tokenHash,
          expiresAt,
        },
      });
      break;
    } catch (err) {
      attempts++;
      if (attempts >= 3) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempts));
    }
  }

  return {
    token,
    cookie: `pravaah_session_token=${token}`,
    headers: {
      Cookie: `pravaah_session_token=${token}`,
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Standard scrypt password hashing matching lib/auth.ts for test validation.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derivedKey}`;
}

/**
 * Standard scrypt password verification matching lib/auth.ts for test validation.
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return { valid: false, needsRehash: false };

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
      } catch {
        return { valid: false, needsRehash: false };
      }
    }
  }

  return { valid: false, needsRehash: false };
}

