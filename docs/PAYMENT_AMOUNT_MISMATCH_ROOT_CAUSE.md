# PAYMENT AMOUNT MISMATCH ROOT CAUSE ANALYSIS & RESOLUTION
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Payment Gateway:** Cashfree Payments  
**Severity:** P0 — Financial Integrity & Regulatory Compliance  
**Date:** November 24, 2026  
**Status:** FULLY RESOLVED & VERIFIED  

---

## 1. Executive Summary

During production validation of the Cashfree Payments integration, critical discrepancies were identified between user-facing pricing displays, database billing records, and gateway order creation payloads. 

Specifically:
1. **Frontend Presentation Inconsistency:** Monthly pricing presented plans as Aspirant Plus (₹149/mo), Aspirant Pro (₹299/mo), and Aspirant Scholar (₹499/mo). Conversely, annual views displayed old legacy figures: Aspirant Plus (₹2,999/yr), Aspirant Pro (₹5,499/yr), and Aspirant Elite (₹8,999/yr).
2. **Missing Billing Interval Controls on Homepage:** The homepage pricing section presented only monthly pricing without interval toggles, omitting annual and quarterly packages entirely.
3. **Modal Component Stale Pricing:** `UpgradeModal.tsx` hardcoded `₹5,499` for annual and `₹799` for monthly, completely bypassing database rates and presenting contradictory figures.
4. **Plan Code & Aliasing Disconnection:** The underlying database utilized legacy internal codes (`BEGINNER`, `ACHIEVER`, `SCHOLAR`), whereas frontend interfaces and target specifications submitted canonical codes (`PLUS`, `PRO`, `ELITE`), leading to potential 404 PLAN_NOT_FOUND errors on order creation.

A comprehensive fix was executed establishing an authoritative Canonical Pricing Catalogue, database plan code & price synchronization, server-authoritative amount lookups with zero client trust, and strict HMAC-SHA256 webhook validation.

---

## 2. Root Cause Breakdown

### Root Cause A: Decentralized and Hardcoded Pricing Definitions
* **Mechanism:** Rather than consuming a single central pricing service, pricing values were independently hardcoded across multiple components (`components/UpgradeModal.tsx`, `scripts/seed_billing.mjs`, `lib/db-sync.ts`, and `app/page.tsx`).
* **Impact:** Modifying a price in the database or pricing page left stale prices lingering in modals, seeding scripts, and promotional landing sections.

### Root Cause B: Nomenclature & Code Divergence
* **Mechanism:** The database model `Plan` was seeded with `code: "BEGINNER"`, `code: "ACHIEVER"`, and `code: "SCHOLAR"`. The frontend displayed "Aspirant Plus", "Aspirant Pro", and "Aspirant Elite".
* **Impact:** Requests targeting canonical codes failed lookup or required fragile string mappings.

### Root Cause C: Client-Side Interval Desynchronization
* **Mechanism:** `app/page.tsx` defined a local state `pricingInterval` initialized to `"ANNUAL"`, but the JSX rendered static strings labeled `/ month` without buttons for interval toggling.
* **Impact:** Users on the homepage were unable to view or purchase quarterly or annual subscriptions.

---

## 3. Implemented Architectural Solution

```
+-----------------------------------------------------------------------------+
|               CANONICAL PRICING CATALOGUE (Single Source of Truth)          |
|                       lib/payments/pricing-catalogue.ts                      |
+-----------------------------------------------------------------------------+
                                       |
          +----------------------------+----------------------------+
          |                                                         |
          v                                                         v
+-----------------------------+                           +-----------------------------+
|   PostgreSQL / Prisma DB    |                           |     Frontend User Interface |
|   - Plan (PLUS, PRO, ELITE) |                           |     - app/pricing/page.tsx  |
|   - PlanPrice (Canonical)   |                           |     - app/page.tsx (Home)   |
|   - 100% History Preserved  |                           |     - UpgradeModal.tsx      |
+-----------------------------+                           +-----------------------------+
          |                                                         |
          +----------------------------+----------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|               Server-Authoritative Order Creation & Verification            |
|       - POST /api/v1/payments/create-order (Strict Server Resolution)       |
|       - POST /api/v1/payments/orders/[id]/verify (Amount Validation <= 0.5) |
|       - POST /api/webhooks/cashfree (Raw HMAC-SHA256 Verification)          |
+-----------------------------------------------------------------------------+
```

1. **Central Canonical Catalogue (`lib/payments/pricing-catalogue.ts`):** Established authoritative catalogue declaring plans, intervals, mathematical savings, and bidirectional aliases.
2. **Database Schema & Record Synchronization:** Synchronized `Plan` and `PlanPrice` records to canonical figures (0, 149/399/999, 299/799/1999, 499/1299/3499) while preserving all historical candidate subscriptions and 139+ payment records.
3. **Hardened API Routes:** `create-order` looks up canonical prices server-side, completely ignoring any client-supplied amount parameters.
4. **Synchronized UI:** Both homepage and pricing page feature interactive Monthly, Quarterly, and Annual toggles reflecting exact canonical numbers.
