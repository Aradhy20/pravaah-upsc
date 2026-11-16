import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const RESTORE_ORDER = [
  "Role",
  "User",
  "Exam",
  "ExamStage",
  "Paper",
  "Subject",
  "Topic",
  "Subtopic",
  "SyllabusNode",
  "SyllabusTopic",
  "NCERTBook",
  "NCERTChapter",
  "KnowledgeSource",
  "ExamYear",
  "Question",
  "QuestionOption",
  "Explanation",
  "QuestionAnswer",
  "SourceCitation",
  "QuestionSyllabusMapping",
  "QuestionTopic",
  "NCERTChapterQuestionLink",
  "CurrentAffairsStory",
  "CurrentAffairsTopicLink",
  "Plan",
  "Order",
  "Payment",
  "Subscription",
  "UserNote",
  "UserBookmark",
  "UserAttempt",
  "Test",
  "TestSession",
  "TestSessionResponse",
  "DailyQuiz",
  "DailyQuizAttempt",
  "MainsQuestion",
  "MainsAnswerSubmission",
  "SourceRegistryRecord",
  "SourceDocument",
  "IngestionJobAudit",
];

async function restore() {
  console.log("Starting Full Data Restore to Local Docker PostgreSQL...");
  const dumpPath = path.join(process.cwd(), "scripts", "neon_full_dump.json");
  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found at ${dumpPath}`);
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, "utf-8"));
  const startTime = Date.now();

  for (const modelName of RESTORE_ORDER) {
    const records = dump[modelName];
    if (!records || records.length === 0) continue;

    const accessor = modelName[0].toLowerCase() + modelName.slice(1);
    if (typeof prisma[accessor]?.createMany !== "function") {
      console.warn(`No createMany for ${modelName}, skipping.`);
      continue;
    }

    // Convert ISO date strings back to Date objects
    const cleanedRecords = records.map((record) => {
      const copy = { ...record };
      for (const [key, val] of Object.entries(copy)) {
        if (
          typeof val === "string" &&
          (key.endsWith("At") || key === "date" || key === "publishedAt" || key === "startedAt" || key === "completedAt" || key === "expiresAt") &&
          /^\d{4}-\d{2}-\d{2}T/.test(val)
        ) {
          copy[key] = new Date(val);
        }
      }
      return copy;
    });

    try {
      // Chunk inserts in batches of 200
      let inserted = 0;
      for (let i = 0; i < cleanedRecords.length; i += 200) {
        const batch = cleanedRecords.slice(i, i + 200);
        await prisma[accessor].createMany({
          data: batch,
          skipDuplicates: true,
        });
        inserted += batch.length;
      }
      console.log(`Restored ${modelName}: ${inserted} records`);
    } catch (e) {
      console.error(`Error restoring ${modelName}:`, e.message);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nLocal Data Restore Completed in ${duration}s!`);
  await prisma.$disconnect();
}

restore().catch(async (e) => {
  console.error("Restore failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
