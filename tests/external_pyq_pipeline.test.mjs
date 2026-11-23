import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_ID = 'cmvqr30n100065y3bl676de6r'; // admin@pravaah.in

test('External PYQ Pipeline (ExamGOAL, ExamSIDE & Human Peritus) Test Suite', async (t) => {
  // Test 1: Source Discovery File & Content
  await t.test('1. Source discovery registry contains all 4 external sources with legal boundaries', () => {
    const discoveryPath = path.join(process.cwd(), 'data', 'pyq', 'sources_discovery.json');
    assert.ok(fs.existsSync(discoveryPath), 'sources_discovery.json must exist');

    const sources = JSON.parse(fs.readFileSync(discoveryPath, 'utf-8'));
    assert.strictEqual(sources.length, 4, 'Expected exactly 4 external sources');

    const examgoal = sources.find((s) => s.id === 'examgoal_pdf_archive');
    assert.ok(examgoal, 'ExamGOAL source must be present');
    assert.strictEqual(examgoal.status, 'ACCESSIBLE');
    assert.strictEqual(examgoal.discoveredItemsCount, 12, 'ExamGOAL should have discovered 12 papers');
    assert.strictEqual(examgoal.reusePermissionStatus, 'AUTHORIZED_OFFICIAL_RECORDS_ONLY');

    const examsideChapter = sources.find((s) => s.id === 'examside_chapter_wise');
    assert.ok(examsideChapter, 'ExamSIDE chapter source must be present');
    assert.strictEqual(examsideChapter.status, 'ACCESSIBLE');
    assert.ok(examsideChapter.discoveredItemsCount >= 8, 'Expected at least 8 main categories');

    const humanPeritus = sources.find((s) => s.id === 'human_peritus_csat');
    assert.ok(humanPeritus, 'Human Peritus source must be present');
    assert.strictEqual(humanPeritus.reusePermissionStatus, 'RESTRICTED_PAID_CONTENT');
  });

  // Test 2: Paper Manifest JSON & CSV
  await t.test('2. Paper manifest contains complete multi-era registry (1995–2026)', () => {
    const jsonPath = path.join(process.cwd(), 'data', 'pyq', 'paper_manifest.json');
    const csvPath = path.join(process.cwd(), 'data', 'pyq', 'paper_manifest.csv');

    assert.ok(fs.existsSync(jsonPath), 'paper_manifest.json must exist');
    assert.ok(fs.existsSync(csvPath), 'paper_manifest.csv must exist');

    const papers = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    assert.ok(papers.length >= 40, `Expected at least 40 papers in manifest, got ${papers.length}`);

    // Verify 2024 GS1 & CSAT
    const p2024GS1 = papers.find((p) => p.year === 2024 && p.paperCode === 'GS1');
    assert.ok(p2024GS1, '2024 GS1 paper must exist in manifest');
    assert.ok(p2024GS1.englishPdfUrl.includes('upsc-civil-service-prelims-paper-i-2024'), 'Must have valid CDN URL');
    assert.ok(p2024GS1.fileHashSha256, 'Must have SHA-256 fingerprint');

    const p2024GS2 = papers.find((p) => p.year === 2024 && p.paperCode === 'GS2');
    assert.ok(p2024GS2, '2024 GS2 paper must exist in manifest');

    // Verify CSV Content
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    assert.ok(csvContent.startsWith('ID,Year,PaperCode,PaperName'), 'CSV header must be formatted correctly');
    assert.ok(csvContent.includes('2024,GS1'), 'CSV must contain 2024 GS1 row');
  });

  // Test 3: Quality Gate Validation
  await t.test('3. validateQuestionRecord enforces 4 options and strict UPSC marking schemes', async () => {
    const { validateQuestionRecord } = await import('../scripts/pyq/validate-records.js');

    const validGS1 = {
      year: 2024,
      paperCode: 'GS1',
      questionNumber: 1,
      questionText: 'Under the Constitution of India, which of the following is correct regarding Governor?',
      questionTextEn: 'Under the Constitution of India, which of the following is correct regarding Governor?',
      options: [
        { code: 'A', text: 'Option A', textEn: 'Option A' },
        { code: 'B', text: 'Option B', textEn: 'Option B' },
        { code: 'C', text: 'Option C', textEn: 'Option C' },
        { code: 'D', text: 'Option D', textEn: 'Option D' },
      ],
      marks: 2.0,
      negativeMarks: 0.666,
      sourceOrigin: 'UPSC_OFFICIAL',
    };

    const validAns = {
      answerOption: 'C',
      answerType: 'FINAL',
      answerKeyType: 'UPSC_FINAL_KEY',
      answerProvenance: 'UPSC_OFFICIAL',
      verificationStatus: 'OFFICIALLY_VERIFIED',
      confidenceScore: 1.0,
      sourceAttribution: 'Series A Master Key',
    };

    const reportValid = validateQuestionRecord(validGS1, validAns);
    assert.strictEqual(reportValid.isValid, true, 'Valid record must pass validation');

    // Test: Invalid options count (3 options)
    const invalidOptions = {
      ...validGS1,
      options: [
        { code: 'A', text: 'A', textEn: 'A' },
        { code: 'B', text: 'B', textEn: 'B' },
        { code: 'C', text: 'C', textEn: 'C' },
      ],
    };
    const reportInvalid = validateQuestionRecord(invalidOptions, validAns);
    assert.strictEqual(reportInvalid.isValid, false, 'Record with 3 options must fail');
    assert.ok(reportInvalid.issues.some((i) => i.code === 'INVALID_OPTIONS_COUNT'));

    // Test: Invalid CSAT marking
    const invalidCSATMarking = {
      ...validGS1,
      paperCode: 'GS2',
      marks: 2.0, // Should be 2.5
      negativeMarks: 0.666, // Should be 0.833
    };
    const reportCSAT = validateQuestionRecord(invalidCSATMarking, validAns);
    assert.strictEqual(reportCSAT.isValid, false, 'CSAT with GS1 marking must fail validation');
    assert.ok(reportCSAT.issues.some((i) => i.code === 'INVALID_CSAT_MARKING'));
  });

  // Test 4: Admin External Sources API
  await t.test('4. GET /api/v1/admin/pyqs/external-sources returns live metrics and paper manifest', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/pyqs/external-sources`, {
      headers: {
        'x-user-id': ADMIN_ID,
      },
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.summary.totalDiscoveredPapers >= 40, 'Expected >= 40 papers');
    assert.ok(json.data.summary.totalCanonicalQuestions >= 100, 'Expected >= 100 questions');
    assert.strictEqual(json.data.summary.duplicateKeyCount, 0, 'Zero duplicate collisions');
    assert.strictEqual(json.data.summary.missingOptionsCount, 0, 'Zero missing options');
    assert.ok(Array.isArray(json.data.sources), 'Sources must be array');
    assert.ok(Array.isArray(json.data.paperManifest), 'Paper manifest must be array');
  });

  // Test 5: Admin External Sources Unauthenticated Guard
  await t.test('5. POST /api/v1/admin/pyqs/external-sources rejects non-admin with 403', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/pyqs/external-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DISCOVER' }),
    });

    assert.strictEqual(res.status, 403, 'Unauthenticated request must receive 403 Forbidden');
  });

  // Test 6: Database Quality & Integrity Audit
  await t.test('6. Database maintains 100% verified answers and zero duplicates', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?limit=100`);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length >= 100, 'Expected at least 100 questions');

    for (const q of json.data) {
      assert.strictEqual(q.options.length, 4, `Q${q.questionNumber} (${q.year}) must have exactly 4 options`);
      assert.ok(q.verifiedAnswer, `Q${q.questionNumber} (${q.year}) must have verifiedAnswer`);
      assert.strictEqual(q.verifiedAnswer.answerKeyType, 'UPSC_FINAL_KEY');

      if (q.paperCode === 'GS1') {
        assert.strictEqual(q.marks, 2.0);
        assert.ok(Math.abs(q.negativeMarks - 0.666) < 0.01);
      } else if (q.paperCode === 'GS2') {
        assert.strictEqual(q.marks, 2.5);
        assert.ok(Math.abs(q.negativeMarks - 0.833) < 0.01);
      }
    }
  });
});
