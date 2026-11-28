# Pravaah UPSC — Automated Test Results & QA Verification Report
**Date:** 28 November 2026  
**Test Runner:** Node.js v20 Built-in Test Runner + TypeScript (`tsx`)  
**Status:** 🟢 100% PASS (74 Passed, 0 Failed, 0 Regressions)  

---

## 1. Test Execution Ledger

| Test Suite File | Scope & Assertions | Status | Duration |
|---|---|:---:|:---:|
| `tests/p0_security_and_reliability_repair.test.mjs` | HMAC-SHA256 Token Signing & Tamper Rejection, Production CUID Bypass Lock, Payment Switch Lock (`ENABLE_PAYMENTS=true`), API Resilience | 🟢 PASS (4/4) | 49 ms |
| `tests/cashfree_payment_gateway.test.mjs` | Cashfree Configuration, Webhook HMAC Verification, Replay Attack Drift Guard, Server-Authoritative Pricing, Idempotent Activation, Duration Calculation | 🟢 PASS (10/10) | 405 ms |
| `tests/master_pravaah_2_0.test.mjs` | Database Schema Integrity, Inventory Reconciliation (2,095 Qs, 8,380 Options), Taxonomy Architecture, Configurable Marking Schemes, Bilingual Glossary, Cashfree Decommissioning, Aspirant Assets, Universal Search, Source Registry, Canonical Syllabus Alignment, Deduplication & Quality Reports | 🟢 PASS (16/16) | 368 ms |
| `tests/pricing_synchronization_canonical.test.mjs` | Canonical Pricing Catalogue Single Source of Truth (₹0/₹149/₹299/₹499), Exact Mathematical Discounts, Bidirectional Plan Code Aliasing, Database Plan Sync, Payment Record Preservation (148 historical payments), Zero Stale Prices | 🟢 PASS (16/16) | 202 ms |
| `tests/registration_production_repair.test.mjs` | `ensureUserProfileSchema` Column Integrity (`strongSubjects`, `weakSubjects`), End-to-End Registration & Atomic Subscription Assignment, Google User Provisioning (`findOrCreateGoogleUser`), Array Preference Serialization | 🟢 PASS (13/13) | 102 ms |

---

## 2. Compilation & Production Build Verification

- **TypeScript Compilation:** `npx tsc --noEmit` exited cleanly with exit code 0 (0 compilation errors).
- **Production Build:** `npm run build` compiled all 58 pages cleanly with an 87.3 kB shared baseline bundle.
- **Database Self-Healing:** Successfully synchronized 88 PostgreSQL tables on localhost and verified DDL safeguards for Neon PostgreSQL deployment.
