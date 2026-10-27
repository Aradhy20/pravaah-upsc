# Technical Requirements Document (TRD)
## Platform: Pravaah UPSC
**Version:** 1.0.0  
**Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Prisma ORM, PostgreSQL (with SQLite compatibility for zero-config local testing), RESTful API routes.

---

## 1. System Architecture Overview

```
                      +------------------------------------------+
                      |         Client Layer (Web / Mobile)       |
                      |  - Next.js Server & Client Components    |
                      |  - Tailwind CSS + Lucide Icons           |
                      |  - React Hook Form + SWR / Server Actions |
                      +--------------------+---------------------+
                                           |
                                  HTTPS / JSON REST
                                           |
                      +--------------------+---------------------+
                      |           Application Core               |
                      |  - Next.js App Router (Node.js runtime)  |
                      |  - Route Handlers (/api/v1/...)          |
                      |  - Middleware (Auth & Rate Limiting)     |
                      |  - Exam Engine & Anti-Leak Key Validator |
                      |  - Scoring Engine (UPSC GS1 / CSAT)      |
                      +--------------------+---------------------+
                                           |
                                      Prisma ORM
                                           |
                      +--------------------+---------------------+
                      |              Data Layer                  |
                      |  - PostgreSQL / SQLite Database          |
                      |  - Full-Text Search Indexes              |
                      |  - Relational Schemas & Foreign Keys     |
                      |  - Audit Log & Revision Tables           |
                      +------------------------------------------+
```

### 1.1 Architectural Principles
1. **Security-First Question Delivery:** In `Learn Mode`, the question payload may include explanations and the correct answer *after* interaction, or client-side evaluation can be used for zero-latency study. In `Exam Mode` (timed test sessions), the correct answer key is strictly stripped from all network payloads sent to the browser. User responses are evaluated exclusively on the server upon test submission.
2. **Modular Monolith:** To avoid unnecessary microservice overhead while delivering high velocity and reliability, Pravaah is architected as a modular Next.js application with segregated domain modules:
   - `core/auth`: Authentication, sessions, role authorization.
   - `core/questions`: Catalog browsing, filtering, search, and retrieval.
   - `core/tests`: Test session lifecycle, timing, state persistence, and scoring.
   - `core/analytics`: User attempt aggregation, accuracy curves, and weak-area calculations.
   - `core/admin`: Content ingestion, duplicate prevention, verification workflow, and audit logging.
3. **Database Portability:** Prisma ORM is configured with standardized schemas compatible with PostgreSQL for production deployments and SQLite for rapid local development and testing.

---

## 2. Technology Stack & Justification

| Layer | Chosen Technology | Rationale | Alternatives Evaluated |
|---|---|---|---|
| **Framework** | Next.js 14/15 (App Router) | SSR for SEO-critical public question pages; React Server Components for optimal TTFB; built-in API routing. | Remix, Vite SPA, Django |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety between database models, API schemas, and UI components; eliminates null pointer bugs in scoring. | JavaScript |
| **Styling** | Tailwind CSS | Utility-first, zero runtime CSS overhead, responsive breakpoint control, clean modern academic theme. | Styled Components, CSS Modules |
| **ORM / Data Access** | Prisma ORM | Strongly typed queries, declarative migrations, automated relations, migration rollback support. | Drizzle, TypeORM, raw SQL |
| **Database** | PostgreSQL / SQLite | Acid compliance, robust relational integrity for question hierarchies, built-in full-text search. | MongoDB (lacks relational integrity for question/option/attempt graphs) |
| **Icons** | Lucide React | Lightweight, accessible, clean SVG iconography matching professional academic UI. | FontAwesome |
| **Authentication** | JWT / Session-based Auth | Standard HTTP-only cookies, robust role enforcement (Aspirant vs. Admin), zero third-party lock-in. | Firebase Auth, Supabase |

---

## 3. Search Architecture

### 3.1 Exact Keyword Search
- PostgreSQL Full-Text Search using `to_tsvector` and `to_tsquery` on `question_text`, `explanation`, and `topic_name`.
- SQLite fallback uses normalized `LIKE` and indexed columns for local execution.
- Query ranking prioritizes matches in the question stem over matches in options and explanations.

### 3.2 Smart Conceptual Search
- Tagged syllabus ontology: Each question is mapped to a hierarchical syllabus taxonomy (`Subject` $\rightarrow$ `Topic` $\rightarrow$ `SubTopic` $\rightarrow$ `Key Concepts`).
- When a user searches for conceptual keywords (e.g., "Governor's discretionary powers"), the search expands to related syllabus nodes (`Art 163`, `Constitutional Discretion`, `Sarkaria Commission`).
- Future expansion hooks allow plug-and-play pgvector embeddings without modifying the frontend contract.

---

## 4. Question Delivery & Scoring Engine

### 4.1 Anti-Cheat / Answer-Key Protection Protocol
```
Aspirant starts Exam Session
         │
         ▼
API: POST /api/v1/tests/session/start
         │
         ├─► Generates TestSession in DB (status: IN_PROGRESS)
         ├─► Fetches question IDs and options
         └─► STRIPIFY: Strips `is_correct`, `answer_key`, `explanation`
                     from the JSON payload returned to the browser!
         │
Aspirant answers questions on UI (Local timer running, responses auto-saved)
         │
         ▼
API: POST /api/v1/tests/session/submit
Payload: { sessionId: "...", responses: [ { questionId: "...", selectedOption: "B" } ] }
         │
         ├─► Server checks: Was session already submitted? (Idempotency)
         ├─► Server compares each response with authoritative AnswerKey in DB
         ├─► GS1 Formula: (Correct * 2.0) - (Incorrect * 0.666)
         ├─► CSAT Formula: (Correct * 2.5) - (Incorrect * 0.833)
         ├─► Persists UserAttempt & UserResponse records
         └─► Returns full Scorecard with unlocked explanations
```

---

## 5. Content Ingestion & Verification Pipeline

1. **Source Registration:** Record official UPSC notification URL, paper year, paper code (Series A/B/C/D), and retrieval timestamp.
2. **Extraction:**
   - Structured JSON/CSV parser for pre-digitized papers.
   - Text segmentation parser with regex boundary detection: splits on question numbers (`Q1.`, `1.`, `Question 1`), statement numbers (`(1)`, `(2)`, `1.`), and options (`(a)`, `(b)`, `(c)`, `(d)`).
3. **Validation & Deduplication:**
   - Hash generation (normalized question stem) to detect duplicate entries across different question series.
   - Schema validation: Question must have exactly 4 options (for UPSC Prelims) and at least one mapped syllabus topic.
4. **State Machine:**
   ```
   [DRAFT] ──(Validation Passed)──► [NEEDS_REVIEW] ──(Admin Verified)──► [VERIFIED] ──(Publish)──► [PUBLISHED]
      │                                    │
      └─────────(Validation Failed)────────┴────────(Flagged Error)──────► [ARCHIVED]
   ```
   **Rule:** The system strictly rejects publishing any question with status `draft` or `needs_review`.

---

## 6. Security, Rate Limiting & Audit Logging

1. **Authentication & RBAC:**
   - Passwords salted with bcrypt (12 rounds).
   - Roles: `ASPIRANT` (can attempt, bookmark, take notes, view own dashboard) and `ADMIN` (can access `/admin`, import questions, edit keys, publish).
2. **Rate Limiting:**
   - In-memory token bucket rate limiter for API routes: 60 requests/minute for standard read endpoints, 10 requests/minute for auth and submission endpoints.
3. **Audit Log:**
   - Every mutation in `/admin` (changing an answer key, editing question text, publishing a batch) creates an immutable record in `AuditLog` storing `adminId`, `action`, `entityType`, `entityId`, `previousState`, and `newState`.

---

## 7. Performance & Caching Strategy

- **Static Generation with On-Demand Revalidation:** Public pages like `/pyqs/year/2024` or `/subjects/polity` are rendered with ISR (Incremental Static Regeneration) or cached database queries revalidated when an admin publishes new content.
- **Optimized Client Payloads:** Question card lists use cursor-based pagination (default 20 questions per page) to prevent DOM bloat and high memory consumption on low-end mobile devices.
- **Zero CLS (Cumulative Layout Shift):** All question cards have predetermined aspect-ratio containers and skeleton placeholders during network transitions.

---

## 8. Subscription Architecture & Entitlement Engine

### 8.1 Architectural Principle: Server-Authoritative Entitlements
Client-side button toggles or hidden components are considered purely decorative affordances; the server is the sole authoritative gatekeeper of access. Feature entitlements, quota limits, and pricing are validated server-side on every protected API transaction.

```
                      +---------------------------------------+
                      |         Protected API Request         |
                      |   e.g., POST /api/v1/tests/session/start|
                      +-------------------+-------------------+
                                          |
                                          ▼
                      +---------------------------------------+
                      |       Authentication Middleware       |
                      |       (Extracts Authenticated User)   |
                      +-------------------+-------------------+
                                          |
                                          ▼
                      +---------------------------------------+
                      |          Entitlement Engine           |
                      |        (lib/entitlements.ts)          |
                      +-------------------+-------------------+
                                          |
                        Does User have an ACTIVE subscription?
                               /                    \
                            YES                      NO
                            /                          \
             Check Plan Tier & Quota            Fall back to FREE Plan (Tier 0)
                   /            \                            |
               PASSED         FAILED                         |
                 |               \                           |
                 |             403 Forbidden                 |
                 |       "FORBIDDEN_SUBSCRIPTION_REQUIRED"   |
                 |                                           |
                 ▼                                           ▼
         Execute Action                           Enforce Free Tier Quota
    (Start Exam / Save Bookmark)             (Limit Bookmarks <= 5, Notes <= 3)
```

### 8.2 Entitlement Enforcement Logic (`lib/entitlements.ts`)
1. **`getUserSubscription(userId)`**:
   - Queries `Subscription` table for active records where `status = 'ACTIVE'` and `currentPeriodEnd > now()`.
   - If no active paid subscription is found, falls back to the default `FREE` plan (`tier = 0`).
2. **`checkEntitlement(userId, requiredTier)`**:
   - Verifies whether the user's active plan satisfies `plan.tier >= requiredTier`.
   - Rejects non-qualifying requests with an HTTP 403 `FORBIDDEN_SUBSCRIPTION_REQUIRED` response containing target tier and upgrade link.
3. **`checkQuota(userId, quotaKey, currentUsage)`**:
   - Compares the user's current resource count against the plan's `FeatureEntitlement` value.
   - `-1` indicates unlimited access; any non-negative integer is strictly enforced as the maximum ceiling.

### 8.3 Protected Endpoints & Enforced Quotas
- `POST /api/v1/tests/session/start`: Requires Tier $\ge 2$ (`ACHIEVER`). Free and Beginner users are prevented from creating timed test sessions.
- `POST /api/v1/user/bookmarks`: Enforces quota (Tier 0: 5, Tier 1: 50, Tier 2+: Unlimited).
- `POST /api/v1/user/notes`: Enforces quota (Tier 0: 3, Tier 1: 50, Tier 2+: Unlimited).

---

## 9. Payment Gateway Integration, Webhooks & Idempotency

### 9.1 Checkout Lifecycle & Provider Abstraction
```
User clicks "Upgrade" on /pricing
             │
             ▼
POST /api/v1/billing/checkout
Payload: { planId: "...", billingPeriod: "MONTHLY" | "QUARTERLY" | "ANNUAL" }
             │
             ├─► Server queries authoritative Plan & PlanPrice from DB (Never trusts client price!)
             ├─► Generates unique idempotencyKey: `chk_<userId>_<planId>_<timestamp>`
             ├─► Creates PaymentRecord with status: PENDING
             └─► Returns Checkout Session (Session ID, Amount, Gateway URL or Dev Sandbox)
```

### 9.2 Webhook Security & HMAC Signature Verification
1. **Header Inspection:** The webhook handler inspects the incoming request header (e.g., `x-signature` or `stripe-signature` / `razorpay_signature`).
2. **Cryptographic Validation:** An HMAC-SHA256 hash is computed using the raw request body and the secret `WEBHOOK_SECRET` stored exclusively in environment variables:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{rawBody}, \text{WEBHOOK\_SECRET})$$
   Any mismatch immediately returns HTTP 401 Unauthorized without processing the payload.
3. **Idempotent Event Processing:**
   - Every incoming event contains an `eventId` (e.g., `evt_123456789`).
   - The handler checks if `SubscriptionEvent` already contains `eventId`.
   - If present, the handler immediately returns HTTP 200 `{"received": true, "idempotent": true}` without re-executing state changes or duplicate billing credits.
4. **Subscription State Machine:**
   - **`payment.succeeded`:** Transitions `PaymentRecord` to `SUCCEEDED`. Updates/creates `Subscription` with `status = ACTIVE`, sets `currentPeriodStart = now()` and calculates `currentPeriodEnd` based on billing interval. Records audit entry in `SubscriptionEvent`.
   - **`payment.failed`:** Transitions `PaymentRecord` to `FAILED`. If subscription has no prior successful period, marks `status = PAST_DUE` or `INACTIVE`.
   - **`subscription.cancelled`:** Updates subscription `cancelAtPeriodEnd = true`. User retains access until `currentPeriodEnd`.
