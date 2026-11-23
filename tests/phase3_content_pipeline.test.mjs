import test from "node:test";
import assert from "node:assert";
import { PrismaClient } from "@prisma/client";
import {
  stageQuestionRecord,
  approveStagedRecord,
  rejectStagedRecord,
  publishStagedRecord,
} from "../scripts/pyq/stage-questions";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Phase 3: Existing Question Bank Baseline & Structural Integrity", async () => {
  const [totalPrelims, totalMains, publishedPrelims] = await Promise.all([
    prisma.question.count(),
    prisma.mainsQuestion.count(),
    prisma.question.count({ where: { status: "PUBLISHED" } }),
  ]);

  assert.strictEqual(totalPrelims, 121, "Must maintain exactly 121 verified Prelims questions");
  assert.strictEqual(totalMains, 32, "Must maintain exactly 32 authentic Mains questions");
  assert.strictEqual(publishedPrelims, 121, "All 121 questions must be PUBLISHED");

  // Verify all questions have exactly 4 options and 1 correct key
  const questionsWithOptions = await prisma.question.findMany({
    select: {
      id: true,
      options: { select: { optionCode: true, isCorrect: true } },
      explanation: { select: { id: true } },
    },
  });

  for (const q of questionsWithOptions) {
    assert.strictEqual(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    assert.strictEqual(correctCount, 1, `Question ${q.id} must have exactly 1 correct key`);
    assert.ok(q.explanation !== null, `Question ${q.id} must have a pedagogical explanation`);
  }
});

test("Phase 3: Data Model Enhancements (questionFormat, translationStatus, examStage)", async () => {
  const sampleQuestions = await prisma.question.findMany({
    take: 10,
    select: {
      id: true,
      questionFormat: true,
      translationStatus: true,
      examStage: true,
      questionTextHi: true,
    },
  });

  assert.strictEqual(sampleQuestions.length, 10);
  for (const q of sampleQuestions) {
    assert.ok(
      ["SINGLE_CHOICE", "MULTI_STATEMENT", "MATCH_FOLLOWING", "ASSERTION_REASONING"].includes(
        q.questionFormat
      ),
      `Valid questionFormat expected, got ${q.questionFormat}`
    );
    assert.strictEqual(q.examStage, "PRELIMS");
    if (q.questionTextHi && q.questionTextHi.trim().length > 0) {
      assert.strictEqual(q.translationStatus, "HUMAN_VERIFIED");
    } else {
      assert.strictEqual(q.translationStatus, "TRANSLATION_MISSING");
    }
  }
});

test("Phase 3: Staging Pipeline Quality Gates & Controlled Publication Workflow", async () => {
  const testAdminId = "cmvqr30n100065y3bl676de6r";

  // 1. Ingest malformed question (fails gate)
  const badStaging = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 881,
    questionTextEn: "Too short",
    options: [
      { code: "A", textEn: "Opt A", isCorrect: true },
      { code: "B", textEn: "Opt B", isCorrect: false },
    ],
  });
  assert.ok(badStaging.validationErrors.length > 0);
  assert.strictEqual(badStaging.record.workflowStatus, "AWAITING_VERIFICATION");

  // Attempting to publish an unapproved/unverified record must throw
  await assert.rejects(
    async () => {
      await publishStagedRecord(prisma, badStaging.record.id, testAdminId);
    },
    /Only VERIFIED or APPROVED questions can be published/
  );

  // 2. Ingest compliant question (passes gate)
  const validStaging = await stageQuestionRecord(prisma, {
    year: 2026,
    paperCode: "GS1",
    questionNumber: 882,
    questionFormat: "SINGLE_CHOICE",
    questionTextEn: "Which constitutional amendment recognized the Panchayati Raj institutions in India?",
    options: [
      { code: "A", textEn: "71st Amendment", isCorrect: false },
      { code: "B", textEn: "72nd Amendment", isCorrect: false },
      { code: "C", textEn: "73rd Amendment", isCorrect: true },
      { code: "D", textEn: "74th Amendment", isCorrect: false },
    ],
    officialAnswer: "C",
    explanationEn: "The 73rd Constitutional Amendment Act, 1992 added Part IX and the 11th Schedule.",
    sourceCitation: "Constitution of India, 73rd Amendment Act",
  });
  assert.strictEqual(validStaging.validationErrors.length, 0);
  assert.strictEqual(validStaging.record.workflowStatus, "VERIFIED");

  // Admin approval
  const approved = await approveStagedRecord(prisma, validStaging.record.id, testAdminId);
  assert.strictEqual(approved.workflowStatus, "APPROVED_FOR_PUBLICATION");

  // Controlled publication to Question catalog
  const published = await publishStagedRecord(prisma, validStaging.record.id, testAdminId);
  assert.strictEqual(published.status, "PUBLISHED");
  assert.strictEqual(published.marks, 2.0);
  assert.strictEqual(published.negativeMarks, 0.666);

  // Cleanup test records
  await prisma.question.delete({ where: { id: published.id } });
  await prisma.questionStagingRecord.deleteMany({
    where: { questionNumber: { in: [881, 882] }, year: 2026 },
  });
});

test("Phase 3: Admin Staging API Authorization Guard (HTTP 401/403)", async () => {
  // Unauthenticated request to /api/v1/admin/staging must be rejected
  const unauthRes = await fetch(`${BASE_URL}/api/v1/admin/staging`);
  assert.strictEqual(unauthRes.status, 401, "Unauthenticated access to staging API must return 401");

  // Admin access with x-user-id must succeed
  const adminRes = await fetch(`${BASE_URL}/api/v1/admin/staging`, {
    headers: { "x-user-id": "cmvqr30n100065y3bl676de6r" },
  });
  assert.strictEqual(adminRes.status, 200);
  const json = await adminRes.json();
  assert.strictEqual(json.success, true);
  assert.ok("summary" in json.data);
});

test("Phase 3: Public PYQ API Exposes Bilingual & Topology Fields", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/pyqs?limit=5`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.length > 0);

  const first = json.data[0];
  assert.ok("questionFormat" in first, "Must expose questionFormat");
  assert.ok("translationStatus" in first, "Must expose translationStatus");
  assert.ok("examStage" in first, "Must expose examStage");
});

test("Phase 3: Data Quality Dashboard Telemetry Accuracy", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/admin/data-integrity`, {
    headers: { "x-user-id": "cmvqr30n100065y3bl676de6r" },
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.summary.totalQuestions, 121);
  assert.strictEqual(json.summary.totalMainsQuestions, 32);
  assert.strictEqual(json.summary.bilingualQuestionsCount, 41);
  assert.strictEqual(json.summary.verifiedAnswersCount, 121);
  assert.strictEqual(json.summary.missingOptions, 0);
  assert.strictEqual(json.summary.duplicateQuestionsCount, 0);
});
