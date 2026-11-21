import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

let isSyncRunning = false;
let isSynced = false;

export interface DbSyncResult {
  success: boolean;
  existingCount: number;
  createdCount: number;
  missingTables: string[];
  message: string;
}

export async function ensureDatabaseTables(): Promise<DbSyncResult> {
  if (isSynced) {
    return {
      success: true,
      existingCount: 69,
      createdCount: 0,
      missingTables: [],
      message: "Database already synchronized in this process lifecycle.",
    };
  }

  if (isSyncRunning) {
    // Wait briefly if another request is running sync
    await new Promise((r) => setTimeout(r, 1000));
    return {
      success: true,
      existingCount: 69,
      createdCount: 0,
      missingTables: [],
      message: "Sync already in progress.",
    };
  }

  isSyncRunning = true;
  try {
    // 1. Get existing tables in public schema
    const existingRows = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTableNames = new Set(existingRows.map((r) => r.table_name));

    // 2. Read migration SQL
    let migrationSql = "";
    const possiblePaths = [
      path.join(process.cwd(), "prisma", "migrations", "20261122000000_init", "migration.sql"),
      path.join(process.cwd(), "data", "migration.sql"),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        migrationSql = fs.readFileSync(p, "utf8");
        break;
      }
    }

    const createdTables: string[] = [];
    const missingTables: string[] = [];

    if (migrationSql) {
      // Split into statements
      const statements = migrationSql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const rawStmt of statements) {
        // Only process CREATE TABLE statements
        const match = rawStmt.match(/CREATE\s+TABLE\s+"([^"]+)"/i);
        if (match) {
          const tableName = match[1];
          if (!existingTableNames.has(tableName)) {
            missingTables.push(tableName);
            const safeStmt = rawStmt.replace(/CREATE\s+TABLE\s+"/i, 'CREATE TABLE IF NOT EXISTS "');
            try {
              await prisma.$executeRawUnsafe(safeStmt);
              createdTables.push(tableName);
              existingTableNames.add(tableName);
            } catch (err: any) {
              console.warn(`Warning creating table ${tableName}:`, err.message);
            }
          }
        }
      }

      // Also create indexes for created tables
      for (const rawStmt of statements) {
        if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(rawStmt)) {
          const safeIndexStmt = rawStmt.replace(/CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (m, u) =>
            u ? "CREATE UNIQUE INDEX IF NOT EXISTS " : "CREATE INDEX IF NOT EXISTS "
          );
          try {
            await prisma.$executeRawUnsafe(safeIndexStmt);
          } catch {
            // Ignore index creation errors if columns don't match or already indexed
          }
        }
      }
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
      }
    } catch (e: any) {
      console.warn("Could not ensure FeatureEntitlement data:", e.message);
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
      }
    } catch (e: any) {
      console.warn("Could not ensure Plan data:", e.message);
    }

    isSynced = true;
    return {
      success: true,
      existingCount: existingTableNames.size,
      createdCount: createdTables.length,
      missingTables,
      message: `Database synchronized successfully. Existing: ${existingTableNames.size}, Created: ${createdTables.length}`,
    };
  } finally {
    isSyncRunning = false;
  }
}
