import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 3 Mock Exam Flow: Subscription Gate for Free Aspirant", async () => {
  // Create Free Aspirant
  const email = `free_exam_gate_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Free Exam Gate Aspirant",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Attempt to start a timed exam session without Achiever plan -> Must return 403
  const res = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      paperCode: "GS1",
      year: 2024,
    }),
  });

  assert.strictEqual(res.status, 403, "Free user must be rejected with 403 from Timed Exam Mode");
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, "FORBIDDEN_SUBSCRIPTION_REQUIRED");
  assert.strictEqual(json.error.upgradeUrl, "/pricing");

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
});

test("Day 3 Mock Exam Flow: Paid Session Launch, Anti-Leak & Submission Lifecycle", async () => {
  // 1. Create a Paid Aspirant with Active ACHIEVER plan
  const email = `paid_exam_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Paid Mock Aspirant",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const achieverPlan = await prisma.plan.findUnique({ where: { code: "ACHIEVER" } });
  const sub = await prisma.subscription.create({
    data: {
      userId: user.id,
      planId: achieverPlan.id,
      status: "ACTIVE",
      billingInterval: "ANNUAL",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
    },
  });

  // 2. Start Exam Session for 2024 GS1
  const startRes = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      paperCode: "GS1",
      year: 2024,
    }),
  });

  assert.strictEqual(startRes.status, 200);
  const startJson = await startRes.json();
  assert.strictEqual(startJson.success, true);
  assert.ok(startJson.data.sessionId, "Must return active sessionId");
  assert.strictEqual(startJson.data.positiveMark, 2.0);
  assert.strictEqual(startJson.data.negativeMark, 0.666);
  assert.ok(startJson.data.questions.length > 0, "Must return question items");

  const sessionId = startJson.data.sessionId;
  const questions = startJson.data.questions;

  // 3. Anti-Leak Verification: Check all options for any leaked answer keys
  for (const q of questions) {
    for (const opt of q.options) {
      assert.strictEqual(
        opt.isCorrect,
        undefined,
        `Question ${q.questionNumber} option (${opt.code}) must NEVER expose isCorrect during active session`
      );
    }
  }

  // 4. Submit Examination Responses
  // Pick first question from DB to know the correct answer
  const q1 = await prisma.question.findUnique({
    where: { id: questions[0].id },
    include: { options: true },
  });
  const correctKey = q1.options.find((o) => o.isCorrect)?.optionCode || "A";
  const incorrectKey = ["A", "B", "C", "D"].find((k) => k !== correctKey) || "B";

  const responses = [
    { questionId: questions[0].id, selectedOption: correctKey, timeSpent: 40 }, // Correct (+2.0)
  ];
  if (questions.length > 1) {
    responses.push({ questionId: questions[1].id, selectedOption: incorrectKey, timeSpent: 30 }); // Incorrect (-0.666)
  }

  const submitRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      sessionId,
      responses,
      totalTimeSpentSeconds: 70,
    }),
  });

  assert.strictEqual(submitRes.status, 200);
  const submitJson = await submitRes.json();
  assert.strictEqual(submitJson.success, true);

  const scorecard = submitJson.data.scorecard;
  assert.strictEqual(scorecard.attemptedCount, responses.length);
  assert.ok(scorecard.correctCount >= 1, "Must have at least 1 correct");
  assert.ok(scorecard.rawScore >= 2.0, "Raw score for 1 correct must be >= 2.0");
  assert.ok(scorecard.netScore > 0, "Net score must reflect +2.0 minus negative penalty");

  // 5. Duplicate Submission Protection
  const dupSubmitRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      sessionId,
      responses,
    }),
  });
  assert.strictEqual(dupSubmitRes.status, 400, "Duplicate submit must fail with 400");
  const dupJson = await dupSubmitRes.json();
  assert.strictEqual(dupJson.error.code, "ALREADY_SUBMITTED");

  // 6. Cross-User Submission Guard
  const otherUser = await prisma.user.create({
    data: {
      email: `intruder_${Date.now()}@pravaah.in`,
      fullName: "Intruder User",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Create another session belonging to original user
  const session2 = await prisma.testSession.create({
    data: {
      userId: user.id,
      testId: (await prisma.test.findFirst()).id,
      status: "IN_PROGRESS",
    },
  });

  const intruderSubmitRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": otherUser.id,
    },
    body: JSON.stringify({
      sessionId: session2.id,
      responses: [],
    }),
  });
  assert.strictEqual(intruderSubmitRes.status, 403, "Submitting another user's session must be forbidden (403)");

  // Clean up
  await prisma.userResponse.deleteMany({ where: { userId: user.id } });
  await prisma.testSession.deleteMany({ where: { userId: user.id } });
  await prisma.testSession.deleteMany({ where: { id: session2.id } });
  await prisma.reviewSchedule.deleteMany({ where: { userId: user.id } });
  await prisma.studyActivity.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.user.delete({ where: { id: otherUser.id } });
});

test("Day 3 Mock Exam Flow: Smart Mistake Journal & Spaced Revision Scheduling", async () => {
  const email = `mistake_test_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Mistake Journal Aspirant",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const sampleQuestion = await prisma.question.findFirst({
    where: { status: "PUBLISHED" },
  });
  assert.ok(sampleQuestion);

  // 1. Log a root-cause mistake for a question
  const mistakeRes = await fetch(`${BASE_URL}/api/v1/user/mistakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      questionId: sampleQuestion.id,
      mistakeReason: "Concept not clear",
      intervalDays: 3,
      notes: "Need to re-read Laxmikanth chapter on Constitutional Amendments.",
    }),
  });

  assert.strictEqual(mistakeRes.status, 200);
  const mistakeJson = await mistakeRes.json();
  assert.strictEqual(mistakeJson.success, true);
  assert.strictEqual(mistakeJson.data.mistakeReason, "Concept not clear");
  assert.strictEqual(mistakeJson.data.intervalDays, 3);

  // 2. Verify ReviewSchedule exists in database
  const schedule = await prisma.reviewSchedule.findUnique({
    where: {
      userId_questionId: {
        userId: user.id,
        questionId: sampleQuestion.id,
      },
    },
  });
  assert.ok(schedule, "ReviewSchedule must be created");
  assert.strictEqual(schedule.intervalDays, 3);
  assert.strictEqual(schedule.isResolved, false);

  // 3. Query Mistake Analytics endpoint
  const queryRes = await fetch(`${BASE_URL}/api/v1/user/mistakes`, {
    headers: { "x-user-id": user.id },
  });
  assert.strictEqual(queryRes.status, 200);
  const queryJson = await queryRes.json();
  assert.strictEqual(queryJson.success, true);
  assert.strictEqual(queryJson.data.totalMistakes, 1);
  assert.strictEqual(queryJson.data.reasonDistribution["Concept not clear"], 1);

  // 4. Mark question as mastered via revision API
  const resolveRes = await fetch(`${BASE_URL}/api/v1/user/revision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": user.id,
    },
    body: JSON.stringify({
      scheduleId: schedule.id,
      action: "resolve",
    }),
  });
  assert.strictEqual(resolveRes.status, 200);

  // Verify schedule marked resolved in DB
  const resolvedSchedule = await prisma.reviewSchedule.findUnique({
    where: { id: schedule.id },
  });
  assert.strictEqual(resolvedSchedule.isResolved, true);

  // Clean up
  await prisma.userNote.deleteMany({ where: { userId: user.id } });
  await prisma.reviewSchedule.deleteMany({ where: { userId: user.id } });
  await prisma.studyActivity.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
});
