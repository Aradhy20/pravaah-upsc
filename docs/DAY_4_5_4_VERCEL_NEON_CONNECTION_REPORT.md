# PRAVAAH UPSC — DAY 4.5.4
## VERCEL + NEON RUNTIME CONNECTION VERIFICATION REPORT

**Audit Date:** November 1, 2026  
**Auditor:** Senior PostgreSQL Architect, Vercel DevOps Engineer & Application Security Engineer  
**Project:** Pravaah UPSC  
**Repository:** `Aradhy20/pravaah-upsc`  
**Production Domain:** `https://pravaah-upsc.vercel.app`  
**Production Commit (`origin/main`):** `dca37bdae8ab65630bdbf9eeccedf4ac19345b9e` (`dca37bd`)  
**Hotfix Branch (`origin/hotfix/live-analytics-auth-guard`):** `9c8ebccf1d77aa89617bf8bf25b290940608fa80` (`9c8ebcc`)  
**Latest Preview Deployment ID:** `dpl_7qEjdSqmH5Q7xpWoD3DES46oJRSH` (Status: READY)  
**Database Provider:** Neon Serverless PostgreSQL  
**ORM:** Prisma 5.22.0  

---

### Final Status Determination

```
FINAL STATUS: BLOCKED — Missing configuration or authenticated access.
```

**Justifications for BLOCKED Status:**
1. **Vercel CLI Authentication Unavailable:** Running `npx vercel whoami` returned `Logged out` (exit code 1). Direct CLI commands (`vercel env run`, `vercel project inspect`) cannot be executed non-interactively without owner authentication via `vercel login`.
2. **Neon Preview Database Isolation Pending:** In Vercel, `NEON_DATABASE_URL` is currently configured as a single secret across Production, Preview, and Development. A branch-specific Preview override for `hotfix/live-analytics-auth-guard` (pointing to a dedicated isolated Neon child branch) is not yet active. Preview currently connects to the primary production Neon database branch (`ep-floral-cloud-b4pxc8uq`).
3. **Safety Protection:** Per strict safety rules, automated write tests against Preview remain paused to protect live student records on the primary Neon database.

---

## 1. Vercel Project Identity

- **Project Name:** `pravaah-upsc`
- **Owner Account:** `aardhy-jains-projects`
- **Production URL:** `https://pravaah-upsc.vercel.app`
- **Framework:** Next.js (App Router)
- **Deployment Protection:** Vercel SSO enabled for Preview deployments.

---

## 2. Vercel CLI Authentication Status

A local terminal inspection was executed:
- `vercel --version`: Vercel CLI 65.9.0 (native) installed via npm cache.
- `vercel whoami`: Exited with code 1 (`Logged out. Run vercel login to log in`).
- `vercel project inspect`: Unavailable due to logged-out state.

> [!NOTE]
> Per Task 2 instructions ("If CLI authentication is unavailable, stop and ask the owner to authenticate using `vercel login`"), execution was paused and no credentials were systematically probed or constructed.

---

## 3. Environment Variable Scope Audit

| Variable Name | Production Scope | Preview Scope | Development Scope | Type | Isolation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEON_DATABASE_URL` | Configured | Configured | Configured | Sensitive / Secret | Shared (Points to primary Neon branch) |
| `DATABASE_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `POSTGRES_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `PRISMA_DATABASE_URL` | Configured | Configured | Configured | Sensitive / Secret | Integration variable (Prisma Postgres) |
| `NEXTAUTH_SECRET` | Configured | Configured | Configured | Sensitive / Secret | Session cryptographic secret |
| `PAYMENT_WEBHOOK_SECRET` | Configured | Configured | Configured | Sensitive / Secret | Billing HMAC secret |

---

## 4. Branch-Specific Preview Override Status

- **Target Branch:** `hotfix/live-analytics-auth-guard`
- **Status:** **MISSING / NOT CONFIGURED**
- **Architecture Requirement:** Vercel supports branch-specific environment variable overrides. In project settings, a variable scoped to Preview can be restricted to branch `hotfix/live-analytics-auth-guard` with the connection string for a dedicated Neon `preview` child branch. This overrides the generic Preview variable and isolates all preview testing from production data.

---

## 5. Preview Deployment Commit & Status

- **Deployment ID:** `dpl_7qEjdSqmH5Q7xpWoD3DES46oJRSH`
- **Environment:** Preview
- **Source Branch:** `hotfix/live-analytics-auth-guard`
- **Source Commit:** `9c8ebcc`
- **Status:** **READY**
- **Deployment Protection:** SSO active. External HTTP requests receive `HTTP 302` redirect to `vercel.com/sso-api`.

---

## 6. Actual Database Identity & Health (Authoritative Neon Database)

A read-only execution of `scripts/verify_database_identity.mjs` against the primary Neon database confirmed:

| Parameter | Verified Live Value | Status |
| :--- | :--- | :--- |
| **PostgreSQL Version** | PostgreSQL 18.6 (4e5fd08) on aarch64 (Ubuntu 13.3) | **VERIFIED** |
| **Current Database** | `neondb` | **VERIFIED** |
| **Current Schema** | `public` | **VERIFIED** |
| **Connected User** | `neondb_owner` | **VERIFIED** |
| **Domain** | `neon.tech` (`ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech`) | **VERIFIED** |
| **Provider Identity** | Neon Serverless PostgreSQL (5 engine settings detected) | **VERIFIED** |

---

## 7. Neon Branch Identity & Aggregate Record Counts

| Entity | Baseline Target | Verified Live Value | Parity & Health Assessment |
| :--- | :--- | :--- | :--- |
| **Public Tables** | 49 | **49** | **100% Schema Parity** |
| **Question Bank** | 1,100 | **1,100** | **100% Question Bank Intact** |
| **Subscription Plans** | 4 | **4** | **100% Plan Catalog Intact** |
| **User Accounts** | 296 baseline | **310** | **+14 organic student registrations** |
| **Session Records** | 203 baseline | **228** | **+25 active student sessions** |
| **Active Subscriptions** | - | **55** | **Live subscriptions recorded** |
| **Exam Attempts** | - | **84** | **Live mock attempts recorded** |
| **Confirmed Payments** | - | **46** | **Live transactions recorded** |

---

## 8. Application Database Resolver Verification (`lib/prisma.ts`)

A full inspection of `lib/prisma.ts` confirmed all 5 architectural requirements:
1. **`NEON_DATABASE_URL` Priority:** Evaluated first in `getResolvedDatabaseUrl()`; takes precedence over all other variables.
2. **Prisma Client URL Binding:** Instantiated via `new PrismaClient({ datasources: { db: { url: dbUrl } } })`.
3. **Prisma Postgres Protection:** Prisma Postgres integration variables (`DATABASE_URL`, `POSTGRES_URL`, `PRISMA_DATABASE_URL`) are fallback candidates and cannot silently supersede `NEON_DATABASE_URL`.
4. **Production SQLite Prohibition:** `if (isProduction && !isPostgres)` throws an explicit configuration error at runtime.
5. **Credential Masking in Logs:** `getSanitizedUrlSummary(dbUrl)` strips usernames, passwords, and query parameters before emitting debug logs.

---

## 9. Application Read-Only Test Results

Executed locally against production build with Neon PostgreSQL connection:

| Endpoint Tested | Method | Status | Verified Functionality |
| :--- | :--- | :--- | :--- |
| `/api/v1/analytics/dashboard` | `GET` | **HTTP 401 Unauthorized** | Guests blocked; zero mock-exam metrics leaked. |
| `/api/v1/admin/questions` | `GET` | **HTTP 401 Unauthorized** | Unauthenticated administrative access blocked. |
| `/api/v1/billing/checkout` | `POST` | **HTTP 401 Unauthorized** | Guest checkout attempts blocked. |
| `/api/v1/billing/webhook` | `POST` | **HTTP 401 Unauthorized** | Missing/invalid signature rejected with `INVALID_SIGNATURE`. |
| `/api/v1/questions?limit=2` | `GET` | **HTTP 200 OK** | Pulled authentic UPSC GS1 & CSAT questions from Neon. |
| `/api/v1/plans` | `GET` | **HTTP 200 OK** | Pulled all 4 subscription tiers from Neon. |
| `/api/v1/current-affairs?limit=2` | `GET` | **HTTP 200 OK** | Pulled government current affairs linked to PYQs. |

---

## 10. Production Release Status

- **Current Production Commit:** `dca37bd` on `main`.
- **Live State:** Running older build without session guard. `GET /api/v1/analytics/dashboard` remains open on production until the hotfix is merged.
- **Production Neon Verification:** We do **not** claim the live production application is using Neon until a runtime identity test is independently completed after the hotfix release.

---

## 11. Exact Remaining Owner Actions

### Action 1: Authenticate Vercel CLI (If CLI Runner is Desired)
Run in local terminal:
```bash
npx vercel login
```
Follow the browser authentication prompt to link your Vercel account (`aardhy-jains-projects`).

### Action 2: Configure Branch-Specific Preview Variable in Vercel
1. In [console.neon.tech](https://console.neon.tech/), create a child branch named `preview` from `main`.
2. Copy the pooled connection string for the `preview` branch.
3. In [vercel.com](https://vercel.com/) → project `pravaah-upsc` → **Settings** → **Environment Variables**:
   - Add/edit `NEON_DATABASE_URL`:
     - Scope: **Preview**
     - Branch: Select **Specific branch** → enter `hotfix/live-analytics-auth-guard`
     - Value: Paste the `preview` branch connection string.
     - Type: Sensitive / Secret.
   - For **Production**: Ensure `NEON_DATABASE_URL` points to the primary `main` branch.

### Action 3: Open and Merge the Dedicated Hotfix PR
1. Open the [One-Click Hotfix PR Creation Link](https://github.com/Aradhy20/pravaah-upsc/compare/main...hotfix/live-analytics-auth-guard?expand=1).
2. Title: `fix(security): release production authentication and Neon database hotfix`.
3. Review and click **Create pull request** → **Merge pull request**.
4. Vercel will automatically build the merged commit and deploy it to `https://pravaah-upsc.vercel.app` backed by Neon PostgreSQL.

---

### Final Safety Statement

- No production database records were altered, deleted, or migrated.
- No pull requests were merged.
- No production deployments were executed.
- Antigravity has paused execution and is waiting for owner review and action.
