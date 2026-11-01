# Pravaah UPSC — Day 3 Subscription Architecture & Pricing Audit
**Document ID:** `DOC-DAY3-SUB-AUDIT-01`  
**Execution Context:** Day 3 Master Execution — Professional SaaS Experience & Subscription System  
**Date:** November 1, 2026  
**Auditor:** Senior SaaS Product Architect & Payment Integration Specialist  
**Database:** Neon Serverless PostgreSQL (`solitary-rice-12618853`)  

---

## 1. Executive Summary

This audit establishes the baseline and authoritative truth for Pravaah UPSC's commercial subscription engine. In strict accordance with the non-negotiables:
- **No plans have been invented or duplicated.**
- **No pricing numbers have been fabricated.**
- **Existing database models, rows, and relationships are preserved.**
- **The UI product packaging aligns with the physical database tiers.**

---

## 2. Authoritative Database Plans, Pricing & Features

Direct database inspection of tables `Plan`, `PlanPrice`, `PlanFeature`, and `FeatureEntitlement` confirms four existing plans:

| Tier | DB Code | Official Plan Name | Tagline / Positioning | Pricing (Monthly / Quarterly / Annual) | Feature Entitlements & Quotas |
|:---:|:---:|:---|:---|:---|:---|
| **0** | `FREE` | **Aspirant Foundation** | Essential UPSC PYQ practice with official answer keys | **₹0 / ₹0 / ₹0** | • `PYQ_BROWSE`<br>• `LEARN_SOLVE`<br>• `EXPLANATIONS`<br>• `BOOKMARKS_LIMIT`: 5<br>• `NOTES_LIMIT`: 3 |
| **1** | `BEGINNER` | **Syllabus Sprint** | Complete syllabus PYQ coverage with expanded study tools | **₹399 / ₹999 / ₹2,999**<br>*(Save ~37% on Annual)* | • `PYQ_BROWSE`<br>• `LEARN_SOLVE`<br>• `EXPLANATIONS`<br>• `BOOKMARKS_LIMIT`: 50<br>• `NOTES_LIMIT`: 50 |
| **2** | `ACHIEVER` *(isPopular)* | **Prelims Pro** | Timed UPSC simulation with negative marking & AI diagnostics | **₹799 / ₹1,899 / ₹5,499**<br>*(Save ~43% on Annual)* | • All Tier 1 features<br>• `UNLIMITED_BOOKMARKS`<br>• `UNLIMITED_NOTES`<br>• `TIMED_EXAMS` (minTier 2)<br>• `ADVANCED_ANALYTICS` (minTier 2)<br>• `MISTAKE_REVISION` |
| **3** | `SCHOLAR` | **Ranker Suite** | Comprehensive preparation with priority editorial review | **₹1,299 / ₹2,999 / ₹8,999**<br>*(Save ~42% on Annual)* | • All Tier 2 features<br>• `PRIORITY_ACCESS` (minTier 3)<br>• Verification Audit Access |

### 2.1 Database Feature Entitlements Matrix
The table `FeatureEntitlement` defines server-side enforcement gates:
- `TIMED_EXAMS`: `minTier = 2` (`ACHIEVER`) — Enforces timed examination simulation with UPSC negative marking.
- `ADVANCED_ANALYTICS`: `minTier = 2` (`ACHIEVER`) — Enforces diagnostic subject and topic weakness telemetry.
- `UNLIMITED_BOOKMARKS`: `minTier = 2` (`ACHIEVER`) — Quota relaxed from 5/50 to unlimited.
- `UNLIMITED_NOTES`: `minTier = 2` (`ACHIEVER`) — Quota relaxed from 3/50 to unlimited.
- `PRIORITY_ACCESS`: `minTier = 3` (`SCHOLAR`) — Enforces priority review queue and verified answer dispute audits.

---

## 3. Product Packaging Alignment (UI vs. DB Engine)

The directive recommends three primary product tiers: **Pravaah Free**, **Pravaah Plus**, and **Pravaah Pro**. These map seamlessly to the existing 4-tier database schema without altering backend codes:

1. **Pravaah Free** $\rightarrow$ Database Plan `FREE` (`Aspirant Foundation`, Tier 0)
   - **Target Audience:** New UPSC aspirants beginning their journey.
   - **Included:** Free access to 1,079+ published Prelims questions, official answer keys, verified explanations, basic bookmarking (up to 5), and basic notes (up to 3).
   - **Limitations:** No timed full-length simulations, standard analytics only.

2. **Pravaah Plus** $\rightarrow$ Database Plan `BEGINNER` (`Syllabus Sprint`, Tier 1)
   - **Target Audience:** Self-study aspirants requiring organized revision and expanded quotas.
   - **Included:** Complete PYQ library, 50 bookmarks, 50 notes, subject and year filters, learning progress tracking.
   - **Price:** ₹399/mo or ₹2,999/yr.

3. **Pravaah Pro** $\rightarrow$ Database Plan `ACHIEVER` (`Prelims Pro`, Tier 2, Flagship)
   - **Target Audience:** Serious aspirants targeting the upcoming Prelims examination.
   - **Included:** Timed Examination Simulator with official UPSC negative marking (+2.0/-0.666 GS1, +2.5/-0.833 CSAT), real-time countdown timer, local autosave recovery, diagnostic performance breakdown by subject, mistake revision queue, unlimited bookmarks, unlimited study notes.
   - **Price:** ₹799/mo or ₹5,499/yr.

4. **Pravaah Ranker** $\rightarrow$ Database Plan `SCHOLAR` (`Ranker Suite`, Tier 3)
   - **Target Audience:** Intensive rank-seekers wanting all features plus priority editorial support.
   - **Price:** ₹1,299/mo or ₹8,999/yr.

---

## 4. Payment & Checkout Architecture

### 4.1 Server-Authoritative Price Validation
- The endpoint `POST /api/v1/billing/checkout` validates both `planCode` and `billingInterval` against the server-side `PlanPrice` table.
- **Security Check:** The client NEVER sends the price. The server looks up `amountRupees` directly from `prisma.planPrice`.
- Generates a cryptographically strong order reference: `order_${Date.now()}_${randomBytes}`.
- Computes SHA-256 idempotency key: `sha256(userId_planId_billingInterval_amount_timestamp)`.
- Records `PaymentRecord` with status `PENDING` and method `UPI_OR_CARD`.

### 4.2 Webhook Signature & Activation
- Endpoint: `POST /api/v1/billing/webhook`.
- Signature header: `x-pravaah-webhook-signature`. Validated against `process.env.PAYMENT_WEBHOOK_SECRET` with fallback to secure development salt.
- **Idempotency Guard:** If `payment.status === 'SUCCESS'`, webhook returns immediately without duplicating subscription days.
- **Subscription Lifecycle Calculation:**
  - `ANNUAL`: +365 days
  - `QUARTERLY`: +90 days
  - `MONTHLY`: +30 days
- Upserts `Subscription` record with `status: ACTIVE`.
- Logs audit entry in `SubscriptionEvent`.
- **Payment Failure Handling:** If event is `payment.failed`, payment record is marked `FAILED` and any existing subscription transitions to `PAST_DUE`.

### 4.3 Subscription Cancellation
- Endpoint: `POST /api/v1/user/subscription/cancel`.
- Server-validated ownership: users can only cancel their own subscription.
- Graceful cancellation: updates `cancelAtPeriodEnd = true`, records `canceledAt`, and logs cancellation reason in `SubscriptionEvent`.
- Paid benefits remain active until `currentPeriodEnd`.

---

## 5. Identified UX & Journey Gaps (To Be Fixed in Day 3)

1. **Plan Selection Preservation Gap:**
   - Clicking "Choose Plan" on `/pricing` when unauthenticated did not persist the selected plan through `/register` or `/login`.
   - **Fix:** Support `?plan=ACHIEVER&interval=ANNUAL` across `/pricing`, `/register`, and `/login`. After authentication, automatically redirect to checkout.

2. **Dedicated Billing Dashboard Missing:**
   - `/dashboard/billing` did not exist as a dedicated page; users only had subscription status in pricing or dashboard.
   - **Fix:** Implement dedicated `/dashboard/billing` with current plan card, lifecycle badge, start & renewal dates, receipt history table, cancellation modal with confirmation, and one-click upgrade.

3. **Guest Auth Fallback Leaking Demo Aspirant:**
   - `getCurrentUser` defaulted to fallback aspirant for interactive browsing, causing unauthenticated checkout and subscription queries to show demo account data.
   - **Fix:** Enforce `getAuthenticatedUser` on `/api/v1/billing/checkout` and `/api/v1/user/subscription`, returning HTTP 401 when unauthenticated.
