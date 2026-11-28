# Pravaah UPSC — Cashfree Payment Readiness Report
**Date:** 28 November 2026  
**Launch Beta Posture:** 🔒 CHECKOUT DISABLED (`ENABLE_PAYMENTS=false`)  
**Gateway Provider:** Cashfree Payments Pure Architecture  

---

## 1. Gateway Status & Launch Beta Decision

| Parameter | Configuration | Launch Beta Posture |
|---|---|---|
| **Feature Switch (`ENABLE_PAYMENTS`)** | Evaluates to `false` unless explicitly `"true"` | 🟢 SAFELY PAUSED (Zero unauthorized transactions) |
| **Merchant Environment** | Auto-detects `PROD` for `cfsk_ma_prod_` keys | 🟢 CALIBRATED FOR PRODUCTION |
| **Pricing Catalogue** | Plus ₹149/mo, Pro ₹299/mo, Elite ₹499/mo | 🟢 100% SYNCHRONIZED |
| **Webhook Endpoint** | `/api/webhooks/cashfree` | 🟢 RAW BODY SIGNATURE VERIFICATION |
| **Replay Protection** | 5-minute timestamp tolerance drift guard | 🟢 VERIFIED (HMAC-SHA256) |
| **Database Idempotency** | Atomic subscription activation via `tx.subscription.upsert` | 🟢 VERIFIED (Zero duplicate charges) |

---

## 2. Test Verification Evidence

All 10 integration and security scenarios were verified in `tests/cashfree_payment_gateway.test.mjs`:
1. Cashfree Configuration & Environment Resolution: **PASS**
2. Master Switch & Graceful Checkout Paused State: **PASS**
3. Webhook HMAC-SHA256 Signature Verification (Valid vs Forged): **PASS**
4. Replay Attack Protection (Timestamp Tolerance Drift Guard): **PASS**
5. Server-Side Price Integrity & DB Order Schema Validation: **PASS**
6. Atomic Subscription Activation & Payment Record Creation: **PASS**
7. Webhook & Activation Idempotency Guard (No Duplicate Subscriptions): **PASS**
8. Failed & Dropped Payment Handling (Entitlements Protected): **PASS**
9. Webhook Processing Parser & Event Routing: **PASS**
10. Subscription Duration Calculation (Annual vs Monthly): **PASS**
