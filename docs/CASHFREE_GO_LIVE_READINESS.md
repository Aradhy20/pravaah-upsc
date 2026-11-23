# PRAVAAH UPSC — CASHFREE GO-LIVE READINESS & ACTIVATION PLAYBOOK

**Document Version:** 1.0.0  
**Target Payment Gateway:** Cashfree Payments (`https://www.cashfree.com/`)  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Current Status:** Architecture Prepared; Paid Checkout Dormant Pending Merchant Approval

---

## 1. Merchant Approval & Onboarding Checklist

| Step | Action Item | Status | Verification Protocol |
| :---: | :--- | :---: | :--- |
| **1** | Business Profile & KYC Submission | `UNDER_REVIEW` | Submitted to Cashfree Merchant Operations |
| **2** | Bank Account & Escrow Verification | `PENDING` | Penny drop test verification |
| **3** | Website Compliance Audit | **PASSED** | Terms, Privacy, Refund Policy, Contact Details live |
| **4** | Sandbox API Credentials Retrieval | `READY` | `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET` |
| **5** | Production API Credentials Issuance | `AWAITING` | Issued upon final KYC sign-off |

---

## 2. Safe Dormancy Architecture (`CASHFREE_CHECKOUT_ACTIVE = false`)

During merchant review, paid purchase creation is strictly disabled:
- `lib/payments/payment-config.ts` enforces `isPaymentSystemEnabled() === false`.
- Any frontend click on a paid plan triggers the informative modal:
  *"Our payment gateway is currently undergoing official compliance review with Cashfree Payments. All learning features remain free for all aspirants."*
- Zero fake orders, sandbox transactions, or unverified manual activations occur in production.

---

## 3. Technical Integration Specification for Go-Live

Once production credentials (`CF-App-Id` and `CF-Secret-Key`) are delivered by Cashfree:

### Step 1: Environment Configuration (Vercel)
```bash
CASHFREE_CLIENT_ID="<production_client_id>"
CASHFREE_CLIENT_SECRET="<production_client_secret>"
CASHFREE_ENVIRONMENT="PROD"
CASHFREE_API_VERSION="2023-08-01"
CASHFREE_WEBHOOK_SECRET="<production_webhook_secret>"
ENABLE_PAYMENTS="true"
```

### Step 2: Order Creation (`POST /api/v1/billing/checkout`)
- Creates an order on Cashfree Payments API:
  `POST https://api.cashfree.com/pg/orders`
- Returns `payment_session_id` to render Cashfree Drop-in Checkout SDK in the browser.

### Step 3: Server-Side Webhook Verification
- Webhook endpoint: `/api/webhooks/cashfree`
- Computes HMAC-SHA256 signature using `CASHFREE_WEBHOOK_SECRET`:
  $$\text{Signature} = \text{Base64}(\text{HMAC-SHA256}(\text{RawBody}, \text{SecretKey}))$$
- Rejects requests if computed signature does not match header `x-webhook-signature`.
- Idempotently activates subscription and records `PaymentRecord` upon `ORDER_PAID`.

---

## 4. Post-Go-Live Reconciliation

- Daily automated job matching Cashfree Settlement Reports against PostgreSQL `PaymentRecord` table.
- Mismatches escalate to engineering via automated notification.
