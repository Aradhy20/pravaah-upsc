import { prisma } from "@/lib/prisma";
import { or } from "@prisma/orm-postgres/orm-client";
import { UpiGatewayClient } from "./client";
import { OrderNotFoundError } from "./errors";

export interface StatusCheckResult {
  orderId: string;
  gatewayOrderId?: string;
  status: string;
  amount: number;
  currency: string;
  productType: string;
  productId?: string;
  utr?: string;
  isTest: boolean;
  paidAt?: string;
  expiresAt?: string;
  entitlementActive: boolean;
  planCode?: string;
  upiIntent?: string;
  paymentUrl?: string;
  receivingUpiId?: string;
  payeeName?: string;
}

/**
 * Authoritatively verifies order status against internal DB and/or UPI Gateway API.
 */
export async function verifyOrderStatus(
  orderIdentifier: string,
  client?: UpiGatewayClient
): Promise<StatusCheckResult> {
  // 1. Fetch internal order
  const order = await prisma.orm.public.PaymentOrder
    .where((o) => or(o.clientOrderId.eq(orderIdentifier), o.gatewayOrderId.eq(orderIdentifier)))
    .include("user")
    .include("subscription")
    .first();

  if (!order) {
    throw new OrderNotFoundError(orderIdentifier);
  }

  const receivingUpiId = process.env.UPI_RECEIVING_ID || "jainaradhy123@okicici";
  const payeeName = process.env.UPI_PAYEE_NAME || "Aradhy Jain";

  // 2. If already in terminal state PAID or REFUNDED, return current DB state
  if (order.status === "PAID" || order.status === "REFUNDED") {
    return {
      orderId: order.clientOrderId,
      gatewayOrderId: order.gatewayOrderId || undefined,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      productType: order.productType,
      productId: order.productId || undefined,
      utr: order.utr || undefined,
      isTest: order.isTest,
      paidAt: order.paidAt?.toISOString(),
      expiresAt: order.expiresAt?.toISOString(),
      entitlementActive: order.status === "PAID",
      planCode: order.productId || undefined,
      upiIntent: order.upiIntent || undefined,
      paymentUrl: order.paymentUrl || undefined,
      receivingUpiId,
      payeeName,
    };
  }

  // 3. If PENDING / PROCESSING, optionally synchronize with gateway API
  if (order.gatewayOrderId && (order.status === "PENDING" || order.status === "PROCESSING")) {
    try {
      const gatewayClient = client || new UpiGatewayClient();
      const gatewayData = await gatewayClient.getOrderStatus(order.gatewayOrderId);

      // Record polling timestamp
      await prisma.orm.public.PaymentOrder.where({ id: order.id }).update({ lastCheckedAt: new Date() });

      if (gatewayData.status === "paid") {
        // Activate entitlement transactionally
        await activateEntitlementForOrder({
          paymentOrderId: order.id,
          utr: gatewayData.utr || "UPI_VERIFIED",
          paidAt: gatewayData.paid_at ? new Date(gatewayData.paid_at) : new Date(),
        });

        return {
          orderId: order.clientOrderId,
          gatewayOrderId: order.gatewayOrderId,
          status: "PAID",
          amount: order.amount,
          currency: order.currency,
          productType: order.productType,
          productId: order.productId || undefined,
          utr: gatewayData.utr,
          isTest: order.isTest,
          paidAt: new Date().toISOString(),
          entitlementActive: true,
          planCode: order.productId || undefined,
          receivingUpiId,
          payeeName,
        };
      }

      if (gatewayData.status === "expired") {
        await prisma.orm.public.PaymentOrder.where({ id: order.id }).update({ status: "EXPIRED" });
        order.status = "EXPIRED";
      } else if (gatewayData.status === "failed") {
        await prisma.orm.public.PaymentOrder.where({ id: order.id }).update({ status: "FAILED" });
        order.status = "FAILED";
      } else if (gatewayData.status === "under_review") {
        await prisma.orm.public.PaymentOrder.where({ id: order.id }).update({ status: "UNDER_REVIEW" });
        order.status = "UNDER_REVIEW";
      }
    } catch (err: any) {
      console.warn(`Could not sync live order status with gateway: ${err.message}`);
    }
  }

  return {
    orderId: order.clientOrderId,
    gatewayOrderId: order.gatewayOrderId || undefined,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    productType: order.productType,
    productId: order.productId || undefined,
    utr: order.utr || undefined,
    isTest: order.isTest,
    paidAt: order.paidAt?.toISOString(),
    expiresAt: order.expiresAt?.toISOString(),
    entitlementActive: order.status === "PAID",
    planCode: order.productId || undefined,
    upiIntent: order.upiIntent || undefined,
    paymentUrl: order.paymentUrl || undefined,
    receivingUpiId,
    payeeName,
  };
}

/**
 * Transactionally activates purchased product / subscription and sets order to PAID
 */
export async function activateEntitlementForOrder(params: {
  paymentOrderId: string;
  utr?: string;
  paidAt?: Date;
  eventSequence?: number;
}): Promise<void> {
  const { paymentOrderId, utr, paidAt = new Date() } = params;

  await prisma.transaction(async (tx) => {
    const order = await tx.orm.public.PaymentOrder.include("user").first({ id: paymentOrderId });

    if (!order) {
      throw new Error(`Order ${paymentOrderId} not found for activation`);
    }

    // Already paid check for idempotency
    if (order.status === "PAID") {
      return;
    }

    let subId = order.subscriptionId;

    if (order.productType === "SUBSCRIPTION") {
      let billingInterval = "ANNUAL";
      try {
        if (order.metadataJson) {
          const meta = JSON.parse(order.metadataJson);
          if (meta.billingInterval) billingInterval = meta.billingInterval;
        }
      } catch {}

      const planCode = order.productId || "ACHIEVER";
      const plan = await tx.orm.public.Plan.where({ code: planCode }).first();

      if (plan) {
        const days =
          billingInterval === "ANNUAL" ? 365 : billingInterval === "QUARTERLY" ? 90 : 30;
        const now = new Date();
        const periodEnd = new Date(now.getTime() + days * 86400000);

        const existingSub = await tx.orm.public.Subscription
          .where({ userId: order.userId })
          .orderBy((s) => s.currentPeriodEnd.desc())
          .first();

        if (existingSub) {
          // If existing sub is active and in future, extend from currentPeriodEnd
          const startBase =
            existingSub.status === "ACTIVE" && existingSub.currentPeriodEnd > now
              ? existingSub.currentPeriodEnd
              : now;
          const newPeriodEnd = new Date(startBase.getTime() + days * 86400000);

          const updatedSub = await tx.orm.public.Subscription.where({ id: existingSub.id }).update({
            planId: plan.id,
            billingInterval,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: newPeriodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null,
          });
          subId = updatedSub!.id;
        } else {
          const createdSub = await tx.orm.public.Subscription.create({
            userId: order.userId,
            planId: plan.id,
            billingInterval,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            providerSubId: `upi_${order.clientOrderId}`,
          });
          subId = createdSub.id;
        }

        // Record subscription activation event
        await tx.orm.public.SubscriptionEvent.create({
          subscriptionId: subId!,
          eventType: "ACTIVATED",
          payloadJson: JSON.stringify({
            orderId: order.clientOrderId,
            gatewayOrderId: order.gatewayOrderId,
            amount: order.amount,
            planCode: plan.code,
            utr,
            paidAt,
          }),
        });
      }
    }

    // Update order status to PAID
    await tx.orm.public.PaymentOrder.where({ id: order.id }).update({
      status: "PAID",
      subscriptionId: subId,
      utr: utr || order.utr,
      paidAt,
      verifiedAt: new Date(),
    });

    // Update or link corresponding PaymentRecord for financial reporting
    const existingPaymentRecord = await tx.orm.public.PaymentRecord
      .where((p) => or(
        p.providerTxId.eq(order.clientOrderId),
        p.providerTxId.eq(order.gatewayOrderId || ""),
        p.idempotencyKey.eq(`upi_${order.clientOrderId}`),
      ))
      .first();

    if (existingPaymentRecord) {
      await tx.orm.public.PaymentRecord.where({ id: existingPaymentRecord.id }).update({
        status: "SUCCESS",
        subscriptionId: subId,
        amount: order.amount,
        currency: order.currency,
        updatedAt: new Date(),
      });
    } else {
      await tx.orm.public.PaymentRecord.create({
        userId: order.userId,
        subscriptionId: subId,
        amount: order.amount,
        currency: order.currency,
        status: "SUCCESS",
        provider: "UPI_GATEWAY",
        providerTxId: order.gatewayOrderId || order.clientOrderId,
        idempotencyKey: `upi_${order.clientOrderId}`,
        paymentMethod: "UPI",
        receiptNumber: `REC-UPI-${Date.now()}`,
      });
    }
  });
}

/**
 * Transactionally handles refunds: sets order and payment to REFUNDED,
 * creates RefundRecord, cancels subscription, logs event.
 */
export async function handleRefundForOrder(params: {
  paymentOrderId: string;
  reason?: string;
  amount?: number;
}): Promise<void> {
  const { paymentOrderId, reason = "Customer requested refund", amount } = params;

  await prisma.transaction(async (tx) => {
    const order = await tx.orm.public.PaymentOrder.first({ id: paymentOrderId });

    if (!order) {
      throw new Error(`Order ${paymentOrderId} not found for refund`);
    }

    if (order.status === "REFUNDED") {
      return; // Already refunded idempotently
    }

    const refundAmount = amount || order.amount;

    // Update PaymentOrder
    await tx.orm.public.PaymentOrder.where({ id: order.id }).update({ status: "REFUNDED" });

    // Find and update PaymentRecord
    const payment = await tx.orm.public.PaymentRecord
      .where((p) => or(
        p.providerTxId.eq(order.clientOrderId),
        p.providerTxId.eq(order.gatewayOrderId || ""),
        p.idempotencyKey.eq(`upi_${order.clientOrderId}`),
      ))
      .first();

    if (payment) {
      await tx.orm.public.PaymentRecord.where({ id: payment.id }).update({ status: "REFUNDED" });

      // Create RefundRecord
      await tx.orm.public.RefundRecord.create({
        paymentRecordId: payment.id,
        userId: order.userId,
        amount: refundAmount,
        currency: order.currency,
        reason,
        status: "COMPLETED",
        providerRefundId: `ref_${order.clientOrderId}`,
      });
    }

    // If subscription was active, cancel it immediately
    if (order.subscriptionId) {
      await tx.orm.public.Subscription.where({ id: order.subscriptionId }).update({
        status: "CANCELED",
        canceledAt: new Date(),
      });

      await tx.orm.public.SubscriptionEvent.create({
        subscriptionId: order.subscriptionId,
        eventType: "CANCELED",
        payloadJson: JSON.stringify({
          orderId: order.clientOrderId,
          reason,
          refundAmount,
          refundedAt: new Date(),
        }),
      });
    }
  });
}

/**
 * Handles failed payment: transitions order and payment to FAILED
 */
export async function handleFailureForOrder(params: {
  paymentOrderId: string;
  reason?: string;
}): Promise<void> {
  const { paymentOrderId, reason = "Payment declined or failed" } = params;

  await prisma.transaction(async (tx) => {
    const order = await tx.orm.public.PaymentOrder.first({ id: paymentOrderId });

    if (!order || order.status === "PAID") {
      return; // Do not fail an already paid order
    }

    await tx.orm.public.PaymentOrder.where({ id: order.id }).update({ status: "FAILED" });

    const payment = await tx.orm.public.PaymentRecord
      .where((p) => or(
        p.providerTxId.eq(order.clientOrderId),
        p.providerTxId.eq(order.gatewayOrderId || ""),
        p.idempotencyKey.eq(`upi_${order.clientOrderId}`),
      ))
      .first();

    if (payment) {
      await tx.orm.public.PaymentRecord.where({ id: payment.id }).update({ status: "FAILED" });
    }
  });
}
