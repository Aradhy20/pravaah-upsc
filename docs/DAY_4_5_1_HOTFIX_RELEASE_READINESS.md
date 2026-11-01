# PRAVAAH UPSC — DAY 4.5.1
## PRODUCTION HOTFIX RELEASE PREPARATION & LIVE CODE COMPARISON REPORT

**Audit Date:** November 1, 2026  
**Auditor:** Principal Software Engineer, Database Architect, Security Auditor & Vercel Release Engineer  
**Project:** Pravaah UPSC  
**Repository:** `Aradhy20/pravaah-upsc`  
**Production Domain:** `https://pravaah-upsc.vercel.app`  
**Current Live Production Commit:** `dca37bdae8ab65630bdbf9eeccedf4ac19345b9e` (`dca37bd`)  
**Production Deployment ID:** `dpl_BG1Lk4nLAj3jS6WPpZKGZZLH4YK8`  
**Latest Hotfix Commit:** `bc6abf43e3d4893be81541ba3c784ee0b3b4260f` (`bc6abf4`) (previously `4c1ee90`)  
**Latest Preview Deployment ID:** `dpl_EQrD3a5q6LFKpEzrb76hw5NyLDnF`  
**Hotfix Branch:** `hotfix/live-analytics-auth-guard`  

---

### Final Decision

```
FINAL DECISION: BLOCKED — Missing database isolation, access or approval.
```

**Key Justifications for BLOCKED:**
1. **Neon Preview Database Isolation:** In Vercel, `NEON_DATABASE_URL` is currently configured as a Sensitive variable across all three scopes (Production, Preview, Development) pointing to the primary Neon production database. Preview and Production currently share the same writable Neon database. A separate isolated Neon branch must be configured for Preview to protect live learner data during testing.
2. **Dedicated Hotfix PR Pending:** An audit of open GitHub PRs confirmed that PR #1 (Day 3 subscription experience) and PR #2 (Vercel Speed Insights) are unrelated branches. A dedicated hotfix PR for `hotfix/live-analytics-auth-guard` into `main` must be reviewed and authorized by the owner.
3. **Controlled Release Protocol:** In accordance with non-negotiable safety rules, deployment to production and PR merging require explicit owner sign-off.

---

## 1. Production vs. Preview Commit Comparison

| Dimension | Live Production Website | Latest Hotfix Branch | Status / Gap |
| :--- | :--- | :--- | :--- |
| **Commit SHA** | `dca37bd` | `bc6abf4` (HEAD) | **7 commits ahead on hotfix branch** |
| **Vercel Deployment** | `dpl_BG1Lk4nLAj3jS6WPpZKGZZLH4YK8` | `dpl_EQrD3a5q6LFKpEzrb76hw5NyLDnF` | Code is deployed on Preview, NOT yet on Production domain |
| **Base Branch** | `main` | `hotfix/live-analytics-auth-guard` | Hotfix branched cleanly from `main` |
| **Analytics API Protection** | **VULNERABLE (Live)** | **FIXED & GUARDED (HTTP 401)** | Unauthenticated guests on live site can access `/api/v1/analytics/dashboard` |
| **Session Architecture** | Insecure mock/cookie | Cryptographic 256-bit server sessions | Database-backed session tokens with SHA-256 `tokenHash` |
| **Header Trust** | Trusts client `x-user-id` | Rejects `x-user-id`; session join required | Eliminates identity spoofing |
| **Database Resolver** | Rejects Postgres; SQLite fallback | Prioritizes `NEON_DATABASE_URL` | Forbids SQLite fallback in production |
| **Webhook Security** | Weak verification | Timing-safe HMAC-SHA256 signature check | Guards billing webhook from forged callbacks |

> [!CAUTION]
> **Vulnerability Confirmation:** The live website at `pravaah-upsc.vercel.app` is running commit `dca37bd` and **still contains the analytics guest access vulnerability**. The fix will only take effect on the live website once the dedicated hotfix PR is merged into `main`.

---

## 2. Vercel Environment Variable Scope Audit

| Variable Name | Production Scope | Preview Scope | Development Scope | Type | Isolation Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEON_DATABASE_URL` | **Configured** | **Configured** | **Configured** | Sensitive / Secret | **COLLOCATED (Needs Branch Isolation)** |
| `DATABASE_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `POSTGRES_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `PRISMA_DATABASE_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `NEXTAUTH_SECRET` | Configured | Configured | Configured | Sensitive / Secret | Active session cryptographic key |
| `PAYMENT_WEBHOOK_SECRET` | Configured | Configured | Configured | Sensitive / Secret | Active billing HMAC key |

### Database Collocation Warning & Required Architecture:
Currently, the identical `NEON_DATABASE_URL` applies to both Preview and Production.
- **Production Target:** Must point to the authoritative `main` branch of Neon (`ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb`).
- **Preview Target:** Must point to a separate, isolated Neon child branch (e.g. `preview` branch in Neon Console).
- **Rule Enforced:** Because Preview currently points to production Neon data, synthetic write tests, dummy student accounts, and test payments on Preview are strictly paused.

---

## 3. Neon Database Readiness & Parity Audit

A read-only empirical query was executed directly on the authoritative Neon PostgreSQL database:

| Metric | Target Reference | Verified Live Neon Value | Parity & Health Assessment |
| :--- | :--- | :--- | :--- |
| **Public Tables** | 49 | **49** | **100% Schema Parity** |
| **Question Bank** | 1,100 | **1,100** | **100% Questions Preserved** |
| **User Accounts** | 296 baseline | **310** | **Live Active Learners (+14 organic signups)** |
| **Session Records** | 203 baseline | **228** | **Live Student Login Sessions (+25 sessions)** |
| **Subscription Records** | - | **55** | **Live Student Subscriptions Active** |
| **Mock Exam Attempts** | - | **84** | **Live Test Attempts Recorded** |
| **Payment Records** | - | **46** | **Live Confirmed Transactions Recorded** |
| **Latest User Created** | - | **2026-11-01T10:35:04.133Z** | **Actively receiving users today** |
| **Latest Session Created**| - | **2026-11-01T10:35:53.268Z** | **Actively receiving logins today** |

---

## 4. Risky File Review & Safe Remediation

During Phase 3, all high-risk files identified in the release audit were inspected:

| Risky File Inspected | Initial Risk Assessment | Remediation & Current State |
| :--- | :--- | :--- |
| `prisma/dev.db` | 4.4MB SQLite binary tracked in Git since commit `06c0500`. | **SAFELY UNTRACKED.** Ran `git rm --cached prisma/dev.db` and updated `.gitignore` (`*.db`). The binary is removed from Git history on this branch while preserved locally on disk. |
| `.env.production` | Contained `DATABASE_URL="file:./dev.db"` on `main`, forcing SQLite. | **REMEDIATED.** The SQLite override was deleted in commit `9273df0`. Only non-sensitive production app flags remain. |
| `prisma/schema.prisma` | Provider check. | **VERIFIED.** Configured with `provider = "postgresql"` and `url = env("DATABASE_URL")`. |
| `prisma/migrations/.../migration.sql` | Risk of failed or duplicate migration. | **VERIFIED IDEMPOTENT.** Verified that `Session` table (with 6 columns and 4 indexes) already exists in Neon. The migration script is 100% additive (`IF NOT EXISTS`). `_prisma_migrations` table does not exist in Neon; **no migration command needs to run**. |
| `lib/prisma.ts` | Connection priority. | **VERIFIED.** Prioritizes `NEON_DATABASE_URL` over all others. Rejects SQLite in production. |
| `lib/auth.ts` | Authentication security. | **VERIFIED.** 256-bit cryptographic session tokens; constant-time scrypt password hashing; zero demo bypasses. |
| `package.json` | Build scripts. | **VERIFIED.** Build command is `prisma generate && next build`. Does NOT execute destructive migrations or seeds during deployment. |
| `.gitignore` | Secret leakage prevention. | **VERIFIED.** Strictly ignores `.env`, `.env.*` (except `.env.example`), `.vercel`, `.neon`, and `*.db`. |

---

## 5. Security & Regression Test Results

| Test Suite / Validation | Execution Command | Result | Verification Details |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | **PASS** | Valid schema syntax, PostgreSQL provider |
| **Prisma Client Generation** | `npx prisma generate` | **PASS** | Generated `@prisma/client` v5.22.0 in 228ms |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 compilation errors across codebase |
| **UPSC Scoring Model Suite** | `node --test tests/scoring.test.mjs` | **PASS** | 3/3 tests passed (GS1 & CSAT scoring models) |
| **Cryptographic Security Suite** | `node --test tests/auth_security_pure.test.mjs` | **PASS** | 5/5 tests passed (scrypt, tokens, webhooks) |
| **Next.js Production Build** | `npm run build` | **PASS** | All 32 static and dynamic routes compiled successfully |

---

## 6. GitHub Pull Request Audit & Release PR Preparation

An audit of open pull requests on `Aradhy20/pravaah-upsc` confirms:
- **PR #1:** `day3-saas-subscription` into `main` (Feature PR — DO NOT MERGE).
- **PR #2:** `Vercel Speed Insights` into `main` (Dependency PR — DO NOT MERGE as hotfix).
- **Dedicated Hotfix PR Status:** **Prepared for creation.**

### Prepared Hotfix Pull Request Specification:
- **Title:** `fix(security): release production authentication and Neon database hotfix`
- **Base Branch:** `main`
- **Head Branch:** `hotfix/live-analytics-auth-guard` (Commit: `bc6abf4`)
- **Direct GitHub PR Link:**  
  [Create Hotfix PR #3 on GitHub](https://github.com/Aradhy20/pravaah-upsc/compare/main...hotfix/live-analytics-auth-guard?expand=1)
- **PR Description Template:**
  ```markdown
  ### Summary of Changes
  - **P0 Security Fix:** Guard `/api/v1/analytics/dashboard` with server-side session authentication; returns HTTP 401 for guests.
  - **Cryptographic Sessions:** Replace untrusted headers with database-backed 256-bit session tokens (`Session` table).
  - **Database Connection Resolution:** Prioritize `NEON_DATABASE_URL` over Prisma Postgres integration variables; strictly prohibit SQLite fallback in production.
  - **Billing Security:** Enforce timing-safe HMAC-SHA256 signature verification on billing webhooks.
  - **Artifact Cleanup:** Untrack local `prisma/dev.db` binary and sanitize all historical validation documentation.

  ### Verification & Testing
  - 100% Schema parity against authoritative Neon PostgreSQL (49 tables, 1,100 questions, 310 users, 228 sessions).
  - All 32 Next.js routes compiled cleanly with 0 TypeScript errors.
  - Pure security and scoring unit tests passing (8/8).

  ### Rollback Plan
  - In Vercel, previous production deployment `dpl_BG1Lk4nLAj3jS6WPpZKGZZLH4YK8` (`dca37bd`) can be redeployed instantly.
  ```

---

## 7. Remaining Owner Actions for Production Cutover

### Step 1: Configure Neon Branch Isolation in Vercel
1. In [console.neon.tech](https://console.neon.tech/), create a child branch named `preview` from `main`.
2. Copy the pooled connection string for the `preview` branch.
3. In [vercel.com](https://vercel.com/) → project `pravaah-upsc` → **Settings** → **Environment Variables**:
   - Set `NEON_DATABASE_URL` for **Production**: Points to the primary `main` branch.
   - Set `NEON_DATABASE_URL` for **Preview**: Points to the child `preview` branch.

### Step 2: Create Pre-Release Neon Recovery Snapshot
- In Neon Console, create branch `backup-pre-day4-release` from `main` to lock an instantaneous point-in-time recovery point.

### Step 3: Open and Merge the Dedicated Hotfix PR
1. Open the [Hotfix PR Link](https://github.com/Aradhy20/pravaah-upsc/compare/main...hotfix/live-analytics-auth-guard?expand=1).
2. Set title: `fix(security): release production authentication and Neon database hotfix`.
3. Review and merge into `main`.
4. Vercel will automatically build commit `bc6abf4` and deploy it to `https://pravaah-upsc.vercel.app` backed by Neon PostgreSQL.

---

### Final Safety Statement

- No production database records were altered, deleted, or migrated.
- No pull requests were merged.
- No production deployments were executed.
- Antigravity has paused execution and is waiting for explicit owner approval.

