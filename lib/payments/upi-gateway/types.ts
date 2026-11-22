export type GatewayEnvironment = "live" | "sandbox";

export type PaymentOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "EXPIRED"
  | "UNDER_REVIEW"
  | "REFUNDED";

export type ProductType =
  | "SUBSCRIPTION"
  | "TEST_SERIES"
  | "MAINS_EVALUATION"
  | "CURRENT_AFFAIRS"
  | "COURSE";

export interface UpiGatewayConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
  sandboxMode: boolean;
  timeoutMs: number;
  receivingUpiId: string;
  payeeName: string;
  upiApp: string;
  upiBank: string;
}

export interface CreateGatewayOrderRequest {
  amount: number;
  client_order_id: string;
}

export interface GatewayOrderData {
  order_id: string;
  client_order_id: string;
  amount: string | number;
  currency: string;
  status: string; // "pending" | "paid" | "expired" | "failed" | "under_review"
  environment: GatewayEnvironment;
  test: boolean;
  payment_url?: string;
  upi_intent?: string;
  utr?: string;
  expires_at?: string;
  paid_at?: string;
}

export interface GatewayApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
  message?: string;
}

export interface UpiWebhookPayload {
  event_id: string;
  event_sequence?: number;
  occurred_at?: string;
  event: string; // "order.paid" | "order.expired" | "order.under_review" | "order.failed"
  data: GatewayOrderData;
}

export interface InitiatePaymentParams {
  userId: string;
  productType: ProductType;
  productId: string; // Plan code e.g. "ACHIEVER", or Test ID
  billingInterval?: "MONTHLY" | "QUARTERLY" | "ANNUAL";
  metadata?: Record<string, any>;
  forceNew?: boolean;
}

export interface CheckoutResultData {
  orderId: string; // internal clientOrderId
  gatewayOrderId?: string;
  productType: ProductType;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  baseAmount: number;
  gstAmount: number;
  gstRatePercent: number;
  paymentUrl?: string;
  upiIntent?: string;
  receivingUpiId?: string;
  payeeName?: string;
  qrPayload?: string;
  expiresAt?: string;
  isSandbox: boolean;
}
