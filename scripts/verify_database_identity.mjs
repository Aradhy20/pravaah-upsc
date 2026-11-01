import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// Ensure environment variables from .env are loaded
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

function getSanitizedUrlSummary(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "[unparseable connection string]";
  }
}

function getSelectedDatabaseSource() {
  const candidates = [
    { key: "NEON_DATABASE_URL", val: process.env.NEON_DATABASE_URL },
    { key: "DATABASE_URL", val: process.env.DATABASE_URL },
    { key: "POSTGRES_PRISMA_URL", val: process.env.POSTGRES_PRISMA_URL },
    { key: "POSTGRES_URL", val: process.env.POSTGRES_URL },
    { key: "PRISMA_DATABASE_URL", val: process.env.PRISMA_DATABASE_URL },
  ];

  for (const c of candidates) {
    const trimmed = c.val?.trim();
    if (trimmed) {
      return { key: c.key, val: trimmed, sanitizedSummary: getSanitizedUrlSummary(trimmed) };
    }
  }

  return { key: "NONE", val: null, sanitizedSummary: "none" };
}

const source = getSelectedDatabaseSource();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: source.val,
    },
  },
});

async function main() {
  console.log("=================================================");
  console.log("PRAVAAH UPSC — DATABASE IDENTITY & INTEGRITY AUDIT");
  console.log("=================================================\n");

  console.log(`[Config Source] Selected Variable:  ${source.key}`);
  console.log(`[Config Source] Sanitized Endpoint: ${source.sanitizedSummary}`);

  const isNeonHost = source.sanitizedSummary.includes("neon.tech");
  console.log(`[Config Source] Is Neon Domain:     ${isNeonHost ? "YES (neon.tech verified)" : "NO"}\n`);

  try {
    await prisma.$connect();
    console.log("[Connection] Successfully established connection to PostgreSQL.\n");

    const versionResult = await prisma.$queryRawUnsafe("SELECT version();");
    const dbResult = await prisma.$queryRawUnsafe("SELECT current_database() as db, current_schema() as schema, current_user as usr;");
    const pidResult = await prisma.$queryRawUnsafe("SELECT pg_backend_pid() as pid;");

    const versionStr = versionResult[0]?.version || "unknown";
    const dbInfo = dbResult[0] || {};
    const backendPid = pidResult[0]?.pid || "unknown";

    console.log("--- Server Identity ---");
    console.log(`PostgreSQL Version: ${versionStr.split("\n")[0]}`);
    console.log(`Current Database:   ${dbInfo.db}`);
    console.log(`Current Schema:     ${dbInfo.schema}`);
    console.log(`Connected User:     ${dbInfo.usr}`);
    console.log(`Backend PID:        ${backendPid}`);

    let isNeonEngine = false;
    try {
      const neonSettings = await prisma.$queryRawUnsafe(
        "SELECT name, setting FROM pg_settings WHERE name LIKE 'neon.%' LIMIT 5;"
      );
      if (neonSettings && neonSettings.length > 0) {
        isNeonEngine = true;
        console.log(`Neon Settings:      Detected ${neonSettings.length} Neon internal engine setting(s)`);
      }
    } catch {
      // Ignored if pg_settings is restricted
    }

    const providerIdentity = (isNeonHost || isNeonEngine)
      ? "Neon Serverless PostgreSQL (Verified)"
      : "Standard PostgreSQL";
    console.log(`Provider Identity:  ${providerIdentity}\n`);

    console.log("--- Data Preservation & Table Verification ---");
    const tableCountResult = await prisma.$queryRawUnsafe(
      "SELECT count(*)::int as count FROM information_schema.tables WHERE table_schema = 'public';"
    );
    const tableCount = tableCountResult[0]?.count || 0;
    console.log(`Total Public Tables: ${tableCount} (Expected: 49)`);

    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const questionCount = await prisma.question.count();
    const planCount = await prisma.plan.count();

    console.log(`User Records:        ${userCount} (Expected: 296)`);
    console.log(`Session Records:     ${sessionCount} (Expected: 203)`);
    console.log(`Question Records:    ${questionCount} (Expected: 1,100)`);
    console.log(`Plan Records:        ${planCount} (Expected: 4)`);

    console.log("\n--- Verification Summary ---");
    const tablesMatch = tableCount === 49;
    const usersMatch = userCount === 296;
    const sessionsMatch = sessionCount === 203;

    if (tablesMatch && usersMatch && sessionsMatch && isNeonHost) {
      console.log("STATUS: SUCCESS — Connection authoritatively targets the intended Neon PostgreSQL database.");
    } else {
      console.log("STATUS: WARNING — One or more baseline metrics deviated from expectations.");
      if (!isNeonHost) console.log(" - Host does not contain neon.tech");
      if (!tablesMatch) console.log(` - Tables count: ${tableCount} != 49`);
      if (!usersMatch) console.log(` - Users count: ${userCount} != 296`);
      if (!sessionsMatch) console.log(` - Sessions count: ${sessionCount} != 203`);
    }
  } catch (err) {
    console.error("\n[Connection Error] Failed to query database identity:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n=================================================");
  }
}

main();
