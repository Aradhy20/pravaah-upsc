import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const prisma = new PrismaClient();

test("Personal UPI Integration & Payment Account Verification", async (t) => {
  let testUser;
  let testOrder;
  let userCookie = "";
  let adminUser;
  let adminCookie = "";
  const testUtr = `UTR_${Date.now()}_ICICI`;

  await t.test("1. Setup test student user and admin with session cookies", async () => {
    const emailSuffix = Date.now();
    const studentEmail = `upi_student_${emailSuffix}@test.com`;
    const password = "Password123!";

    // Register student
    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: studentEmail,
        password,
        fullName: "Test UPI Aspirant",
      }),
    });
    assert.equal(regRes.status, 201);
    const cookies = regRes.headers.getSetCookie();
    userCookie = cookies.map((c) => c.split(";")[0]).join("; ");

    testUser = await prisma.user.findUnique({
      where: { email: studentEmail.toLowerCase() },
    });
    assert.ok(testUser);

    // Find existing admin
    adminUser = await prisma.user.findFirst({
      where: { role: { name: "ADMIN" } },
      include: { role: true },
    });
    assert.ok(adminUser, "Admin user must exist");

    // Login admin to obtain admin cookie
    const adminLoginRes = await fetch(`${BASE_URL}/api/v1/auth/switch-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    if (adminLoginRes.ok) {
      const adminCookies = adminLoginRes.headers.getSetCookie();
      adminCookie = adminCookies.map((c) => c.split(";")[0]).join("; ") || userCookie;
    } else {
      adminCookie = userCookie;
    }
  });

  await t.test("2. Admin payments API returns Aradhy Jain's personal receiving account info", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/payments`, {
      headers: {
        Cookie: adminCookie,
        "x-user-id": adminUser.id,
      },
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.receivingAccount);
    assert.equal(json.receivingAccount.upiId, "jainaradhy123@okicici");
    assert.equal(json.receivingAccount.payeeName, "Aradhy Jain");
    assert.equal(json.receivingAccount.bank, "ICICI Bank");
    assert.equal(json.receivingAccount.app, "Google Pay");
    assert.equal(json.receivingAccount.status, "ACTIVE");
  });

  await t.test("3. Dynamic order creation generates dynamic UPI QR with Aradhy Jain's handle", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        productType: "SUBSCRIPTION",
        productId: "ACHIEVER",
        billingInterval: "ANNUAL",
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    const orderData = json.data;
    assert.ok(orderData.orderId.startsWith("UPICHECKOUT_"));
    assert.equal(orderData.amount, 5499);
    assert.equal(orderData.currency, "INR");
    assert.equal(orderData.receivingUpiId, "jainaradhy123@okicici");
    assert.equal(orderData.payeeName, "Aradhy Jain");

    // Verify dynamic UPI intent contains exact amount, order reference, and payee name
    assert.ok(
      orderData.upiIntent.includes("pa=jainaradhy123%40okicici") ||
        orderData.upiIntent.includes("pa=jainaradhy123@okicici")
    );
    assert.ok(
      orderData.upiIntent.includes("pn=Aradhy%20Jain") ||
        orderData.upiIntent.includes("pn=Aradhy+Jain")
    );
    assert.ok(orderData.upiIntent.includes("am=5499.00"));
    assert.ok(orderData.upiIntent.includes(`tr=${orderData.orderId}`));

    testOrder = orderData;
  });

  await t.test("4. Student submits 12-digit UPI UTR -> transitions to UNDER_REVIEW", async () => {
    const res = await fetch(
      `${BASE_URL}/api/v1/payments/orders/${testOrder.orderId}/submit-utr`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: userCookie,
        },
        body: JSON.stringify({ utr: testUtr }),
      }
    );

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, "UNDER_REVIEW");
    assert.equal(json.data.utr, testUtr);

    // Check DB state
    const orderInDb = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: testOrder.orderId },
    });
    assert.equal(orderInDb.status, "UNDER_REVIEW");
    assert.equal(orderInDb.utr, testUtr);
  });

  await t.test("5. Status endpoint reflects UNDER_REVIEW state and payee information", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/orders/${testOrder.orderId}/status`, {
      headers: { Cookie: userCookie },
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, "UNDER_REVIEW");
    assert.equal(json.data.utr, testUtr);
    assert.equal(json.data.entitlementActive, false);
    assert.equal(json.data.receivingUpiId, "jainaradhy123@okicici");
    assert.equal(json.data.payeeName, "Aradhy Jain");
  });

  await t.test("6. Admin manual verification approves order and activates subscription", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        "x-user-id": adminUser.id,
      },
      body: JSON.stringify({
        action: "verify_utr",
        orderId: testOrder.orderId,
        utr: testUtr,
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.status, "PAID");

    // Verify database state: order is PAID, subscription is ACTIVE
    const verifiedOrder = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: testOrder.orderId },
      include: { subscription: true },
    });

    assert.equal(verifiedOrder.status, "PAID");
    assert.ok(verifiedOrder.subscriptionId);
    assert.equal(verifiedOrder.subscription?.status, "ACTIVE");

    // Verify PaymentRecord was created
    const record = await prisma.paymentRecord.findFirst({
      where: { providerTxId: testUtr },
    });
    assert.ok(record);
    assert.equal(record.status, "SUCCESS");
    assert.equal(record.amount, 5499);
  });

  await t.test("7. Idempotency test: Re-verifying a PAID order does not duplicate subscription", async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        "x-user-id": adminUser.id,
      },
      body: JSON.stringify({
        action: "verify_utr",
        orderId: testOrder.orderId,
        utr: testUtr,
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);

    // Verify user only has 1 active subscription
    const userSubs = await prisma.subscription.count({
      where: { userId: testUser.id, status: "ACTIVE" },
    });
    assert.equal(userSubs, 1);
  });

  await t.test("8. Anti-fraud test: Duplicate UTR on another order is rejected", async () => {
    // Create a second order
    const createRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        productType: "SUBSCRIPTION",
        productId: "ACHIEVER",
        billingInterval: "ANNUAL",
      }),
    });
    const createJson = await createRes.json();
    const secondOrderId = createJson.data.orderId;

    // Attempt to submit the same testUtr
    const res = await fetch(
      `${BASE_URL}/api/v1/payments/orders/${secondOrderId}/submit-utr`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: userCookie,
        },
        body: JSON.stringify({ utr: testUtr }),
      }
    );

    assert.equal(res.status, 409); // Conflict / Duplicate UTR rejected
    const json = await res.json();
    assert.equal(json.error.code, "DUPLICATE_UTR");

    // Clean up second order
    await prisma.paymentOrder.delete({ where: { clientOrderId: secondOrderId } });
  });

  await t.test("9. Admin Rejection flow properly marks order as FAILED", async () => {
    const createRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userCookie,
      },
      body: JSON.stringify({
        productType: "TEST_SERIES",
        productId: "mock_test_101",
      }),
    });
    const createJson = await createRes.json();
    const failOrderId = createJson.data.orderId;

    const res = await fetch(`${BASE_URL}/api/v1/admin/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
        "x-user-id": adminUser.id,
      },
      body: JSON.stringify({
        action: "reject_order",
        orderId: failOrderId,
        reason: "UTR not found in bank statement",
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.data.status, "FAILED");

    const orderInDb = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: failOrderId },
    });
    assert.equal(orderInDb.status, "FAILED");

    // Clean up fail order
    await prisma.paymentOrder.delete({ where: { clientOrderId: failOrderId } });
  });

  // Cleanup test user and associated orders
  await prisma.paymentOrder.deleteMany({ where: { userId: testUser.id } });
  await prisma.paymentRecord.deleteMany({ where: { userId: testUser.id } });
  await prisma.subscription.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.$disconnect();
});
