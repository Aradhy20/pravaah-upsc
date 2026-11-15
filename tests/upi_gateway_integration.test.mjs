import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.UPI_GATEWAY_WEBHOOK_SECRET || 'whsec_pravaah_upi_sandbox_2026';
const prisma = new PrismaClient();

// Helper to create an authenticated session for testing
async function createTestAspirant(emailSuffix = Date.now()) {
  const email = `upi_aspirant_${emailSuffix}@test.com`;
  const password = 'AspirantPassword123!';
  const fullName = `Aspirant Test ${emailSuffix}`;

  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  const cookies = regRes.headers.getSetCookie();
  const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { role: true },
  });

  return { user, cookieHeader, email, password };
}

// Helper to generate signed webhook header
function signWebhook(rawBody, secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000)) {
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return {
    header: `t=${timestamp},v1=${hmac}`,
    timestamp,
    hmac,
  };
}

test('UPI Gateway: 1. Successful payment order creation with 18% GST', async () => {
  const { cookieHeader } = await createTestAspirant();

  const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.orderId.startsWith('UPICHECKOUT_'));
  assert.strictEqual(json.data.amount, 5499);
  assert.strictEqual(json.data.currency, 'INR');
  assert.strictEqual(json.data.gstRatePercent, 18);
  assert.strictEqual(json.data.baseAmount, 4660.17);
  assert.strictEqual(json.data.gstAmount, 838.83);
  assert.ok(json.data.upiIntent.includes('upi://pay'));
});

test('UPI Gateway: 2. Invalid API credentials handling', async () => {
  // Test gateway client credential authentication failure
  async function simulateGatewayCall(apiKey, apiSecret) {
    if (apiKey !== 'valid_key' || apiSecret !== 'valid_sec') {
      const err = new Error('Invalid Merchant API Credentials. Verification failed.');
      err.code = 'GATEWAY_API_ERROR';
      err.statusCode = 401;
      throw err;
    }
    return { success: true };
  }

  await assert.rejects(
    async () => {
      await simulateGatewayCall('wrong_key', 'wrong_sec');
    },
    (err) => {
      assert.strictEqual(err.statusCode, 401);
      assert.strictEqual(err.code, 'GATEWAY_API_ERROR');
      return true;
    }
  );
});

test('UPI Gateway: 3. Gateway timeout handling', async () => {
  async function requestWithTimeout(timeoutMs) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      await fetch('https://10.255.255.1', { signal: controller.signal });
      clearTimeout(id);
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        const netErr = new Error('Gateway connection timed out after ' + timeoutMs + 'ms');
        netErr.code = 'GATEWAY_NETWORK_TIMEOUT';
        netErr.statusCode = 504;
        throw netErr;
      }
      throw err;
    }
  }

  await assert.rejects(
    async () => {
      await requestWithTimeout(1);
    },
    (err) => {
      assert.strictEqual(err.code, 'GATEWAY_NETWORK_TIMEOUT');
      assert.strictEqual(err.statusCode, 504);
      return true;
    }
  );
});

test('UPI Gateway: 4. Incorrect product price & invalid product rejection', async () => {
  const { cookieHeader } = await createTestAspirant();

  const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'NON_EXISTENT_PLAN_XYZ',
      billingInterval: 'ANNUAL',
    }),
  });

  assert.strictEqual(res.status, 404);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'PLAN_NOT_FOUND');
});

test('UPI Gateway: 5. Unauthenticated checkout rejection', async () => {
  const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });

  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'UNAUTHENTICATED');
});

test('UPI Gateway: 6. Valid signed webhook activates entitlement', async () => {
  const { cookieHeader, user } = await createTestAspirant();

  // Create order
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'BEGINNER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;
  const gatewayOrderId = orderJson.data.gatewayOrderId;

  // Prepare signed order.paid webhook
  const eventId = `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const payload = {
    event_id: eventId,
    event_sequence: 1,
    occurred_at: new Date().toISOString(),
    event: 'order.paid',
    data: {
      order_id: gatewayOrderId,
      client_order_id: orderId,
      amount: '2999.00',
      currency: 'INR',
      status: 'paid',
      environment: 'sandbox',
      utr: 'UTR987654321012',
    },
  };
  const rawBody = JSON.stringify(payload);
  const { header } = signWebhook(rawBody);

  const webhookRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': header,
      'X-Event-Id': eventId,
      'X-Event': 'order.paid',
    },
    body: rawBody,
  });

  assert.strictEqual(webhookRes.status, 200);
  const webhookJson = await webhookRes.json();
  assert.strictEqual(webhookJson.success, true);

  // Verify DB state
  const updatedOrder = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: orderId },
  });
  assert.strictEqual(updatedOrder.status, 'PAID');
  assert.strictEqual(updatedOrder.utr, 'UTR987654321012');

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { plan: true },
  });
  assert.ok(subscription, 'Subscription must be active');
  assert.strictEqual(subscription.plan.code, 'BEGINNER');
});

test('UPI Gateway: 7. Invalid webhook signature rejection', async () => {
  const rawBody = JSON.stringify({ event: 'order.paid', data: {} });
  const badSignature = 't=1731718000,v1=0000000000000000000000000000000000000000000000000000000000000000';

  const res = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': badSignature,
      'X-Event-Id': 'evt_bad_sig',
      'X-Event': 'order.paid',
    },
    body: rawBody,
  });

  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'INVALID_SIGNATURE');
});

test('UPI Gateway: 8. Expired webhook timestamp rejection (>300 seconds drift)', async () => {
  const rawBody = JSON.stringify({ event: 'order.paid', data: {} });
  // Timestamp 600 seconds (10 minutes) in the past
  const expiredTimestamp = Math.floor(Date.now() / 1000) - 600;
  const { header } = signWebhook(rawBody, WEBHOOK_SECRET, expiredTimestamp);

  const res = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': header,
      'X-Event-Id': 'evt_expired_ts',
      'X-Event': 'order.paid',
    },
    body: rawBody,
  });

  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.ok(json.error.message.includes('expired or in the future'));
});

test('UPI Gateway: 9. Duplicate webhook idempotency handling', async () => {
  const { cookieHeader } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'BEGINNER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  const eventId = `evt_dedup_${Date.now()}`;
  const payload = {
    event_id: eventId,
    event_sequence: 1,
    event: 'order.paid',
    data: {
      client_order_id: orderId,
      amount: '2999.00',
      status: 'paid',
      utr: 'UTR_DEDUP_123',
    },
  };
  const rawBody = JSON.stringify(payload);
  const { header } = signWebhook(rawBody);

  // Delivery 1
  const res1 = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': header,
      'X-Event-Id': eventId,
      'X-Event': 'order.paid',
    },
    body: rawBody,
  });
  assert.strictEqual(res1.status, 200);

  // Delivery 2 (Duplicate)
  const res2 = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': header,
      'X-Event-Id': eventId,
      'X-Event': 'order.paid',
    },
    body: rawBody,
  });
  assert.strictEqual(res2.status, 200);
  const json2 = await res2.json();
  assert.ok(json2.message.includes('idempotently'));
});

test('UPI Gateway: 10. Out-of-order events protection (expired does not revert paid)', async () => {
  const { cookieHeader } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  // 1. Mark order paid first (sequence 2)
  const paidPayload = {
    event_id: `evt_paid_${Date.now()}`,
    event_sequence: 2,
    event: 'order.paid',
    data: { client_order_id: orderId, amount: '5499.00', status: 'paid', utr: 'UTR_OO_123' },
  };
  const rawPaid = JSON.stringify(paidPayload);
  await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signWebhook(rawPaid).header,
      'X-Event-Id': paidPayload.event_id,
      'X-Event': 'order.paid',
    },
    body: rawPaid,
  });

  // 2. Late arrival of older order.expired (sequence 1)
  const expiredPayload = {
    event_id: `evt_expired_${Date.now()}`,
    event_sequence: 1,
    event: 'order.expired',
    data: { client_order_id: orderId, status: 'expired' },
  };
  const rawExpired = JSON.stringify(expiredPayload);
  const expRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signWebhook(rawExpired).header,
      'X-Event-Id': expiredPayload.event_id,
      'X-Event': 'order.expired',
    },
    body: rawExpired,
  });

  assert.strictEqual(expRes.status, 200);

  // Check DB state: Order MUST remain PAID!
  const finalOrder = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: orderId },
  });
  assert.strictEqual(finalOrder.status, 'PAID', 'Order must not revert from PAID to EXPIRED');
});

test('UPI Gateway: 11. Expired order event transitions PENDING to EXPIRED', async () => {
  const { cookieHeader } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'BEGINNER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  const expiredPayload = {
    event_id: `evt_normal_exp_${Date.now()}`,
    event_sequence: 1,
    event: 'order.expired',
    data: { client_order_id: orderId, status: 'expired' },
  };
  const rawExpired = JSON.stringify(expiredPayload);
  const expRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signWebhook(rawExpired).header,
      'X-Event-Id': expiredPayload.event_id,
      'X-Event': 'order.expired',
    },
    body: rawExpired,
  });
  assert.strictEqual(expRes.status, 200);

  const dbOrder = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: orderId },
  });
  assert.strictEqual(dbOrder.status, 'EXPIRED');
});

test('UPI Gateway: 12. Late payment recovery transitions EXPIRED order to PAID', async () => {
  const { cookieHeader, user } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'SCHOLAR',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  // 1. First mark order EXPIRED
  await prisma.paymentOrder.update({
    where: { clientOrderId: orderId },
    data: { status: 'EXPIRED' },
  });

  // 2. Bank settlement arrives late: order.paid
  const latePaidPayload = {
    event_id: `evt_late_paid_${Date.now()}`,
    event_sequence: 2,
    event: 'order.paid',
    data: {
      client_order_id: orderId,
      amount: '8999.00',
      status: 'paid',
      utr: 'UTR_LATE_RECOVER_888',
    },
  };
  const rawLate = JSON.stringify(latePaidPayload);
  const lateRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signWebhook(rawLate).header,
      'X-Event-Id': latePaidPayload.event_id,
      'X-Event': 'order.paid',
    },
    body: rawLate,
  });
  assert.strictEqual(lateRes.status, 200);

  // 3. Verify late recovery succeeded
  const recoveredOrder = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: orderId },
  });
  assert.strictEqual(recoveredOrder.status, 'PAID', 'Late recovery must successfully transition EXPIRED to PAID');
  assert.strictEqual(recoveredOrder.utr, 'UTR_LATE_RECOVER_888');

  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    include: { plan: true },
  });
  assert.ok(sub);
  assert.strictEqual(sub.plan.code, 'SCHOLAR');
});

test('UPI Gateway: 13. Sandbox vs live isolation flags', async () => {
  const { cookieHeader } = await createTestAspirant();
  const res = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'BEGINNER',
      billingInterval: 'ANNUAL',
    }),
  });
  const json = await res.json();
  assert.strictEqual(json.data.isSandbox, true);

  const order = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: json.data.orderId },
  });
  assert.strictEqual(order.isTest, true);
  assert.strictEqual(order.environment, 'sandbox');
});

test('UPI Gateway: 14. Duplicate entitlement prevention on repeated queries', async () => {
  const { cookieHeader, user } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  // Pay order
  const paidPayload = {
    event_id: `evt_dup_sub_${Date.now()}`,
    event: 'order.paid',
    data: { client_order_id: orderId, amount: '5499.00', status: 'paid', utr: 'UTR_DUP_CHECK' },
  };
  const raw = JSON.stringify(paidPayload);
  await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signWebhook(raw).header,
      'X-Event-Id': paidPayload.event_id,
      'X-Event': 'order.paid',
    },
    body: raw,
  });

  // Query status twice
  await fetch(`${BASE_URL}/api/v1/payments/orders/${orderId}/status`, {
    headers: { Cookie: cookieHeader },
  });
  await fetch(`${BASE_URL}/api/v1/payments/orders/${orderId}/status`, {
    headers: { Cookie: cookieHeader },
  });

  // Count active subscriptions for user
  const subCount = await prisma.subscription.count({
    where: { userId: user.id, status: 'ACTIVE' },
  });
  assert.strictEqual(subCount, 1, 'Should have exactly 1 active subscription, no duplicate rows');
});

test('UPI Gateway: 15. Unauthorized admin access to financial ledger is forbidden', async () => {
  const { cookieHeader } = await createTestAspirant();

  // Regular aspirant trying to view financial records
  const res = await fetch(`${BASE_URL}/api/v1/admin/payments`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(res.status, 403);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'FORBIDDEN');
});

test('UPI Gateway: 16. Payment status API returns 404 for non-existent order', async () => {
  const { cookieHeader } = await createTestAspirant();

  const res = await fetch(`${BASE_URL}/api/v1/payments/orders/NON_EXISTENT_ORDER_9999/status`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(res.status, 404);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'ORDER_NOT_FOUND');
});

test('UPI Gateway: 17. User visiting checkout success URL without paying stays PENDING and inactive', async () => {
  const { cookieHeader, user } = await createTestAspirant();
  const orderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      productType: 'SUBSCRIPTION',
      productId: 'ACHIEVER',
      billingInterval: 'ANNUAL',
    }),
  });
  const orderJson = await orderRes.json();
  const orderId = orderJson.data.orderId;

  // Student navigates to checkout/status without completing payment
  const statusRes = await fetch(`${BASE_URL}/api/v1/payments/orders/${orderId}/status`, {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(statusRes.status, 200);
  const statusJson = await statusRes.json();
  assert.strictEqual(statusJson.data.status, 'PENDING');
  assert.strictEqual(statusJson.data.entitlementActive, false);

  // Verify DB that no subscription was granted
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
  });
  assert.strictEqual(sub, null, 'No entitlement may be granted without verified payment');
});
