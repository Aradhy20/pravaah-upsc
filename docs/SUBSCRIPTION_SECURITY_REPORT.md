# SUBSCRIPTION & ENTITLEMENT SECURITY AUDIT REPORT

**Audit Date**: November 23, 2026  
**Auditor**: Senior Application Security Engineer & SaaS Architect  
**Scope**: Subscription Lifecycle, Role-Based Access Control, Feature Entitlements, Account Isolation  
**Status**: **VERIFIED & SECURED**

---

## 1. Executive Summary

A thorough security audit was performed across Pravaah UPSC's subscription and entitlement layers (`Plan`, `PlanPrice`, `PlanFeature`, `FeatureEntitlement`, `Subscription`, `PaymentRecord`, `User`, `lib/entitlements.ts`). All mechanisms permitting client-side plan tampering, mock webhook privilege escalation, or access retention on expired subscriptions were analyzed, hardened, and verified.

---

## 2. Security Requirements & Verification Matrix

| Requirement | Implementation Mechanism | Test Result | Status |
|---|---|---|---|
| **1. Free Users Retain Access** | `getUserSubscription()` falls back to `Plan.code === "FREE"` (`tier: 0`). Full PYQ browsing, Learn Mode, Daily Quizzes remain permanently accessible. | Verified | **PASS** |
| **2. Zero Paid Access from Frontend** | Client requests passing `{ planCode, status: "SUCCESS" }` are rejected. Server inspects PostgreSQL database only. | Verified | **PASS** |
| **3. Verified Payment Evidence Required** | Subscriptions require a verified `PaymentOrder` with `status: "PAID"` or verified bank webhook. Checkout is currently paused. | Verified | **PASS** |
| **4. Expired Subscriptions De-provisioned** | `where: { currentPeriodEnd: { gte: new Date() }, status: "ACTIVE" }` strictly enforced. Expired records automatically drop to tier 0. | Verified | **PASS** |
| **5. Historical Records Preserved** | `Subscription` and `PaymentRecord` tables are immutable for audit. Past periods are retained. | Verified | **PASS** |
| **6. User Data Isolation** | Bookmarks, Notes, Attempts, and Revision Schedules are tied to `User.id` via foreign keys. Subscription changes never delete user study data. | Verified | **PASS** |
| **7. Tamper-Proof Plan Parameterization** | Prices and feature limits are resolved on server side via `prisma.planPrice`. Client cannot override amounts or interval discounts. | Verified | **PASS** |
| **8. Graceful Cancellation** | User cancellation sets `cancelAtPeriodEnd: true`, preserving active access until `currentPeriodEnd`. | Verified | **PASS** |

---

## 3. Server-Side Entitlement Enforcement Architecture

Entitlement verification is executed server-side in `lib/entitlements.ts` via two authoritative functions:
1. `getUserSubscription(userId: string)`:
   - Queries active subscriptions in PostgreSQL with valid date range.
   - Defaults strictly to `tier: 0` (Aspirant Foundation) if no active paid subscription exists.
2. `checkEntitlement(userId: string, featureCode: string)`:
   - Compares the user's effective tier against `FeatureEntitlement.minTier` in the database.
   - For example: `TIMED_EXAMS` requires `tier >= 2` (Achiever or Scholar). Non-qualifying users receive `403 Forbidden` with a structured upgrade payload.
3. `checkQuota(userId: string, featureCode, currentCount)`:
   - Enforces limits for Free and Beginner tiers (e.g. max 5 bookmarks and 3 private notes for free users; unlimited for tier >= 2).

---

## 4. Elimination of Mock Subscription Activation

### Vulnerability Identified:
Previously, `app/pricing/page.tsx` contained an automated fallback that called `POST /api/v1/billing/webhook` directly from the browser with `status: "SUCCESS"` and a hardcoded secret, artificially upgrading users in production.

### Remediation:
1. Completely removed client-side webhook calls from `app/pricing/page.tsx`.
2. Disabled `/api/v1/billing/webhook` (now responds with HTTP 503 `WEBHOOK_DISABLED`).
3. Paid checkout buttons on the pricing page are safely disabled with clear notice:
   `"Online payments are temporarily unavailable while our secure payment system is being configured. Please check back soon."`
4. Paid access cannot be granted without official Cashfree payment webhooks once activated.
