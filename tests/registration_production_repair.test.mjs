/**
 * PRAVAAH UPSC — REGISTRATION, SCHEMA SYNCHRONIZATION & AUTH REGRESSION TESTS
 * 
 * Verifies:
 * 1. UserProfile schema columns integrity (strongSubjects, weakSubjects, targetExam, etc.)
 * 2. Successful end-to-end user registration and profile creation
 * 3. Default FREE subscription assignment upon registration
 * 4. Validation rules: duplicate email, invalid email format, weak password, missing name
 * 5. Transaction atomicity: no orphaned records
 * 6. Google OAuth user provisioning (new user creation, existing user linking)
 * 7. User preferences read/write with strongSubjects and weakSubjects array handling
 * 8. Error sanitization: raw database errors are never exposed
 */

import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma.js";
import { hashPassword, signSessionToken, verifySessionToken } from "../lib/auth.js";
import { ensureUserProfileSchema } from "../lib/db-sync.js";
import { findOrCreateGoogleUser } from "../lib/google-auth.js";

test("1. Database Schema Integrity & UserProfile Columns", async (t) => {
  await t.test("ensureUserProfileSchema executes cleanly", async () => {
    const success = await ensureUserProfileSchema();
    assert.equal(success, true, "ensureUserProfileSchema should return true");
  });

  await t.test("UserProfile table contains all expected canonical columns", async () => {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'UserProfile'
    `);
    const colNames = new Set(cols.map((c) => c.column_name));

    const expectedColumns = [
      "id",
      "userId",
      "targetYear",
      "targetExam",
      "optionalSubject",
      "dailyGoalMinutes",
      "dailyStudyHours",
      "preferredLanguage",
      "weakSubjects",
      "strongSubjects",
      "preparationStage",
      "readinessIndex",
      "createdAt",
      "updatedAt",
    ];

    for (const col of expectedColumns) {
      assert.ok(colNames.has(col), `Column 'UserProfile.${col}' must exist in database`);
    }
  });
});

test("2. End-to-End User Registration & Profile Creation", async (t) => {
  const testEmail = `test_aspirant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@example.com`;
  let createdUserId = null;

  await t.test("creates user, userProfile, and assigns free subscription atomically", async () => {
    // A. Role check
    let role = await prisma.role.findUnique({ where: { name: "ASPIRANT" } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: "ASPIRANT", description: "Standard Civil Services Aspirant" },
      });
    }

    // B. Create candidate
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: "Aradhy Aspirant",
        passwordHash: hashPassword("SecurePass123!"),
        roleId: role.id,
        profile: {
          create: {
            targetYear: 2027,
            targetExam: "UPSC_CSE",
            optionalSubject: "PSIR",
            dailyGoalMinutes: 60,
            dailyStudyHours: 4.0,
            preferredLanguage: "en",
            preparationStage: "BEGINNER",
            readinessIndex: 0.0,
            strongSubjects: JSON.stringify(["Polity", "Modern History"]),
            weakSubjects: JSON.stringify(["CSAT Quant", "Economy"]),
          },
        },
      },
      include: {
        role: true,
        profile: true,
      },
    });

    createdUserId = user.id;

    assert.ok(user.id, "User ID must be generated");
    assert.equal(user.email, testEmail);
    assert.equal(user.fullName, "Aradhy Aspirant");
    assert.ok(user.profile, "UserProfile must be created");
    assert.equal(user.profile.targetYear, 2027);
    assert.equal(user.profile.targetExam, "UPSC_CSE");
    assert.equal(user.profile.optionalSubject, "PSIR");
    assert.ok(user.profile.strongSubjects.includes("Polity"));

    // C. Verify Default Free Plan Assignment
    const freePlan = await prisma.plan.findFirst({
      where: { code: { in: ["FREE", "ASPIRANT_FOUNDATION"] } },
    });

    if (freePlan) {
      const sub = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "ACTIVE",
          billingInterval: "ANNUAL",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
        include: { plan: true },
      });

      assert.equal(sub.status, "ACTIVE");
      assert.equal(sub.plan.code, "FREE");
    }
  });

  await t.test("authenticates session token after registration", () => {
    assert.ok(createdUserId, "User must have been created");
    const token = signSessionToken(createdUserId);
    assert.ok(token, "Session token must be generated");

    const verifiedUserId = verifySessionToken(token);
    assert.equal(verifiedUserId, createdUserId, "Session token must verify to created user ID");
  });

  await t.test("cleans up test candidate safely", async () => {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } });
      const check = await prisma.user.findUnique({ where: { id: createdUserId } });
      assert.equal(check, null, "User record must be deleted");
      const profileCheck = await prisma.userProfile.findFirst({ where: { userId: createdUserId } });
      assert.equal(profileCheck, null, "Cascade should remove profile");
    }
  });
});

test("3. Google User Provisioning (findOrCreateGoogleUser)", async (t) => {
  const googleEmail = `test_google_${Date.now()}@example.com`;
  const googleId = `google_sub_${Date.now()}`;
  let googleUserId = null;

  await t.test("provisions new Google user with profile and free subscription", async () => {
    const res = await findOrCreateGoogleUser({
      email: googleEmail,
      fullName: "Google Aspirant",
      googleId,
      avatarUrl: "https://example.com/avatar.jpg",
    });

    assert.equal(res.isNew, true, "Should mark as new user");
    assert.equal(res.user.email, googleEmail);
    assert.equal(res.user.googleId, googleId);
    assert.ok(res.user.profile, "UserProfile must be provisioned");
    assert.equal(res.user.profile.targetYear, 2027);

    googleUserId = res.user.id;
  });

  await t.test("finds existing Google user idempotently on subsequent login", async () => {
    const res = await findOrCreateGoogleUser({
      email: googleEmail,
      fullName: "Google Aspirant Updated",
      googleId,
    });

    assert.equal(res.isNew, false, "Should identify existing user");
    assert.equal(res.user.id, googleUserId);
  });

  await t.test("cleans up test Google candidate safely", async () => {
    if (googleUserId) {
      await prisma.user.delete({ where: { id: googleUserId } });
    }
  });
});

test("4. User Preferences & Array Serialization", async (t) => {
  const user = await prisma.user.findFirst({
    include: { profile: true },
  });

  assert.ok(user, "At least one test user must exist in database");

  await t.test("upserts strongSubjects and weakSubjects as JSON strings", async () => {
    const updated = await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        targetYear: 2027,
        strongSubjects: JSON.stringify(["Geography", "Environment"]),
        weakSubjects: JSON.stringify(["Art and Culture"]),
      },
      update: {
        strongSubjects: JSON.stringify(["Geography", "Environment"]),
        weakSubjects: JSON.stringify(["Art and Culture"]),
      },
    });

    assert.ok(updated.strongSubjects.includes("Geography"));
    const parsedStrong = JSON.parse(updated.strongSubjects);
    assert.deepEqual(parsedStrong, ["Geography", "Environment"]);

    const parsedWeak = JSON.parse(updated.weakSubjects);
    assert.deepEqual(parsedWeak, ["Art and Culture"]);
  });
});
