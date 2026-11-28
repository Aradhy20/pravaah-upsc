# PRAVAAH UPSC — CODEBASE ARCHITECTURE & LINE-LEVEL AUDIT

**Audit Date:** November 28, 2026  
**Auditor:** Principal Software Architect & Senior Full-Stack Engineer  
**Framework:** Next.js 14.2.18 (App Router) with TypeScript 5.6.3 & React 18.3.1  
**Database Tooling:** Prisma ORM 5.22.0 targeting PostgreSQL 17  
**Build & Type Check Status:** `npx tsc --noEmit` PASS (0 errors); `npm run build` PASS (58 routes optimized)  

---

## 1. Architectural Topology & Structural Soundness

Pravaah UPSC uses a modern, idiomatic Next.js 14 App Router architecture:
- **Server Components by Default:** Data-intensive read pages (`/pyqs`, `/syllabus`, `/coverage`) leverage React Server Components for fast server-side rendering and minimal client JavaScript payload (87.3 KB shared baseline).
- **Client Components for Interactive Workflows:** Interactive examination drills (`components/ExamPlayer.tsx`), study planners, and filter bars (`components/FilterBar.tsx`) are demarcated with `"use client"`.
- **Domain Service Separation:** Complex business logic is cleanly decoupled from Route Handlers into standalone domain libraries under `lib/`:
  - `lib/auth.ts`: Stateless HMAC-SHA256 session token management.
  - `lib/entitlements.ts`: Role-based feature tier gating and AI credit allowances.
  - `lib/scoring.ts`: Pure functional UPSC marking algorithms.
  - `lib/ai/orchestrator.ts`: Multi-provider LLM abstraction and RAG synthesis.
  - `lib/payments/providers/cashfree-provider.ts`: Cashfree v2023-08-01 PG integration.

---

## 2. Line-Level Review of Critical Workflows

### Workflow 1: Aspirant Registration & Profile Provisioning
- **Entry Point:** `app/api/v1/auth/register/route.ts` (Lines 1–130)
- **Line Trace:**
  - *Lines 14–22:* Request payload parsing and regex validation for email and password length ($\ge 6$ chars).
  - *Lines 24–28:* Executes `ensureUserProfileSchema()` from `lib/db-sync.ts` ensuring all dynamic PostgreSQL columns exist prior to query execution.
  - *Lines 35–45:* Queries existing user by email to prevent duplicate accounts (returns HTTP 409).
  - *Lines 48–105:* Executes transactional `prisma.$transaction`:
    1. Creates `User` record with hashed password (`lib/auth.ts` Line 70: PBKDF2 with 10,000 iterations and salt).
    2. Creates `UserProfile` record storing target exam, optional subject, and study goals.
    3. Finds or creates `SubscriptionPlan` (Tier 0: `FREE`) and provisions active `Subscription`.
  - *Lines 108–122:* Signs session token via `signSessionToken(user.id)` and sets `pravaah_user_id` cookie with `HttpOnly; Secure; SameSite=Lax`.
- **Finding:** **EXCELLENT (100% PASS).** Fully atomic, duplicate-safe, and self-healing.

---

### Workflow 2: Examination Session Management & Scoring
- **Entry Points:** `app/api/v1/tests/session/start/route.ts` & `app/api/v1/tests/session/submit/route.ts`
- **Line Trace:**
  - *Start (`start/route.ts` Lines 25–65):* Verifies authenticated student session cookie via `getAuthenticatedUser()`. Loads questions for specified paper (`GS1` or `GS2`). Creates `TestSession` with `status: "IN_PROGRESS"`.
  - *Submit (`submit/route.ts` Lines 35–115):*
    - Fetches `TestSession` with related test questions and correct options (`include: { test: { include: { questions: ... } } }`).
    - Loops over student answers, compares submitted option ID against `isCorrect: true`.
    - Invokes `calculateExamScore()` from `lib/scoring.ts` (Lines 45–90):
      - `GS1`: +2.0 for correct, -0.666 for wrong.
      - `GS2` (CSAT): +2.5 for correct, -0.833 for wrong.
    - Updates `TestSession` with `status: "COMPLETED"`, `rawScore`, `negativeMarks`, `netScore`, `accuracy`, and `timeSpentSeconds`.
- **Finding:** **EXCELLENT (100% PASS).** Mathematically sound, prevents negative score overflow, handles dropped questions properly.

---

### Workflow 3: Cashfree Order Creation & Payment Verification
- **Entry Points:** `app/api/v1/payments/create-order/route.ts` & `lib/payments/providers/cashfree-provider.ts`
- **Line Trace:**
  - *Create Order (`create-order/route.ts` Lines 45–110):*
    - Authenticates student identity.
    - Resolves server-authoritative price from `lib/payments/pricing-catalogue.ts` (client-provided amount is strictly ignored).
    - Checks `isPaymentSystemEnabled()` from `lib/payments/payment-config.ts`.
    - Creates `PaymentOrder` in PostgreSQL with `status: "PENDING"`.
    - Calls `CashfreePaymentProvider.createOrder()` (`cashfree-provider.ts` Lines 65–125):
      - Generates `order_id` (e.g. `order_cm..._1795...`).
      - Calls `POST /orders` on Cashfree PG API (`https://sandbox.cashfree.com/pg` or `https://api.cashfree.com/pg`).
  - *Root Cause of Production Failure:*
    - Live order creation currently throws `ORDER_CREATION_FAILED - authentication Failed`.
    - Code inspection of `lib/payments/payment-config.ts` (Lines 45–65) shows:
      ```typescript
      const envRaw = (process.env.CASHFREE_ENVIRONMENT || process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT || "sandbox").toUpperCase();
      const environment: "TEST" | "PROD" = envRaw === "PROD" || envRaw === "PRODUCTION" ? "PROD" : "TEST";
      const baseUrl = environment === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
      ```
    - The production client secret provided (`cfsk_ma_prod_...`) is a **Live Production Secret Key**. If Vercel has `CASHFREE_ENVIRONMENT=sandbox` or unset, the code routes requests to `https://sandbox.cashfree.com/pg/orders`, which immediately rejects live production credentials with `authentication Failed`.
- **Finding:** **CODE IS SOUND; ENVIRONMENT CREDENTIAL CONFIGURATION MISMATCHED ON VERCEL.**

---

### Workflow 4: Cashfree Webhook Signature Verification
- **Entry Point:** `app/api/webhooks/cashfree/route.ts` (Lines 1–110)
- **Line Trace:**
  - *Lines 28–36:* Extracts `x-webhook-signature` and `x-webhook-timestamp` headers.
  - *Lines 38–46:* Enforces 300-second replay attack tolerance drift guard:
    ```typescript
    const timestampMs = parseInt(timestampStr, 10);
    if (Math.abs(Date.now() - timestampMs) > 300 * 1000) {
      return NextResponse.json({ error: "Webhook timestamp drift exceeded" }, { status: 400 });
    }
    ```
  - *Lines 48–65:* Reconstructs raw payload: `timestampStr + rawBody`. Computes HMAC-SHA256 signature using `CASHFREE_WEBHOOK_SECRET` and performs constant-time equality check via `crypto.timingSafeEqual()`.
  - *Lines 70–105:* Processes `PAYMENT_SUCCESS_WEBHOOK`:
    - Finds `PaymentOrder`.
    - Checks if already marked `PAID` (idempotent; returns HTTP 200 immediately to avoid double crediting).
    - Invokes `activateSubscriptionForOrder()` in `lib/payments/subscription-activator.ts`, extending period end by 30 days (monthly) or 365 days (annual).
- **Finding:** **EXCELLENT (100% PASS).** Meets enterprise banking standards for signature security and idempotency.

---

### Workflow 5: AI Mentorship & Mains Answer Evaluation
- **Entry Points:** `app/api/v1/mains/evaluate/route.ts` & `lib/ai/orchestrator.ts`
- **Line Trace:**
  - *Mains Evaluate (`evaluate/route.ts` Lines 40–120):*
    - Authenticates user. Validates student answer word count ($\ge 30$ words).
    - Checks AI credit allowance via `checkAiCreditAllowance(user.id, "MAINS_EVALUATION")` in `lib/entitlements.ts`.
    - Queries `prisma.userUsageLedger`.
  - *Root Cause of Production Failure:*
    - On the live Neon production database, `UserUsageLedger` and `MainsDraft` tables have not been created by migrations.
    - When `checkAiCreditAllowance` calls `prisma.userUsageLedger.upsert()`, Prisma throws:
      `The table "public"."UserUsageLedger" does not exist in the current database.`
    - This triggers the top-level catch block returning `HTTP 500 {"success": false, "error": "Internal error evaluating Mains answer"}`.
- **Finding:** **CODE LOGIC IS SOUND; BLOCKED BY PRODUCTION DATABASE DRIFT.**

---

## 3. Codebase Smells, Redundancies & Technical Debt

1. **Dual Scoring Files:** `lib/scoring.js` (legacy JavaScript) exists alongside `lib/scoring.ts` (type-safe TypeScript). `lib/scoring.js` is dead code and should be removed.
2. **Hardcoded Fallback Array in Data Layer:** `lib/data-fallback.ts` contains large in-memory fallback dictionaries for questions and syllabus nodes. While useful during serverless cold starts or connection blips, it masks database disconnects during development.
3. **Admin Actions Shell Spawning (`execAsync`):** `app/api/v1/admin/ingestion/route.ts` invokes shell commands (`execAsync('npx tsx scripts/...')`). In serverless Vercel environments, spawning external child processes has strict execution timeouts (10–15 seconds) and cannot run background Python processes with heavy native dependencies.
4. **LocalStorage Schedule State:** In `app/study-planner/page.tsx`, customized student study blocks are stored in the client browser's `localStorage` rather than synced to PostgreSQL, preventing multi-device continuation.
