import test from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Knowledge Database & Coverage Matrix API Tests", async (t) => {
  await t.test("GET /api/v1/coverage returns 448 targets and 14 exam families", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/coverage`);
    assert.equal(res.status, 200, "Should return HTTP 200");

    const json = await res.json();
    assert.equal(json.success, true, "Response should have success: true");
    assert.ok(json.data.summary, "Should contain summary object");
    assert.equal(json.data.summary.totalTargets, 448, "Should track exactly 448 historical targets");
    assert.ok(json.data.summary.totalQuestionsInDb >= 120, "Should contain at least 120 questions");
    assert.ok(json.data.summary.totalKnowledgeSources >= 70, "Should contain at least 70 knowledge sources");
    assert.ok(Array.isArray(json.data.examFamilies), "Should return array of exam families");
    assert.equal(json.data.examFamilies.length, 14, "Should have 14 examination families");
  });

  await t.test("GET /api/v1/pyqs returns questions with verified answers & provenance", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/pyqs?paper=GS1&limit=5`);
    assert.equal(res.status, 200, "Should return HTTP 200");

    const json = await res.json();
    assert.equal(json.success, true, "Response should have success: true");
    assert.ok(Array.isArray(json.data), "Data should be an array");
    assert.equal(json.data.length, 5, "Should return 5 questions");

    const sample = json.data[0];
    assert.ok(sample.id, "Question must have an ID");
    assert.ok(sample.recordId, "Question must have a recordId");
    assert.ok(sample.questionText, "Question must have text");
    assert.ok(Array.isArray(sample.options), "Question must have options");
    assert.equal(sample.options.length, 4, "Question must have exactly 4 options");
    assert.ok(sample.verifiedAnswer, "Question must have a verified answer");
    assert.ok(sample.verifiedAnswer.answerKeyType, "Must have an answerKeyType");
  });

  await t.test("POST /api/v1/ai/assistant executes grounded RAG retrieval", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/ai/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Attorney General Article 76" }),
    });

    assert.equal(res.status, 200, "Should return HTTP 200");
    const json = await res.json();
    assert.equal(json.success, true, "Response should have success: true");
    assert.ok(json.data.answer, "RAG response must include synthesized answer");
    assert.ok(json.data.groundingConfidence >= 0.5, "Confidence should be at least 50%");
    assert.ok(Array.isArray(json.data.citations), "Must include primary citations array");
    assert.ok(json.data.citations.length > 0, "Should contain at least one official citation");
  });

  await t.test("GET /api/v1/syllabus/tree returns 3-tier hierarchy with 53 micro-nodes", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/syllabus/tree`);
    assert.equal(res.status, 200, "Should return HTTP 200");

    const json = await res.json();
    assert.equal(json.success, true, "Response should have success: true");
    assert.ok(json.data.totalSubjects >= 6, "Should contain at least 6 subjects");
    assert.equal(json.data.totalMicroNodes, 53, "Should contain 53 micro-syllabus nodes");
    assert.ok(Array.isArray(json.data.subjects), "Subjects should be an array");
  });
});
