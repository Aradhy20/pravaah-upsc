import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=========================================");
  console.log("🛡️ PRAVAAH UPSC: DATABASE TABLE SYNCHRONIZER");
  console.log("=========================================");

  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.STORAGE_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL;

  if (!dbUrl) {
    console.warn("⚠️ No DATABASE_URL found. Skipping sync.");
    return;
  }

  const prisma = new PrismaClient({ datasourceUrl: dbUrl });

  try {
    // 1. Check existing tables
    const existingRows = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTableNames = new Set(existingRows.map((r) => r.table_name));
    console.log(`📊 Found ${existingTableNames.size} existing tables in database.`);

    // 2. Read migration SQL
    const migrationPath = path.join(
      process.cwd(),
      "prisma",
      "migrations",
      "20261122000000_init",
      "migration.sql"
    );

    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, "utf8");
      const statements = migrationSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let created = 0;
      for (const rawStmt of statements) {
        const match = rawStmt.match(/CREATE\s+TABLE\s+"([^"]+)"/i);
        if (match) {
          const tableName = match[1];
          if (!existingTableNames.has(tableName)) {
            const safeStmt = rawStmt.replace(/CREATE\s+TABLE\s+"/i, 'CREATE TABLE IF NOT EXISTS "');
            try {
              await prisma.$executeRawUnsafe(safeStmt);
              created++;
              existingTableNames.add(tableName);
              console.log(`  ✓ Created missing table: ${tableName}`);
            } catch (err) {
              console.warn(`  ⚠️ Could not create table ${tableName}:`, err.message);
            }
          }
        }
      }

      // Also ensure indices
      for (const rawStmt of statements) {
        if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(rawStmt)) {
          const safeIndexStmt = rawStmt.replace(/CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (m, u) =>
            u ? "CREATE UNIQUE INDEX IF NOT EXISTS " : "CREATE INDEX IF NOT EXISTS "
          );
          try {
            await prisma.$executeRawUnsafe(safeIndexStmt);
          } catch {
            // Ignore index warnings
          }
        }
      }

      console.log(`✅ Ensured tables. Newly created: ${created}. Total tables: ${existingTableNames.size}`);
    }

    // 3. Ensure FeatureEntitlements exist
    try {
      const feCount = await prisma.featureEntitlement.count();
      if (feCount < 5) {
        const defaultEntitlements = [
          {
            featureCode: "TIMED_EXAMS",
            name: "Timed Examination Simulator",
            description: "Access to 2-hour authentic UPSC CSE examination player with strict negative marking",
            minTier: 2,
          },
          {
            featureCode: "ADVANCED_ANALYTICS",
            name: "Diagnostic Weakness Detector",
            description: "Granular subject accuracy breakdown and automated weak topic identification (<60%)",
            minTier: 2,
          },
          {
            featureCode: "UNLIMITED_BOOKMARKS",
            name: "Unlimited Bookmarks",
            description: "Save unlimited questions for high-priority revision without quota limits",
            minTier: 2,
          },
          {
            featureCode: "UNLIMITED_NOTES",
            name: "Unlimited Study Notes",
            description: "Maintain comprehensive textbook cross-references on questions",
            minTier: 2,
          },
          {
            featureCode: "PRIORITY_ACCESS",
            name: "Priority Access & Verification Audit",
            description: "Priority access to freshly verified paper releases and coverage reports",
            minTier: 3,
          },
        ];

        for (const de of defaultEntitlements) {
          await prisma.featureEntitlement.upsert({
            where: { featureCode: de.featureCode },
            update: { minTier: de.minTier },
            create: de,
          });
        }
        console.log("✅ Seeded/verified 5 FeatureEntitlement records.");
      }
    } catch (e) {
      console.warn("⚠️ FeatureEntitlement check warning:", e.message);
    }

    // 4. Ensure Plans and Prices exist
    try {
      const planCount = await prisma.plan.count();
      if (planCount < 4) {
        const defaultPlans = [
          {
            code: "FREE",
            name: "Aspirant Foundation",
            tagline: "Essential UPSC PYQ practice with official answer keys",
            tier: 0,
            isPopular: false,
            orderIndex: 1,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 0, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 0, discountPercent: 0 },
              { billingInterval: "ANNUAL", amountRupees: 0, discountPercent: 0 },
            ],
          },
          {
            code: "BEGINNER",
            name: "Syllabus Sprint",
            tagline: "Focused subject-wise practice for foundation building",
            tier: 1,
            isPopular: false,
            orderIndex: 2,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 399, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 999, discountPercent: 16 },
              { billingInterval: "ANNUAL", amountRupees: 2999, discountPercent: 37 },
            ],
          },
          {
            code: "ACHIEVER",
            name: "Prelims Pro",
            tagline: "Complete examination simulator with authentic UPSC scoring",
            tier: 2,
            isPopular: true,
            orderIndex: 3,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 799, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 1899, discountPercent: 20 },
              { billingInterval: "ANNUAL", amountRupees: 5499, discountPercent: 42 },
            ],
          },
          {
            code: "SCHOLAR",
            name: "Ranker Suite",
            tagline: "For comprehensive multi-year revision and mock test mastery",
            tier: 3,
            isPopular: false,
            orderIndex: 4,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 1299, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 2999, discountPercent: 23 },
              { billingInterval: "ANNUAL", amountRupees: 8999, discountPercent: 42 },
            ],
          },
        ];

        for (const dp of defaultPlans) {
          const { prices, ...planData } = dp;
          const plan = await prisma.plan.upsert({
            where: { code: planData.code },
            update: planData,
            create: planData,
          });

          for (const pr of prices) {
            const existingPrice = await prisma.planPrice.findFirst({
              where: { planId: plan.id, billingInterval: pr.billingInterval },
            });
            if (!existingPrice) {
              await prisma.planPrice.create({
                data: {
                  planId: plan.id,
                  billingInterval: pr.billingInterval,
                  amountRupees: pr.amountRupees,
                  currency: "INR",
                  discountPercent: pr.discountPercent,
                  isActive: true,
                },
              });
            }
          }
        }
        console.log("✅ Seeded/verified 4 Plans with complete billing intervals.");
      }
    } catch (e) {
      console.warn("⚠️ Plan check warning:", e.message);
    }
  } catch (err) {
    console.warn("⚠️ Table synchronizer warning:", err.message);
  } finally {
    await prisma.$disconnect();
    console.log("=========================================\n");
  }
}

main().catch(console.error);
