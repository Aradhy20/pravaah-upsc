import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const WEBHOOK_SECRET = process.env.UPI_GATEWAY_WEBHOOK_SECRET || "whsec_pravaah_upi_sandbox_2026";
const prisma = new PrismaClient();

function signWebhook(rawBody, secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000)) {
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return {
    header: `t=${timestamp},v1=${hmac}`,
    timestamp,
    hmac,
  };
}

async function runEndToEndVerification() {
  console.log("===============================================================");
  console.log("   PRAVAAH UPSC - LIVE END-TO-END UPI PAYMENT GATEWAY TEST    ");
  console.log("===============================================================\n");

  const timestamp = Date.now();
  const testEmail = `live_aspirant_${timestamp}@pravaah.ai`;
  const password = "PassWord123!@#";
  const fullName = `Aspirant Live Test ${timestamp}`;

  // Step 1: User Registration
  console.log(`[Step 1] Registering test student: ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password, fullName }),
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    throw new Error(`Registration failed (${regRes.status}): ${errText}`);
  }

  const cookies = regRes.headers.getSetCookie();
  const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");
  const user = await prisma.user.findUnique({
    where: { email: testEmail.toLowerCase() },
  });
  console.log(`  ✓ Registered Student ID: ${user.id} (${user.email})`);

  // Verify initial subscription state: FREE / none active
  const initialSub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  console.log(`  ✓ Initial Active Subscription: ${initialSub ? initialSub.status : "None (Free tier)"}`);

  // Step 2: Create Payment Order
  console.log("\n[Step 2] Creating UPI Payment Order for ACHIEVER (Annual Plan: ₹5,499)...");
  const createOrderRes = await fetch(`${BASE_URL}/api/v1/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      productType: "SUBSCRIPTION",
      productId: "ACHIEVER",
      billingInterval: "ANNUAL",
    }),
  });

  const orderJson = await createOrderRes.json();
  if (!createOrderRes.ok || !orderJson.success) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderJson)}`);
  }

  const { orderId, gatewayOrderId, amount, currency, baseAmount, gstAmount, gstRatePercent, upiIntent } = orderJson.data;
  console.log(`  ✓ Order Created Successfully!`);
  console.log(`    - Client Order ID : ${orderId}`);
  console.log(`    - Gateway Order ID: ${gatewayOrderId}`);
  console.log(`    - Total Amount    : ₹${amount} ${currency}`);
  console.log(`    - Base Price      : ₹${baseAmount}`);
  console.log(`    - GST (${gstRatePercent}%)        : ₹${gstAmount}`);
  console.log(`    - UPI Intent URI  : ${upiIntent}`);

  // Step 3: Check Order Status (Before Payment)
  console.log("\n[Step 3] Checking Order Status via API (Before Payment)...");
  const preStatusRes = await fetch(`${BASE_URL}/api/v1/payments/orders/${orderId}/status`, {
    headers: { Cookie: cookieHeader },
  });
  const preStatusJson = await preStatusRes.json();
  console.log(`  ✓ Status Response Status Code: ${preStatusRes.status}`);
  console.log(`  ✓ Current Order Status: ${preStatusJson.data?.status}`);
  if (preStatusJson.data?.status !== "PENDING") {
    throw new Error(`Expected PENDING, got ${preStatusJson.data?.status}`);
  }

  // Step 4: Test Webhook Security - Invalid Signature
  console.log("\n[Step 4] Testing Webhook Security: Invalid Signature...");
  const fakeEventId = `evt_fake_${Date.now()}`;
  const fakePayload = JSON.stringify({
    event_id: fakeEventId,
    event: "order.paid",
    data: { order_id: gatewayOrderId, client_order_id: orderId, amount: String(amount), status: "paid" },
  });
  const badSigRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": "t=1731718000,v1=deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      "X-Event-Id": fakeEventId,
      "X-Event": "order.paid",
    },
    body: fakePayload,
  });
  const badSigJson = await badSigRes.json();
  console.log(`  ✓ Bad Signature Rejected: HTTP ${badSigRes.status} (Code: ${badSigJson.error?.code})`);
  if (badSigRes.status !== 401) {
    throw new Error(`Expected 401 for bad signature, got ${badSigRes.status}`);
  }

  // Step 5: Process Authentic Signed Webhook Callback (order.paid)
  console.log("\n[Step 5] Sending Valid Cryptographically-Signed 'order.paid' Webhook...");
  const liveEventId = `evt_live_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const utrNumber = `UTR${Date.now().toString().slice(-12)}`;
  const webhookPayloadObj = {
    event_id: liveEventId,
    event_sequence: 1,
    occurred_at: new Date().toISOString(),
    event: "order.paid",
    data: {
      order_id: gatewayOrderId,
      client_order_id: orderId,
      amount: `${amount}.00`,
      currency: "INR",
      status: "paid",
      environment: "sandbox",
      utr: utrNumber,
    },
  };
  const rawWebhookBody = JSON.stringify(webhookPayloadObj);
  const { header: validSignatureHeader } = signWebhook(rawWebhookBody);

  const webhookRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": validSignatureHeader,
      "X-Event-Id": liveEventId,
      "X-Event": "order.paid",
    },
    body: rawWebhookBody,
  });

  const webhookJson = await webhookRes.json();
  console.log(`  ✓ Webhook HTTP Status: ${webhookRes.status}`);
  console.log(`  ✓ Webhook Success Flag: ${webhookJson.success}`);
  if (webhookRes.status !== 200 || !webhookJson.success) {
    throw new Error(`Webhook failed: ${JSON.stringify(webhookJson)}`);
  }

  // Step 6: Verify Database Entitlement & Subscription Activation
  console.log("\n[Step 6] Inspecting PostgreSQL Database State...");
  const dbOrder = await prisma.paymentOrder.findUnique({
    where: { clientOrderId: orderId },
  });
  console.log(`  ✓ PaymentOrder.status: ${dbOrder.status}`);
  console.log(`  ✓ PaymentOrder.utr   : ${dbOrder.utr}`);
  console.log(`  ✓ PaymentOrder.paidAt: ${dbOrder.paidAt}`);

  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { plan: true },
  });
  console.log(`  ✓ User Active Subscription ID: ${activeSubscription?.id}`);
  console.log(`  ✓ Activated Plan Code        : ${activeSubscription?.plan.code} (${activeSubscription?.plan.name})`);
  console.log(`  ✓ Billing Interval           : ${activeSubscription?.billingInterval}`);
  console.log(`  ✓ Period Start               : ${activeSubscription?.currentPeriodStart}`);
  console.log(`  ✓ Period End                 : ${activeSubscription?.currentPeriodEnd}`);

  if (!activeSubscription || activeSubscription.plan.code !== "ACHIEVER") {
    throw new Error("Subscription not activated or wrong plan!");
  }

  // Step 7: Check Order Status (Post Payment)
  console.log("\n[Step 7] Checking Order Status via API (After Payment)...");
  const postStatusRes = await fetch(`${BASE_URL}/api/v1/payments/orders/${orderId}/status`, {
    headers: { Cookie: cookieHeader },
  });
  const postStatusJson = await postStatusRes.json();
  console.log(`  ✓ Status Response Status Code: ${postStatusRes.status}`);
  console.log(`  ✓ Updated Order Status: ${postStatusJson.data?.status}`);
  console.log(`  ✓ Verified UTR        : ${postStatusJson.data?.utr}`);
  if (postStatusJson.data?.status !== "PAID") {
    throw new Error(`Expected PAID, got ${postStatusJson.data?.status}`);
  }

  // Step 8: Test Webhook Idempotency
  console.log("\n[Step 8] Testing Idempotent Re-delivery of Same Webhook...");
  const retryWebhookRes = await fetch(`${BASE_URL}/api/webhooks/upi-gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": validSignatureHeader,
      "X-Event-Id": liveEventId,
      "X-Event": "order.paid",
    },
    body: rawWebhookBody,
  });
  const retryWebhookJson = await retryWebhookRes.json();
  console.log(`  ✓ Re-delivery HTTP Status: ${retryWebhookRes.status}`);
  console.log(`  ✓ Re-delivery Response   : ${retryWebhookJson.message}`);

  // Count subscriptions for this user
  const subCount = await prisma.subscription.count({
    where: { userId: user.id, status: "ACTIVE" },
  });
  console.log(`  ✓ Active Subscription Count for User: ${subCount} (strictly 1, no duplicate provisioning)`);
  if (subCount !== 1) {
    throw new Error(`Expected exactly 1 active subscription, found ${subCount}`);
  }

  console.log("\n===============================================================");
  console.log("   🎉 ALL UPI PAYMENT GATEWAY CHECKS PASSED SUCCESSFULLY!     ");
  console.log("===============================================================\n");
}

runEndToEndVerification()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
