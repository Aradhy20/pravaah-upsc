import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 4.1 Dashboard Integrity: Canonical GS1 vs CSAT separation with zero overlap", async () => {
  // 1. Fetch real existing GS1 and GS2 questions from DB
  const gs1Question = await prisma.question.findFirst({
    where: { paper: { code: "GS1" }, status: "PUBLISHED" },
    include: { paper: true },
  });
  const gs2Question = await prisma.question.findFirst({
    where: { paper: { code: { in: ["GS2", "CSAT"] } }, status: "PUBLISHED" },
    include: { paper: true },
  });

  assert.ok(gs1Question, "Database must have GS1 questions");
  assert.ok(gs2Question, "Database must have GS2/CSAT questions");

  // 2. Create an isolated test user
  const email = `analytics_paper_test_${Date.now()}@pravaah.in`;
  const role = await prisma.role.findFirst({ where: { name: "ASPIRANT" } });
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Paper Integrity Aspirant",
      passwordHash: "test_hash_integrity",
      roleId: role.id,
      profile: {
        create: {
          targetYear: 2027,
          dailyGoalMinutes: 60,
        },
      },
    },
  });

  // 3. Create exactly 3 attempts: 2 for GS1, 1 for GS2
  await prisma.userAttempt.create({
    data: {
      userId: user.id,
      questionId: gs1Question.id,
      selectedOption: "A",
      isCorrect: true,
      timeSpentSeconds: 60,
      mode: "LEARN",
    },
  });
  await prisma.userAttempt.create({
    data: {
      userId: user.id,
      questionId: gs1Question.id,
      selectedOption: "B",
      isCorrect: false,
      timeSpentSeconds: 45,
      mode: "LEARN",
    },
  });
  await prisma.userAttempt.create({
    data: {
      userId: user.id,
      questionId: gs2Question.id,
      selectedOption: "C",
      isCorrect: true,
      timeSpentSeconds: 90,
      mode: "LEARN",
    },
  });

  // 4. Fetch dashboard analytics using real session
  const session = await createAuthenticatedTestSession(user.id);
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: session.headers,
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);

  const { paperBreakdown, summary } = json.data;

  // Strict mutually exclusive classification:
  // GS1 must have exactly 2 attempts
  // CSAT must have exactly 1 attempt
  // Total attempted must be 3
  assert.strictEqual(paperBreakdown.gs1.attempted, 2, "GS1 must count exactly 2 attempts");
  assert.strictEqual(paperBreakdown.gs1.correct, 1, "GS1 has 1 correct attempt");
  assert.strictEqual(paperBreakdown.gs1.incorrect, 1, "GS1 has 1 incorrect attempt");
  assert.strictEqual(paperBreakdown.gs1.accuracy, 50, "GS1 accuracy must be 50%");

  assert.strictEqual(paperBreakdown.csat.attempted, 1, "CSAT must count exactly 1 attempt");
  assert.strictEqual(paperBreakdown.csat.correct, 1, "CSAT has 1 correct attempt");
  assert.strictEqual(paperBreakdown.csat.incorrect, 0, "CSAT has 0 incorrect attempts");
  assert.strictEqual(paperBreakdown.csat.accuracy, 100, "CSAT accuracy must be 100%");

  // Verify zero category overlap: sum of parts equals total
  const categorizedSum = paperBreakdown.gs1.attempted + paperBreakdown.csat.attempted;
  assert.strictEqual(
    categorizedSum,
    summary.totalAttempted,
    "GS1 + CSAT must equal total attempts with zero double counting"
  );
});

test("Day 4.1 Dashboard Integrity: Asia/Kolkata timezone calendar reporting", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { email: "aspirant@pravaah.in" },
  });
  assert.ok(aspirant);

  const session = await createAuthenticatedTestSession(aspirant.id);
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: session.headers,
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();

  const data = json.data;
  assert.strictEqual(data.aspirant.reportingTimezone, "Asia/Kolkata");

  // Verify today date matches Asia/Kolkata format YYYY-MM-DD
  const todayIST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  assert.strictEqual(data.today.date, todayIST, "Dashboard today date must match Asia/Kolkata calendar date");

  // Verify 7-day activity array has 7 chronological days ending with today's date in IST
  assert.strictEqual(data.weekly.activity.length, 7);
  const lastDay = data.weekly.activity[6];
  assert.strictEqual(lastDay.date, todayIST, "Last day in weekly activity must be today in IST");
});

test("Day 4.1 Dashboard Integrity: Practice time metrics are labeled accurately", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { email: "aspirant@pravaah.in" },
  });
  assert.ok(aspirant);

  const session = await createAuthenticatedTestSession(aspirant.id);
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: session.headers,
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  const data = json.data;

  // Verify explicit metric labeling
  assert.ok(data.today.metricLabel.includes("Question Practice"), "Metric must be explicitly labeled as Question Practice Time");
  assert.ok(data.summary.metricScope.includes("practice"), "Summary must clarify metric scope");
  assert.strictEqual(typeof data.today.questionPracticeMinutes, "number");
});
