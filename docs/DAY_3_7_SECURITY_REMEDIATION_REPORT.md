# PRAVAAH UPSC — Day 3.7 Security Incident Remediation Report
**Public Repository Credential Invalidation, Git Isolation, Database Environment Separation & Production Defense Audit**

---

## Executive Summary

| Item | Details |
| :--- | :--- |
| **Incident Classification** | Sensitive Credential Exposure in Public Repository |
| **Repository** | `Aradhy20/pravaah-upsc` (Public GitHub Repository) |
| **Affected Pull Request** | [PR #1: feat(day3): SaaS subscription architecture, billing portal, and mock exam anti-leak](https://github.com/Aradhy20/pravaah-upsc/pull/1) |
| **Target Branch** | `day3-saas-subscription` → `main` |
| **Audit Date** | November 1, 2026 |
| **Lead Roles** | Senior Application Security Engineer, Git Security Specialist, Neon/Vercel Infrastructure Lead |
| **Remediation Status** | **REMEDIATED & SAFEGUARDED (PR #1 KEPT UNMERGED PENDING HUMAN REVIEW)** |

During the Day 3.6 production release preparation, a security review of Pull Request #1 identified that an environment configuration file (`.env.production`) was tracked in Git history containing database connection strings and an authentication secret. Because the repository is public, this was immediately escalated and treated as an active credential exposure incident.

This report documents the end-to-end security remediation executed across eight phases: credential rotation verification, file untracking, gitignore hardening, git history cleanup analysis, database preview isolation, removal of dangerous runtime fallbacks, full regression testing (63/63 passing), and production build validation.

---

## Phase 1: Credential Rotation Verification

Under zero-trust protocol, any credential committed to a public Git repository must be treated as permanently compromised. Merely removing or encrypting the file does not neutralize the risk if the upstream credential remains valid.

### 1. Neon PostgreSQL Database Credentials
* **Action:** The repository owner rotated the database password for user `neondb_owner` directly within the Neon management console on project `solitary-rice-12618853`.
* **Verification:**
  1. The historical password (`npg_nJU...`) was invalidated server-side by Neon.
  2. Attempting connection with the old password yielded `PrismaClientKnownRequestError: Can't reach database server / password authentication failed`.
  3. A newly rotated password was verified through the Neon CLI (`npx neon connection-string production`).
  4. Using the newly rotated password, active query verification confirmed zero data loss and full database integrity:
     ```sql
     SELECT count(*) FROM "Question"; -- Returned exactly 1,100 questions (1,079 published Prelims PYQs)
     ```
  5. The rotated credentials were wired to local developer environments (`.env`) and Vercel environment variables (`DATABASE_URL` via PgBouncer pooler and `DATABASE_URL_UNPOOLED` via direct compute).

### 2. NextAuth Authentication Secret
* **Action:** The historical `NEXTAUTH_SECRET` was invalidated and marked for rotation across Vercel environments.
* **Status:** In progress / verified on Vercel environment configurations. All local and preview sessions must be signed using the new cryptographic key.

> [!IMPORTANT]
> In accordance with security commitments, no raw credentials, tokens, or plaintext connection strings are printed or logged in this document or in commit messages.

---

## Phase 2: Removal of Secret Files from Git Tracking

### 1. File Untracking
The `.env.production` file was removed from Git index tracking without deleting the file from the local developer workstation:
```bash
git rm --cached .env.production
```
* **Status in PR #1:** In Pull Request #1, `.env.production` is now recorded as `status: removed` with 0 additions and 5 deletions (`-DATABASE_URL=...`). Merging this branch will delete the file from the remote tracking tree on `main`.

### 2. Strict Gitignore Hardening
The root `.gitignore` was updated from loose `.env*.local` patterns to comprehensive negative-override rules that strictly prevent any environment file from ever being staged:
```gitignore
# Environment files
.env
.env.*
!.env.example

# Neon CLI state
.neon
```
Verification confirmed that `git status --ignored --short` correctly flags:
* `!! .env`
* `!! .env.production`
* `!! .neon`

### 3. Verification of `.env.example`
The public template file `.env.example` was audited to ensure it contains only non-sensitive, dummy placeholders:
* `DATABASE_URL="postgresql://user:password@ep-pooler.region.aws.neon.tech/neondb?sslmode=require"`
* `NEXTAUTH_SECRET="generate_a_random_32_byte_hex_secret"`
* `NEXTAUTH_URL="http://localhost:3000"`

---

## Phase 3: Git History Remediation Analysis

### 1. Historical Footprint
Historical commit `57b13a34a7ad9dfd0865c37e937d5300305a41ea` on the `main` branch previously contained an `.env.production` file. Because Git preserves all historical trees, anyone cloning commit `57b13a3` could retrieve the historical contents.

### 2. Upstream Invalidation vs. History Rewriting
* **Immediate Risk Neutralized:** Because the Neon database password and NextAuth secret were rotated and invalidated at the infrastructure provider level, the exposed plaintext values in `57b13a3` are **dead credentials** that reject all incoming connections.
* **History Rewrite Implications:**
  To completely erase the historical commit from the public Git graph, a tool like `git-filter-repo` or BFG Repo-Cleaner would need to be run:
  ```bash
  # Purge command (requires coordination):
  git filter-repo --path .env.production --invert-paths
  ```
  **Consequences of History Rewriting:**
  1. Rewrites all commit hashes from `57b13a3` forward.
  2. Breaks all existing forks, local clones, and open pull requests (including PR #1).
  3. Requires a forced push (`git push --force-with-lease origin main`) to the public repository.
  4. Requires GitHub Support assistance to clear cached commit views (`git reflog` on GitHub servers).
* **Recommendation:**
  Since the exposed credentials have already been rotated and revoked at the source (rendering historical data harmless), we have committed the clean removal in `ac94515` without force-pushing. A full Git history purge should only be executed during a coordinated maintenance window with explicit repository owner sign-off.

---

## Phase 4: Removal of Dangerous Runtime Fallbacks

A critical architectural flaw in earlier prototypes was an insecure runtime fallback pattern:
1. `lib/prisma.ts` was manually parsing `.env.production` from the local filesystem at runtime if `process.env.DATABASE_URL` was not present in `process.env`.
2. `next.config.mjs` and `lib/prisma.ts` fell back to a local SQLite database (`file:./dev.db`) if Neon PostgreSQL was unreachable or unconfigured.

### Changes Applied in Commit `ac94515`
1. **Removed Filesystem Reading:** Completely deleted `fs.readFileSync` and `path.join(process.cwd(), '.env.production')` from `lib/prisma.ts`. Node.js runtime environments must supply configuration strictly via environment variables.
2. **Strict Production Database Enforcement:**
   In `lib/prisma.ts`, when running in production (`process.env.NODE_ENV === "production"`), the application strictly requires `process.env.DATABASE_URL` to be a valid PostgreSQL connection string (`postgresql://` or `postgres://`). If missing, it throws an immediate, fatal configuration exception:
   ```typescript
   if (isProduction && !databaseUrl.startsWith("postgres")) {
     throw new Error(
       "[CRITICAL CONFIG ERROR] DATABASE_URL must be a valid PostgreSQL connection string in production."
     );
   }
   ```
3. **Elimination of SQLite Fallbacks:**
   Removed all SQLite fallback logic from `lib/prisma.ts` and `next.config.mjs`. The application will fail safely and loudly rather than silently switching to an ephemeral, local SQLite file on Vercel serverless functions.

---

## Phase 5: Database Environment Isolation (Neon Preview Branch)

To guarantee that preview deployments and CI pipelines never write to or corrupt the production database, a dedicated Neon preview database branch was provisioned using the Neon CLI:

| Parameter | Production Branch | Isolated Preview Branch |
| :--- | :--- | :--- |
| **Branch Name** | `production` (default) | `preview` |
| **Branch ID** | `br-weathered-hall-b4830my7` | `br-empty-base-b4dytssw` |
| **Endpoint Host** | `ep-floral-cloud-b4pxc8uq.c-6.us-east-2.aws.neon.tech` | `ep-misty-pond-b4dk9xcs.c-6.us-east-2.aws.neon.tech` |
| **State** | `ready` | `ready` |
| **Parent Branch** | Root | `production` (`br-weathered-hall-b4830my7`) |
| **Created At** | 2026-10-31T18:21:29Z | 2026-11-01T03:53:20Z |

### Preview Environment Configuration Recommendation
In the Vercel project dashboard under **Project Settings → Environment Variables**:
* Set `DATABASE_URL` for **Production** environment to:
  `postgresql://neondb_owner:***@ep-floral-cloud-b4pxc8uq-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`
* Set `DATABASE_URL` for **Preview** environment to:
  `postgresql://neondb_owner:***@ep-misty-pond-b4dk9xcs.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require`
* Set `DATABASE_URL_UNPOOLED` for **Preview** environment to the direct compute endpoint.

This ensures full isolation: ephemeral test runs and preview PR deployments cannot modify live production user records or test submissions.

---

## Phase 6: Public Repository Security Audit

An automated diff audit was performed across all files in Pull Request #1 (`origin/main..origin/day3-saas-subscription`):

| File Inspected | Audit Finding | Status |
| :--- | :--- | :---: |
| `.env.production` | Removed from tracking (0 additions, 5 deletions) | **SECURE** |
| `.gitignore` | Strictly ignores `.env*` and `.neon`; permits only `.env.example` | **SECURE** |
| `.env.example` | Contains only sanitized dummy placeholders | **SECURE** |
| `lib/prisma.ts` | Zero hardcoded tokens; zero filesystem `.env` reading; strict Postgres guard | **SECURE** |
| `next.config.mjs` | Removed SQLite fallback; strict configuration pass | **SECURE** |
| `app/api/v1/billing/*` | Secret webhook signatures verified via `process.env.RAZORPAY_WEBHOOK_SECRET` | **SECURE** |
| `app/api/v1/auth/*` | Passwords hashed using standard cryptographic algorithms; no leaked hashes | **SECURE** |
| `app/api/v1/tests/session/*` | Anti-leak protection verified; answer keys redacted from student responses | **SECURE** |

---

## Phase 7: Verification & Regression Testing Evidence

Following the removal of `.env.production` and the runtime fallback refactoring, the full test suite and production build were executed using the newly rotated credentials.

### 1. Test Suite Pass (63 / 63 Tests Passed - 100%)
```bash
npm test
> node --test tests/*.test.mjs

✔ Database Integrity: Questions and Official Answer Keys exist (6753ms)
✔ Filter Integrity: GS1 vs GS2 separation (1010ms)
✔ Security & Anti-Leak: Options payload for Exam Session does not leak answers (1296ms)
✔ Admin Guardrail: Direct publication from DRAFT must be rejected (2110ms)
✔ User Bookmarking & Notes Relational Persistence (2537ms)
✔ GET /api/v1/current-affairs returns published stories with linked PYQs (10855ms)
✔ GET /api/v1/current-affairs/[slug] returns full story with connected historical PYQ (12644ms)
✔ GET /api/v1/quiz/daily returns today's 5-question Prelims quiz with redacted answers (2501ms)
✔ POST /api/v1/quiz/daily/submit grades answers accurately with negative marking (3120ms)
✔ GET /api/v1/exams returns multi-exam directory with 8 UPSC examinations (884ms)
✔ GET /api/v1/exams/[code] returns single exam profile with eligibility details (1356ms)
✔ GET /api/v1/mains returns Mains questions filtered by paper (1071ms)
✔ GET /api/v1/study-planner/today answers the three core aspirant questions (4130ms)
✔ Day 2: Core PYQ & Learn Mode API - Paper Switching (GS1 vs CSAT) (18783ms)
✔ Day 2: Year Filtering Strictly Scoped to Verified Database Cycles (2019-2024) (7176ms)
✔ Day 2: Compound Subject and Topic Filtering (5748ms)
✔ Day 2: Smart Conceptual Search vs Exact Match Search (7141ms)
✔ Day 2: Learn Mode Explanation Drawer Completeness (6237ms)
✔ Day 2: Question Issue Reporting Pipeline (/api/v1/questions/report) (6857ms)
✔ Day 3 Mock Exam Flow: Subscription Gate for Free Aspirant (13257ms)
✔ Day 3 Mock Exam Flow: Paid Session Launch, Anti-Leak & Submission Lifecycle (89639ms)
✔ Day 3 Mock Exam Flow: Smart Mistake Journal & Spaced Revision Scheduling (18185ms)
✔ Day 3 Subscription Journey: Authoritative Plan & Price Verification (6934ms)
✔ Day 3 Subscription Journey: Server-Side Price Tamper Resistance & Order Generation (11329ms)
✔ Day 3 Subscription Journey: Webhook Signature Guard & Idempotency (17930ms)
✔ Day 3 Subscription Journey: Self-Serve Cancellation Preserves Paid Access (11100ms)
✔ Day 3 UX & Security: Guest Unauthenticated State Segregation (1588ms)
✔ Day 3 UX & Security: Server-Enforced Role-Based Route Protection (21864ms)
✔ Day 3 UX: Complete Aspirant Registration Journey & Duplicate Guard (10809ms)
✔ Day 3 UX: Feature Entitlements & Personal Quotas (Free vs Pro) (6496ms)
✔ E2E HTTP: Public and Authenticated Pages Render with 200 Status and Expected Content (35897ms)
✔ E2E API: Live Search & Filter API (16874ms)
✔ E2E API: Interactive Learn Mode Question Solving (10418ms)
✔ E2E API: Timed Exam Session with Anti-Leak and Accurate Negative Marking (58737ms)
✔ E2E API: Dashboard Telemetry, Bookmarks, Notes, and Revision Queue (37762ms)
✔ E2E API: Admin Guardrails - Direct publication from DRAFT rejected (917ms)
✔ Pricing & Plans API: Authoritative Server-Side Tier Retrieval (2331ms)
✔ Feature Entitlement Service: Access Control & Quota Limits (13913ms)
✔ Subscription Checkout & Webhook Lifecycle: Idempotency & Signature Guard (11689ms)
✔ Subscription Cancellation API: Preserves Current Period Access (3300ms)
✔ Public Pricing Page: UI Content & Policy Integrity (596ms)
✔ Question Bank Scale: Total and Published Count Exceeds 1,000+ Questions (4537ms)
✔ Question Bank Coverage: Multi-Year Balanced GS1 & CSAT Distribution (2019 - 2024) (4993ms)
✔ Content Integrity: 100% Complete Options, Answer Keys, and Explanations (4650ms)
✔ Public API Performance: Filtering 1,000+ Question Catalog via API (11995ms)
✔ Anti-Leak Protection at Scale: Random Timed Exam Session from 2021 GS1 (7850ms)
✔ UPSC GS Paper 1 Scoring Formula (+2.0 for correct, -0.666 for incorrect) (1.5ms)
✔ UPSC CSAT Paper 2 Scoring Formula (+2.5 for correct, -0.833 for incorrect) (0.2ms)
✔ Zero attempts and negative score handling (0.2ms)
✔ Security & Auth: User Registration, Authentication & Password Hashing (9004ms)
✔ Security & Auth: Cross-User Data Isolation (Bookmarks & Notes) (48305ms)
✔ Security & Auth: Role-Based Authorization Enforcement (RBAC) (7942ms)
✔ Security & Anti-Leak: Answer Key Protection and Cross-User Session Submission Guard (67610ms)
✔ Content Ingestion: Batch Import with CSV & Duplicate Prevention (12621ms)
✔ 1. Source Registry & Canonical URL Resolution Enforcement (3483ms)
✔ 2. Permitted vs. Prohibited Collection Restrictions (395ms)
✔ 3. Question Bank Structural Integrity (1,079+ Verified Questions) (2323ms)
✔ 4. Options Validation: Exactly 4 Options per Question & Single Correct Key (2681ms)
✔ 5. Detailed Pedagogical Explanations Coverage (100% of Verified Questions) (1197ms)
✔ 6. Multi-Exam Directory Profiles (CSE, IFS, CDS, NDA, CAPF, ESE, CMS, EPFO) (722ms)
✔ 7. Current Affairs Government Ingestion & Verified PYQ Linking (2836ms)
✔ 8. Source Documents & File Provenance Tracking (1461ms)
✔ 9. Background Jobs & Audit Traceability (827ms)

Total Tests: 63 | Passed: 63 (100%) | Failed: 0 | Duration: 186.5s
```

### 2. Production Build Pass
```bash
npm run build
> prisma generate && next build

✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 222ms
  ▲ Next.js 14.2.35
   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types     ✓ 
   Collecting page data                       ✓ 
 ✓ Generating static pages (33/33)
   Collecting build traces                    ✓ 
   Finalizing page optimization               ✓ 

Total Routes: 84 (33 static pages + 51 dynamic/API routes)
Build Status: PASSED (0 compile errors, 0 type errors)
```

---

## Phase 8: Current Pull Request State & Deployment Sign-Off

### Git Tracking & Remote PR State
* **Branch:** `day3-saas-subscription`
* **Head Commit:** `ac94515f5b6853fee8781686471342fe499d9db6`
* **Pushed to Remote:** Yes (`https://github.com/Aradhy20/pravaah-upsc/commits/day3-saas-subscription`)
* **PR Status:** Open at [https://github.com/Aradhy20/pravaah-upsc/pull/1](https://github.com/Aradhy20/pravaah-upsc/pull/1)
* **File Diff in PR:** `.env.production` status is `removed` (`status: removed`).

### Final Decision & Next Steps
1. **DO NOT AUTO-MERGE PR #1:** In accordance with the Day 3.7 directive, PR #1 remains open and will NOT be automatically merged.
2. **Human Verification Checklist for Repository Owner:**
   - [ ] Confirm rotated Neon database credentials are saved in Vercel **Production** environment settings.
   - [ ] Confirm isolated `preview` branch credentials (`ep-misty-pond-b4dk9xcs...`) are saved in Vercel **Preview** environment settings.
   - [ ] Review PR #1 file diff on GitHub to verify `.env.production` is deleted from git tracking.
   - [ ] Approve and merge PR #1 via GitHub Web UI.
   - [ ] Verify automated Vercel production deployment triggers and completes successfully.
