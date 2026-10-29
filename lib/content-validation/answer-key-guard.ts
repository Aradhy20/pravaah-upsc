/**
 * lib/content-validation/answer-key-guard.ts
 * Three-Tier Answer Key Verification & Anti-Leak Protection Guard
 */

export type AnswerKeyTier = 
  | 'UPSC_OFFICIAL_FINAL'
  | 'INDEPENDENT_AUTHORED'
  | 'AI_GENERATED_DRAFT';

export interface AnswerKeyVerificationStatus {
  tier: AnswerKeyTier;
  isVerified: boolean;
  sourceReference: string;
  notes?: string;
}

/**
 * Sanitizes question objects before returning them to clients during active mock tests.
 * Strips `isCorrect` from options and hides explanation/answerKey until session is submitted.
 */
export function sanitizeQuestionForTimedSession<T extends {
  options?: Array<{ optionCode: string; optionText: string; isCorrect?: boolean }>;
  explanation?: any;
  answerKeys?: any;
}>(question: T): Omit<T, 'explanation' | 'answerKeys'> & {
  options?: Array<{ optionCode: string; optionText: string }>;
} {
  const { explanation, answerKeys, options, ...rest } = question;

  const sanitizedOptions = options?.map(opt => ({
    optionCode: opt.optionCode,
    optionText: opt.optionText
    // isCorrect deliberately omitted to prevent client-side inspection leakage
  }));

  return {
    ...rest,
    options: sanitizedOptions
  } as any;
}

/**
 * Validates that an explanation or answer key draft is properly attributed
 * and prevents AI-generated drafts from ever being represented as official UPSC answers.
 */
export function validateAnswerAttribution(tier: AnswerKeyTier, sourceReference?: string): {
  allowed: boolean;
  error?: string;
} {
  if (tier === 'UPSC_OFFICIAL_FINAL') {
    if (!sourceReference || !sourceReference.includes('upsc.gov.in')) {
      return {
        allowed: false,
        error: 'Official UPSC Answer Key records must reference an official upsc.gov.in archive URL or gazette release.'
      };
    }
  }

  if (tier === 'AI_GENERATED_DRAFT') {
    return {
      allowed: true,
      error: 'Note: AI-generated explanations must remain in DRAFT status until human subject-matter reviewer verification.'
    };
  }

  return { allowed: true };
}
