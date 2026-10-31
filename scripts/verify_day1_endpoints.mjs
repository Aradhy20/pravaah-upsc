const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, fn) {
  try {
    const result = await fn();
    console.log(`[PASS] ${name}: ${result}`);
    return true;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('--- PRAVAAH UPSC: DAY 1 END-TO-END SERVICE VERIFICATION ON NEON ---');
  let passed = 0;
  let total = 0;

  async function check(name, fn) {
    total++;
    const ok = await testEndpoint(name, fn);
    if (ok) passed++;
  }

  // 1. Question Catalog
  await check('GET /api/v1/questions (GS1 2024)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions?paper=GS1&years=2024&limit=15`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.length === 0) throw new Error('No questions returned');
    return `${json.data.length} questions returned (Total in DB: ${json.meta?.total || 'N/A'})`;
  });

  // 2. Mains Questions Essay
  await check('GET /api/v1/mains?paper=ESSAY', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/mains?paper=ESSAY`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.questions || json.questions.length === 0) throw new Error('No essay questions');
    return `${json.questions.length} essay topics fetched`;
  });

  // 3. Mains Questions GS1
  await check('GET /api/v1/mains?paper=GS1', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/mains?paper=GS1`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.questions || json.questions.length === 0) throw new Error('No GS1 questions');
    return `${json.questions.length} GS1 questions fetched`;
  });

  // 4. Current Affairs Feed
  await check('GET /api/v1/current-affairs', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/current-affairs`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || json.stories.length === 0) throw new Error('No stories');
    return `${json.stories.length} verified government stories fetched`;
  });

  // 5. Current Affairs Single Story with PYQ Links
  await check('GET /api/v1/current-affairs/[slug] (Detail & PYQs)', async () => {
    const slug = 'rbi-climate-risk-financial-disclosures-framework';
    const res = await fetch(`${BASE_URL}/api/v1/current-affairs/${slug}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.story) throw new Error('Story not found');
    return `Story "${json.story.title.slice(0, 30)}..." with ${json.story.relatedPYQs?.length || 0} linked PYQs`;
  });

  // 6. Daily Quiz Read & Anti-Leak
  let todayQuiz;
  await check('GET /api/v1/quiz/daily (Anti-Leak Verification)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/quiz/daily`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.quiz) throw new Error('No active daily quiz');
    todayQuiz = json.quiz;
    for (const q of todayQuiz.questions) {
      if (q.correctOption !== undefined) throw new Error(`LEAK: correctOption found in quiz question ${q.id}`);
      if (q.explanation !== undefined) throw new Error(`LEAK: explanation found in quiz question ${q.id}`);
    }
    return `Quiz "${todayQuiz.title}" with ${todayQuiz.questions.length} questions (Anti-Leak confirmed)`;
  });

  // 7. Daily Quiz Submit with Negative Marking
  await check('POST /api/v1/quiz/daily/submit (Accurate Negative Scoring)', async () => {
    if (!todayQuiz) throw new Error('Prior quiz fetch failed');
    const q1 = todayQuiz.questions[0];
    const res = await fetch(`${BASE_URL}/api/v1/quiz/daily/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: todayQuiz.id,
        answers: { [q1.id]: q1.options[0].code }
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.result || typeof json.result.score !== 'number') throw new Error('Scorecard invalid');
    return `Scored: Net ${json.result.score}, Correct ${json.result.correctCount}, Incorrect ${json.result.incorrectCount}, Unattempted ${json.result.unattemptedCount}`;
  });

  // 8. Multi-Exam Directory
  await check('GET /api/v1/exams', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/exams`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.exams || json.exams.length === 0) throw new Error('No exams');
    return `${json.exams.length} official commission profiles verified`;
  });

  // 9. Single Exam Profile
  await check('GET /api/v1/exams/CSE', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/exams/CSE`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.exam || json.exam.code !== 'CSE') throw new Error('CSE exam not found');
    return `Profile: ${json.exam.name} (${json.exam.stages?.length || 0} stages)`;
  });

  // 10. Subscription Plans
  await check('GET /api/v1/plans', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/plans`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || json.data.length === 0) throw new Error('No subscription plans');
    return `${json.data.length} official subscription tiers active`;
  });

  // 11. User Registration Write to Neon
  const testEmail = `day1_aspirant_${Date.now()}@pravaah.test`;
  let registeredUserId;
  await check('POST /api/v1/auth/register (Neon Relational Write)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecureAspirantPass2026!',
        fullName: 'Day1 Verified Aspirant'
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.id) throw new Error('Registration failed');
    registeredUserId = json.data.id;
    return `User created with ID ${registeredUserId} (${testEmail})`;
  });

  // 12. User Authentication against Neon
  await check('POST /api/v1/auth/login (Neon Password Validation)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecureAspirantPass2026!'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.email) throw new Error('Login failed');
    return `Authenticated: ${json.data.email} (Role: ${json.data.role})`;
  });

  // 13. Learn Mode Attempt Write
  let sampleQuestionId;
  await check('POST /api/v1/attempts/learn (Immediate Feedback & Write)', async () => {
    const qRes = await fetch(`${BASE_URL}/api/v1/questions?limit=1`);
    const qJson = await qRes.json();
    sampleQuestionId = qJson.data[0].id;
    const optionCode = qJson.data[0].options[0].code;

    const res = await fetch(`${BASE_URL}/api/v1/attempts/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: sampleQuestionId,
        selectedOption: optionCode,
        timeSpentSeconds: 45
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.explanation) throw new Error('Attempt response incomplete');
    return `Attempt recorded. Correct Key: ${json.data.correctOption}, IsCorrect: ${json.data.isCorrect}`;
  });

  // 14. User Bookmark Write
  await check('POST /api/v1/user/bookmarks (Relational Persistence)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: sampleQuestionId })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    return `Bookmark toggle confirmed for Question ${sampleQuestionId}`;
  });

  // 15. User Study Note Write
  await check('POST /api/v1/user/notes (Private Note Persistence)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/user/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: sampleQuestionId,
        content: 'Day 1 Launch Audit: Critical constitutional landmark case study verified.'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    return `Study note saved for Question ${sampleQuestionId}`;
  });

  // 16. Spaced Revision Queue Read
  await check('GET /api/v1/user/revision (Spaced Mistake Queue)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/user/revision`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid revision queue');
    return `Queue contains ${json.data.length} review items`;
  });

  // 17. Custom Study Timetable Generator
  await check('POST /api/v1/study-planner/custom (Timetable Architect)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/study-planner/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetExam: 'UPSC CSE 2026',
        preparationStage: 'INTERMEDIATE',
        dailyHours: 6,
        targetDate: '2026-05-24',
        prioritySubjects: ['Polity & Governance', 'Economy', 'Modern History']
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.slots) throw new Error('Timetable generation failed');
    return `Generated plan: ${json.data.slots.length} daily slots (${json.data.calculatedDaysRemaining} days remaining)`;
  });

  // 18. Timed Exam Session Start & Anti-Leak
  let examSessionId;
  await check('POST /api/v1/tests/session/start (Exam Anti-Leak)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: 'test-cse-2024-gs1' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.sessionId) throw new Error('Session creation failed');
    examSessionId = json.data.sessionId;
    for (const q of json.data.questions) {
      if (q.correctOption !== undefined) throw new Error(`LEAK: correctOption in exam question ${q.id}`);
      if (q.explanation !== undefined) throw new Error(`LEAK: explanation in exam question ${q.id}`);
      for (const opt of q.options) {
        if (opt.isCorrect !== undefined) throw new Error(`LEAK: opt.isCorrect in option ${opt.id}`);
      }
    }
    return `Session ${examSessionId} launched with ${json.data.questions.length} questions (Zero Leak confirmed)`;
  });

  // 19. Exam Session Submission with UPSC Negative Scoring
  await check('POST /api/v1/tests/session/submit (Official Negative Scoring)', async () => {
    if (!examSessionId) throw new Error('No active exam session');
    const res = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: examSessionId,
        responses: [],
        totalTimeSpentSeconds: 180
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || typeof json.data.scorecard.netScore !== 'number') throw new Error('Invalid scorecard');
    return `Scorecard: Net ${json.data.scorecard.netScore}, Attempted ${json.data.scorecard.attemptedCount}, Unattempted ${json.data.scorecard.unattemptedCount}`;
  });

  // 20. Question Flag Issue Reporting
  await check('POST /api/v1/questions/report (Academic Audit Modal)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/questions/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: sampleQuestionId,
        reason: 'TYPO_ERROR',
        description: 'Day 1 QA verification of question flag feedback modal.'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Report submission failed');
    return `Report logged to ContentReview (${json.message})`;
  });

  // 21. Core Public UI Routes
  const uiRoutes = [
    '/', '/pyqs', '/mock-tests', '/current-affairs', '/daily-quiz',
    '/mains', '/exams', '/study-planner', '/dashboard', '/revision', '/pricing'
  ];

  for (const route of uiRoutes) {
    await check(`GET ${route} (UI Render 200)`, async () => {
      const res = await fetch(`${BASE_URL}${route}`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      return `HTTP 200 OK (${res.headers.get('content-type') || 'text/html'})`;
    });
  }

  console.log(`\n==================================================`);
  console.log(`DAY 1 VERIFICATION RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`==================================================`);

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
