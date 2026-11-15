# UPI Gateway API Reference — Pravaah UPSC

This document provides complete request and response specifications for both the external UPI Gateway microservice and Pravaah UPSC's internal payment API endpoints.

---

## 1. External UPI Gateway Endpoints (Laravel Microservice)

Base URL: `https://payments.yourdomain.com` (Configurable via `UPI_GATEWAY_BASE_URL`)

### 1.1 Create Order
- **Method**: `POST`
- **Path**: `/api/v1/orders`
- **Headers**:
  ```http
  X-Api-Key: key_live_xxxxxxxx
  X-Api-Secret: sec_live_xxxxxxxx
  Content-Type: application/json
  Accept: application/json
  ```
- **Request Body**:
  ```json
  {
    "amount": 5499,
    "client_order_id": "UPICHECKOUT_1731718000_abc123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": "ORD20261115ABC12345",
      "client_order_id": "UPICHECKOUT_1731718000_abc123",
      "amount": "5499.00",
      "currency": "INR",
      "status": "pending",
      "environment": "live",
      "test": false,
      "payment_url": "https://payments.yourdomain.com/pay/ORD20261115ABC12345",
      "upi_intent": "upi://pay?pa=merchant@upi&pn=Pravaah+UPSC&am=5499.00&tr=ORD20261115ABC12345&cu=INR",
      "expires_at": "2026-11-15T18:45:00+05:30"
    }
  }
  ```

---

### 1.2 Get Order Status
- **Method**: `GET`
- **Path**: `/api/v1/orders/{order_id}`
- **Headers**:
  ```http
  X-Api-Key: key_live_xxxxxxxx
  X-Api-Secret: sec_live_xxxxxxxx
  Accept: application/json
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": "ORD20261115ABC12345",
      "client_order_id": "UPICHECKOUT_1731718000_abc123",
      "amount": "5499.00",
      "currency": "INR",
      "status": "paid",
      "environment": "live",
      "test": false,
      "utr": "532189402194",
      "payment_url": "https://payments.yourdomain.com/pay/ORD20261115ABC12345",
      "upi_intent": "upi://pay?pa=merchant@upi&pn=Pravaah+UPSC&am=5499.00&tr=ORD20261115ABC12345&cu=INR",
      "expires_at": "2026-11-15T18:45:00+05:30",
      "paid_at": "2026-11-15T18:34:12+05:30"
    }
  }
  ```

---

## 2. Pravaah UPSC Internal Payment APIs (Next.js)

### 2.1 Initiate UPI Payment Order
- **Method**: `POST`
- **Path**: `/api/v1/payments/create-order`
- **Authentication**: Required (Cookie `pravaah_user_id` or `Authorization: Bearer <token>`)
- **Request Body**:
  ```json
  {
    "productType": "SUBSCRIPTION",
    "productId": "ACHIEVER",
    "billingInterval": "ANNUAL"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "UPICHECKOUT_1731718000_abc123",
      "gatewayOrderId": "ORD20261115ABC12345",
      "productName": "Prelims Pro (Annual)",
      "amount": 5499,
      "currency": "INR",
      "gstRatePercent": 18,
      "baseAmount": 4660.17,
      "gstAmount": 838.83,
      "paymentUrl": "https://payments.yourdomain.com/pay/ORD20261115ABC12345",
      "upiIntent": "upi://pay?pa=merchant@upi&pn=Pravaah+UPSC&am=5499.00&tr=ORD20261115ABC12345&cu=INR",
      "expiresAt": "2026-11-15T18:45:00+05:30",
      "isSandbox": false
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Not signed in.
  - `400 Bad Request`: Missing or invalid product parameters.
  - `404 Not Found`: Plan or product pricing not found.
  - `502 Bad Gateway`: External gateway connectivity failure.

---

### 2.2 Check Payment Order Status
- **Method**: `GET`
- **Path**: `/api/v1/payments/orders/{orderId}/status`
- **Authentication**: Required
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "orderId": "UPICHECKOUT_1731718000_abc123",
      "gatewayOrderId": "ORD20261115ABC12345",
      "status": "PAID",
      "amount": 5499,
      "currency": "INR",
      "utr": "532189402194",
      "isTest": false,
      "paidAt": "2026-11-15T18:34:12.000Z",
      "entitlementActive": true,
      "planCode": "ACHIEVER"
    }
  }
  ```

---

### 2.3 UPI Gateway Webhook Receiver
- **Method**: `POST`
- **Path**: `/api/webhooks/upi-gateway`
- **Authentication**: Cryptographic signature via headers
- **Headers**:
  ```http
  X-Signature: t=1731718452,v1=5d41402abc4b2a76b9719d911017c592b23a7431e3458a2d1e23f4a21098bca1
  X-Event-Id: 00000000-0000-4000-8000-000000000001
  X-Event: order.paid
  Content-Type: application/json
  ```
- **Payload Example**:
  ```json
  {
    "event_id": "00000000-0000-4000-8000-000000000001",
    "event_sequence": 1,
    "occurred_at": "2026-11-15T18:34:12+05:30",
    "event": "order.paid",
    "data": {
      "order_id": "ORD20261115ABC12345",
      "client_order_id": "UPICHECKOUT_1731718000_abc123",
      "amount": "5499.00",
      "currency": "INR",
      "status": "paid",
      "environment": "live",
      "utr": "532189402194"
    }
  }
  ```
- **Responses**:
  - `200 OK`: Event processed or acknowledged as duplicate.
  - `400 Bad Request`: Missing raw body or invalid JSON.
  - `401 Unauthorized`: Signature mismatch, missing header, or timestamp outside the 5-minute replay window.
  - `500 Internal Server Error`: Processing failure during database transaction.

---

### 2.4 Admin Payments Telemetry & Management
- **Method**: `GET`
- **Path**: `/api/v1/admin/payments`
- **Authorization**: Required (`role === "ADMIN"`)
- **Query Parameters**:
  - `status`: Filter by status (`ALL`, `PAID`, `PENDING`, `EXPIRED`, `FAILED`, `UNDER_REVIEW`).
  - `search`: Search by student email, name, UTR, or order reference.
  - `page`: Page index (default: `1`).
  - `limit`: Records per page (default: `25`).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "telemetry": {
      "totalRevenue": 284500,
      "successfulCount": 68,
      "pendingCount": 12,
      "expiredCount": 9,
      "failedCount": 2,
      "underReviewCount": 1
    },
    "orders": [
      {
        "id": "cuid_xyz",
        "clientOrderId": "UPICHECKOUT_1731718000_abc123",
        "gatewayOrderId": "ORD20261115ABC12345",
        "user": {
          "id": "usr_1",
          "fullName": "Priya Sharma",
          "email": "priya@aspirant.in"
        },
        "productType": "SUBSCRIPTION",
        "productId": "ACHIEVER",
        "amount": 5499,
        "status": "PAID",
        "utr": "532189402194",
        "createdAt": "2026-11-15T18:30:00.000Z",
        "paidAt": "2026-11-15T18:34:12.000Z"
      }
    ],
    "pagination": {
      "total": 92,
      "page": 1,
      "totalPages": 4
    }
  }
  ```
