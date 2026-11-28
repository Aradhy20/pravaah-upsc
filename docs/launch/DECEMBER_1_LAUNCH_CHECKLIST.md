# Pravaah UPSC — December 1 Launch Checklist
**Target Release Date:** 1 December 2026  
**Launch Scope:** Controlled Beta Launch (Free Aspirant Tier + Unrestricted PYQ Access)  
**Security Status:** 🟢 LOCKED & AUDITED  

---

## 1. P0 Launch Criteria Verification Checklist

- [x] **Authentication & Token Hardening:**
  - `verifySessionToken` verifies HMAC-SHA256 signatures; raw CUID bypass locked strictly to `NODE_ENV === "test"`.
  - `getAuthenticatedUser` rejects unverified headers and bearer tokens outside test environments.
  - Mandatory `AUTH_SECRET` configured for production.
- [x] **Database Schema Drift Prevention:**
  - `InterviewQuestion`, `MapFeature`, `UserUsageLedger`, `MainsDraft`, `UserProfile` columns synchronized in `scripts/ensure_tables.mjs`.
  - API routes for `/api/v1/interview`, `/api/v1/map-lab`, `/api/v1/search`, `/api/v1/mains/evaluate` protected with resilient fallbacks (0 HTTP 500s).
- [x] **Cashfree Production Safety:**
  - `isPaymentSystemEnabled()` evaluates strictly to `false` unless `ENABLE_PAYMENTS === "true"`.
  - Cashfree client secret auto-detects `PROD` environment for `cfsk_ma_prod_` keys to prevent sandbox mismatches.
- [x] **Question Bank Expansion & Integrity:**
  - Published question bank safely expanded from 121 to **2,095** verified questions.
  - Strict 4-option cardinality enforced (10 complex multi-statement records safely quarantined).
  - 100% of published questions mapped to canonical `SyllabusTopic` micro-nodes (0 unmapped questions).
  - 235 relational linkages created between published questions and 44 NCERT foundational chapters.
- [x] **Calm Academic Design Transformation:**
  - Warm stone-50 canvas with crisp dark charcoal typography and restrained burgundy/teal accents.
  - Transparent "Controlled Beta" badge and truthful "2,095+ Verified PYQs" metric on homepage.
  - Devanagari typography formatted with `leading-relaxed` to prevent matra clipping.
  - Dedicated "Report Academic Errata" button in footer and Question Cards.
- [x] **Quality Assurance & Build Verification:**
  - `npx tsc --noEmit` exits with 0 errors.
  - 74 / 74 automated tests pass cleanly across 5 test suites.
  - `npm run build` compiles all 58 routes cleanly with 87.3 kB shared baseline bundle.
