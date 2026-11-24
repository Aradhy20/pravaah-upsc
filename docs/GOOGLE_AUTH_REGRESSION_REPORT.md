# Google OAuth Registration & Authentication Regression Report

**Module:** Google OAuth Authentication Handler (`lib/google-auth.ts`)  
**Route:** `POST /api/v1/auth/google`  
**Date:** November 24, 2026  
**Status:** PASS — ZERO REGRESSIONS  

---

## 1. Overview

Google OAuth is a primary onboarding path for Pravaah UPSC aspirants. When an aspirant selects "Sign up with Google" on `/register` or `/login`, the Google identity token is validated and processed through `findOrCreateGoogleUser()` in `lib/google-auth.ts`.

---

## 2. Audit of Google User Provisioning Flow

### Vulnerability Identified:
Previously, `findOrCreateGoogleUser()` created new users by invoking `prisma.user.create()` with a nested `profile: { create: { ... } }`. If the `UserProfile` table suffered from schema drift, Google OAuth registrations would fail with the exact same column missing error.

### Hardening Implemented:
1. **Pre-flight Schema Synchronization:**
   - Added `await ensureUserProfileSchema()` at the top of `findOrCreateGoogleUser()`.
2. **Atomic Provisioning via Transaction:**
   - Wrapped user creation, profile creation, and default `FREE` subscription creation in `prisma.$transaction()`:
     ```typescript
     const createdUser = await prisma.$transaction(async (tx) => {
       const newUser = await tx.user.create({
         data: {
           email,
           fullName: name,
           avatarUrl: picture,
           role: 'ASPIRANT',
           isVerified: true,
           profile: {
             create: {
               targetYear: new Date().getFullYear(),
               targetExam: 'UPSC_CSE',
               dailyStudyHours: 4.0,
               preferredLanguage: 'en',
               preparationStage: 'BEGINNER',
               readinessIndex: 0.0,
               strongSubjects: JSON.stringify([]),
               weakSubjects: JSON.stringify([]),
             },
           },
         },
         include: { profile: true },
       });

       await tx.subscription.create({
         data: {
           userId: newUser.id,
           tier: 'FREE',
           status: 'ACTIVE',
           autoRenew: false,
         },
       });

       return newUser;
     });
     ```
3. **Idempotency for Existing Users:**
   - Existing Google users are retrieved via `prisma.user.findUnique({ where: { email } })`.
   - If an existing user lacks a profile, one is created automatically.
   - If the user's avatar changed, it is updated cleanly.

---

## 3. Automated Test Evidence

Automated regression tests in `tests/registration_production_repair.test.mjs` validated both new user onboarding and subsequent idempotent logins:

```
▶ 3. Google User Provisioning (findOrCreateGoogleUser)
  ✔ provisions new Google user with profile and free subscription (8.891458ms)
  ✔ finds existing Google user idempotently on subsequent login (1.465958ms)
  ✔ cleans up test Google candidate safely (1.787041ms)
✔ 3. Google User Provisioning (findOrCreateGoogleUser) (12.554458ms)
```

**Conclusion:** Google OAuth authentication and user provisioning are robust, secure, and regression-free.
