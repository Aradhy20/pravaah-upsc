import { prisma } from "@/lib/prisma";
import { UpiGatewayClient } from "./client";
import { CheckoutResultData, InitiatePaymentParams } from "./types";
import { UpiGatewayError } from "./errors";
import crypto from "crypto";

export async function createPaymentOrder(
  params: InitiatePaymentParams,
  client?: UpiGatewayClient
): Promise<CheckoutResultData> {
  const { userId, productType, productId, billingInterval = "ANNUAL", metadata = {}, forceNew = false } = params;

  // 1. Verify User exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true },
  });

  if (!user) {
    throw new UpiGatewayError("User not found", "USER_NOT_FOUND", 404);
  }

  // 2. Authoritative Server-Side Product & Price Resolution
  let amount = 0;
  let productName = "";
  let resolvedProductId = productId;

  if (productType === "SUBSCRIPTION") {
    const normalizedCode = productId.trim().toUpperCase();
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { id: productId },
          { code: productId },
        ],
        isActive: true,
      },
      include: {
        prices: {
          where: { billingInterval, isActive: true },
        },
      },
    });

    if (!plan || plan.prices.length === 0) {
      throw new UpiGatewayError(
        `Plan ${productId} (${billingInterval}) not found or has no active pricing`,
        "PLAN_NOT_FOUND",
        404
      );
    }

    resolvedProductId = plan.code;
    amount = plan.prices[0].amountRupees;
    productName = `${plan.name} (${billingInterval.toLowerCase()} billing)`;
  } else if (productType === "TEST_SERIES") {
    // Check if test exists
    const test = await prisma.test.findUnique({
      where: { id: productId },
    });

    if (test) {
      amount = 199; // Individual full test fee
      productName = `Mock Test: ${test.title}`;
    } else if (productId.includes("pack") || productId.includes("series")) {
      amount = 1499; // Multi-test series package
      productName = "Comprehensive UPSC Prelims Test Series (10 Mocks)";
    } else {
      amount = 299;
      productName = `Test Series Package (${productId})`;
    }
  } else if (productType === "MAINS_EVALUATION") {
    if (productId.includes("25")) {
      amount = 1999;
      productName = "25-Draft AI Mains Evaluation Cohort";
    } else {
      amount = 999;
      productName = "10-Draft AI Mains Evaluation Pack";
    }
  } else if (productType === "CURRENT_AFFAIRS") {
    amount = 499;
    productName = "Annual Current Affairs & Govt Scheme Dossier";
  } else {
    amount = 499;
    productName = `Specialized Course Module (${productId})`;
  }

  if (amount <= 0) {
    throw new UpiGatewayError("Free items do not require payment checkout", "FREE_PRODUCT", 400);
  }

  const amountPaise = Math.round(amount * 100);

  // 3. Generate unique internal client_order_id
  const clientOrderId = `UPICHECKOUT_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  // 4. Calculate 18% GST breakdown
  const baseAmount = Math.round((amount / 1.18) * 100) / 100;
  const gstAmount = Math.round((amount - baseAmount) * 100) / 100;

  // 5. Create PENDING PaymentOrder and PaymentRecord in Database
  const orderRecord = await prisma.paymentOrder.create({
    data: {
      clientOrderId,
      userId: user.id,
      productType,
      productId: resolvedProductId,
      amount,
      amountPaise,
      currency: "INR",
      status: "PENDING",
      environment: process.env.UPI_GATEWAY_SANDBOX_MODE === "false" ? "live" : "sandbox",
      isTest: process.env.UPI_GATEWAY_SANDBOX_MODE !== "false",
      metadataJson: JSON.stringify({
        billingInterval,
        productName,
        baseAmount,
        gstAmount,
        ...metadata,
      }),
    },
  });

  // Create corresponding PENDING PaymentRecord in financial ledger
  await prisma.paymentRecord.create({
    data: {
      userId: user.id,
      amount,
      currency: "INR",
      status: "PENDING",
      provider: "UPI_GATEWAY",
      providerTxId: clientOrderId,
      idempotencyKey: `upi_${clientOrderId}`,
      paymentMethod: "UPI",
      receiptNumber: `REC-UPI-${Date.now()}`,
    },
  });

  // 6. Invoke UPI Gateway API
  const gatewayClient = client || new UpiGatewayClient();
  let gatewayOrder;
  try {
    gatewayOrder = await gatewayClient.createOrder({
      amount,
      client_order_id: clientOrderId,
    });
  } catch (err: any) {
    // Mark order and payment record FAILED if gateway rejected creation
    await prisma.paymentOrder.update({
      where: { id: orderRecord.id },
      data: { status: "FAILED" },
    });
    await prisma.paymentRecord.updateMany({
      where: { providerTxId: clientOrderId },
      data: { status: "FAILED" },
    });
    throw err;
  }

  // 7. Update internal order with gateway coordinates
  const updatedOrder = await prisma.paymentOrder.update({
    where: { id: orderRecord.id },
    data: {
      gatewayOrderId: gatewayOrder.order_id,
      paymentUrl: gatewayOrder.payment_url,
      upiIntent: gatewayOrder.upi_intent,
      environment: gatewayOrder.environment,
      isTest: gatewayOrder.test,
      expiresAt: gatewayOrder.expires_at ? new Date(gatewayOrder.expires_at) : null,
    },
  });

  const config = (gatewayClient as any).config || {};
  const receivingUpiId = config.receivingUpiId || process.env.UPI_RECEIVING_ID || "jainaradhy123@okicici";
  const payeeName = config.payeeName || process.env.UPI_PAYEE_NAME || "Aradhy Jain";

  return {
    orderId: updatedOrder.clientOrderId,
    gatewayOrderId: updatedOrder.gatewayOrderId || undefined,
    productType,
    productId: resolvedProductId,
    productName,
    amount,
    currency: "INR",
    baseAmount,
    gstAmount,
    gstRatePercent: 18,
    paymentUrl: updatedOrder.paymentUrl || undefined,
    upiIntent: updatedOrder.upiIntent || undefined,
    receivingUpiId,
    payeeName,
    qrPayload: updatedOrder.upiIntent || undefined,
    expiresAt: updatedOrder.expiresAt?.toISOString(),
    isSandbox: updatedOrder.isTest,
  };
}
