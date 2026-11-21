export interface NormalizedQuestion {
  year: number;
  paperCode: 'GS1' | 'GS2';
  questionNumber: number;
  questionText: string;
  questionTextEn: string;
  questionTextHi?: string | null;
  options: Array<{
    code: 'A' | 'B' | 'C' | 'D';
    text: string;
    textEn: string;
    textHi?: string | null;
  }>;
  marks: number;
  negativeMarks: number;
  sourceOrigin: string;
}

export function normalizeQuestion(raw: {
  year: number;
  paperCode: 'GS1' | 'GS2';
  questionNumber: number;
  questionTextEn: string;
  questionTextHi?: string | null;
  options: Array<{ code: string; textEn: string; textHi?: string | null }>;
  sourceOrigin?: string;
}): NormalizedQuestion {
  // 1. Clean stem whitespace & standardize quotes
  const cleanStemEn = raw.questionTextEn
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanStemHi = raw.questionTextHi ? raw.questionTextHi.replace(/\s+/g, ' ').trim() : null;

  // 2. Normalize Options strictly to A, B, C, D
  const validCodes: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const cleanOptions = validCodes.map((code) => {
    const matched = raw.options.find((o) => o.code.toUpperCase() === code);
    const textEn = matched?.textEn ? matched.textEn.replace(/\s+/g, ' ').trim() : `Option ${code}`;
    const textHi = matched?.textHi ? matched.textHi.replace(/\s+/g, ' ').trim() : null;

    return {
      code,
      text: textEn,
      textEn,
      textHi,
    };
  });

  const isCSAT = raw.paperCode === 'GS2';

  return {
    year: raw.year,
    paperCode: raw.paperCode,
    questionNumber: raw.questionNumber,
    questionText: cleanStemEn,
    questionTextEn: cleanStemEn,
    questionTextHi: cleanStemHi,
    options: cleanOptions,
    marks: isCSAT ? 2.5 : 2.0,
    negativeMarks: isCSAT ? 0.833 : 0.666,
    sourceOrigin: raw.sourceOrigin || 'UPSC_OFFICIAL_SERIES_A',
  };
}
