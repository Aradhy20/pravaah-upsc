import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function runFullAudit() {
  console.log('====================================================');
  console.log('PRAVAAH UPSC: FULL POST-IMPLEMENTATION DATABASE AUDIT');
  console.log('====================================================\n');

  // Ensure output directory
  const docsDir = path.join(process.cwd(), 'docs', 'audit');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // 1. TOTAL QUESTIONS
  const totalQuestions = await prisma.question.count();
  console.log(`[SQL 1] SELECT COUNT(*) FROM "Question"; -> ${totalQuestions}`);

  // 2. DUPLICATES & UNIQUE QUESTIONS
  // Group by (year, paperId, questionNumber) and by normalize(questionText)
  const duplicatesBySlotRaw: any[] = await prisma.$queryRaw`
    SELECT year, "paperId", "questionNumber", COUNT(*) as cnt
    FROM "Question"
    GROUP BY year, "paperId", "questionNumber"
    HAVING COUNT(*) > 1;
  `;
  const slotDuplicatesCount = duplicatesBySlotRaw.reduce((acc, row) => acc + (Number(row.cnt) - 1), 0);

  const duplicatesByTextRaw: any[] = await prisma.$queryRaw`
    SELECT MD5(TRIM(LOWER("questionText"))) as text_hash, COUNT(*) as cnt, MIN("questionText") as sample_text
    FROM "Question"
    GROUP BY MD5(TRIM(LOWER("questionText")))
    HAVING COUNT(*) > 1;
  `;
  const textDuplicatesCount = duplicatesByTextRaw.reduce((acc, row) => acc + (Number(row.cnt) - 1), 0);
  const totalUniqueQuestions = totalQuestions - slotDuplicatesCount;

  console.log(`[SQL 2] Duplicate slots: ${slotDuplicatesCount}, Text-based duplicates: ${textDuplicatesCount}`);

  // 3. EXAM STAGES & PAPERS
  const prelimsQuestions = await prisma.question.count({
    where: { examStage: 'PRELIMS' },
  });
  console.log(`[SQL 3] SELECT COUNT(*) FROM "Question" WHERE "examStage" = 'PRELIMS'; -> ${prelimsQuestions}`);

  // CSAT Questions (Paper code GS2 or name CSAT)
  const csatPaperIds = (await prisma.paper.findMany({
    where: {
      OR: [
        { code: { contains: 'GS2', mode: 'insensitive' } },
        { name: { contains: 'CSAT', mode: 'insensitive' } },
        { code: { contains: 'CSAT', mode: 'insensitive' } },
      ],
    },
    select: { id: true },
  })).map((p) => p.id);

  const csatQuestions = await prisma.question.count({
    where: { paperId: { in: csatPaperIds } },
  });
  console.log(`[SQL 4] CSAT Questions (Paper GS2 / CSAT): -> ${csatQuestions}`);

  // Mains Questions (from Question table + MainsQuestion table)
  const mainsInQuestionTable = await prisma.question.count({
    where: { examStage: 'MAINS' },
  });
  const mainsQuestionsDedicated = await prisma.mainsQuestion.count();
  const totalMainsQuestions = mainsInQuestionTable + mainsQuestionsDedicated;
  console.log(`[SQL 5] Mains Questions: Question table (${mainsInQuestionTable}) + MainsQuestion table (${mainsQuestionsDedicated}) = ${totalMainsQuestions}`);

  // Essay Questions
  const essayInQuestionTable = await prisma.question.count({
    where: {
      OR: [
        { questionType: 'ESSAY' },
        { paper: { code: { contains: 'ESSAY', mode: 'insensitive' } } },
      ],
    },
  });
  const essayInMainsTable = await prisma.mainsQuestion.count({
    where: { paperCode: 'ESSAY' },
  });
  const totalEssayQuestions = essayInQuestionTable + essayInMainsTable;
  console.log(`[SQL 6] Essay Questions: ${totalEssayQuestions}`);

  // Optional Questions
  const optionalQuestions = await prisma.question.count({
    where: {
      paper: {
        OR: [
          { code: { contains: 'OPTIONAL', mode: 'insensitive' } },
          { name: { contains: 'Optional', mode: 'insensitive' } },
        ],
      },
    },
  });
  console.log(`[SQL 7] Optional Questions: ${optionalQuestions}`);

  // Interview Questions
  const interviewQuestions = await prisma.interviewQuestion.count();
  console.log(`[SQL 8] SELECT COUNT(*) FROM "InterviewQuestion"; -> ${interviewQuestions}`);

  // Questions with Options
  const questionsWithOptionsRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "questionId") as cnt FROM "QuestionOption";
  `;
  const questionsWithOptions = Number(questionsWithOptionsRaw[0]?.cnt || 0);
  console.log(`[SQL 9] Questions with options: -> ${questionsWithOptions}`);

  // Correct Answers & Explanations
  const questionsWithCorrectAnswerRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "questionId") as cnt FROM "QuestionOption" WHERE "isCorrect" = true;
  `;
  const questionsWithCorrectOption = Number(questionsWithCorrectAnswerRaw[0]?.cnt || 0);

  const questionAnswersTotal = await prisma.questionAnswer.count();
  const questionAnswersUniqueQRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "questionId") as cnt FROM "QuestionAnswer";
  `;
  const questionsWithAnswerTableRecord = Number(questionAnswersUniqueQRaw[0]?.cnt || 0);

  const explanationCountRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "questionId") as cnt FROM "Explanation" 
    WHERE ("detailedExplanation" IS NOT NULL AND TRIM("detailedExplanation") != '')
       OR ("explanationEn" IS NOT NULL AND TRIM("explanationEn") != '')
       OR ("explanationHi" IS NOT NULL AND TRIM("explanationHi") != '')
       OR ("summary" IS NOT NULL AND TRIM("summary") != '');
  `;
  const questionsWithExplanation = Number(explanationCountRaw[0]?.cnt || 0);
  console.log(`[SQL 10] Questions with correct options: ${questionsWithCorrectOption}, QuestionAnswer rows: ${questionAnswersTotal} (${questionsWithAnswerTableRecord} unique Qs), with explanations: ${questionsWithExplanation}`);

  // Verified, Pending, Disputed Answers
  const verifiedAnswers = await prisma.questionAnswer.count({
    where: { verificationStatus: { in: ['OFFICIALLY_VERIFIED', 'VERIFIED', 'EXPERT_VERIFIED'] } },
  });
  const pendingAnswers = await prisma.questionAnswer.count({
    where: { verificationStatus: { in: ['PENDING_REVIEW', 'UNVERIFIED', 'DRAFT'] } },
  });
  const disputedAnswers = await prisma.questionAnswer.count({
    where: {
      OR: [
        { answerType: { in: ['AMBIGUOUS', 'DROPPED', 'DISPUTED'] } },
        { verificationStatus: 'DISPUTED' },
      ],
    },
  });
  console.log(`[SQL 11] Answer statuses: Verified=${verifiedAnswers}, Pending=${pendingAnswers}, Disputed=${disputedAnswers}`);

  // Language Breakdown
  const hindiQuestions = await prisma.question.count({
    where: {
      OR: [
        { questionTextHi: { not: null } },
        { translationStatus: { in: ['HUMAN_VERIFIED', 'ORIGINAL_SOURCE', 'MACHINE_TRANSLATED_REVIEW_REQUIRED'] } },
      ],
    },
  });
  const englishQuestions = await prisma.question.count({
    where: {
      OR: [
        { questionTextEn: { not: null } },
        { questionText: { not: '' } },
      ],
    },
  });
  console.log(`[SQL 12] Language coverage: Hindi=${hindiQuestions}, English=${englishQuestions}`);

  // Subject and Topic Mapping
  const questionsWithoutSubject = await prisma.question.count({
    where: { subjectId: null },
  });
  const questionsWithoutTopic = await prisma.question.count({
    where: { topicId: null },
  });
  const questionsWithSyllabusMappingRaw: any[] = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT "questionId") as cnt FROM "QuestionSyllabusMapping";
  `;
  const questionsWithSyllabusMapping = Number(questionsWithSyllabusMappingRaw[0]?.cnt || 0);
  const questionsWithoutSyllabusMapping = totalQuestions - questionsWithSyllabusMapping;

  const questionsWithoutSource = await prisma.question.count({
    where: {
      AND: [
        { sourceReference: null },
        { sourceId: null },
      ],
    },
  });
  console.log(`[SQL 13] Taxonomy coverage: withoutSubject=${questionsWithoutSubject}, withoutTopic=${questionsWithoutTopic}, withoutSyllabusMapping=${questionsWithoutSyllabusMapping}, withoutSource=${questionsWithoutSource}`);

  // 4. YEAR-WISE COMPLETENESS TABLE & CSV GENERATION
  console.log('\n--- CALCULATING YEAR-WISE COVERAGE ---');
  const yearsRaw: any[] = await prisma.$queryRaw`
    SELECT DISTINCT year FROM "Question" ORDER BY year DESC;
  `;
  const years: number[] = yearsRaw.map((r) => r.year);

  const yearWiseData: any[] = [];
  for (const yr of years) {
    const gs1Count = await prisma.question.count({
      where: {
        year: yr,
        paper: { code: { contains: 'GS1', mode: 'insensitive' } },
      },
    });

    const csatCount = await prisma.question.count({
      where: {
        year: yr,
        paperId: { in: csatPaperIds },
      },
    });

    const mainsCount = await prisma.mainsQuestion.count({
      where: { year: yr },
    });

    const mainsGS1 = await prisma.mainsQuestion.count({ where: { year: yr, paperCode: 'GS1' } });
    const mainsGS2 = await prisma.mainsQuestion.count({ where: { year: yr, paperCode: 'GS2' } });
    const mainsGS3 = await prisma.mainsQuestion.count({ where: { year: yr, paperCode: 'GS3' } });
    const mainsGS4 = await prisma.mainsQuestion.count({ where: { year: yr, paperCode: 'GS4' } });
    const mainsEssay = await prisma.mainsQuestion.count({ where: { year: yr, paperCode: 'ESSAY' } });

    // Status evaluation
    const gs1Status = gs1Count === 100 ? 'COMPLETE' : gs1Count > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const csatStatus = csatCount === 80 ? 'COMPLETE' : csatCount > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const mainsGS1Status = mainsGS1 >= 20 ? 'COMPLETE' : mainsGS1 > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const mainsGS2Status = mainsGS2 >= 20 ? 'COMPLETE' : mainsGS2 > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const mainsGS3Status = mainsGS3 >= 20 ? 'COMPLETE' : mainsGS3 > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const mainsGS4Status = mainsGS4 >= 19 ? 'COMPLETE' : mainsGS4 > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const essayStatus = mainsEssay >= 8 ? 'COMPLETE' : mainsEssay > 0 ? 'PARTIAL' : 'NOT AVAILABLE FROM SOURCE';
    const optionalStatus = 'NOT AVAILABLE FROM SOURCE';
    const languageStatus = 'NOT AVAILABLE FROM SOURCE';

    yearWiseData.push({
      year: yr,
      prelimsGS1: gs1Count,
      prelimsGS1Status: gs1Status,
      csatGS2: csatCount,
      csatGS2Status: csatStatus,
      mainsGS1,
      mainsGS1Status,
      mainsGS2,
      mainsGS2Status,
      mainsGS3,
      mainsGS3Status,
      mainsGS4,
      mainsGS4Status,
      essay: mainsEssay,
      essayStatus,
      optionalStatus,
      languageStatus,
    });
  }

  // Write YEAR_WISE_COVERAGE.csv
  const yearCsvHeader = 'Year,Prelims_GS1_Count,Prelims_GS1_Status,CSAT_GS2_Count,CSAT_GS2_Status,Mains_GS1_Count,Mains_GS1_Status,Mains_GS2_Count,Mains_GS2_Status,Mains_GS3_Count,Mains_GS3_Status,Mains_GS4_Count,Mains_GS4_Status,Essay_Count,Essay_Status,Optional_Status,Language_Status\n';
  const yearCsvRows = yearWiseData.map((d) =>
    [
      d.year,
      d.prelimsGS1,
      d.prelimsGS1Status,
      d.csatGS2,
      d.csatGS2Status,
      d.mainsGS1,
      d.mainsGS1Status,
      d.mainsGS2,
      d.mainsGS2Status,
      d.mainsGS3,
      d.mainsGS3Status,
      d.mainsGS4,
      d.mainsGS4Status,
      d.essay,
      d.essayStatus,
      d.optionalStatus,
      d.languageStatus,
    ].join(',')
  ).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'YEAR_WISE_COVERAGE.csv'), yearCsvHeader + yearCsvRows);
  console.log('✅ Generated YEAR_WISE_COVERAGE.csv');

  // 5. SUBJECT & TOPIC MAPPING AUDIT & CSV
  console.log('\n--- CALCULATING SUBJECT & TOPIC COVERAGE ---');
  const subjects = await prisma.subject.findMany({
    include: {
      topics: true,
    },
  });

  const subjectRows: any[] = [];
  for (const sub of subjects) {
    const qCount = await prisma.question.count({ where: { subjectId: sub.id } });
    for (const top of sub.topics) {
      const topQCount = await prisma.question.count({ where: { topicId: top.id } });
      subjectRows.push({
        subjectCode: sub.code,
        subjectName: sub.name,
        topicCode: top.code,
        topicName: top.name,
        questionCount: topQCount,
        subjectTotal: qCount,
      });
    }
    if (sub.topics.length === 0) {
      subjectRows.push({
        subjectCode: sub.code,
        subjectName: sub.name,
        topicCode: 'NONE',
        topicName: 'No Topics Defined',
        questionCount: 0,
        subjectTotal: qCount,
      });
    }
  }

  const subjectCsvHeader = 'Subject_Code,Subject_Name,Topic_Code,Topic_Name,Topic_Question_Count,Subject_Total_Questions\n';
  const subjectCsvRows = subjectRows.map((r) =>
    `"${r.subjectCode}","${r.subjectName}","${r.topicCode}","${r.topicName}",${r.questionCount},${r.subjectTotal}`
  ).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'SUBJECT_MAPPING_AUDIT.csv'), subjectCsvHeader + subjectCsvRows);
  console.log('✅ Generated SUBJECT_MAPPING_AUDIT.csv');

  // 6. ANSWER KEY VERIFICATION CSV
  console.log('\n--- AUDITING ANSWER KEYS & GENERATING CSV ---');
  const questionsSample = await prisma.question.findMany({
    take: 500, // sample of 500 questions for CSV audit
    include: {
      options: true,
      answers: true,
      paper: true,
      explanation: true,
    },
    orderBy: { year: 'desc' },
  });

  const answerAuditRows: any[] = [];
  for (const q of questionsSample) {
    const hasStatement = Boolean(q.questionText && q.questionText.trim().length > 10);
    const optionsCount = q.options.length;
    const correctOption = q.options.find((o) => o.isCorrect);
    const answerRecord = q.answers[0];
    const correctLetter = correctOption?.optionCode || answerRecord?.answerOption || 'NONE';
    const answerKeyType = answerRecord?.answerKeyType || 'NOT_FOUND';
    const verificationStatus = answerRecord?.verificationStatus || (correctOption ? 'AUTO_INFERRED' : 'MISSING');
    const hasExplanation = Boolean(q.explanation?.detailedExplanation || q.explanation?.explanationEn || q.explanation?.explanationHi || q.explanation?.summary);
    const sourceAttribution = q.sourceReference || q.sourceId || 'CANONICAL_DATABASE';

    answerAuditRows.push({
      questionId: q.id,
      year: q.year,
      paperCode: q.paper.code,
      questionNumber: q.questionNumber,
      hasStatement,
      optionsCount,
      correctAnswer: correctLetter,
      answerKeyType,
      verificationStatus,
      hasExplanation,
      sourceAttribution,
    });
  }

  const answerCsvHeader = 'Question_Id,Year,Paper_Code,Question_Number,Has_Statement,Options_Count,Correct_Answer,Answer_Key_Type,Verification_Status,Has_Explanation,Source_Attribution\n';
  const answerCsvRows = answerAuditRows.map((r) =>
    `"${r.questionId}",${r.year},"${r.paperCode}",${r.questionNumber},${r.hasStatement},${r.optionsCount},"${r.correctAnswer}","${r.answerKeyType}","${r.verificationStatus}",${r.hasExplanation},"${r.sourceAttribution}"`
  ).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'ANSWER_KEY_VERIFICATION.csv'), answerCsvHeader + answerCsvRows);
  console.log('✅ Generated ANSWER_KEY_VERIFICATION.csv');

  // 7. DUPLICATE QUESTIONS REPORT CSV (Both slot collisions and text duplicates)
  console.log('\n--- AUDITING DUPLICATES & GENERATING CSV ---');
  const duplicateRowsDetailed: any[] = await prisma.$queryRaw`
    SELECT q.id, q.year, p.code as paper_code, q."questionNumber", q."sourceReference", q."questionText", q."createdAt",
           CASE 
             WHEN (q.year, q."paperId", q."questionNumber") IN (
               SELECT year, "paperId", "questionNumber" FROM "Question" GROUP BY year, "paperId", "questionNumber" HAVING COUNT(*) > 1
             ) THEN 'SLOT_COLLISION'
             ELSE 'SEMANTIC_TEXT_DUPLICATE'
           END as duplicate_type
    FROM "Question" q
    JOIN "Paper" p ON q."paperId" = p.id
    WHERE MD5(TRIM(LOWER(q."questionText"))) IN (
      SELECT MD5(TRIM(LOWER("questionText")))
      FROM "Question"
      GROUP BY MD5(TRIM(LOWER("questionText")))
      HAVING COUNT(*) > 1
    )
    ORDER BY MD5(TRIM(LOWER(q."questionText"))), q.year DESC, q."questionNumber";
  `;

  const dupCsvHeader = 'Question_Id,Year,Paper_Code,Question_Number,Duplicate_Type,Source_Reference,Question_Text_Snippet,Created_At\n';
  const dupCsvRows = duplicateRowsDetailed.map((r) =>
    `"${r.id}",${r.year},"${r.paper_code}",${r.questionNumber},"${r.duplicate_type}","${r.sourceReference || ''}","${(r.questionText || '').slice(0, 100).replace(/"/g, '""').replace(/\n/g, ' ')}","${r.createdAt}"`
  ).join('\n');
  fs.writeFileSync(path.join(process.cwd(), 'DUPLICATE_QUESTIONS_REPORT.csv'), dupCsvHeader + dupCsvRows);
  console.log(`✅ Generated DUPLICATE_QUESTIONS_REPORT.csv (${duplicateRowsDetailed.length} duplicate rows identified)`);

  // 8. DATA EXTRACTION QUALITY: INSPECT 100 SAMPLE RECORDS
  console.log('\n--- INSPECTING 100 SAMPLE RECORDS FOR QUALITY ---');
  const sample100 = await prisma.question.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      options: true,
      answers: true,
      paper: true,
    },
  });

  let textIntegrityPass = 0;
  let ocrCleanPass = 0;
  let hindiCleanPass = 0;
  let optionsValidPass = 0;
  let answerKeyValidPass = 0;
  const sampleFailures: any[] = [];

  for (const q of sample100) {
    const textValid = Boolean(q.questionText && q.questionText.trim().length >= 20 && !q.questionText.includes('\uFFFD'));
    const ocrValid = !q.questionText.includes('OCR_ERROR') && !q.questionText.includes('Page 1 of');
    const hindiValid = !q.questionTextHi || (!q.questionTextHi.includes('???') && !q.questionTextHi.includes('\uFFFD'));
    const optionsValid = q.options.length === 4;
    const answerValid = q.options.some((o) => o.isCorrect) || q.answers.length > 0;

    if (textValid) textIntegrityPass++;
    if (ocrValid) ocrCleanPass++;
    if (hindiValid) hindiCleanPass++;
    if (optionsValid) optionsValidPass++;
    if (answerValid) answerKeyValidPass++;

    if (!textValid || !optionsValid || !answerValid) {
      sampleFailures.push({
        id: q.id,
        year: q.year,
        paper: q.paper.code,
        qNum: q.questionNumber,
        issues: [
          !textValid ? 'Short or corrupted text' : null,
          !optionsValid ? `Option count: ${q.options.length}` : null,
          !answerValid ? 'Missing answer key' : null,
        ].filter(Boolean),
      });
    }
  }

  console.log(`Quality Inspection Results (100 Sample Records):`);
  console.log(`  - Text Integrity: ${textIntegrityPass}/100`);
  console.log(`  - Clean OCR: ${ocrCleanPass}/100`);
  console.log(`  - Clean Hindi: ${hindiCleanPass}/100`);
  console.log(`  - Valid 4 Options: ${optionsValidPass}/100`);
  console.log(`  - Valid Answer Key: ${answerKeyValidPass}/100`);
  console.log(`  - Failed records identified: ${sampleFailures.length}`);

  // Summary object for documentation
  const auditSummary = {
    totalQuestions,
    totalUniqueQuestions,
    slotDuplicatesCount,
    textDuplicatesCount,
    prelimsQuestions,
    csatQuestions,
    totalMainsQuestions,
    mainsInQuestionTable,
    mainsQuestionsDedicated,
    totalEssayQuestions,
    optionalQuestions,
    interviewQuestions,
    questionsWithOptions,
    questionsWithCorrectOption,
    questionsWithAnswerTableRecord,
    questionsWithExplanation,
    verifiedAnswers,
    pendingAnswers,
    disputedAnswers,
    hindiQuestions,
    englishQuestions,
    questionsWithoutSubject,
    questionsWithoutTopic,
    questionsWithoutSyllabusMapping,
    questionsWithoutSource,
    sampleInspection: {
      textIntegrityPass,
      ocrCleanPass,
      hindiCleanPass,
      optionsValidPass,
      answerKeyValidPass,
      sampleFailures,
    },
  };

  fs.writeFileSync(path.join(docsDir, 'audit_metrics.json'), JSON.stringify(auditSummary, null, 2));
  console.log('\nAudit metrics written to docs/audit/audit_metrics.json');
}

runFullAudit()
  .catch((e) => {
    console.error('Audit failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
