import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TABLE_DELEGATES = [
  { table: "Role", delegate: "role" },
  { table: "User", delegate: "user" },
  { table: "UserProfile", delegate: "userProfile" },
  { table: "Exam", delegate: "exam" },
  { table: "ExamStage", delegate: "examStage" },
  { table: "Paper", delegate: "paper" },
  { table: "Subject", delegate: "subject" },
  { table: "Topic", delegate: "topic" },
  { table: "SyllabusNode", delegate: "syllabusNode" },
  { table: "SourceDocument", delegate: "sourceDocument" },
  { table: "Question", delegate: "question" },
  { table: "QuestionOption", delegate: "questionOption" },
  { table: "Explanation", delegate: "explanation" },
  { table: "AnswerKeyVersion", delegate: "answerKeyVersion" },
  { table: "QuestionTopic", delegate: "questionTopic" },
  { table: "QuestionSource", delegate: "questionSource" },
  { table: "Test", delegate: "test" },
  { table: "TestQuestion", delegate: "testQuestion" },
  { table: "TestSession", delegate: "testSession" },
  { table: "UserAttempt", delegate: "userAttempt" },
  { table: "UserResponse", delegate: "userResponse" },
  { table: "Bookmark", delegate: "bookmark" },
  { table: "UserNote", delegate: "userNote" },
  { table: "ReviewSchedule", delegate: "reviewSchedule" },
  { table: "StudyGoal", delegate: "studyGoal" },
  { table: "StudyActivity", delegate: "studyActivity" },
  { table: "ContentImportJob", delegate: "contentImportJob" },
  { table: "ContentReview", delegate: "contentReview" },
  { table: "AuditLog", delegate: "auditLog" },
  { table: "Plan", delegate: "plan" },
  { table: "PlanPrice", delegate: "planPrice" },
  { table: "PlanFeature", delegate: "planFeature" },
  { table: "FeatureEntitlement", delegate: "featureEntitlement" },
  { table: "Subscription", delegate: "subscription" },
  { table: "SubscriptionEvent", delegate: "subscriptionEvent" },
  { table: "PaymentRecord", delegate: "paymentRecord" },
  { table: "RefundRecord", delegate: "refundRecord" },
  { table: "CurrentAffairsStory", delegate: "currentAffairsStory" },
  { table: "StoryTopic", delegate: "storyTopic" },
  { table: "StoryQuestionLink", delegate: "storyQuestionLink" },
  { table: "DailyQuiz", delegate: "dailyQuiz" },
  { table: "DailyQuizQuestion", delegate: "dailyQuizQuestion" },
  { table: "DailyQuizAttempt", delegate: "dailyQuizAttempt" },
  { table: "ExamDirectory", delegate: "examDirectory" },
  { table: "MainsQuestion", delegate: "mainsQuestion" },
  { table: "MainsDraft", delegate: "mainsDraft" },
  { table: "BackgroundJob", delegate: "backgroundJob" },
  { table: "SourceRegistryRecord", delegate: "sourceRegistryRecord" },
];

// Helper to convert SQLite integer booleans and date strings
function sanitizeRecord(record) {
  const sanitized = { ...record };
  for (const [key, value] of Object.entries(sanitized)) {
    if (value === null || value === undefined) continue;

    // Convert date string if matching ISO or SQL date format
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test(value)
    ) {
      sanitized[key] = new Date(value);
    }
  }
  return sanitized;
}

// Convert known boolean fields from 0/1 to boolean
const BOOLEAN_FIELDS = new Set([
  "isStatic",
  "isCurrentAffairs",
  "isDraft",
  "hasVisualAsset",
  "isEliminated",
  "isCorrect",
  "isOfficial",
  "isSubjective",
  "completed",
  "autoRenew",
  "isPrimary",
  "active",
  "isPublished",
  "isVerified",
]);

async function main() {
  const seedPath = path.resolve(process.cwd(), "data/backup/neon_seed_data.json");
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed data not found at ${seedPath}`);
    process.exit(1);
  }

  console.log("📦 Loading backup seed data...");
  const rawData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  console.log("🚀 Starting data migration into Neon PostgreSQL...");

  for (const { table, delegate } of TABLE_DELEGATES) {
    const rows = rawData[table] || [];
    if (rows.length === 0) continue;

    const model = prisma[delegate];
    if (!model) {
      console.warn(`⚠️ No Prisma delegate found for model '${delegate}' (table: ${table})`);
      continue;
    }

    console.log(`📥 Migrating ${rows.length} records into ${table}...`);

    const sanitizedRows = rows.map((row) => {
      const clean = sanitizeRecord(row);
      for (const [k, v] of Object.entries(clean)) {
        if (BOOLEAN_FIELDS.has(k) && typeof v === "number") {
          clean[k] = Boolean(v);
        }
      }
      return clean;
    });

    // Chunk insertions in batches of 100
    const chunkSize = 100;
    for (let i = 0; i < sanitizedRows.length; i += chunkSize) {
      const batch = sanitizedRows.slice(i, i + chunkSize);
      try {
        if (typeof model.createMany === "function") {
          await model.createMany({
            data: batch,
            skipDuplicates: true,
          });
        } else {
          for (const item of batch) {
            await model.create({ data: item }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn(`⚠️ Batch insert error on ${table}: ${err.message}. Retrying individually...`);
        for (const item of batch) {
          try {
            await model.create({ data: item });
          } catch {
            // ignore duplicate or foreign key issue
          }
        }
      }
    }
  }

  console.log("✅ Data successfully seeded into Neon PostgreSQL!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

