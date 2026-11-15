/**
 * Pravaah UPSC — Question Classification & Mapping Engine
 * Phase 7: Subject, Topic, Syllabus, and NCERT Chapter mapping.
 */

export interface ClassificationResult {
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  suggestedSyllabusNodeCode?: string;
  suggestedNCERTChapterSlug?: string;
  confidence: number;
}

const CLASSIFICATION_RULES = [
  {
    subject: 'Indian Polity & Governance',
    topic: 'Fundamental Rights & Judiciary',
    keywords: ['constitution', 'article', 'writ', 'fundamental right', 'supreme court', 'judicial review', 'high court', 'habeas corpus', 'dpsp', 'president', 'governor', 'parliament', 'lok sabha', 'rajya sabha'],
    nodeCode: 'PRE-POL-02',
    ncertSlug: 'rights-in-the-indian-constitution',
  },
  {
    subject: 'Indian Economy',
    topic: 'Monetary & Fiscal Systems',
    keywords: ['rbi', 'inflation', 'repo', 'monetary policy', 'gdp', 'fiscal deficit', 'balance of payments', 'current account', 'banking', 'crr', 'slr', 'budget'],
    nodeCode: 'PRE-ECO-02',
    ncertSlug: 'money-and-banking',
  },
  {
    subject: 'Environment & Ecology',
    topic: 'Biodiversity & Climate',
    keywords: ['national park', 'wildlife', 'biodiversity', 'wetland', 'ramsar', 'biosphere', 'climate change', 'unfccc', 'endangered', 'iucn', 'species', 'ecosystem'],
    nodeCode: 'PRE-ENV-02',
    ncertSlug: 'biodiversity-and-conservation',
  },
  {
    subject: 'Geography',
    topic: 'Physical & Indian Geography',
    keywords: ['monsoon', 'river', 'tributary', 'soil', 'himalaya', 'plateau', 'cyclone', 'ocean current', 'el nino', 'la nina', 'drainage', 'western ghats'],
    nodeCode: 'PRE-GEO-04',
    ncertSlug: 'climate-india',
  },
  {
    subject: 'History & Culture',
    topic: 'Modern History & Art Forms',
    keywords: ['gandhi', 'non-cooperation', 'satyagraha', 'revolt', '1857', 'british', 'viceroy', 'congress', 'inc', 'harappan', 'buddhism', 'jainism', 'temple', 'architecture'],
    nodeCode: 'PRE-HIS-03',
    ncertSlug: 'mahatma-gandhi-and-the-nationalist-movement',
  },
  {
    subject: 'Science & Technology',
    topic: 'Emerging & Space Technologies',
    keywords: ['isro', 'satellite', 'orbit', 'gene editing', 'crispr', 'vaccine', 'ai', 'quantum', 'missile', 'nuclear', 'semiconductor', 'biotechnology'],
    nodeCode: 'PRE-SCI-01',
    ncertSlug: 'organisms-and-populations',
  },
  {
    subject: 'CSAT Paper 2',
    topic: 'Reading Comprehension & Quantitative Aptitude',
    keywords: ['passage', 'assumption', 'inference', 'corollary', 'ratio', 'percentage', 'speed', 'time and work', 'permutation', 'syllogism', 'logical reasoning'],
    nodeCode: 'CSAT-RC-01',
    ncertSlug: 'none',
  },
];

export function classifyQuestion(questionText: string): ClassificationResult {
  const lower = questionText.toLowerCase();

  let bestMatch = CLASSIFICATION_RULES[0];
  let maxKeywordHits = 0;

  for (const rule of CLASSIFICATION_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) hits++;
    }
    if (hits > maxKeywordHits) {
      maxKeywordHits = hits;
      bestMatch = rule;
    }
  }

  // Determine difficulty based on multi-statement complexity
  const statementMatches = lower.match(/(?:\d+\.\s*|statement\s*\d+)/g);
  let difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
  if (statementMatches && statementMatches.length >= 3) {
    difficulty = 'HARD';
  } else if (!statementMatches || statementMatches.length <= 1) {
    difficulty = 'EASY';
  }

  return {
    subject: bestMatch.subject,
    topic: bestMatch.topic,
    difficulty,
    suggestedSyllabusNodeCode: bestMatch.nodeCode,
    suggestedNCERTChapterSlug: bestMatch.ncertSlug,
    confidence: maxKeywordHits >= 2 ? 0.94 : 0.78,
  };
}
