import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  createAuthenticatedTestSession,
} from "./test_auth_helper.mjs";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

test("Day 4.1 Security: Guest request to protected API fails closed with HTTP 401", async () => {
  const protectedEndpoints = [
    "/api/v1/analytics/dashboard",
    "/api/v1/user/goals",
    "/api/v1/user/profile",
    "/api/v1/user/notes",
    "/api/v1/user/bookmarks",
    "/api/v1/user/revision",
    "/api/v1/user/subscription",
  ];

  for (const endpoint of protectedEndpoints) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    assert.strictEqual(
      res.status,
      401,
      `Expected HTTP 401 for unauthenticated request to ${endpoint}, got ${res.status}`
    );
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, "UNAUTHORIZED");
  }
});

test("Day 4.1 Security: x-user-id header spoofing attempt is strictly rejected (HTTP 401)", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });
  assert.ok(admin, "Admin user should exist in database");

  // Attempt to access user profile using spoofed x-user-id header
  const resProfile = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: { "x-user-id": admin.id },
  });
  assert.strictEqual(
    resProfile.status,
    401,
    "Server must reject x-user-id and return 401 Unauthorized"
  );

  // Attempt to access dashboard using spoofed x-user-id header
  const resDashboard = await fetch(`${BASE_URL}/api/v1/analytics/dashboard`, {
    headers: { "x-user-id": admin.id },
  });
  assert.strictEqual(
    resDashboard.status,
    401,
    "Server must reject x-user-id on dashboard and return 401 Unauthorized"
  );
});

test("Day 4.1 Security: Raw user ID in Authorization Bearer token is rejected (HTTP 401)", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { role: { name: "ASPIRANT" } },
  });
  assert.ok(aspirant, "Aspirant user should exist");

  // Sending raw cuid user ID as bearer token
  const res = await fetch(`${BASE_URL}/api/v1/user/goals`, {
    headers: {
      Authorization: `Bearer ${aspirant.id}`,
    },
  });
  assert.strictEqual(res.status, 401, "Raw user ID in Bearer token must fail with 401");
});

test("Day 4.1 Security: Invalid, malformed or tampered session tokens return HTTP 401", async () => {
  const badTokens = [
    "invalid_fake_token_123",
    "Bearer 12345",
    "0000000000000000000000000000000000000000000000000000000000000000",
    "pravaah_user_id_tampered",
  ];

  for (const token of badTokens) {
    const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
      headers: {
        Cookie: `pravaah_session_token=${token}`,
      },
    });
    assert.strictEqual(res.status, 401, `Tampered token ${token} must return 401`);
  }
});

test("Day 4.1 Security: Expired session token is rejected by server", async () => {
  const user = await prisma.user.findFirst();
  assert.ok(user);

  // Create an already-expired session directly in DB
  const expiredToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(expiredToken).digest("hex");
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
    },
  });

  const res = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: {
      Cookie: `pravaah_session_token=${expiredToken}`,
    },
  });
  assert.strictEqual(res.status, 401, "Expired session must return 401");
});

test("Day 4.1 Security: Revoked session is rejected after logout", async () => {
  const email = `session_revocation_test_${Date.now()}@pravaah.in`;
  const plainPassword = "TestSecurePassword2026!";
  const hash = hashPassword(plainPassword);

  const role = await prisma.role.findFirst({ where: { name: "ASPIRANT" } });
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Revocation Test Aspirant",
      passwordHash: hash,
      roleId: role.id,
    },
  });

  // 1. Log in to create a real session
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: plainPassword }),
  });
  assert.strictEqual(loginRes.status, 200);
  const loginJson = await loginRes.json();
  const sessionToken = loginJson.data.sessionToken;
  assert.ok(sessionToken, "Login must return valid session token");

  // 2. Verify access works with session token
  const profileResBefore = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  assert.strictEqual(profileResBefore.status, 200, "Access before logout must succeed");

  // 3. Log out to revoke session
  const logoutRes = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  assert.strictEqual(logoutRes.status, 200);

  // 4. Verify access is now rejected
  const profileResAfter = await fetch(`${BASE_URL}/api/v1/user/profile`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  assert.strictEqual(profileResAfter.status, 401, "Revoked session must be rejected with 401");
});

test("Day 4.1 Security: RBAC enforcement - Aspirant accessing admin route returns 403 Forbidden", async () => {
  const aspirant = await prisma.user.findFirst({
    where: { role: { name: "ASPIRANT" } },
  });
  assert.ok(aspirant);

  const aspirantSession = await createAuthenticatedTestSession(aspirant.id);

  const adminEndpoints = [
    "/api/v1/admin/plans",
    "/api/v1/admin/coverage",
    "/api/v1/admin/questions",
    "/api/v1/admin/subscriptions",
  ];

  for (const endpoint of adminEndpoints) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: aspirantSession.headers,
    });
    assert.strictEqual(
      res.status,
      403,
      `Expected HTTP 403 Forbidden for aspirant accessing ${endpoint}, got ${res.status}`
    );
    const json = await res.json();
    assert.strictEqual(json.error.code, "FORBIDDEN");
  }
});

test("Day 4.1 Security: Admin accessing admin route returns 200 OK", async () => {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "ADMIN" } },
  });
  assert.ok(admin);

  const adminSession = await createAuthenticatedTestSession(admin.id);

  const res = await fetch(`${BASE_URL}/api/v1/admin/plans`, {
    headers: adminSession.headers,
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
});

test("Day 4.1 Security: Scrypt password hashing, verification, and demo password bypass prevention", async () => {
  const password = "StrongPassword#2026";
  const hashed = hashPassword(password);

  assert.ok(hashed.startsWith("scrypt:"), "Password hash must start with scrypt algorithm identifier");
  const parts = hashed.split(":");
  assert.strictEqual(parts.length, 3, "Scrypt hash must contain algorithm, salt, and key");

  // Verification
  const verifyResult = verifyPassword(password, hashed);
  assert.strictEqual(verifyResult.valid, true, "Correct password must verify");
  assert.strictEqual(verifyResult.needsRehash, false, "Modern scrypt hash does not need rehash");

  const wrongResult = verifyPassword("WrongPassword123", hashed);
  assert.strictEqual(wrongResult.valid, false, "Wrong password must fail");

  // Verify demo password bypass is eliminated
  const demoHashedUser = await prisma.user.create({
    data: {
      email: `demo_bypass_test_${Date.now()}@pravaah.in`,
      fullName: "Demo Bypass Test User",
      passwordHash: "pravaah_demo_hash_insecure_prefix",
      role: { connect: { name: "ASPIRANT" } },
    },
  });

  // Attempt login with arbitrary password
  const bypassAttemptRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: demoHashedUser.email,
      password: "arbitrary_random_password_attempt",
    }),
  });

  assert.strictEqual(
    bypassAttemptRes.status,
    401,
    "Arbitrary password for demo-hash account must be rejected with 401"
  );
});

test("Day 4.1 Security: Transparent migration from legacy SHA-256 hash to scrypt on successful login", async () => {
  const email = `legacy_migration_test_${Date.now()}@pravaah.in`;
  const plainPassword = "LegacyAspirantPassword2026!";

  // Create legacy SHA-256 hash
  const legacySalt = "_pravaah_salt_2026";
  const legacyHash = crypto
    .createHash("sha256")
    .update(plainPassword + legacySalt)
    .digest("hex");

  const role = await prisma.role.findFirst({ where: { name: "ASPIRANT" } });
  const user = await prisma.user.create({
    data: {
      email,
      fullName: "Legacy Aspirant",
      passwordHash: legacyHash,
      roleId: role.id,
    },
  });

  assert.strictEqual(user.passwordHash, legacyHash, "Initial hash is legacy SHA-256");

  // Perform login
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: plainPassword }),
  });

  assert.strictEqual(loginRes.status, 200, "Legacy user must successfully login");

  // Query updated user in DB to verify hash has been migrated
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  assert.ok(
    updatedUser.passwordHash.startsWith("scrypt:"),
    "Password hash must be transparently upgraded to scrypt in database"
  );

  // Subsequent login with new scrypt hash must succeed
  const secondLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: plainPassword }),
  });
  assert.strictEqual(secondLoginRes.status, 200, "Login with migrated scrypt hash must succeed");
});
