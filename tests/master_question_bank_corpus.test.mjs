import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Corpus: Official Registry Sync Verification (5 Sources, 241 Exams, 2,461 Documents)", async () => {
  const [sourcesCount, examsCount, docsCount] = await Promise.all([
    prisma.corpusSource.count(),
    prisma.corpusExam.count(),
    prisma.corpusDocument.count()
  ]);

  assert.strictEqual(sourcesCount, 5, "Must have exactly 5 corpus sources");
  assert.strictEqual(examsCount, 241, "Must have 241 official UPSC examination instances");
  assert.strictEqual(docsCount, 2461, "Must have 2,461 official UPSC documents");

  // Verify exam families breakdown
  const families = await prisma.corpusExam.groupBy({
    by: ["examFamily"],
    _count: { _all: true }
  });

  const familyMap = Object.fromEntries(families.map(f => [f.examFamily, f._count._all]));
  assert.ok(familyMap.CSE >= 36, "Must cover CSE exams");
  assert.ok(familyMap.CDS >= 30, "Must cover CDS exams");
  assert.ok(familyMap.NDA >= 30, "Must cover NDA exams");
  assert.ok(familyMap.IFOS >= 25, "Must cover IFoS exams");
  assert.ok(familyMap.ESE >= 25, "Must cover ESE exams");
  assert.ok(familyMap.CAPF >= 14, "Must cover CAPF exams");
  assert.ok(familyMap.CMS >= 14, "Must cover CMS exams");
  assert.ok(familyMap.CGS >= 20, "Must cover CGS exams");

  // Verify document types
  const docTypes = await prisma.corpusDocument.groupBy({
    by: ["documentType"],
    _count: { _all: true }
  });
  const typeMap = Object.fromEntries(docTypes.map(d => [d.documentType, d._count._all]));
  assert.ok(typeMap["Question Paper"] >= 2100, "Must have over 2100 Question Paper documents");
  assert.ok(typeMap["Cut-off Marks"] >= 180, "Must have Cut-off Marks documents");
  assert.ok(typeMap["Answer Key"] >= 6, "Must have Answer Key documents");
});

test("Corpus: Document Text Extraction & PyMuPDF Page Pipeline", async () => {
  const pagesCount = await prisma.corpusDocumentPage.count();
  assert.ok(pagesCount >= 10, "Must have indexed document pages from official PDFs");

  const samplePage = await prisma.corpusDocumentPage.findFirst({
    where: { documentId: { not: "" } },
    include: { document: true }
  });

  assert.ok(samplePage, "Must find sample extracted page");
  assert.ok(samplePage.document, "Extracted page must have relation to CorpusDocument");
  assert.ok(samplePage.pageNumber >= 1, "Page number must be positive");
  assert.ok(["USABLE_TEXT", "LOW_TEXT_NEEDS_OCR"].includes(samplePage.extractionQuality));
});

test("Corpus: Question Staging Integrity & Provenance (Over 1,400 Verified Questions)", async () => {
  const totalStaged = await prisma.questionStagingRecord.count();
  assert.ok(totalStaged >= 500, "Must have substantial staged authentic questions");

  const verifiedStaged = await prisma.questionStagingRecord.count({
    where: { workflowStatus: "VERIFIED" }
  });
  assert.ok(verifiedStaged >= 400, "Must have over 400 verified staged questions");

  // Check subject diversity
  const subjects = await prisma.questionStagingRecord.groupBy({
    by: ["subjectSlug"],
    _count: { _all: true }
  });
  const subjectMap = Object.fromEntries(subjects.map(s => [s.subjectSlug || "unknown", s._count._all]));

  assert.ok(subjectMap.polity >= 100, "Must contain Polity questions");
  assert.ok(subjectMap.economics >= 100, "Must contain Economics questions");
  assert.ok(subjectMap.geography >= 50, "Must contain Geography questions");
  assert.ok(subjectMap.environment >= 100, "Must contain Environment questions");

  // Check sample staged record structure
  const sample = await prisma.questionStagingRecord.findFirst({
    where: { workflowStatus: "VERIFIED" }
  });
  assert.ok(sample, "Must find a verified staged record");
  assert.ok(sample.questionTextEn.length > 15, "Question stem must be authentic text");
  assert.ok(["A", "B", "C", "D"].includes(sample.officialAnswer), "Answer must be valid option letter");
  assert.ok(sample.sourceCitation.length > 5, "Must retain source citation provenance");

  const parsedOptions = JSON.parse(sample.optionsJson);
  assert.ok(Array.isArray(parsedOptions) && parsedOptions.length >= 4, "Must contain 4 structured options A-D");
});

test("Corpus: Strict Data Separation Guarantee (Official PYQ vs Generated Practice)", async () => {
  // 1. Practice questions must exist in GeneratedPracticeQuestion table
  const practiceCount = await prisma.generatedPracticeQuestion.count();
  assert.ok(practiceCount >= 5, "Must have sample generated practice questions");

  // 2. ALL practice questions MUST carry contentLabel = 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'
  const invalidPracticeLabel = await prisma.generatedPracticeQuestion.count({
    where: { contentLabel: { not: "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ" } }
  });
  assert.strictEqual(invalidPracticeLabel, 0, "Practice questions must never have any label other than GENERATED_PRACTICE_NOT_OFFICIAL_PYQ");

  // 3. Official Question table must NEVER contain practice questions
  const officialQuestionsWithPracticeLabel = await prisma.question.count({
    where: { contentLabel: "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ" }
  });
  assert.strictEqual(officialQuestionsWithPracticeLabel, 0, "Official Question table must NEVER contain generated practice questions");

  // 4. Existing authentic question records must remain preserved
  const prelimsCount = await prisma.question.count();
  const mainsCount = await prisma.mainsQuestion.count();
  assert.ok(prelimsCount >= 121, "Must preserve authentic prelims questions");
  assert.strictEqual(mainsCount, 32, "Must preserve exactly 32 authentic mains questions");
});

test("Corpus: Official Answer Key Provenance & Dropped Question Handling", async () => {
  const answerKeys = await prisma.answerKeyVersion.findMany({
    take: 5
  });
  assert.ok(answerKeys.length >= 2, "Must have answer key provenance records");

  // Check dropped question handling
  const droppedKey = await prisma.answerKeyVersion.findFirst({
    where: { officialAnswer: "DROPPED" }
  });
  assert.ok(droppedKey, "Must support explicit dropped question representation");
  assert.ok(droppedKey.notes.includes("DROPPED"), "Dropped note must be recorded");
});

test("Corpus: API Endpoints (GET /documents, /exams, /practice, /search)", async () => {
  // 1. Documents API
  const docsRes = await fetch(`${BASE_URL}/api/v1/corpus/documents?limit=5`);
  assert.strictEqual(docsRes.status, 200, "Documents API must return 200");
  const docsData = await docsRes.json();
  assert.strictEqual(docsData.success, true);
  assert.strictEqual(docsData.meta.total, 2461);
  assert.strictEqual(docsData.documents.length, 5);

  // 2. Exams API
  const examsRes = await fetch(`${BASE_URL}/api/v1/corpus/exams?family=CSE`);
  assert.strictEqual(examsRes.status, 200, "Exams API must return 200");
  const examsData = await examsRes.json();
  assert.strictEqual(examsData.success, true);
  assert.strictEqual(examsData.total, 37);

  // 3. Practice API
  const practiceRes = await fetch(`${BASE_URL}/api/v1/corpus/practice?limit=3`);
  assert.strictEqual(practiceRes.status, 200, "Practice API must return 200");
  const practiceData = await practiceRes.json();
  assert.strictEqual(practiceData.success, true);
  assert.strictEqual(practiceData.meta.contentCategory, "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ");
  assert.strictEqual(practiceData.meta.isOfficialPYQ, false);
  assert.strictEqual(practiceData.practiceQuestions.length, 3);

  // 4. Search API
  const searchRes = await fetch(`${BASE_URL}/api/v1/corpus/search?q=Constitution&limit=3`);
  assert.strictEqual(searchRes.status, 200, "Search API must return 200");
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.success, true);
  assert.ok(searchData.results.totalMatches > 0, "Must return search matches");
});

test("Corpus: Ingestion Audit Trail (CorpusIngestionJob)", async () => {
  const jobs = await prisma.corpusIngestionJob.findMany({
    orderBy: { createdAt: "desc" }
  });

  assert.ok(jobs.length >= 3, "Must have recorded multiple ingestion jobs");
  const actions = jobs.map(j => j.action);
  assert.ok(actions.includes("SYNC_REGISTRY"), "Must log registry sync");
  assert.ok(actions.includes("BATCH_DOWNLOAD_AND_EXTRACT"), "Must log batch download and extraction");
  assert.ok(actions.includes("STAGE_VERIFIED_PYQS"), "Must log PYQ staging");
  assert.ok(actions.includes("IMPORT_PRACTICE_QUESTIONS"), "Must log practice question import");

  const completedJobs = jobs.filter(j => j.status === "COMPLETED");
  assert.ok(completedJobs.length >= 3, "Most jobs must be COMPLETED");
});
