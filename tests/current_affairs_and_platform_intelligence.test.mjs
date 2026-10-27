import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("GET /api/v1/current-affairs returns published stories with linked PYQs and syllabus papers", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/current-affairs`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.stories.length >= 5, "Should return at least 5 curated stories");

  const story = data.stories[0];
  assert.ok(story.title, "Story must have title");
  assert.ok(story.slug, "Story must have slug");
  assert.ok(story.summary, "Story must have summary");
  assert.ok(story.topics.length > 0, "Story must have syllabus topics");
  assert.ok(story.linkedPyqsCount >= 1, "Story must link to at least 1 historical PYQ");
});

test("GET /api/v1/current-affairs/[slug] returns full story with connected historical PYQ and practice questions", async () => {
  const listRes = await fetch(`${BASE_URL}/api/v1/current-affairs`);
  const listData = await listRes.json();
  const testSlug = listData.stories[0].slug;

  const res = await fetch(`${BASE_URL}/api/v1/current-affairs/${testSlug}`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.story.slug, testSlug);
  assert.ok(data.story.content, "Should contain full content");
  assert.ok(data.story.linkedPyqs.length >= 1, "Should contain connected PYQs");

  const linkedPyq = data.story.linkedPyqs[0];
  assert.ok(linkedPyq.year >= 2019, "Connected PYQ should have authentic year");
  assert.ok(linkedPyq.options.length === 4, "Connected PYQ should have 4 options");
  assert.ok(linkedPyq.explanation, "Connected PYQ should have explanation");
});

test("GET /api/v1/quiz/daily returns today's 5-question Prelims quiz with redacted answers", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/quiz/daily`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.quiz.totalQuestions, 5);
  assert.equal(data.quiz.questions.length, 5);

  const q = data.quiz.questions[0];
  assert.ok(q.questionText, "Question text required");
  assert.equal(q.options.length, 4, "Must have exactly 4 options");
  assert.equal(q.correctOption, undefined, "Answer key must be redacted before submission");
});

test("POST /api/v1/quiz/daily/submit grades answers accurately with negative marking", async () => {
  const quizRes = await fetch(`${BASE_URL}/api/v1/quiz/daily`);
  const quizData = await quizRes.json();
  const quizId = quizData.quiz.id;
  const questions = quizData.quiz.questions;

  // Submit test answers: select "C" for all questions
  const answers = {};
  for (const q of questions) {
    answers[q.id] = "C";
  }

  const res = await fetch(`${BASE_URL}/api/v1/quiz/daily/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quizId,
      answers,
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.result.totalQuestions === 5);
  assert.ok(typeof data.result.score === "number");
  assert.ok(data.result.gradedQuestions.length === 5);

  // After submission, answers & explanations must be disclosed
  const gradedQ = data.result.gradedQuestions[0];
  assert.ok(gradedQ.correctOption, "Disclosed correct option");
  assert.ok(gradedQ.explanation, "Disclosed explanation");
});

test("GET /api/v1/exams returns multi-exam directory with 8 UPSC examinations", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/exams`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.total >= 8, "Should contain at least 8 UPSC examinations");

  const codes = data.exams.map((e) => e.code);
  assert.ok(codes.includes("CSE"), "Must include CSE");
  assert.ok(codes.includes("CDS"), "Must include CDS");
  assert.ok(codes.includes("NDA"), "Must include NDA");
  assert.ok(codes.includes("CAPF"), "Must include CAPF");
  assert.ok(codes.includes("ESE"), "Must include ESE");
  assert.ok(codes.includes("CMS"), "Must include CMS");
  assert.ok(codes.includes("EPFO"), "Must include EPFO");
});

test("GET /api/v1/exams/[code] returns single exam profile with eligibility details", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/exams/CSE`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.exam.code, "CSE");
  assert.ok(data.exam.eligibilityQualifications.includes("Bachelor's Degree"));
  assert.ok(data.exam.stagesDescription.includes("Prelims"));
});

test("GET /api/v1/mains returns Mains questions filtered by paper", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/mains?paper=GS1`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.questions.length >= 2, "Should contain GS1 questions");
  assert.equal(data.questions[0].paperCode, "GS1");
  assert.ok(data.questions[0].frameworkGuidance, "Should provide framework guidance");
});

test("GET /api/v1/study-planner/today answers the three core aspirant questions", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/study-planner/today`);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  const plan = data.studyPlan;

  // Q1: What should I study today?
  assert.ok(plan.todayStudy.title, "Q1: Must recommend what to study today");
  assert.ok(plan.todayStudy.syllabusPaper, "Q1: Must include syllabus paper");

  // Q2: What is important for UPSC?
  assert.ok(plan.importantForUpsc.connectedPyqs.length >= 1, "Q2: Must link historical PYQs");

  // Q3: What should I revise next?
  assert.ok(typeof plan.revisionNext.dueCount === "number", "Q3: Must compute revision due count");
});
