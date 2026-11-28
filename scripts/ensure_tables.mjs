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

    // 2c. Explicit synchronization of critical launch tables (Interview, Map, Usage, MainsDraft, NCERTLinks)
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "InterviewQuestion" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "questionTextEn" TEXT NOT NULL,
          "questionTextHi" TEXT,
          "contextEn" TEXT,
          "contextHi" TEXT,
          "sourceType" TEXT NOT NULL DEFAULT 'CANDIDATE_REPORTED',
          "sourceAttribution" TEXT,
          "year" INTEGER,
          "topic" TEXT NOT NULL,
          "tags" TEXT,
          "frameworkGuidance" TEXT,
          "frameworkGuidanceHi" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "InterviewQuestion_sourceType_topic_idx" ON "InterviewQuestion"("sourceType", "topic");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "InterviewQuestion_year_idx" ON "InterviewQuestion"("year");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MapFeature" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "nameHi" TEXT,
          "category" TEXT NOT NULL,
          "stateOrCountry" TEXT NOT NULL,
          "latitude" DOUBLE PRECISION NOT NULL,
          "longitude" DOUBLE PRECISION NOT NULL,
          "keyFacts" TEXT NOT NULL,
          "keyFactsHi" TEXT,
          "upscReference" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "MapFeature_category_stateOrCountry_idx" ON "MapFeature"("category", "stateOrCountry");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "UserUsageLedger" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
          "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "periodEnd" TIMESTAMP(3) NOT NULL,
          "aiMentorMessagesUsed" INTEGER NOT NULL DEFAULT 0,
          "aiMentorMessagesLimit" INTEGER NOT NULL DEFAULT 0,
          "mainsEvaluationsUsed" INTEGER NOT NULL DEFAULT 0,
          "mainsEvaluationsLimit" INTEGER NOT NULL DEFAULT 0,
          "pyqAttemptsToday" INTEGER NOT NULL DEFAULT 0,
          "pyqDailyLimit" INTEGER NOT NULL DEFAULT 15,
          "lastPyqAttemptDate" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "UserUsageLedger_userId_periodEnd_idx" ON "UserUsageLedger"("userId", "periodEnd");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MainsDraft" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
          "mainsQuestionId" TEXT NOT NULL REFERENCES "MainsQuestion"("id") ON DELETE CASCADE,
          "userAnswer" TEXT NOT NULL,
          "wordCount" INTEGER NOT NULL DEFAULT 0,
          "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
          "selfEvaluationScore" DOUBLE PRECISION,
          "selfEvaluationNotes" TEXT,
          "aiFeedbackJson" TEXT,
          "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "MainsDraft_userId_mainsQuestionId_key" ON "MainsDraft"("userId", "mainsQuestionId");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "MainsDraft_userId_isSubmitted_idx" ON "MainsDraft"("userId", "isSubmitted");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "NCERTChapterQuestionLink" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "chapterId" TEXT NOT NULL REFERENCES "NCERTChapter"("id") ON DELETE CASCADE,
          "questionId" TEXT NOT NULL REFERENCES "Question"("id") ON DELETE CASCADE,
          "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          "pedagogicalNote" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "NCERTChapterQuestionLink_chapterId_questionId_key" ON "NCERTChapterQuestionLink"("chapterId", "questionId");
      `);

      console.log("✅ Phase 2c: Synchronized InterviewQuestion, MapFeature, UserUsageLedger, MainsDraft, and NCERTLink tables.");
    } catch (e) {
      console.warn("⚠️ Phase 2c table sync warning:", e.message);
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

    // 4. Ensure Plans and PlanPrices exist (Canonical Single Source of Truth)
    try {
      const canonicalPlans = [
        {
          code: "FREE",
          name: "Free Aspirant",
          tagline: "Essential UPSC PYQ practice with official answer keys",
          tier: 0,
          isPopular: false,
          orderIndex: 1,
          features: [
            "Access to all authentic UPSC PYQs",
            "Official answer keys & basic explanations",
            "Daily 5-question Prelims micro-quiz",
            "Personal question bookmarks quota (5)",
            "Private study notes quota (3)",
          ],
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
          features: [
            "Expanded daily practice (50 questions/day)",
            "Detailed pedagogical explanations & elimination notes",
            "SuperMemo-2 Spaced Repetition Mistake Notebook",
            "Subject-wise accuracy and speed analytics",
            "Personal bookmarks allowance (50)",
            "Private study notes allowance (50)",
          ],
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
          features: [
            "Unlimited authentic PYQ catalogue practice",
            "Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)",
            "Pravaah AI Personal Mentor (100 messages/mo)",
            "Pravaah Mission Control daily cockpit",
            "Syllabus Intelligence Map with micro-nodes",
            "Mains answer evaluations (5 credits/mo)",
            "CSAT Survival Coach & speed drills",
            "Unlimited bookmarks with custom tags",
            "Unlimited private study notes",
          ],
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
          features: [
            "Unlimited authentic PYQ catalogue practice",
            "Pravaah AI Personal Mentor (300 messages/mo)",
            "Mains answer evaluations (15 credits/mo)",
            "Current Affairs exam converter packages",
            "Unlimited Full Exam Simulations & custom topic mocks",
            "Direct priority support desk & WhatsApp SLA",
            "Unlimited study notes with PDF syllabus linking",
          ],
          prices: [
            { billingInterval: "MONTHLY", amountRupees: 499, discountPercent: 0 },
            { billingInterval: "QUARTERLY", amountRupees: 1299, discountPercent: 13 },
            { billingInterval: "ANNUAL", amountRupees: 3499, discountPercent: 42 },
          ],
        },
      ];

      for (const p of canonicalPlans) {
        // Also check if legacy code exists to update it smoothly
        let legacyCodes = [];
        if (p.code === "PLUS") legacyCodes = ["BEGINNER"];
        if (p.code === "PRO") legacyCodes = ["ACHIEVER"];
        if (p.code === "ELITE") legacyCodes = ["SCHOLAR"];

        let planRecord = await prisma.plan.findFirst({
          where: { code: { in: [p.code, ...legacyCodes] } }
        });

        if (planRecord) {
          planRecord = await prisma.plan.update({
            where: { id: planRecord.id },
            data: {
              code: p.code,
              name: p.name,
              tier: p.tier,
              tagline: p.tagline,
              isPopular: p.isPopular,
              orderIndex: p.orderIndex,
              isActive: true,
            },
          });
        } else {
          planRecord = await prisma.plan.create({
            data: {
              code: p.code,
              name: p.name,
              tier: p.tier,
              tagline: p.tagline,
              isPopular: p.isPopular,
              orderIndex: p.orderIndex,
              isActive: true,
            },
          });
        }

        // Ensure canonical prices
        for (const pr of p.prices) {
          const existingPrice = await prisma.planPrice.findFirst({
            where: { planId: planRecord.id, billingInterval: pr.billingInterval }
          });
          if (existingPrice) {
            await prisma.planPrice.update({
              where: { id: existingPrice.id },
              data: {
                amountRupees: pr.amountRupees,
                currency: "INR",
                discountPercent: pr.discountPercent,
                isActive: true,
              }
            });
          } else {
            await prisma.planPrice.create({
              data: {
                planId: planRecord.id,
                billingInterval: pr.billingInterval,
                amountRupees: pr.amountRupees,
                currency: "INR",
                discountPercent: pr.discountPercent,
                isActive: true,
              }
            });
          }
        }
      }
      console.log("✅ Ensured canonical plans, features, and prices.");
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
