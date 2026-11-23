# PAYMENT ARCHITECTURE CLEANUP REPORT

**Architecture Version**: 2.0 (Provider-Independent & Cashfree-Ready)  
**Date**: November 23, 2026  
**Module Root**: `lib/payments/`  
**Status**: **CLEANUP COMPLETE — CASHFREE NOT YET CONFIGURED**

---

## 1. Architectural Overview

To eliminate gateway vendor lock-in, eliminate hardcoded mock payment logic, and prepare Pravaah UPSC for seamless Cashfree onboarding upon merchant approval, a provider-independent payment architecture has been engineered.

```
lib/payments/
├── payment-types.ts      (Universal provider contracts, types, and status enums)
├── payment-status.ts     (Canonical status normalization across payment gateways)
├── payment-config.ts     (Environment contract validator & kill switch)
├── payment-provider.ts   (Provider registry, resolver, and fallback null provider)
├── providers/
│   └── cashfree-provider.ts (Architectural placeholder; no active API calls)
└── index.ts              (Unified barrel export)
```

---

## 2. Core Architectural Components

### 2.1 Universal Provider Interface (`payment-types.ts`)
Defines the strict TypeScript contract that any future gateway (Cashfree, Razorpay, etc.) must implement:
```typescript
export interface PaymentProvider {
  readonly providerName: string;
  isConfigured(): boolean;
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;
  fetchOrder(orderId: string): Promise<PaymentOrderResult>;
  verifyPayment(orderId: string): Promise<PaymentVerificationResult>;
  processWebhook(params: WebhookVerificationParams): Promise<WebhookVerificationResult>;
  refundPayment(params: RefundParams): Promise<RefundResult>;
  normalizeStatus(rawStatus: string): PaymentStatus;
}
```

### 2.2 Canonical Status Normalization (`payment-status.ts`)
Ensures gateway-specific status codes (e.g., Cashfree's `PAID` vs Razorpay's `captured` vs Stripe's `succeeded`) map deterministically into Pravaah's internal status lifecycle:
- `"PAID"`
- `"PENDING"`
- `"PROCESSING"`
- `"FAILED"`
- `"CANCELLED"`
- `"EXPIRED"`
- `"REFUNDED"`
- `"USER_DROPPED"`

### 2.3 Master Kill Switch & Configuration Contract (`payment-config.ts`)
Enforces that payments can NEVER be enabled by accident:
```typescript
export function isPaymentSystemEnabled(): boolean {
  if (process.env.ENABLE_PAYMENTS !== "true") {
    return false;
  }
  const cashfree = getCashfreeConfig();
  return cashfree.isConfigured;
}
```
- Defaults to `false`.
- Requires both `ENABLE_PAYMENTS="true"` and non-empty, non-mock Cashfree credentials.

### 2.4 Null Payment Provider Pattern (`payment-provider.ts`)
When `isPaymentSystemEnabled()` is false, the payment engine resolves to `NullPaymentProvider`. Any attempt to trigger payment methods immediately throws `PAYMENTS_DISABLED_MESSAGE` with zero external network activity.

### 2.5 Cashfree Placeholder (`providers/cashfree-provider.ts`)
A strict architectural stub. It satisfies the `PaymentProvider` interface without pretending to process payments or generating mock sessions. Every method throws:
`PaymentGatewayNotConfiguredError("Cashfree merchant account is currently under review.")`.

---

## 3. Separation of Concerns & Clean Code Guarantees

1. **Zero Mock Payment Leakage**: No development mocks or browser-triggerable webhooks exist in the payment architecture.
2. **Deterministic Fallback**: If an order query is made, it reads historical data directly from PostgreSQL rather than making external calls.
3. **Plug-and-Play Cashfree Activation**: When the user receives Cashfree merchant approval, only `providers/cashfree-provider.ts` needs real SDK/REST calls; zero frontend or database redesign will be necessary.
