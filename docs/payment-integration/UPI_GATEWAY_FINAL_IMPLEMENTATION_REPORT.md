# Pravaah UPSC — UPI Gateway Production Integration Report

**Date**: November 2026  
**Platform**: Pravaah UPSC (UPSC CSE Learning & Evaluation Platform)  
**Gateway**: Self-Hosted Laravel UPI Gateway ([github.com/mynkdev-21/upi-gateway](https://github.com/mynkdev-21/upi-gateway))  
**Status**: COMPLETE & VERIFIED  

---

## 1. Executive Summary

The production-ready UPI payment gateway has been seamlessly integrated into **Pravaah UPSC**. The architecture strictly respects the boundary rule: **the external Laravel 12 gateway microservice remains completely independent**, hosted on a proposed subdomain (`https://payments.pravaahupsc.com`), while Pravaah UPSC acts as a secure, authenticated API client.

All merchant credentials (`X-Api-Key`, `X-Api-Secret`, `UPI_GATEWAY_WEBHOOK_SECRET`) remain strictly server-side. Payments are supported for all primary catalog items:
1. **Syllabus Sprint** (Monthly / Annual)
2. **Prelims Pro** (Monthly / Annual)
3. **Ranker Suite** (Monthly / Annual)
4. **Mock Test Series Packages**
5. **Mains Answer Evaluation Packs**
6. **Current Affairs Premium Access**

---

## 2. Architecture & Design Principles Implemented

### Strict Service Separation
- Next.js 14 App Router and Prisma handle all student-facing checkout flows, internal order management, entitlement provisioning, and admin monitoring.
- Laravel UPI Gateway handles bank communication, dynamic VPA string generation, intent links, and NPCI settlement status outbox.

### Cryptographic Security & Webhook Hardening
- **Signature Parsing**: Extracts timestamp `t` and SHA-256 HMAC hash `v1` from `X-Signature: t=...,v1=...`.
- **Replay Defense**: Rejects any request where `|currentTime - t| > 300 seconds`.
- **Constant-Time Comparison**: Employs Node.js `crypto.timingSafeEqual` over raw UTF-8 buffers to eliminate timing side-channel attacks.
- **Event Deduplication**: Persists unique `X-Event-Id` into `PaymentWebhookEvent` with database-enforced unique constraints (`P2002`). Duplicate webhook deliveries are acknowledged with HTTP 200 without duplicate processing.
- **Out-of-Order Sequence Protection**: Tracks `event_sequence`. Delayed `order.expired` events are dropped if an order has already transitioned to `PAID`.
- **Late Payment Recovery**: Complies with the 24-hour late recovery standard. If bank confirmation arrives after the frontend timer expired, the system safely transitions `EXPIRED` orders to `PAID` and provisions entitlements.

### Financial Integrity & Authoritative Pricing
- **Zero Client Trust**: The frontend cannot specify prices or amounts. All prices are resolved server-side from authoritative database constants with 18% statutory GST.
- **Integer Paise Representation**: All calculations use integer paise internally (`amountPaise`) to prevent floating-point rounding errors.
- **Atomic Entitlement Provisioning**: Status verification and entitlement activation run inside an atomic `prisma.$transaction` with custom max-wait timeouts adapted for PostgreSQL connection pooling.

---

## 3. Inventory of Delivered Modules & Files

### A. Core Library Modules (`lib/payments/upi-gateway/`)
- [`types.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/types.ts): TypeScript type definitions, order statuses, product enums, API request/response contracts.
- [`errors.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/errors.ts): Specialized error hierarchy (`UpiGatewayError`, `UpiGatewayApiError`, `UpiGatewayNetworkError`, `WebhookVerificationError`, `OrderNotFoundError`).
- [`config.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/config.ts): Environment configuration, secret masking, and sandbox mode toggles.
- [`client.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/client.ts): Server-to-server HTTP client with 10s request abort timeout and offline deterministic sandbox simulation.
- [`create-order.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/create-order.ts): Product resolution, GST computation, internal `PaymentOrder` creation, and gateway order generation.
- [`verify-status.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/verify-status.ts): Order state synchronization, database transaction manager, and atomic entitlement provisioning (`Subscription` + `User`).
- [`webhook-verification.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/webhook-verification.ts): Cryptographic HMAC verification, replay tolerance checks, and test signature generation.
- [`index.ts`](file:///Volumes/DevDrive/pravaah-upsc/lib/payments/upi-gateway/index.ts): Barrel export file.

### B. REST API Route Handlers
- [`POST /api/v1/payments/create-order`](file:///Volumes/DevDrive/pravaah-upsc/app/api/v1/payments/create-order/route.ts): Authenticated order initialization with server-side pricing.
- [`GET /api/v1/payments/orders/[orderId]/status`](file:///Volumes/DevDrive/pravaah-upsc/app/api/v1/payments/orders/[orderId]/status/route.ts): Real-time polling with optional gateway synchronization.
- [`POST /api/webhooks/upi-gateway`](file:///Volumes/DevDrive/pravaah-upsc/app/api/webhooks/upi-gateway/route.ts): Authenticated webhook receiver with idempotency, sequence checks, and late payment recovery.
- [`GET /api/v1/admin/payments`](file:///Volumes/DevDrive/pravaah-upsc/app/api/v1/admin/payments/route.ts): Financial telemetry, revenue metrics aggregation, search, and pagination.

### C. Database Schema (`prisma/schema.prisma`)
- Added `PaymentOrder` model with indexes on `[userId, status]`, `[clientOrderId]`, `[gatewayOrderId]`, and `[createdAt]`.
- Added `PaymentWebhookEvent` model with unique constraint on `[eventId]`.
- Linked `PaymentOrder` to `User` and `Subscription` models.

### D. User Interface & Dashboards
- [`app/checkout/[orderId]/page.tsx`](file:///Volumes/DevDrive/pravaah-upsc/app/checkout/[orderId]/page.tsx): Mobile-responsive UPI checkout experience with dynamic QR code, 15-minute countdown timer, deep links for Google Pay, PhonePe, Paytm, and hosted gateway fallback.
- [`app/admin/payments/page.tsx`](file:///Volumes/DevDrive/pravaah-upsc/app/admin/payments/page.tsx): Financial ledger with live revenue cards (Total, Paid, Pending, Expired), live search, status filtering, and manual status sync.
- Updated [`components/UpgradeModal.tsx`](file:///Volumes/DevDrive/pravaah-upsc/components/UpgradeModal.tsx), [`app/pricing/page.tsx`](file:///Volumes/DevDrive/pravaah-upsc/app/pricing/page.tsx), and [`app/admin/page.tsx`](file:///Volumes/DevDrive/pravaah-upsc/app/admin/page.tsx).

### E. Comprehensive Documentation Suite (`docs/payment-integration/`)
1. [`UPI_GATEWAY_INTEGRATION_AUDIT.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/UPI_GATEWAY_INTEGRATION_AUDIT.md): Repository audit, stack analysis, and security risks.
2. [`UPI_GATEWAY_ARCHITECTURE.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/UPI_GATEWAY_ARCHITECTURE.md): Microservice topology, sequence diagrams, and fail-safe design.
3. [`UPI_GATEWAY_API_REFERENCE.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/UPI_GATEWAY_API_REFERENCE.md): Complete schemas for internal and external endpoints.
4. [`PAYMENT_DATABASE_DESIGN.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/PAYMENT_DATABASE_DESIGN.md): Entity relationship diagrams, constraints, and state machine.
5. [`WEBHOOK_SECURITY.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/WEBHOOK_SECURITY.md): HMAC verification, replay windows, and late recovery logic.
6. [`PAYMENT_TESTING_GUIDE.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/PAYMENT_TESTING_GUIDE.md): Testing methodology and 17 test scenario specifications.
7. [`PAYMENT_DEPLOYMENT_GUIDE.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/PAYMENT_DEPLOYMENT_GUIDE.md): VPS provisioning, Nginx SSL, supervisor queue workers, and Vercel configuration.
8. [`PAYMENT_OPERATIONS_RUNBOOK.md`](file:///Volumes/DevDrive/pravaah-upsc/docs/payment-integration/PAYMENT_OPERATIONS_RUNBOOK.md): UTR dispute resolution, refund policy, and troubleshooting playbooks.

---

## 4. Test Verification Results

All 17 automated integration tests in [`tests/upi_gateway_integration.test.mjs`](file:///Volumes/DevDrive/pravaah-upsc/tests/upi_gateway_integration.test.mjs) pass with zero errors:
- Order creation with 18% GST calculation: PASS
- Gateway timeout and bad credentials handling: PASS
- Tampered pricing rejection: PASS
- Webhook signature and timestamp drift protection: PASS
- Duplicate webhook idempotency and event deduplication: PASS
- Out-of-order event sequence protection: PASS
- Late payment recovery from expired state: PASS
- Sandbox isolation flags: PASS
- Duplicate query entitlement prevention: PASS
- Admin role enforcement: PASS
