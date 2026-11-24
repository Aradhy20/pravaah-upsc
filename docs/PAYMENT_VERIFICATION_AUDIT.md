# CASHFREE PAYMENT VERIFICATION & WEBHOOK AUDIT
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Document Type:** Cryptographic Audit & Webhook Resilience Report  
**Date:** November 24, 2026  

---

## 1. Webhook Signature Verification Protocol

Pravaah UPSC uses Cashfree's official HMAC-SHA256 signature verification method:

$$\text{Signature} = \text{Base64}\left(\text{HMAC-SHA256}\left(\text{SecretKey}, \text{timestamp} + \text{rawBody}\right)\right)$$

### Key Verification Rules:
1. **Raw Body Preservation:** The exact UTF-8 raw text of the incoming HTTP request is preserved before JSON parsing. Any normalization or re-serialization would break the cryptographic digest.
2. **Timestamp Drift Guard:** The `x-webhook-timestamp` header is compared against the server clock. Webhooks older than 300 seconds (5 minutes) are rejected to prevent replay attacks.
3. **Constant-Time Comparison:** Signatures are compared using `crypto.timingSafeEqual()` to guard against side-channel timing attacks.

```typescript
// Verified implementation in lib/payments/providers/cashfree-provider.ts
const signaturePayload = `${timestamp}${rawBody}`;
const computedSignature = crypto
  .createHmac("sha256", secretKey)
  .update(signaturePayload)
  .digest("base64");

const isValid = crypto.timingSafeEqual(
  Buffer.from(computedSignature),
  Buffer.from(signature)
);
```

---

## 2. Webhook Event Ledger & Idempotency

To eliminate race conditions between frontend return verification and asynchronous webhook delivery, subscription activations are fully idempotent:

1. **Webhook Event Record:** Every received webhook is recorded in the `PaymentWebhookEvent` table (`eventId`, `eventType`, `orderId`, `rawPayload`, `status`).
2. **Duplicate Prevention:** If a webhook event with the same `eventId` is received, the handler recognizes `status: "PROCESSED"` and immediately acknowledges HTTP 200 without re-running activation logic.
3. **Atomic Activation via `subscription-activator.ts`:**
   - Locates `PaymentOrder` by ID.
   - If order is already `PAID` and has an active `Subscription`, returns success without duplicate billing records.
   - Uses `prisma.$transaction()` to atomically update `PaymentOrder` to `PAID`, upsert `Subscription` (`status: "ACTIVE"`, `currentPeriodEnd` extended by 30, 90, or 365 days), and upsert `PaymentRecord` by `providerTxId` or `receiptNumber`.

---

## 3. Webhook Audit Test Results

| Test Scenario | Input Vector | Expected Output | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Signature** | Authentic HMAC-SHA256 over raw payload | HTTP 200, Event PROCESSED, Subscription ACTIVE | HTTP 200, Sub Activated | **PASS** |
| **Forged Signature** | Altered payload with legitimate signature | HTTP 401, Event REJECTED | HTTP 401 Unauthorized | **PASS** |
| **Replay Attack** | Valid signature with timestamp 600s in past | HTTP 401, Drift Guard triggered | HTTP 401 Drift Exceeded | **PASS** |
| **Duplicate Delivery** | Identical `eventId` received twice | HTTP 200, Event ALREADY_PROCESSED | HTTP 200 No duplicate DB writes | **PASS** |
| **Payment Failed** | `PAYMENT_FAILED` event | Order marked FAILED, Sub remains protected | Order FAILED, Sub untouched | **PASS** |
| **User Dropped** | Candidate closes checkout window | Order marked USER_DROPPED | Order USER_DROPPED | **PASS** |
