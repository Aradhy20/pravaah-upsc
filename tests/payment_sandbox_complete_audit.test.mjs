import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.UPI_GATEWAY_WEBHOOK_SECRET || 'whsec_pravaah_upi_sandbox_2026';
const prisma = new PrismaClient();

async function createAuditTestUser(suffix = Date.now()) {
  const email = `audit_user_${suffix}@test.com`;
  const password = 'AuditPassword123!';
  const fullName = `Payment Auditor ${suffix}`;

  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  const cookies = regRes.headers.getSetCookie();
  const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  return { user, cookieHeader, email };
}

function generateSignedWebhook(payload, secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000)) {
  const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return {
    header: `t=${timestamp},v1=${hmac}`,
    timestamp,
    rawBody,
  };
}

test('Comprehensive Payment Sandbox Audit: All 3 Paid Plans & Lifecycle Verification', async (t) => {
  const { user, cookieHeader } = await createAuditTestUser();

  // 1. Audit Unauthenticated GET /api/v1/user/subscription does not throw HTTP 500
  await t.test('1. Unauthenticated subscription query returns 200 Free tier', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/user/subscription`);
    assert.strictEqual(res.status, 200, 'Unauthenticated query must return HTTP 200 OK');
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.isPaid, false);
    assert.strictEqual(json.data.tier, 0);
    assert.strictEqual(json.data.planCode, 'FREE');
    assert.strictEqual(json.data.subscription, null);
  });

  // 2. Test Plan 1: Syllabus Sprint (BEGINNER) — ₹2,999
  let beginnerOrderId = '';
  await t.test('2. Plan 1: Syllabus Sprint (₹2,999) order creation & pending ledger verification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({
        productType: 'SUBSCRIPTION',
        productId: 'BEGINNER',
        billingInterval: 'ANNUAL',
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.amount, 2999, 'Amount must be exactly ₹2,999');
    assert.strictEqual(json.data.currency, 'INR');
    assert.strictEqual(json.data.baseAmount, 2541.53, 'Base amount before 18% GST');
    assert.strictEqual(json.data.gstAmount, 457.47, '18% GST component');
    beginnerOrderId = json.data.orderId;

    // Verify database record in PaymentOrder
    const orderInDb = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: beginnerOrderId },
    });
    assert.ok(orderInDb);
    assert.strictEqual(orderInDb.status, 'PENDING');
    assert.strictEqual(orderInDb.amount, 2999);
    assert.strictEqual(orderInDb.userId, user.id);

    // Verify corresponding PENDING record in PaymentRecord financial ledger
    const paymentInDb = await prisma.paymentRecord.findFirst({
      where: { providerTxId: beginnerOrderId },
    });
    assert.ok(paymentInDb, 'PaymentRecord must be recorded on order creation');
    assert.strictEqual(paymentInDb.status, 'PENDING');
    assert.strictEqual(paymentInDb.amount, 2999);
    assert.strictEqual(paymentInDb.userId, user.id);

    // Verify user still has NO active paid subscription while in PENDING state
    const subCheck = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });
    assert.strictEqual(subCheck, null, 'Must NOT activate subscription on PENDING order');
  });

  // 3. Complete verified webhook payment for Syllabus Sprint
  await t.test('3. Verified webhook activation for Syllabus Sprint (₹2,999)', async () => {
    const eventId = `evt_audit_beg_${Date.now()}`;
    const payload = {
      event_id: eventId,
      event_sequence: 1,
      occurred_at: new Date().toISOString(),
      event: 'order.paid',
      data: {
        client_order_id: beginnerOrderId,
        amount: '2999.00',
        currency: 'INR',
        status: 'paid',
        utr: 'UTR_BEG_AUDIT_2999',
      },
    };

    const { header, rawBody } = generateSignedWebhook(payload);
    const whRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': header,
        'X-Event-Id': eventId,
        'X-Event': 'order.paid',
      },
      body: rawBody,
    });

    assert.strictEqual(whRes.status, 200);
    const whJson = await whRes.json();
    assert.strictEqual(whJson.success, true);

    // Verify DB state
    const orderPaid = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: beginnerOrderId },
    });
    assert.strictEqual(orderPaid.status, 'PAID');
    assert.strictEqual(orderPaid.utr, 'UTR_BEG_AUDIT_2999');

    // Verify PaymentRecord updated to SUCCESS
    const paymentPaid = await prisma.paymentRecord.findFirst({
      where: { providerTxId: beginnerOrderId },
    });
    assert.strictEqual(paymentPaid.status, 'SUCCESS');

    // Verify Subscription is ACTIVE with Tier 1
    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
    });
    assert.ok(sub);
    assert.strictEqual(sub.plan.code, 'BEGINNER');
    assert.strictEqual(sub.plan.tier, 1);
  });

  // 4. Test Plan 2: Prelims Pro (ACHIEVER) — ₹5,499 (Upgrade & Renewal extension)
  let achieverOrderId = '';
  await t.test('4. Plan 2: Prelims Pro (₹5,499) upgrade & period extension verification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({
        productType: 'SUBSCRIPTION',
        productId: 'ACHIEVER',
        billingInterval: 'ANNUAL',
        forceNew: true,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.amount, 5499, 'Amount must be exactly ₹5,499');
    assert.strictEqual(json.data.baseAmount, 4660.17);
    assert.strictEqual(json.data.gstAmount, 838.83);
    achieverOrderId = json.data.orderId;

    // Simulate verified webhook for Prelims Pro
    const eventId = `evt_audit_ach_${Date.now()}`;
    const payload = {
      event_id: eventId,
      event: 'order.paid',
      data: {
        client_order_id: achieverOrderId,
        amount: '5499.00',
        currency: 'INR',
        status: 'paid',
        utr: 'UTR_ACH_AUDIT_5499',
      },
    };
    const { header, rawBody } = generateSignedWebhook(payload);

    const whRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': header,
        'X-Event-Id': eventId,
        'X-Event': 'order.paid',
      },
      body: rawBody,
    });
    assert.strictEqual(whRes.status, 200);

    // Verify Subscription upgraded to Tier 2 (Prelims Pro)
    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
    });
    assert.ok(sub);
    assert.strictEqual(sub.plan.code, 'ACHIEVER');
    assert.strictEqual(sub.plan.tier, 2);

    // Verify GET /api/v1/user/subscription returns Tier 2
    const subApiRes = await fetch(`${BASE_URL}/api/v1/user/subscription`, {
      headers: { Cookie: cookieHeader },
    });
    assert.strictEqual(subApiRes.status, 200);
    const subApiJson = await subApiRes.json();
    assert.strictEqual(subApiJson.data.isPaid, true);
    assert.strictEqual(subApiJson.data.tier, 2);
    assert.strictEqual(subApiJson.data.planCode, 'ACHIEVER');
  });

  // 5. Test Plan 3: Ranker Suite (SCHOLAR) — ₹8,999 (Top Tier)
  let scholarOrderId = '';
  await t.test('5. Plan 3: Ranker Suite (₹8,999) upgrade verification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({
        productType: 'SUBSCRIPTION',
        productId: 'SCHOLAR',
        billingInterval: 'ANNUAL',
        forceNew: true,
      }),
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.amount, 8999, 'Amount must be exactly ₹8,999');
    assert.strictEqual(json.data.baseAmount, 7626.27);
    assert.strictEqual(json.data.gstAmount, 1372.73);
    scholarOrderId = json.data.orderId;

    const eventId = `evt_audit_sch_${Date.now()}`;
    const payload = {
      event_id: eventId,
      event: 'order.paid',
      data: {
        client_order_id: scholarOrderId,
        amount: '8999.00',
        currency: 'INR',
        status: 'paid',
        utr: 'UTR_SCH_AUDIT_8999',
      },
    };
    const { header, rawBody } = generateSignedWebhook(payload);

    await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': header,
        'X-Event-Id': eventId,
        'X-Event': 'order.paid',
      },
      body: rawBody,
    });

    // Verify Subscription is now Ranker Suite (Tier 3)
    const sub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
    });
    assert.strictEqual(sub.plan.code, 'SCHOLAR');
    assert.strictEqual(sub.plan.tier, 3);
  });

  // 6. Test Refund Lifecycle: Revocation of Entitlement
  await t.test('6. Refund webhook cancels subscription and sets status to REFUNDED', async () => {
    const refundEventId = `evt_refund_${Date.now()}`;
    const refundPayload = {
      event_id: refundEventId,
      event: 'order.refunded',
      data: {
        client_order_id: scholarOrderId,
        amount: '8999.00',
        reason: 'Customer initiated 7-day money-back guarantee',
      },
    };
    const { header, rawBody } = generateSignedWebhook(refundPayload);

    const refRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': header,
        'X-Event-Id': refundEventId,
        'X-Event': 'order.refunded',
      },
      body: rawBody,
    });
    assert.strictEqual(refRes.status, 200);

    // Verify order and payment are REFUNDED in DB
    const refOrder = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: scholarOrderId },
    });
    assert.strictEqual(refOrder.status, 'REFUNDED');

    const refPayment = await prisma.paymentRecord.findFirst({
      where: { providerTxId: scholarOrderId },
    });
    assert.strictEqual(refPayment.status, 'REFUNDED');

    // Verify RefundRecord exists
    const refundRecord = await prisma.refundRecord.findFirst({
      where: { paymentRecordId: refPayment.id },
    });
    assert.ok(refundRecord, 'RefundRecord must be created');
    assert.strictEqual(refundRecord.amount, 8999);

    // Verify Subscription is CANCELED
    const activeSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });
    assert.strictEqual(activeSub, null, 'Active subscription must be cancelled after refund');

    // Verify GET /api/v1/user/subscription reverts to Free Tier 0
    const subRes = await fetch(`${BASE_URL}/api/v1/user/subscription`, {
      headers: { Cookie: cookieHeader },
    });
    const subJson = await subRes.json();
    assert.strictEqual(subJson.data.isPaid, false);
    assert.strictEqual(subJson.data.tier, 0);
  });

  // 7. Test Failure Lifecycle: Decline does not activate subscription
  await t.test('7. Failed order does not grant access and marks records as FAILED', async () => {
    const failRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({
        productType: 'SUBSCRIPTION',
        productId: 'ACHIEVER',
        billingInterval: 'ANNUAL',
        forceNew: true,
      }),
    });
    const failJson = await failRes.json();
    const failOrderId = failJson.data.orderId;

    // Send order.failed webhook
    const failEventId = `evt_fail_${Date.now()}`;
    const failPayload = {
      event_id: failEventId,
      event: 'order.failed',
      data: {
        client_order_id: failOrderId,
        reason: 'Bank server timeout / insufficient funds',
      },
    };
    const { header, rawBody } = generateSignedWebhook(failPayload);

    await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': header,
        'X-Event-Id': failEventId,
        'X-Event': 'order.failed',
      },
      body: rawBody,
    });

    const failedOrder = await prisma.paymentOrder.findUnique({
      where: { clientOrderId: failOrderId },
    });
    assert.strictEqual(failedOrder.status, 'FAILED');

    const failedPayment = await prisma.paymentRecord.findFirst({
      where: { providerTxId: failOrderId },
    });
    assert.strictEqual(failedPayment.status, 'FAILED');

    // Check subscription still inactive
    const noSub = await prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });
    assert.strictEqual(noSub, null);
  });
});
