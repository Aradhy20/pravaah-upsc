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

function getResolvedDatabaseUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const raw = (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL
  )?.trim();

  if (!raw) {
    throw new Error(
      "[Database Configuration Error] Database connection URL is missing. " +
      "Configure DATABASE_URL (or POSTGRES_URL) in environment variables."
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
