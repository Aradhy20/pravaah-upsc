import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession, hashPassword } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

test("Scenario 1: Guest requests analytics API -> 401 Unauthorized", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  assert.equal(res.status, 401, "Unauthenticated guest must receive HTTP 401 Unauthorized");
  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.error.code, "UNAUTHORIZED");
  assert.equal(json.data, undefined, "No student data or metrics must be exposed to guest");
});

test("Scenario 2: Authenticated learner requests own dashboard -> 200 OK", async () => {
  const learner = await prisma.user.create({
    data: {
      email: `test_learner_dash_${Date.now()}@pravaah.in`,
      fullName: "Dashboard Synthetic Learner",
      passwordHash: hashPassword("LearnerPass123!"),
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(learner.id);

  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: session.headers,
  });

  assert.equal(res.status, 200, "Authenticated learner must receive HTTP 200 OK");
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data);
  assert.equal(typeof json.data.summary.totalAttempted, "number");
  assert.equal(typeof json.data.recentSessions, "object");
});

test("Scenario 3: Learner A vs Learner B cross-user data isolation -> Denied / Isolated", async () => {
  const learnerA = await prisma.user.create({
    data: {
      email: `synth_isolation_a_${Date.now()}@pravaah.in`,
      fullName: "Learner A",
      passwordHash: hashPassword("PassA123!"),
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const learnerB = await prisma.user.create({
    data: {
      email: `synth_isolation_b_${Date.now()}@pravaah.in`,
      fullName: "Learner B",
      passwordHash: hashPassword("PassB123!"),
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const sessionA = await createAuthenticatedTestSession(learnerA.id);
  const sessionB = await createAuthenticatedTestSession(learnerB.id);

  const question = await prisma.question.findFirst();
  assert.ok(question, "Question fixture required");

  // Learner A creates a private note
  const privateContentA = `Learner A private note secret: ${Date.now()}`;
  await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...sessionA.headers },
    body: JSON.stringify({ questionId: question.id, content: privateContentA }),
  });

  // Learner B fetches notes -> must NOT see Learner A's private note
  const resB = await fetch(`${BASE_URL}/api/v1/user/notes`, {
    method: "GET",
    headers: sessionB.headers,
  });
  const jsonB = await resB.json();
  assert.equal(jsonB.success, true);
  const notesB = jsonB.data.map((n) => n.content);
  assert.ok(!notesB.includes(privateContentA), "Learner B must never see Learner A private notes");
});

test("Scenario 4: Expired session token -> 401 Unauthorized", async () => {
  const learner = await prisma.user.create({
    data: {
      email: `synth_expired_${Date.now()}@pravaah.in`,
      fullName: "Expired Session User",
      passwordHash: hashPassword("ExpiredPass123!"),
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const expiredToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
  // Set expiration in past
  await prisma.session.create({
    data: {
      userId: learner.id,
      tokenHash,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: {
      Cookie: `pravaah_session_token=${expiredToken}`,
      Authorization: `Bearer ${expiredToken}`,
    },
  });

  assert.equal(res.status, 401, "Expired session token must be rejected with HTTP 401");
  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.error.code, "UNAUTHORIZED");
});

test("Scenario 5: Invalid session token -> 401 Unauthorized", async () => {
  const forgedToken = crypto.randomBytes(32).toString("hex");

  const res = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: {
      Cookie: `pravaah_session_token=${forgedToken}`,
      Authorization: `Bearer ${forgedToken}`,
    },
  });

  assert.equal(res.status, 401, "Forged session token must be rejected with HTTP 401");
  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.error.code, "UNAUTHORIZED");
});

test("Scenario 6: Spoofed x-user-id header or raw user ID Bearer -> Rejected & Denied", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });
  assert.ok(admin, "Admin fixture required");

  // Attempt 1: Spoofed x-user-id header targeting Admin ID without valid session
  const spoofRes = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: {
      "x-user-id": admin.id,
    },
  });
  assert.equal(spoofRes.status, 401, "Spoofed x-user-id must be ignored and rejected with 401");

  // Attempt 2: Spoofed x-user-id targeting admin on admin endpoint
  const spoofAdminRes = await fetch(`${BASE_URL}/api/v1/admin/plans`, {
    method: "GET",
    headers: {
      "x-user-id": admin.id,
    },
  });
  assert.equal(spoofAdminRes.status, 401, "Spoofed x-user-id on admin endpoint must be rejected with 401");

  // Attempt 3: Raw userId passed as Bearer token instead of 64-char cryptographic session token
  const rawBearerRes = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${admin.id}`,
    },
  });
  assert.equal(rawBearerRes.status, 401, "Raw user ID Bearer must be rejected with 401");
});

test("Scenario 7: Ordinary learner requests admin API -> 403 Forbidden", async () => {
  const learner = await prisma.user.create({
    data: {
      email: `synth_learner_rbac_${Date.now()}@pravaah.in`,
      fullName: "RBAC Learner",
      passwordHash: hashPassword("LearnerPass123!"),
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(learner.id);

  const adminRoutes = [
    `${BASE_URL}/api/v1/admin/plans`,
    `${BASE_URL}/api/v1/admin/coverage`,
    `${BASE_URL}/api/v1/admin/subscriptions`,
    `${BASE_URL}/api/v1/admin/questions`,
  ];

  for (const url of adminRoutes) {
    const res = await fetch(url, {
      method: "GET",
      headers: session.headers,
    });
    assert.equal(res.status, 403, `Learner accessing ${url} must receive HTTP 403 Forbidden`);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "FORBIDDEN");
  }
});

test("Scenario 8: Authorized admin requests permitted admin API -> 200 OK", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });
  assert.ok(admin, "Admin fixture required");

  const session = await createAuthenticatedTestSession(admin.id);

  const res = await fetch(`${BASE_URL}/api/v1/admin/plans`, {
    method: "GET",
    headers: session.headers,
  });

  assert.equal(res.status, 200, "Admin must receive HTTP 200 OK on admin routes");
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
});

test("Scenario 9: Existing login, session establishment, auth me, and logout workflows -> Preserved", async () => {
  const testEmail = `synth_lifecycle_${Date.now()}@pravaah.in`;
  const plainPassword = "SecureLifecycle123!";

  // 1. Register user
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: plainPassword,
      fullName: "Lifecycle Student",
    }),
  });
  assert.equal(regRes.status, 201);
  const regJson = await regRes.json();
  assert.equal(regJson.success, true);
  const sessionToken = regJson.data.sessionToken;
  assert.ok(sessionToken, "Registration must return sessionToken");

  // 2. Validate session via /api/v1/auth/me
  const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  assert.equal(meRes.status, 200);
  const meJson = await meRes.json();
  assert.equal(meJson.data.authenticated, true);
  assert.equal(meJson.data.user.email, testEmail);

  // 3. Login with password -> returns fresh session
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: plainPassword,
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginJson = await loginRes.json();
  assert.equal(loginJson.success, true);
  const loginToken = loginJson.data.sessionToken;
  assert.ok(loginToken);

  // 4. Logout using the loginToken
  const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${loginToken}`,
      Cookie: `pravaah_session_token=${loginToken}`,
    },
  });
  assert.equal(logoutRes.status, 200);

  // 5. Verify token is revoked and unusable
  const afterLogoutRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${loginToken}`,
      Cookie: `pravaah_session_token=${loginToken}`,
    },
  });
  const afterLogoutJson = await afterLogoutRes.json();
  assert.equal(afterLogoutJson.data.authenticated, false, "Revoked session must be unauthenticated");
});

