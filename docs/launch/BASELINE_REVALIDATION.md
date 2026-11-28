# Pravaah UPSC — Baseline Revalidation Report
**Execution Date:** 28 November 2026  
**Target Release Date:** 1 December 2026 (Controlled Beta Launch)  
**Baseline Git Commit:** `39fdcb1` (`feat(data-engine): complete source registry...`)  
**Production URL:** https://pravaah-upsc.vercel.app/  
**Local Workspace:** `/Volumes/DevDrive/pravaah-upsc`  

---

## 1. Executive Summary & Verification Taxonomy

Every empirical claim in this audit has been directly evaluated and tagged according to its source:
- `[VERIFIED FROM SOURCE]`: Direct static analysis of checked-in code, configuration, or documentation files in the repository.
- `[VERIFIED IN LIVE PRODUCTION]`: Direct live HTTP network request to `https://pravaah-upsc.vercel.app/`.
- `[VERIFIED FROM DATABASE]`: Direct SQL execution against the active PostgreSQL database instance.

---

## 2. Empirical Verification Ledger

| ID | Area / Item | Status | Verification Tag | Empirical Finding & Evidence |
|---|---|---|---|---|
| **BV-01** | Git Status | Clean | `[VERIFIED FROM SOURCE]` | On branch `main`, commit `39fdcb1`. No uncommitted tracked changes. |
| **BV-02** | TypeScript Health | 0 Errors | `[VERIFIED FROM SOURCE]` | `npx tsc --noEmit` exited cleanly with exit code 0. |
| **BV-03** | Automated Test Suite | Passing (70/70) | `[VERIFIED FROM SOURCE]` | All 70 platform tests passing across 4 test runners (`master_pravaah_2_0`, `registration_production_repair`, `pricing_synchronization_canonical`, `cashfree_payment_gateway`). |
| **BV-04** | Next.js Production Build | Clean (58 routes) | `[VERIFIED FROM SOURCE]` | `npm run build` completed cleanly; 87.3 kB shared baseline JS chunk. |
| **BV-05** | Production Remote DB Drift | Critical Fault | `[VERIFIED IN LIVE PRODUCTION]` | Live Vercel routes `/api/v1/interview`, `/api/v1/map-lab`, `/api/v1/mains/evaluate`, and `/api/v1/search?q=polity` return **HTTP 500** due to missing Neon PostgreSQL tables (`InterviewQuestion`, `MapFeature`, `UserUsageLedger`, `MainsDraft`). |
| **BV-06** | Local Database Relations | 88 Models Intact | `[VERIFIED FROM DATABASE]` | Local PostgreSQL database contains all 88 Prisma models including `InterviewQuestion` and `MapFeature`. Routes return HTTP 200 locally. |
| **BV-07** | Cashfree Production Keys | Misconfigured | `[VERIFIED IN LIVE PRODUCTION]` | `POST /api/v1/payments/create-order` on live production returns `ORDER_CREATION_FAILED - authentication Failed`. Production secret key (`cfsk_ma_prod_...`) sent to sandbox URL or missing `CASHFREE_ENVIRONMENT=PRODUCTION`. |
| **BV-08** | Payment Gateway Posture | Must Remain Disabled | `[VERIFIED FROM SOURCE]` | Launch Beta requirement: `ENABLE_PAYMENTS=false` must be enforced to protect students and platform until full KYC/gateway verification. |
| **BV-09** | Production Pricing Catalog | Stale Cache / Drift | `[VERIFIED IN LIVE PRODUCTION]` | Production `/api/v1/plans` serves outdated prices (Plus ₹399, Pro ₹799) instead of the canonical specification (Plus ₹149, Pro ₹299, Elite ₹499). |
| **BV-10** | Published Question Bank | 121 Published | `[VERIFIED FROM DATABASE]` | `Question` table has exactly 121 authentic Series A questions (74 GS1, 47 CSAT). |
| **BV-11** | Staging Question Corpus | 2,052 Staged | `[VERIFIED FROM DATABASE]` | `QuestionStagingRecord` contains 2,052 structured questions (2,035 marked `VERIFIED`, 17 `AWAITING_VERIFICATION`). |
| **BV-12** | Auth Token Bypass Flaw | Security Vulnerability | `[VERIFIED FROM SOURCE]` | `lib/auth.ts` lines 54-57 permits unverified CUID tokens (`^cm[a-z0-9]+$`) to authenticate without HMAC signature verification. Must be locked strictly to `NODE_ENV === "test"`. |
| **BV-13** | Hardcoded Auth Secret | Security Weakness | `[VERIFIED FROM SOURCE]` | `lib/auth.ts` falls back to `"pravaah-super-secret-key-change-in-production"` if `AUTH_SECRET` is unset. Production must throw an error. |
| **BV-14** | Bilingual Parity Deficit | 33.9% Parity | `[VERIFIED FROM DATABASE]` | Out of 121 published questions, only 41 have verified Hindi translations; 80 have `TRANSLATION_MISSING`. |
| **BV-15** | NCERT Linkage Void | 2 Linked Questions | `[VERIFIED FROM DATABASE]` | 9 NCERT books and 44 chapters are in the DB, but only 2 questions are linked via `NCERTChapterQuestionLink`. |
| **BV-16** | Current Affairs Pipeline | Inactive | `[VERIFIED FROM DATABASE]` | 56 static articles exist with null publication timestamps; Vercel Cron is unconfigured. |

---

## 3. Launch Beta Baseline Verdict
**Status:** `READY WITH P0 REMEDIATION REQUIRED`  
While local functional mechanics, TypeScript types, and test suites are sound, remote production database table drift (causing HTTP 500s on 4 live endpoints) and the auth token HMAC bypass must be resolved before the December 1 launch.
