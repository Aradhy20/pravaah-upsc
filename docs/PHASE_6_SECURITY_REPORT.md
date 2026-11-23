# PRAVAAH UPSC — PHASE 6 PAYMENT & BILLING SECURITY REPORT

**Audit Date:** November 2026  
**Scope:** Subscription Entitlement Guards, AI Credit Deductions, Cashfree Dormancy, Multi-Tenant Data Isolation  
**Platform:** Pravaah UPSC (`https://pravaah-upsc.vercel.app/`)  
**Status:** Passed — Production Grade

---

## 1. Executive Summary

A comprehensive application security and monetization audit was executed across all billing models, entitlement checks, AI usage deduction handlers, and subscription management routes.

The platform demonstrates strict server-side authorization enforcement, complete protection against client-side plan manipulation, atomic credit deduction, and fail-safe payment dormancy while awaiting Cashfree merchant approval.

---

## 2. Security Assessment Matrix

| Domain | Mechanism & Implementation | Audit Finding | Status |
| :--- | :--- | :--- | :---: |
| **Server-Side Entitlements** | `checkEntitlement(userId, feature)` at API layer | Zero bypass possible via frontend DOM manipulation | **PASSED** |
| **AI Credit Atomic Accounting** | Atomic increments in PostgreSQL `UserUsageLedger` | Eliminates concurrency race conditions and credit over-consumption | **PASSED** |
| **Cashfree Dormancy Shield** | `isPaymentSystemEnabled() === false` hardcoded | No unapproved orders or external API invocations possible | **PASSED** |
| **Multi-Tenant Billing Isolation** | Invoices & subscriptions queried by `where: { userId }` | Cross-user billing access strictly prevented | **PASSED** |
| **Admin Revenue Access** | Role check `user.role.name === "ADMIN"` | Public or unauthenticated users blocked with 401/403 | **PASSED** |
| **Coupon Abuse Prevention** | Max redemptions, expiry, and min order value checks | Self-referrals and duplicate discount stacking blocked | **PASSED** |
| **Secret Protection** | Zero API keys or client secrets exposed in bundles | Clean server-side environment variable encapsulation | **PASSED** |

---

## 3. Threat Modeling & Countermeasures

1. **Threat: Client-Side Plan Spoofing**
   - *Attack:* A user modifies localStorage or client bundle to display "Aspirant Elite".
   - *Defense:* The server executes `getUserSubscription(session.userId)` directly against PostgreSQL. Any request to restricted endpoints (e.g. starting a full mock exam or requesting AI analysis) evaluates the verified database tier.
2. **Threat: Concurrent AI Prompt Exploitation**
   - *Attack:* A user sends 50 parallel requests to `/api/v1/ai/mentor` to exceed their monthly credit quota.
   - *Defense:* The entitlement engine executes an atomic ledger check and increment before dispatching the query, rejecting concurrent attempts that exceed the limit.
3. **Threat: Unearned Subscription Activations**
   - *Attack:* A malicious user posts synthetic payment success webhooks.
   - *Defense:* Webhook handlers are permanently disabled (`HTTP 503 WEBHOOK_DISABLED`) until production HMAC signature verification is activated with official Cashfree secrets.
