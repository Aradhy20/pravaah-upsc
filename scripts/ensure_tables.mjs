import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=========================================");
  console.log("🛡️ PRAVAAH UPSC: DATABASE TABLE SYNCHRONIZER");
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

    // 2. Read migration SQL across ALL migration folders
    const migrationsBaseDir = path.join(process.cwd(), "prisma", "migrations");
    let created = 0;
    if (fs.existsSync(migrationsBaseDir)) {
      const migrationFolders = fs
        .readdirSync(migrationsBaseDir)
        .filter((d) => {
          try {
            return fs.statSync(path.join(migrationsBaseDir, d)).isDirectory();
          } catch {
            return false;
          }
        })
        .sort();

      for (const folder of migrationFolders) {
        const migrationFile = path.join(migrationsBaseDir, folder, "migration.sql");
        if (!fs.existsSync(migrationFile)) continue;

        const migrationSql = fs.readFileSync(migrationFile, "utf8");
        const statements = migrationSql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const rawStmt of statements) {
          // A. If statement is ALTER TABLE ... ADD COLUMN ...
          if (/ALTER\s+TABLE/i.test(rawStmt)) {
            try {
              await prisma.$executeRawUnsafe(rawStmt);
            } catch {
              // Ignore if column already exists or table does not yet exist
            }
          }

          // B. If statement is CREATE TABLE ...
          const match = rawStmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?"([^"]+)"/i);
          if (match) {
            const tableName = match[1];
            if (!existingTableNames.has(tableName)) {
              let safeStmt = rawStmt;
              if (!/IF\s+NOT\s+EXISTS/i.test(safeStmt)) {
                safeStmt = safeStmt.replace(/CREATE\s+TABLE\s+(?:public\.)?"/i, 'CREATE TABLE IF NOT EXISTS "');
              }
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

          // C. If statement is CREATE INDEX ...
          if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(rawStmt)) {
            let safeIndexStmt = rawStmt;
            if (!/IF\s+NOT\s+EXISTS/i.test(safeIndexStmt)) {
              safeIndexStmt = safeIndexStmt.replace(/CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (m, u) =>
                u ? "CREATE UNIQUE INDEX IF NOT EXISTS " : "CREATE INDEX IF NOT EXISTS "
              );
            }
            try {
              await prisma.$executeRawUnsafe(safeIndexStmt);
            } catch {
              // Ignore index warnings
            }
          }
        }
      }

      console.log(`✅ Ensured tables and migrations. Newly created: ${created}. Total tables: ${existingTableNames.size}`);
    }

    // 2a. Explicit UserProfile columns verification (Critical Fix for Candidate Registration)
    try {
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
      console.log("✅ UserProfile columns verified and synchronized.");
    } catch (e) {
      console.warn("⚠️ UserProfile sync warning:", e.message);
    }

    // 2b. Phase 3: Synchronize Question, Option, Explanation, MainsQuestion columns & QuestionStagingRecord table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "QuestionStagingRecord" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "importJobId" TEXT,
          "sourceReference" TEXT,
          "examCategory" TEXT NOT NULL DEFAULT 'CSE',
          "examStage" TEXT NOT NULL DEFAULT 'PRELIMS',
          "year" INTEGER NOT NULL,
          "paperCode" TEXT NOT NULL,
          "questionNumber" INTEGER NOT NULL,
          "questionFormat" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
          "questionTextEn" TEXT NOT NULL,
          "questionTextHi" TEXT,
          "optionsJson" TEXT NOT NULL,
          "officialAnswer" TEXT,
          "explanationEn" TEXT,
          "explanationHi" TEXT,
          "sourceCitation" TEXT,
          "subjectSlug" TEXT,
          "topicSlug" TEXT,
          "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
          "translationStatus" TEXT NOT NULL DEFAULT 'TRANSLATION_MISSING',
          "validationErrorsJson" TEXT,
          "workflowStatus" TEXT NOT NULL DEFAULT 'IMPORTED',
          "publishedQuestionId" TEXT,
          "reviewedBy" TEXT,
          "reviewedAt" TIMESTAMP(3),
          "rejectionReason" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "QuestionStagingRecord_paperCode_year_questionNumber_examCategory_key"
        ON "QuestionStagingRecord"("paperCode", "year", "questionNumber", "examCategory");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_workflowStatus_idx"
        ON "QuestionStagingRecord"("workflowStatus");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "QuestionStagingRecord_year_paperCode_idx"
        ON "QuestionStagingRecord"("year", "paperCode");
      `);

      // Add columns to Question
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Question" 
        ADD COLUMN IF NOT EXISTS "questionFormat" TEXT DEFAULT 'SINGLE_CHOICE',
        ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING',
        ADD COLUMN IF NOT EXISTS "examStage" TEXT DEFAULT 'PRELIMS',
        ADD COLUMN IF NOT EXISTS "sourceReference" TEXT;
      `);

      // Add columns to QuestionOption
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "QuestionOption" 
        ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING';
      `);

      // Add columns to Explanation
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Explanation" 
        ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'ORIGINAL_SOURCE';
      `);

      // Add columns to MainsQuestion
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "MainsQuestion" 
        ADD COLUMN IF NOT EXISTS "questionTextHi" TEXT,
        ADD COLUMN IF NOT EXISTS "translationStatus" TEXT DEFAULT 'TRANSLATION_MISSING',
        ADD COLUMN IF NOT EXISTS "sourceReference" TEXT;
      `);

      // Backfill translationStatus on Question
      await prisma.$executeRawUnsafe(`
        UPDATE "Question"
        SET "translationStatus" = CASE 
          WHEN "questionTextHi" IS NOT NULL AND length(trim("questionTextHi")) > 0 THEN 'HUMAN_VERIFIED'
          ELSE 'TRANSLATION_MISSING'
        END
        WHERE "translationStatus" IS NULL OR "translationStatus" = 'TRANSLATION_MISSING';
      `);

      console.log("✅ Phase 3: Synchronized QuestionStagingRecord and schema columns.");
    } catch (e) {
      console.warn("⚠️ Phase 3 schema synchronization warning:", e.message);
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
            description: "Save unlimited questions across all GS papers and subjects without cap",
            minTier: 2,
          },
          {
            featureCode: "BOOKMARKS_LIMIT",
            name: "Free Bookmark Cap (5 items)",
            description: "Free tier bookmark storage quota",
            minTier: 0,
          },
          {
            featureCode: "DAILY_PRACTICE_LIMIT",
            name: "Daily Question Limit (3 questions)",
            description: "Free tier practice question cap",
            minTier: 0,
          },
        ];

        for (const fe of defaultEntitlements) {
          await prisma.featureEntitlement.upsert({
            where: { featureCode: fe.featureCode },
            create: fe,
            update: { name: fe.name, description: fe.description, minTier: fe.minTier },
          });
        }
        console.log("✅ Ensured feature entitlements.");
      }
    } catch (feErr) {
      console.warn("⚠️ FeatureEntitlement check warning:", feErr.message);
    }

    // 4. Ensure Plans and PlanPrices exist
    try {
      const planCount = await prisma.plan.count();
      if (planCount < 4) {
        const plans = [
          {
            code: "FREE",
            name: "Aspirant Foundation",
            tier: 0,
            description: "Start free with authentic PYQ exploration, personal bookmarks, and basic analytics.",
            features: [
              "Access to all 10,000+ authentic UPSC PYQs",
              "Standard answer keys & basic explanations",
              "1 full-length Prelims mock exam",
              "Up to 5 saved bookmarks",
              "Daily topic practice (3 questions/day)",
              "Basic subject performance accuracy",
              "Bilingual interface (Hindi & English)",
              "Mobile-responsive practice player",
            ],
            prices: [
              { billingInterval: "FREE", amountRupees: 0 },
            ],
          },
          {
            code: "BEGINNER",
            name: "Prelims Sprint",
            tier: 1,
            description: "Focused practice for aspirants targeting upcoming Prelims with full question bank access.",
            features: [
              "Everything in Aspirant Foundation",
              "Unlimited practice questions across all papers",
              "15 full-length Prelims mock examinations",
              "Detailed analytical explanations & micro-themes",
              "Timed exam simulation mode with negative marking",
              "Unlimited question bookmarks & custom tags",
              "Speed & accuracy trend analytics",
              "Question mistake revision notebook",
            ],
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 299 },
              { billingInterval: "QUARTERLY", amountRupees: 799 },
              { billingInterval: "ANNUAL", amountRupees: 1999 },
            ],
          },
          {
            code: "ACHIEVER",
            name: "Comprehensive Scholar",
            tier: 2,
            isPopular: true,
            description: "The complete preparation ecosystem for Prelims, Mains answer evaluation, and interview preparation.",
            features: [
              "Everything in Prelims Sprint",
              "All 50+ Prelims mocks with all-India percentile",
              "AI Mains Answer Evaluator (10 evaluations/month)",
              "24/7 AI Personal UPSC Mentor & Study Coach",
              "CSAT Master Coach with step-by-step logic",
              "Interactive Prelims Map Lab with 300+ markers",
              "Current affairs integration with connected PYQs",
              "Topper copy comparative answer analysis",
            ],
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 499 },
              { billingInterval: "QUARTERLY", amountRupees: 1299 },
              { billingInterval: "ANNUAL", amountRupees: 3499 },
            ],
          },
          {
            code: "SCHOLAR",
            name: "Ranker's Circle",
            tier: 3,
            description: "Uncapped, high-intensity preparation with unlimited AI evaluations, interview lab, and dedicated priority support.",
            features: [
              "Everything in Comprehensive Scholar",
              "Unlimited AI Mains Answer Evaluations",
              "Unlimited AI Mentor chats & custom study schedules",
              "Personality Test (Interview) Lab simulator",
              "Micro-theme trend forecaster & high-yield predictions",
              "Downloadable offline PDF revision capsules",
              "Priority doubt resolution within 2 hours",
              "Dedicated 1-on-1 strategy audit calls",
            ],
            prices: [
              { billingInterval: "MONTHLY", amountRupees: 999 },
              { billingInterval: "QUARTERLY", amountRupees: 2499 },
              { billingInterval: "ANNUAL", amountRupees: 5999 },
            ],
          },
        ];

        for (const p of plans) {
          const planRecord = await prisma.plan.upsert({
            where: { code: p.code },
            create: {
              code: p.code,
              name: p.name,
              tier: p.tier,
              description: p.description,
              isPopular: p.isPopular || false,
            },
            update: {
              name: p.name,
              tier: p.tier,
              description: p.description,
              isPopular: p.isPopular || false,
            },
          });

          // Ensure features
          for (let i = 0; i < p.features.length; i++) {
            const featText = p.features[i];
            const existingFeat = await prisma.planFeature.findFirst({
              where: { planId: planRecord.id, featureText: featText },
            });
            if (!existingFeat) {
              await prisma.planFeature.create({
                data: {
                  planId: planRecord.id,
                  featureText: featText,
                  displayOrder: i + 1,
                  isIncluded: true,
                },
              });
            }
          }

          // Ensure prices
          for (const pr of p.prices) {
            await prisma.planPrice.upsert({
              where: {
                planId_billingInterval: {
                  planId: planRecord.id,
                  billingInterval: pr.billingInterval,
                },
              },
              create: {
                planId: planRecord.id,
                billingInterval: pr.billingInterval,
                amountRupees: pr.amountRupees,
              },
              update: {
                amountRupees: pr.amountRupees,
              },
            });
          }
        }
        console.log("✅ Ensured plans, features, and prices.");
      }
    } catch (planErr) {
      console.warn("⚠️ Plan check warning:", planErr.message);
    }

    // 5. Ensure System Roles and Accounts exist
    try {
      const roles = [
        { name: "ASPIRANT", description: "Standard Civil Services Aspirant" },
        { name: "ADMIN", description: "System Administrator" },
        { name: "FACULTY", description: "Content & Subject Specialist" },
      ];

      for (const r of roles) {
        await prisma.role.upsert({
          where: { name: r.name },
          create: r,
          update: { description: r.description },
        });
      }

      console.log("✅ Verified system roles and accounts.");
    } catch (roleErr) {
      console.warn("⚠️ Role check warning:", roleErr.message);
    }
  } catch (err) {
    console.warn("⚠️ ensure_tables error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Critical table sync failure:", e);
});
