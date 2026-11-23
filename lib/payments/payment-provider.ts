/**
 * Payment Provider Registry and Dispatcher
 * Pravaah UPSC
 */

import { PaymentProvider } from "./payment-types";
import { CashfreePaymentProvider } from "./providers/cashfree-provider";
import { isPaymentSystemEnabled, PAYMENTS_DISABLED_MESSAGE } from "./payment-config";

class NullPaymentProvider implements PaymentProvider {
  readonly providerName = "DISABLED";

  isConfigured(): boolean {
    return false;
  }

  async createOrder(): Promise<never> {
    throw new Error(PAYMENTS_DISABLED_MESSAGE);
  }

  async fetchOrder(): Promise<never> {
    throw new Error(PAYMENTS_DISABLED_MESSAGE);
  }

  async verifyPayment(): Promise<never> {
    throw new Error(PAYMENTS_DISABLED_MESSAGE);
  }

  async processWebhook(): Promise<never> {
    throw new Error(PAYMENTS_DISABLED_MESSAGE);
  }

  async refundPayment(): Promise<never> {
    throw new Error(PAYMENTS_DISABLED_MESSAGE);
  }

  normalizeStatus(): "PENDING" {
    return "PENDING";
  }
}

const activeProviders: Record<string, PaymentProvider> = {
  CASHFREE: new CashfreePaymentProvider(),
  DISABLED: new NullPaymentProvider(),
};

/**
 * Returns the currently active and verified payment provider.
 * When payment system is disabled (e.g. pending merchant approval),
 * returns NullPaymentProvider which safely rejects paid operations.
 */
export function getActivePaymentProvider(): PaymentProvider {
  if (!isPaymentSystemEnabled()) {
    return activeProviders.DISABLED;
  }

  const cashfree = activeProviders.CASHFREE;
  if (cashfree.isConfigured()) {
    return cashfree;
  }

  return activeProviders.DISABLED;
}
