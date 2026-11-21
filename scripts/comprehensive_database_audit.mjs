import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runDatabaseAudit() {
  console.log("==================================================================");
  console.log("       PRAVAAH UPSC - COMPREHENSIVE DATABASE & QA AUDIT ENGINE     ");
  console.log("==================================================================\n");

  const startTime = Date.now();
  const auditResults = {};

  // -------------------------------------------------------------
  // 1. Table Inventory & Record Counts
  // -------------------------------------------------------------
  console.log("[Phase 1] Auditing Table Inventory & Record Counts...");
  const tableCounts = {};

  const models = [
    "Role", "User", "UserProfile", "Exam", "ExamStage", "Paper", "Subject", "Topic",
    "Subtopic", "Question", "QuestionOption", "Explanation", "QuestionAnswer", "AnswerKeyVersion",
    "QuestionTopic", "SourceCitation", "SyllabusNode", "QuestionSyllabusMapping",
    "NCERTBook", "NCERTChapter", "NCERTChapterQuestionLink",
    "SourceDocument", "QuestionSource", "KnowledgeSource", "ExamYear",
    "HistoricalExamPeriod", "HistoricalPaper", "ExtractionJob", "IngestionJobAudit",
    "DataQualityReport", "BackgroundJob", "CurrentAffairsStory", "StoryQuestionLink",
    "DailyQuiz", "DailyQuizQuestion", "DailyQuizAttempt",
    "Test", "TestQuestion", "TestSession", "UserAttempt", "UserResponse", "Bookmark",
    "UserNote", "ReviewSchedule", "StudyGoal", "StudyActivity", "ContentImportJob",
    "AuditLog", "Plan", "PlanPrice", "PlanEntitlement", "Subscription", "SubscriptionEvent",
    "PaymentOrder", "PaymentRecord", "RefundRecord", "PaymentWebhookEvent", "Session", "MainsDraft"
  ];

  for (const model of models) {
    try {
      const accessor = model.charAt(0).toLowerCase() + model.slice(1);
      if (prisma[accessor]) {
        const count = await prisma[accessor].count();
        tableCounts[model] = count;
      } else {
        tableCounts[model] = "NOT_FOUND";
      }
    } catch (e) {
      tableCounts[model] = `ERROR: ${e.message}`;
    }
  }

  auditResults.tableCounts = tableCounts;

  const populatedTables = Object.entries(tableCounts).filter(([_, v]) => typeof v === "number" && v > 0);
  const emptyTables = Object.entries(tableCounts).filter(([_, v]) => v === 0);

  console.log(`  ✓ Total Models Audited: ${Object.keys(tableCounts).length}`);
  console.log(`  ✓ Populated Tables   : ${populatedTables.length}`);
  console.log(`  ✓ Empty Tables       : ${emptyTables.length}`);

  // -------------------------------------------------------------
  // 2. Question Record Integrity & Relational Verification
  // -------------------------------------------------------------
  console.log("\n[Phase 2] Auditing Question Records & Core Relationships...");
  const totalQuestions = await prisma.question.count();
  const mcqQuestions = await prisma.question.count({ where: { questionType: "MCQ" } });
  const mainsQuestions = await prisma.question.count({ where: { questionType: { not: "MCQ" } } });

  // Orphan questions: check if paperId exists in Paper table
  const allPapers = await prisma.paper.findMany({ select: { id: true, code: true } });
  const allPaperIds = new Set(allPapers.map((p) => p.id));
  
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      paperId: true,
      year: true,
      questionNumber: true,
      questionText: true,
      questionTextEn: true,
      questionTextHi: true,
      language: true,
      recordId: true,
      questionType: true,
      status: true,
      verificationStatus: true,
      examCategory: true,
      difficulty: true,
      marks: true,
      negativeMarks: true,
    },
  });

  let orphanQuestions = 0;
  let questionsMissingYear = 0;
  let questionsMissingText = 0;
  let bilingualQuestions = 0;
  let hindiOnlyQuestions = 0;
  let englishOnlyQuestions = 0;

  for (const q of allQuestions) {
    if (!allPaperIds.has(q.paperId)) orphanQuestions++;
    if (!q.year || q.year < 1990 || q.year > 2030) questionsMissingYear++;
    if (!q.questionText || q.questionText.trim().length < 10) questionsMissingText++;
    if (q.questionTextHi && q.questionTextEn) bilingualQuestions++;
    else if (q.questionTextHi && !q.questionTextEn) hindiOnlyQuestions++;
    else englishOnlyQuestions++;
  }

  // Options verification
  const totalOptions = await prisma.questionOption.count();
  const questionsWithOptions = await prisma.question.count({
    where: { options: { some: {} } },
  });
  const mcqWithout4Options = await prisma.$queryRawUnsafe(`
    SELECT q.id, q.year, q."questionNumber", count(o.id) as option_count 
    FROM "Question" q 
    LEFT JOIN "QuestionOption" o ON o."questionId" = q.id 
    WHERE q."questionType" = 'MCQ' 
    GROUP BY q.id, q.year, q."questionNumber" 
    HAVING count(o.id) < 4
  `);

  // Explanation verification
  const totalExplanations = await prisma.explanation.count();
  const questionsWithExplanation = await prisma.question.count({
    where: { explanation: { isNot: null } },
  });

  // Answers verification
  const totalAnswers = await prisma.questionAnswer.count();
  const questionsWithAnswer = await prisma.question.count({
    where: { answers: { some: {} } },
  });
  const officialFinalAnswers = await prisma.questionAnswer.count({
    where: { answerKeyType: "UPSC_FINAL_KEY" },
  });
  const officiallyVerifiedAnswers = await prisma.questionAnswer.count({
    where: { verificationStatus: "OFFICIALLY_VERIFIED" },
  });

  // Subject, Topic, and Syllabus mappings
  const questionsWithTopic = await prisma.question.count({
    where: { topics: { some: {} } },
  });
  const questionsWithSyllabus = await prisma.question.count({
    where: { syllabusMappings: { some: {} } },
  });
  const questionsWithCitations = await prisma.question.count({
    where: { citations: { some: {} } },
  });
  const questionsWithNCERT = await prisma.question.count({
    where: { ncertLinks: { some: {} } },
  });

  auditResults.questionIntegrity = {
    totalQuestions,
    mcqQuestions,
    mainsQuestions,
    orphanQuestions,
    questionsMissingYear,
    questionsMissingText,
    bilingualQuestions,
    englishOnlyQuestions,
    hindiOnlyQuestions,
    totalOptions,
    questionsWithOptions,
    mcqWithout4OptionsCount: mcqWithout4Options.length,
    totalExplanations,
    questionsWithExplanation,
    totalAnswers,
    questionsWithAnswer,
    officialFinalAnswers,
    officiallyVerifiedAnswers,
    questionsWithTopic,
    questionsWithSyllabus,
    questionsWithCitations,
    questionsWithNCERT,
  };

  console.log(`  ✓ Total Questions: ${totalQuestions} (MCQ: ${mcqQuestions}, Mains: ${mainsQuestions})`);
  console.log(`  ✓ Bilingual (EN+HI): ${bilingualQuestions}, English: ${englishOnlyQuestions}, Hindi: ${hindiOnlyQuestions}`);
  console.log(`  ✓ Questions with Options: ${questionsWithOptions} (MCQ with <4 options: ${mcqWithout4Options.length})`);
  console.log(`  ✓ Questions with Explanations: ${questionsWithExplanation} / ${totalQuestions} (${((questionsWithExplanation/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`  ✓ Questions with Answers: ${questionsWithAnswer} / ${totalQuestions} (${((questionsWithAnswer/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`  ✓ Questions with Topic Mappings: ${questionsWithTopic} / ${totalQuestions} (${((questionsWithTopic/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`  ✓ Questions with Syllabus Mappings: ${questionsWithSyllabus} / ${totalQuestions} (${((questionsWithSyllabus/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`  ✓ Questions with Citations: ${questionsWithCitations} / ${totalQuestions}`);
  console.log(`  ✓ Questions with NCERT Chapter Links: ${questionsWithNCERT} / ${totalQuestions}`);

  // -------------------------------------------------------------
  // 3. Duplicate Detection & Text Quality Analysis
  // -------------------------------------------------------------
  console.log("\n[Phase 3] Running Duplicate Detection & Text Quality Analysis...");
  
  const exactDuplicateMap = new Map();
  const textHashMap = new Map();
  let exactDuplicates = 0;

  for (const q of allQuestions) {
    const normalized = q.questionText.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 150);
    if (textHashMap.has(normalized)) {
      exactDuplicates++;
      const existing = textHashMap.get(normalized);
      if (!exactDuplicateMap.has(normalized)) {
        exactDuplicateMap.set(normalized, [existing]);
      }
      exactDuplicateMap.get(normalized).push(q);
    } else {
      textHashMap.set(normalized, q);
    }
  }

  // Duplicate question numbers within same paper & year
  const duplicateQuestionNumbersRaw = await prisma.$queryRawUnsafe(`
    SELECT q."paperId", q."year", q."questionNumber", count(*) as cnt 
    FROM "Question" q 
    GROUP BY q."paperId", q."year", q."questionNumber" 
    HAVING count(*) > 1
  `);

  const duplicateQuestionNumbers = duplicateQuestionNumbersRaw.map(r => ({
    paperId: r.paperId,
    year: r.year,
    questionNumber: r.questionNumber,
    count: Number(r.cnt),
  }));

  auditResults.duplicates = {
    exactDuplicatesCount: exactDuplicates,
    duplicateClustersCount: exactDuplicateMap.size,
    duplicateQuestionNumbersCount: duplicateQuestionNumbers.length,
    duplicateQuestionNumberDetails: duplicateQuestionNumbers,
  };

  console.log(`  ✓ Exact Duplicates Found: ${exactDuplicates} (in ${exactDuplicateMap.size} clusters)`);
  console.log(`  ✓ Duplicate (paperId, year, questionNumber) collisions: ${duplicateQuestionNumbers.length}`);

  // Sample top duplicate clusters
  const duplicateClusters = [];
  for (const [hash, cluster] of exactDuplicateMap.entries()) {
    if (duplicateClusters.length < 5) {
      duplicateClusters.push({
        sampleText: cluster[0].questionText.slice(0, 120),
        instances: cluster.map(c => ({ id: c.id, year: c.year, questionNumber: c.questionNumber, paperId: c.paperId })),
      });
    }
  }
  auditResults.sampleDuplicateClusters = duplicateClusters;

  // -------------------------------------------------------------
  // 4. Historical Year Distribution & Paper Breakdown (1995-2026)
  // -------------------------------------------------------------
  console.log("\n[Phase 4] Auditing Historical UPSC Coverage (1995–2026)...");
  
  const rawYearDistribution = await prisma.$queryRawUnsafe(`
    SELECT q."year", q."questionType", count(*) as question_count 
    FROM "Question" q 
    GROUP BY q."year", q."questionType" 
    ORDER BY q."year" ASC, q."questionType" ASC
  `);

  const yearDistribution = rawYearDistribution.map(y => ({
    year: y.year,
    questionType: y.questionType,
    count: Number(y.question_count),
  }));

  const rawPaperDistribution = await prisma.$queryRawUnsafe(`
    SELECT p.code as paper_code, p.name as paper_name, q."year", count(*) as count 
    FROM "Question" q 
    JOIN "Paper" p ON q."paperId" = p.id 
    GROUP BY p.code, p.name, q."year" 
    ORDER BY p.code ASC, q."year" ASC
  `);

  const paperDistribution = rawPaperDistribution.map(p => ({
    paperCode: p.paper_code,
    paperName: p.paper_name,
    year: p.year,
    count: Number(p.count),
  }));

  const examYearsInDb = await prisma.examYear.findMany({
    orderBy: { year: "asc" },
  });

  const historicalPeriods = await prisma.historicalExamPeriod.findMany();

  auditResults.yearDistribution = yearDistribution;
  auditResults.paperDistribution = paperDistribution;
  auditResults.examYearsInDbCount = examYearsInDb.length;
  auditResults.historicalPeriodsCount = historicalPeriods.length;

  console.log(`  ✓ Total Exam Year Registry Entries: ${examYearsInDb.length}`);
  console.log(`  ✓ Historical Exam Eras Recorded: ${historicalPeriods.length}`);
  console.log(`  ✓ Distinct Years with Imported Questions: ${new Set(yearDistribution.map(y => y.year)).size}`);

  // -------------------------------------------------------------
  // 5. Syllabus Node & Subject Hierarchy Verification
  // -------------------------------------------------------------
  console.log("\n[Phase 5] Auditing Syllabus & Subject Hierarchy...");
  const totalSyllabusNodes = await prisma.syllabusNode.count();
  const totalSubjects = await prisma.subject.count();
  const totalTopics = await prisma.topic.count();
  const totalSubtopics = await prisma.subtopic.count();
  const totalNCERTBooks = await prisma.nCERTBook.count();
  const totalNCERTChapters = await prisma.nCERTChapter.count();
  const totalNCERTQuestionLinks = await prisma.nCERTChapterQuestionLink.count();

  auditResults.hierarchy = {
    totalSyllabusNodes,
    totalSubjects,
    totalTopics,
    totalSubtopics,
    totalNCERTBooks,
    totalNCERTChapters,
    totalNCERTQuestionLinks,
  };

  console.log(`  ✓ Syllabus Nodes: ${totalSyllabusNodes}`);
  console.log(`  ✓ Subjects: ${totalSubjects}, Topics: ${totalTopics}, Subtopics: ${totalSubtopics}`);
  console.log(`  ✓ NCERT Books: ${totalNCERTBooks}, Chapters: ${totalNCERTChapters}, Question Links: ${totalNCERTQuestionLinks}`);

  // -------------------------------------------------------------
  // 6. Output Summary File
  // -------------------------------------------------------------
  const auditDurationMs = Date.now() - startTime;
  auditResults.durationMs = auditDurationMs;

  fs.mkdirSync(path.join(process.cwd(), "docs/audit"), { recursive: true });
  fs.writeFileSync(
    path.join(process.cwd(), "docs/audit/audit_raw_metrics.json"),
    JSON.stringify(
      auditResults,
      (key, value) => (typeof value === "bigint" ? Number(value) : value),
      2
    )
  );

  console.log(`\n==================================================================`);
  console.log(`  ✓ AUDIT COMPLETE IN ${auditDurationMs}ms`);
  console.log(`  ✓ Raw metrics exported to docs/audit/audit_raw_metrics.json`);
  console.log(`==================================================================\n`);

  return auditResults;
}

runDatabaseAudit()
  .catch((e) => {
    console.error("Audit script failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
