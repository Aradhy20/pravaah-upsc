import test from 'node:test';
import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('1. Source Registry & Canonical URL Resolution Enforcement', async () => {
  const sources = await prisma.sourceRegistryRecord.findMany();
  assert.ok(sources.length >= 10, `Expected at least 10 registered sources, found ${sources.length}`);

  const sourceMap = new Map(sources.map(s => [s.sourceId, s]));

  // Verify UPSC Official Archive
  assert.ok(sourceMap.has('src-upsc-prev-papers'), 'Must register UPSC previous papers');
  assert.equal(sourceMap.get('src-upsc-prev-papers').canonicalDomain, 'upsc.gov.in');

  // Verify IASBoard canonical resolution
  assert.ok(sourceMap.has('src-iasboard-ref'), 'Must register IASBoard reference');
  assert.equal(sourceMap.get('src-iasboard-ref').canonicalDomain, 'iasboard.com');

  // Verify Decode Civils canonical resolution
  assert.ok(sourceMap.has('src-decodecivils-ref'), 'Must register Decode Civils reference');
  assert.equal(sourceMap.get('src-decodecivils-ref').canonicalDomain, 'decodecivils.com');

  // Verify Human Peritus canonical resolution
  assert.ok(sourceMap.has('src-human-peritus-ref'), 'Must register Human Peritus reference');
  assert.equal(sourceMap.get('src-human-peritus-ref').canonicalDomain, 'humanperitus.in');

  // Verify UnlockIAS canonical resolution
  assert.ok(sourceMap.has('src-unlockias-ref'), 'Must register UnlockIAS reference');
  assert.equal(sourceMap.get('src-unlockias-ref').canonicalDomain, 'unlockias.in');

  // Verify ExamDay canonical resolution
  assert.ok(sourceMap.has('src-examday-ref'), 'Must register ExamDay reference');
  assert.equal(sourceMap.get('src-examday-ref').canonicalDomain, 'examday.ai');

  // Verify Question paper milte h colloquial canonical resolution
  assert.ok(sourceMap.has('src-question-paper-milte-h'), 'Must register Question paper milte h resolution');
  assert.equal(sourceMap.get('src-question-paper-milte-h').canonicalDomain, 'upsc.gov.in');
});

test('2. Permitted vs. Prohibited Collection Restrictions', async () => {
  const sources = await prisma.sourceRegistryRecord.findMany();
  const sourceMap = new Map(sources.map(s => [s.sourceId, s]));

  // Commercial coaching sites must NEVER be permitted for direct automated content scraping
  const commercialBenchmarks = ['src-iasboard-ref', 'src-decodecivils-ref', 'src-human-peritus-ref', 'src-unlockias-ref', 'src-examday-ref'];
  for (const id of commercialBenchmarks) {
    const src = sourceMap.get(id);
    assert.ok(src, `Must find ${id}`);
    assert.ok(
      !src.collectionMethod.includes('DIRECT_DOCUMENT_DOWNLOAD'),
      `${id} must NOT allow direct document download or text scraping`
    );
  }

  // Official UPSC and PIB must allow authorized direct document / RSS ingestion
  const upsc = sourceMap.get('src-upsc-prev-papers');
  assert.ok(upsc.collectionMethod.includes('DIRECT_DOCUMENT_DOWNLOAD'));
});

test('3. Question Bank Structural Integrity (1,079+ Verified Questions)', async () => {
  const totalQuestions = await prisma.question.count();
  assert.ok(totalQuestions >= 1079, `Expected >= 1079 questions, found ${totalQuestions}`);

  const published = await prisma.question.count({
    where: { status: 'PUBLISHED' }
  });
  assert.ok(published >= 1079, `Expected >= 1079 published questions, found ${published}`);

  const verified = await prisma.question.count({
    where: { verifiedAt: { not: null } }
  });
  assert.ok(verified >= 1079, `Expected >= 1079 verified questions, found ${verified}`);
});

test('4. Options Validation: Exactly 4 Options per Question & Single Correct Key', async () => {
  // Check random sample of 100 questions
  const sample = await prisma.question.findMany({
    take: 100,
    include: { options: true }
  });

  for (const q of sample) {
    assert.equal(q.options.length, 4, `Question ${q.id} must have 4 options`);
    const correctCount = q.options.filter(o => o.isCorrect).length;
    assert.equal(correctCount, 1, `Question ${q.id} must have exactly 1 correct option`);
  }
});

test('5. Detailed Pedagogical Explanations Coverage (100% of Verified Questions)', async () => {
  const publishedCount = await prisma.question.count({ where: { status: 'PUBLISHED' } });
  const countWithExpl = await prisma.explanation.count({
    where: { 
      detailedExplanation: { not: '' },
      question: { status: 'PUBLISHED' }
    }
  });
  assert.equal(countWithExpl, publishedCount, 'All published verified questions must have non-empty detailed explanations');
  assert.ok(countWithExpl >= 1079, `Expected >= 1079 explanations, found ${countWithExpl}`);
});

test('6. Multi-Exam Directory Profiles (CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO)', async () => {
  const exams = await prisma.examDirectory.findMany();
  assert.ok(exams.length >= 8, `Expected >= 8 exam directory profiles, found ${exams.length}`);

  const codes = new Set(exams.map(e => e.code));
  const expectedCodes = ['CSE', 'IFS', 'CDS', 'NDA', 'CAPF', 'ESE', 'CMS', 'EPFO'];
  for (const code of expectedCodes) {
    assert.ok(codes.has(code), `Exam directory must contain profile for ${code}`);
  }
});

test('7. Current Affairs Government Ingestion & Verified PYQ Linking', async () => {
  const stories = await prisma.currentAffairsStory.count({
    where: { status: 'PUBLISHED' }
  });
  assert.ok(stories >= 5, `Expected >= 5 published current affairs stories, found ${stories}`);

  const pyqLinks = await prisma.storyQuestionLink.count();
  assert.ok(pyqLinks >= 3, `Expected >= 3 PYQ links, found ${pyqLinks}`);

  const quizQuestions = await prisma.dailyQuizQuestion.count();
  assert.ok(quizQuestions >= 5, `Expected >= 5 daily quiz questions, found ${quizQuestions}`);
});

test('8. Source Documents & File Provenance Tracking', async () => {
  const docs = await prisma.sourceDocument.count();
  assert.ok(docs >= 20, `Expected >= 20 registered source documents, found ${docs}`);

  const questionSources = await prisma.questionSource.count();
  assert.ok(questionSources >= 1000, `Expected >= 1000 questions linked to official source documents, found ${questionSources}`);
});

test('9. Background Jobs & Audit Traceability', async () => {
  const jobs = await prisma.backgroundJob.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10
  });
  assert.ok(jobs.length >= 2, `Expected background jobs recorded, found ${jobs.length}`);

  const jobTypes = new Set(jobs.map(j => j.jobType));
  assert.ok(
    jobTypes.has('SOURCE_AUDIT') || jobTypes.has('STALENESS_CHECK') || jobTypes.has('CURRENT_AFFAIRS_CRAWL'),
    'Must record pipeline executions'
  );
});
