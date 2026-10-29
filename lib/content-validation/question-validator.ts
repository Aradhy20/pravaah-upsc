/**
 * lib/content-validation/question-validator.ts
 * Production QA Validation Engine for UPSC Questions
 */

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface QuestionValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export function validateQuestionRecord(record: {
  questionText?: string;
  options?: Array<{ optionCode: string; optionText: string; isCorrect?: boolean }>;
  correctOption?: string;
  year?: number;
  questionNumber?: number;
  paperCode?: string;
}): QuestionValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Text Completeness
  if (!record.questionText || record.questionText.trim().length < 15) {
    issues.push({
      field: 'questionText',
      code: 'TEXT_TOO_SHORT',
      message: 'Question text must contain at least 15 characters of substantive content.',
      severity: 'ERROR'
    });
  }

  // 2. Options Count & Codes
  if (!record.options || record.options.length !== 4) {
    issues.push({
      field: 'options',
      code: 'INVALID_OPTION_COUNT',
      message: `Standard UPSC MCQs require exactly 4 options (found ${record.options?.length || 0}).`,
      severity: 'ERROR'
    });
  } else {
    const codes = record.options.map(o => o.optionCode?.toUpperCase());
    const expectedCodes = ['A', 'B', 'C', 'D'];
    const hasAllCodes = expectedCodes.every(c => codes.includes(c));
    if (!hasAllCodes) {
      issues.push({
        field: 'options',
        code: 'INVALID_OPTION_CODES',
        message: `Options must strictly use codes A, B, C, and D (found: ${codes.join(', ')}).`,
        severity: 'ERROR'
      });
    }

    // Check empty option texts
    for (const opt of record.options) {
      if (!opt.optionText || opt.optionText.trim().length === 0) {
        issues.push({
          field: `option_${opt.optionCode}`,
          code: 'EMPTY_OPTION_TEXT',
          message: `Option ${opt.optionCode} text cannot be empty.`,
          severity: 'ERROR'
        });
      }
    }
  }

  // 3. Correct Option Verification
  const validChoices = ['A', 'B', 'C', 'D', 'DROPPED'];
  if (!record.correctOption || !validChoices.includes(record.correctOption.toUpperCase())) {
    issues.push({
      field: 'correctOption',
      code: 'INVALID_CORRECT_OPTION',
      message: `Correct option must be one of A, B, C, D or DROPPED (got '${record.correctOption}').`,
      severity: 'ERROR'
    });
  }

  // 4. Year & Paper Code
  if (!record.year || record.year < 2011 || record.year > 2026) {
    issues.push({
      field: 'year',
      code: 'YEAR_OUT_OF_RANGE',
      message: `Exam year ${record.year} is out of permitted range (2011-2026).`,
      severity: 'ERROR'
    });
  }

  const validPapers = ['GS1', 'GS2', 'CSAT', 'ESSAY', 'GS3', 'GS4'];
  if (!record.paperCode || !validPapers.includes(record.paperCode.toUpperCase())) {
    issues.push({
      field: 'paperCode',
      code: 'INVALID_PAPER_CODE',
      message: `Invalid paper code '${record.paperCode}'. Allowed: ${validPapers.join(', ')}.`,
      severity: 'ERROR'
    });
  }

  // 5. Question Number Ordering
  if (record.questionNumber !== undefined && (record.questionNumber < 1 || record.questionNumber > 100)) {
    issues.push({
      field: 'questionNumber',
      code: 'NUMBER_OUT_OF_BOUNDS',
      message: `Question number ${record.questionNumber} exceeds standard bounds (1-100).`,
      severity: 'ERROR'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'ERROR').length === 0,
    issues
  };
}
