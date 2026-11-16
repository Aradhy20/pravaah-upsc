/**
 * Pravaah UPSC — Duplicate Detection & Collision Resolution Service
 * Implements exact, normalized, exam-number, and Sorensen-Dice bigram matching.
 */

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType?: 'EXACT_HASH' | 'NORMALIZED_TEXT' | 'EXAM_COORDINATE' | 'SEMANTIC_SIMILARITY';
  similarityScore: number;
  matchedQuestionId?: string;
  matchedGroupId?: string;
  reason?: string;
}

export function cleanTextForComparison(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, '') // preserves English alphanumeric and Hindi unicode
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateDiceSimilarity(str1: string, str2: string): number {
  const s1 = cleanTextForComparison(str1);
  const s2 = cleanTextForComparison(str2);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string): Set<string> => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  for (const item of b1) {
    if (b2.has(item)) intersection++;
  }

  return (2.0 * intersection) / (b1.size + b2.size);
}

export function detectQuestionDuplicate(
  candidate: {
    examCategory: string;
    year: number;
    paperCode: string;
    questionNumber?: number;
    questionText: string;
    language?: string;
  },
  existingBank: Array<{
    id: string;
    questionGroupId?: string | null;
    examCategory: string;
    year: number;
    paperCode: string;
    questionNumber: number;
    questionText: string;
  }>,
  similarityThreshold = 0.88
): DuplicateCheckResult {
  const candidateClean = cleanTextForComparison(candidate.questionText);

  for (const existing of existingBank) {
    // 1. Exam Coordinate Match (Same Exam, Year, Paper, and Question Number)
    if (
      candidate.questionNumber !== undefined &&
      candidate.examCategory === existing.examCategory &&
      candidate.year === existing.year &&
      candidate.paperCode === existing.paperCode &&
      candidate.questionNumber === existing.questionNumber
    ) {
      return {
        isDuplicate: true,
        duplicateType: 'EXAM_COORDINATE',
        similarityScore: 1.0,
        matchedQuestionId: existing.id,
        matchedGroupId: existing.questionGroupId || undefined,
        reason: `Matched exact examination coordinate: ${existing.examCategory} ${existing.year} Paper ${existing.paperCode} Q.${existing.questionNumber}`,
      };
    }

    // 2. Strict Exam Family Boundary: Never merge across different exams merely because wording is similar
    if (candidate.examCategory !== existing.examCategory) {
      continue;
    }

    const existingClean = cleanTextForComparison(existing.questionText);

    // 3. Exact Normalized Match
    if (candidateClean === existingClean) {
      return {
        isDuplicate: true,
        duplicateType: 'NORMALIZED_TEXT',
        similarityScore: 1.0,
        matchedQuestionId: existing.id,
        matchedGroupId: existing.questionGroupId || undefined,
        reason: `Exact normalized text match with existing question ${existing.id}`,
      };
    }

    // 4. Sorensen-Dice Bigram Semantic Similarity Match
    const similarity = calculateDiceSimilarity(candidateClean, existingClean);
    if (similarity >= similarityThreshold) {
      return {
        isDuplicate: true,
        duplicateType: 'SEMANTIC_SIMILARITY',
        similarityScore: Math.round(similarity * 100) / 100,
        matchedQuestionId: existing.id,
        matchedGroupId: existing.questionGroupId || undefined,
        reason: `High semantic bigram similarity (${(similarity * 100).toFixed(1)}%) with question ${existing.id}`,
      };
    }
  }

  return {
    isDuplicate: false,
    similarityScore: 0.0,
  };
}
