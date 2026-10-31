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
  let raw = process.env.DATABASE_URL?.trim();

  // If not yet populated in process.env, scan environment configuration files
  if (!raw || (!raw.startsWith("postgresql://") && !raw.startsWith("postgres://"))) {
    for (const envFile of [".env.local", ".env.production", ".env"]) {
      const p = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed.startsWith("DATABASE_URL=") && !trimmed.startsWith("#")) {
            const val = trimmed.slice(trimmed.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
            if (val.startsWith("postgresql://") || val.startsWith("postgres://")) {
              raw = val;
              break;
            }
          }
        }
        if (raw && (raw.startsWith("postgresql://") || raw.startsWith("postgres://"))) {
          break;
        }
      }
    }
  }

  // If PostgreSQL / Neon connection string is provided, use it directly
  if (raw && (raw.startsWith("postgresql://") || raw.startsWith("postgres://"))) {
    return raw;
  }

  // Fallback for bare SQLite files if applicable
  if (!raw || !raw.startsWith("file:")) {
    if (raw && (raw.endsWith(".db") || raw.endsWith(".sqlite"))) {
      const cleanPath = raw.includes("prisma") ? raw : path.join("prisma", raw);
      const absPath = path.resolve(process.cwd(), cleanPath);
      if (fs.existsSync(absPath)) return `file:${absPath}`;
    }
    return `file:${findDatabasePath()}`;
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
