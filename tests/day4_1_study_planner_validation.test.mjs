import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 4.1 Study Planner: Subject is persisted in database and returned in API responses", async () => {
  const email = `subject_persistence_${Date.now()}@pravaah.in`;
  const role = await prisma.role.findFirst({ where: { name: "ASPIRANT" } });
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Planner Subject Aspirant",
      passwordHash: "secure_pass_123",
      roleId: role.id,
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // 1. Create goal with recognized UPSC subject
  const resCreate = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({
      title: "Master Fundamental Rights Articles 12-35",
      subject: "Polity & Governance",
      targetHours: 3.5,
      targetDate: "2026-11-15T00:00:00.000Z",
    }),
  });

  assert.strictEqual(resCreate.status, 201);
  const jsonCreate = await resCreate.json();
  assert.strictEqual(jsonCreate.success, true);
  assert.strictEqual(jsonCreate.data.subject, "Polity & Governance");
  const goalId = jsonCreate.data.id;

  // 2. Verify persistence directly in database
  const dbGoal = await prisma.studyGoal.findUnique({ where: { id: goalId } });
  assert.ok(dbGoal);
  assert.strictEqual(dbGoal.subject, "Polity & Governance");

  // 3. Verify GET /api/v1/user/goals returns subject
  const resGet = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    headers: session.headers,
  });
  assert.strictEqual(resGet.status, 200);
  const jsonGet = await resGet.json();
  const fetched = jsonGet.data.find((g) => g.id === goalId);
  assert.ok(fetched);
  assert.strictEqual(fetched.subject, "Polity & Governance");

  // 4. Update subject via PATCH
  const resPatch = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({
      id: goalId,
      subject: "Economy & Social Development",
    }),
  });
  assert.strictEqual(resPatch.status, 200);
  const jsonPatch = await resPatch.json();
  assert.strictEqual(jsonPatch.data.subject, "Economy & Social Development");

  // 5. Query goals filtered by subject
  const resFilter = await fetch(
    `${BASE_URL}/api/v1/user/goals?subject=${encodeURIComponent("Economy & Social Development")}`,
    {
      headers: session.headers,
    }
  );
  assert.strictEqual(resFilter.status, 200);
  const jsonFilter = await resFilter.json();
  assert.ok(jsonFilter.data.length >= 1);
  assert.ok(jsonFilter.data.every((g) => g.subject === "Economy & Social Development"));
});

test("Day 4.1 Input Validation: Study Goal API rejects invalid titles, hours, dates and subjects (HTTP 400)", async () => {
  const user = await prisma.user.findFirst({ where: { role: { name: "ASPIRANT" } } });
  const session = await createAuthenticatedTestSession(user.id);

  // 1. Title too short (< 3 chars)
  const resShortTitle = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ title: "hi", targetHours: 2 }),
  });
  assert.strictEqual(resShortTitle.status, 400);
  const jsonShort = await resShortTitle.json();
  assert.strictEqual(jsonShort.error.code, "INVALID_TITLE");

  // 2. Title empty or whitespace
  const resEmptyTitle = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ title: "   ", targetHours: 2 }),
  });
  assert.strictEqual(resEmptyTitle.status, 400);

  // 3. Target hours invalid (< 0.5, > 100, NaN)
  const invalidHours = [-5, 0, 150, "abc"];
  for (const h of invalidHours) {
    const resHours = await fetch(`${BASE_URL}/api/v1/user/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...session.headers },
      body: JSON.stringify({ title: "Valid Title Here", targetHours: h }),
    });
    assert.strictEqual(resHours.status, 400, `Hours ${h} should be rejected with 400`);
    const jsonHours = await resHours.json();
    assert.strictEqual(jsonHours.error.code, "INVALID_TARGET_HOURS");
  }

  // 4. Invalid date format
  const resBadDate = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ title: "Valid Title Here", targetDate: "not-a-valid-date" }),
  });
  assert.strictEqual(resBadDate.status, 400);
  const jsonBadDate = await resBadDate.json();
  assert.strictEqual(jsonBadDate.error.code, "INVALID_TARGET_DATE");

  // 5. Invalid UPSC subject name
  const resBadSubj = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ title: "Valid Title Here", subject: "Quantum Computing Advanced" }),
  });
  assert.strictEqual(resBadSubj.status, 400);
  const jsonBadSubj = await resBadSubj.json();
  assert.strictEqual(jsonBadSubj.error.code, "INVALID_SUBJECT");
});

test("Day 4.1 Input Validation: User Profile API strictly validates target year and daily study minutes", async () => {
  const user = await prisma.user.findFirst({ where: { role: { name: "ASPIRANT" } } });
  const session = await createAuthenticatedTestSession(user.id);

  // 1. Obsolete target year (< 2026) rejected
  const obsoleteYears = [2025, 2024, 2020, 1999];
  for (const yr of obsoleteYears) {
    const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...session.headers },
      body: JSON.stringify({ targetYear: yr }),
    });
    assert.strictEqual(res.status, 400, `Obsolete targetYear ${yr} must return 400`);
    const json = await res.json();
    assert.strictEqual(json.error.code, "INVALID_TARGET_YEAR");
  }

  // 2. Valid target year (>= 2026) accepted
  const resValidYear = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ targetYear: 2027 }),
  });
  assert.strictEqual(resValidYear.status, 200);

  // 3. Daily study minutes validation (15 - 720)
  const invalidMinutes = [-10, 0, 5, 800, 1440, "many"];
  for (const m of invalidMinutes) {
    const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...session.headers },
      body: JSON.stringify({ dailyGoalMinutes: m }),
    });
    assert.strictEqual(res.status, 400, `Minutes ${m} must return 400`);
    const json = await res.json();
    assert.strictEqual(json.error.code, "INVALID_DAILY_MINUTES");
  }

  // 4. Valid daily minutes accepted
  const resValidMins = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...session.headers },
    body: JSON.stringify({ dailyGoalMinutes: 90 }),
  });
  assert.strictEqual(resValidMins.status, 200);
});
