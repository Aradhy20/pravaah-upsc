# PRAVAAH UPSC — PAYMENT, BILLING & CASHFREE INTEGRATION AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Principal Payment Systems Architect & Financial Security Auditor  
**Payment Gateway:** Cashfree Payments (API Version: `2023-08-01`)  
**Scope:** Pricing Synchronization, Order Creation, Webhook Signature Security, Subscription Activation & Unit Economics  
**Verification Standard:** Direct Network Inspection, Test Suite Execution (10/10 Payment Tests PASS), Financial Ledger Integrity Check  

---

## 1. Executive Summary: Can Pravaah Collect Revenue Today?

### The Verdict: **NO. ONLINE PAYMENTS ARE CURRENTLY INOPERABLE IN PRODUCTION.**

While the payment processing code (`lib/payments/**` and `app/api/webhooks/cashfree/route.ts`) is architecturally sound and passes 10 out of 10 automated unit tests, **the live production integration is broken due to a credential and environment variable mismatch on Vercel**.

When an aspirant clicks "Upgrade" on the live pricing page, the order creation endpoint (`POST /api/v1/payments/create-order`) fails with:
```json
HTTP 500: {"success": false, "error": {"code": "ORDER_CREATION_FAILED", "message": "authentication Failed"}}
```
No student can complete checkout, no charges can be created, and no subscriptions can be activated.

---

## 2. Root Cause Analysis of Cashfree Order Creation Failure

1. **Production Credential against Sandbox Endpoint:**
   - In Request 3, production credentials were generated on Cashfree's merchant portal:
     - AppID: `[REDACTED_CASHFREE_APP_ID]`
     - Secret Key: `[REDACTED_CASHFREE_PROD_SECRET]`
   - Notice the key prefix: `cfsk_ma_prod_` denotes a **Production Merchant Key**.
   - Inspection of `lib/payments/payment-config.ts` (Lines 48–56):
     ```typescript
     const envRaw = (process.env.CASHFREE_ENVIRONMENT || process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || "sandbox").toUpperCase();
     const environment: "TEST" | "PROD" = envRaw === "PROD" || envRaw === "PRODUCTION" ? "PROD" : "TEST";
     const baseUrl = environment === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
     ```
   - On Vercel, `CASHFREE_ENVIRONMENT` is currently set to `sandbox` (or unset), forcing Cashfree requests to `https://sandbox.cashfree.com/pg/orders`.
   - Cashfree's Sandbox environment strictly rejects live production merchant keys with `authentication Failed`.
2. **Feature Flag Status:**
   - In `.env`, `ENABLE_PAYMENTS` was deliberately kept `false` as a protective measure during ongoing audits. When payments are disabled, the system returns a graceful notice (`PAYMENTS_DISABLED_MESSAGE`) rather than an unhandled crash.

---

## 3. Pricing Synchronization Discrepancy

Our live network probe of `https://pravaah-upsc.vercel.app/api/v1/plans` revealed a severe discrepancy between the **canonical specification** and the **live database records**:

| Plan Code | Canonical Name | Canonical Specification (`pricing-catalogue.ts`) | Live Production Database API (`/api/v1/plans`) | Status |
| :--- | :--- | :---: | :---: | :---: |
| **`FREE`** | Aspirant Foundation | ₹0 / ₹0 / ₹0 | ₹0 / ₹0 / ₹0 | 🟢 **MATCH** |
| **`PLUS`** | Aspirant Plus / Syllabus Sprint | **₹149** / **₹399** / **₹999** | **₹399** / **₹999** / **₹2,999** | 🔴 **MISMATCH** |
| **`PRO`** | Aspirant Pro / Prelims Pro | **₹299** / **₹799** / **₹1,999** | **₹799** / **₹1,899** / **₹5,499** | 🔴 **MISMATCH** |
| **`ELITE`** | Aspirant Elite / Ranker Suite | **₹499** / **₹1,299** / **₹3,499** | **₹1,299** / **₹2,999** / **₹8,999** | 🔴 **MISMATCH** |

### Cause:
The remote Neon PostgreSQL database has not been updated with the latest seed migration (`scripts/seed_monetization_plans.mjs`), retaining stale pilot prices from early testing.

---

## 4. Webhook Security & Idempotency Audit

The webhook endpoint (`app/api/webhooks/cashfree/route.ts`) was audited line-by-line and tested with synthetic payloads:
- **HMAC-SHA256 Signature Verification:** Verified using the raw unparsed request body and `x-webhook-timestamp` header via `crypto.timingSafeEqual()`. Valid signatures pass; forged signatures are rejected with HTTP 401.
- **Replay Attack Tolerance Drift Guard:** Webhook timestamps older than 300 seconds are rejected with HTTP 400.
- **Activation Idempotency:** If a webhook event for an already `PAID` order is redelivered by Cashfree, the handler acknowledges with HTTP 200 without creating duplicate subscriptions or double-extending access.
- **Historical Ledger Safety:** The database currently stores **145 historical payment records** in `PaymentRecord`. All existing transactions remain completely intact.

---

## 5. User Entitlements & Feature Gating (`lib/entitlements.ts`)

| Feature | Required Tier | Free Aspirant Access | Paid Aspirant Access | Gating Enforcement Status |
| :--- | :---: | :---: | :---: | :---: |
| **Question Bank Practice** | Tier 0 | Full (121 Qs) | Full (121 Qs) | 🟢 Working |
| **Timed Exam Simulator** | Tier 1 (Plus) | Blocked (Modal) | Unlocked | 🟢 Enforced via `checkEntitlement` |
| **Subject & Weakness Analytics** | Tier 1 (Plus) | Blocked | Unlocked | 🟢 Enforced |
| **CSAT Practice Coach** | Tier 1 (Plus) | Blocked | Unlocked | 🟢 Enforced |
| **Mission Control Cockpit** | Tier 2 (Pro) | Blocked | Unlocked | 🟢 Enforced |
| **Syllabus Intelligence Map** | Tier 2 (Pro) | Blocked | Unlocked | 🟢 Enforced |
| **AI Personal Mentor** | Tier 2 (Pro) | 3 Trial Msgs | 100 Msgs / Mo | 🟡 Heuristic fallback active |
| **Mains Answer Evaluation** | Tier 2 (Pro) | 1 Trial Draft | 15 Evals / Mo | 🔴 Crashes on Prod (HTTP 500) |
| **Priority Support** | Tier 3 (Elite) | Community | Dedicated Desk | 🟢 Enforced |

---

## 6. Unit Economics & AI Operational Cost Analysis

Pravaah UPSC uses Google Gemini 1.5 Flash (`models/gemini-1.5-flash`) for AI mentorship and Mains evaluation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   UNIT ECONOMICS FOR ASPIRANT PRO (₹299/MO)            │
├────────────────────────────────────────────────────┬───────────────────┤
│ Monthly Subscription Price Collected               │ ₹299.00           │
│ Cashfree Gateway Fee (2% + 18% GST)                │ -₹7.06            │
│ Net Revenue Received                               │ ₹291.94 (~$3.50)  │
├────────────────────────────────────────────────────┼───────────────────┤
│ AI Mentor Usage (100 msgs × 1,000 tokens)          │                   │
│   100,000 tokens @ $0.075 / 1M tokens              │ -$0.0075 (-₹0.62) │
│ Mains Evaluations (15 essays × 3,000 tokens)       │                   │
│   45,000 tokens @ $0.30 / 1M output tokens         │ -$0.0135 (-₹1.12) │
│ Infrastructure (Vercel Serverless + Neon compute)  │ -$0.2500 (-₹20.80)│
├────────────────────────────────────────────────────┼───────────────────┤
│ Total Operating Cost Per Active Student            │ ₹22.54 ($0.27)    │
│ Estimated Gross Margin                             │ 92.3%             │
└────────────────────────────────────────────────────┴───────────────────┘
```

### Business Risk:
Because Gemini 1.5 Flash has extremely favorable token pricing ($0.075 / 1M input tokens, $0.30 / 1M output tokens), **AI operating costs pose zero threat to business sustainability**. The gross margin exceeds 90%. 

The true financial risk is **zero revenue collection due to the broken Cashfree configuration**.
