import assert from 'node:assert/strict';
import test from 'node:test';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_ID = 'cmvqr30n100065y3bl676de6r'; // admin@pravaah.in

test('PYQ Ingestion, Verification & API Interface Test Suite', async (t) => {
  // Test 1: Inventory API
  await t.test('1. GET /api/v1/pyqs/inventory returns dynamic years, papers, and subjects', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs/inventory`);
    assert.strictEqual(res.status, 200, 'Inventory API should return status 200');

    const json = await res.json();
    assert.strictEqual(json.success, true, 'API response success flag should be true');
    assert.ok(json.data.total >= 100, `Expected at least 100 questions, got ${json.data.total}`);

    // Verify Papers breakdown
    assert.ok(json.data.papers.GS1 >= 50, `Expected GS1 count >= 50, got ${json.data.papers.GS1}`);
    assert.ok(json.data.papers.GS2 >= 30, `Expected GS2 count >= 30, got ${json.data.papers.GS2}`);

    // Verify Years
    const years = json.data.years;
    assert.ok(Array.isArray(years), 'Years should be an array');
    const yearList = years.map((y) => y.year);
    assert.ok(yearList.includes(2024), '2024 should be present in years inventory');
    assert.ok(yearList.includes(1995), '1995 should be present in years inventory');

    // Verify Subjects
    const subjects = json.data.subjects;
    assert.ok(Array.isArray(subjects) && subjects.length >= 7, 'Expected >= 7 subjects');
    const polity = subjects.find((s) => s.slug === 'polity-governance');
    assert.ok(polity, 'Polity & Governance should be in subjects inventory');
    assert.ok(polity.count > 0, 'Polity & Governance question count should be > 0');
  });

  // Test 2: GS1 Questions & Marking Scheme
  await t.test('2. GET /api/v1/pyqs?paper=GS1 returns GS1 questions with +2.0/-0.666 marking', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?paper=GS1&year=2024&limit=10`);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length > 0, 'Should return GS1 questions');

    for (const q of json.data) {
      assert.strictEqual(q.paperCode, 'GS1', 'Paper code must be GS1');
      assert.strictEqual(q.marks, 2, 'GS1 marks must be 2.0');
      assert.ok(Math.abs(q.negativeMarks - 0.666) < 0.01, 'GS1 negativeMarks must be ~0.666');
      assert.strictEqual(q.options.length, 4, 'Must have exactly 4 options');
      assert.ok(q.verifiedAnswer, 'Must have verifiedAnswer');
      assert.ok(['A', 'B', 'C', 'D'].includes(q.verifiedAnswer.answerOption), 'Answer must be A, B, C, or D');
    }
  });

  // Test 3: CSAT GS2 Questions & Marking Scheme
  await t.test('3. GET /api/v1/pyqs?paper=GS2 returns CSAT questions with +2.5/-0.833 marking', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?paper=GS2&limit=10`);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length > 0, 'Should return CSAT questions');

    for (const q of json.data) {
      assert.strictEqual(q.paperCode, 'GS2', 'Paper code must be GS2');
      assert.strictEqual(q.marks, 2.5, 'CSAT marks must be 2.5');
      assert.ok(Math.abs(q.negativeMarks - 0.833) < 0.01, 'CSAT negativeMarks must be ~0.833');
      assert.strictEqual(q.options.length, 4, 'Must have exactly 4 options');
      assert.ok(q.explanation?.eliminationTechnique, 'CSAT question should include elimination technique or explanation');
    }
  });

  // Test 4: Historical Year Filter (1995)
  await t.test('4. GET /api/v1/pyqs?year=1995 returns authentic 1995 questions', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?year=1995`);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length >= 2, 'Expected at least 2 questions for 1995');

    const q1 = json.data.find((q) => q.questionNumber === 1);
    assert.ok(q1, '1995 Q1 must exist');
    assert.ok(q1.questionText.includes('Brahmavadini'), '1995 Q1 text must match Brahmavadini question');
    assert.strictEqual(q1.verifiedAnswer.answerOption, 'A', '1995 Q1 official key must be A (Lopamudra)');
  });

  // Test 5: Bilingual Integrity & Unicode Preservation
  await t.test('5. Questions maintain authentic Devanagari Hindi text alongside English', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?year=1995&limit=5`);
    const json = await res.json();
    const q1 = json.data.find((q) => q.questionNumber === 1);

    assert.ok(q1.questionTextEn, 'English question text must be present');
    assert.ok(q1.questionTextHi, 'Hindi question text must be present');
    assert.ok(q1.questionTextHi.includes('ब्रह्मवादिनी'), 'Hindi text must contain authentic Devanagari');

    // Options bilingual check
    const optA = q1.options.find((o) => o.code === 'A');
    assert.strictEqual(optA.textEn, 'Lopamudra');
    assert.strictEqual(optA.textHi, 'लोपामुद्रा');
  });

  // Test 6: Smart / Concept Search API
  await t.test('6. GET /api/v1/pyqs?q=remainder performs concept keyword matching', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?q=remainder`);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.length > 0, 'Should find at least 1 remainder question');
    assert.ok(
      json.data.some((q) => q.questionText.toLowerCase().includes('remainder')),
      'Matched question must contain remainder keyword'
    );
  });

  // Test 7: Admin Batch API Authentication Guard
  await t.test('7. POST /api/v1/admin/pyqs/batch rejects unauthenticated requests with 403', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/pyqs/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'VERIFY', questionIds: ['dummy-id'] }),
    });

    assert.ok(res.status === 401 || res.status === 403, 'Should reject unauthenticated/non-admin request with 401 or 403');
  });

  // Test 8: Admin Batch CSV Export
  await t.test('8. GET /api/v1/admin/pyqs/batch?format=csv returns CSV export for admin', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/pyqs/batch?format=csv&year=1995`, {
      headers: {
        'x-user-id': ADMIN_ID,
      },
    });

    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/csv'), 'Content-Type must be text/csv');

    const csvText = await res.text();
    assert.ok(csvText.includes('ID,Year,Paper,QNo,Subject'), 'CSV must contain standard headers');
    assert.ok(csvText.includes('1995'), 'CSV must contain 1995 records');
  });

  // Test 9: Admin Batch Publish Verification
  await t.test('9. POST /api/v1/admin/pyqs/publish enforces quality gate', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/pyqs/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': ADMIN_ID,
      },
      body: JSON.stringify({ year: 1995, paperCode: 'GS1' }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
  });
});
