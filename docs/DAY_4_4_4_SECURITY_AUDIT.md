# PRAVAAH UPSC — DAY 4.4.4
## SECURITY AUDIT, SECRET CLEANUP & NEON CONNECTION DIAGNOSIS REPORT

**Audit Date:** November 1, 2026  
**Auditor:** Senior Full-Stack Engineer, Database Security Engineer & DevOps Auditor  
**Project:** Pravaah UPSC  
**Repository:** `Aradhy20/pravaah-upsc`  
**Current Branch:** `hotfix/live-analytics-auth-guard`  
**Head Commit:** `a3a45c5b5b7e25618112f2cd193f784ffd74004c` (`a3a45c5`)  

---

### Executive Summary & Final Status

```
FINAL STATUS: CRITICAL — Credential exposure or security issue requires owner action.
```

**Reasoning:**
1. A live database credential was accidentally included in the Day 4.4.3 validation documentation and committed in commit `a3a45c5`.
2. Commit `a3a45c5` has been pushed to the remote repository on GitHub (`origin/hotfix/live-analytics-auth-guard`).
3. While the local working file has been sanitized immediately with safe placeholders, the credential remains visible in GitHub commit history.
4. The exposed credential **must be rotated immediately in the Neon Console** by the owner.
5. In addition, the exact Neon endpoint hostname corresponding to the active project/branch has not yet been designated, preventing independent connection verification.

---

## 1. Credential Exposure Findings

During the Day 4.4.4 security audit, an automated scan of Git-tracked files and commit logs detected the presence of an active Neon database credential string in repository documentation.

| Finding Attribute | Details |
| :--- | :--- |
| **Exposed Secret Type** | Neon PostgreSQL Database User Password (`npg_...`) |
| **Exposed Database Role** | `neondb_owner` |
| **File Location** | `docs/DAY_4_4_3_NEON_PREVIEW_VALIDATION.md` |
| **Commit ID** | `a3a45c5b5b7e25618112f2cd193f784ffd74004c` (`a3a45c5`) |
| **Commit Message** | `feat(db): prioritize NEON_DATABASE_URL over Prisma Postgres integration and add identity verification` |
| **Affected Line Numbers** | Lines 22, 70, 150, and 154 |
| **Secret Display Policy** | Strictly redacted. Actual plaintext password is NOT displayed in any logs, reports, or terminal outputs per security policy. |

---

## 2. GitHub History & Exposure Scope

- **Pushed Status:** **CONFIRMED PUSHED TO GITHUB**
- **Remote:** `origin/hotfix/live-analytics-auth-guard`
- **Remote Commit SHA:** `a3a45c5b5b7e25618112f2cd193f784ffd74004c`
- **Impact Assessment:**
  - Anyone with read access to the GitHub repository can view the secret in the commit diff or commit history of branch `hotfix/live-analytics-auth-guard`.
  - Simply editing or committing a redacted file to HEAD does **not** erase the commit from GitHub's historical tree or commit log.
  - The exposed password must be treated as permanently compromised and rotated in the Neon Console immediately.
  - No force-pushing or historical rewriting (`git filter-repo`, `git rebase`) was executed during this audit, adhering to safety rules that require explicit owner sign-off.

---

## 3. Files Requiring Cleanup & Current Sanitization Status

| File | Status in Working Tree | Description |
| :--- | :--- | :--- |
| `docs/DAY_4_4_3_NEON_PREVIEW_VALIDATION.md` | **Sanitized Locally** | All occurrences of the raw secret replaced with `<REDACTED>` and `<REDACTED_PASSWORD>`. Verified `git grep -i "npg_"` yields 0 matches across tracked files. |
| `.env.example` | **Verified Clean** | Contains only standard documentation placeholders (`postgresql://neondb_owner:your_password@ep-xyz-pooler...`). |
| `docs/DEPLOYMENT_AND_SECURITY.md` | **Verified Clean** | Contains only generic documentation placeholders. |
| `docs/PRODUCTION_READINESS.md` | **Verified Clean** | Contains only generic documentation placeholders. |
| `scripts/verify_database_identity.mjs` | **Verified Clean** | Contains regex-based credential masking for any runtime log output (`getSanitizedUrlSummary`). |

---

## 4. Database Configuration Audit

A rigorous architectural review of Prisma and database configuration across `lib/prisma.ts`, `prisma/schema.prisma`, `.env.example`, and `scripts/verify_database_identity.mjs` was conducted:

1. **`NEON_DATABASE_URL` Prioritization:**
   - In `lib/prisma.ts`, `process.env.NEON_DATABASE_URL` is evaluated first in the resolution chain.
   - Priority sequence: `NEON_DATABASE_URL` > `DATABASE_URL` > `POSTGRES_PRISMA_URL` > `POSTGRES_URL` > `PRISMA_DATABASE_URL`.
   - This ensures that Vercel's automatic Prisma Postgres integration variables do not silently intercept or replace the authoritative Neon database.

2. **Runtime Engine Synchronization:**
   - `lib/prisma.ts` explicitly synchronizes `process.env["DATABASE_URL"] = dbUrl` at runtime.
   - This guarantees that both the Prisma schema datasource reference `env("DATABASE_URL")` and runtime Prisma Client connect to the identical resolved database.

3. **Strict Prohibition of Production SQLite Fallback:**
   - `lib/prisma.ts` contains an explicit runtime safeguard:
     ```typescript
     if (isProduction && (dbUrl.startsWith("file:") || dbUrl.startsWith("sqlite:"))) {
       throw new Error("Production database must be PostgreSQL. SQLite fallback is strictly prohibited in production.");
     }
     ```
   - This permanently prevents accidental serverless filesystem write crashes on Vercel.

4. **Credential Masking in Diagnostic Logs:**
   - `getSanitizedUrlSummary(dbUrl)` strips username, password, and query parameters before emitting any debug connection log.
   - Example sanitized format: `postgresql://neondb_owner:***@ep-xxxx-pooler.../neondb`.

5. **Prisma Schema Configuration:**
   - `prisma/schema.prisma` declares:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Schema validation confirmed valid and fully compatible with PostgreSQL.

---

## 5. Neon Connection Failure Diagnosis

### Root Cause Analysis
During previous verification attempts in Day 4.4.3, connection attempts using user `neondb_owner` failed against endpoint candidates `ep-floral-cloud-b4pxc8uq` and `ep-sweet-butterfly-a187a544` with:
```
password authentication failed for user "neondb_owner"
```
Furthermore, connection attempts to `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech:5432` timed out with:
```
Can't reach database server at `ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech:5432`
```

### Missing Connection Parameters
Per safety rules, no random endpoint hostnames or credentials were systematically guessed. The following parameters are missing and must be retrieved directly from the Neon Console:
1. **Accurate Pooled Hostname (`PGHOST`):** The active endpoint ID (e.g., `ep-[name]-pooler.[region].aws.neon.tech`). Legacy endpoint `ep-floral-cloud-b4pxc8uq` is unreachable or belongs to a different project/state.
2. **Neon Project & Branch ID:** Confirmation of the exact project and branch hosting the authoritative 49 tables, 296 users, and 203 sessions.
3. **Database Name:** Typically `neondb`.
4. **Current Active Role & Rotated Password:** Because the previous password was exposed in commit `a3a45c5`, a newly rotated password is required.
5. **SSL Requirement:** Neon requires `sslmode=require`.

---

## 6. Vercel Preview Configuration Status

An inspection of the Vercel project configuration confirms:
- **`NEON_DATABASE_URL`:** Currently **MISSING** in the Vercel project settings.
- **Active Prisma Postgres Variables:** Vercel currently has `DATABASE_URL`, `POSTGRES_URL`, and `PRISMA_DATABASE_URL` injected by the Prisma Postgres marketplace integration.
- **Required Scope:** `NEON_DATABASE_URL` must be added for **Preview** environment scope (and later Production upon final verification).
- **Security Flag:** When added in Vercel, the `NEON_DATABASE_URL` variable must have the **Sensitive / Secret** attribute enabled so it cannot be inspected or leaked in logs.

---

## 7. Build, Static Analysis & Test Results

All safe non-destructive checks were executed locally.

| Validation Check | Tool / Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Prisma Schema Validation** | `npx prisma validate` | **PASS** | Valid schema syntax, valid PostgreSQL provider. |
| **Prisma Client Generation** | `npx prisma generate` | **PASS** | Generated `@prisma/client` v5.22.0 in 218ms. |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | Exited code 0; zero type errors across the codebase. |
| **Production Build** | `npm run build` | **PASS** | Successfully built all 32 static/dynamic routes (`Compiled successfully`). |
| **Standalone Scoring Unit Tests** | `node --test tests/scoring.test.mjs` | **PASS** | Verified GS1 scoring (+2.0 / -0.666), CSAT scoring (+2.5 / -0.833), zero/negative handling (3/3 pass). |
| **Database-Dependent Test Suite** | `npm test` | **EXPECTED FAIL** | Fails with `Can't reach database server at ep-floral-cloud-b4pxc8uq-pooler...` because local `.env` references the legacy unreachable endpoint. |

> **Critical Engineering Distinction:**  
> A successful local build and TypeScript check proves application syntactic and bundle health. It does **NOT** prove live Neon PostgreSQL database connectivity. Live database connectivity remains unverified until valid Neon credentials and endpoint hostnames are supplied.

---

## 8. Current Git Status

- **Branch:** `hotfix/live-analytics-auth-guard`
- **Tracking:** `origin/hotfix/live-analytics-auth-guard`
- **Head Commit:** `a3a45c5b5b7e25618112f2cd193f784ffd74004c`
- **Uncommitted Changes in Working Tree:**
  - `modified: docs/DAY_4_4_3_NEON_PREVIEW_VALIDATION.md` (Credential redaction / cleanup).
  - `untracked: docs/DAY_4_4_4_SECURITY_AUDIT.md` (This audit report).
- **Git History Integrity:** No rebasing, resetting, squash, or force-push has been executed. Working tree is held in a safe review state.

---

## 9. Exact Next Actions Required from the Owner

The owner must take the following specific, secure steps without sharing secrets in chat:

### Step 1: Rotate Password in Neon Console (Immediate P0)
1. Open the [Neon Console](https://console.neon.tech/).
2. Select the **Pravaah UPSC** project.
3. In the left navigation, go to **Roles**.
4. Locate the `neondb_owner` role (or the application role).
5. Click the three dots `...` next to the role and select **Reset password**.
6. Immediately invalidate the compromised password.

### Step 2: Retrieve the Complete Pooled Connection String
1. In the Neon Console, go to **Dashboard**.
2. Under **Connection Details**, ensure:
   - Branch: Active production branch (e.g., `main`).
   - Database: `neondb`.
   - Role: `neondb_owner`.
   - Checkbox: **Connection pooling** is checked.
3. Copy the pooled connection string. It will follow this format:
   ```
   postgresql://neondb_owner:<NEW_PASSWORD>@ep-<name>-pooler.<region>.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Configure Vercel Preview Environment
1. In the [Vercel Dashboard](https://vercel.com/), select the `pravaah-upsc` project.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add a new variable:
   - **Key:** `NEON_DATABASE_URL`
   - **Value:** `<YOUR_FULL_POOLED_CONNECTION_STRING>`
   - **Environments:** Check **Preview** (uncheck Production for now).
   - **Type:** Sensitive / Secret.
4. Click **Save**.

### Step 4: Local Environment Update (If Local Testing Desired)
- If testing locally, update `NEON_DATABASE_URL` in `.env` (never commit `.env`).
- Run `node scripts/verify_database_identity.mjs` to safely verify schema tables (49 tables, 296 users, 203 sessions) without exposing secrets.

### Step 5: Git History Remediation Decision
- Decide whether to rewrite Git history for branch `hotfix/live-analytics-auth-guard` to remove commit `a3a45c5`'s exposed diff, or if rotating the password in Neon is considered sufficient risk mitigation for this private/preview repository.

---

## 10. Unresolved Security Risks

1. **Compromised Credential in GitHub History:**
   - Commit `a3a45c5` exists on GitHub remote. Until the password is reset in Neon Console (Step 1 above), any entity with repository access could theoretically authenticate if the endpoint hostname is discovered.
2. **Dormant / Missing Endpoint Configuration:**
   - Until `NEON_DATABASE_URL` is set in Vercel Preview with the correct pooled hostname and rotated password, Preview deployments cannot connect to the authoritative Neon database.
3. **Database Write Blocking in Production:**
   - Production (`main`) is currently using commit `dca37bd` with the SQLite fallback issue. Deploying the hotfix with proper `NEON_DATABASE_URL` is required to restore student login sessions and billing writes in production.

---

### Final Instruction Compliance

Per prompt instructions:
- No database writes, resets, migrations, or destructive commands were executed.
- No database credentials or passwords were printed or logged.
- No force-pushing, rebasing, or branch merging was executed.
- Antigravity has stopped and is waiting for owner approval before taking further action.

