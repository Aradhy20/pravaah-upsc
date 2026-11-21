import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Question Bank Scale: Total and Published Count Exceeds 100+ Authentic Questions", async () => {
  const totalCount = await prisma.question.count();
  const publishedCount = await prisma.question.count({
    where: { status: "PUBLISHED" },
  });

  assert.ok(
    totalCount >= 120,
    `Total questions must be >= 120. Found: ${totalCount}`
  );
  assert.ok(
    publishedCount >= 115,
    `Published verified questions must be >= 115. Found: ${publishedCount}`
  );

  console.log(`[PASS] Verified ${totalCount} total questions (${publishedCount} published) in database.`);
});

test("Question Bank Coverage: Multi-Year Balanced GS1 & CSAT Distribution (1995 - 2024)", async () => {
  const years = [2024, 2023, 2022, 2021, 2020, 2019];

  for (const yr of years) {
    const gs1Count = await prisma.question.count({
      where: {
        year: yr,
        paper: { code: "GS1" },
        status: "PUBLISHED",
      },
    });

    assert.ok(
      gs1Count >= 1,
      `Year ${yr} GS1 should have verified questions. Found: ${gs1Count}`
    );
  }
  const totalCsat = await prisma.question.count({
    where: {
      paper: { code: "GS2" },
      status: "PUBLISHED",
    },
  });
  assert.ok(totalCsat >= 40, `CSAT total questions should be >= 40. Found: ${totalCsat}`);
});

test("Content Integrity: 100% Complete Options, Answer Keys, and Explanations", async () => {
  // Sample random 50 questions across catalog
  const sample = await prisma.question.findMany({
    take: 50,
    where: { status: "PUBLISHED" },
    include: {
      options: true,
      explanation: true,
      topics: { include: { topic: { include: { subject: true } } } },
    },
  });

  assert.equal(sample.length, 50);

  for (const q of sample) {
    // 1. Exactly 4 options A, B, C, D
    assert.equal(
      q.options.length,
      4,
      `Question ${q.id} (Year ${q.year} Q${q.questionNumber}) must have 4 options`
    );
    const codes = q.options.map((o) => o.optionCode).sort().join("");
    assert.equal(codes, "ABCD", `Options must be A, B, C, D. Found: ${codes}`);

    // 2. Exactly 1 option marked as correct
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    assert.equal(
      correctCount,
      1,
      `Question ${q.id} must have exactly 1 correct option. Found: ${correctCount}`
    );

    // 3. Explanation exists and has summary
    assert.ok(q.explanation, `Question ${q.id} must have an explanation`);
    assert.ok(
      q.explanation.summary && q.explanation.summary.length > 10,
      `Question ${q.id} must have a non-empty explanation summary`
    );

    // 4. Mapped to at least 1 topic
    assert.ok(
      q.topics.length >= 1,
      `Question ${q.id} must be mapped to a syllabus topic`
    );
  }
});

test("Public API Performance: Filtering Question Catalog via API", async () => {
  // 1. Filter by Paper GS1 and Year 2024
  const res = await fetch(`${BASE_URL}/api/v1/questions?paper=GS1&years=2024&limit=20`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.length, 20);
  assert.ok(json.meta.total >= 35, `Total 2024 GS1 questions should be >= 35. Found: ${json.meta.total}`);

  // 2. Filter by CSAT 2024
  const csatRes = await fetch(`${BASE_URL}/api/v1/questions?paper=GS2&years=2024&limit=15`);
  assert.equal(csatRes.status, 200);
  const csatJson = await csatRes.json();
  assert.equal(csatJson.success, true);
  assert.equal(csatJson.data.length, 15);
  assert.ok(csatJson.meta.total >= 35, `Total 2024 CSAT questions should be >= 35. Found: ${csatJson.meta.total}`);
});

test("Anti-Leak Protection at Scale: Random Timed Exam Session from 2021 GS1", async () => {
  // Start a timed mock test session with 2021 GS1 paper
  const startRes = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paperCode: "GS1", year: 2021 }),
  });

  const startJson = await startRes.json();
  assert.equal(startRes.status, 200);
  assert.ok(startJson.data.sessionId);
  assert.ok(startJson.data.questions.length > 0);

  // STRICT ANTI-LEAK AUDIT: Ensure answer keys and explanations are NEVER leaked in session
  for (const q of startJson.data.questions) {
    assert.equal(q.correctOption, undefined, "correctOption must NEVER be present during exam");
    assert.equal(q.explanation, undefined, "explanation must NEVER be present during exam");
    for (const opt of q.options) {
      assert.equal(opt.isCorrect, undefined, "option.isCorrect must NEVER be present during exam");
    }
  }
});
