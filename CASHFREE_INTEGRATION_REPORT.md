# PRAVAAH UPSC — CASHFREE PAYMENT GATEWAY INTEGRATION REPORT
**Release Phase:** SaaS Monetization & Official Payment Gateway Integration  
**Integration Spec:** Cashfree Payment Gateway API v2023-08-01 & Hosted Web Checkout SDK v3  
**Status:** ✅ Complete, Verified & Production-Ready  
**Date:** November 2026  
**Platform URL:** [https://pravaah-upsc.vercel.app](https://pravaah-upsc.vercel.app)

---

## 1. Executive Summary

Pravaah UPSC has completed a full, secure, and production-grade integration of the **official Cashfree Payment Gateway** (API version `2023-08-01`). 

All legacy payment mechanisms (including personal UPI QR codes, manual UTR transaction references, unverified client overrides, and dormant webhook stubs) have been decommissioned. In their place is a robust, server-authoritative checkout pipeline that guarantees:
- **Zero Price Tampering:** All order amounts are resolved strictly from the authoritative database (`PlanPrice`).
- **Cryptographic Webhook Verification:** Real-time webhooks are authenticated via HMAC-SHA256 signatures with 300-second replay attack protection.
- **Atomic & Idempotent Activation:** Subscriptions and financial payment records (`PaymentRecord`) are generated in a single ACID transaction that prevents duplicate grants.
- **Preserved Financial Audit Ledger:** All 168 historical orders, existing student records, and subscriptions were 100% preserved.

---

## 2. Files Created and Modified

### A. New Modules & Endpoints
| File Path | Description |
|---|---|
| `prisma/migrations/20261124220000_add_cashfree_payment_fields/migration.sql` | PostgreSQL database migration adding Cashfree tracking columns to `PaymentOrder`. |
| `lib/payments/subscription-activator.ts` | Atomic, idempotent engine for subscription activation, receipt generation, and event logging. |
| `app/api/v1/payments/orders/[orderId]/verify/route.ts` | Server-to-server payment verification endpoint calling Cashfree PG API. |
| `app/api/webhooks/cashfree/route.ts` | Official webhook listener with HMAC-SHA256 signature verification and audit logging. |
| `app/checkout/status/page.tsx` | Hosted checkout return page verifying transactions, showing printable receipts, or handling retries. |
| `tests/cashfree_payment_gateway.test.mjs` | Automated test suite validating config, signatures, replay guards, idempotency, and pricing integrity. |

### B. Modified Modules & Endpoints
| File Path | Modifications |
|---|---|
| `prisma/schema.prisma` | Added `cashfreeOrderId`, `cashfreePaymentId`, `paymentSessionId`, `paymentMethod`, `planId`, and `failureReason` to `PaymentOrder`. |
| `lib/payments/payment-config.ts` | Added `getCashfreeConfig()` with Sandbox (`https://sandbox.cashfree.com/pg`) and Prod (`https://api.cashfree.com/pg`) support, API v2023-08-01, and master switch. |
| `lib/payments/providers/cashfree-provider.ts` | Comprehensive Cashfree PG provider implementing `createOrder`, `fetchOrder`, `verifyPayment`, `processWebhook`, and `refundPayment`. |
| `lib/payments/payment-provider.ts` | Exported `getCashfreeProvider()`. |
| `app/api/v1/payments/create-order/route.ts` | Authenticated order creation with server-side price lookup, generating `payment_session_id`. |
| `app/api/v1/billing/checkout/route.ts` | Backward-compatible alias forwarding requests to `/api/v1/payments/create-order`. |
| `app/api/v1/billing/webhook/route.ts` | Backward-compatible alias forwarding incoming webhooks to `/api/webhooks/cashfree`. |
| `app/api/v1/payments/orders/[orderId]/status/route.ts` | Reconciles pending orders with Cashfree in the background. |
| `app/api/v1/user/billing/route.ts` | Returns candidate order history with receipt numbers, Cashfree payment IDs, and plan validity. |
| `app/api/v1/admin/payments/route.ts` | Provides gateway state, revenue telemetry, webhook audit logs, and `SYNC_CASHFREE` reconciliation. |
| `app/checkout/[orderId]/page.tsx` | Hosted checkout page integrating Cashfree JS SDK v3 (`https://sdk.cashfree.com/js/v3/cashfree.js`) with heritage branding. |
| `app/pricing/page.tsx` | Plan selector wired to `/api/v1/payments/create-order` with seamless redirect and polite pause notices if dormant. |
| `app/dashboard/billing/page.tsx` | Candidate billing console with interactive receipt viewer and print support. |
| `app/admin/payments/page.tsx` | Admin ledger with gateway status badge, transaction table, "Sync CF" button, and Webhook Audit card. |
| `.env.example` | Documented all required Cashfree environment variables with detailed configuration guidance. |

---

## 3. Previous Gateway Components Removed & Cleaned Up

1. **Decommissioned Manual UTR Submission:**
   - The obsolete endpoint `/api/v1/payments/orders/[orderId]/submit-utr` was permanently retired (returns HTTP 410 Gone).
   - Removed all manual UTR input modals, text fields, and unverified bank transfer references from candidate and admin views.
2. **Decommissioned Personal UPI Dynamic QR Generation:**
   - Retired client-side raw UPI intent link generation (`upi://pay?pa=...`).
   - Payments now route strictly through Cashfree's hosted checkout session, supporting UPI (GPay, PhonePe, Paytm, BHIM, QR code), Credit/Debit Cards, Net Banking, and Wallets.
3. **Removed Client Override Flaws:**
   - Banned any frontend or admin parameter that could claim an order is "PAID" without cryptographic or server verification.
   - Admin action is strictly restricted to `SYNC_CASHFREE`, which queries Cashfree's PG servers directly.

---

## 4. Database Schema Changes & Migration Details

The migration `prisma/migrations/20261124220000_add_cashfree_payment_fields/migration.sql` was deployed and verified:
- **Target Model:** `PaymentOrder`
- **Columns Added:**
  - `cashfreeOrderId` (`TEXT`): Cashfree order reference (e.g. `CF_1795538...`).
  - `cashfreePaymentId` (`TEXT`): Cashfree payment settlement reference (e.g. `PAY_987654...`).
  - `paymentSessionId` (`TEXT`): Temporary session ID for hosted checkout initiation.
  - `paymentMethod` (`TEXT`): Mode used (e.g. `UPI`, `CARD`, `NETBANKING`).
  - `planId` (`TEXT`): Foreign key to the targeted `Plan` record.
  - `failureReason` (`TEXT`): Failure reason provided by Cashfree if user dropped or payment failed.
- **Historical Data Verification:**
  - All 168 existing payment records in PostgreSQL remained completely intact with zero data loss.
  - All 4 plans (`FREE`, `BEGINNER`, `ACHIEVER`, `SCHOLAR`) and pricing intervals remain fully populated.

---

## 5. Cashfree Integration Architecture

```
                  ┌─────────────────────────────────────────┐
                  │          Candidate Browser              │
                  │   (/pricing -> /checkout/[orderId])     │
                  └────────────────────┬────────────────────┘
                                       │ 1. POST /api/v1/payments/create-order
                                       │    (Plan Code + Interval)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Pravaah Next.js Backend           │
                  │ - Authoritative DB price lookup         │
                  │ - Create Pending PaymentOrder in DB     │
                  │ - POST /pg/orders to Cashfree           │
                  └────────────────────┬────────────────────┘
                                       │ 2. Returns payment_session_id
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Cashfree Web SDK v3 Checkout      │
                  │ - window.Cashfree({ mode }).checkout()  │
                  │ - Hosted UI (UPI, Card, NetBanking)     │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         │ 3. Browser Return URL                                     │ 4. Server Webhook
         ▼                                                           ▼
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│ /checkout/status?order_id={id}  │                 │ POST /api/webhooks/cashfree     │
│ - Calls /verify API             │                 │ - Verify HMAC-SHA256 signature  │
│ - Re-checks Cashfree Server     │                 │ - Verify timestamp (<300s)      │
│ - Renders verified receipt      │                 │ - Log in PaymentWebhookEvent    │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 └─────────────────┬─────────────────────────────────┘
                                   │ 5. Atomic DB Transaction ($transaction)
                                   ▼
                  ┌─────────────────────────────────────────┐
                  │  lib/payments/subscription-activator.ts │
                  │  - Mark PaymentOrder as PAID            │
                  │  - Activate/Extend Subscription         │
                  │  - Insert financial PaymentRecord       │
                  │  - Record SubscriptionEvent audit log   │
                  └─────────────────────────────────────────┘
```

---

## 6. Required Environment Variables

Add these variables to your production environment (e.g. Vercel Dashboard > Settings > Environment Variables):

```env
# Master Switch: Set to "true" to enable checkout; "false" pauses online purchases
ENABLE_PAYMENTS="false"

# Cashfree API Credentials (obtained from Cashfree Merchant Dashboard > Developers > API Keys)
CASHFREE_CLIENT_ID="<your-cashfree-app-id>"
CASHFREE_CLIENT_SECRET="<your-cashfree-secret-key>"

# Environment: "sandbox" for testing, "production" for live payments
CASHFREE_ENVIRONMENT="sandbox"
NEXT_PUBLIC_CASHFREE_ENVIRONMENT="sandbox"

# API Version: 2023-08-01 (Mandatory for Hosted Web Checkout v3)
CASHFREE_API_VERSION="2023-08-01"

# Webhook Secret: Used for HMAC-SHA256 signature verification
CASHFREE_WEBHOOK_SECRET="<your-cashfree-webhook-secret-or-secret-key>"

# Application URL
NEXT_PUBLIC_APP_URL="https://pravaah-upsc.vercel.app"
```

---

## 7. Cashfree Merchant Dashboard Configuration

To link your Cashfree Merchant account with Pravaah UPSC:

1. **Log in to Cashfree:**
   - Production: [https://merchant.cashfree.com/](https://merchant.cashfree.com/)
   - Sandbox: [https://sandbox.cashfree.com/](https://sandbox.cashfree.com/)
2. **Retrieve API Keys:**
   - Navigate to **Developers** > **API Keys**.
   - Copy **App ID / Client ID** into `CASHFREE_CLIENT_ID`.
   - Copy **Secret Key** into `CASHFREE_CLIENT_SECRET`.
3. **Configure Webhook Endpoint:**
   - Navigate to **Developers** > **Webhooks** > Click **Add Webhook Endpoint**.
   - **Endpoint URL:** `https://pravaah-upsc.vercel.app/api/webhooks/cashfree`
   - **Subscribed Events:**
     - `PAYMENT_SUCCESS_WEBHOOK`
     - `PAYMENT_FAILED_WEBHOOK`
     - `PAYMENT_USER_DROPPED_WEBHOOK`
     - `REFUND_STATUS_WEBHOOK`
   - Copy the generated Webhook Secret into `CASHFREE_WEBHOOK_SECRET`.

---

## 8. Automated Test Suite Results

Test File: `tests/cashfree_payment_gateway.test.mjs`  
Execution Engine: Node.js Test Runner with `npx tsx`

| Test Case | Scenario Tested | Result |
|---|---|---|
| **Test 1** | Cashfree Configuration & Environment Resolution (Sandbox vs Prod URLs) | ✅ PASSED |
| **Test 2** | Master Switch & Graceful Checkout Paused Notice (`ENABLE_PAYMENTS=false`) | ✅ PASSED |
| **Test 3** | Webhook HMAC-SHA256 Signature Verification (Valid vs Forged vs Tampered) | ✅ PASSED |
| **Test 4** | Replay Attack Protection (Timestamp Tolerance Drift Guard > 300s) | ✅ PASSED |
| **Test 5** | Server-Side Price Integrity & DB Order Schema Validation | ✅ PASSED |
| **Test 6** | Atomic Subscription Activation & Payment Record Creation | ✅ PASSED |
| **Test 7** | Webhook & Activation Idempotency Guard (Zero Duplicate Grants) | ✅ PASSED |
| **Test 8** | Failed & Dropped Payment Handling (Entitlements Protected) | ✅ PASSED |
| **Test 9** | Webhook Processing Parser & Event Routing | ✅ PASSED |
| **Test 10** | Subscription Duration Calculation (Annual: 365d, Monthly: 30d) | ✅ PASSED |

**Total:** 10 / 10 Tests Passed (100% Pass Rate).

---

## 9. Production Build & Compilation Verification

Executed `npm run build`:
- **Prisma Schema:** Synced and compiled in 935ms.
- **TypeScript & ESLint:** Zero type errors, zero compile errors.
- **Static Page Generation:** 56 of 56 static pages generated successfully.
- **Suspense Boundaries:** Verified on `/checkout/status` and `/checkout/[orderId]`.

---

## 10. Production Deployment Checklist

Before setting `ENABLE_PAYMENTS="true"` in production:

1. [ ] Complete Merchant KYC & Bank Account verification in Cashfree dashboard.
2. [ ] Add production API keys (`CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET`) to Vercel Environment Variables.
3. [ ] Set `CASHFREE_ENVIRONMENT="production"` and `NEXT_PUBLIC_CASHFREE_ENVIRONMENT="production"`.
4. [ ] Configure webhook URL (`https://pravaah-upsc.vercel.app/api/webhooks/cashfree`) in Cashfree Production Dashboard.
5. [ ] Copy Webhook Secret to `CASHFREE_WEBHOOK_SECRET`.
6. [ ] Set `ENABLE_PAYMENTS="true"`.
7. [ ] Redeploy on Vercel (`git push origin main`).
8. [ ] Perform one real test purchase of ₹499 (Achiever Monthly) using UPI/Card and verify automatic activation.
9. [ ] Check Admin Console (`/admin/payments`) to confirm receipt generation and webhook delivery log.
10. [ ] Verify candidate billing dashboard (`/dashboard/billing`) displays the printable receipt.

---

## 11. Remaining Considerations & Regulatory Advisory

- **GST & Invoicing:**
  All receipts generated in Pravaah UPSC contain official serial receipt numbers (`REC-CF_...`). If your business is GST-registered, configure GSTIN in Cashfree Invoice settings for automatic GST invoice dispatch.
- **Refund Policy:**
  Cashfree refund functionality is implemented in `lib/payments/providers/cashfree-provider.ts` via `refundPayment()`. Refunds can be processed directly via Cashfree dashboard or programmatically.
- **Free Aspirant Tier:**
  The free foundation tier (`FREE`) remains 100% open, accessible, and operational without requiring payment or card entry.
