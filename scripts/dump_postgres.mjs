import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const MODELS = [
  "Role",
  "User",
  "UserProfile",
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
  "Subscription",
  "SubscriptionEvent",
  "PaymentRecord",
  "PaymentOrder",
  "PaymentWebhookEvent",
  "RefundRecord",
  "UserNote",
  "Bookmark",
  "UserAttempt",
  "UserResponse",
  "ReviewSchedule",
  "StudyGoal",
  "StudyActivity",
  "Test",
  "TestQuestion",
  "TestSession",
  "DailyQuiz",
  "DailyQuizQuestion",
  "DailyQuizAttempt",
  "MainsQuestion",
  "MainsDraft",
  "VideoLesson",
  "VideoProgress",
  "TopperCopy",
  "ContentImportJob",
  "ContentReview",
  "AuditLog",
  "IngestionJobAudit",
];

async function dumpPostgres() {
  console.log("🐘 Starting Full Docker PostgreSQL Data Export...");
  const dump = {};
  const startTime = Date.now();
  let totalRecords = 0;

  for (const modelName of MODELS) {
    const accessor = modelName[0].toLowerCase() + modelName.slice(1);
    if (typeof prisma[accessor]?.findMany === "function") {
      try {
        const records = await prisma[accessor].findMany();
        dump[modelName] = records;
        if (records.length > 0) {
          console.log(`  ✓ ${modelName.padEnd(28)} : ${records.length} records`);
          totalRecords += records.length;
        }
      } catch (e) {
        console.warn(`  ! Could not export ${modelName}: ${e.message}`);
      }
    }
  }

  const backupDir = path.join(process.cwd(), "data", "backup");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const outputPath = path.join(backupDir, "postgres_full_dump.json");
  fs.writeFileSync(outputPath, JSON.stringify(dump, null, 2), "utf-8");

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const fileSizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Docker PostgreSQL Export Complete!`);
  console.log(`📊 Total Records: ${totalRecords}`);
  console.log(`💾 Saved to: ${outputPath} (${fileSizeMb} MB)`);
  console.log(`⏱️ Duration: ${duration}s\n`);

  await prisma.$disconnect();
}

dumpPostgres().catch(async (e) => {
  console.error("Export failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
