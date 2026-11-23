import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

test("Payment Sandbox & Security Policy Audit", async (t) => {
  await t.test("1. Paid subscriptions cannot be granted via client request parameters", async () => {
    // Attempting to post to checkout or status with forged parameters
    const res = await fetch(`${BASE_URL}/api/v1/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planCode: "SCHOLAR", status: "SUCCESS" }),
    });
    assert.equal(res.status, 503);
  });

  await t.test("2. Unauthenticated access to /api/v1/admin/data-integrity is rejected (HTTP 401)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/data-integrity`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, "UNAUTHENTICATED");
  });

  await t.test("3. Unauthenticated access to /api/v1/admin/coverage is rejected (HTTP 401)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/coverage`);
    assert.equal(res.status, 401);
  });

  await t.test("4. Unauthenticated access to /api/v1/admin/questions is rejected (HTTP 401)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/questions`);
    assert.equal(res.status, 401);
  });

  await t.test("5. Unauthenticated access to /api/v1/admin/subscriptions is rejected (HTTP 401)", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/subscriptions`);
    assert.equal(res.status, 401);
  });

  await t.test("6. Pricing plans API returns all 4 plans with active features", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/plans`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 4);

    const freePlan = body.data.find((p) => p.code === "FREE");
    assert.ok(freePlan);
    assert.ok(freePlan.features.length >= 8, "Free plan must have at least 8 feature items");
  });
});
