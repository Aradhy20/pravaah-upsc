/**
 * Pravaah UPSC — Official Answer Key & Provenance Verification Service
 * Section 8: Manages answer key sources, official precedence, conflict detection, and student provenance labelling.
 */

export type AnswerKeyType =
  | 'UPSC_FINAL_KEY'
  | 'UPSC_PROVISIONAL_KEY'
  | 'PROVIDER_DERIVED'
  | 'FACULTY_DERIVED'
  | 'UNVERIFIED'
  | 'NO_KEY_FOUND';

export interface AnswerProvenanceRecord {
  primaryAnswer: string; // A, B, C, D, or DROPPED
  answerKeyType: AnswerKeyType;
  provenanceLabel: string;
  isOfficial: boolean;
  hasConflict: boolean;
  conflictingKeys?: Array<{
    sourceName: string;
    answer: string;
    keyType: AnswerKeyType;
    rationale?: string;
  }>;
  verificationBadge: {
    text: string;
    color: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  };
}

const PRECEDENCE_ORDER: Record<AnswerKeyType, number> = {
  UPSC_FINAL_KEY: 1,
  UPSC_PROVISIONAL_KEY: 2,
  FACULTY_DERIVED: 3,
  PROVIDER_DERIVED: 4,
  UNVERIFIED: 5,
  NO_KEY_FOUND: 6,
};

export function resolveAnswerProvenance(
  answers: Array<{
    sourceName?: string;
    answerOption: string;
    answerKeyType: AnswerKeyType;
    notes?: string | null;
  }>
): AnswerProvenanceRecord {
  if (!answers || answers.length === 0) {
    return {
      primaryAnswer: 'NOT_AVAILABLE',
      answerKeyType: 'NO_KEY_FOUND',
      provenanceLabel: 'No Answer Key Found',
      isOfficial: false,
      hasConflict: false,
      verificationBadge: {
        text: 'Unverified / No Key',
        color: 'slate',
      },
    };
  }

  // Sort by official precedence
  const sorted = [...answers].sort(
    (a, b) => PRECEDENCE_ORDER[a.answerKeyType] - PRECEDENCE_ORDER[b.answerKeyType]
  );

  const primary = sorted[0];

  // Check for conflicts among answers
  const uniqueAnswers = new Set(answers.map((a) => a.answerOption.toUpperCase()));
  const hasConflict = uniqueAnswers.size > 1;

  let badgeColor: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' = 'slate';
  let badgeText = 'Unverified';

  if (primary.answerKeyType === 'UPSC_FINAL_KEY') {
    badgeColor = 'emerald';
    badgeText = hasConflict
      ? '100% UPSC Official Final Master Key (Coaching Disputed)'
      : '100% UPSC Official Final Master Key';
  } else if (primary.answerKeyType === 'UPSC_PROVISIONAL_KEY') {
    badgeColor = 'blue';
    badgeText = 'UPSC Provisional Key (Subject to Final Gazetting)';
  } else if (primary.answerKeyType === 'FACULTY_DERIVED' || primary.answerKeyType === 'PROVIDER_DERIVED') {
    badgeColor = 'amber';
    badgeText = 'Faculty / Provider Derived (Unofficial)';
  }

  return {
    primaryAnswer: primary.answerOption.toUpperCase(),
    answerKeyType: primary.answerKeyType,
    provenanceLabel: badgeText,
    isOfficial: primary.answerKeyType === 'UPSC_FINAL_KEY' || primary.answerKeyType === 'UPSC_PROVISIONAL_KEY',
    hasConflict,
    conflictingKeys: hasConflict
      ? answers.map((a) => ({
          sourceName: a.sourceName || 'Coaching Institute',
          answer: a.answerOption.toUpperCase(),
          keyType: a.answerKeyType,
          rationale: a.notes || undefined,
        }))
      : undefined,
    verificationBadge: {
      text: badgeText,
      color: badgeColor,
    },
  };
}
