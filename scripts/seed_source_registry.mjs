import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OFFICIAL_SOURCES = [
  {
    sourceId: 'UPSC_PREV_PAPERS',
    sourceName: 'UPSC Previous Question Papers Repository',
    canonicalDomain: 'https://www.upsc.gov.in/examinations/previous-question-papers',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'DOCUMENT_DOWNLOAD',
    termsUrl: 'https://www.upsc.gov.in/terms-and-conditions',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'UPSC_ARCHIVES',
    sourceName: 'UPSC Question Paper Archives',
    canonicalDomain: 'https://www.upsc.gov.in/examinations/previous-question-papers/archives',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'DOCUMENT_DOWNLOAD',
    termsUrl: 'https://www.upsc.gov.in/terms-and-conditions',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'UPSC_CMS_DETAILS',
    sourceName: 'UPSC Previous Exam Details & Archives',
    canonicalDomain: 'https://cms.upsc.gov.in/previous-exam-details/',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'DOCUMENT_DOWNLOAD',
    termsUrl: 'https://www.upsc.gov.in/terms-and-conditions',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'NCERT_OFFICIAL_PORTAL',
    sourceName: 'NCERT Textbook Portal',
    canonicalDomain: 'https://ncert.nic.in/textbook.php',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'METADATA_DEEP_LINK',
    termsUrl: 'https://ncert.nic.in/copyright.php',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'EPATHSHALA_PORTAL',
    sourceName: 'ePathshala National Digital Textbook Repository',
    canonicalDomain: 'https://epathshala.nic.in/',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'METADATA_DEEP_LINK',
    termsUrl: 'https://epathshala.nic.in/',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'PIB_GOV_IN',
    sourceName: 'Press Information Bureau (PIB) Delhi',
    canonicalDomain: 'https://pib.gov.in/',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://pib.gov.in/terms.aspx',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'DIGITAL_SANSAD_EPARLIB',
    sourceName: 'Digital Sansad Historical Parliamentary Debates & Archives',
    canonicalDomain: 'https://eparlib.sansad.in/',
    sourceType: 'OFFICIAL_GOVERNMENT',
    priority: 1,
    collectionMethod: 'DOCUMENT_DOWNLOAD',
    termsUrl: 'https://eparlib.sansad.in/',
    robotsStatus: 'ALLOWED',
  },
];

const EDUCATIONAL_CORROBORATION_SOURCES = [
  {
    sourceId: 'VISION_IAS',
    sourceName: 'Vision IAS Resource Portal',
    canonicalDomain: 'https://visionias.in/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://visionias.in/terms',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'INSIGHTS_IAS',
    sourceName: 'Insights on India',
    canonicalDomain: 'https://www.insightsonindia.com/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://www.insightsonindia.com/terms',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'DRISHTI_IAS',
    sourceName: 'Drishti IAS English/Hindi Portal',
    canonicalDomain: 'https://www.drishtiias.com/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://www.drishtiias.com/terms',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'FORUM_IAS',
    sourceName: 'ForumIAS Community & Discussions',
    canonicalDomain: 'https://forumias.com/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://forumias.com/terms',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'CLEAR_IAS',
    sourceName: 'ClearIAS Educational Knowledge Base',
    canonicalDomain: 'https://www.clearias.com/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://www.clearias.com/terms',
    robotsStatus: 'ALLOWED',
  },
  {
    sourceId: 'IASBABA',
    sourceName: 'IASbaba Examination Prep Hub',
    canonicalDomain: 'https://iasbaba.com/',
    sourceType: 'EDUCATIONAL_CORROBORATION',
    priority: 2,
    collectionMethod: 'INDEX_ONLY',
    termsUrl: 'https://iasbaba.com/terms',
    robotsStatus: 'ALLOWED',
  },
];

async function main() {
  console.log('Seeding Source Registry into PostgreSQL...');
  const allSources = [...OFFICIAL_SOURCES, ...EDUCATIONAL_CORROBORATION_SOURCES];

  for (const s of allSources) {
    await prisma.sourceRegistryRecord.upsert({
      where: { sourceId: s.sourceId },
      update: {
        sourceName: s.sourceName,
        canonicalDomain: s.canonicalDomain,
        sourceType: s.sourceType,
        priority: s.priority,
        collectionMethod: s.collectionMethod,
        termsUrl: s.termsUrl,
        robotsStatus: s.robotsStatus,
        isHealthy: true,
        lastStatusCode: 200,
        lastCheckedAt: new Date(),
      },
      create: {
        sourceId: s.sourceId,
        sourceName: s.sourceName,
        canonicalDomain: s.canonicalDomain,
        sourceType: s.sourceType,
        priority: s.priority,
        collectionMethod: s.collectionMethod,
        termsUrl: s.termsUrl,
        robotsStatus: s.robotsStatus,
        isHealthy: true,
        lastStatusCode: 200,
        lastCheckedAt: new Date(),
      },
    });
  }

  // Also seed Historical Examination Periods
  const PERIODS = [
    {
      examCode: 'CSE',
      periodLabel: '1979-2010 (Kothari Pattern - Optional in Prelims)',
      startYear: 1979,
      endYear: 2010,
      patternDescription: 'Three-stage system introduced. Prelims consisted of General Studies (150 marks) and one Optional Subject Paper (300 marks). Negative marking introduced in 2007 (1/3rd penalty).',
      qualifyingRules: 'Both General Studies and Optional Subject counted towards Prelims merit list cutoff.',
    },
    {
      examCode: 'CSE',
      periodLabel: '2011-2014 (Introduction of CSAT - Both Counted)',
      startYear: 2011,
      endYear: 2014,
      patternDescription: 'Optional paper discontinued in Prelims. Introduced GS Paper I (100 Qs, 200 marks) and CSAT Paper II (80 Qs, 200 marks).',
      qualifyingRules: 'Marks of both GS Paper I and CSAT Paper II were added together for total out of 400 marks to determine merit for Mains eligibility.',
    },
    {
      examCode: 'CSE',
      periodLabel: '2015-Present (Modern Pattern - CSAT Qualifying)',
      startYear: 2015,
      endYear: null,
      patternDescription: 'Prelims GS Paper I (100 Qs, 200 marks, +2.0 / -0.666) determines merit. CSAT Paper II (80 Qs, 200 marks, +2.5 / -0.833) is purely qualifying (33% / 66 marks required).',
      qualifyingRules: 'Candidate must score at least 33% (66 marks) in CSAT. Only GS Paper I marks are considered for Prelims merit list cutoff.',
    },
  ];

  for (const p of PERIODS) {
    const existing = await prisma.historicalExamPeriod.findFirst({
      where: { examCode: p.examCode, startYear: p.startYear },
    });
    if (!existing) {
      await prisma.historicalExamPeriod.create({ data: p });
    }
  }

  const count = await prisma.sourceRegistryRecord.count();
  console.log(`Successfully seeded ${count} source registry records and historical periods.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
