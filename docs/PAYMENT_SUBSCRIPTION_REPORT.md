# PAYMENT GATEWAY & SUBSCRIPTION LIFECYCLE REPORT

**Audit Date**: November 23, 2026  
**Primary Payment Architecture**: Direct Personal UPI + Dynamic Intent QR (`jainaradhy123@okicici`)  
**Secondary Webhook Gateway**: Microservice Webhook Engine (`/api/webhooks/upi-gateway`)  
**Merchant / Account Holder**: Aradhy Jain (ICICI Bank)  
**Security Standard**: HMAC-SHA256 Timing-Safe Cryptographic Signatures  
**Test Mode**: Sandbox Simulation Only (Zero Real Financial Transactions)  

---

## 1. Executive Summary

The complete payment and subscription lifecycle of the Pravaah UPSC platform was audited. The implementation pairs a frictionless Indian **Direct Personal UPI payment rail** (dynamic QR codes and 12-digit UTR verification) with an **automated webhook gateway** for instant subscription provisioning. All three paid tiers were verified through order creation, pending state management, cryptographic webhook validation, and subscription entitlement activation.

---

## 2. Pricing Tiers & Authoritative Catalog

Pricing is defined authoritatively in PostgreSQL (`Plan` and `PlanPrice` models):

| Tier Code | Plan Name | Advertised Price | GST (18%) | Total Price | Target UPSC Stage | Entitlement Highlights |
|---|---|---|---|---|---|---|
| `TIER_0` | **Free Aspirant** | ₹0 | ₹0 | **₹0** | Foundation | 20 PYQs/day, 1 Mock/month, 5 AI queries/day |
| `TIER_1` | **Syllabus Sprint** | ₹2,541.53 | ₹457.47 | **₹2,999** | Prelims Micro-drills | Full 30-year PYQ archive, 25 AI queries/day |
| `TIER_2` | **Prelims Pro** | ₹4,660.17 | ₹838.83 | **₹5,499** | Comprehensive Prelims | Unlimited Prelims, CSAT simulator, All mocks |
| `TIER_3` | **Ranker Suite** | ₹7,626.27 | ₹1,372.73 | **₹8,999** | Prelims + Mains Full | 30 AI Mains evaluations/mo, Topper copies |

---

## 3. Direct Personal UPI Integration Architecture

For Indian civil services aspirants, UPI provides the highest conversion rate without intermediary payment aggregator drop-offs:

1. **Merchant Receiving VPA**: `jainaradhy123@okicici` (Aradhy Jain, ICICI Bank).
2. **Dynamic Order Generation (`POST /api/v1/payments/create-order`)**:
   - Creates a unique `PaymentOrder` record in state `PENDING`.
   - Generates a standard NPCI compliant UPI payment string:
     `upi://pay?pa=jainaradhy123@okicici&pn=Aradhy%20Jain&am=5499.00&tr=ORDER_CUID&cu=INR&tn=Pravaah%20Prelims%20Pro`
   - Encodes string into dynamic SVG QR displayed on `/checkout/[orderId]`.
3. **UTR Submission & Reconciliation (`POST /api/v1/payments/orders/[orderId]/submit-utr`)**:
   - Aspirant sends payment via GPay, PhonePe, Paytm, or BHIM.
   - Aspirant enters the 12-digit bank reference (UTR).
   - Order transitions from `PENDING` to `UNDER_REVIEW`.
   - Anti-fraud check: System rejects duplicate UTR numbers previously used on other orders.
4. **Admin Manual Approval Flow**:
   - Admin inspects payment in `/admin/payments`.
   - Approving the order activates the subscription, creates a `Subscription` record, and increments entitlement counters.

---

## 4. Automated Webhook Processing & Cryptographic Hardening

For automated payment gateway callbacks (`POST /api/webhooks/upi-gateway`):

### 1. Timing-Safe Cryptographic Signature Verification:
- Gateway calculates HMAC-SHA256 signature using `UPI_GATEWAY_WEBHOOK_SECRET`:
  `expectedSig = crypto.createHmac("sha256", secret).update(timestamp + "." + rawBody).digest("hex")`
- Evaluated against incoming `X-Signature` using `crypto.timingSafeEqual` to eliminate timing attack vectors.

### 2. Anti-Replay Timestamp Drift Protection:
- Webhook timestamp is compared to server clock (`Date.now() / 1000`).
- Payloads with timestamp drift exceeding **300 seconds** are rejected immediately with `HTTP 401: Timestamp drift exceeded`.

### 3. Idempotent State Transitions:
- If a webhook arrives multiple times for an already-paid order:
  - System returns `HTTP 200 { success: true, message: "Order already fulfilled" }`.
  - Subscription validity is **not** duplicated or accidentally extended.
- **Out-of-Order Protection**: An `EXPIRED` webhook cannot revert an order that was already marked `PAID`.

---

## 5. Lifecycle Test Results Across All 3 Paid Plans

All test cases verified via `tests/payment_sandbox_complete_audit.test.mjs` and `tests/upi_gateway_integration.test.mjs`:

| Plan Tested | Amount | Order Creation | Webhook Signature | Subscription Activation | Entitlement Check | Result |
|---|---|---|---|---|---|---|
| **Syllabus Sprint** | ₹2,999 | `PENDING` created | HMAC valid | 1-year activated | Tier 1 features granted | **PASS** |
| **Prelims Pro** | ₹5,499 | `PENDING` created | HMAC valid | 1-year activated | Tier 2 features granted | **PASS** |
| **Ranker Suite** | ₹8,999 | `PENDING` created | HMAC valid | 1-year activated | Tier 3 features granted | **PASS** |
| **Refund Flow** | ₹5,499 | `REFUNDED` webhook | HMAC valid | Subscription cancelled | Downgraded to Free tier | **PASS** |
| **Client Success Spoof** | - | User visits `/checkout/success` | No payment received | Order remains `PENDING` | Access denied | **PASS** |

**Zero trust in client redirects**: Visiting checkout success URLs without verified backend payment strictly leaves the aspirant on the Free tier.
