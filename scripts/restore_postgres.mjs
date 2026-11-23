import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

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

const prisma = new PrismaClient({
  ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
});

// Strict Authentic Curriculum & Question Bank Models (Excludes test users, simulated attempts, and mock payments)
const RESTORE_ORDER = [
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
  "Plan",
  "PlanPrice",
  "PlanFeature",
  "FeatureEntitlement",
  "MainsQuestion",
  "VideoLesson",
  "TopperCopy",
];

async function restorePostgres() {
  const dumpPath = path.join(process.cwd(), "data", "backup", "postgres_full_dump.json");
  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found at ${dumpPath}`);
    process.exit(1);
  }

  console.log(`📂 Loading PostgreSQL data from: ${dumpPath}`);
  const rawData = fs.readFileSync(dumpPath, "utf-8");
  const dump = JSON.parse(rawData);

  console.log("⚡ Restoring records into PostgreSQL (Docker)...");
  let restoredCount = 0;

  for (const modelName of RESTORE_ORDER) {
    const accessor = modelName[0].toLowerCase() + modelName.slice(1);
    const records = dump[modelName];

    if (!records || !Array.isArray(records) || records.length === 0) {
      continue;
    }

    if (typeof prisma[accessor]?.createMany !== "function") {
      console.warn(`  ! Delegate prisma.${accessor}.createMany not available, falling back to sequential create`);
      let count = 0;
      for (const record of records) {
        try {
          await prisma[accessor].create({ data: record });
          count++;
        } catch (e) {
          // ignore duplicate
        }
      }
      console.log(`  ✓ Restored ${modelName.padEnd(28)}: ${count} records`);
      restoredCount += count;
      continue;
    }

    try {
      const res = await prisma[accessor].createMany({
        data: records,
        skipDuplicates: true,
      });
      console.log(`  ✓ Restored ${modelName.padEnd(28)}: ${res.count} records`);
      restoredCount += res.count;
    } catch (err) {
      console.warn(`  ! createMany failed for ${modelName}: ${err.message}. Trying upsert/create fallback...`);
      let success = 0;
      for (const rec of records) {
        try {
          await prisma[accessor].create({ data: rec });
          success++;
        } catch {
          // duplicate ignored
        }
      }
      console.log(`  ✓ Restored (fallback) ${modelName.padEnd(17)}: ${success} records`);
      restoredCount += success;
    }
  }

  console.log(`\n🎉 Restoration complete! Total records processed/restored: ${restoredCount}\n`);
  await prisma.$disconnect();
}

restorePostgres().catch(async (e) => {
  console.error("Restoration failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
