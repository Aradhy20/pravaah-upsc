/**
 * Pravaah UPSC — Subscription Activation Engine
 *
 * Atomically activates candidate subscriptions upon verified Cashfree payment.
 * Ensures idempotency: duplicate webhooks or multiple verify calls will NOT
 * double-extend periods or create duplicate payment records.
 */

import { prisma } from "@/lib/prisma";

export interface ActivationParams {
  orderId: string;
  cashfreePaymentId?: string;
  paymentMethod?: string;
  paidAt?: Date;
}

export interface ActivationResult {
  success: boolean;
  alreadyActivated?: boolean;
  subscription?: any;
  order?: any;
  paymentRecord?: any;
  error?: string;
}

export async function activateSubscriptionFromOrder(
  params: ActivationParams
): Promise<ActivationResult> {
  const { orderId, cashfreePaymentId, paymentMethod, paidAt } = params;

  try {
    // 1. Fetch PaymentOrder
    const order = await prisma.paymentOrder.findFirst({
      where: {
        OR: [
          { clientOrderId: orderId },
          { gatewayOrderId: orderId },
          { cashfreeOrderId: orderId },
          { id: orderId },
        ],
      },
      include: {
        subscription: true,
      },
    });

    if (!order) {
      return { success: false, error: `Order '${orderId}' not found.` };
    }

    // 2. Idempotency Check: if order is already PAID and linked to an ACTIVE subscription
    if (order.status === "PAID" && order.subscription && order.subscription.status === "ACTIVE") {
      return {
        success: true,
        alreadyActivated: true,
        subscription: order.subscription,
        order,
      };
    }

    // 3. Resolve Target Plan
    const planCode = order.productId || "ACHIEVER";
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [
          { id: order.planId || undefined },
          { code: planCode },
          { code: planCode.toUpperCase() },
        ],
      },
    });

    if (!plan) {
      return { success: false, error: `Target plan '${planCode}' not found in catalogue.` };
    }

    // 4. Calculate Subscription Dates
    const now = new Date();
    let interval = "MONTHLY";
    try {
      if (order.metadataJson) {
        const meta = JSON.parse(order.metadataJson);
        if (meta.billingInterval) interval = meta.billingInterval.toUpperCase();
      }
    } catch {
      interval = "MONTHLY";
    }

    let durationDays = 30;
    if (interval === "QUARTERLY") durationDays = 90;
    if (interval === "ANNUAL") durationDays = 365;

    // Check for existing active subscription for this user
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: order.userId,
        status: "ACTIVE",
        currentPeriodEnd: { gt: now },
      },
      orderBy: { currentPeriodEnd: "desc" },
    });

    let startDate = now;
    let endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // If candidate has an existing active subscription of the same tier, extend from existing end date
    if (existingSub && existingSub.planId === plan.id && existingSub.currentPeriodEnd > now) {
      startDate = existingSub.currentPeriodStart;
      endDate = new Date(
        existingSub.currentPeriodEnd.getTime() + durationDays * 24 * 60 * 60 * 1000
      );
    }

    // 5. Execute Atomic Database Transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create or update subscription
      let sub;
      if (existingSub && existingSub.planId === plan.id) {
        sub = await tx.subscription.update({
          where: { id: existingSub.id },
          data: {
            currentPeriodEnd: endDate,
            billingInterval: interval,
            status: "ACTIVE",
            updatedAt: now,
          },
        });
      } else {
        // If candidate is upgrading or new, create active subscription
        sub = await tx.subscription.create({
          data: {
            userId: order.userId,
            planId: plan.id,
            billingInterval: interval,
            status: "ACTIVE",
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate,
          },
        });
      }

      // Update PaymentOrder to PAID
      const updatedOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: paidAt || order.paidAt || now,
          verifiedAt: now,
          cashfreePaymentId: cashfreePaymentId || order.cashfreePaymentId,
          paymentMethod: paymentMethod || order.paymentMethod || "ONLINE",
          subscriptionId: sub.id,
          planId: plan.id,
        },
      });

      // Upsert PaymentRecord for dual-entry accounting (prevents P2002 if duplicate txId)
      const txId =
        cashfreePaymentId ||
        order.cashfreePaymentId ||
        order.cashfreeOrderId ||
        order.clientOrderId;

      let paymentRecord = await tx.paymentRecord.findFirst({
        where: {
          OR: [
            { providerTxId: txId },
            { receiptNumber: `REC-${order.clientOrderId}` },
          ],
        },
      });

      if (paymentRecord) {
        paymentRecord = await tx.paymentRecord.update({
          where: { id: paymentRecord.id },
          data: {
            status: "SUCCESS",
            subscriptionId: sub.id,
            paymentMethod: paymentMethod || order.paymentMethod || paymentRecord.paymentMethod,
          },
        });
      } else {
        paymentRecord = await tx.paymentRecord.create({
          data: {
            userId: order.userId,
            subscriptionId: sub.id,
            amount: order.amount,
            currency: order.currency || "INR",
            status: "SUCCESS",
            provider: "CASHFREE",
            providerTxId: txId,
            paymentMethod: paymentMethod || order.paymentMethod || "ONLINE",
            receiptNumber: `REC-${order.clientOrderId}`,
          },
        });
      }

      // Create SubscriptionEvent audit entry
      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: sub.id,
          eventType: "ACTIVATED",
          payloadJson: JSON.stringify({
            orderId: order.id,
            clientOrderId: order.clientOrderId,
            cashfreeOrderId: order.cashfreeOrderId,
            cashfreePaymentId: cashfreePaymentId || order.cashfreePaymentId,
            amount: order.amount,
            planCode: plan.code,
            billingInterval: interval,
            activatedAt: now.toISOString(),
          }),
        },
      });

      return { subscription: sub, order: updatedOrder, paymentRecord };
    });

    return {
      success: true,
      alreadyActivated: false,
      subscription: transactionResult.subscription,
      order: transactionResult.order,
      paymentRecord: transactionResult.paymentRecord,
    };
  } catch (error: any) {
    console.error("Subscription activation transaction error:", error);
    return {
      success: false,
      error: error.message || "Failed to activate subscription.",
    };
  }
}
