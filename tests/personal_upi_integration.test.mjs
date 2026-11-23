import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

test("Payment Gateway Cleanup & Cashfree-Ready Architecture Verification", async (t) => {
  await t.test("1. POST /api/v1/payments/create-order is safely disabled (HTTP 503)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: "ACHIEVER",
        billingInterval: "ANNUAL",
      }),
    });
    assert.equal(res.status, 503);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "PAYMENTS_DISABLED");
  });

  await t.test("2. POST /api/v1/billing/checkout is safely disabled (HTTP 503)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planCode: "ACHIEVER",
        billingInterval: "ANNUAL",
      }),
    });
    assert.equal(res.status, 503);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "PAYMENTS_DISABLED");
  });

  await t.test("3. Dev/Browser Webhook is disabled and cannot activate subscriptions (HTTP 503)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/billing/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "payment.succeeded",
        orderId: "fake_order_123",
      }),
    });
    assert.equal(res.status, 503);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "WEBHOOK_DISABLED");
  });

  await t.test("4. UPI Gateway Webhook is decommissioned (HTTP 503)", async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "order.paid" }),
    });
    assert.equal(res.status, 503);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "GATEWAY_DECOMMISSIONED");
  });

  await t.test("5. Manual UTR submission endpoint is discontinued (HTTP 410)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/orders/order_123/submit-utr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utr: "123456789012" }),
    });
    assert.equal(res.status, 410);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "FEATURE_DISCONTINUED");
  });

  await t.test("6. Unauthenticated requests to /api/v1/admin/payments are rejected with 401", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/payments`);
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.equal(json.error.code, "UNAUTHENTICATED");
  });

  await t.test("7. Historical transactions and database models remain intact", async () => {
    const planCount = await prisma.plan.count();
    assert.ok(planCount >= 4, "All 4 plans must remain in database");

    const orderCount = await prisma.paymentOrder.count();
    assert.ok(typeof orderCount === "number", "PaymentOrder table must be preserved");

    const recordCount = await prisma.paymentRecord.count();
    assert.ok(typeof recordCount === "number", "PaymentRecord table must be preserved");
  });

  await t.test("8. Free plan entitlements remain 100% active and operational", async () => {
    const freePlan = await prisma.plan.findUnique({
      where: { code: "FREE" },
      include: { features: true },
    });
    assert.ok(freePlan, "Free plan must exist");
    assert.equal(freePlan.tier, 0);

    const pyqBrowse = freePlan.features.find((f) => f.featureCode === "PYQ_BROWSE");
    assert.ok(pyqBrowse, "PYQ_BROWSE feature must be defined");
    assert.equal(pyqBrowse.isIncluded, true, "Free plan must include PYQ browsing");
  });
});
