# PRAVAAH UPSC — PHASE 6 AUTOMATED QA TEST REPORT

**Test Date:** November 2026  
**Test Harness:** Native Node.js ESM Test Suite (`npx tsx --test`)  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Status:** 100% Pass Rate Across All Monetization & System Suites

---

## 1. Test Suite Architecture

The Phase 6 monetization and revenue architecture is validated across 10 specialized automated test cases in `tests/phase6_monetization_subscriptions.test.mjs`, complementing the platform's 149 existing regression tests.

---

## 2. Test Execution Matrix

| Test Suite / Case | Validation Scope | Expected Outcome | Result |
| :--- | :--- | :--- | :---: |
| **1. 4 Canonical Plans & Pricing** | Free (₹0), Plus (₹149/mo, ₹999/yr), Pro (₹299/mo, ₹1,999/yr), Elite (₹499/mo, ₹3,499/yr) | Prices and features match Part 2 specifications | **PASS** |
| **2. Feature Entitlement Enforcement** | Server-side blocking of premium features for Free tier; allowing for Pro tier | Free user blocked from Timed Exams; Pro user granted access | **PASS** |
| **3. AI Usage & Credit Limits** | Atomic deduction, limit enforcement, and recovery upon failed operations | Credit count increments; requests beyond limit rejected with 403 | **PASS** |
| **4. Specialized Learning Packs Catalog** | CSAT Intensive (₹199), Mains Eval (₹149), Interview Prep (₹299), Mocks (₹299), CA (₹149) | Catalog returns all 5 active packs with valid prices | **PASS** |
| **5. Promotional Coupon Validation** | Validates `LAKSHYA20` (20% off), verifies expiry, min order value, plan eligibility | Discounts calculated accurately; invalid codes rejected | **PASS** |
| **6. Student Billing Profile API** | `/api/v1/user/billing` returns plan tier, usage meters, and invoices | Returns live data matching student's PostgreSQL ledger | **PASS** |
| **7. Admin Revenue Dashboard API** | `/api/v1/admin/revenue` computes real MRR, ARR, and subscriber cohorts | Real database metrics computed; unauthorized access blocked | **PASS** |
| **8. Referral Engine** | Generates unique referral codes and tracks qualified referrals | Codes generated; abuse prevented | **PASS** |
| **9. Payment Safety Architecture** | `isPaymentSystemEnabled() === false`; checkout endpoints reject paid creation | Checkout returns 503 or honest verification notice | **PASS** |
| **10. Documentation Verification** | All 13 Phase 6 documentation specifications exist under `docs/` | Files exist and contain substantive (>500 bytes) content | **PASS** |

---

## 3. Production Build Validation

- **Command:** `npm run build`
- **Output:** Clean compilation of all pages including `/pricing`, `/dashboard/billing`, and `/admin/revenue`. Zero TypeScript or ESLint errors.
