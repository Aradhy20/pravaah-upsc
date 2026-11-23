/**
 * Cashfree Payments Provider (Placeholder Stub)
 * 
 * IMPORTANT: Cashfree merchant application is currently under review.
 * This class serves as an architectural placeholder and contract definition.
 * It DOES NOT process payments, DOES NOT make external API calls,
 * and DOES NOT simulate fake order creation or subscription activation.
 */

import {
  PaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  PaymentVerificationResult,
  WebhookVerificationParams,
  WebhookVerificationResult,
  RefundParams,
  RefundResult,
  PaymentStatus,
} from "../payment-types";
import { getCashfreeConfig, PAYMENTS_DISABLED_MESSAGE } from "../payment-config";
import { normalizePaymentStatus } from "../payment-status";

export class PaymentGatewayNotConfiguredError extends Error {
  code = "PAYMENT_GATEWAY_NOT_CONFIGURED";
  constructor(message: string = PAYMENTS_DISABLED_MESSAGE) {
    super(message);
    this.name = "PaymentGatewayNotConfiguredError";
  }
}

export class CashfreePaymentProvider implements PaymentProvider {
  readonly providerName = "CASHFREE";

  isConfigured(): boolean {
    const config = getCashfreeConfig();
    return config.isConfigured;
  }

  async createOrder(_params: CreateOrderParams): Promise<PaymentOrderResult> {
    throw new PaymentGatewayNotConfiguredError(
      "Cashfree merchant account is currently under review. Paid orders cannot be created until official credentials are provided."
    );
  }

  async fetchOrder(_orderId: string): Promise<PaymentOrderResult> {
    throw new PaymentGatewayNotConfiguredError(
      "Cashfree merchant account is under review. Order status fetching is disabled."
    );
  }

  async verifyPayment(_orderId: string): Promise<PaymentVerificationResult> {
    throw new PaymentGatewayNotConfiguredError(
      "Cashfree merchant account is under review. Payment verification is disabled."
    );
  }

  async processWebhook(_params: WebhookVerificationParams): Promise<WebhookVerificationResult> {
    throw new PaymentGatewayNotConfiguredError(
      "Cashfree merchant account is under review. Webhook processing is disabled."
    );
  }

  async refundPayment(_params: RefundParams): Promise<RefundResult> {
    throw new PaymentGatewayNotConfiguredError(
      "Cashfree merchant account is under review. Refunds cannot be processed."
    );
  }

  normalizeStatus(rawStatus: string): PaymentStatus {
    return normalizePaymentStatus(rawStatus);
  }
}
