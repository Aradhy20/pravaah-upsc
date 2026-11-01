import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 4 Dashboard: Aspirant Analytics API Returns Complete Telemetry", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { email: "aspirant@pravaah.in" },
  });
  assert.ok(aspirant, "Demo aspirant user must exist");

  const session = await createAuthenticatedTestSession(aspirant.id);
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: session.headers,
  });
  assert.strictEqual(res.status, 200, "Dashboard analytics must return 200 OK");
  const json = await res.json();
  assert.strictEqual(json.success, true);

  const data = json.data;
  assert.ok(data.aspirant, "Must include aspirant details");
  assert.strictEqual(typeof data.aspirant.fullName, "string");
  assert.strictEqual(typeof data.aspirant.targetYear, "number");
  assert.strictEqual(typeof data.aspirant.dailyGoalMinutes, "number");
  assert.strictEqual(typeof data.aspirant.preparationStage, "string");

  assert.ok(data.today, "Must include today's metrics");
  assert.strictEqual(typeof data.today.studyMinutes, "number");
  assert.strictEqual(typeof data.today.goalMinutes, "number");
  assert.strictEqual(typeof data.today.completionPercent, "number");

  assert.ok(data.weekly, "Must include weekly metrics");
  assert.strictEqual(Array.isArray(data.weekly.activity), true);
  assert.strictEqual(data.weekly.activity.length, 7, "Weekly activity must span 7 days");

  assert.ok(data.coverage, "Must include syllabus coverage metrics");
  assert.ok(data.coverage.totalPublishedQuestions > 0, "Must count published questions");
  assert.strictEqual(typeof data.coverage.uniqueAttempted, "number");
  assert.strictEqual(typeof data.coverage.remaining, "number");

  assert.ok(data.summary, "Must include overall summary");
  assert.strictEqual(typeof data.summary.totalAttempted, "number");
  assert.strictEqual(typeof data.summary.overallAccuracy, "number");
  assert.strictEqual(typeof data.summary.totalStudyHours, "number");

  assert.ok(data.paperBreakdown, "Must include GS1 vs CSAT paper breakdown");
  assert.ok(data.paperBreakdown.gs1, "Must have GS1 breakdown");
  assert.ok(data.paperBreakdown.csat, "Must have CSAT breakdown");
});

test("Day 4 Dashboard: Graceful Zero-Data Empty State for New User", async () => {
  const newEmail = `new_aspirant_${Date.now()}@pravaah.in`;
  const newUser = await prisma.user.create({
    data: {
      email: newEmail,
      fullName: "Fresh Aspirant",
      passwordHash: "secure_pass_day4",
      role: { connect: { name: "ASPIRANT" } },
      profile: {
        create: {
          targetYear: 2027,
          dailyGoalMinutes: 60,
        },
      },
    },
  });

  const session = await createAuthenticatedTestSession(newUser.id);
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: session.headers,
  });
  assert.strictEqual(res.status, 200, "Dashboard must return 200 OK for new user without error");
  const json = await res.json();
  assert.strictEqual(json.success, true);

  const data = json.data;
  assert.strictEqual(data.summary.totalAttempted, 0, "Total attempts must be 0");
  assert.strictEqual(data.summary.overallAccuracy, 0, "Accuracy must be 0%");
  assert.strictEqual(data.summary.totalStudyHours, 0, "Study hours must be 0");
  assert.strictEqual(data.coverage.uniqueAttempted, 0, "Unique attempted must be 0");
  assert.strictEqual(data.today.studyMinutes, 0, "Today study minutes must be 0");
  assert.strictEqual(data.weekly.activity.length, 7, "7-day activity array must exist with 0 counts");

  // Clean up
  await prisma.user.delete({ where: { id: newUser.id } });
});

test("Day 4 Profile API: GET and PATCH User Target Preferences", async () => {
  const testEmail = `profile_test_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      fullName: "Target Aspirant",
      passwordHash: "secure_day4_target",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // 1. GET profile
  const getRes = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: session.headers,
  });
  assert.strictEqual(getRes.status, 200);
  const getJson = await getRes.json();
  assert.strictEqual(getJson.success, true);
  assert.strictEqual(getJson.data.profile.targetYear, 2027);

  // 2. PATCH profile: Update targetYear to 2026, dailyGoalMinutes to 90, optionalSubject
  const patchRes = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...session.headers,
    },
    body: JSON.stringify({
      targetYear: 2026,
      dailyGoalMinutes: 90,
      optionalSubject: "Sociology",
    }),
  });
  assert.strictEqual(patchRes.status, 200);
  const patchJson = await patchRes.json();
  assert.strictEqual(patchJson.success, true);
  assert.strictEqual(patchJson.data.profile.targetYear, 2026);
  assert.strictEqual(patchJson.data.profile.dailyGoalMinutes, 90);
  assert.strictEqual(patchJson.data.profile.optionalSubject, "Sociology");

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
});

test("Day 4 Study Goals: Full CRUD Lifecycle & Cross-User Security Isolation", async () => {
  const userA = await prisma.user.create({
    data: {
      email: `user_a_goals_${Date.now()}@pravaah.in`,
      fullName: "User A Goals",
      passwordHash: "secure_pass_goals_a",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `user_b_goals_${Date.now()}@pravaah.in`,
      fullName: "User B Goals",
      passwordHash: "secure_pass_goals_b",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const sessionA = await createAuthenticatedTestSession(userA.id);
  const sessionB = await createAuthenticatedTestSession(userB.id);

  // 1. User A creates a study task
  const createRes = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionA.headers,
    },
    body: JSON.stringify({
      title: "Fundamental Rights Articles 19-22",
      subject: "Polity & Governance",
      targetHours: 3.5,
      targetDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    }),
  });
  assert.strictEqual(createRes.status, 201, "Goal creation must return 201 Created");
  const createJson = await createRes.json();
  assert.strictEqual(createJson.success, true);
  const goalId = createJson.data.id;
  assert.ok(goalId);

  // 2. User A fetches goals -> must contain the created goal
  const listRes = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    headers: sessionA.headers,
  });
  assert.strictEqual(listRes.status, 200);
  const listJson = await listRes.json();
  assert.strictEqual(listJson.success, true);
  const found = listJson.data.find((g) => g.id === goalId);
  assert.ok(found, "Created goal must be present in User A's goals");
  assert.strictEqual(found.isAchieved, false);

  // 3. User B fetches goals -> User A's goal MUST NOT be present
  const listBRes = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    headers: sessionB.headers,
  });
  assert.strictEqual(listBRes.status, 200);
  const listBJson = await listBRes.json();
  assert.strictEqual(
    listBJson.data.some((g) => g.id === goalId),
    false,
    "User B must not see User A's study goals (Strict Tenant Isolation)"
  );

  // 4. Cross-user modification attack: User B attempts to mark User A's goal as complete -> Must fail
  const attackPatchRes = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...sessionB.headers,
    },
    body: JSON.stringify({
      id: goalId,
      isAchieved: true,
    }),
  });
  assert.strictEqual(
    attackPatchRes.status,
    404,
    "Cross-user goal modification must be rejected with 404 Not Found"
  );

  // 5. User A marks goal complete -> Must succeed
  const patchRes = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...sessionA.headers,
    },
    body: JSON.stringify({
      id: goalId,
      isAchieved: true,
    }),
  });
  assert.strictEqual(patchRes.status, 200);
  const patchJson = await patchRes.json();
  assert.strictEqual(patchJson.success, true);
  assert.strictEqual(patchJson.data.isAchieved, true);

  // 6. Cross-user deletion attack: User B attempts to delete User A's goal -> Must fail
  const attackDeleteRes = await fetch(`${BASE_URL}/api/v1/user/goals?id=${goalId}`, {
    method: "DELETE",
    headers: sessionB.headers,
  });
  assert.strictEqual(
    attackDeleteRes.status,
    404,
    "Cross-user goal deletion must be rejected with 404 Not Found"
  );

  // 7. User A deletes goal -> Must succeed
  const deleteRes = await fetch(`${BASE_URL}/api/v1/user/goals?id=${goalId}`, {
    method: "DELETE",
    headers: sessionA.headers,
  });
  assert.strictEqual(deleteRes.status, 200);

  // Clean up
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
});

test("Day 4 Notes: CRUD & Strict Cross-User Isolation", async () => {
  const userA = await prisma.user.create({
    data: {
      email: `user_a_notes_${Date.now()}@pravaah.in`,
      fullName: "User A Notes",
      passwordHash: "secure_pass_notes_a",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `user_b_notes_${Date.now()}@pravaah.in`,
      fullName: "User B Notes",
      passwordHash: "secure_pass_notes_b",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const sessionA = await createAuthenticatedTestSession(userA.id);
  const sessionB = await createAuthenticatedTestSession(userB.id);

  // Pick a published question
  const question = await prisma.question.findFirst({
    where: { status: "PUBLISHED" },
  });
  assert.ok(question, "Question must exist");

  // 1. User A creates a note
  const createRes = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionA.headers,
    },
    body: JSON.stringify({
      questionId: question.id,
      content: "Important Article 356 rule: S.R. Bommai guidelines apply.",
    }),
  });
  assert.strictEqual(createRes.status, 200);
  const createJson = await createRes.json();
  assert.strictEqual(createJson.success, true);
  const noteId = createJson.data.id;

  // 2. User B lists notes -> User A's note MUST NOT be visible
  const listBRes = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    headers: sessionB.headers,
  });
  assert.strictEqual(listBRes.status, 200);
  const listBJson = await listBRes.json();
  assert.strictEqual(
    listBJson.data.some((n) => n.id === noteId),
    false,
    "User B must not see User A's private notes"
  );

  // 3. User B attempts to DELETE User A's note -> Must fail with 404
  const attackDeleteRes = await fetch(`${BASE_URL}/api/v1/user/notes?id=${noteId}`, {
    method: "DELETE",
    headers: sessionB.headers,
  });
  assert.strictEqual(attackDeleteRes.status, 404, "Cross-user note delete must return 404");

  // 4. User A deletes note by id -> Must succeed
  const deleteRes = await fetch(`${BASE_URL}/api/v1/user/notes?id=${noteId}`, {
    method: "DELETE",
    headers: sessionA.headers,
  });
  assert.strictEqual(deleteRes.status, 200);

  // Clean up
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
});

test("Day 4 Bookmarks: Tenant Isolation & Toggle", async () => {
  const userA = await prisma.user.create({
    data: {
      email: `user_a_bm_${Date.now()}@pravaah.in`,
      fullName: "User A Bookmarks",
      passwordHash: "secure_pass_bm_a",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `user_b_bm_${Date.now()}@pravaah.in`,
      fullName: "User B Bookmarks",
      passwordHash: "secure_pass_bm_b",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const sessionA = await createAuthenticatedTestSession(userA.id);
  const sessionB = await createAuthenticatedTestSession(userB.id);

  const question = await prisma.question.findFirst({
    where: { status: "PUBLISHED" },
  });
  assert.ok(question);

  // 1. User A bookmarks question
  const bmRes = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionA.headers,
    },
    body: JSON.stringify({ questionId: question.id }),
  });
  assert.strictEqual(bmRes.status, 200);
  const bmJson = await bmRes.json();
  assert.strictEqual(bmJson.data.bookmarked, true);

  // 2. User B lists bookmarks -> Must be empty
  const listB = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    headers: sessionB.headers,
  });
  const listBJson = await listB.json();
  assert.strictEqual(
    listBJson.data.some((b) => b.question.id === question.id),
    false,
    "User B must not see User A's bookmarks"
  );

  // 3. User A unbookmarks
  const unbmRes = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...sessionA.headers,
    },
    body: JSON.stringify({ questionId: question.id }),
  });
  assert.strictEqual(unbmRes.status, 200);
  const unbmJson = await unbmRes.json();
  assert.strictEqual(unbmJson.data.bookmarked, false);

  // Clean up
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
});
