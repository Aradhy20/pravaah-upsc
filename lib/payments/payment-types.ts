/**
 * Provider-Independent Payment Types & Architecture Specification
 * Pravaah UPSC — Cashfree-Ready Multi-Provider Architecture
 */

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED"
  | "USER_DROPPED";

export type PaymentProductType =
  | "SUBSCRIPTION"
  | "TEST_SERIES"
  | "MAINS_EVALUATION"
  | "CURRENT_AFFAIRS"
  | "COURSE";

export type BillingInterval = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface CreateOrderParams {
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  productType: PaymentProductType;
  productId: string;
  billingInterval?: BillingInterval;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  returnUrl?: string;
  notifyUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentOrderResult {
  orderId: string;
  paymentSessionId?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PaymentVerificationResult {
  orderId: string;
  paymentId?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod?: string;
  paidAt?: Date;
  rawResponse?: any;
}

export interface WebhookVerificationParams {
  headers: Record<string, string | string[] | undefined>;
  rawBody: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  eventId?: string;
  eventType?: string;
  orderId?: string;
  paymentId?: string;
  status?: PaymentStatus;
  amount?: number;
  occurredAt?: Date;
  rawPayload?: any;
}

export interface RefundParams {
  orderId: string;
  paymentId?: string;
  amount: number;
  reason?: string;
}

export interface RefundResult {
  refundId: string;
  orderId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  currency: string;
  processedAt?: Date;
}

/**
 * Common Contract for all Payment Gateway Providers (Cashfree, Razorpay, etc.)
 */
export interface PaymentProvider {
  readonly providerName: string;

  /** Check if the provider is fully configured with credentials */
  isConfigured(): boolean;

  /** Create an order on the payment gateway */
  createOrder(params: CreateOrderParams): Promise<PaymentOrderResult>;

  /** Fetch current order state from the gateway */
  fetchOrder(orderId: string): Promise<PaymentOrderResult>;

  /** Server-side verification of payment */
  verifyPayment(orderId: string): Promise<PaymentVerificationResult>;

  /** Verify and parse incoming webhook signatures */
  processWebhook(params: WebhookVerificationParams): Promise<WebhookVerificationResult>;

  /** Process refund request */
  refundPayment(params: RefundParams): Promise<RefundResult>;

  /** Normalize provider-specific statuses to internal PaymentStatus */
  normalizeStatus(rawStatus: string): PaymentStatus;
}
