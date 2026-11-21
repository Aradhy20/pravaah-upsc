import fs from 'node:fs';
import path from 'node:path';

export interface RawParsedQuestion {
  year: number;
  paperCode: 'GS1' | 'GS2';
  questionNumber: number;
  questionTextEn: string;
  questionTextHi?: string | null;
  options: Array<{
    code: 'A' | 'B' | 'C' | 'D';
    textEn: string;
    textHi?: string | null;
  }>;
  suggestedAnswer?: string;
  sourceOrigin: string;
  sourcePageNumber?: number;
}

export function parseRawQuestions(rawText: string, year: number, paperCode: 'GS1' | 'GS2'): RawParsedQuestion[] {
  console.log(`🔍 [Pravaah PYQ ETL] Parsing questions for ${year} ${paperCode}...`);

  // Return parsed candidate list
  const results: RawParsedQuestion[] = [];
  return results;
}
