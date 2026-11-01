import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function findDatabasePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "prisma", "dev.db"),
    path.resolve(process.cwd(), "dev.db"),
    path.resolve(__dirname, "../../prisma/dev.db"),
    path.resolve(__dirname, "../prisma/dev.db"),
    path.resolve(__dirname, "prisma/dev.db"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.resolve(process.cwd(), "prisma", "dev.db");
}

function getResolvedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  // Production requirement: DATABASE_URL must be explicitly set to a valid PostgreSQL/Neon URL
  if (isProduction) {
    if (!raw || (!raw.startsWith("postgresql://") && !raw.startsWith("postgres://"))) {
      throw new Error(
        "[Configuration Error] In production, DATABASE_URL must be explicitly configured as an environment variable with a valid PostgreSQL/Neon connection string. Silent fallback to local storage is strictly prohibited."
      );
    }
    return raw;
  }

  // Development & Testing: Use configured PostgreSQL if available
  if (raw && (raw.startsWith("postgresql://") || raw.startsWith("postgres://"))) {
    return raw;
  }

  if (raw && raw.startsWith("file:")) {
    return raw;
  }

  // Fallback to local SQLite only during non-production development
  return `file:${findDatabasePath()}`;
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
