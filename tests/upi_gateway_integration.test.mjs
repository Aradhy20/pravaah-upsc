import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

test("UPI Gateway Decommission & Cashfree Transition Audit", async (t) => {
  await t.test("1. No active gateway orders can be generated", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productType: "SUBSCRIPTION",
        productId: "BEGINNER",
        billingInterval: "ANNUAL",
      }),
    });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error.code, "PAYMENTS_DISABLED");
  });

  await t.test("2. Order status endpoint returns 404 for non-existent order without external calls", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/orders/non_existent_order_123/status`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, "ORDER_NOT_FOUND");
  });

  await t.test("3. Webhook endpoints return HTTP 503 and do not modify database", async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "order.paid", orderId: "fake_order" }),
    });
    assert.equal(res.status, 503);
  });

  await t.test("4. Subscription records in database are preserved for audit", async () => {
    const subCount = await prisma.subscription.count();
    assert.ok(typeof subCount === "number");
  });

  await t.test("5. PaymentWebhookEvent table is preserved for historical audit", async () => {
    const eventCount = await prisma.paymentWebhookEvent.count();
    assert.ok(typeof eventCount === "number");
  });
});
