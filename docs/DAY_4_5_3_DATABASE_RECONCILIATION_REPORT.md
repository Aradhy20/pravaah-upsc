# PRAVAAH UPSC — DAY 4.5.3
## FINAL DATABASE MIGRATION RECONCILIATION & RELEASE GATE REPORT

**Audit Date:** November 1, 2026  
**Auditor:** Principal PostgreSQL Architect, Prisma Migration Specialist, Application Security Engineer & GitHub Release Manager  
**Project:** Pravaah UPSC  
**Repository:** `Aradhy20/pravaah-upsc`  
**Production Domain:** `https://pravaah-upsc.vercel.app`  
**Production Commit (`origin/main`):** `dca37bdae8ab65630bdbf9eeccedf4ac19345b9e` (`dca37bd`)  
**Hotfix Branch (`origin/hotfix/live-analytics-auth-guard`):** `f2b6df6b78829eb45fecb2a5bbc9fc50a1c411f3` (`f2b6df6`)  
**Latest Preview Deployment ID:** `dpl_7qEjdSqmH5Q7xpWoD3DES46oJRSH` (Status: READY)  
**Database Provider:** Neon Serverless PostgreSQL  
**ORM:** Prisma 5.22.0  

---

### Final Status Determination

```
FINAL STATUS: BLOCKED — Database isolation or migration history needs owner action.
```

**Justification for BLOCKED:**
1. **Neon Preview Database Isolation:** In Vercel, `NEON_DATABASE_URL` is configured with a single connection string applied across Production, Preview, and Development. Preview and Production currently share the identical database on Neon's primary branch (`ep-floral-cloud-b4pxc8uq`). A separate child branch (e.g. `preview`) must be designated in Neon and assigned to Preview in Vercel before unrestricted testing.
2. **Dedicated Hotfix PR Creation:** The dedicated release PR for `hotfix/live-analytics-auth-guard` into `main` has been prepared with full documentation and awaits human creation and merge authorization by the owner.
3. **Controlled Release Mandate:** In strict adherence to release safety rules, production deployment and PR merging cannot occur automatically.

---

## 1. Git Branch Status & Commit Verification

| Branch | HEAD Commit SHA | Commits Ahead of Main | Commits Behind Main | Release Classification |
| :--- | :--- | :--- | :--- | :--- |
| `origin/main` | `dca37bd` | 0 | 0 | Live Production Baseline |
| `origin/hotfix/live-analytics-auth-guard` | `f2b6df6` | **11** | **0** | Release Candidate (Hotfix) |

### Sequence of Hotfix Commits Ahead of `main`:
1. `06c0500` — `security(hotfix): enforce server-side session authentication and guard analytics and admin endpoints`
2. `318a164` — `security(hotfix): enforce mandatory webhook signature verification`
3. `f5c2795` — `docs: update security hotfix report with code review findings`
4. `b829035` — `fix(security): harden webhook auth, prevent session id enumeration, add postgresql session migration and readiness report`
5. `9273df0` — `fix(db): correct Prisma provider to PostgreSQL and remove legacy SQLite production fallbacks`
6. `a3a45c5` — `feat(db): prioritize NEON_DATABASE_URL over Prisma Postgres integration and add identity verification`
7. `4c1ee90` — `docs(security): sanitize validation reports and document verified neon postgresql connection`
8. `bc6abf4` — `build(db): untrack local SQLite database artifact from git and enforce ignore rules`
9. `ef0a24f` — `docs: add production readiness and hotfix release comparison reports`
10. `fee8e83` — `security(env): untrack .env.production from git to prevent secret commitment`
11. `f2b6df6` — `docs: add Day 4.5.2 final hotfix review and dedicated release PR report`

Confirmed: **Zero Day 3 subscription UI code or unrelated features are included in this branch.**

---

## 2. Production vs. Preview Deployment Status

- **Production Deployment:**
  - Deployment ID: `dpl_BG1Lk4nLAj3jS6WPpZKGZZLH4YK8`
  - Commit: `dca37bd` on `main`
  - URL: `https://pravaah-upsc.vercel.app`
  - **Live Vulnerability Status:** `GET /api/v1/analytics/dashboard` remains open without authentication because `dca37bd` lacks the hotfix session guard.
- **Preview Deployment:**
  - Deployment ID: `dpl_7qEjdSqmH5Q7xpWoD3DES46oJRSH`
  - Commit: `f2b6df6` on `hotfix/live-analytics-auth-guard`
  - Status: **READY**
  - Deployment Protection: Vercel SSO enabled.

---

## 3. Session Schema Inspection (Authoritative Neon Database)

A direct, read-only empirical query was executed against the live Neon PostgreSQL database:

### A. Column Definitions (`public."Session"`):
| Column Name | Data Type | Nullable | Default | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `text` | NO | None | `PRIMARY KEY (Session_pkey)` |
| `userId` | `text` | NO | None | Foreign Key referencing `User(id)` |
| `tokenHash` | `text` | NO | None | `UNIQUE (Session_tokenHash_key)` |
| `expiresAt` | `timestamp without time zone` | NO | None | Timestamp expiration |
| `createdAt` | `timestamp without time zone` | NO | `CURRENT_TIMESTAMP` | Default creation timestamp |
| `isRevoked` | `boolean` | NO | `false` | Default active state |

### B. Foreign Key Constraints:
- Constraint Name: `Session_userId_fkey`
- Definition: `FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE`
- Verification: **100% MATCH against `prisma/schema.prisma`**.

### C. Live Indexes in Neon:
| Index Name | Index Definition | Prisma Schema Mapping | Status in Neon |
| :--- | :--- | :--- | :--- |
| `Session_pkey` | `CREATE UNIQUE INDEX "Session_pkey" ON public."Session" USING btree (id)` | `@id` | **EXISTS** |
| `Session_tokenHash_key` | `CREATE UNIQUE INDEX "Session_tokenHash_key" ON public."Session" USING btree ("tokenHash")` | `@unique` | **EXISTS** |
| `Session_tokenHash_idx` | `CREATE INDEX "Session_tokenHash_idx" ON public."Session" USING btree ("tokenHash")` | `@@index([tokenHash])` | **EXISTS** |
| `Session_userId_idx` | `CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId")` | `@@index([userId])` | **EXISTS** |

> [!IMPORTANT]
> **Schema Parity Confirmed:** The live Neon database already contains the complete `Session` table, all 6 columns, both the unique `tokenHash` constraint (`Session_tokenHash_key`) and the explicit non-unique index (`Session_tokenHash_idx`), the `userId` index, and the cascade foreign key constraint.

---

## 4. Migration SQL Consistency Analysis

### Comparison: `schema.prisma` vs. `migration.sql` vs. Live Neon Reality:
1. **Initial Discrepancy Found:** The Prisma schema defined both `@unique` and `@@index([tokenHash])` on `tokenHash`. The initial `migration.sql` script created `Session_tokenHash_key` (unique) and `Session_userId_idx`, but omitted the explicit `Session_tokenHash_idx`.
2. **Reconciliation Action:** `prisma/migrations/20261101150000_add_session_model/migration.sql` was updated to include:
   ```sql
   -- 2b. Create Performance Index on tokenHash
   CREATE INDEX IF NOT EXISTS "Session_tokenHash_idx" ON "Session"("tokenHash");
   ```
3. **Harmonization Result:** The migration SQL file is now 100% consistent with `prisma/schema.prisma` AND 100% consistent with the live indexes already established in Neon.

---

## 5. Prisma Migration History Assessment (`_prisma_migrations`)

An empirical inspection of Neon database catalog tables revealed:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = '_prisma_migrations';
-- Result: 0 rows (Table does NOT exist)
```

### Implications & Architecture Evaluation:
- **Root Cause:** The authoritative Neon database was established without Prisma Migrate (likely via direct DDL execution, database dump import, or `prisma db push` during early development).
- **Evaluating Migration Actions:**
  1. **Applying Migration (`prisma migrate deploy`):**  
     **PROHIBITED.** Because `_prisma_migrations` does not exist, running `prisma migrate deploy` would assume an empty database and attempt to create all initial tables from scratch, resulting in `table already exists` aborts or unexpected behavior.
  2. **Resetting Database (`prisma migrate reset`):**  
     **STRICTLY FORBIDDEN.** Would truncate/drop all 49 tables and destroy all 310 learners, 228 sessions, 55 subscriptions, and 46 payments.
  3. **Marking Migration as Applied (`prisma migrate resolve`):**  
     Requires an existing `_prisma_migrations` table.
  4. **Recommended Safe Procedure for Production Release:**  
     In `package.json`, the production build command is `"build": "prisma generate && next build"`. It does **not** execute `prisma migrate deploy`. Prisma Client runtime operates purely via typed SQL queries against existing tables. Because all 49 tables and the `Session` table with 228 live sessions already exist in Neon, **no migration execution is needed for this release**.

---

## 6. Neon Preview Database Isolation

| Environment | Variable Name | Configured Target Host | Branch Isolation Status |
| :--- | :--- | :--- | :--- |
| **Production** | `NEON_DATABASE_URL` | `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb` | Authoritative Primary Branch (`main`) |
| **Preview** | `NEON_DATABASE_URL` | `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb` | **SHARED (Warning: Not Isolated)** |
| **Development**| `NEON_DATABASE_URL` | Local `.env` | Local Machine |

### Operational Rule Enforced:
Because Preview currently points directly to the live production database, automated write tests, synthetic user generation, and dummy checkout tests on Preview are **strictly paused** to prevent pollution or data corruption of real student records.

---

## 7. Historical Secret Audit

A deep Git history audit across all commits in the repository was executed:

| Target File | Commits Involved | Secret Category | Historical Finding & Status |
| :--- | :--- | :--- | :--- |
| `docs/DAY_4_4_3_NEON_PREVIEW_VALIDATION.md` | Commit `a3a45c5` | Neon DB Password (`neondb_owner`) | **ROTATED & REVOKED.** The exposed password was rotated in the Neon Console. The old password was verified dead; new credentials authenticate cleanly. File sanitized locally in commit `4c1ee90`. |
| `.env.production` | Commits `d889358` to `fee8e83` | Auth Secret (`NEXTAUTH_SECRET`) | **UNTRACKED FROM GIT.** Safely removed from Git tracking in commit `fee8e83` while preserved on local disk. Owner should ensure the Vercel Dashboard uses a fresh 32-char random secret. |
| `.env` | All commits | Environment Secrets | **VERIFIED CLEAN.** `.env` was never committed to Git in any commit in the repository history. |
| Payment Secrets | Commits `0b68b3f`, `eb4e131` | Payment Gateway Keys | **VERIFIED CLEAN.** Only documentation template placeholders (`rzp_live_xxxxxxxxxxxx`) exist. No real production merchant keys were ever committed. |

---

## 8. Security Regression & Build Results

All safe, non-destructive checks were executed locally:

| Validation Suite | Command | Result | Verification Notes |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | **PASS** | Valid schema syntax, PostgreSQL datasource |
| **Prisma Client Generation** | `npx prisma generate` | **PASS** | Generated `@prisma/client` v5.22.0 in 220ms |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 compilation errors across codebase |
| **UPSC Scoring Suite** | `node --test tests/scoring.test.mjs` | **PASS** | 3/3 tests passed (GS1 & CSAT scoring models) |
| **Pure Cryptographic Security Suite** | `node --test tests/auth_security_pure.test.mjs` | **PASS** | 5/5 tests passed (scrypt, tokens, webhooks, timing safety) |
| **Next.js Production Build** | `npm run build` | **PASS** | All 32 static and dynamic routes compiled successfully |

---

## 9. Pull Request Readiness

An audit of open pull requests on `Aradhy20/pravaah-upsc` confirms:
- **PR #1:** `day3-saas-subscription` into `main` (Day 3 Feature PR — Unrelated).
- **PR #2:** `Vercel Speed Insights` into `main` (Speed Insights PR — Unrelated).
- **Dedicated Hotfix PR:** Ready for creation.

### One-Click PR Creation Details:
- **Base Branch:** `main`
- **Head Branch:** `hotfix/live-analytics-auth-guard`
- **Proposed Title:** `fix(security): release production authentication and Neon database hotfix`
- **One-Click GitHub PR Link:**  
  [Create Dedicated Hotfix PR on GitHub](https://github.com/Aradhy20/pravaah-upsc/compare/main...hotfix/live-analytics-auth-guard?expand=1)

---

## 10. Exact Remaining Owner Actions

### Action 1: Create Neon Preview Branch (Recommended for Clean Isolation)
1. In [console.neon.tech](https://console.neon.tech/), create a child branch named `preview` from `main`.
2. In [vercel.com](https://vercel.com/) → project `pravaah-upsc` → **Settings** → **Environment Variables**:
   - Set `NEON_DATABASE_URL` for **Preview**: Points to the `preview` branch connection string.
   - Keep `NEON_DATABASE_URL` for **Production**: Points to the primary `main` branch.

### Action 2: Create Pre-Release Neon Snapshot
- In Neon Console, create branch `backup-pre-day4-release` from `main` to ensure an instantaneous point-in-time recovery point.

### Action 3: Open and Merge the Dedicated Hotfix PR
1. Open the [GitHub Hotfix PR Link](https://github.com/Aradhy20/pravaah-upsc/compare/main...hotfix/live-analytics-auth-guard?expand=1).
2. Review the diff and click **Create pull request** → **Merge pull request**.
3. Vercel will automatically build the merged commit and deploy it to `https://pravaah-upsc.vercel.app` backed by Neon PostgreSQL.

---

### Final Safety Statement

- No production database records were altered, deleted, or migrated.
- No pull requests were merged.
- No production deployments were executed.
- Antigravity has paused execution and is waiting for explicit owner approval.

