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
            const accessor = modelName[0].toLowerCase() + modelName.slice(1);
            const records = dump[modelName];
            if (records && Array.isArray(records) && records.length > 0) {
              const delegate = prisma[accessor];
              if (typeof delegate?.createMany === "function") {
                try {
                  const res = await delegate.createMany({
                    data: records,
                    skipDuplicates: true,
                  });
                  console.log(`  ✓ Restored ${modelName.padEnd(25)}: ${res.count} records`);
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
      } else {
        console.log(`📊 Found ${qCount} existing questions in database. Skipping content seed.`);
      }
    } catch (e) {
      console.warn("⚠️ Question bank check warning:", e.message);
    }

    // 6. Ensure default roles and verified accounts
    try {
      const aspirantRole = await prisma.role.upsert({
        where: { name: "ASPIRANT" },
        update: {},
        create: {
          name: "ASPIRANT",
          description: "Civil Services Aspirant studying for Prelims and Mains",
        },
      });

      const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
          name: "ADMIN",
          description: "Platform Administrator and Academic Reviewer",
        },
      });

      // Admin account: admin@pravaah.in (Salted SHA-256 for Admin@Pravaah2026!)
      await prisma.user.upsert({
        where: { email: "admin@pravaah.in" },
        update: {
          roleId: adminRole.id,
          passwordHash: "93442f5170f4572e1a1de67149b16e78e8c267a08cd393ed5148dd92355822ca",
        },
        create: {
          email: "admin@pravaah.in",
          fullName: "Dr. Rameshwar Rao (Senior Faculty)",
          passwordHash: "93442f5170f4572e1a1de67149b16e78e8c267a08cd393ed5148dd92355822ca",
          roleId: adminRole.id,
        },
      });

      // Guest Aspirant account: guest-aspirant for unauthenticated visitor isolation
      await prisma.user.upsert({
        where: { id: "guest-aspirant" },
        update: {
          roleId: aspirantRole.id,
        },
        create: {
          id: "guest-aspirant",
          email: "guest@pravaah.in",
          fullName: "Guest Aspirant",
          passwordHash: "pravaah_guest_unusable_hash_2026",
          roleId: aspirantRole.id,
        },
      });

      // Demo Aspirant account: aspirant@pravaah.in (Salted SHA-256 for Aspirant@Pravaah2026!)
      await prisma.user.upsert({
        where: { email: "aspirant@pravaah.in" },
        update: {
          roleId: aspirantRole.id,
          passwordHash: "ffff2359200a4ab26347973ffbf34bde7a2e48d3ee98ad53ea7994404cdf7f15",
        },
        create: {
          email: "aspirant@pravaah.in",
          fullName: "Ananya Sharma",
          passwordHash: "ffff2359200a4ab26347973ffbf34bde7a2e48d3ee98ad53ea7994404cdf7f15",
          roleId: aspirantRole.id,
        },
      });
      console.log("✅ Verified system roles and accounts.");
    } catch (e) {
      console.warn("⚠️ System account check warning:", e.message);
    }

    // 7. Reconcile verified question status to PUBLISHED
    try {
      const reconciled = await prisma.question.updateMany({
        where: {
          status: { in: ["NEEDS_REVIEW", "VERIFIED"] },
          options: { some: { isCorrect: true } },
          explanation: { isNot: null },
        },
        data: { status: "PUBLISHED" },
      });
      if (reconciled.count > 0) {
        console.log(`✅ Promoted ${reconciled.count} verified questions to PUBLISHED.`);
      }
    } catch (e) {
      console.warn("⚠️ Question status reconciliation warning:", e.message);
    }
  } catch (err) {
    console.warn("⚠️ Table synchronizer warning:", err.message);
  } finally {
    await prisma.$disconnect();
    console.log("=========================================\n");
  }
}

main().catch(console.error);
