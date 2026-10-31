import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Day 2: Core PYQ & Learn Mode API - Paper Switching (GS1 vs CSAT)", async () => {
  // 1. Fetch GS1 questions
  const resGS1 = await fetch(`${BASE_URL}/api/v1/questions?paper=GS1&limit=5`);
  assert.strictEqual(resGS1.status, 200);
  const dataGS1 = await resGS1.json();
  assert.strictEqual(dataGS1.success, true);
  assert.ok(dataGS1.data.length > 0);
  for (const q of dataGS1.data) {
    assert.strictEqual(q.paperCode, "GS1");
  }

  // 2. Fetch CSAT (GS2) questions
  const resGS2 = await fetch(`${BASE_URL}/api/v1/questions?paper=GS2&limit=5`);
  assert.strictEqual(resGS2.status, 200);
  const dataGS2 = await resGS2.json();
  assert.strictEqual(dataGS2.success, true);
  assert.ok(dataGS2.data.length > 0);
  for (const q of dataGS2.data) {
    assert.strictEqual(q.paperCode, "GS2");
  }
});

test("Day 2: Year Filtering Strictly Scoped to Verified Database Cycles (2019-2024)", async () => {
  // Test valid cycle
  const res2024 = await fetch(`${BASE_URL}/api/v1/questions?years=2024&limit=10`);
  assert.strictEqual(res2024.status, 200);
  const data2024 = await res2024.json();
  assert.strictEqual(data2024.success, true);
  assert.ok(data2024.data.length > 0);
  for (const q of data2024.data) {
    assert.strictEqual(q.year, 2024);
  }

  // Test un-ingested years (e.g. 2015) return 0 without error
  const res2015 = await fetch(`${BASE_URL}/api/v1/questions?years=2015&limit=10`);
  assert.strictEqual(res2015.status, 200);
  const data2015 = await res2015.json();
  assert.strictEqual(data2015.success, true);
  assert.strictEqual(data2015.meta.total, 0, "Years outside 2019-2024 must return 0 records until ingested");
});

test("Day 2: Compound Subject and Topic Filtering", async () => {
  const subject = "Polity & Governance";
  const topic = "Union & State Executive";

  const res = await fetch(
    `${BASE_URL}/api/v1/questions?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&limit=10`
  );
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.length > 0, "Must return questions matching Polity and Union & State Executive");
  for (const q of json.data) {
    assert.ok(q.subject.includes("Polity"));
    assert.ok(q.topic.includes("Executive"));
  }
});

test("Day 2: Smart Conceptual Search vs Exact Match Search", async () => {
  // "Article 156" is mentioned in Governor explanation detailed text, not question stem
  const term = "Article 156";

  const resSmart = await fetch(
    `${BASE_URL}/api/v1/questions?q=${encodeURIComponent(term)}&mode=smart`
  );
  assert.strictEqual(resSmart.status, 200);
  const jsonSmart = await resSmart.json();
  assert.strictEqual(jsonSmart.success, true);
  assert.ok(jsonSmart.meta.total >= 1, "Smart search should match conceptual citations in explanations");

  const resExact = await fetch(
    `${BASE_URL}/api/v1/questions?q=${encodeURIComponent(term)}&mode=exact`
  );
  assert.strictEqual(resExact.status, 200);
  const jsonExact = await resExact.json();
  assert.strictEqual(jsonExact.success, true);
  assert.strictEqual(jsonExact.meta.total, 0, "Exact search should only match question stem or options");
});

test("Day 2: Learn Mode Explanation Drawer Completeness", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/questions?years=2024&paper=GS1&limit=5`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);

  for (const q of json.data) {
    // 1. Question text
    assert.ok(q.questionText && q.questionText.length > 10, "Original question text required");
    // 2. Exactly 4 ordered options
    assert.strictEqual(q.options.length, 4, "Must have exactly 4 options");
    const optionCodes = q.options.map((o) => o.code);
    assert.deepStrictEqual(optionCodes, ["A", "B", "C", "D"], "Options must be ordered A, B, C, D");
    // 3. Official answer key present in Learn Mode
    assert.ok(["A", "B", "C", "D"].includes(q.correctOption), "Valid answer key required");
    // 4. Pedagogical explanation fields
    assert.ok(q.explanation, "Explanation must be present for verified published questions");
    assert.ok(q.explanation.summary, "Core concept summary required");
    assert.ok(q.explanation.detailedExplanation, "Why correct / detailed explanation required");
    assert.ok(q.subject, "Subject classification required");
    assert.ok(q.topic, "Topic classification required");
  }
});

test("Day 2: Question Issue Reporting Pipeline (/api/v1/questions/report)", async () => {
  // Find a sample question
  const sample = await prisma.question.findFirst({
    where: { status: "PUBLISHED" },
    select: { id: true },
  });
  assert.ok(sample, "Must have at least one published question");

  const reportPayload = {
    questionId: sample.id,
    reason: "Discrepancy with official key",
    description: "Automated regression audit verification: testing editorial workflow",
  };

  const res = await fetch(`${BASE_URL}/api/v1/questions/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportPayload),
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);

  // Verify review record was created in ContentReview table
  const review = await prisma.contentReview.findFirst({
    where: {
      questionId: sample.id,
      action: "FLAGGED_BY_STUDENT",
    },
    orderBy: { reviewedAt: "desc" },
  });

  assert.ok(review, "Issue report must be persisted in ContentReview for academic editorial audit");
  assert.ok(review.comments.includes("Discrepancy with official key"));

  // Clean up test audit record
  await prisma.contentReview.delete({
    where: { id: review.id },
  });
});
