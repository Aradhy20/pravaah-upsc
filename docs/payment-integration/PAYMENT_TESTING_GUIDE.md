# Pravaah UPSC — UPI Gateway Integration Testing Guide

This guide covers the testing methodology, test suite execution, coverage matrix, and offline simulation harness used to verify the UPI Gateway integration for Pravaah UPSC.

---

## 1. Overview of Test Architecture

The payment test harness tests end-to-end payment flows without requiring live bank transactions or real UPI apps. It runs against the local Next.js server (`http://localhost:3000`) and the Docker PostgreSQL database.

### Key Components Under Test
1. **Authoritative Order Creation** (`POST /api/v1/payments/create-order`):
   - User authentication verification
   - Server-side DB product and price catalog resolution
   - Exact 18% GST calculation and paise conversion
   - Pending `PaymentOrder` record persistence
   - Safe client response filtering (no secret leakage)
2. **Gateway API Client** (`lib/payments/upi-gateway/client.ts`):
   - Request timeouts (10s)
   - Invalid API credential rejections (401 Bad Credentials)
   - Connection error handling (`UpiGatewayNetworkError`)
   - Sandbox vs Live environment isolation
3. **Cryptographic Webhook Ingestion** (`POST /api/webhooks/upi-gateway`):
   - Raw body HMAC-SHA256 signature verification (`t=...,v1=...`)
   - Replay protection with strict 300-second timestamp drift rejection
   - Constant-time signature comparison (`crypto.timingSafeEqual`)
   - Event deduplication on `eventId`
   - Out-of-order sequence protection (`event_sequence`)
   - Late payment recovery (transitioning `EXPIRED` -> `PAID` within 24 hours)
4. **Order Status Polling & Entitlement Fulfillment** (`GET /api/v1/payments/orders/[orderId]/status`):
   - Immediate status reflection
   - Atomic database transactions (`prisma.$transaction`)
   - Real-time provisioning of `Subscription` and premium flags on `User`
   - Duplicate query idempotency (multiple polls never double-grant access)
5. **Financial Admin Ledger API** (`GET /api/v1/admin/payments`):
   - Role-based access control (Admin-only)
   - Revenue metrics aggregation (`totalRevenueInr`, `successfulCount`, `pendingCount`, `failedCount`)
   - Query filters by status, student email, and pagination

---

## 2. Test Suite Matrix (17 Test Scenarios)

The test suite is located at [`tests/upi_gateway_integration.test.mjs`](file:///Volumes/DevDrive/pravaah-upsc/tests/upi_gateway_integration.test.mjs).

| # | Test Scenario | Verified Endpoint / Module | Expected Result |
|---|---|---|---|
| **1** | Successful Payment Order Creation | `POST /api/v1/payments/create-order` | 201 Created, 18% GST added, pending DB order created |
| **2** | Invalid API Credentials Handling | `UpiGatewayClient` | Rejects with `UpiGatewayApiError: Unauthorized / Invalid API Key` |
| **3** | Gateway Timeout Handling | `UpiGatewayClient` | Aborts within timeout and raises `UpiGatewayNetworkError` |
| **4** | Price Tampering Rejection | `POST /api/v1/payments/create-order` | Rejects spoofed prices, only accepts catalog price |
| **5** | Unauthenticated Checkout Rejection | `POST /api/v1/payments/create-order` | 401 Unauthorized when session cookie is absent |
| **6** | Valid Signed Webhook Entitlement | `POST /api/webhooks/upi-gateway` | 200 OK, transitions to PAID, activates `Subscription` |
| **7** | Invalid Webhook Signature Rejection | `POST /api/webhooks/upi-gateway` | 401 Unauthorized on forged `v1` signature |
| **8** | Expired Webhook Replay Rejection | `POST /api/webhooks/upi-gateway` | 400 Bad Request on timestamp drift > 300s |
| **9** | Duplicate Webhook Idempotency | `POST /api/webhooks/upi-gateway` | 200 OK on duplicate event ID without double-provisioning |
| **10** | Out-of-Order Webhook Safety | `POST /api/webhooks/upi-gateway` | Older `order.expired` cannot revert `order.paid` |
| **11** | Order Expiry Transition | `POST /api/webhooks/upi-gateway` | `order.expired` marks PENDING order as EXPIRED |
| **12** | Late Payment Recovery | `POST /api/webhooks/upi-gateway` | `order.paid` arrives after expiry -> recovers order to PAID |
| **13** | Sandbox vs Live Isolation Flags | `POST /api/v1/payments/create-order` | `isSandbox: true` flag set when sandbox mode is active |
| **14** | Status Polling Idempotency | `GET /api/v1/payments/orders/[id]/status`| Multiple polls return status without creating duplicate rows |
| **15** | Order Not Found 404 | `GET /api/v1/payments/orders/[id]/status`| 404 Not Found on invalid order ID |
| **16** | Admin Access Control | `GET /api/v1/admin/payments` | 401/403 for unauthenticated or non-admin users |
| **17** | Admin Financial Ledger & Telemetry | `GET /api/v1/admin/payments` | Returns aggregated revenue metrics and orders array |

---

## 3. Running the Test Suite

### Prerequisites
1. Ensure the Next.js development server is running:
   ```bash
   npm run dev
   ```
2. Verify database connection in `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   ```

### Command to Execute Tests
```bash
node tests/upi_gateway_integration.test.mjs
```

### Running in CI/CD Environments
In automated pipelines (GitHub Actions, Vercel preview):
```bash
# 1. Run migrations / push schema
npx prisma db push --skip-generate

# 2. Build or start background server
npm run build
npm start &

# 3. Wait for port 3000 to be ready
npx wait-on http://localhost:3000

# 4. Run payment test suite
node tests/upi_gateway_integration.test.mjs
```

---

## 4. Webhook Test Signature Generation Utility

A helper is available in `lib/payments/upi-gateway/webhook-verification.ts` to sign test payloads:

```typescript
import { generateWebhookSignature } from '@/lib/payments/upi-gateway';

const payload = JSON.stringify({
  event_id: 'evt_test_123',
  event: 'order.paid',
  data: {
    client_order_id: 'UPICHECKOUT_1234567890_abc123',
    status: 'paid',
    utr: 'UTR9988776655',
    amount: '1768.82'
  }
});

const { timestamp, signature, header } = generateWebhookSignature(
  payload,
  process.env.UPI_GATEWAY_WEBHOOK_SECRET!
);

// Send to endpoint:
fetch('http://localhost:3000/api/webhooks/upi-gateway', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': header, // Format: t=1731690000,v1=a1b2c3...
    'X-Event-Id': 'evt_test_123',
    'X-Event': 'order.paid'
  },
  body: payload
});
```

---

## 5. Offline Simulation vs Live Gateway

When developing locally or running offline tests, the integration utilizes deterministic simulation inside `UpiGatewayClient` (`lib/payments/upi-gateway/client.ts`):
- If `UPI_GATEWAY_SANDBOX_MODE="true"` and no live external server is reachable, the client creates a compliant mock order response with dynamic UPI intent strings (`upi://pay?pa=...&pn=PravaahUPSC&am=...&cu=INR&tn=...`).
- When ready for end-to-end staging with a live gateway, point `UPI_GATEWAY_BASE_URL` to the staging server and set `UPI_GATEWAY_API_KEY` and `UPI_GATEWAY_API_SECRET`.
