import { prisma } from "@/lib/prisma";
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
  const order = await prisma.paymentOrder.findFirst({
    where: {
      OR: [
        { clientOrderId: orderIdentifier },
        { gatewayOrderId: orderIdentifier },
      ],
    },
    include: {
      user: true,
      subscription: true,
    },
  });

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
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { lastCheckedAt: new Date() },
      });

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
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });
        order.status = "EXPIRED";
      } else if (gatewayData.status === "failed") {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: { status: "FAILED" },
        });
        order.status = "FAILED";
      } else if (gatewayData.status === "under_review") {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: { status: "UNDER_REVIEW" },
        });
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

  await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { id: paymentOrderId },
      include: { user: true },
    });

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
      const plan = await tx.plan.findUnique({
        where: { code: planCode },
      });

      if (plan) {
        const days =
          billingInterval === "ANNUAL" ? 365 : billingInterval === "QUARTERLY" ? 90 : 30;
        const now = new Date();
        const periodEnd = new Date(now.getTime() + days * 86400000);

        const existingSub = await tx.subscription.findFirst({
          where: { userId: order.userId },
          orderBy: { currentPeriodEnd: "desc" },
        });

        if (existingSub) {
          // If existing sub is active and in future, extend from currentPeriodEnd
          const startBase =
            existingSub.status === "ACTIVE" && existingSub.currentPeriodEnd > now
              ? existingSub.currentPeriodEnd
              : now;
          const newPeriodEnd = new Date(startBase.getTime() + days * 86400000);

          const updatedSub = await tx.subscription.update({
            where: { id: existingSub.id },
            data: {
              planId: plan.id,
              billingInterval,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: newPeriodEnd,
              cancelAtPeriodEnd: false,
              canceledAt: null,
            },
          });
          subId = updatedSub.id;
        } else {
          const createdSub = await tx.subscription.create({
            data: {
              userId: order.userId,
              planId: plan.id,
              billingInterval,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              providerSubId: `upi_${order.clientOrderId}`,
            },
          });
          subId = createdSub.id;
        }

        // Record subscription activation event
        await tx.subscriptionEvent.create({
          data: {
            subscriptionId: subId,
            eventType: "ACTIVATED",
            payloadJson: JSON.stringify({
              orderId: order.clientOrderId,
              gatewayOrderId: order.gatewayOrderId,
              amount: order.amount,
              planCode: plan.code,
              utr,
              paidAt,
            }),
          },
        });
      }
    }

    // Update order status to PAID
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        subscriptionId: subId,
        utr: utr || order.utr,
        paidAt,
        verifiedAt: new Date(),
      },
    });

    // Update or link corresponding PaymentRecord for financial reporting
    const existingPaymentRecord = await tx.paymentRecord.findFirst({
      where: {
        OR: [
          { providerTxId: order.clientOrderId },
          { providerTxId: order.gatewayOrderId || "" },
          { idempotencyKey: `upi_${order.clientOrderId}` },
        ],
      },
    });

    if (existingPaymentRecord) {
      await tx.paymentRecord.update({
        where: { id: existingPaymentRecord.id },
        data: {
          status: "SUCCESS",
          subscriptionId: subId,
          amount: order.amount,
          currency: order.currency,
          updatedAt: new Date(),
        },
      });
    } else {
      await tx.paymentRecord.create({
        data: {
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
        },
      });
    }
  }, {
    maxWait: 20000,
    timeout: 30000,
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

  await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { id: paymentOrderId },
    });

    if (!order) {
      throw new Error(`Order ${paymentOrderId} not found for refund`);
    }

    if (order.status === "REFUNDED") {
      return; // Already refunded idempotently
    }

    const refundAmount = amount || order.amount;

    // Update PaymentOrder
    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });

    // Find and update PaymentRecord
    const payment = await tx.paymentRecord.findFirst({
      where: {
        OR: [
          { providerTxId: order.clientOrderId },
          { providerTxId: order.gatewayOrderId || "" },
          { idempotencyKey: `upi_${order.clientOrderId}` },
        ],
      },
    });

    if (payment) {
      await tx.paymentRecord.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });

      // Create RefundRecord
      await tx.refundRecord.create({
        data: {
          paymentRecordId: payment.id,
          userId: order.userId,
          amount: refundAmount,
          currency: order.currency,
          reason,
          status: "COMPLETED",
          providerRefundId: `ref_${order.clientOrderId}`,
        },
      });
    }

    // If subscription was active, cancel it immediately
    if (order.subscriptionId) {
      await tx.subscription.update({
        where: { id: order.subscriptionId },
        data: {
          status: "CANCELED",
          canceledAt: new Date(),
        },
      });

      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: order.subscriptionId,
          eventType: "CANCELED",
          payloadJson: JSON.stringify({
            orderId: order.clientOrderId,
            reason,
            refundAmount,
            refundedAt: new Date(),
          }),
        },
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

  await prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({
      where: { id: paymentOrderId },
    });

    if (!order || order.status === "PAID") {
      return; // Do not fail an already paid order
    }

    await tx.paymentOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });

    const payment = await tx.paymentRecord.findFirst({
      where: {
        OR: [
          { providerTxId: order.clientOrderId },
          { providerTxId: order.gatewayOrderId || "" },
          { idempotencyKey: `upi_${order.clientOrderId}` },
        ],
      },
    });

    if (payment) {
      await tx.paymentRecord.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }
  });
}
