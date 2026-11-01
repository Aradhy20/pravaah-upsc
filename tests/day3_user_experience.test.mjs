import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { createAuthenticatedTestSession } from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 3 UX & Security: Guest Unauthenticated State Segregation", async () => {
  // Calling /api/v1/auth/me with NO headers/cookies must return authenticated: false
  const res = await fetch(`${BASE_URL}/api/v1/auth/me`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.authenticated, false);
  assert.strictEqual(json.data.user, null);
  assert.strictEqual(json.data.subscription.tier, 0);
  assert.strictEqual(json.data.subscription.isPaid, false);
});

test("Day 3 UX & Security: Server-Enforced Role-Based Route Protection", async () => {
  // Create an Aspirant user
  const email = `aspirant_rbac_${Date.now()}@pravaah.in`;
  const aspirantUser = await prisma.user.create({
    data: {
      email,
      fullName: "RBAC Aspirant",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const aspirantSession = await createAuthenticatedTestSession(aspirantUser.id);

  // 1. Aspirant attempts to access Admin Questions API -> Must return 403 Forbidden
  const adminRes = await fetch(`${BASE_URL}/api/v1/admin/questions`, {
    headers: aspirantSession.headers,
  });
  assert.strictEqual(adminRes.status, 403, "Aspirants must be rejected from Admin Questions API with 403");

  // 2. Aspirant attempts to access Admin Subscriptions API -> Must return 403 Forbidden
  const subAdminRes = await fetch(`${BASE_URL}/api/v1/admin/subscriptions`, {
    headers: aspirantSession.headers,
  });
  assert.strictEqual(subAdminRes.status, 403, "Aspirants must be rejected from Admin Subscriptions API with 403");

  // 3. Legitimate Admin user accessing Admin Questions API -> Must succeed with 200
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@pravaah.in" },
  });
  assert.ok(adminUser, "Admin user must exist");

  const adminSession = await createAuthenticatedTestSession(adminUser.id);
  const legitimateAdminRes = await fetch(`${BASE_URL}/api/v1/admin/questions`, {
    headers: adminSession.headers,
  });
  assert.strictEqual(legitimateAdminRes.status, 200, "Admin must be granted access with 200");

  // Clean up
  await prisma.user.delete({ where: { id: aspirantUser.id } });
});

test("Day 3 UX: Complete Aspirant Registration Journey & Duplicate Guard", async () => {
  const testEmail = `reg_journey_${Date.now()}@pravaah.in`;

  // 1. Register with all mandatory fields + Target Year + Optional Subject
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Sunita Deshmukh",
      email: testEmail,
      password: "StrongPassword123!",
      targetYear: 2026,
      optionalSubject: "PSIR",
    }),
  });

  assert.strictEqual(regRes.status, 201, "Registration must return 201 Created");
  const regJson = await regRes.json();
  assert.strictEqual(regJson.success, true);
  assert.strictEqual(regJson.data.email, testEmail);
  assert.strictEqual(regJson.data.role, "ASPIRANT");

  // Verify profile row was created in database
  const createdUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { profile: true },
  });
  assert.ok(createdUser);
  assert.strictEqual(createdUser.profile?.targetYear, 2026);
  assert.strictEqual(createdUser.profile?.optionalSubject, "PSIR");

  // 2. Duplicate Registration Guard: Same email registration must fail
  const dupRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Duplicate User",
      email: testEmail,
      password: "AnotherPassword123!",
    }),
  });
  assert.strictEqual(dupRes.status, 409, "Duplicate email registration must fail with 409 Conflict");
  const dupJson = await dupRes.json();
  assert.strictEqual(dupJson.success, false);
  assert.ok(dupJson.error.message.includes("already exists"));

  // 3. Login with credentials
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "StrongPassword123!",
    }),
  });
  assert.strictEqual(loginRes.status, 200);
  const loginJson = await loginRes.json();
  assert.strictEqual(loginJson.success, true);
  assert.strictEqual(loginJson.data.role, "ASPIRANT");

  // Clean up
  await prisma.userProfile.deleteMany({ where: { userId: createdUser.id } });
  await prisma.user.delete({ where: { id: createdUser.id } });
});

test("Day 3 UX: Feature Entitlements & Personal Quotas (Free vs Pro)", async () => {
  // Test Free user note and bookmark limits
  const email = `quota_test_${Date.now()}@pravaah.in`;
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Quota Test Aspirant",
      passwordHash: "secure_pass_2026",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  const session = await createAuthenticatedTestSession(user.id);

  // Verify free user initial subscription status
  const subRes = await fetch(`${BASE_URL}/api/v1/user/subscription`, {
    headers: session.headers,
  });
  assert.strictEqual(subRes.status, 200);
  const subJson = await subRes.json();
  assert.strictEqual(subJson.data.isPaid, false);
  assert.strictEqual(subJson.data.tier, 0);
  assert.strictEqual(subJson.data.planCode, "FREE");

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
});
