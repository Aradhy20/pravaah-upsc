import { PrismaClient } from '@prisma/client';

export interface TaxonomyMappingResult {
  subjectId: string;
  subjectSlug: string;
  topicId?: string;
  topicSlug?: string;
  secondaryTopicIds?: string[];
}

/**
 * Crosswalk mapping from ExamSIDE categories & subtopics to Pravaah's 24-subject taxonomy
 */
const EXAMSIDE_TO_PRAVAAH_CROSSWALK: Record<
  string,
  { subjectSlug: string; defaultTopicSlug: string; topicMap?: Record<string, string> }
> = {
  // GS1 Subjects
  'science-and-technology': {
    subjectSlug: 'science-technology',
    defaultTopicSlug: 'frontier-tech',
    topicMap: {
      'basic-biology': 'biotechnology-health',
      'biotechnology': 'biotechnology-health',
      'space': 'space-missions',
      'nanotechnology': 'frontier-tech',
      'electronics-and-communication': 'frontier-tech',
      'defence': 'frontier-tech',
    },
  },
  'ecology-and-environment': {
    subjectSlug: 'environment-biodiversity',
    defaultTopicSlug: 'ecology-ecosystems',
    topicMap: {
      'ecology': 'ecology-ecosystems',
      'biodiversity': 'protected-areas',
      'international-convention': 'climate-change-conventions',
      'government-legislature': 'pollution-laws',
    },
  },
  'economy': {
    subjectSlug: 'economy-development',
    defaultTopicSlug: 'national-income',
    topicMap: {
      'fiscal-policy': 'fiscal-monetary-policy',
      'monetary-policy': 'fiscal-monetary-policy',
      'market': 'banking-financial-markets',
      'external-sector': 'external-sector',
      'poverty-and-unemployment': 'poverty-inclusion',
    },
  },
  'current-affairs': {
    subjectSlug: 'polity-governance',
    defaultTopicSlug: 'preamble-features',
  },

  // CSAT GS2 Subjects
  'basic-numeracy': {
    subjectSlug: 'csat-quant',
    defaultTopicSlug: 'number-systems',
    topicMap: {
      'number-system': 'number-systems',
      'hcf-and-lcm': 'number-systems',
      'fractions': 'number-systems',
      'basic-arithmetic': 'ratio-proportions',
      'percentages': 'ratio-proportions',
      'permutations-and-combinations': 'pnc-probability',
      'probability': 'pnc-probability',
    },
  },
  'logical-reasoning-and-general-mental-ability': {
    subjectSlug: 'csat-reasoning',
    defaultTopicSlug: 'syllogisms',
    topicMap: {
      'logical-venn-diagram-or-syllogism': 'syllogisms',
      'coding-and-decoding': 'coding-series',
      'series': 'coding-series',
      'puzzle': 'puzzles',
      'seating-arrangement': 'puzzles',
    },
  },
  'comprehension': {
    subjectSlug: 'csat-comprehension',
    defaultTopicSlug: 'critical-inference',
    topicMap: {
      'verbal-ability': 'critical-inference',
    },
  },
  'data-interpretation': {
    subjectSlug: 'csat-quant',
    defaultTopicSlug: 'ratio-proportions',
  },
};

export async function mapExternalCategoryToPravaah(
  prisma: PrismaClient,
  category: string,
  subtopic?: string
): Promise<TaxonomyMappingResult> {
  const normCat = (category || '').toLowerCase().trim();
  const normSub = (subtopic || '').toLowerCase().trim();

  const mapping = EXAMSIDE_TO_PRAVAAH_CROSSWALK[normCat] || {
    subjectSlug: 'polity-governance',
    defaultTopicSlug: 'preamble-features',
  };

  const targetTopicSlug = (mapping.topicMap && mapping.topicMap[normSub]) || mapping.defaultTopicSlug;

  const subject = await prisma.subject.findFirst({
    where: { slug: mapping.subjectSlug },
    include: { topics: true },
  });

  if (!subject) {
    throw new Error(`Subject with slug '${mapping.subjectSlug}' not found in database.`);
  }

  const topic = subject.topics.find((t) => t.slug === targetTopicSlug) || subject.topics[0];

  return {
    subjectId: subject.id,
    subjectSlug: subject.slug,
    topicId: topic?.id,
    topicSlug: topic?.slug,
  };
}
