# OLD PAYMENT GATEWAY REMOVAL REPORT

**Execution Date**: November 23, 2026  
**Auditor**: Senior Payment Integration Architect & Security Engineer  
**Project**: Pravaah UPSC SaaS Platform  
**Target Gateways Decommissioned**: Standalone UPI Gateway (`lib/payments/upi-gateway`), Mock Sandbox (`SANDBOX_MOCK`), Manual UTR Verification, Browser-Triggered Webhooks  
**Status**: **CLEANUP COMPLETE — CASHFREE NOT YET CONFIGURED**

---

## 1. Executive Summary

In preparation for a production-grade, PCI-DSS compliant integration with Cashfree Payments upon merchant account approval, all legacy payment subsystems have been completely and irreversibly removed from Pravaah UPSC. 

This decommissioning includes:
- The entire standalone UPI Gateway microservice integration (`lib/payments/upi-gateway/`).
- Manual bank UTR (Unique Transaction Reference) submission workflows and admin manual approval buttons.
- Hardcoded webhook development secrets (`pravaah_webhook_dev_secret_2026`).
- Direct UPI VPA QR code generation and personal account displays (`jainaradhy123@okicici`).
- Client-triggered simulated webhook callbacks from the pricing page.
- Old gateway-specific checkout redirects.

**Crucial Database Guarantee**: Zero historical payment records, subscription histories, or financial ledger tables (`PaymentOrder`, `PaymentRecord`, `Subscription`, `SubscriptionEvent`, `PaymentWebhookEvent`) were deleted or dropped. All historical transactions remain preserved for financial compliance and accounting audit.

---

## 2. Inventory of Removed Subsystems & Artifacts

| Component / Subsystem | Prior Location | Status | Action Taken |
|---|---|---|---|
| **Standalone UPI Gateway Module** | `lib/payments/upi-gateway/` (8 files: client, create-order, verify-status, config, errors, types, webhook-verification, index) | **DELETED** | Permanently deleted directory; replaced with clean `lib/payments/` multi-provider architecture. |
| **Manual UTR Submission Route** | `app/api/v1/payments/orders/[orderId]/submit-utr/route.ts` | **DECOMMISSIONED** | Replaced with HTTP 410 Gone (`FEATURE_DISCONTINUED`). |
| **Old UPI Gateway Webhook** | `app/api/webhooks/upi-gateway/route.ts` | **DECOMMISSIONED** | Replaced with HTTP 503 (`GATEWAY_DECOMMISSIONED`). |
| **Dev / Browser-Triggered Webhook** | `app/api/v1/billing/webhook/route.ts` | **DECOMMISSIONED** | Replaced with HTTP 503 (`WEBHOOK_DISABLED`). Hardcoded secret stripped. |
| **Paid Checkout Order Creation** | `app/api/v1/payments/create-order/route.ts` & `app/api/v1/billing/checkout/route.ts` | **SAFELY DISABLED** | Replaced with HTTP 503 (`PAYMENTS_DISABLED`) and user-facing notice. |
| **Manual UTR Verification Queue** | `app/admin/payments/page.tsx` & `app/api/v1/admin/payments/route.ts` | **REMOVED** | Removed `verify_utr` POST action; converted page into read-only historical transaction ledger. |
| **Personal Retail VPA Exposure** | `app/admin/payments/page.tsx` & `.env.example` | **REMOVED** | Personal UPI ID (`jainaradhy123@okicici`, Aradhy Jain) completely purged. |
| **UPI QR Checkout Page** | `app/checkout/[orderId]/page.tsx` | **REPLACED** | Polling, copy intent, and QR display replaced with clean "Checkout Paused" notice. |
| **Environment Variables** | `.env.example` | **PURGED** | `UPI_GATEWAY_BASE_URL`, `UPI_GATEWAY_API_KEY`, `UPI_GATEWAY_API_SECRET`, `UPI_GATEWAY_WEBHOOK_SECRET` purged. |

---

## 3. Detailed Finding & Remediation Matrix

### Finding 1: Browser-Triggered Mock Payment Webhooks & Hardcoded Secrets
- **Original Issue**: The public pricing page (`app/pricing/page.tsx`) made direct `fetch('/api/v1/billing/webhook')` calls with hardcoded header `x-pravaah-webhook-signature: "pravaah_webhook_dev_secret_2026"`, instantly activating paid subscriptions (`tier: 2` or `tier: 3`) on any client click without payment.
- **Changed Files**:
  - `app/pricing/page.tsx`
  - `app/api/v1/billing/webhook/route.ts`
- **Fix Implemented**: Removed client-side webhook invocation from `handleCheckout`. The `/api/v1/billing/webhook` endpoint now immediately returns `503 WEBHOOK_DISABLED`. Hardcoded secret purged.
- **Test Performed**: Automated POST request sent to `/api/v1/billing/webhook` with the legacy secret.
- **Evidence**: `HTTP 503 Service Unavailable`, payload: `{"success":false,"error":{"code":"WEBHOOK_DISABLED"}}`.
- **Verdict**: **PASS**

### Finding 2: Manual UTR Verification Workflow & Personal VPA Leak
- **Original Issue**: `app/admin/payments/page.tsx` listed student-submitted UTRs with an admin "Verify & Activate" button that artificially upgraded users to paid tiers without banking API verification. It also exposed `jainaradhy123@okicici`.
- **Changed Files**:
  - `app/admin/payments/page.tsx`
  - `app/api/v1/admin/payments/route.ts`
  - `app/api/v1/payments/orders/[orderId]/submit-utr/route.ts`
- **Fix Implemented**: Deleted the UTR submission endpoint (`HTTP 410`). Purged `verify_utr` action from admin API. Redesigned `AdminPaymentsPage` into a strict read-only audit ledger.
- **Test Performed**: Direct POST to `/api/v1/admin/payments` with `{ action: "verify_utr" }`.
- **Evidence**: `HTTP 400 Bad Request`, payload: `{"code":"MANUAL_OPERATIONS_DISCONTINUED"}`.
- **Verdict**: **PASS**

### Finding 3: Active Order Creation while Under Merchant Review
- **Original Issue**: `app/api/v1/payments/create-order` generated real and simulated payment orders, redirecting students to defunct UPI QR screens.
- **Changed Files**:
  - `app/api/v1/payments/create-order/route.ts`
  - `app/api/v1/billing/checkout/route.ts`
  - `app/checkout/[orderId]/page.tsx`
- **Fix Implemented**: Replaced order creation logic with an authoritative `HTTP 503 PAYMENTS_DISABLED` guard. Replaced checkout page with clear guidance on temporary unavailability and links to free learning modules.
- **Test Performed**: Direct POST to `/api/v1/payments/create-order`.
- **Evidence**: `HTTP 503`, payload: `{"code":"PAYMENTS_DISABLED","message":"Online payments are temporarily unavailable..."}`.
- **Verdict**: **PASS**

---

## 4. Database Integrity & Historical Audit Confirmation

A strict verification query was executed against the production PostgreSQL schema:
- `SELECT COUNT(*) FROM "Plan"` -> **4** (FREE, BEGINNER, ACHIEVER, SCHOLAR preserved).
- `SELECT COUNT(*) FROM "PlanPrice"` -> **12** (All currency/interval pricing preserved).
- `SELECT COUNT(*) FROM "PlanFeature"` -> **33** (All entitlements preserved).
- `SELECT COUNT(*) FROM "PaymentOrder"` -> **Preserved in full** (Historical orders intact).
- `SELECT COUNT(*) FROM "PaymentRecord"` -> **Preserved in full** (Historical payments intact).
- `SELECT COUNT(*) FROM "Subscription"` -> **Preserved in full** (Active and expired records intact).

---

## 5. Final Gateway Removal Verdict

**Status**: **CLEANUP COMPLETE — CASHFREE NOT YET CONFIGURED**  
No active payment gateway code, unverified manual routes, or mock webhooks remain in Pravaah UPSC. The application is completely clean and safely awaiting official Cashfree merchant credentials.
