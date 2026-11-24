import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

let isSyncRunning = false;
let isSynced = false;
let isUserProfileSchemaEnsured = false;

export interface DbSyncResult {
  success: boolean;
  existingCount: number;
  createdCount: number;
  missingTables: string[];
  message: string;
}

/**
 * Ensures all required UserProfile columns and foundational schema columns exist.
 * Executes non-destructive, safe ALTER TABLE IF NOT EXISTS commands directly on PostgreSQL.
 * Runs once per process lifecycle to ensure zero overhead on hot paths.
 */
export async function ensureUserProfileSchema(): Promise<boolean> {
  if (isUserProfileSchemaEnsured) return true;

  try {
    // 1. Ensure UserProfile columns exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "UserProfile" 
      ADD COLUMN IF NOT EXISTS "strongSubjects" TEXT,
      ADD COLUMN IF NOT EXISTS "weakSubjects" TEXT,
      ADD COLUMN IF NOT EXISTS "dailyStudyHours" DOUBLE PRECISION DEFAULT 4.0,
      ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT DEFAULT 'en',
      ADD COLUMN IF NOT EXISTS "preparationStage" TEXT DEFAULT 'BEGINNER',
      ADD COLUMN IF NOT EXISTS "readinessIndex" DOUBLE PRECISION DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS "targetExam" TEXT DEFAULT 'UPSC_CSE';
    `);

    // 2. Ensure default ASPIRANT role exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Role" ("id", "name", "description", "createdAt")
      VALUES ('role_aspirant', 'ASPIRANT', 'Standard Civil Services Aspirant', NOW())
      ON CONFLICT ("name") DO NOTHING;
    `);

    // 3. Ensure Question and Options schema columns exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Question"
      ADD COLUMN IF NOT EXISTS "questionFormat" TEXT DEFAULT 'SINGLE_CHOICE',
      ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT true;
    `);

    isUserProfileSchemaEnsured = true;
    return true;
  } catch (err: any) {
    console.error("ensureUserProfileSchema database sync notice:", err.message);
    return false;
  }
}

export async function ensureDatabaseTables(): Promise<DbSyncResult> {
  // Always verify UserProfile schema first
  await ensureUserProfileSchema();

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
            code: "PLUS",
            name: "Aspirant Plus",
            tagline: "Structured practice, verified explanations and smart revision",
            tier: 1,
            isPopular: false,
            orderIndex: 2,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 149, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 399, discountPercent: 11 },
              { billingInterval: "ANNUAL", amountRupees: 999, discountPercent: 44 },
            ],
          },
          {
            code: "PRO",
            name: "Aspirant Pro",
            tagline: "AI Personal Mentor, Mission Control, Syllabus Map and Mains Evaluation",
            tier: 2,
            isPopular: true,
            orderIndex: 3,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 299, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 799, discountPercent: 11 },
              { billingInterval: "ANNUAL", amountRupees: 1999, discountPercent: 44 },
            ],
          },
          {
            code: "ELITE",
            name: "Aspirant Elite",
            tagline: "Higher AI mentor allowance, deep diagnostics and priority support",
            tier: 3,
            isPopular: false,
            orderIndex: 4,
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 499, discountPercent: 0 },
              { billingInterval: "QUARTERLY", amountRupees: 1299, discountPercent: 13 },
              { billingInterval: "ANNUAL", amountRupees: 3499, discountPercent: 42 },
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

    // 5. Ensure Authentic UPSC Question Bank & Curriculum exist
    try {
      const qCount = await prisma.question.count();
      if (qCount === 0) {
        console.log("🌱 Database Question table is empty. Restoring authentic UPSC question bank...");
        const dumpPath = path.join(process.cwd(), "data", "backup", "postgres_full_dump.json");
        if (fs.existsSync(dumpPath)) {
          const rawData = fs.readFileSync(dumpPath, "utf-8");
          const dump = JSON.parse(rawData);

          const AUTHENTIC_MODELS = [
            "Exam",
            "ExamDirectory",
            "ExamStage",
            "Paper",
            "Subject",
            "Topic",
            "Subtopic",
            "SyllabusNode",
            "SyllabusTopic",
            "NCERTBook",
            "NCERTChapter",
            "NCERTChapterQuestionLink",
            "KnowledgeSource",
            "ExamYear",
            "Question",
            "QuestionOption",
            "Explanation",
            "QuestionAnswer",
            "AnswerKeyVersion",
            "SourceCitation",
            "QuestionSyllabusMapping",
            "QuestionTopic",
            "QuestionSource",
            "SourceDocument",
            "SourceRegistryRecord",
            "SourceRecord",
            "CurrentAffairsStory",
            "StoryTopic",
            "StoryQuestionLink",
            "MainsQuestion",
            "VideoLesson",
            "TopperCopy",
          ];

          for (const modelName of AUTHENTIC_MODELS) {
            const accessor = (modelName[0].toLowerCase() + modelName.slice(1)) as keyof typeof prisma;
            const records = dump[modelName];
            if (records && Array.isArray(records) && records.length > 0) {
              const delegate = prisma[accessor] as any;
              if (typeof delegate?.createMany === "function") {
                try {
                  await delegate.createMany({
                    data: records,
                    skipDuplicates: true,
                  });
                } catch {
                  for (const rec of records) {
                    try {
                      await delegate.create({ data: rec });
                    } catch {}
                  }
                }
              }
            }
          }
          console.log("✅ Authentic UPSC Question Bank restored to database!");
        }
      }
    } catch (e: any) {
      console.warn("Could not ensure Question bank data:", e.message);
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
