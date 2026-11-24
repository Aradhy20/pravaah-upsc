# Root Cause Analysis: User Registration Failure & Schema Drift

**Incident Priority:** P0 — Critical Path Blocker  
**Component:** User Authentication & Registration (`/register`, `/api/v1/auth/register`)  
**Production URL:** https://pravaah-upsc.vercel.app/register  
**Date:** November 24, 2026  
**Status:** RESOLVED & MITIGATED  

---

## 1. Executive Summary

When prospective UPSC aspirants attempted to register on Pravaah UPSC, the registration API returned a 500 error, and the UI displayed:

```
Invalid `prisma.user.create()` invocation:
The column `UserProfile.strongSubjects` does not exist in the current database.
```

This blocked all new user registrations across the platform. Existing users with pre-existing session cookies could continue using the platform, but any attempt to insert a new `User` record with a nested `profile: { create: { ... } }` or read/write `strongSubjects` on `UserProfile` failed immediately.

---

## 2. Technical Root Cause Breakdown

### A. Prisma Schema vs. Physical Migration Discrepancy
In `prisma/schema.prisma`, the `UserProfile` model was defined with:
```prisma
model UserProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetYear       Int      @default(2025)
  targetExam       String   @default("UPSC_CSE")
  optionalSubject  String?
  dailyStudyHours  Float    @default(4.0)
  preferredLanguage String  @default("en")
  preparationStage String   @default("BEGINNER")
  readinessIndex   Float    @default(0.0)
  strongSubjects   String?  // <--- Present in schema
  weakSubjects     String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

However, checking the initial migration (`prisma/migrations/20261122000000_init/migration.sql`), the `CREATE TABLE "UserProfile"` statement included:
```sql
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetYear" INTEGER NOT NULL DEFAULT 2025,
    "optionalSubject" TEXT,
    "weakSubjects" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    ...
);
```
Noticeably:
1. `strongSubjects` was completely absent from the initial SQL migration.
2. Several auxiliary profile fields (`targetExam`, `dailyStudyHours`, `preferredLanguage`, `preparationStage`, `readinessIndex`) were also omitted from the initial migration SQL.

### B. Vercel Build Environment Isolation
Pravaah UPSC uses automated builds on Vercel. In Vercel's build container:
- Environment variables like `DATABASE_URL` or `STORAGE_DATABASE_URL` are not always exposed to the build step (or direct network access from the build VM to the hosted PostgreSQL instance is firewalled/restricted).
- The pre-build script `deploy_db_setup.mjs` safely handled this by logging:
  `No DATABASE_URL or Postgres environment variable found. Skipping schema push.`
- Consequently, `prisma db push` or `prisma migrate deploy` was skipped during the Vercel build step, meaning the physical database schema was never automatically altered to match the updated Prisma Client.

### C. Serverless Runtime Query Generation
At runtime, Vercel Serverless Functions connect directly to PostgreSQL via `STORAGE_DATABASE_URL`.
When a client calls `prisma.user.create({ data: { ..., profile: { create: { ... } } }, include: { profile: true } })`, Prisma Client generates an SQL `INSERT` and `SELECT` statement that references all fields defined in the generated schema, including `"strongSubjects"`.
Because PostgreSQL did not have this column in `UserProfile`, PostgreSQL immediately rejected the query with code `42703` (`undefined_column`), which Prisma Client surfaced as `Invalid prisma.user.create() invocation: The column 'UserProfile.strongSubjects' does not exist in the current database.`

### D. Information Exposure in API Error Handler
In the previous `/api/v1/auth/register/route.ts`, the catch block handled errors by writing:
```typescript
return NextResponse.json(
  { success: false, error: { code: 'REGISTRATION_FAILED', message: error.message } },
  { status: 500 }
);
```
Because `error.message` contained the verbatim Prisma internal stack trace, this technical error was exposed directly to the end user in the frontend alert box instead of being safely logged server-side and displaying a friendly message.

---

## 3. Resolution Architecture

To eliminate this vulnerability permanently and ensure zero future schema drift:

1. **Self-Healing Schema Synchronization (`lib/db-sync.ts`):**
   - Implemented `ensureUserProfileSchema()` which executes idempotent `ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS ...` directly through raw SQL.
   - Fast in-memory cached flag prevents redundant database calls on subsequent requests within the same serverless instance.

2. **Atomic Transactional Registration:**
   - Wrapped User creation, UserProfile creation, and Default `FREE` Subscription assignment in an atomic `prisma.$transaction`.
   - Included automatic self-healing retry logic if a transient column error is detected.

3. **Strict Input Validation & Security Sanitization:**
   - Email format validated via RFC 5322 regex.
   - Password length strictly enforced (>= 6 characters).
   - Duplicate emails return clean HTTP 409 Conflict.
   - Technical error strings are never leaked in API responses.
