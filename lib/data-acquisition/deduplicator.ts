/**
 * Pravaah UPSC — Question Deduplication Engine
 * Phase 9: Automated duplicate detection using exact and fuzzy semantic similarity.
 */

export function cleanTextForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Sorensen-Dice bigram similarity coefficient (0.0 to 1.0)
 */
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

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);

  let intersection = 0;
  for (const b of bigrams1) {
    if (bigrams2.has(b)) intersection++;
  }

  return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
}

export function isDuplicateQuestion(
  newText: string,
  existingQuestions: { id: string; questionText: string }[],
  similarityThreshold = 0.88
): { isDuplicate: boolean; matchedId?: string; similarity: number } {
  const cleanNew = cleanTextForComparison(newText);

  for (const item of existingQuestions) {
    const cleanExisting = cleanTextForComparison(item.questionText);
    if (cleanNew === cleanExisting) {
      return { isDuplicate: true, matchedId: item.id, similarity: 1.0 };
    }

    const similarity = calculateDiceSimilarity(cleanNew, cleanExisting);
    if (similarity >= similarityThreshold) {
      return { isDuplicate: true, matchedId: item.id, similarity };
    }
  }

  return { isDuplicate: false, similarity: 0.0 };
}
