# CASHFREE ORDER AMOUNT VALIDATION & SERVER-SIDE PRICE INTEGRITY
**Platform:** Pravaah UPSC SaaS (https://pravaah-upsc.vercel.app/)  
**Document Type:** Security Audit & Order Validation Report  
**Payment Gateway:** Cashfree Payments Hosted Checkout  
**Date:** November 24, 2026  

---

## 1. Zero Client Trust Principle

In financial transactions, client-submitted prices cannot be trusted. Pravaah UPSC enforces a strict server-authoritative pricing model:

1. **Payload Ingestion:** The client endpoint `POST /api/v1/payments/create-order` only accepts `planCode` (e.g. `"PRO"`), `billingInterval` (e.g. `"ANNUAL"`), and optional `couponCode`.
2. **Server-Side Price Resolution:** The backend ignores any `amount`, `price`, or `currency` properties passed by the client. The exact order value is fetched directly from the database `PlanPrice` record or the canonical catalogue fallback via `resolveCanonicalPrice()`.
3. **Coupon Validation:** If a coupon code is supplied, the server validates its active state, bounds the discount value, and guarantees that the net order amount never falls below ₹1.00.
4. **Order Creation Consistency:** The resolved `finalAmount` (e.g. ₹1,999) is passed to Cashfree API (`order_amount: finalAmount`) and simultaneously recorded in the local PostgreSQL database (`PaymentOrder.amount: finalAmount`, `PaymentOrder.amountPaise: Math.round(finalAmount * 100)`).

```typescript
// Verified implementation in app/api/v1/payments/create-order/route.ts
const canonicalCode = normalizePlanCode(rawPlanCode);
const billingInterval = normalizeBillingInterval(rawBillingInterval);
const canonicalPrice = resolveCanonicalPrice(canonicalCode, billingInterval);

const baseAmount = priceRecord?.amountRupees ?? canonicalPrice.amountRupees;
let finalAmount = baseAmount;

// Safe coupon application
if (couponCode) {
  // apply validated discount
}

// Passed directly to Cashfree and PostgreSQL
const cfOrder = await provider.createOrder({
  amount: finalAmount,
  currency: "INR",
  // ...
});

const order = await prisma.paymentOrder.create({
  data: {
    amount: finalAmount,
    amountPaise: Math.round(finalAmount * 100),
    // ...
  }
});
```

---

## 2. Cashfree Hosted Checkout Integration Flow

1. Candidate selects plan and interval on `/pricing` or `app/page.tsx`.
2. Client invokes `POST /api/v1/payments/create-order`.
3. Server generates cryptographically secure `clientOrderId` (format: `CF_${Date.now()}_${randomBytes}`).
4. Cashfree official PG API (`https://api.cashfree.com/pg/orders`) returns `payment_session_id`.
5. Client redirects to `/checkout/${orderId}`, where Cashfree Web Checkout JS SDK renders UPI QR, NetBanking, and Card options in a secure frame.
6. Upon payment completion, Cashfree redirects candidate to `/checkout/status?order_id=${orderId}`.
7. Verification route checks status with Cashfree Server API.

---

## 3. Strict Amount Validation on Verification

When `POST /api/v1/payments/orders/[orderId]/verify` executes upon return:

```typescript
// Strict discrepancy guard
if (verification.status === "PAID" && Math.abs(verification.amount - order.amount) > 0.5) {
  return NextResponse.json({
    success: false,
    verified: false,
    status: "FAILED",
    error: {
      code: "AMOUNT_MISMATCH",
      message: `Paid amount (₹${verification.amount}) does not match order amount (₹${order.amount}).`
    }
  }, { status: 400 });
}
```

This ensures that even if a malicious user were able to alter network packets or attempt an underpaid transaction, the backend would refuse to activate the candidate's subscription.
