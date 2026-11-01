# Pravaah UPSC — SaaS Subscription Architecture & Verification Report

**Document ID:** `DOC-SUB-VALIDATION-2026`  
**Execution Context:** Commercial SaaS Business Engine Audit  
**Date:** November 1, 2026  
**Author:** Senior SaaS Product Architect & Payment Integration Lead  
**Feature Branch:** `day3-saas-subscription`  
**Database:** Isolated Neon PostgreSQL Preview Branch (`ep-floral-cloud-b4pxc8uq`)  

---

## 1. Executive Summary

This document provides a systematic engineering audit of Pravaah UPSC's 15-point subscription and billing architecture. The subscription engine operates on the physical database models `Plan`, `PlanPrice`, `PlanFeature`, `FeatureEntitlement`, `Subscription`, `PaymentRecord`, `RefundRecord`, and `SubscriptionEvent`.

**Key Architectural Rule:**
The platform **never trusts client-side subscription claims** or **client-submitted payment amounts**. All entitlement evaluations, price lookups, quota meters, and subscription lifecycle transitions are computed and enforced server-side.

---

## 2. Fifteen-Point Subscription Architecture Audit

### 1. Free Plan Functionality (`Aspirant Foundation`, Tier 0)
- **Status:** **VERIFIED**
- **Database Code:** `FREE`
- **Capabilities:**
  - Unlimited browsing and learning mode across all 1,079 published Prelims PYQs.
  - Full access to 100% of structured pedagogical explanations and official answer keys.
  - Standard study statistics (today count, accuracy percentage).
- **Hard Quota Enforcement:**
  - Bookmarks limited to 5 (`BOOKMARKS_LIMIT`).
  - Study Notes limited to 3 (`NOTES_LIMIT`).
  - Attempting to add a 6th bookmark or 4th note returns `HTTP 403` with code `QUOTA_EXCEEDED` and upgrade prompt.
- **Timed Exam Block:** Access to `/api/v1/tests/session/start` returns `HTTP 403` with `FORBIDDEN_SUBSCRIPTION_REQUIRED`.

### 2. Beginner Plan (`Syllabus Sprint`, Tier 1)
- **Status:** **VERIFIED**
- **Database Code:** `BEGINNER`
- **Pricing:** ₹399 / month | ₹999 / quarter | ₹2,999 / year (37% annual savings).
- **Target Persona:** Self-paced foundation aspirants needing expanded revision capacity.
- **Capabilities:**
  - Quota expanded to 50 Bookmarks and 50 Notes.
  - Full access to 31 Syllabus Topic silos and subject filters.
  - Personal study activity tracking.

### 3. Achiever Plan (`Prelims Pro`, Tier 2 — Flagship)
- **Status:** **VERIFIED**
- **Database Code:** `ACHIEVER` (`isPopular: true`)
- **Pricing:** ₹799 / month | ₹1,899 / quarter | ₹5,499 / year (43% annual savings).
- **Target Persona:** Serious aspirants preparing for the upcoming Prelims examination.
- **Capabilities:**
  - **Timed UPSC Examination Simulator:** 100-question GS1 (2 hours, +2.0/-0.666) and 80-question CSAT (2 hours, +2.5/-0.833) with countdown timer and autosave recovery.
  - **Pravaah Intelligence:** Smart Mistake Journal with 5 error root-causes (`Concept not clear`, `Forgotten fact`, etc.) and automated Spaced Repetition Queue (1, 3, 7, 14 days).
  - **Diagnostic Analytics:** Syllabus coverage radar, weak/strong topic heatmaps, mock test score progression.
  - **Unlimited Storage:** Unlimited bookmarks and notes (`minTier >= 2` bypasses quota counters).

### 4. Scholar Plan (`Ranker Suite`, Tier 3)
- **Status:** **VERIFIED**
- **Database Code:** `SCHOLAR`
- **Pricing:** ₹1,299 / month | ₹2,999 / quarter | ₹8,999 / year.
- **Target Persona:** Intensive repeaters and rank-seekers desiring full platform access plus prioritized editorial dispute review.
- **Capabilities:**
  - All Achiever capabilities.
  - `PRIORITY_ACCESS`: Priority resolution on reported question discrepancies.
  - Direct academic audit trail access.

---

### 5. Plan-Specific Feature Entitlements Engine
- **Implementation:** [lib/entitlements.ts](file:///Users/aradhyjain/Library/CloudStorage/GoogleDrive-jainaradhy01@gmail.com/My%20Drive/my%20data%20/Upsc/lib/entitlements.ts)
- **Mechanism:** `checkEntitlement(userId, featureCode)` checks the user's active tier against `prisma.featureEntitlement.minTier`:
  ```typescript
  const requiredTier = entitlement ? entitlement.minTier : 0;
  const hasAccess = subInfo.tier >= requiredTier;
  ```
- **Guarded Gates:**
  - `TIMED_EXAMS`: `minTier = 2` (`ACHIEVER`)
  - `ADVANCED_ANALYTICS`: `minTier = 2` (`ACHIEVER`)
  - `PRIORITY_ACCESS`: `minTier = 3` (`SCHOLAR`)
- **Security Check:** A user with Tier 0 or Tier 1 attempting to POST to `/api/v1/tests/session/start` receives `HTTP 403 Forbidden` with an explicit upgrade link.

---

### 6. API-Level Quota Enforcement
- **Implementation:** `checkQuota(userId, featureCode, currentCount)` in `lib/entitlements.ts`.
- **Enforcement Points:**
  - `POST /api/v1/user/bookmarks`: Checks active bookmark count against `BOOKMARKS_LIMIT`.
  - `POST /api/v1/user/notes`: Checks active note count against `NOTES_LIMIT`.
- **Bypass for Premium:** Users with `tier >= 2` are returned `{ allowed: true, maxAllowed: null }` unconditionally.

---

### 7. Multi-Interval Billing Logic (Monthly, Quarterly, Annual)
- **Implementation:** `app/api/v1/billing/checkout/route.ts` and `prisma.planPrice`.
- **Validation:** Strict enum validation rejecting invalid intervals:
  ```typescript
  if (!["MONTHLY", "QUARTERLY", "ANNUAL"].includes(billingInterval)) {
    return NextResponse.json({ error: { code: "INVALID_INTERVAL" } }, { status: 400 });
  }
  ```
- **Period Duration Mathematics:**
  - `ANNUAL`: Current Time + 365 days (`365 * 86400000 ms`)
  - `QUARTERLY`: Current Time + 90 days (`90 * 86400000 ms`)
  - `MONTHLY`: Current Time + 30 days (`30 * 86400000 ms`)

---

### 8. Checkout and Server-Side Price Verification
- **Implementation:** `POST /api/v1/billing/checkout`
- **Tamper Resistance Proof:**
  - The client transmits **only** `{ planCode: "ACHIEVER", billingInterval: "ANNUAL" }`.
  - The server queries `prisma.plan.findUnique` with relation `prices` where `isActive: true`.
  - Any client-submitted `amount` or `tamperedPrice` is completely disregarded.
  - Proven by automated test `day3_subscription_journey.test.mjs` (tampered ₹1 price rejected; authoritative ₹5,499 generated).
- **Order Generation:** Creates unique order reference `order_<timestamp>_<randomHex>` and records `PaymentRecord` with status `PENDING`.

---

### 9. Webhook Signature Validation
- **Implementation:** `POST /api/v1/billing/webhook`
- **Current Sandbox State:** Validates `x-pravaah-webhook-signature` against `process.env.PAYMENT_WEBHOOK_SECRET` with development fallback. Unmatched signatures immediately abort with `HTTP 401 Unauthorized`.
- **Production Roadmap:** When transitioning from Sandbox to live Razorpay or Stripe, the handler must compute `crypto.createHmac("sha256", secret).update(rawBody).digest("hex")` over the raw unparsed request buffer.

---

### 10. Idempotent Subscription Activation
- **Implementation:** `POST /api/v1/billing/webhook`
- **Duplicate Protection:**
  ```typescript
  if (payment.status === "SUCCESS" && event === "payment.succeeded") {
    return NextResponse.json({
      success: true,
      message: "Payment event already processed idempotently.",
    });
  }
  ```
- **Audit Logging:** Every successful activation writes to `prisma.subscriptionEvent` with `eventType: "ACTIVATED"` and a JSON payload containing `orderId`, `amount`, and `processedAt`.
- **Proof:** Proven by `tests/pricing_subscriptions.test.mjs` (duplicate webhook call succeeds with HTTP 200 without extending end dates).

---

### 11. Failed Payment Handling
- **Implementation:** `event === "payment.failed"` in `app/api/v1/billing/webhook/route.ts`.
- **State Machine:**
  - `PaymentRecord` status updated to `FAILED`.
  - Existing linked `Subscription` transitions to `PAST_DUE`.
  - `SubscriptionEvent` records `PAYMENT_FAILED` with decline reason.
  - Paid benefits are revoked until successful resolution.

---

### 12. Cancellation and Graceful Renewal Semantics
- **Implementation:** `POST /api/v1/user/subscription/cancel`
- **Business Rule:** Pravaah enforces **Fair Access Cancellation**:
  - `cancelAtPeriodEnd` is set to `true`.
  - `status` **remains `ACTIVE`** until `currentPeriodEnd` is reached.
  - Zero recurring renewal charges are scheduled.
  - The student retains uninterrupted access to paid simulations and analytics throughout their paid cycle.
- **Proof:** Proven by `day3_subscription_journey.test.mjs` (asserts `status === "ACTIVE"` and `cancelAtPeriodEnd === true` after cancellation).

---

### 13. Invoice History & Receipt Generation
- **Implementation:** `GET /api/v1/user/subscription` and `/dashboard/billing`
- **Receipt Schema:**
  - Queries `prisma.paymentRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })`.
  - Exposes `receiptNumber`, `providerTxId`, `amount`, `currency`, `status`, and `createdAt`.
  - Rendered in `/dashboard/billing` with direct PDF receipt generation trigger.

---

### 14. Subscription Expiration & Automatic Fallback
- **Implementation:** `getUserSubscription(userId)` in `lib/entitlements.ts`.
- **Expiration Logic:**
  ```typescript
  where: {
    userId,
    status: "ACTIVE",
    currentPeriodEnd: { gte: new Date() },
  }
  ```
- When `currentPeriodEnd < new Date()`, the query returns `null`, and the helper automatically falls back to `FREE` (Tier 0).
- The user's historical notes and bookmarks remain preserved in the database, but access to create new notes above quota is gated.

---

### 15. Plan Upgrade and Downgrade Lifecycle
- **Upgrade Behavior (e.g., Beginner -> Achiever):**
  - When a user on an active Beginner plan checks out for Achiever, the webhook upserts `prisma.subscription`, upgrading `planId` to Achiever and recalculating `currentPeriodEnd` forward.
  - In production gateway integration, unused days on Beginner will be calculated as a prorated credit toward Achiever.
- **Downgrade Behavior (e.g., Achiever -> Beginner or Free):**
  - Downgrading occurs at period end (`cancelAtPeriodEnd = true`).
  - Active high-tier access is preserved until the current cycle expires.

---

## 3. Sandbox Mode Protocol & Gateway Activation Guard

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SANDBOX MODE PROTECTION NOTICE                     │
├────────────────────────────────────────────────────────────────────────┤
│ • Payment Provider: SANDBOX_MOCK                                       │
│ • Live Gateway Keys: DISABLED                                          │
│ • Production Debit Processing: BLOCKED                                 │
│ • Activation Prerequisite: Merchant Banking Approval & RBI Compliance │
└────────────────────────────────────────────────────────────────────────┘
```

Payment processing must strictly remain in sandbox mode until:
1. Razorpay/Stripe business KYC and merchant account verification are completed.
2. Production webhook HMAC secret keys are configured in Vercel environment variables.
3. Pull Request #1 is reviewed and merged into `main`.
