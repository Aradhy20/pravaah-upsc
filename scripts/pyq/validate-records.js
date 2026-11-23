export function validateQuestionRecord(q, answer) {
  const issues = [];

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
    if (!expected.every((c) => optionCodes.includes(c))) {
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

export function validateCandidateBatch(candidates) {
  const reports = candidates.map((item) => validateQuestionRecord(item.question, item.answer));
  const validCount = reports.filter((r) => r.isValid).length;

  return {
    total: candidates.length,
    validCount,
    invalidCount: candidates.length - validCount,
    reports,
  };
}
