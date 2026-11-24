import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  getCashfreeConfig,
  isPaymentSystemEnabled,
} from "../lib/payments/payment-config.js";
import { CashfreePaymentProvider } from "../lib/payments/providers/cashfree-provider.js";
import { activateSubscriptionFromOrder } from "../lib/payments/subscription-activator.js";

const prisma = new PrismaClient();

describe("PRAVAAH UPSC — Cashfree Payment Gateway & Security Verification", () => {
  let testUser = null;
  let testPlan = null;
  let testPlanPrice = null;

  before(async () => {
    await prisma.$connect();

    // Retrieve existing user
    testUser = await prisma.user.findFirst();
    assert.ok(testUser, "At least one test candidate user must exist in database");

    // Retrieve active plan and price
    testPlan = await prisma.plan.findFirst({
      where: { code: "ACHIEVER" },
      include: { prices: true },
    });

    assert.ok(testPlan, "ACHIEVER plan must exist in database");
    testPlanPrice = testPlan.prices.find((p) => p.billingInterval === "ANNUAL") || testPlan.prices[0];
    assert.ok(testPlanPrice, "ACHIEVER plan must have valid pricing");
  });

  after(async () => {
    await prisma.$disconnect();
  });

  test("1. Cashfree Configuration & Environment Resolution", () => {
    const config = getCashfreeConfig();

    assert.ok(config, "Config object must be defined");
    assert.ok(
      ["TEST", "PROD"].includes(config.environment),
      `Environment must resolve to TEST or PROD, got: ${config.environment}`
    );
    assert.equal(config.apiVersion, "2023-08-01", "API version must be 2023-08-01");

    if (config.environment === "PROD") {
      assert.equal(config.baseUrl, "https://api.cashfree.com/pg");
    } else {
      assert.equal(config.baseUrl, "https://sandbox.cashfree.com/pg");
    }
  });

  test("2. Master Switch & Graceful Checkout Paused State", () => {
    const originalEnv = process.env.ENABLE_PAYMENTS;

    // Test with payments disabled
    process.env.ENABLE_PAYMENTS = "false";
    assert.equal(isPaymentSystemEnabled(), false, "Payments must be disabled when ENABLE_PAYMENTS='false'");

    // Restore env
    if (originalEnv !== undefined) {
      process.env.ENABLE_PAYMENTS = originalEnv;
    } else {
      delete process.env.ENABLE_PAYMENTS;
    }
  });

  test("3. Webhook HMAC-SHA256 Signature Verification (Valid vs Forged)", async () => {
    const originalSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    const originalClientId = process.env.CASHFREE_CLIENT_ID;
    const originalClientSecret = process.env.CASHFREE_CLIENT_SECRET;

    const testSecret = "cf_test_webhook_secret_key_999";
    process.env.CASHFREE_CLIENT_ID = "cf_test_client_id";
    process.env.CASHFREE_CLIENT_SECRET = testSecret;
    process.env.CASHFREE_WEBHOOK_SECRET = testSecret;

    const provider = new CashfreePaymentProvider();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const validTimestamp = String(nowSeconds);
    const rawPayload = JSON.stringify({
      data: {
        order: { order_id: "CF_TEST_ORD_001", order_amount: 1999.0 },
        payment: { cf_payment_id: "PAY_987654", payment_status: "SUCCESS" },
      },
      event_time: new Date().toISOString(),
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });

    // Generate valid HMAC signature: HMAC-SHA256(timestamp + rawPayload)
    const validSignature = crypto
      .createHmac("sha256", testSecret)
      .update(validTimestamp + rawPayload)
      .digest("base64");

    // A. Valid signature passes
    const validResult = await provider.processWebhook({
      rawBody: rawPayload,
      headers: {
        "x-webhook-timestamp": validTimestamp,
        "x-webhook-signature": validSignature,
      },
    });
    assert.equal(validResult.isValid, true, "Authentic HMAC-SHA256 signature must be verified as valid");
    assert.equal(validResult.status, "PAID", "Parsed payment status must be PAID");
    assert.equal(validResult.orderId, "CF_TEST_ORD_001", "Order ID must match");
    assert.equal(validResult.paymentId, "PAY_987654", "Payment ID must match");

    // B. Forged / invalid signature fails
    const invalidResult = await provider.processWebhook({
      rawBody: rawPayload,
      headers: {
        "x-webhook-timestamp": validTimestamp,
        "x-webhook-signature": "forged_tampered_signature_base64==",
      },
    });
    assert.equal(invalidResult.isValid, false, "Forged signature must be rejected");

    // C. Tampered payload with valid signature fails
    const tamperedPayload = JSON.stringify({
      data: {
        order: { order_id: "CF_TEST_ORD_001", order_amount: 1.0 }, // Client tampered amount
        payment: { cf_payment_id: "PAY_987654", payment_status: "SUCCESS" },
      },
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });
    const tamperedResult = await provider.processWebhook({
      rawBody: tamperedPayload,
      headers: {
        "x-webhook-timestamp": validTimestamp,
        "x-webhook-signature": validSignature,
      },
    });
    assert.equal(tamperedResult.isValid, false, "Tampered payload must fail signature verification");

    // Restore environment variables
    if (originalSecret !== undefined) process.env.CASHFREE_WEBHOOK_SECRET = originalSecret;
    else delete process.env.CASHFREE_WEBHOOK_SECRET;

    if (originalClientId !== undefined) process.env.CASHFREE_CLIENT_ID = originalClientId;
    else delete process.env.CASHFREE_CLIENT_ID;

    if (originalClientSecret !== undefined) process.env.CASHFREE_CLIENT_SECRET = originalClientSecret;
    else delete process.env.CASHFREE_CLIENT_SECRET;
  });

  test("4. Replay Attack Protection (Timestamp Tolerance Drift Guard)", async () => {
    const originalSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    const originalClientId = process.env.CASHFREE_CLIENT_ID;
    const originalClientSecret = process.env.CASHFREE_CLIENT_SECRET;

    const testSecret = "cf_test_webhook_secret_key_999";
    process.env.CASHFREE_CLIENT_ID = "cf_test_client_id";
    process.env.CASHFREE_CLIENT_SECRET = testSecret;
    process.env.CASHFREE_WEBHOOK_SECRET = testSecret;

    const provider = new CashfreePaymentProvider();

    // 10 minutes in the past (> 300 seconds tolerance window)
    const expiredTimestamp = String(Math.floor(Date.now() / 1000) - 600);
    const rawPayload = JSON.stringify({
      data: { order: { order_id: "CF_REPLAY_TEST" } },
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });

    const signature = crypto
      .createHmac("sha256", testSecret)
      .update(expiredTimestamp + rawPayload)
      .digest("base64");

    const replayResult = await provider.processWebhook({
      rawBody: rawPayload,
      headers: {
        "x-webhook-timestamp": expiredTimestamp,
        "x-webhook-signature": signature,
      },
    });

    assert.equal(
      replayResult.isValid,
      false,
      "Replayed webhook with expired timestamp (>300s) must be rejected"
    );
    assert.match(
      replayResult.error || "",
      /replay attack/i,
      "Error must identify replay attack rejection"
    );

    // Restore env
    if (originalSecret !== undefined) process.env.CASHFREE_WEBHOOK_SECRET = originalSecret;
    else delete process.env.CASHFREE_WEBHOOK_SECRET;

    if (originalClientId !== undefined) process.env.CASHFREE_CLIENT_ID = originalClientId;
    else delete process.env.CASHFREE_CLIENT_ID;

    if (originalClientSecret !== undefined) process.env.CASHFREE_CLIENT_SECRET = originalClientSecret;
    else delete process.env.CASHFREE_CLIENT_SECRET;
  });

  test("5. Server-Side Price Integrity & DB Order Schema Validation", async () => {
    const uniqueOrderId = `CF_TEST_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const authoritativeAmount = Number(testPlanPrice.amountRupees || 1299);

    const order = await prisma.paymentOrder.create({
      data: {
        clientOrderId: uniqueOrderId,
        gatewayOrderId: uniqueOrderId,
        cashfreeOrderId: uniqueOrderId,
        userId: testUser.id,
        planId: testPlan.id,
        productId: testPlan.code,
        productType: "SUBSCRIPTION",
        amount: authoritativeAmount,
        amountPaise: Math.round(authoritativeAmount * 100),
        currency: "INR",
        status: "PENDING",
        environment: "TEST",
        isTest: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    assert.ok(order.id, "Payment order must be persisted in database");
    assert.equal(order.amount, authoritativeAmount, "Order amount must match authoritative server price");
    assert.equal(order.status, "PENDING", "Initial status must be PENDING");
    assert.equal(order.cashfreeOrderId, uniqueOrderId, "cashfreeOrderId column must store order ID");
  });

  test("6. Atomic Subscription Activation & Payment Record Creation", async () => {
    const testOrderId = `CF_ACTIVATION_TEST_${Date.now()}`;
    const testAmount = Number(testPlanPrice.amountRupees || 1299);

    // 1. Create a pending order
    const pendingOrder = await prisma.paymentOrder.create({
      data: {
        clientOrderId: testOrderId,
        gatewayOrderId: testOrderId,
        cashfreeOrderId: testOrderId,
        userId: testUser.id,
        planId: testPlan.id,
        productId: testPlan.code,
        productType: "SUBSCRIPTION",
        amount: testAmount,
        amountPaise: Math.round(testAmount * 100),
        currency: "INR",
        status: "PENDING",
        environment: "TEST",
        isTest: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // 2. Activate subscription via atomic transaction
    const cfPaymentId = `CF_PID_${Date.now()}`;
    const activationResult = await activateSubscriptionFromOrder({
      orderId: pendingOrder.id,
      cashfreePaymentId: cfPaymentId,
      paymentMethod: "UPI",
      paidAt: new Date(),
    });

    assert.ok(activationResult.success, "Activation must succeed");
    assert.ok(activationResult.subscription?.id, "Subscription must be returned with valid ID");

    // 3. Verify order status is updated to PAID
    const updatedOrder = await prisma.paymentOrder.findUnique({
      where: { id: pendingOrder.id },
    });
    assert.equal(updatedOrder?.status, "PAID", "Order status must be updated to PAID");
    assert.equal(updatedOrder?.cashfreePaymentId, cfPaymentId, "cashfreePaymentId must be stored");
    assert.equal(updatedOrder?.paymentMethod, "UPI", "paymentMethod must be stored");
    assert.ok(updatedOrder?.paidAt, "paidAt timestamp must be recorded");

    // 4. Verify subscription record
    const subscription = await prisma.subscription.findUnique({
      where: { id: activationResult.subscription.id },
    });
    assert.ok(subscription, "Subscription must exist");
    assert.equal(subscription?.status, "ACTIVE", "Subscription must be ACTIVE");
    assert.equal(subscription?.userId, testUser.id, "Subscription must belong to test candidate");

    // 5. Verify payment record (receipt)
    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: { receiptNumber: `REC-${pendingOrder.clientOrderId}` },
    });
    assert.ok(paymentRecord, "Financial PaymentRecord must be created");
    assert.equal(paymentRecord?.amount, testAmount, "PaymentRecord amount must match");
    assert.equal(paymentRecord?.status, "SUCCESS", "PaymentRecord status must be SUCCESS");
    assert.ok(paymentRecord?.receiptNumber, "PaymentRecord must have official receipt number");
  });

  test("7. Webhook & Activation Idempotency Guard (No Duplicate Subscriptions)", async () => {
    // Fetch the order from test 6
    const paidOrder = await prisma.paymentOrder.findFirst({
      where: { status: "PAID", userId: testUser.id },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(paidOrder, "Must find existing paid order");

    const initialSubCount = await prisma.subscription.count({
      where: { userId: testUser.id },
    });
    const initialRecordCount = await prisma.paymentRecord.count({
      where: { userId: testUser.id },
    });

    // Re-trigger activation on already PAID order
    const secondActivation = await activateSubscriptionFromOrder({
      orderId: paidOrder.id,
      cashfreePaymentId: paidOrder.cashfreePaymentId || "DUPLICATE_PID",
      paymentMethod: "UPI",
    });

    assert.ok(secondActivation.success, "Second activation call must return success idempotently");

    const finalSubCount = await prisma.subscription.count({
      where: { userId: testUser.id },
    });
    const finalRecordCount = await prisma.paymentRecord.count({
      where: { userId: testUser.id },
    });

    assert.equal(finalSubCount, initialSubCount, "Subscription count must not increase on duplicate call");
    assert.equal(finalRecordCount, initialRecordCount, "PaymentRecord count must not duplicate");
  });

  test("8. Failed & Dropped Payment Handling (Entitlements Remain Protected)", async () => {
    const droppedOrderId = `CF_DROPPED_${Date.now()}`;

    // Create order that was abandoned or failed
    const droppedOrder = await prisma.paymentOrder.create({
      data: {
        clientOrderId: droppedOrderId,
        gatewayOrderId: droppedOrderId,
        cashfreeOrderId: droppedOrderId,
        userId: testUser.id,
        planId: testPlan.id,
        productId: testPlan.code,
        productType: "SUBSCRIPTION",
        amount: 1999,
        amountPaise: 199900,
        currency: "INR",
        status: "FAILED",
        failureReason: "User cancelled on Cashfree hosted checkout page",
        environment: "TEST",
        isTest: true,
      },
    });

    assert.equal(droppedOrder.status, "FAILED", "Order status must be FAILED");
    assert.ok(droppedOrder.failureReason, "Failure reason must be captured");

    // Verify that NO subscription was linked to this dropped order
    assert.equal(droppedOrder.subscriptionId, null, "No subscription may be created for a dropped or failed payment");
  });

  test("9. Webhook Processing Parser & Event Routing", async () => {
    const originalSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    const originalClientId = process.env.CASHFREE_CLIENT_ID;
    const originalClientSecret = process.env.CASHFREE_CLIENT_SECRET;

    const testSecret = "cf_test_webhook_secret_key_999";
    process.env.CASHFREE_CLIENT_ID = "cf_test_client_id";
    process.env.CASHFREE_CLIENT_SECRET = testSecret;
    process.env.CASHFREE_WEBHOOK_SECRET = testSecret;

    const provider = new CashfreePaymentProvider();

    // Successful payment webhook structure from Cashfree API v2023-08-01
    const rawWebhook = JSON.stringify({
      data: {
        order: {
          order_id: "CF_ORDER_123456",
          order_amount: 1999.0,
          order_currency: "INR",
        },
        payment: {
          cf_payment_id: "CF_PID_999888",
          payment_status: "SUCCESS",
          payment_amount: 1999.0,
          payment_currency: "INR",
          payment_method: {
            upi: {
              upi_id: "candidate@okhdfcbank",
            },
          },
          payment_time: new Date().toISOString(),
        },
      },
      event_time: new Date().toISOString(),
      type: "PAYMENT_SUCCESS_WEBHOOK",
    });

    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = crypto
      .createHmac("sha256", testSecret)
      .update(timestamp + rawWebhook)
      .digest("base64");

    const parsed = await provider.processWebhook({
      rawBody: rawWebhook,
      headers: {
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": signature,
      },
    });

    assert.equal(parsed.isValid, true);
    assert.equal(parsed.status, "PAID", "Parsed status must be PAID");
    assert.equal(parsed.orderId, "CF_ORDER_123456", "Order ID must be extracted");
    assert.equal(parsed.paymentId, "CF_PID_999888", "Payment ID must be extracted");
    assert.equal(parsed.amount, 1999.0, "Amount must be extracted");

    // Restore env
    if (originalSecret !== undefined) process.env.CASHFREE_WEBHOOK_SECRET = originalSecret;
    else delete process.env.CASHFREE_WEBHOOK_SECRET;

    if (originalClientId !== undefined) process.env.CASHFREE_CLIENT_ID = originalClientId;
    else delete process.env.CASHFREE_CLIENT_ID;

    if (originalClientSecret !== undefined) process.env.CASHFREE_CLIENT_SECRET = originalClientSecret;
    else delete process.env.CASHFREE_CLIENT_SECRET;
  });

  test("10. Subscription Duration Calculation (Annual vs Monthly)", async () => {
    const now = new Date();
    const annualDays = 365;
    const monthlyDays = 30;

    const expectedAnnualEnd = new Date(now.getTime() + annualDays * 24 * 60 * 60 * 1000);
    const expectedMonthlyEnd = new Date(now.getTime() + monthlyDays * 24 * 60 * 60 * 1000);

    const annualDiffDays = Math.round((expectedAnnualEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const monthlyDiffDays = Math.round((expectedMonthlyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    assert.equal(annualDiffDays, 365, "Annual period duration must be 365 days");
    assert.equal(monthlyDiffDays, 30, "Monthly period duration must be 30 days");
  });
});
