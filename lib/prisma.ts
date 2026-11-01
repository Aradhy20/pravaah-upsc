import path from "path";
import { PrismaClient } from "@prisma/client";

function getSanitizedUrlSummary(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "[unparseable connection string]";
  }
}

export function getSelectedDatabaseSource(): { key: string; sanitizedSummary: string } {
  const candidates: Array<{ key: string; val: string | undefined }> = [
    { key: "NEON_DATABASE_URL", val: process.env.NEON_DATABASE_URL },
    { key: "DATABASE_URL", val: process.env.DATABASE_URL },
    { key: "POSTGRES_PRISMA_URL", val: process.env.POSTGRES_PRISMA_URL },
    { key: "POSTGRES_URL", val: process.env.POSTGRES_URL },
    { key: "PRISMA_DATABASE_URL", val: process.env.PRISMA_DATABASE_URL },
  ];

  for (const c of candidates) {
    const trimmed = c.val?.trim();
    if (trimmed) {
      return { key: c.key, sanitizedSummary: getSanitizedUrlSummary(trimmed) };
    }
  }

  return { key: "NONE", sanitizedSummary: "none" };
}

function getResolvedDatabaseUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Priority 1: NEON_DATABASE_URL takes precedence over Prisma Postgres integration variables
  const raw = (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL
  )?.trim();

  if (!raw) {
    throw new Error(
      "[Database Configuration Error] Database connection URL is missing. " +
      "Neither NEON_DATABASE_URL nor DATABASE_URL is configured in environment variables."
    );
  }

  const isPostgres = raw.startsWith("postgresql://") || raw.startsWith("postgres://");
  const isSqlite = raw.startsWith("file:");

  if (isProduction) {
    if (!isPostgres) {
      const summary = getSanitizedUrlSummary(raw);
      throw new Error(
        `[Database Configuration Error] Production database provider must be PostgreSQL. ` +
        `Received invalid database protocol: ${summary}. SQLite fallback is forbidden in production.`
      );
    }
    return raw;
  }

  // Non-production (development or test)
  if (isPostgres) {
    return raw;
  }

  if (isSqlite) {
    if (!raw.startsWith("file:/")) {
      const cleanPath = raw.replace(/^file:\.?\/?/, "");
      const resolved = cleanPath.includes("prisma")
        ? path.resolve(process.cwd(), cleanPath)
        : path.resolve(process.cwd(), "prisma", cleanPath);
      return `file:${resolved}`;
    }
    return raw;
  }

  throw new Error(
    `[Database Configuration Error] Unsupported database provider protocol. ` +
    `Expected 'postgresql://' or 'postgres://' (or 'file:' in local development).`
  );
}

const dbUrl = getResolvedDatabaseUrl();
// Use bracket notation so Webpack DefinePlugin never treats this as a syntax error
process.env["DATABASE_URL"] = dbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
