/**
 * Pravaah UPSC — Document Extraction & Question Segmentation Engine
 * Phase 5: Advanced extraction pipeline for PDF and structured examination papers.
 */

export interface ExtractedQuestionRecord {
  questionNumber: number;
  questionText: string;
  options: { optionCode: string; optionText: string }[];
  detectedAnswerKey?: string;
  confidenceScore: number;
  extractionNotes?: string;
  hasDiagrams: boolean;
}

export interface DocumentExtractionResult {
  sourceDocumentUrl: string;
  examinationCode: string;
  year: number;
  paperCode: string;
  totalQuestionsExtracted: number;
  averageConfidence: number;
  questions: ExtractedQuestionRecord[];
  extractionLog: string[];
}

/**
 * Normalizes raw text by removing headers, footers, exam watermarks, and uniform spacing
 */
export function normalizeExtractedText(rawText: string): string {
  return rawText
    .replace(/UPSC\s+CSE\s+\d{4}\s+SERIES\s+[A-D]/gi, '')
    .replace(/DO\s+NOT\s+OPEN\s+THIS\s+BOOKLET\s+UNTIL\s+YOU\s+ARE\s+TOLD\s+TO\s+DO\s+SO/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts question items, statement lists, and options (A, B, C, D) using regex boundary detection
 */
export function parseRawQuestionText(blockText: string): ExtractedQuestionRecord | null {
  const qNumMatch = blockText.match(/^(?:Q(?:uestion)?\.?\s*)?(\d+)[\.\)]\s*(.+)/s);
  if (!qNumMatch) return null;

  const questionNumber = parseInt(qNumMatch[1], 10);
  const bodyAndOptions = qNumMatch[2];

  // Regex to detect standard options: (a)/(A), (b)/(B), (c)/(C), (d)/(D)
  const optionRegex = /(?:\([a-d]\)|[a-d]\.|\([A-D]\)|[A-D]\.)\s*([^\n\(\)]+)/gi;
  const matches = [...bodyAndOptions.matchAll(optionRegex)];

  if (matches.length < 2) {
    // Insufficient options detected; return high text confidence with warning
    return {
      questionNumber,
      questionText: bodyAndOptions.trim(),
      options: [],
      confidenceScore: 0.65,
      extractionNotes: 'Detected as subjective or partial question without complete options.',
      hasDiagrams: false,
    };
  }

  const firstOptionIndex = bodyAndOptions.search(/(?:\([a-d]\)|[a-d]\.|\([A-D]\)|[A-D]\.)/i);
  const questionText = bodyAndOptions.substring(0, firstOptionIndex).trim();

  const options: { optionCode: string; optionText: string }[] = [];
  const optionCodes = ['A', 'B', 'C', 'D'];

  matches.forEach((m, idx) => {
    if (idx < 4) {
      options.push({
        optionCode: optionCodes[idx],
        optionText: m[1].trim(),
      });
    }
  });

  return {
    questionNumber,
    questionText,
    options,
    confidenceScore: options.length === 4 ? 0.98 : 0.85,
    extractionNotes: options.length === 4 ? 'Complete 4-option MCQs verified.' : 'Partial options parsed.',
    hasDiagrams: false,
  };
}
