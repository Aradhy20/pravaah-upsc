import { NormalizedQuestion } from './normalize-questions';
import { AnswerVerificationResult } from './verify-answers';

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface RecordValidationReport {
  isValid: boolean;
  questionNumber: number;
  year: number;
  paperCode: string;
  issues: ValidationIssue[];
}

export function validateQuestionRecord(
  q: NormalizedQuestion,
  answer: AnswerVerificationResult
): RecordValidationReport {
  const issues: ValidationIssue[] = [];

  // 1. Question Statement
  if (!q.questionText || q.questionText.trim().length < 10) {
    issues.push({
      field: 'questionText',
      code: 'STEM_TOO_SHORT',
      message: 'Question stem must be at least 10 characters long.',
    });
  }

  // 2. Options validation (Must have 4 options)
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    issues.push({
      field: 'options',
      code: 'INVALID_OPTIONS_COUNT',
      message: `Question must contain exactly 4 options, found ${q.options?.length || 0}.`,
    });
  } else {
    const optionCodes = q.options.map((o) => o.code);
    const expected = ['A', 'B', 'C', 'D'];
    if (!expected.every((c) => optionCodes.includes(c as any))) {
      issues.push({
        field: 'options',
        code: 'MISSING_STANDARD_OPTION_CODES',
        message: 'Options must strictly contain codes A, B, C, and D.',
      });
    }
  }

  // 3. Year & Paper validation
  if (!q.year || q.year < 1995 || q.year > 2026) {
    issues.push({
      field: 'year',
      code: 'INVALID_YEAR',
      message: `Exam year ${q.year} is out of supported range (1995-2026).`,
    });
  }

  if (q.paperCode !== 'GS1' && q.paperCode !== 'GS2') {
    issues.push({
      field: 'paperCode',
      code: 'INVALID_PAPER_CODE',
      message: `Paper code must be GS1 or GS2, found '${q.paperCode}'.`,
    });
  }

  // 4. Marking scheme validation
  if (q.paperCode === 'GS1') {
    if (q.marks !== 2.0 || Math.abs(q.negativeMarks - 0.666) > 0.01) {
      issues.push({
        field: 'marks',
        code: 'INVALID_GS1_MARKING',
        message: 'GS1 must strictly use +2.0 marks and -0.666 negative penalty.',
      });
    }
  } else if (q.paperCode === 'GS2') {
    if (q.marks !== 2.5 || Math.abs(q.negativeMarks - 0.833) > 0.01) {
      issues.push({
        field: 'marks',
        code: 'INVALID_CSAT_MARKING',
        message: 'CSAT (GS2) must strictly use +2.5 marks and -0.833 negative penalty.',
      });
    }
  }

  // 5. Answer verification
  if (!answer || !answer.answerOption) {
    issues.push({
      field: 'answer',
      code: 'MISSING_ANSWER_KEY',
      message: 'Question must have an official or verified answer key.',
    });
  }

  return {
    isValid: issues.length === 0,
    questionNumber: q.questionNumber,
    year: q.year,
    paperCode: q.paperCode,
    issues,
  };
}

export function validateCandidateBatch(
  candidates: Array<{ question: NormalizedQuestion; answer: AnswerVerificationResult }>
): {
  total: number;
  validCount: number;
  invalidCount: number;
  reports: RecordValidationReport[];
} {
  const reports = candidates.map((item) => validateQuestionRecord(item.question, item.answer));
  const validCount = reports.filter((r) => r.isValid).length;

  return {
    total: candidates.length,
    validCount,
    invalidCount: candidates.length - validCount,
    reports,
  };
}

// CLI handler
if (process.argv[1] && process.argv[1].endsWith('validate-records.ts')) {
  console.log('✅ [Pravaah PYQ ETL] Running record quality gate validation test...');
  // Dummy candidate test
  const dummy = {
    year: 2024,
    paperCode: 'GS1' as const,
    questionNumber: 1,
    questionText: 'Which one of the following is correct regarding the Governor of a State?',
    questionTextEn: 'Which one of the following is correct regarding the Governor of a State?',
    options: [
      { code: 'A' as const, text: 'A', textEn: 'Appointed by President' },
      { code: 'B' as const, text: 'B', textEn: 'Holds office during pleasure' },
      { code: 'C' as const, text: 'C', textEn: 'Can be removed by Assembly' },
      { code: 'D' as const, text: 'D', textEn: 'Executive power vested' },
    ],
    marks: 2.0,
    negativeMarks: 0.666,
    sourceOrigin: 'UPSC_OFFICIAL',
  };

  const ans = {
    answerOption: 'C' as const,
    answerType: 'FINAL' as const,
    answerKeyType: 'UPSC_FINAL_KEY' as const,
    answerProvenance: 'UPSC_OFFICIAL',
    verificationStatus: 'OFFICIALLY_VERIFIED' as const,
    confidenceScore: 1.0,
    sourceAttribution: 'UPSC Series A Official Key',
  };

  const report = validateQuestionRecord(dummy, ans);
  console.log('Sample record validation report:', JSON.stringify(report, null, 2));
}
