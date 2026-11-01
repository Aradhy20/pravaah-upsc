/**
 * Server-Side Environment Validation Module
 * Pravaah UPSC - Production Environment Integrity Check
 *
 * This module runs exclusively on the server and validates all environment
 * configuration required for secure runtime execution.
 * Secret values are NEVER exposed in error messages, logs, or client-side bundles.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitized: Record<string, string>;
}

export function validateEnvironment(customEnv?: Record<string, string | undefined>): EnvValidationResult {
  const env = customEnv || process.env;
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitized: Record<string, string> = {};

  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";
  sanitized.NODE_ENV = nodeEnv;

  // 1. Database Connection String Validation
  const rawDbUrl = (
    env.NEON_DATABASE_URL ||
    env.DATABASE_URL ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL ||
    env.PRISMA_DATABASE_URL
  )?.trim();

  if (!rawDbUrl) {
    errors.push(
      "[Database Config] Missing database connection string. Either NEON_DATABASE_URL or DATABASE_URL must be configured."
    );
    sanitized.DATABASE = "MISSING";
  } else {
    try {
      const parsed = new URL(rawDbUrl);
      const protocol = parsed.protocol;
      sanitized.DATABASE = `${protocol}//${parsed.host}${parsed.pathname}`;

      if (isProduction) {
        if (protocol !== "postgresql:" && protocol !== "postgres:") {
          errors.push(
            `[Database Config] Invalid production database protocol '${protocol}'. PostgreSQL ('postgresql://' or 'postgres://') is required. SQLite fallback is strictly prohibited in production.`
          );
        }
      } else {
        if (protocol !== "postgresql:" && protocol !== "postgres:" && protocol !== "file:") {
          errors.push(
            `[Database Config] Unsupported database protocol '${protocol}'. Expected PostgreSQL or SQLite (file:).`
          );
        }
      }
    } catch {
      errors.push("[Database Config] Unparseable database connection string.");
      sanitized.DATABASE = "UNPARSEABLE";
    }
  }

  // 2. Billing Webhook Secret Validation
  const webhookSecret = env.PAYMENT_WEBHOOK_SECRET?.trim();
  if (isProduction) {
    if (!webhookSecret) {
      errors.push(
        "[Billing Config] PAYMENT_WEBHOOK_SECRET is required in production to cryptographically verify payment webhooks."
      );
      sanitized.PAYMENT_WEBHOOK_SECRET = "MISSING";
    } else if (webhookSecret.length < 16) {
      errors.push(
        "[Billing Config] PAYMENT_WEBHOOK_SECRET is too short. Minimum 16 characters required for security."
      );
      sanitized.PAYMENT_WEBHOOK_SECRET = "INVALID_LENGTH";
    } else {
      sanitized.PAYMENT_WEBHOOK_SECRET = "CONFIGURED (REDACTED)";
    }
  } else {
    if (!webhookSecret) {
      warnings.push(
        "[Billing Config] PAYMENT_WEBHOOK_SECRET is not set. Using dev fallback in non-production mode."
      );
      sanitized.PAYMENT_WEBHOOK_SECRET = "DEV_FALLBACK";
    } else {
      sanitized.PAYMENT_WEBHOOK_SECRET = "CONFIGURED (REDACTED)";
    }
  }

  // 3. Scan NEXT_PUBLIC_* variables for accidental secret leakage
  for (const [key, val] of Object.entries(env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const upperKey = key.toUpperCase();
      if (
        upperKey.includes("SECRET") ||
        upperKey.includes("PASSWORD") ||
        upperKey.includes("PRIVATE") ||
        upperKey.includes("TOKEN") ||
        upperKey.includes("KEY")
      ) {
        warnings.push(
          `[Public Variable Warning] Variable '${key}' contains sensitive keyword. Ensure no private secrets are exposed to client bundle.`
        );
      }
      sanitized[key] = val ? "[SET]" : "[EMPTY]";
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized,
  };
}
