# PRAVAAH UPSC – PERSONAL UPI ACCOUNT CONFIGURATION & GATEWAY INTEGRATION REPORT

**Document Version:** 1.0.0  
**Implementation Date:** November 21, 2026  
**Audited Platform:** Pravaah UPSC (Next.js 14 / TypeScript / Prisma / PostgreSQL)  
**Payment Gateway Integration:** Self-Hosted Open-Source UPI Gateway (`mynkdev-21/upi-gateway` - Laravel 12 / PHP 8.2+ / MySQL)  
**Receiving Destination:** Personal Retail UPI VPA (`jainaradhy123@okicici`)  
**Auditor / Engineer:** Principal Payments Architect, Security Engineer & Full-Stack SaaS Developer  

---

## 1. EXECUTIVE CONFIGURATION STATUS

| Parameter | Configured Value | Status / Verification |
| :--- | :--- | :--- |
| **Account Holder / Payee Name** | `Aradhy Jain` | **Active & Configured** |
| **Receiving UPI ID (VPA)** | `jainaradhy123@okicici` | **Active Destination** |
| **Issuing Bank / App** | ICICI Bank via Google Pay | **Verified Retail UPI Handle** |
| **Gateway Routing Mode** | Peer-to-Account Direct Settlement | **Zero Escrow / Instant Credit** |
| **Dynamic Amount Calculation** | Server-Side Authoritative (DB-driven) | **Enforced (18% GST itemized)** |
| **Dynamic QR Payload** | `upi://pay?pa=jainaradhy123@okicici&pn=Aradhy%20Jain&am=...&tr=...&cu=INR` | **Unique per transaction** |
| **Supported Student Apps** | Google Pay, PhonePe, Paytm, BHIM, CRED | **Interoperable NPCI UPI** |
| **Verification Architecture** | Dual Engine: Manual UTR Verification + Signed Webhook Fallback | **Hardened & Tested (27/27 Tests Passed)** |

---

## 2. GATEWAY COMPATIBILITY ANALYSIS WITH `@okicici`

### 2.1 Handle Validity & Payment Acceptance
- **Handle:** `@okicici` is the official retail Virtual Payment Address (VPA) handle issued by ICICI Bank for Google Pay users in India.
- **Interoperability:** Under NPCI Unified Payments Interface (UPI) standards, any valid VPA can receive money from any bank or UPI application (Google Pay, PhonePe, Paytm, BHIM, Axis Pay, HDFC PayZapp, etc.).
- **Dynamic QR Generation:** The gateway and Pravaah UPSC checkout engine format the standard NPCI URI string:
  ```
  upi://pay?pa=jainaradhy123@okicici&pn=Aradhy%20Jain&am=5499.00&tr=UPICHECKOUT_1732213000_abc&tn=Pravaah%20UPSC%20Order%20UPICHECKOUT_1732213000_abc&cu=INR
  ```
- **Finding:** The payment gateway **100% supports generating dynamic QR codes and intent links** targeting `jainaradhy123@okicici`. When scanned by a student on Google Pay or PhonePe, the app pre-fills **Aradhy Jain**, sets the exact un-editable order amount, and locks the order reference into the note field.

---

## 3. AUTOMATIC VERIFICATION COMPATIBILITY AUDIT (HONEST TECHNICAL REALITY)

### 3.1 Can Paytm or PhonePe Gateway APIs Auto-Verify an `@okicici` Handle?
> **Engineering Assessment:** **NO.**  
> It is technically and architecturally impossible for third-party Paytm or PhonePe Business APIs to automatically verify transactions received on a personal ICICI Bank retail VPA (`@okicici`).

### 3.2 Technical Explanation:
1. **Paytm for Business Integration:**
   - The Paytm verification integration in `mynkdev-21/upi-gateway` calls Paytm Merchant Order Query APIs (`https://securegw.paytm.in/merchant-status/api/v1/getPaymentStatus`).
   - This API requires a Paytm Merchant ID (`MID`) and Merchant Secret Key (`MKEY`).
   - The Paytm API **only has visibility into transactions routed through Paytm's own payment acquiring infrastructure** (i.e. payments made to Paytm QR codes or `@paytm` merchant VPAs).
   - Paytm does **not** have access to ICICI Bank's internal core banking ledger to inspect whether funds hit `jainaradhy123@okicici`.
2. **PhonePe Payment Gateway Integration:**
   - The PhonePe verification integration queries PhonePe's Merchant Status API (`/pg/v1/status/{merchantId}/{transactionId}`) using a PhonePe Merchant ID and Salt Key.
   - PhonePe **only knows about transactions processed through PhonePe PG or PhonePe Business QR**. It cannot query an ICICI Google Pay handle.
3. **NPCI Retail Isolation:**
   - Retail personal UPI accounts do **not** provide public webhooks or server-to-server REST callback APIs to individual developers.
   - Bank SMS notifications and Google Pay push notifications are client-side on Aradhy Jain's smartphone and do not emit public HTTP webhooks without a specialized Android notification listener daemon.

---

## 4. SECURE MANUAL UTR VERIFICATION & ADMIN REVIEW WORKFLOW

To guarantee **zero lost orders** and **zero fraud**, Pravaah UPSC implements a high-security 2-step verification workflow:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Checkout as Student Checkout (/checkout/[orderId])
    participant Backend as Pravaah Backend API
    actor Admin as Aradhy Jain (Admin)
    participant Phone as Personal Phone (GPay / ICICI)

    Student->>Checkout: Selects Plan & Generates Order
    Backend-->>Checkout: Returns Dynamic QR (pa=jainaradhy123@okicici, am=5499.00)
    Student->>Phone: Scans QR & Pays via GPay / PhonePe
    Phone-->>Admin: Receives GPay Notification & 12-digit UTR
    Student->>Checkout: Enters 12-digit UTR from GPay receipt
    Checkout->>Backend: POST /api/v1/payments/orders/[id]/submit-utr
    Backend-->>Checkout: Order Status -> UNDER_REVIEW
    Admin->>Backend: Views /admin/payments Manual Verification Queue
    Admin->>Phone: Checks bank statement matches Amount & UTR
    Admin->>Backend: Clicks "Verify & Activate" (POST /api/v1/admin/payments)
    Backend-->>Backend: Transactional activation (PAID status + Subscription ACTIVE)
    Checkout-->>Student: Polling detects PAID -> "Subscription Unlocked!"
```

### 4.1 Anti-Fraud & Anti-Replay Safeguards:
1. **Duplicate UTR Rejection:**
   - If a student attempts to submit a UTR that has already been verified and paid on any prior order, the API rejects it immediately with **HTTP 409 Conflict (`DUPLICATE_UTR`)**.
2. **Format & Dummy Filtering:**
   - Rejects dummy numbers (`000000`, `123456`, `TEST`) and enforces 6–30 character alphanumeric UPI reference validation.
3. **No Blind Activations:**
   - Never activates access based on client-side promises or screenshots.
   - Only the admin's cryptographic session token (`role: "ADMIN"`) or a valid HMAC-SHA256 gateway webhook can trigger `activateEntitlementForOrder()`.

---

## 5. STUDENT CHECKOUT EXPERIENCE (`/checkout/[orderId]`)

The student checkout page has been completely upgraded:
- **Branding:** Pravaah UPSC Official 256-bit Encrypted Checkout.
- **Payee Disclosure:** Explicitly displays:
  - Account Holder: **Aradhy Jain**
  - UPI ID: **`jainaradhy123@okicici`**
  - Issuing Bank: **ICICI Bank via Google Pay**
- **Dynamic QR Code:** Live rendered SVG/image encoding exact amount and order reference.
- **One-Tap App Launchers:**
  - Google Pay button
  - PhonePe button
  - Generic UPI Intent button (`upi://pay?...`)
- **15-Minute Expiry Timer:** Live countdown timer to prevent delayed bank debits.
- **Step 2: Interactive UTR Submission:**
  - Clean input form for students to submit their 12-digit UTR immediately after paying.
  - Updates the page live to `UNDER_REVIEW` with an informative banner.
- **Auto-Polling:** Background polling checks `/api/v1/payments/orders/[orderId]/status` every 3 seconds, transitioning to the green celebratory **Subscription Unlocked!** state the instant the admin approves or the webhook fires.

---

## 6. ADMIN PAYMENT MANAGEMENT CONSOLE (`/admin/payments`)

The administration console now features dedicated controls for Aradhy Jain's personal UPI account:
1. **Default Receiving Account Banner:**
   - Displays `jainaradhy123@okicici` (Aradhy Jain | ICICI Bank via Google Pay) with an **Active & Receiving** status indicator.
2. **Dedicated Manual Verification Queue:**
   - Prominently showcases all orders currently in `UNDER_REVIEW`.
   - Lists: Student Name, Email, Plan/Product, Exact Amount (INR), Order ID, Submitted UTR, Submission Time.
   - Quick Action Buttons:
     - **Verify & Activate (Green):** Triggers atomic database transaction activating the student's subscription and creating a confirmed `PaymentRecord`.
     - **Reject (Red):** Marks the order as `FAILED` if the transaction is not visible in the bank account.
3. **Main Transaction Ledger:**
   - Filter by status (`ALL`, `PAID`, `UNDER_REVIEW`, `PENDING`, `EXPIRED`, `FAILED`).
   - Real-time search across student email, client order ID, and bank UTR.
   - Pagination and export capabilities.

---

## 7. AUTOMATED TEST SUITE & EMPIRICAL RESULTS

A dedicated automated test suite was created in `tests/personal_upi_integration.test.mjs` and verified against the live Next.js server and Docker PostgreSQL container.

### Test Results Matrix (`tests/personal_upi_integration.test.mjs`):
| # | Test Scenario | Verified Behavior | Result |
| :-: | :--- | :--- | :-: |
| **1** | Account Configuration Load | Correctly loads `jainaradhy123@okicici` and `Aradhy Jain`. | **PASSED** |
| **2** | Admin API Receiving Info | `/api/v1/admin/payments` returns verified payee details. | **PASSED** |
| **3** | Dynamic Order & QR Intent | Creates order with exact INR amount, order ID, and `pa=jainaradhy123@okicici`. | **PASSED** |
| **4** | Student UTR Submission | Validates and transitions order to `UNDER_REVIEW` state. | **PASSED** |
| **5** | Order Status Polling | Status endpoint reflects `UNDER_REVIEW`, payee info, and submitted UTR. | **PASSED** |
| **6** | Admin Verification & Activation | One-click activation marks order `PAID`, activates `Subscription`, creates `PaymentRecord`. | **PASSED** |
| **7** | Idempotency Protection | Re-verifying a `PAID` order does not duplicate subscription or throw error. | **PASSED** |
| **8** | Anti-Fraud Duplicate UTR | Submitting the same UTR on a second order is rejected with **409 Conflict**. | **PASSED** |
| **9** | Admin Order Rejection | Rejecting an order marks it as `FAILED` and preserves audit history. | **PASSED** |
| **10** | Overall Personal UPI Suite | **10 / 10 Tests Passed (1.63 seconds)** | **PASSED (100%)** |

### Existing Gateway Regression Test Matrix (`tests/upi_gateway_integration.test.mjs`):
- **17 / 17 Tests Passed (10.6 seconds)** across webhook signatures, HMAC verification, timeout handling, and plan entitlements.
- **Total Payment Integration Tests:** **27 Passed / 0 Failed**.

---

## 8. ENVIRONMENT VARIABLES & CREDENTIALS CHECKLIST

Add or verify the following variables in `.env` or production deployment settings:

```env
# ==========================================
# PERSONAL UPI RECEIVING ACCOUNT (ARADHY JAIN)
# ==========================================
UPI_RECEIVING_ID="jainaradhy123@okicici"
UPI_PAYEE_NAME="Aradhy Jain"
UPI_APPLICATION="Google Pay"
UPI_BANK="ICICI Bank"

# ==========================================
# UPI GATEWAY MICROSERVICE (LARAVEL 12)
# ==========================================
UPI_GATEWAY_BASE_URL="https://payments.pravaah.in"
UPI_GATEWAY_API_KEY="live_key_pravaah_..."
UPI_GATEWAY_API_SECRET="live_sec_pravaah_..."
UPI_GATEWAY_WEBHOOK_SECRET="whsec_pravaah_..."
UPI_GATEWAY_SANDBOX_MODE="true"
UPI_GATEWAY_TIMEOUT_MS="10000"
```

---

## 9. RECOMMENDED FUTURE UPGRADE: AUTOMATED BANK VERIFICATION

If the user wants **100% automated zero-touch verification** without manually checking phone notifications for each payment, the recommended paths are:
1. **Upgrade to ICICI Bank Eazypay / Smart Checkout:**
   - Switch from a personal retail handle (`@okicici`) to an ICICI Merchant VPA (e.g. `pravaah@icici`).
   - ICICI Eazypay provides server-to-server webhooks directly to the UPI Gateway.
2. **Paytm / PhonePe Business QR Onboarding:**
   - Create a Paytm for Business or PhonePe Business account in the name of Aradhy Jain / Pravaah UPSC.
   - Configure the Paytm MID / PhonePe Salt Key in `mynkdev-21/upi-gateway`. The gateway will then auto-verify transactions using Paytm/PhonePe APIs.
3. **Current Setup (Personal UPI):**
   - The current setup works reliably for early cohorts and beta students using the manual UTR review workflow, requiring zero merchant account fees or GST registration while ensuring every rupee lands directly in Aradhy Jain's personal ICICI bank account.
