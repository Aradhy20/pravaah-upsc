import { PrismaClient } from '@prisma/client';
import { NormalizedQuestion } from './normalize-questions';
import { AnswerVerificationResult } from './verify-answers';
import { validateQuestionRecord } from './validate-records';
import { mapExternalCategoryToPravaah } from './map-subjects';

export interface ImportCandidate {
  question: NormalizedQuestion;
  answer: AnswerVerificationResult;
  categoryHint?: string;
  subtopicHint?: string;
  explanationEn?: string;
  explanationHi?: string | null;
  eliminationTechnique?: string | null;
  sourceCitation?: string | null;
}

export interface ImportJobResult {
  jobId: string;
  isDryRun: boolean;
  totalCandidates: number;
  insertedCount: number;
  enrichedCount: number;
  skippedCount: number;
  validationFailureCount: number;
  errors: string[];
  durationMs: number;
}

export async function importQuestionBatch(
  prisma: PrismaClient,
  candidates: ImportCandidate[],
  options: { dryRun?: boolean; adminId?: string } = { dryRun: true }
): Promise<ImportJobResult> {
  const isDryRun = options.dryRun !== false;
  const startTime = Date.now();
  console.log(`🚀 [Pravaah PYQ Import Engine] Starting import (Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE COMMIT'})...`);

  let insertedCount = 0;
  let enrichedCount = 0;
  let skippedCount = 0;
  let validationFailureCount = 0;
  const errors: string[] = [];

  const papers = await prisma.paper.findMany({ select: { id: true, code: true } });
  const paperMap = new Map(papers.map((p) => [p.code.toUpperCase(), p.id]));

  for (const item of candidates) {
    const { question, answer } = item;

    // 1. Quality Gate Validation
    const validation = validateQuestionRecord(question, answer);
    if (!validation.isValid) {
      validationFailureCount++;
      errors.push(`Q${question.questionNumber} (${question.year} ${question.paperCode}) validation failed: ${validation.issues.map((i) => i.message).join('; ')}`);
      continue;
    }

    const paperId = paperMap.get(question.paperCode);
    if (!paperId) {
      errors.push(`Paper code '${question.paperCode}' does not exist in database.`);
      continue;
    }

    // 2. Check Existing
    const existing = await prisma.question.findFirst({
      where: {
        paperId,
        year: question.year,
        questionNumber: question.questionNumber,
      },
      include: {
        explanation: true,
      },
    });

    if (existing) {
      // Enrichment logic: Update missing Hindi translation or explanation without altering verified answers
      const needsHindi = !existing.questionTextHi && Boolean(question.questionTextHi);
      const needsElimination = !existing.explanation?.eliminationTechnique && Boolean(item.eliminationTechnique);

      if (needsHindi || needsElimination) {
        if (!isDryRun) {
          await prisma.question.update({
            where: { id: existing.id },
            data: {
              questionTextHi: question.questionTextHi || existing.questionTextHi,
            },
          });

          if (needsElimination && existing.explanation) {
            await prisma.explanation.update({
              where: { id: existing.explanation.id },
              data: {
                eliminationTechnique: item.eliminationTechnique,
              },
            });
          }
        }
        enrichedCount++;
      } else {
        skippedCount++;
      }
      continue;
    }

    // 3. New Insertion
    if (!isDryRun) {
      // Map Taxonomy
      const taxonomy = await mapExternalCategoryToPravaah(
        prisma,
        item.categoryHint || (question.paperCode === 'GS2' ? 'basic-numeracy' : 'economy'),
        item.subtopicHint
      );

      const createdQ = await prisma.question.create({
        data: {
          paperId,
          year: question.year,
          questionNumber: question.questionNumber,
          questionType: 'MCQ',
          questionText: question.questionTextEn,
          questionTextEn: question.questionTextEn,
          questionTextHi: question.questionTextHi || null,
          difficulty: 'MEDIUM',
          marks: question.marks,
          negativeMarks: question.negativeMarks,
          status: 'PUBLISHED',
          verificationStatus: answer.verificationStatus,
          language: question.questionTextHi ? 'Bilingual' : 'English',
          examCategory: 'CSE',
          subjectId: taxonomy.subjectId,
          topicId: taxonomy.topicId,
          options: {
            create: question.options.map((opt) => ({
              optionCode: opt.code,
              optionText: opt.textEn,
              optionTextEn: opt.textEn,
              optionTextHi: opt.textHi || null,
              isCorrect: opt.code === answer.answerOption,
            })),
          },
          answers: {
            create: {
              answerOption: answer.answerOption,
              answerType: answer.answerType,
              answerKeyType: answer.answerKeyType,
              answerProvenance: answer.answerProvenance,
              verificationStatus: answer.verificationStatus,
              publishedAt: new Date(`${question.year}-06-30`),
            },
          },
          explanation: item.explanationEn
            ? {
                create: {
                  summary: item.explanationEn.slice(0, 150),
                  detailedExplanation: item.explanationEn,
                  explanationEn: item.explanationEn,
                  explanationHi: item.explanationHi || null,
                  eliminationTechnique: item.eliminationTechnique || null,
                  sourceCitation: item.sourceCitation || null,
                },
              }
            : undefined,
          topics: taxonomy.topicId
            ? {
                create: {
                  topicId: taxonomy.topicId,
                },
              }
            : undefined,
        },
      });

      // Audit log entry
      if (options.adminId) {
        await prisma.auditLog.create({
          data: {
            adminId: options.adminId,
            action: 'IMPORT_PYQ_RECORD',
            entityType: 'QUESTION',
            entityId: createdQ.id,
            detailsJson: JSON.stringify({
              year: question.year,
              paper: question.paperCode,
              qNo: question.questionNumber,
            }),
          },
        });
      }
    }

    insertedCount++;
  }

  const durationMs = Date.now() - startTime;
  console.log(`\n🏁 [Pravaah PYQ Import Engine] Completed in ${durationMs}ms`);
  console.log(`   Mode: ${isDryRun ? 'DRY RUN' : 'COMMITTED TO DATABASE'}`);
  console.log(`   Total: ${candidates.length} | Inserted: ${insertedCount} | Enriched: ${enrichedCount} | Skipped: ${skippedCount} | Failed Quality Gate: ${validationFailureCount}`);

  return {
    jobId: `IMPORT-${Date.now()}`,
    isDryRun,
    totalCandidates: candidates.length,
    insertedCount,
    enrichedCount,
    skippedCount,
    validationFailureCount,
    errors,
    durationMs,
  };
}

// CLI Execution Handler
if (process.argv[1] && process.argv[1].endsWith('import-questions.ts')) {
  const isDryRun = !process.argv.includes('--commit') && !process.argv.includes('--no-dry-run');
  const prisma = new PrismaClient();

  // Test run with sample candidate
  const sampleCandidates: ImportCandidate[] = [
    {
      question: {
        year: 2024,
        paperCode: 'GS1',
        questionNumber: 99,
        questionText: 'With reference to the Red Sea, which of the following countries border it?',
        questionTextEn: 'With reference to the Red Sea, which of the following countries border it?',
        questionTextHi: 'लाल सागर के संदर्भ में, निम्नलिखित में से कौन से देश इसकी सीमा बनाते हैं?',
        options: [
          { code: 'A', text: 'Saudi Arabia and Egypt', textEn: 'Saudi Arabia and Egypt', textHi: 'सऊदी अरब और मिस्र' },
          { code: 'B', text: 'Oman and Yemen', textEn: 'Oman and Yemen', textHi: 'ओमान और यमन' },
          { code: 'C', text: 'Syria and Jordan', textEn: 'Syria and Jordan', textHi: 'सीरिया और जॉर्डन' },
          { code: 'D', text: 'Iran and Iraq', textEn: 'Iran and Iraq', textHi: 'ईरान और इराक' },
        ],
        marks: 2.0,
        negativeMarks: 0.666,
        sourceOrigin: 'UPSC_OFFICIAL',
      },
      answer: {
        answerOption: 'A',
        answerType: 'FINAL',
        answerKeyType: 'UPSC_FINAL_KEY',
        answerProvenance: 'UPSC_OFFICIAL_FINAL_MASTER_KEY',
        verificationStatus: 'OFFICIALLY_VERIFIED',
        confidenceScore: 1.0,
        sourceAttribution: 'UPSC CSE 2024 Series A Master Key',
      },
      categoryHint: 'ecology-and-environment',
      explanationEn: 'The six countries bordering the Red Sea are Saudi Arabia, Yemen, Egypt, Sudan, Eritrea, and Djibouti.',
      explanationHi: 'लाल सागर की सीमा से लगे छह देश सऊदी अरब, यमन, मिस्र, सूडान, इरिट्रिया और जिबूती हैं।',
      eliminationTechnique: 'Oman borders the Arabian Sea and Gulf of Oman, not the Red Sea. Eliminate Option B. Syria and Iran have no coastline on the Red Sea.',
      sourceCitation: 'NCERT Class XI Physical Geography; Orient BlackSwan Atlas',
    },
  ];

  importQuestionBatch(prisma, sampleCandidates, { dryRun: isDryRun })
    .catch((err) => {
      console.error('Fatal import error:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
