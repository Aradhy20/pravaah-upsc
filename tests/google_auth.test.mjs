import test from "node:test";
import assert from "node:assert";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const AUTH_SECRET = process.env.AUTH_SECRET || "pravaah_auth_secret_token_2026_super_secure_key";
const prisma = new PrismaClient();

// Helper to create and verify state token using the same algorithm
function createTestState(returnTo = "/dashboard") {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const payload = JSON.stringify({ nonce, timestamp, returnTo });
  const b64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(b64Payload)
    .digest("hex");
  return `${b64Payload}.${signature}`;
}

test("Google Auth: 1. CSRF State Token Cryptographic Verification", async () => {
  const validState = createTestState("/study-planner");
  assert.ok(validState.includes("."), "State token should contain base64url payload and signature");

  // Tampered payload
  const [b64, sig] = validState.split(".");
  const tamperedState = `${b64}xyz.${sig}`;

  // Attempt callback with tampered state
  const tamperedRes = await fetch(
    `${BASE_URL}/api/v1/auth/google/callback?code=mock_sample&state=${tamperedState}`,
    {
      headers: { Cookie: `pravaah_google_oauth_state=${tamperedState}` },
      redirect: "manual",
    }
  );
  assert.strictEqual(tamperedRes.status, 307);
  const location = tamperedRes.headers.get("location");
  assert.ok(location.includes("error=EXPIRED_OAUTH_STATE") || location.includes("error=INVALID_OAUTH_STATE"));
});

test("Google Auth: 2. GET /api/v1/auth/google Sets Secure State Cookie & Generates Redirect", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/google?returnTo=/dashboard`, {
    redirect: "manual",
  });

  assert.strictEqual(res.status, 307);
  const setCookies = res.headers.getSetCookie();
  const stateCookie = setCookies.find((c) => c.includes("pravaah_google_oauth_state="));
  assert.ok(stateCookie, "Must set pravaah_google_oauth_state cookie");
  assert.ok(stateCookie.includes("HttpOnly"), "State cookie must be HttpOnly");

  const location = res.headers.get("location");
  assert.ok(location, "Must return redirect Location header");
  // Location should either be Google OAuth URL or callback URL (in mock/sandbox mode)
  assert.ok(
    location.includes("accounts.google.com") || location.includes("/api/v1/auth/google/callback"),
    "Redirect must target Google accounts or mock callback"
  );
});

test("Google Auth: 3. Automatic Account Provisioning for New Google Aspirant via POST /api/v1/auth/google", async () => {
  const uniqueId = Date.now();
  const testEmail = `google_aspirant_${uniqueId}@gmail.com`;
  const testName = `Aspirant Google ${uniqueId}`;
  const testSub = `google_sub_${uniqueId}`;
  const testAvatar = `https://lh3.googleusercontent.com/a/aspirant_${uniqueId}`;

  const res = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      simulate: true,
      testUser: {
        email: testEmail,
        name: testName,
        sub: testSub,
        picture: testAvatar,
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.user.email, testEmail);
  assert.strictEqual(json.data.user.fullName, testName);
  assert.strictEqual(json.data.user.avatarUrl, testAvatar);
  assert.strictEqual(json.data.user.role, "ASPIRANT");
  assert.strictEqual(json.data.user.isNewAccount, true);

  // Verify in PostgreSQL
  const dbUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { role: true, profile: true },
  });
  assert.ok(dbUser, "User record must exist in PostgreSQL");
  assert.strictEqual(dbUser.googleId, testSub);
  assert.strictEqual(dbUser.avatarUrl, testAvatar);
  assert.strictEqual(dbUser.role.name, "ASPIRANT");
  assert.ok(dbUser.profile, "UserProfile must be provisioned");
  assert.strictEqual(dbUser.profile.targetYear, 2027);

  // Verify session cookie was issued
  const cookies = res.headers.getSetCookie();
  const sessionCookie = cookies.find((c) => c.includes("pravaah_user_id="));
  assert.ok(sessionCookie, "Must set pravaah_user_id session cookie");

  // Verify /api/v1/auth/me recognizes the user
  const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Cookie: sessionCookie.split(";")[0] },
  });
  const meJson = await meRes.json();
  assert.strictEqual(meJson.success, true);
  assert.strictEqual(meJson.data.authenticated, true);
  assert.strictEqual(meJson.data.user.email, testEmail);
  assert.strictEqual(meJson.data.user.avatarUrl, testAvatar);
});

test("Google Auth: 4. Seamless Account Linking for Existing Email Aspirant", async () => {
  const uniqueId = Date.now();
  const existingEmail = `existing_aspirant_${uniqueId}@pravaah.ai`;

  // Pre-create account with email and password
  const aspirantRole = await prisma.role.findUnique({ where: { name: "ASPIRANT" } });
  const preExistingUser = await prisma.user.create({
    data: {
      email: existingEmail,
      fullName: "Pre-existing Aspirant",
      passwordHash: "pravaah_demo_hash_legacy",
      roleId: aspirantRole.id,
      profile: {
        create: { targetYear: 2026, dailyGoalMinutes: 45 },
      },
    },
  });

  assert.strictEqual(preExistingUser.googleId, null);

  // Aspirant now clicks "Continue with Google" using their existing email
  const googleSub = `google_linked_sub_${uniqueId}`;
  const googleAvatar = "https://lh3.googleusercontent.com/a/linked_pic";

  const res = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      simulate: true,
      testUser: {
        email: existingEmail,
        name: "Pre-existing Aspirant",
        sub: googleSub,
        picture: googleAvatar,
      },
    }),
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.data.user.id, preExistingUser.id, "Existing account ID must be preserved");
  assert.strictEqual(json.data.user.isNewAccount, false, "Must not create a duplicate account");

  // Check database linking
  const updatedUser = await prisma.user.findUnique({ where: { id: preExistingUser.id } });
  assert.strictEqual(updatedUser.googleId, googleSub, "Google ID must be linked");
  assert.strictEqual(updatedUser.avatarUrl, googleAvatar, "Avatar must be updated");
});

test("Google Auth: 5. Callback Rejects Missing State Cookie (CSRF Attack Prevention)", async () => {
  const forgedState = createTestState();

  // Attack scenario: user is redirected to callback with a state, but no state cookie was stored in their browser
  const res = await fetch(`${BASE_URL}/api/v1/auth/google/callback?code=mock_xyz&state=${forgedState}`, {
    redirect: "manual",
  });

  assert.strictEqual(res.status, 307);
  const location = res.headers.get("location");
  assert.ok(location.includes("/login?error=INVALID_OAUTH_STATE"));
});

test("Google Auth: 6. Full OAuth Callback Flow with State Verification & Session Login", async () => {
  const uniqueId = Date.now();
  const testEmail = `e2e_google_${uniqueId}@gmail.com`;
  const testName = `E2E Aspirant ${uniqueId}`;
  const testSub = `e2e_sub_${uniqueId}`;

  // 1. Initiate OAuth
  const initRes = await fetch(
    `${BASE_URL}/api/v1/auth/google?simulate=true&testEmail=${encodeURIComponent(testEmail)}&testName=${encodeURIComponent(testName)}&testSub=${encodeURIComponent(testSub)}&returnTo=/dashboard`,
    { redirect: "manual" }
  );

  assert.strictEqual(initRes.status, 307);
  const callbackUrl = initRes.headers.get("location");
  const initCookies = initRes.headers.getSetCookie();
  const stateCookie = initCookies.find((c) => c.includes("pravaah_google_oauth_state="));
  assert.ok(stateCookie, "State cookie required");

  // 2. Browser follows redirect to callback
  const callbackRes = await fetch(callbackUrl, {
    headers: { Cookie: stateCookie.split(";")[0] },
    redirect: "manual",
  });

  assert.strictEqual(callbackRes.status, 307);
  const destination = callbackRes.headers.get("location");
  assert.ok(destination.includes("/dashboard"), "Should redirect to requested returnTo (/dashboard)");

  // 3. Verify session cookie issued and state cookie cleared
  const callbackCookies = callbackRes.headers.getSetCookie();
  const sessionCookie = callbackCookies.find((c) => c.includes("pravaah_user_id="));
  assert.ok(sessionCookie, "Session cookie must be set on callback completion");

  // 4. Verify authenticated session
  const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Cookie: sessionCookie.split(";")[0] },
  });
  const meJson = await meRes.json();
  assert.strictEqual(meJson.success, true);
  assert.strictEqual(meJson.data.authenticated, true);
  assert.strictEqual(meJson.data.user.email, testEmail);
  assert.strictEqual(meJson.data.user.fullName, testName);
});

test("Google Auth: 7. Missing Credentials Error Handling in POST Endpoint", async () => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assert.strictEqual(res.status, 400);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, "MISSING_GOOGLE_CREDENTIAL");
});
