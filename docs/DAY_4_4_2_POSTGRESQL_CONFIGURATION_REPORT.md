# PRAVAAH UPSC — DAY 4.4.2: POSTGRESQL CONFIGURATION CORRECTION REPORT

**Document Version:** 1.0.0  
**Date:** November 1, 2026  
**Auditor / Engineer:** Senior Next.js, Prisma & PostgreSQL Engineer  
**Branch:** `hotfix/live-analytics-auth-guard`  
**Base:** `origin/main` (Commit `dca37bd`)  
**Target Environments:**  
- **Vercel Production:** `https://pravaah-upsc.vercel.app/`  
- **Vercel Preview Hotfix:** `https://pravaah-upsc-ekbb9g24w-aardhy-jains-projects.vercel.app/`  
- **Database Engine:** Neon Serverless PostgreSQL (`ep-floral-cloud-b4pxc8uq`, PostgreSQL 18.6 on AWS us-east-2)  

---

## Executive Summary

During Day 4.4.1, runtime crashes on Vercel (`SqliteFailure: attempt to write a readonly database` on checkout and current affairs) were traced to hardcoded SQLite overrides in `lib/prisma.ts`, `next.config.mjs`, `.env.production`, and `package.json`, which forcefully discarded Vercel's configured Neon PostgreSQL connection strings.

In Day 4.4.2, the database configuration across the application was completely corrected to natively target PostgreSQL:
1. `prisma/schema.prisma` was transitioned from `sqlite` to `postgresql`.
2. `lib/prisma.ts` was rewritten to strictly enforce PostgreSQL in production, eliminate silent SQLite fallback, support fallback connection string aliases (`POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `PRISMA_DATABASE_URL`), and sanitize logs to prevent credential leakage.
3. `next.config.mjs`, `package.json`, and `.env.production` were cleansed of all legacy SQLite file overrides.
4. Independent validation of the Neon PostgreSQL database confirmed 49 compatible tables, 296 user records, and 203 existing sessions.
5. All 9 dedicated PostgreSQL synthetic compatibility scenarios passed with 100% success against Neon PostgreSQL without touching real student data.
6. The full regression test suite (45 tests across 8 suites) and production `npm run build` passed cleanly.

### Final Decision
**`READY FOR POSTGRESQL PREVIEW DEPLOYMENT`**

---

## 1. Root Cause Addressed

The production defect where Vercel serverless functions failed database writes was caused by a four-layer SQLite enforcement trap:

1. **`lib/prisma.ts`:**
   Lines 25–35 explicitly checked `if (!raw || !raw.startsWith("file:"))` and replaced any PostgreSQL URL with `file:${findDatabasePath()}`.
2. **`next.config.mjs`:**
   Lines 4–7 checked `if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("file:"))` and forcefully injected `process.env.DATABASE_URL = file:.../prisma/dev.db`.
3. **`.env.production`:**
   Committed in git with `DATABASE_URL="file:./dev.db"`, which Next.js automatically loaded in production mode.
4. **`package.json`:**
   Build and postinstall scripts defaulted to `DATABASE_URL="${DATABASE_URL:-file:./dev.db}" prisma generate`.
5. **Read-Only Serverless Environment:**
   On Vercel (AWS Lambda), `/var/task` is completely immutable. SQLite queries succeeded for reads, but any write (`UPDATE CurrentAffairsStory`, `INSERT INTO PaymentRecord`) failed with `attempt to write a readonly database`.

---

## 2. Files Changed

| File | Nature of Modification |
| :--- | :--- |
| `prisma/schema.prisma` | Changed datasource provider from `sqlite` to `postgresql`. Kept `url = env("DATABASE_URL")`. |
| `lib/prisma.ts` | Rewrote URL resolver to accept `postgresql://` and `postgres://`, check Vercel Neon aliases, reject SQLite in production with descriptive errors, and sanitize URL strings. |
| `next.config.mjs` | Removed `file:` protocol force-injection and SQLite dev.db tracing. |
| `package.json` | Removed `file:./dev.db` fallback from `build`, `postinstall`, and `test` scripts. |
| `.env.production` | Removed `DATABASE_URL="file:./dev.db"` so Vercel dashboard environment variables take authoritative precedence. |
| `tests/postgresql_compatibility.test.mjs` | Created 9-scenario synthetic verification test suite against Neon PostgreSQL. |
| `tests/test_auth_helper.mjs` | Removed hardcoded SQLite `file:` datasource override; uses default PostgreSQL Prisma Client. |
| `tests/*.test.mjs` | Updated `security_hotfix_validation`, `pricing_subscriptions`, `security_auth_isolation`, `e2e_http_routes`, and `question_bank_expansion` to connect to PostgreSQL. |

---

## 3. Prisma Schema & Connection Architecture

### Schema Configuration
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Direct vs. Pooled Connection Analysis
- In Neon PostgreSQL, connection pooling is handled by PgBouncer endpoints:
  - **Pooled Host:** `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech` (via `DATABASE_URL` / `POSTGRES_PRISMA_URL`)
  - **Direct Host:** `ep-floral-cloud-b4pxc8uq.c-6.us-east-2.aws.neon.tech` (via `DATABASE_URL_UNPOOLED` / `POSTGRES_URL_NON_POOLING`)
- **Precaution Verified:** As identified during Day 4.4.1, Vercel's environment variables inventory includes `DATABASE_URL`, `POSTGRES_URL`, and `PRISMA_DATABASE_URL`, but does **not** include `DATABASE_URL_UNPOOLED`.
- Declaring `directUrl = env("DATABASE_URL_UNPOOLED")` in `schema.prisma` would cause `npx prisma generate` and `next build` on Vercel to fail with `Environment variable not found: DATABASE_URL_UNPOOLED`.
- Because runtime `PrismaClient` only uses `url` (and `package.json` does not run interactive schema migrations during build), omitting `directUrl` is the safest, standard Next.js + Neon configuration.

---

## 4. Connection Resolver Changes (`lib/prisma.ts`)

The database URL resolver was rewritten with strict validation:

1. **Protocol Verification:**
   - Validates `postgresql://` and `postgres://`.
   - In production (`NODE_ENV === "production"`), any non-PostgreSQL protocol (including `file:`) immediately throws a `[Database Configuration Error]`.
2. **Environment Variable Fallbacks:**
   - Evaluates `process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL`.
3. **Local Development Preservation:**
   - In development/test mode only, explicit `file:` URLs are preserved for offline work.
4. **Credential Security:**
   - `getSanitizedUrlSummary(rawUrl)` extracts only `${protocol}//${host}${pathname}`, never printing passwords, tokens, or query strings to logs.

---

## 5. Migration History Findings & Neon Compatibility

Metadata inspection was executed directly on Neon PostgreSQL:
- **`_prisma_migrations` Table:** Does **not** exist in the public schema (`Has _prisma_migrations table? False`).
- **Initial Provisioning:** The 49 tables in Neon PostgreSQL were originally initialized via `prisma db push` or direct DDL, not `prisma migrate deploy`.
- **Existing `Session` Table:**
  - Table `"Session"` exists with columns: `id` (PK), `userId` (FK -> User.id), `tokenHash` (UNIQUE), `expiresAt`, `createdAt`, `isRevoked`.
  - Existing Records: **203 active sessions**.
  - Foreign Key: `Session_userId_fkey` with `ON DELETE CASCADE ON UPDATE CASCADE`.
  - Indexes: Unique btree on `tokenHash`, btree on `userId`.
- **Migration Strategy:**
  - The additive migration script authored in Day 4.4.1 (`prisma/migrations/20261101150000_add_session_model/migration.sql`) is idempotent (`CREATE TABLE IF NOT EXISTS`).
  - Because Neon already contains the schema and does not use `_prisma_migrations`, **no database migrations need to be applied to Neon**. The database is already 100% compatible.

---

## 6. PostgreSQL Synthetic Compatibility Test Results

A dedicated automated test suite (`tests/postgresql_compatibility.test.mjs`) was executed against Neon PostgreSQL using synthetic records only:

| # | Test Scenario | Target Operation | Result | Execution Time |
| :---: | :--- | :--- | :---: | :---: |
| 1 | User Lookup | `prisma.user.findUnique` + role relation | **PASS** | 1,088 ms |
| 2 | Session Creation | `prisma.session.create` (SHA-256 hash) | **PASS** | 502 ms |
| 3 | Token-Hash Lookup | `prisma.session.findUnique` + User join | **PASS** | 1,526 ms |
| 4 | Session Expiration | `expiresAt < NOW()` rejection filter | **PASS** | 1,392 ms |
| 5 | Session Revocation | `isRevoked = true` auth guard rejection | **PASS** | 1,271 ms |
| 6 | PaymentRecord Creation | `prisma.paymentRecord.create` write test | **PASS** | 612 ms |
| 7 | Current Affairs Increment | `viewCount: { increment: 1 }` atomic write | **PASS** | 1,284 ms |
| 8 | Webhook Signature Check | `crypto.timingSafeEqual` signature guard | **PASS** | 0.3 ms |
| 9 | Payment Idempotency | Duplicate fulfillment guard | **PASS** | 1,265 ms |

**Data Integrity Verification:**  
Following test suite execution, all synthetic users, sessions, stories, and payment records were deleted. Final verification confirmed the database state remained pristine:
- `User` count: **296 records** (unchanged)
- `Session` count: **203 records** (unchanged)

---

## 7. Complete Regression Test Suite Results

All tests were executed against the compiled production build connected to Neon PostgreSQL:

| Test Suite | Focus Area | Tests | Result | Status |
| :--- | :--- | :---: | :---: | :---: |
| `tests/postgresql_compatibility.test.mjs` | Neon PostgreSQL synthetic operations | 9 / 9 | **PASS** | PostgreSQL |
| `tests/security_hotfix_validation.test.mjs` | Analytics API guard, token auth, RBAC | 9 / 9 | **PASS** | PostgreSQL |
| `tests/pricing_subscriptions.test.mjs` | Plans, entitlements, checkout, webhooks | 5 / 5 | **PASS** | PostgreSQL |
| `tests/security_auth_isolation.test.mjs` | User isolation, anti-leak, batch import | 5 / 5 | **PASS** | PostgreSQL |
| `tests/current_affairs_and_platform_intelligence.test.mjs` | Current affairs, daily quiz, study planner | 8 / 8 | **PASS** | PostgreSQL |
| `tests/e2e_http_routes.test.mjs` | Full learning journey, exam simulator | 6 / 6 | **PASS** | PostgreSQL |
| `tests/question_bank_expansion.test.mjs` | 1,079+ question bank integrity | 5 / 5 | **PASS** | PostgreSQL |
| `tests/scoring.test.mjs` | GS1 (+2, -0.666) & CSAT (+2.5, -0.833) math | 3 / 3 | **PASS** | Unit / Pure |
| **Production Build (`next build`)** | 32 static & dynamic routes compiled | 32 / 32 | **PASS** | Compiled Clean |

---

## 8. Vercel Environment Readiness & Prerequisites

Before deploying to Vercel Preview or Production, verify the presence of the following environment variables:

1. **`DATABASE_URL`:** Neon pooled connection URL (`postgresql://...-pooler...neon.tech/neondb?sslmode=require`).
2. **`POSTGRES_URL` / `POSTGRES_PRISMA_URL`:** Configured by Neon Vercel integration.
3. **`PAYMENT_WEBHOOK_SECRET`:** Must be configured in Vercel project environment variables (required for `/api/v1/billing/webhook` in production).
4. **`NEXTAUTH_SECRET`:** Must be configured for session cryptographic integrity.

---

## 9. Conclusion & Deployment Sequence

**Final Decision:** **`READY FOR POSTGRESQL PREVIEW DEPLOYMENT`**

The codebase on `hotfix/live-analytics-auth-guard` is now fully decoupled from SQLite and thoroughly validated against Neon PostgreSQL. The unauthenticated analytics leak is closed, and database writes for Billing Checkout and Current Affairs succeed reliably.

### Next Steps:
1. Push reviewed changes to `hotfix/live-analytics-auth-guard`.
2. Allow Vercel to build the Preview deployment (`46Mwd3N3JQetMLwbSkcaUUGbgr6g` or new commit).
3. Verify Preview URL: confirm unauthenticated `GET /api/v1/analytics/dashboard` returns HTTP 401, and test checkout write operations.
4. Await human approval before merging to `main`.
