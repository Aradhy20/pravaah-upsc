import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

async function setup() {
  console.log("=========================================");
  console.log("🛠️ PRAVAAH UPSC: DATABASE DEPLOY SETUP");
  console.log("=========================================");

  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.STORAGE_DATABASE_URL ||
    process.env.STORAGE_DATABASE_URL_POOLED ||
    process.env.STORAGE_URL ||
    process.env.STORAGE_PRISMA_DATABASE_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL;

  if (!process.env.DATABASE_URL && dbUrl) {
    process.env.DATABASE_URL = dbUrl;
  }

  if (!dbUrl) {
    console.warn("⚠️ No DATABASE_URL or Postgres environment variable found. Skipping schema push.");
    return;
  }

  // 1. Deploy controlled migrations to database
  console.log("📦 Deploying Prisma migrations to database...");
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log("✅ Prisma migrations deployed successfully!");
  } catch (err) {
    console.warn("⚠️ Prisma migrate deploy warning, falling back to db push sync:", err.message);
    try {
      execSync("npx prisma db push --skip-generate --accept-data-loss", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
      console.log("✅ Prisma schema synchronized via db push!");
    } catch (pushErr) {
      console.warn("⚠️ Schema sync warning:", pushErr.message);
    }
  }

  // 1b. Ensure all tables and seed records are verified
  try {
    execSync("node scripts/ensure_tables.mjs", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
  } catch (syncErr) {
    console.warn("⚠️ Table check warning:", syncErr.message);
  }

  // 2. Check and Seed Data if empty
  console.log("🌱 Checking if database has question records...");
  try {
    const prisma = new PrismaClient({ datasourceUrl: dbUrl });
    const count = await prisma.question.count();
    console.log(`📊 Found ${count} questions in database.`);

    if (count === 0) {
      console.log("🌱 Database is fresh/empty. Seeding 3,469 authentic records from dump...");
      execSync("node scripts/seed_postgres.mjs", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: dbUrl },
      });
      console.log("✅ Seed completed successfully!");
    }
    await prisma.$disconnect();
  } catch (err) {
    console.warn("⚠️ Seed check warning:", err.message);
  }

  console.log("=========================================\n");
}

setup().catch((e) => {
  console.warn("Database deploy setup encountered error:", e);
});
