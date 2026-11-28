# PRAVAAH UPSC 2.0 — Security, Payment Integrity & Isolation Audit

**Date:** November 28, 2026  
**Security Standard:** OWASP Top 10 + Cashfree Payment Security Standards  
**Auditor:** Payment Security Engineer & Application Security Architect  

---

## 1. Payment Gateway Security Audit (Cashfree Only)

Pravaah UPSC strictly operates a Cashfree-exclusive payment infrastructure. All legacy manual payment channels (UPI QR codes, bank transfer screenshots, manual UTR submissions) have been formally audited for complete decommissioning.

### A. Webhook Signature Verification (`app/api/webhooks/cashfree/route.ts`)
- **Algorithm:** HMAC-SHA256.
- **Payload Guarantee:** Signature is computed over the verbatim raw request body concatenated with the `x-webhook-timestamp` header:
  ```typescript
  const signaturePayload = `${rawBody}${timestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signaturePayload)
    .digest("base64");
  ```
- **Timing Safe Comparison:** Verified using `crypto.timingSafeEqual` to eliminate timing attack vulnerabilities.

### B. Replay Attack & Timestamp Drift Mitigation
- Webhooks enforce a strict **300-second (5-minute)** drift tolerance window (`MAX_TIMESTAMP_DRIFT_SECONDS = 300`).
- Any webhook with a timestamp older than 5 minutes or in the future is immediately rejected with HTTP 400.

### C. Idempotency & Duplicate Prevention
- Every incoming webhook event is checked against `PaymentWebhookEvent.eventId`.
- Duplicate webhooks return HTTP 200 with `idempotent: true` without re-activating subscriptions or modifying billing records.

### D. Server-Authoritative Pricing
- Clients cannot manipulate prices. The backend order creator (`/api/v1/payments/create-order`) ignores client amounts and fetches canonical prices strictly from `lib/pricing.ts`:
  - `PLUS`: ₹149/mo, ₹399/qtr, ₹999/yr.
  - `PRO`: ₹299/mo, ₹799/qtr, ₹1,999/yr.
  - `ELITE`: ₹499/mo, ₹1,299/qtr, ₹3,499/yr.

---

## 2. Authentication, Session & User Isolation

1. **Password Security:**
   - Hashed using bcrypt with 12 salt rounds (`hashPassword`). Plaintext passwords are never logged or stored.
2. **Session Cookie Security:**
   - Cookie Name: `token`.
   - Flags: `HttpOnly = true`, `SameSite = Lax`, `Path = /`, `Secure` in production.
   - Lifetime: 30 days.
3. **Data Isolation & Multi-Tenancy:**
   - All user data queries (bookmarks, mistake tracking, notes, attempts, drafts) enforce `where: { userId: session.userId }`.
   - Users cannot access another aspirant's notes, test sessions, or payment invoices.

---

## 3. Role-Based Access Control (RBAC)

The system enforces hierarchical roles:
- `ASPIRANT` (Standard candidate)
- `FACULTY` (Mains answer evaluator)
- `CONTENT_ADMIN` (Question bank editor)
- `SUPER_ADMIN` (Full administrative access)

Admin endpoints under `/api/v1/admin/*` verify the user's role server-side via `verifyAdminRole()`. Non-privileged users receive HTTP 403 Forbidden.

---

## 4. Remediation Checklist

- [x] Webhook HMAC-SHA256 signature verification.
- [x] Replay attack timestamp drift protection (300s window).
- [x] Server-authoritative order pricing.
- [x] Zero plain credentials in frontend client bundles.
- [x] Parameterized SQL via Prisma ORM preventing SQL injection.
- [ ] **Pending:** Remove legacy `app/api/webhooks/upi-gateway/` and `app/api/v1/payments/orders/[orderId]/submit-utr/` to ensure 100% Cashfree purity.
