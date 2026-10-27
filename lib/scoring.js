export const UPSC_MARKING_SCHEMES = {
  GS1: {
    positiveMark: 2.0,
    negativeMark: 2.0 / 3.0, // 0.6666...
  },
  GS2: {
    positiveMark: 2.5,
    negativeMark: 2.5 / 3.0, // 0.8333...
  },
};

/**
 * Calculates authentic UPSC score adhering to paper rules
 */
export function calculateScorecard(paperCode, items) {
  const scheme = UPSC_MARKING_SCHEMES[paperCode] || UPSC_MARKING_SCHEMES.GS1;

  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const subjectMap = {};

  for (const item of items) {
    const subj = item.subjectName || "General";
    if (!subjectMap[subj]) {
      subjectMap[subj] = { attempted: 0, correct: 0, incorrect: 0 };
    }

    if (!item.selectedOption) {
      unattemptedCount++;
    } else {
      attemptedCount++;
      subjectMap[subj].attempted++;

      if (item.selectedOption.toUpperCase() === item.correctOption.toUpperCase()) {
        correctCount++;
        subjectMap[subj].correct++;
      } else {
        incorrectCount++;
        subjectMap[subj].incorrect++;
      }
    }
  }

  const rawScore = Number((correctCount * scheme.positiveMark).toFixed(3));
  const negativeMarks = Number((incorrectCount * scheme.negativeMark).toFixed(3));
  const netScore = Number((rawScore - negativeMarks).toFixed(2));
  const accuracyPercentage =
    attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

  const subjectBreakdown = {};
  for (const [subj, data] of Object.entries(subjectMap)) {
    subjectBreakdown[subj] = {
      subject: subj,
      attempted: data.attempted,
      correct: data.correct,
      incorrect: data.incorrect,
      accuracy:
        data.attempted > 0
          ? Number(((data.correct / data.attempted) * 100).toFixed(1))
          : 0,
    };
  }

  return {
    totalQuestions: items.length,
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    rawScore,
    negativeMarks,
    netScore,
    accuracyPercentage,
    subjectBreakdown,
  };
}
