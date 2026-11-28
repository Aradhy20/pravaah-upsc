export interface MarkingScheme {
  positiveMark: number;
  negativeMark: number;
}

export interface QuestionGradingInput {
  questionId: string;
  selectedOption: string | null;
  correctOption: string;
  subjectName?: string;
  timeSpentSeconds?: number;
}

export interface SubjectGradingStat {
  subject: string;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface TestScorecard {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  rawScore: number;
  negativeMarks: number;
  netScore: number;
  accuracyPercentage: number;
  subjectBreakdown: Record<string, SubjectGradingStat>;
  isQualified?: boolean;
  qualifyingThreshold?: number;
}

export const UPSC_MARKING_SCHEMES: Record<string, MarkingScheme> = {
  GS1: { positiveMark: 2.0, negativeMark: 2.0 / 3.0 },
  GS2: { positiveMark: 2.5, negativeMark: 2.5 / 3.0 },
  CSAT: { positiveMark: 2.5, negativeMark: 2.5 / 3.0 },
  ENG_CDS: { positiveMark: 0.833, negativeMark: 0.277 },
  GK_CDS: { positiveMark: 0.833, negativeMark: 0.277 },
  MATH_CDS: { positiveMark: 1.0, negativeMark: 0.333 },
  MATH_NDA: { positiveMark: 2.5, negativeMark: 0.833 },
  GAT_NDA: { positiveMark: 4.0, negativeMark: 1.333 },
  CAPF_P1: { positiveMark: 2.0, negativeMark: 0.666 },
  CMS_P1: { positiveMark: 2.083, negativeMark: 0.694 },
  CMS_P2: { positiveMark: 2.083, negativeMark: 0.694 },
  ESE_GS: { positiveMark: 2.0, negativeMark: 0.666 },
  ESE_ENGG_OBJ: { positiveMark: 2.0, negativeMark: 0.666 },
  ISS_STAT_1: { positiveMark: 2.5, negativeMark: 0.833 },
  ISS_STAT_2: { positiveMark: 2.5, negativeMark: 0.833 },
  CGSE_GS: { positiveMark: 1.0, negativeMark: 0.333 },
  CGSE_STREAM_OBJ: { positiveMark: 2.5, negativeMark: 0.833 },
  EPFO_RT: { positiveMark: 2.5, negativeMark: 0.833 },
  APFC_RT: { positiveMark: 2.5, negativeMark: 0.833 },
  CISF_P1: { positiveMark: 2.0, negativeMark: 0.666 },
  CBI_P1: { positiveMark: 2.0, negativeMark: 0.666 },
  SCRA_P1: { positiveMark: 1.666, negativeMark: 0.555 },
  SCRA_P2: { positiveMark: 1.666, negativeMark: 0.555 },
  SCRA_P3: { positiveMark: 2.0, negativeMark: 0.666 },
};

/**
 * Calculates authentic UPSC score adhering to examination and paper rules
 */
export function calculateScorecard(
  paperCode: string,
  items: QuestionGradingInput[],
  customScheme?: MarkingScheme
): TestScorecard {
  const scheme = customScheme || UPSC_MARKING_SCHEMES[paperCode] || UPSC_MARKING_SCHEMES.GS1;

  let attemptedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const subjectMap: Record<
    string,
    { attempted: number; correct: number; incorrect: number }
  > = {};

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

  const subjectBreakdown: Record<string, SubjectGradingStat> = {};
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

  const isCSAT = paperCode.toUpperCase() === "GS2";
  const isQualified = isCSAT ? netScore >= 66 : undefined;
  const qualifyingThreshold = isCSAT ? 66 : undefined;

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
    isQualified,
    qualifyingThreshold,
  };
}
