import path from "path";
import { PrismaClient } from "@prisma/client";

function getResolvedDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
    const raw = process.env.DATABASE_URL.trim();
    if (raw.startsWith("file:") && !raw.startsWith("file:/")) {
      const cleanPath = raw.replace(/^file:\.?\/?/, "");
      const resolved = cleanPath.includes("prisma")
        ? path.resolve(process.cwd(), cleanPath)
        : path.resolve(process.cwd(), "prisma", cleanPath);
      return `file:${resolved}`;
    }
    return raw;
  }

  const defaultDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  return `file:${defaultDbPath}`;
}

const dbUrl = getResolvedDatabaseUrl();
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

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
