import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const MODELS = [
  "Role",
  "User",
  "UserSession",
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
  "Question",
  "QuestionOption",
  "Explanation",
  "QuestionAnswer",
  "SourceCitation",
  "KnowledgeSource",
  "ExamYear",
  "QuestionSyllabusMapping",
  "QuestionTopic",
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

async function exportAll() {
  console.log("Starting Full Neon PostgreSQL Data Export...");
  const dump = {};
  const startTime = Date.now();

  for (const modelName of MODELS) {
    const accessor = modelName[0].toLowerCase() + modelName.slice(1);
    if (typeof prisma[accessor]?.findMany === "function") {
      try {
        const records = await prisma[accessor].findMany();
        dump[modelName] = records;
        console.log(`Exported ${modelName}: ${records.length} records`);
      } catch (e) {
        console.warn(`Could not export ${modelName}: ${e.message}`);
      }
    }
  }

  const outputPath = path.join(process.cwd(), "scripts", "neon_full_dump.json");
  fs.writeFileSync(outputPath, JSON.stringify(dump, null, 2), "utf-8");

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const fileSizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`\nExport Completed in ${duration}s!`);
  console.log(`Saved to ${outputPath} (${fileSizeMb} MB)`);

  await prisma.$disconnect();
}

exportAll().catch(async (e) => {
  console.error("Export failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
