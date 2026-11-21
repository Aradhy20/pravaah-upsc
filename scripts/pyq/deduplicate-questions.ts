import { PrismaClient } from '@prisma/client';
import { NormalizedQuestion } from './normalize-questions';

export interface DeduplicationDecision {
  question: NormalizedQuestion;
  action: 'INSERT_NEW' | 'ENRICH_EXISTING' | 'SKIP_DUPLICATE';
  existingRecordId?: string;
  reason: string;
}

export async function deduplicateCandidateQuestions(
  prisma: PrismaClient,
  candidates: NormalizedQuestion[]
): Promise<DeduplicationDecision[]> {
  console.log(`🛡️ [Pravaah PYQ ETL] Deduplicating ${candidates.length} candidate questions...`);

  const decisions: DeduplicationDecision[] = [];

  // Fetch papers map
  const papers = await prisma.paper.findMany({ select: { id: true, code: true } });
  const paperMap = new Map(papers.map((p) => [p.code.toUpperCase(), p.id]));

  for (const q of candidates) {
    const paperId = paperMap.get(q.paperCode);
    if (!paperId) {
      decisions.push({
        question: q,
        action: 'SKIP_DUPLICATE',
        reason: `Paper code '${q.paperCode}' not found in database.`,
      });
      continue;
    }

    // 1. Check exact unique composite key (paperId, year, questionNumber)
    const existing = await prisma.question.findFirst({
      where: {
        paperId,
        year: q.year,
        questionNumber: q.questionNumber,
      },
      include: {
        options: true,
        answers: true,
        explanation: true,
      },
    });

    if (!existing) {
      decisions.push({
        question: q,
        action: 'INSERT_NEW',
        reason: `No question found for ${q.year} ${q.paperCode} Q${q.questionNumber}. Ready for fresh insertion.`,
      });
      continue;
    }

    // 2. If existing, check if candidate provides enrichment
    const hasMissingHindi = !existing.questionTextHi && Boolean(q.questionTextHi);
    const hasMissingElimination = !existing.explanation?.eliminationTechnique;

    if (hasMissingHindi || hasMissingElimination) {
      decisions.push({
        question: q,
        action: 'ENRICH_EXISTING',
        existingRecordId: existing.id,
        reason: `Existing record found (${existing.id}). Candidate provides enrichment (Hindi translation / elimination technique).`,
      });
    } else {
      decisions.push({
        question: q,
        action: 'SKIP_DUPLICATE',
        existingRecordId: existing.id,
        reason: `Identical record already exists with complete data (${existing.id}). Safe skip.`,
      });
    }
  }

  const newCount = decisions.filter((d) => d.action === 'INSERT_NEW').length;
  const enrichCount = decisions.filter((d) => d.action === 'ENRICH_EXISTING').length;
  const skipCount = decisions.filter((d) => d.action === 'SKIP_DUPLICATE').length;

  console.log(`  ✓ Results: ${newCount} New | ${enrichCount} Enrichment | ${skipCount} Identical Skipped`);
  return decisions;
}
