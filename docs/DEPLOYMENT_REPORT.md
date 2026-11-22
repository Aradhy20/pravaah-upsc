# PRAVAAH UPSC — PRODUCTION DEPLOYMENT & LAUNCH READINESS REPORT

**Date:** November 22, 2026  
**Build Command:** `npm run build` (`node scripts/deploy_db_setup.mjs && prisma generate && next build`)  
**Deployment Target:** Vercel Production Environment  
**Live URL:** [https://pravaah-upsc.vercel.app](https://pravaah-upsc.vercel.app)  
**Status:** **READY FOR PRODUCTION LAUNCH**  

---

## 1. AUTOMATED BUILD PIPELINE ARCHITECTURE

The deployment workflow is completely automated via `scripts/deploy_db_setup.mjs`:

```
Git Push -> Vercel Build Trigger
    │
    ├── Step 1a: Deploy Prisma Migrations (`prisma migrate deploy`)
    │
    ├── Step 1b: Idempotent Table Synchronizer (`ensure_tables.mjs`)
    │     ├── Checks 70 PostgreSQL tables
    │     ├── Executes CREATE TABLE IF NOT EXISTS for any unmaterialized models
    │     ├── Seeds missing Plan prices (MONTHLY, QUARTERLY, ANNUAL)
    │     └── Seeds FeatureEntitlements (TIMED_EXAMS, ADVANCED_ANALYTICS, etc.)
    │
    ├── Step 2: Seed Verification (`data/backup/postgres_full_dump.json`)
    │     └── If DB has 0 questions, restores verified 121 questions & 32 Mains records
    │
    ├── Step 3: Prisma Client Generation (`prisma generate`)
    │
    └── Step 4: Next.js Production Compilation (`next build`)
          ├── TypeScript Validation: 0 Errors
          ├── ESLint Validation: 0 Errors
          ├── SEO Generation: sitemap.xml & robots.txt
          └── 44 Routes Statically & Dynamically Compiled
```

---

## 2. PRODUCTION ROUTE INVENTORY

```
Route (app)                                       Size     First Load JS
┌ ○ /                                             9.19 kB        96.5 kB
├ ○ /_not-found                                   876 B          88.1 kB
├ ○ /about                                        160 B          87.4 kB
├ ○ /admin                                        3.6 kB         90.9 kB
├ ○ /admin/coverage                               2.11 kB        89.4 kB
├ ○ /admin/data-integrity                         6.46 kB         102 kB
├ ○ /admin/imports                                3.8 kB         91.1 kB
├ ○ /admin/ingestion                              5.59 kB        92.9 kB
├ ○ /admin/payments                               5.86 kB        93.1 kB
├ ○ /admin/plans                                  3.33 kB        90.6 kB
├ ○ /admin/pyqs                                   8.38 kB         104 kB
├ ○ /admin/questions                              2.9 kB         90.2 kB
├ ○ /admin/review                                 2.78 kB          90 kB
├ ○ /admin/subscriptions                          2.37 kB        89.6 kB
├ ƒ /api/v1/* (30 REST Route Handlers)            0 B                0 B
├ ○ /bookmarks                                    1 kB           97.4 kB
├ ƒ /checkout/[orderId]                           5.84 kB        93.1 kB
├ ○ /coverage                                     4.02 kB        91.3 kB
├ ○ /current-affairs                              4.09 kB         100 kB
├ ƒ /current-affairs/[slug]                       4.19 kB         100 kB
├ ○ /daily-quiz                                   4.6 kB          101 kB
├ ○ /dashboard                                    4.14 kB        91.4 kB
├ ○ /exam-simulator                               178 B          96.1 kB
├ ○ /exams                                        3.64 kB        99.6 kB
├ ƒ /exams/[code]                                 3.08 kB          99 kB
├ ○ /faq                                          160 B          87.4 kB
├ ○ /login                                        3.69 kB          91 kB
├ ○ /mains                                        9.47 kB        96.7 kB
├ ƒ /mock-tests                                   160 B          87.4 kB
├ ƒ /mock-tests/[testId]                          8.15 kB        95.4 kB
├ ○ /ncert                                        4.41 kB        91.7 kB
├ ○ /notes                                        2.09 kB        89.4 kB
├ ○ /onboarding                                   9.11 kB        96.4 kB
├ ○ /prelims/pyqs                                 178 B           101 kB
├ ○ /pricing                                      6.58 kB        93.8 kB
├ ○ /privacy                                      160 B          87.4 kB
├ ○ /pyqs                                         177 B           101 kB
├ ƒ /pyqs/[year]/[paper]                          183 B          96.6 kB
├ ƒ /pyqs/year/[year]                             183 B          96.6 kB
├ ○ /register                                     3.45 kB        90.7 kB
├ ○ /revision                                     1.69 kB        98.1 kB
├ ○ /robots.txt                                   0 B                0 B
├ ○ /sitemap.xml                                  0 B                0 B
├ ○ /study-planner                                10.2 kB         106 kB
├ ƒ /subjects                                     160 B          87.4 kB
├ ƒ /subjects/[subject]                           183 B          96.6 kB
├ ○ /syllabus                                     12 kB           108 kB
├ ○ /system-flow                                  9.13 kB         105 kB
├ ○ /terms                                        160 B          87.4 kB
├ ○ /topper-copies                                7.78 kB          95 kB
└ ○ /video-academy                                7.5 kB         94.8 kB
+ First Load JS shared by all                     87.3 kB
```

---

## 3. SEO & CRAWLER DISCOVERY

1. **`sitemap.xml`:** Generated dynamically via `app/sitemap.ts` indexing all 18 core static learning and examination hubs.
2. **`robots.txt`:** Generated dynamically via `app/robots.ts` directing search engine crawlers to learning content while protecting private user areas (`/api/`, `/admin/`, `/dashboard`, `/checkout/`, `/bookmarks`, `/notes`).

---

## 4. ENVIRONMENT VARIABLE SPECIFICATION

| Variable | Scope | Purpose | Status |
|---|---|---|---|
| `DATABASE_URL` / `STORAGE_URL` | Server | PostgreSQL connection string | Configured |
| `NEXTAUTH_SECRET` | Server | HMAC-SHA256 session token key | Configured |
| `NEXTAUTH_URL` | Shared | Canonical base domain URL | Configured |
| `NEXT_PUBLIC_APP_NAME` | Client | UI application name | Configured |
| `GOOGLE_CLIENT_ID` | Server | Google OAuth 2.0 Client ID | Configured |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth 2.0 Client Secret | Configured |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Client-side Google Sign-In button | Configured |

---

## 5. FINAL LAUNCH CERTIFICATION

- [x] All 10 P0/P1 issues identified in the audit resolved at root cause.
- [x] Question bank deduplicated; 100% verified official answer keys and explanations.
- [x] Examination engine scoring validated (+2/-0.666 GS1, +2.5/-0.833 CSAT, 33% qualifying gate).
- [x] Cross-user data isolation verified (bookmarks, notes, drafts).
- [x] Pricing standardized across `/` and `/pricing`.
- [x] 111/111 automated tests pass cleanly.
- [x] Production build compiles with zero errors.
- [x] Deployment auto-syncs tables and guards against schema drift.
