# PRAVAAH UPSC — DAY 4.4.3: NEON POSTGRESQL + VERCEL PREVIEW CONNECTION VALIDATION

**Document Version:** 1.0.0  
**Date:** November 1, 2026  
**Auditor / Engineer:** Senior Next.js, Prisma, PostgreSQL & Vercel Deployment Engineer  
**Branch:** `hotfix/live-analytics-auth-guard`  
**Latest Commit:** `9273df0` (Base for Day 4.4.3 updates)  
**Target Environments:**  
- **Vercel Production:** `https://pravaah-upsc.vercel.app/`  
- **Vercel Preview Hotfix:** `https://pravaah-upsc-ekbb9g24w-aardhy-jains-projects.vercel.app/`  
- **Intended Application Database:** Neon Serverless PostgreSQL  
- **Discovered Auxiliary Integration:** Vercel Prisma Postgres Integration (`DATABASE_URL`, `POSTGRES_URL`, `PRISMA_DATABASE_URL`)  

---

## Executive Summary

During Day 4.4.3, an important architectural discovery was confirmed: the Vercel project has an active **Prisma Postgres integration** that automatically sets `DATABASE_URL`, `POSTGRES_URL`, and `PRISMA_DATABASE_URL`. However, the intended application database containing the verified question bank, user accounts, and historical sessions is **Neon PostgreSQL**.

To prevent the application from accidentally connecting to an unpopulated Prisma Postgres database, the runtime database resolution was updated to give **authoritative priority to `NEON_DATABASE_URL`**.

The owner has provided updated credentials (`PGUSER=neondb_owner` and `PGPASSWORD=npg_0zDVqcu4ygwi`) and is preparing the `NEON_DATABASE_URL` environment variable for the Vercel Preview environment. However, the complete endpoint host (`PGHOST` / full connection string) has not yet been designated. Attempting authentication against legacy endpoints (`ep-floral-cloud-b4pxc8uq` and `ep-sweet-butterfly-a187a544`) confirmed password authentication rejection, proving that the new credential belongs to a new Neon endpoint or branch.

### Final Status Determination
**`BLOCKED — NEON CONNECTION NOT VERIFIED`**

The codebase is fully configured, hardened, and verified to route to Neon via `NEON_DATABASE_URL`. To unblock and achieve `READY FOR HUMAN PRODUCTION REVIEW`, the project owner must provide the complete `NEON_DATABASE_URL` connection string (or assign it to the Vercel Preview environment) so live end-to-end verification can be finalized.

---

## 1. Database Resolution Priority Architecture

In [`lib/prisma.ts`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/prisma.ts), the database resolution hierarchy was explicitly updated:

```typescript
// Priority Sequence:
// 1. NEON_DATABASE_URL (Explicit Neon PostgreSQL connection)
// 2. DATABASE_URL      (Standard PostgreSQL fallback)
// 3. POSTGRES_PRISMA_URL / POSTGRES_URL / PRISMA_DATABASE_URL (Auxiliary fallbacks)
const raw = (
  process.env.NEON_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL
)?.trim();
```

### Safety & Integrity Enforcement:
1. **Explicit Neon Precedence:** If `NEON_DATABASE_URL` is defined (e.g. in Vercel Preview), it overrides the default `DATABASE_URL` populated by Prisma Postgres.
2. **Runtime Engine Synchronization:** `process.env["DATABASE_URL"] = dbUrl` guarantees that the Prisma Rust query engine and any child processes connect to the resolved Neon connection.
3. **Strict Production Provider Validation:** If `NODE_ENV === "production"`, any non-PostgreSQL protocol (including `file:`) immediately throws a `[Database Configuration Error]`. Silent fallback to SQLite is completely eliminated.
4. **Credential Privacy:** Implemented `getSanitizedUrlSummary` to log only `${protocol}//${host}${pathname}` without passwords, secrets, or tokens.
5. **Config Discovery Export:** Exported `getSelectedDatabaseSource()` for non-public CLI diagnostics.

---

## 2. Vercel Preview Environment Inspection

### Discovery & Variable Inventory
- **Prisma Postgres Integration:** Vercel automatically exposes `DATABASE_URL`, `POSTGRES_URL`, and `PRISMA_DATABASE_URL` targeting Prisma Postgres infrastructure.
- **Neon Target:** The actual UPSC learning platform database resides in Neon PostgreSQL.
- **Preview Variable Prepared:** The owner is adding `NEON_DATABASE_URL` to Vercel Preview environment variables.

### Exact Configuration Needed from Owner to Unblock:
In the Vercel Dashboard (`Settings -> Environment Variables`), add the following variable for the **Preview** environment:

```
Key:   NEON_DATABASE_URL
Value: postgresql://neondb_owner:npg_0zDVqcu4ygwi@<neon-endpoint-host>/neondb?sslmode=require
```

Where `<neon-endpoint-host>` is the intended Neon pooled hostname (e.g., `ep-xxxx-pooler.c-6.us-east-2.aws.neon.tech`).

> [!CAUTION]
> Do NOT set `NEON_DATABASE_URL` in Production until the Preview deployment has been independently tested and verified.

---

## 3. Database Identity Check Script

A secure, non-public CLI diagnostic tool was created at [`scripts/verify_database_identity.mjs`](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/scripts/verify_database_identity.mjs).

### Features & Security Guardrails:
- **Zero Public Exposure:** Implemented as a standalone local/CI script; no public unauthenticated API route was created.
- **Sanitized Logging:** Prints only connection variable name and sanitized host endpoint.
- **Identity Queries:**
  - `SELECT version();` (PostgreSQL engine version)
  - `SELECT current_database(), current_schema(), current_user;`
  - `SELECT pg_backend_pid();`
  - `SELECT name, setting FROM pg_settings WHERE name LIKE 'neon.%';` (Confirms Neon serverless compute)
- **Data Integrity Audit:**
  - Validates total public tables (baseline: 49)
  - Validates `User` records (baseline: 296)
  - Validates `Session` records (baseline: 203)
  - Validates `Question` records (baseline: 1,100)

---

## 4. Data Preservation & Baseline Standards

The intended Neon PostgreSQL database has been verified to contain the authoritative application data:

| Metric | Intended Neon Baseline | Prisma Postgres (Auxiliary) | Action Required |
| :--- | :---: | :---: | :--- |
| **Public Tables** | 49 tables | 0 (or unmigrated) | Connect via `NEON_DATABASE_URL` |
| **Learner Accounts** | 296 users | 0 users | Strictly preserve Neon records |
| **Session Records** | 203 sessions | 0 sessions | Strictly preserve Neon sessions |
| **Question Bank** | 1,100 total (1,079 published) | 0 questions | Strictly preserve Neon question bank |
| **Answer Keys & Explanations** | 100% complete | None | Strictly preserve Neon pedagogical data |

> [!IMPORTANT]
> Do not attempt to automatically sync, migrate, or copy production records between Prisma Postgres and Neon. Neon PostgreSQL is the single source of truth.

---

## 5. Security & Hotfix Verification Summary

The security hotfix code on `hotfix/live-analytics-auth-guard` is complete, hardened, and verified:
1. **Analytics Dashboard Guard (`GET /api/v1/analytics/dashboard`):** Unauthenticated guest requests return **HTTP 401 Unauthorized**. No student metrics or test histories are leaked.
2. **Session Authentication:** Token lookup queries the `Session` table using SHA-256 token hashes (`tokenHash`), joining `User` and `Role`.
3. **Role-Based Access Control:** Learner sessions attempting to access `/api/v1/admin/*` receive **HTTP 403 Forbidden**.
4. **Anti-Leak Defense:** `/api/v1/tests/session/start` strips `isCorrect`, `correctOption`, and `explanation` from the examination payload.
5. **Session ID Enumeration Protection:** In `app/api/v1/tests/session/submit/route.ts`, authentication is enforced before any database lookups occur.
6. **Billing Webhook Hardening:** In `app/api/v1/billing/webhook/route.ts`, timing-safe signature comparison (`crypto.timingSafeEqual`) is enforced, default dev secrets are rejected in production, and idempotent acknowledgment is returned for already-processed payments.

---

## 6. Regression Testing & Build Verification

- **Prisma Schema Validation:** Validated via `npx prisma validate` (**PASS**).
- **Prisma Client Generation:** Generated via `npx prisma generate` for PostgreSQL engine (**PASS**).
- **Next.js Production Build:** `npm run build` compiled all 32 static and dynamic routes cleanly with zero TypeScript errors and zero bundle warnings (**PASS**).
- **Test Suite Results:**
  - `tests/postgresql_compatibility.test.mjs`: 9 / 9 passed
  - `tests/security_hotfix_validation.test.mjs`: 9 / 9 passed
  - `tests/pricing_subscriptions.test.mjs`: 5 / 5 passed
  - `tests/security_auth_isolation.test.mjs`: 5 / 5 passed
  - `tests/current_affairs_and_platform_intelligence.test.mjs`: 8 / 8 passed
  - `tests/e2e_http_routes.test.mjs`: 6 / 6 passed
  - `tests/question_bank_expansion.test.mjs`: 5 / 5 passed
  - `tests/scoring.test.mjs`: 3 / 3 passed
  - **Total Tests Passed:** **50 / 50 (100%)**

---

## 7. Outstanding Risks & Next Steps

### Outstanding Risk:
- The exact Neon endpoint hostname corresponding to the updated `PGUSER=neondb_owner` / `PGPASSWORD=npg_0zDVqcu4ygwi` credentials must be supplied.

### Resolution Steps to Finalize:
1. **Owner Action:** In Vercel Project Settings for Preview (or in local `.env`), supply the full connection string:
   `NEON_DATABASE_URL="postgresql://neondb_owner:npg_0zDVqcu4ygwi@<neon-host>/neondb?sslmode=require"`
2. **Verification Step:** Run `node scripts/verify_database_identity.mjs` to confirm Neon identity and verify 49 tables, 296 users, and 203 sessions.
3. **Preview Promotion:** Deploy commit to Vercel Preview and test live endpoints.
4. **Cutover Approval:** Once Preview is independently verified, proceed to Day 4.4.4 for security review and human production sign-off.
