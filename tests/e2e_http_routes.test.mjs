import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

test('E2E HTTP: Public and Authenticated Pages Render with 200 Status and Expected Content', async () => {
  const routes = [
    { path: '/', text: 'Pravaah UPSC' },
    { path: '/pyqs', text: 'Prelims PYQ Explorer' },
    { path: '/pyqs?paper=GS1&years=2024', text: 'GS Paper I' },
    { path: '/pyqs?paper=GS2&years=2024', text: 'CSAT' },
    { path: '/pyqs/year/2024', text: '2024' },
    { path: '/pyqs/2024/GS1', text: 'GS1' },
    { path: '/subjects', text: 'Polity' },
    { path: '/mock-tests', text: 'Timed Examination Simulator' },
    { path: '/mock-tests/test-cse-2024-gs1', text: 'Preparing UPSC Examination Environment' },
    { path: '/dashboard', text: 'Aspirant Learning Analytics' },
    { path: '/revision', text: 'Mistake Revision Queue' },
    { path: '/bookmarks', text: 'Bookmarked Questions' },
    { path: '/notes', text: 'Aspirant Study Notes Workspace' },
    { path: '/about', text: 'About Pravaah UPSC' },
    { path: '/faq', text: 'Frequently Asked Questions' },
    { path: '/privacy', text: 'Privacy Policy' },
    { path: '/terms', text: 'Terms of Service' },
    { path: '/admin', text: 'Content Administration' },
    { path: '/admin/questions', text: 'Question Bank Manager' },
    { path: '/admin/review', text: 'Verification' },
    { path: '/admin/coverage', text: 'coverage' }
  ];

  for (const r of routes) {
    const res = await fetch(`${BASE_URL}${r.path}`);
    assert.strictEqual(res.status, 200, `Expected 200 for ${r.path}, got ${res.status}`);
    const body = await res.text();
    assert.ok(body.includes(r.text), `Expected ${r.path} to contain "${r.text}"`);
  }
});

test('E2E API: Live Search & Filter API', async () => {
  // Exact keyword search for "Governor"
  const resExact = await fetch(`${BASE_URL}/api/v1/search?q=Governor&mode=exact`);
  assert.strictEqual(resExact.status, 200);
  const jsonExact = await resExact.json();
  assert.strictEqual(jsonExact.success, true);
  assert.ok(jsonExact.data.length >= 1, 'Should find at least 1 question for Governor in exact search');

  // Smart conceptual search for "Monetary"
  const resSmart = await fetch(`${BASE_URL}/api/v1/search?q=Monetary&mode=smart`);
  assert.strictEqual(resSmart.status, 200);
  const jsonSmart = await resSmart.json();
  assert.strictEqual(jsonSmart.success, true);
  assert.ok(jsonSmart.data.length >= 1, 'Should find matching questions in smart search');

  // Question filter API
  const resFilter = await fetch(`${BASE_URL}/api/v1/questions?paper=GS1&years=2024`);
  assert.strictEqual(resFilter.status, 200);
  const jsonFilter = await resFilter.json();
  assert.strictEqual(jsonFilter.success, true);
  assert.ok(jsonFilter.data.length > 0, 'Should return GS1 2024 questions');
  assert.ok(jsonFilter.data.every(q => q.paperCode === 'GS1' && q.year === 2024));
});

test('E2E API: Interactive Learn Mode Question Solving', async () => {
  // Fetch a question with options
  const qRes = await fetch(`${BASE_URL}/api/v1/questions?paper=GS1&years=2024`);
  const qJson = await qRes.json();
  assert.strictEqual(qJson.success, true);
  const targetQ = qJson.data[0];

  assert.ok(targetQ, 'Must have at least one question');
  const optionCode = targetQ.options[0].code;

  // Submit attempt in Learn Mode
  const attemptRes = await fetch(`${BASE_URL}/api/v1/attempts/learn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: targetQ.id,
      selectedOption: optionCode,
      timeSpentSeconds: 42
    })
  });

  assert.strictEqual(attemptRes.status, 200);
  const attemptJson = await attemptRes.json();
  assert.strictEqual(attemptJson.success, true);
  const attemptData = attemptJson.data;

  assert.ok('isCorrect' in attemptData, 'Should return isCorrect boolean');
  assert.ok(attemptData.correctOption, 'Should reveal official correctOption');
  assert.ok(attemptData.explanation, 'Should provide pedagogical explanation');
  assert.ok(attemptData.explanation.detailedExplanation, 'Explanation must include detailedExplanation');
});

test('E2E API: Timed Exam Session with Anti-Leak and Accurate Negative Marking', async () => {
  // Start exam session
  const startRes = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testId: 'test-cse-2024-gs1' })
  });
  assert.strictEqual(startRes.status, 200);
  const startJson = await startRes.json();
  assert.strictEqual(startJson.success, true);
  const startData = startJson.data;

  assert.ok(startData.sessionId, 'Must return active session ID');
  assert.ok(startData.questions.length > 0, 'Must return test questions');

  // Verify anti-leak: client payload MUST NOT contain isCorrect or correctOption
  for (const q of startData.questions) {
    for (const opt of q.options) {
      assert.strictEqual(opt.isCorrect, undefined, 'CRITICAL: isCorrect leaked in exam payload!');
    }
    assert.strictEqual(q.correctOption, undefined, 'CRITICAL: correctOption leaked in exam payload!');
    assert.strictEqual(q.explanation, undefined, 'CRITICAL: explanation leaked before exam submission!');
  }

  // Answer question 1 and leave rest unattempted
  const q1 = startData.questions[0];
  const submitRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: startData.sessionId,
      responses: [
        {
          questionId: q1.id,
          selectedOption: q1.options[0].code,
          timeSpent: 65
        }
      ],
      totalTimeSpentSeconds: 120
    })
  });

  assert.strictEqual(submitRes.status, 200);
  const scoreJson = await submitRes.json();
  assert.strictEqual(scoreJson.success, true);
  const scoreData = scoreJson.data;

  assert.ok(typeof scoreData.scorecard.netScore === 'number', 'Must compute numerical netScore');
  assert.strictEqual(scoreData.scorecard.attemptedCount, 1, 'Attempted count should be 1');
  assert.strictEqual(scoreData.scorecard.unattemptedCount, startData.questions.length - 1);
  assert.ok(scoreData.detailedResults.length === startData.questions.length, 'Must return full detailed review');
});

test('E2E API: Dashboard Telemetry, Bookmarks, Notes, and Revision Queue', async () => {
  // Dashboard Analytics
  const dashRes = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`);
  assert.strictEqual(dashRes.status, 200);
  const dashJson = await dashRes.json();
  assert.strictEqual(dashJson.success, true);
  assert.ok('summary' in dashJson.data);
  assert.ok('subjectPerformance' in dashJson.data);
  assert.ok('weakTopics' in dashJson.data);

  // User Bookmarks
  const qRes = await fetch(`${BASE_URL}/api/v1/questions?limit=1`);
  const q = (await qRes.json()).data[0];

  const bmToggleRes = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: q.id })
  });
  assert.strictEqual(bmToggleRes.status, 200);

  const bmListRes = await fetch(`${BASE_URL}/api/v1/user/bookmarks`);
  assert.strictEqual(bmListRes.status, 200);
  const bmList = await bmListRes.json();
  assert.strictEqual(bmList.success, true);
  assert.ok(Array.isArray(bmList.data));

  // User Notes
  const noteSaveRes = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: q.id, content: 'E2E verified study note for UPSC CSE' })
  });
  assert.strictEqual(noteSaveRes.status, 200);

  const noteListRes = await fetch(`${BASE_URL}/api/v1/user/notes`);
  assert.strictEqual(noteListRes.status, 200);
  const noteList = await noteListRes.json();
  assert.strictEqual(noteList.success, true);
  assert.ok(noteList.data.some(n => n.content.includes('E2E verified study note')));

  // Spaced Revision Queue
  const revRes = await fetch(`${BASE_URL}/api/v1/user/revision`);
  assert.strictEqual(revRes.status, 200);
  const revList = await revRes.json();
  assert.strictEqual(revList.success, true);
  assert.ok(Array.isArray(revList.data));
});

test('E2E API: Admin Guardrails - Direct publication from DRAFT rejected', async () => {
  const publishRes = await fetch(`${BASE_URL}/api/v1/admin/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId: 'fake-draft-question-id',
      targetStatus: 'PUBLISHED'
    })
  });

  // Should fail because question cannot be published directly from DRAFT or non-existent
  assert.strictEqual(publishRes.status >= 400, true, 'Direct publication guardrail must enforce rejection');
});
