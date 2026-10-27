import { test } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Security & Auth: User Registration, Authentication & Password Hashing", async () => {
  const uniqueEmail = `test_aspirant_${Date.now()}@pravaah.in`;
  const plainPassword = "SecurePassword123!";

  // 1. Register new user
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: plainPassword,
      fullName: "Test Aspirant A",
      targetYear: 2027,
      optionalSubject: "PSIR",
    }),
  });

  const regJson = await regRes.json();
  assert.equal(regRes.status, 201, "Registration should return 201 Created");
  assert.equal(regJson.success, true);
  assert.equal(regJson.data.email, uniqueEmail);
  assert.equal(regJson.data.role, "ASPIRANT");

  // 2. Reject duplicate registration
  const dupRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: plainPassword,
      fullName: "Duplicate User",
    }),
  });
  assert.equal(dupRes.status, 409, "Duplicate email registration must return 409 Conflict");

  // 3. Login with correct password
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: plainPassword,
    }),
  });
  const loginJson = await loginRes.json();
  assert.equal(loginRes.status, 200, "Login should return 200 OK");
  assert.equal(loginJson.success, true);
  assert.equal(loginJson.data.id, regJson.data.id);

  // 4. Reject invalid password
  const badLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: uniqueEmail,
      password: "WrongPassword999!",
    }),
  });
  assert.equal(badLogin.status, 401, "Invalid password must return 401 Unauthorized");
});

test("Security & Auth: Cross-User Data Isolation (Bookmarks & Notes)", async () => {
  // Create two distinct users in DB
  const userA = await prisma.user.create({
    data: {
      email: `isolated_user_a_${Date.now()}@pravaah.in`,
      fullName: "Isolated User A",
      passwordHash: "hash_a",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `isolated_user_b_${Date.now()}@pravaah.in`,
      fullName: "Isolated User B",
      passwordHash: "hash_b",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const questions = await prisma.question.findMany({ take: 2 });
  assert.ok(questions.length >= 2, "Need at least 2 questions for isolation testing");

  // User A bookmarks Question 1 and creates Note 1
  const noteContentA = `Private research note for User A ${Date.now()}`;
  await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userA.id },
    body: JSON.stringify({ questionId: questions[0].id }),
  });

  await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userA.id },
    body: JSON.stringify({ questionId: questions[0].id, content: noteContentA }),
  });

  // User B bookmarks Question 2 and creates Note 2
  const noteContentB = `Private research note for User B ${Date.now()}`;
  await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userB.id },
    body: JSON.stringify({ questionId: questions[1].id }),
  });

  await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userB.id },
    body: JSON.stringify({ questionId: questions[1].id, content: noteContentB }),
  });

  // 1. Fetch User A bookmarks -> Must contain Question 0, but NOT Question 1
  const resBookmarksA = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    headers: { "x-user-id": userA.id },
  });
  const jsonBookmarksA = await resBookmarksA.json();
  const bookmarkedIdsA = jsonBookmarksA.data.map((b) => b.question.id);
  assert.ok(bookmarkedIdsA.includes(questions[0].id), "User A must see their own bookmark");
  assert.ok(!bookmarkedIdsA.includes(questions[1].id), "User A must NOT see User B's bookmark");

  // 2. Fetch User B bookmarks -> Must contain Question 1, but NOT Question 0
  const resBookmarksB = await fetch(`${BASE_URL}/api/v1/user/bookmarks`, {
    headers: { "x-user-id": userB.id },
  });
  const jsonBookmarksB = await resBookmarksB.json();
  const bookmarkedIdsB = jsonBookmarksB.data.map((b) => b.question.id);
  assert.ok(bookmarkedIdsB.includes(questions[1].id), "User B must see their own bookmark");
  assert.ok(!bookmarkedIdsB.includes(questions[0].id), "User B must NOT see User A's bookmark");

  // 3. Fetch User A notes -> Must contain noteContentA, never noteContentB
  const resNotesA = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    headers: { "x-user-id": userA.id },
  });
  const jsonNotesA = await resNotesA.json();
  const contentsA = jsonNotesA.data.map((n) => n.content);
  assert.ok(contentsA.includes(noteContentA), "User A must see their own note");
  assert.ok(!contentsA.includes(noteContentB), "User A must NOT see User B's private note");

  // 4. Fetch User B notes -> Must contain noteContentB, never noteContentA
  const resNotesB = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    headers: { "x-user-id": userB.id },
  });
  const jsonNotesB = await resNotesB.json();
  const contentsB = jsonNotesB.data.map((n) => n.content);
  assert.ok(contentsB.includes(noteContentB), "User B must see their own note");
  assert.ok(!contentsB.includes(noteContentA), "User B must NOT see User A's private note");
});

test("Security & Auth: Role-Based Authorization Enforcement (RBAC)", async () => {
  // 1. Get an aspirant user and an admin user
  const aspirant = await prisma.user.findFirst({
    where: { role: { name: "ASPIRANT" } },
  });
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });

  assert.ok(aspirant && admin, "Both aspirant and admin fixtures must exist");

  // 2. Aspirant calling admin endpoints must receive 403 Forbidden
  const forbiddenRoutes = [
    { url: `${BASE_URL}/api/v1/admin/plans`, method: "GET" },
    { url: `${BASE_URL}/api/v1/admin/subscriptions`, method: "GET" },
    { url: `${BASE_URL}/api/v1/admin/questions`, method: "GET" },
    { url: `${BASE_URL}/api/v1/admin/coverage`, method: "GET" },
  ];

  for (const route of forbiddenRoutes) {
    const res = await fetch(route.url, {
      method: route.method,
      headers: { "x-user-id": aspirant.id },
    });
    assert.equal(
      res.status,
      403,
      `Aspirant accessing ${route.url} must receive HTTP 403 Forbidden`
    );
    const json = await res.json();
    assert.equal(json.success, false);
    assert.ok(json.error.message.includes("Admin"), "Error must state admin privileges required");
  }

  // 3. Admin calling the same routes must receive 200 OK
  const adminRes = await fetch(`${BASE_URL}/api/v1/admin/plans`, {
    headers: { "x-user-id": admin.id },
  });
  assert.equal(adminRes.status, 200, "Admin must be authorized with 200 OK");
  const adminJson = await adminRes.json();
  assert.equal(adminJson.success, true);
});

test("Security & Anti-Leak: Answer Key Protection and Cross-User Session Submission Guard", async () => {
  // 1. Set up an Achiever user to start a timed exam
  const achieverPlan = await prisma.plan.findUnique({ where: { code: "ACHIEVER" } });
  const studentA = await prisma.user.create({
    data: {
      email: `exam_student_a_${Date.now()}@pravaah.in`,
      fullName: "Exam Student A",
      passwordHash: "hash_exam",
      role: { connect: { name: "ASPIRANT" } },
      subscriptions: {
        create: {
          planId: achieverPlan.id,
          status: "ACTIVE",
          billingInterval: "ANNUAL",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
        },
      },
    },
  });

  const studentB = await prisma.user.create({
    data: {
      email: `exam_student_b_${Date.now()}@pravaah.in`,
      fullName: "Exam Student B",
      passwordHash: "hash_exam_b",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // 2. Start timed session as studentA
  const startRes = await fetch(`${BASE_URL}/api/v1/tests/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": studentA.id },
    body: JSON.stringify({ paperCode: "GS1", year: 2024 }),
  });

  const startJson = await startRes.json();
  assert.equal(startRes.status, 200);
  assert.ok(startJson.data.sessionId);

  // VERIFY ANTI-LEAK: Check that answers and explanations are strictly absent
  for (const q of startJson.data.questions) {
    assert.equal(q.correctOption, undefined, "correctOption must NEVER be sent during exam session");
    assert.equal(q.explanation, undefined, "explanation must NEVER be sent during exam session");
    for (const opt of q.options) {
      assert.equal(opt.isCorrect, undefined, "option.isCorrect must NEVER be sent during exam session");
    }
  }

  // 3. Student B attempts to submit Student A's test session -> Must return 403 Forbidden!
  const tamperRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": studentB.id },
    body: JSON.stringify({
      sessionId: startJson.data.sessionId,
      responses: [],
    }),
  });

  assert.equal(
    tamperRes.status,
    403,
    "Cross-user session tampering must return HTTP 403 Forbidden"
  );
  const tamperJson = await tamperRes.json();
  assert.equal(tamperJson.error.code, "FORBIDDEN_SESSION_MISMATCH");

  // 4. Student A submits their own session -> Must succeed
  const submitRes = await fetch(`${BASE_URL}/api/v1/tests/session/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": studentA.id },
    body: JSON.stringify({
      sessionId: startJson.data.sessionId,
      responses: [
        { questionId: startJson.data.questions[0].id, selectedOption: "C", timeSpent: 35 },
      ],
      totalTimeSpentSeconds: 120,
    }),
  });

  assert.equal(submitRes.status, 200, "Student A submitting own session must succeed with 200 OK");
  const submitJson = await submitRes.json();
  assert.equal(submitJson.success, true);
  assert.ok(submitJson.data.scorecard.netScore !== undefined);
  assert.ok(submitJson.data.detailedResults[0].explanation !== undefined, "Explanations unlocked upon submission");
});

test("Content Ingestion: Batch Import with CSV & Duplicate Prevention", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });

  const uniqueQNum = 8880 + Math.floor(Math.random() * 1000);
  const csvContent = `questionNumber,questionText,optionA,optionB,optionC,optionD,correctOption,explanationSummary,difficulty
${uniqueQNum},"With reference to Indian history, who founded the Servants of India Society?","Gopal Krishna Gokhale","Bal Gangadhar Tilak","Lala Lajpat Rai","Bipin Chandra Pal","A","Founded in 1905 by Gopal Krishna Gokhale in Pune.","EASY"`;

  // 1. Import via CSV
  const importRes = await fetch(`${BASE_URL}/api/v1/admin/import/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": admin.id },
    body: JSON.stringify({
      paperCode: "GS1",
      year: 2024,
      csvData: csvContent,
    }),
  });

  const importJson = await importRes.json();
  assert.equal(importRes.status, 200);
  assert.equal(importJson.data.importedCount, 1);
  assert.equal(importJson.data.duplicateCount, 0);

  // 2. Re-import identical CSV -> Duplicate count must be 1, importedCount 0
  const reImportRes = await fetch(`${BASE_URL}/api/v1/admin/import/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": admin.id },
    body: JSON.stringify({
      paperCode: "GS1",
      year: 2024,
      csvData: csvContent,
    }),
  });

  const reImportJson = await reImportRes.json();
  assert.equal(reImportJson.data.duplicateCount, 1, "Duplicate question must be detected");
  assert.equal(reImportJson.data.importedCount, 0, "Duplicate question must not be re-imported");
});
