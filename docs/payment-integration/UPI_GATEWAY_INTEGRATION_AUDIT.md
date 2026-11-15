# UPI Gateway Integration Audit — Pravaah UPSC

## 1. Executive Summary

This audit assesses the integration of the self-hosted **UPI Gateway** (Laravel 12 / PHP 8.2+ / MySQL 8+) into the **Pravaah UPSC** platform (Next.js 14 / TypeScript / Prisma / PostgreSQL).

The primary objective is to enable direct, low-friction Unified Payments Interface (UPI) payments for UPSC aspirants across:
1. Premium multi-tier subscription plans (Syllabus Sprint, Prelims Pro, Ranker Suite).
2. Full-length mock test series packages.
3. Individual timed exam attempts.
4. AI Mains answer evaluation token packs.
5. Current affairs analytical compilations.
6. Advanced study planner and mistake notebook features.

In strict compliance with architectural constraints:
- **No Laravel application source code is merged into the Next.js frontend/backend codebase.**
- The UPI Gateway is deployed independently as a separate microservice on a dedicated subdomain (e.g., `https://payments.pravaah.in`).
- Pravaah UPSC communicates with the gateway exclusively through secure server-side API requests using `X-Api-Key` and `X-Api-Secret`.
- Merchant secrets, private keys, and webhook signing keys remain strictly on the server side.
- All entitlement activations require cryptographically verified webhooks or verified status API lookups within atomic database transactions.

---

## 2. Existing Pravaah UPSC Stack Audit

### 2.1 Technology Stack & Versions
- **Framework**: Next.js 14.2.18 (App Router architecture, React Server Components + Client Components).
- **Runtime & Language**: Node.js v20+, TypeScript 5.6.3.
- **ORM & Database**: Prisma ORM 5.22.0, PostgreSQL hosted on Neon Serverless (`neondb`).
- **Styling**: Tailwind CSS 3.4.15, Lucide React icons.
- **Testing**: Node.js Native Test Runner (`node:test`, `node:assert`), 46 automated integration & E2E tests.
- **Hosting / Deployment**: Vercel (Next.js frontend & serverless API routes), Neon (PostgreSQL database).

### 2.2 Authentication & Authorization (RBAC)
- **Token Architecture**: Cryptographically signed HMAC-SHA256 session tokens stored in HTTP-only `pravaah_user_id` cookies with 30-day expiry (`lib/auth.ts`).
- **Roles**: Relational `Role` model with `ASPIRANT` (standard student) and `ADMIN` (content and system administrator).
- **Server Guardrails**: `getAuthenticatedUser(request)` extracts and verifies session signatures from headers (`x-user-id`, `authorization: Bearer ...`) or cookies, preventing unauthorized access.

### 2.3 Current Billing & Entitlement Architecture
- **Models in `prisma/schema.prisma`**:
  - `Plan`: Stores plan code (`FREE`, `BEGINNER`, `ACHIEVER`, `SCHOLAR`), name, tier level (0-3), and active status.
  - `PlanPrice`: Billing intervals (`MONTHLY`, `QUARTERLY`, `ANNUAL`), amounts in INR, discounts.
  - `PlanFeature` & `FeatureEntitlement`: Feature matrix (`TIMED_EXAMS`, `MISTAKE_REVISION`, `ADVANCED_ANALYTICS`, `BOOKMARKS_LIMIT`).
  - `Subscription`: User active tier, billing period (`currentPeriodStart`, `currentPeriodEnd`), status (`ACTIVE`, `CANCELED`, `EXPIRED`).
  - `PaymentRecord`: Relational audit trail with `amount`, `status`, `provider`, `providerTxId`, `idempotencyKey`.
- **Existing Routes**:
  - `POST /api/v1/billing/checkout`: Verifies server-side plan pricing and returns checkout details with 18% GST itemization.
  - `POST /api/v1/billing/webhook`: Internal dev/sandbox webhook handling `payment.succeeded` with `x-pravaah-webhook-signature`.
  - `GET /api/v1/user/subscription`: Returns active subscription details and entitlement tier.
  - `POST /api/v1/user/subscription/cancel`: Cancels auto-renewal while preserving current period access.

---

## 3. UPI Gateway Specification Audit

Based on the [mynkdev-21/upi-gateway](https://github.com/mynkdev-21/upi-gateway) repository specification:

### 3.1 Architecture & Core Components
- **Framework**: Laravel 12 on PHP 8.2+ with MySQL 8.0+.
- **Payment Mechanism**: Dynamic UPI QR codes and UPI Intent strings (`upi://pay?pa=...&am=...&tr=...`).
- **Funds Flow**: Direct peer-to-merchant UPI transfer; does not hold or escrow merchant funds.
- **Environment Isolation**: Complete separation of Live and Sandbox (`test_key_...`, `test_sec_...`).

### 3.2 Merchant API Endpoints
1. **Create Order**: `POST /api/v1/orders`
   - Headers: `X-Api-Key`, `X-Api-Secret`, `Content-Type: application/json`
   - Body: `{ "amount": number, "client_order_id": string }`
   - Response: `order_id`, `client_order_id`, `amount`, `currency`, `status`, `environment`, `payment_url`, `upi_intent`, `expires_at`.
2. **Order Status**: `GET /api/v1/orders/{id}`
   - Headers: `X-Api-Key`, `X-Api-Secret`
   - Response: `order_id`, `client_order_id`, `amount`, `status`, `utr`, `paid_at`, etc.

### 3.3 Webhook Notification & Security
- **Headers**:
  - `X-Signature: t=<unix_timestamp>,v1=<hex_hmac_sha256>`
  - `X-Event-Id: <uuid>`
  - `X-Event: <event_name>` (e.g., `order.paid`, `order.expired`, `order.under_review`)
- **Signature Calculation**:
  `HMAC-SHA256(timestamp + "." + raw_body, webhook_signing_secret)`
- **Security Constraints**:
  - Signature timestamp tolerance: strictly within 300 seconds (5 minutes).
  - Constant-time HMAC comparison via `crypto.timingSafeEqual`.
  - Transactional event deduplication on `event_id` unique constraint.
  - Out-of-order event handling using `event_sequence`.
  - Late recovery: A payment may transition to `PAID` after an earlier `order.expired` notification.

---

## 4. Integration Strategy & Architecture

```
+-------------------------------------------------------------------------+
|                           STUDENT BROWSER                               |
|   Pricing Page -> Checkout Modal/View -> Scan QR / Open UPI App         |
+-------------------------------------------------------------------------+
                                    |
                                    v (HTTPS JSON)
+-------------------------------------------------------------------------+
|                  PRAVAAH UPSC BACKEND (Next.js 14)                      |
|                                                                         |
|  1. POST /api/v1/payments/create-order                                  |
|     - Authenticates student session (HMAC-SHA256)                       |
|     - Verifies catalog price in DB (Prevents client tampering)          |
|     - Creates pending PaymentOrder record                               |
|     - Invokes UPI Gateway API (POST /api/v1/orders)                     |
|     - Saves gateway order_id, payment_url, upi_intent                   |
|     - Returns checkout payload to student                               |
|                                                                         |
|  2. POST /api/webhooks/upi-gateway                                      |
|     - Verifies X-Signature (t=..., v1=...) with timingSafeEqual         |
|     - Enforces 5-minute replay window                                   |
|     - Records event_id in PaymentWebhookEvent table                     |
|     - Transactionally activates Subscription or Feature Entitlement     |
|                                                                         |
|  3. GET /api/v1/payments/orders/[orderId]/status                        |
|     - Synchronizes live status with gateway GET /api/v1/orders/{id}     |
|     - Returns authoritative fulfillment status to student               |
+-------------------------------------------------------------------------+
            |                                         ^
            | (Server-to-Server HTTPS)                | (Signed Webhook)
            v                                         |
+-------------------------------------------------------------------------+
|                 UPI GATEWAY SERVICE (Laravel 12 / PHP 8)                |
|               Deployed on https://payments.yourdomain.com               |
|                                                                         |
|  - Generates Dynamic UPI QR Codes & UPI Intent links                    |
|  - Verifies bank settlement / UTR                                       |
|  - Queues signed webhook events in Transactional Webhook Outbox         |
+-------------------------------------------------------------------------+
```

---

## 5. Security & Risk Assessment

| Risk | Mitigation Strategy |
|---|---|
| **Price Tampering in Browser** | Backend queries `PlanPrice` / product catalog directly from PostgreSQL; amount from client is never trusted. |
| **Fake Payment Success Spoofing** | Student returning to success URL never triggers activation; activation is gated solely by signed webhook or authoritative gateway API status lookup. |
| **Webhook Replay Attack** | Timestamps older than 300 seconds are rejected with HTTP 401; `X-Event-Id` stored with a DB unique constraint. |
| **Timing Attacks on Signature** | Signatures verified using `crypto.timingSafeEqual` over raw UTF-8 bytes. |
| **Out-of-Order Webhook Delivery** | `event_sequence` evaluated; expired state cannot overwrite a subsequent paid state. |
| **Late Payment Recovery** | If an aspirant pays near or after the 15-minute window and bank confirms settlement, gateway emits `order.paid`; system accepts recovery and activates access. |
| **Sandbox / Live Leakage** | Separate signing secrets for live and sandbox; sandbox mode explicitly flagged in DB. |
| **Credential Leakage** | All API keys and secrets stored exclusively in server environment variables, never prefixed with `NEXT_PUBLIC_`. |

---

## 6. Implementation Roadmap

- **Phase 1: Repository Audit** (Completed in this document).
- **Phase 2: Architecture & API Reference Documentation**.
- **Phase 3: Database Schema Migration** (`PaymentOrder`, `PaymentWebhookEvent`).
- **Phase 4: Dedicated Gateway Client** (`lib/payments/upi-gateway/`).
- **Phase 5: Server-Side Order Creation API** (`/api/v1/payments/create-order`).
- **Phase 6: Cryptographically Verified Webhook Endpoint** (`/api/webhooks/upi-gateway`).
- **Phase 7: Student Checkout Interface** (QR Code, Intent, Countdown, Status Polling).
- **Phase 8: Entitlement & Fulfillment Engine** (Atomic DB transactions).
- **Phase 9: Administrative Payment Management Dashboard** (`/admin/payments`).
- **Phase 10: Automated Test Suite** (17 comprehensive test scenarios).
- **Phase 11: Deployment & Operations Guides**.
- **Phase 12: Production Readiness Report**.
