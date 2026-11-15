# UPI Gateway Architecture — Pravaah UPSC

## 1. System Overview & Component Separation

```mermaid
graph TD
    subgraph Client Tier [Aspirant Browser / Mobile Device]
        P[Pricing / Upgrade Page] --> C[UPI Checkout UI]
        C --> QR[Dynamic UPI QR Code]
        C --> APP[UPI Apps: GPay / PhonePe / Paytm / BHIM]
        C --> POLL[Status Polling Loop]
    end

    subgraph Pravaah UPSC [Next.js 14 App Router on Vercel]
        API_O[POST /api/v1/payments/create-order]
        API_S[GET /api/v1/payments/orders/:id/status]
        API_W[POST /api/webhooks/upi-gateway]
        CLIENT[lib/payments/upi-gateway/client.ts]
        FULFILL[Entitlement & Subscription Activator]
    end

    subgraph Database Tier [Neon PostgreSQL]
        DB_PO[(PaymentOrder)]
        DB_WE[(PaymentWebhookEvent)]
        DB_SUB[(Subscription)]
        DB_PL[(Plan & PlanPrice)]
        DB_USR[(User & Profile)]
    end

    subgraph Gateway Tier [Laravel 12 Microservice on payments.yourdomain.com]
        GW_O[POST /api/v1/orders]
        GW_S[GET /api/v1/orders/:id]
        GW_V[Payment Polling & Provider Verification]
        GW_W[Transactional Webhook Outbox Dispatcher]
    end

    C -->|1. Request Order| API_O
    API_O -->|Validate Price| DB_PL
    API_O -->|Create Pending Order| DB_PO
    API_O -->|2. Create Gateway Order| CLIENT
    CLIENT -->|X-Api-Key / Secret| GW_O
    GW_O -->|Return order_id & upi_intent| CLIENT
    CLIENT -->|Return payment_url & QR| API_O
    API_O -->|Render Checkout Details| C

    QR -->|Student Scans / Pays| GW_V
    APP -->|Student Authorizes| GW_V

    GW_V -->|Status Changed| GW_W
    GW_W -->|3. Signed Webhook Event| API_W
    API_W -->|Verify HMAC & Deduplicate| DB_WE
    API_W -->|Atomic Transaction| FULFILL
    FULFILL -->|Mark Order PAID| DB_PO
    FULFILL -->|Activate / Extend Access| DB_SUB

    POLL -->|Query Status| API_S
    API_S -->|Check State| DB_PO
```

---

## 2. Component Design & Responsibilities

### 2.1 Next.js Client Layer
- **Responsibility**: Provides a responsive, distraction-free UPI checkout view consistent with the Pravaah UPSC design system.
- **Key Modules**:
  - `CheckoutUI`: Renders order summary, countdown timer, dynamic QR code, and UPI intent action buttons.
  - `StatusPoller`: Periodically requests `/api/v1/payments/orders/[orderId]/status` every 3 seconds until a terminal state (`PAID`, `FAILED`, `EXPIRED`) is reached.
  - `IntentLauncher`: Direct links for mobile browsers (`upi://pay?...`) targeting installed UPI applications (Google Pay, PhonePe, Paytm, CRED, BHIM).

### 2.2 Next.js Server Layer (`lib/payments/upi-gateway/`)
- **`config.ts`**:
  - Reads environment variables with strict runtime validation (`UPI_GATEWAY_BASE_URL`, `UPI_GATEWAY_API_KEY`, `UPI_GATEWAY_API_SECRET`, `UPI_GATEWAY_WEBHOOK_SECRET`, `UPI_GATEWAY_SANDBOX_MODE`).
  - Distinguishes between Live and Sandbox URLs and signing secrets.
- **`client.ts`**:
  - Encapsulates `fetch` with 10-second connection timeouts, error normalization, and request/response logging (with credentials scrubbed).
- **`create-order.ts`**:
  - Orchestrates price validation, internal order reference generation (`UPICHECKOUT_...`), gateway order initiation, and database persistence.
- **`verify-status.ts`**:
  - Calls `GET /api/v1/orders/{id}` to synchronize status when webhooks are delayed or when the client polls.
- **`webhook-verification.ts`**:
  - Performs regex extraction of `t=` (timestamp) and `v1=` (signature), evaluates the 5-minute replay window, and performs constant-time byte comparison using `crypto.timingSafeEqual`.
- **`types.ts` & `errors.ts`**:
  - Strongly typed TypeScript interfaces and domain-specific error classes (`UpiGatewayApiError`, `WebhookVerificationError`, `OrderNotFoundError`).

### 2.3 Database Tier (Prisma + PostgreSQL)
- **`PaymentOrder` Table**:
  - Master order record containing student ID, internal reference (`clientOrderId`), gateway order ID (`gatewayOrderId`), product details, amount in INR and paise, status (`PENDING`, `PROCESSING`, `PAID`, `FAILED`, `EXPIRED`, `UNDER_REVIEW`, `REFUNDED`), and expiry timestamps.
- **`PaymentWebhookEvent` Table**:
  - Durable ledger storing incoming `X-Event-Id` UUIDs, event sequence counters, raw request bodies, and processing results. Unique constraint on `eventId` guarantees idempotency.

### 2.4 External UPI Gateway Service
- Deployed independently on a dedicated VPS or containerized platform.
- Handles direct bank polling, dynamic QR payload generation, and UTR reconciliation.
- Queues events into a durable MySQL webhook outbox and retries deliveries with exponential backoff.

---

## 3. End-to-End Payment Flows

### 3.1 Standard Payment Success Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Aspirant
    participant Client as Next.js Checkout UI
    participant Backend as Pravaah Backend API
    participant DB as Neon PostgreSQL
    participant Gateway as UPI Gateway Service
    participant Bank as UPI / NPCI Network

    Student->>Client: Clicks "Upgrade to Prelims Pro"
    Client->>Backend: POST /api/v1/payments/create-order { planCode: "ACHIEVER", interval: "ANNUAL" }
    Backend->>DB: Query authoritative price (₹5,499)
    Backend->>DB: INSERT PaymentOrder (status: PENDING, clientOrderId: "UPICHECKOUT_...")
    Backend->>Gateway: POST /api/v1/orders (amount: 5499, client_order_id: "UPICHECKOUT_...")
    Gateway-->>Backend: 201 Created { order_id: "ORD_XYZ", upi_intent: "...", payment_url: "..." }
    Backend->>DB: UPDATE PaymentOrder (gatewayOrderId: "ORD_XYZ", upiIntent: "...")
    Backend-->>Client: 200 OK { orderId, paymentUrl, upiIntent, amount: 5499 }
    Client->>Student: Displays Dynamic QR Code & "Open UPI App" button
    Student->>Bank: Scans QR / Approves ₹5,499 in UPI App
    Bank-->>Gateway: Settlement confirmed (UTR: "532189402194")
    Gateway->>Backend: POST /api/webhooks/upi-gateway [Signed: order.paid]
    Backend->>Backend: Verify X-Signature (t=..., v1=...) with timingSafeEqual
    Backend->>DB: INSERT PaymentWebhookEvent (eventId: "uuid-123")
    Backend->>DB: TRANSACTION: UPDATE PaymentOrder(PAID, utr) + UPSERT Subscription(ACTIVE)
    Backend-->>Gateway: 200 OK { success: true }
    Client->>Backend: GET /api/v1/payments/orders/UPICHECKOUT_.../status
    Backend-->>Client: { status: "PAID" }
    Client->>Student: Redirects to Success View / Unlocks Features
```

### 3.2 Late Payment Recovery Flow
Aspirants occasionally complete bank authentication slightly after the 15-minute countdown expiry.
- If the gateway receives confirmed settlement within its 24-hour late recovery window, it dispatches an `order.paid` event.
- Pravaah UPSC's webhook handler checks if the order was previously marked `EXPIRED`.
- The handler executes the transition `EXPIRED -> PAID`, updates the UTR, logs an audit event, and activates the subscription.
- This ensures no aspirant loses money or access due to transient network lag during bank verification.

---

## 4. Idempotency & Fault-Tolerance Principles

1. **At-Least-Once Delivery Resilience**:
   The gateway delivers webhooks at least once; duplicate deliveries are anticipated. By storing `X-Event-Id` in `PaymentWebhookEvent` with a unique index, subsequent deliveries for the same event ID return `200 OK` with `{ message: "Webhook already processed idempotently" }` without re-executing entitlements.
2. **Out-of-Order Sequence Safety**:
   Each gateway webhook payload includes an `event_sequence` integer. If an older `order.expired` (sequence 1) arrives after a late `order.paid` (sequence 2), the handler detects the sequence and refuses to revert `PAID` back to `EXPIRED`.
3. **Database Transaction Isolation**:
   Payment status updates and subscription activations run in an atomic `prisma.$transaction`. If subscription provisioning fails, the payment status change rolls back.
