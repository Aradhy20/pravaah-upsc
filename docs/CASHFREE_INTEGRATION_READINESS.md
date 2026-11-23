# CASHFREE PAYMENT GATEWAY INTEGRATION READINESS SPECIFICATION

**Document Version**: 1.0.0  
**Integration Status**: **PENDING MERCHANT ACCOUNT APPROVAL**  
**Target Gateway**: Cashfree Payments PG (Payment Gateway & Orders API v2023-08-01)  
**Security Level**: Critical Financial Architecture  

---

## 1. Merchant Approval & Account Prerequisites

The Pravaah UPSC platform is configured in **Awaiting Approval Mode**. No API calls to Cashfree production or sandbox endpoints may be made until the user's Cashfree merchant account completes KYC and approval.

### Required Account Milestones:
1. Business entity verification (Proprietorship / LLP / Private Limited).
2. Bank account Penny-drop and penny-less penny verification.
3. Website compliance audit (Terms of Service, Privacy Policy, Pricing, Refund Policy visible and compliant).
4. Production API Credentials issued in Cashfree Merchant Dashboard (`https://merchant.cashfree.com/`).

---

## 2. Server-Side Configuration Contract

When merchant approval is granted, the following environment variables must be populated in Vercel Production Environment Variables (**NEVER committed to git or stored in client bundles**):

```bash
# Enable payment checkout
ENABLE_PAYMENTS="true"

# Cashfree API Credentials
CASHFREE_CLIENT_ID="cf_app_xxxxxxxxxxxxxxxxxxxx"
CASHFREE_CLIENT_SECRET="cf_secret_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"

# Environment Selector
CASHFREE_ENVIRONMENT="TEST" # Switch to "PROD" only for live transactions

# Cashfree API Versioning
CASHFREE_API_VERSION="2023-08-01"

# Webhook Cryptographic Verification Secret
CASHFREE_WEBHOOK_SECRET="cf_whsec_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"

# Application Canonical Origin
NEXT_PUBLIC_APP_URL="https://pravaah-upsc.vercel.app"
```

---

## 3. Expected Cashfree Order Lifecycle

```
[ Aspirant Client ]               [ Pravaah Next.js API ]            [ Cashfree PG ]
         │                                   │                              │
         │  1. Upgrade to Achiever/Scholar   │                              │
         ├──────────────────────────────────►│                              │
         │                                   │  2. Authoritative Price Check│
         │                                   │     & Create PaymentOrder    │
         │                                   │                              │
         │                                   │  3. POST /pg/orders          │
         │                                   ├─────────────────────────────►│
         │                                   │  (Return payment_session_id) │
         │                                   │◄─────────────────────────────┤
         │  4. Return payment_session_id     │                              │
         │◄──────────────────────────────────┤                              │
         │                                   │                              │
         │  5. Cashfree JS Dropin SDK        │                              │
         ├───────────────────────────────────┼─────────────────────────────►│
         │  (UPI / NetBanking / Cards / Emis)│                              │
         │                                   │                              │
         │  6. Payment Completed at Bank     │                              │
         │                                   │  7. Webhook: PAYMENT_SUCCESS │
         │                                   │◄─────────────────────────────┤
         │                                   │                              │
         │                                   │  8. Signature Verification   │
         │                                   │     & Atomic Entitlement     │
         │  9. Redirect to /dashboard        │     Activation in PostgreSQL │
         ├──────────────────────────────────►│                              │
```

### Key Lifecycle Principles:
1. **Server-Side Order Creation Only**: The client never specifies amount or price. Amount is resolved strictly from `prisma.planPrice.findFirst({ where: { planId, billingInterval } })`.
2. **Server-Side Webhook Verification**: Subscriptions are activated **ONLY** upon receiving and cryptographically verifying the Cashfree webhook signature using `CASHFREE_WEBHOOK_SECRET`.
3. **Idempotency Guarantee**: Every webhook delivery check inspects `PaymentWebhookEvent.findUnique({ where: { eventId } })` before processing. Duplicate deliveries return immediate 200 OK without double-crediting.
4. **Out-of-Order Resiliency**: An expired event cannot revert an already paid order. Late payments safely transition expired orders to paid and provision the legitimate subscription period.

---

## 4. Cryptographic Signature Verification Specification

Cashfree webhook requests include cryptographic signature headers:
- `x-webhook-signature`: Base64-encoded HMAC-SHA256 signature.
- `x-webhook-timestamp`: Epoch timestamp in seconds.

### Verification Algorithm:
```typescript
import crypto from "crypto";

export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  // Prevent replay attacks (tolerance: 300 seconds / 5 mins)
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDifference = Math.abs(currentTime - parseInt(timestamp, 10));
  if (timeDifference > 300) return false;

  const signedPayload = `${timestamp}${rawBody}`;
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );
}
```

---

## 5. Subscription Provisioning & Security Standards

1. **Atomic Entitlement Provisioning**:
   - Provisioning occurs in a Prisma `$transaction`:
     1. Update `PaymentOrder.status = "PAID"`, record `paidAt = now`, `gatewayPaymentId`.
     2. Create `PaymentRecord` with status `"SUCCESS"`.
     3. Upsert `Subscription` with `status = "ACTIVE"`, `currentPeriodStart = now`, `currentPeriodEnd = now + intervalDays`.
     4. Log `SubscriptionEvent` with event `"PAYMENT_CONFIRMED"`.
2. **Handling Refunds**:
   - Refund requests update `RefundRecord` and transition `Subscription.status` to `"CANCELED"` or schedule cancellation at period end.
3. **Testing Protocol Before Live Enablement**:
   - Once merchant credentials are provided, 5 mandatory test transactions must pass on Cashfree Sandbox (`TEST` environment):
     - Successful UPI payment.
     - Successful NetBanking / Card payment.
     - User cancellation / drop-off handling.
     - Webhook replay / idempotency rejection.
     - Invalid signature rejection.
