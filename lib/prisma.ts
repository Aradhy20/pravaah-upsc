import path from "path";
import { PrismaClient } from "@prisma/client";

function getResolvedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();

  // If missing or if set to a non-file URL (e.g. a postgres:// URL configured in Vercel environment variables)
  if (!raw || !raw.startsWith("file:")) {
    // If it's a bare filename like "dev.db" or "./prisma/dev.db"
    if (raw && (raw.endsWith(".db") || raw.endsWith(".sqlite"))) {
      const cleanPath = raw.includes("prisma") ? raw : path.join("prisma", raw);
      return `file:${path.resolve(process.cwd(), cleanPath)}`;
    }
    // Otherwise fallback to bundled SQLite database
    const defaultDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    return `file:${defaultDbPath}`;
  }

  // If it starts with file: but has a relative path (e.g. file:./dev.db)
  if (raw.startsWith("file:") && !raw.startsWith("file:/")) {
    const cleanPath = raw.replace(/^file:\.?\/?/, "");
    const resolved = cleanPath.includes("prisma")
      ? path.resolve(process.cwd(), cleanPath)
      : path.resolve(process.cwd(), "prisma", cleanPath);
    return `file:${resolved}`;
  }

  return raw;
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
