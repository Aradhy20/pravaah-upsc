/**
 * Official Cashfree Payment Gateway Provider
 * Pravaah UPSC
 *
 * Implements Cashfree Payment Gateway v2023-08-01:
 * - Create Order with hosted web checkout session
 * - Fetch Order Status & Payments from Cashfree PG Server API
 * - Server-side Payment Verification
 * - HMAC-SHA256 Webhook Signature Verification with Replay Attack Guard
 * - Refund Processing
 */

import crypto from "crypto";
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

  /**
   * Helper to execute authenticated requests to Cashfree PG API.
   */
  private async requestCashfree<T = any>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: any
  ): Promise<T> {
    const config = getCashfreeConfig();
    if (!config.isConfigured) {
      throw new PaymentGatewayNotConfiguredError(
        "Cashfree Payment Gateway is not configured. Missing CASHFREE_CLIENT_ID or CASHFREE_CLIENT_SECRET."
      );
    }

    const url = `${config.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const requestId = crypto.randomUUID();

    const headers: Record<string, string> = {
      "x-client-id": config.clientId,
      "x-client-secret": config.clientSecret,
      "x-api-version": config.apiVersion,
      "Content-Type": "application/json",
      "x-request-id": requestId,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        responseData?.message ||
        responseData?.error ||
        `Cashfree API error (${response.status}: ${response.statusText})`;
      const err = new Error(errorMsg);
      (err as any).status = response.status;
      (err as any).data = responseData;
      throw err;
    }

    return responseData as T;
  }

  /**
   * Creates a Cashfree payment order with hosted web checkout session ID.
   */
  async createOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
    const config = getCashfreeConfig();
    if (!config.isConfigured) {
      throw new PaymentGatewayNotConfiguredError();
    }

    // Format phone: must be valid 10 digits; default to safe test phone if invalid
    let phone = (params.customerPhone || "").replace(/[^0-9]/g, "");
    if (phone.length === 12 && phone.startsWith("91")) {
      phone = phone.slice(2);
    }
    if (phone.length !== 10) {
      phone = "9999999999";
    }

    const returnUrl =
      params.returnUrl ||
      `${config.appUrl}/checkout/status?order_id={order_id}`;

    const notifyUrl =
      params.notifyUrl ||
      `${config.appUrl}/api/webhooks/cashfree`;

    const payload = {
      order_id: params.orderId,
      order_amount: Math.round(params.amount * 100) / 100,
      order_currency: params.currency || "INR",
      customer_details: {
        customer_id: params.userId,
        customer_name: params.customerName || "UPSC Aspirant",
        customer_email: params.customerEmail,
        customer_phone: phone,
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl,
        payment_methods: "cc,dc,upi,nb,wallet",
      },
      order_note: `Pravaah UPSC ${params.productId} (${params.billingInterval || "SUBSCRIPTION"})`,
      order_tags: {
        userId: params.userId,
        planCode: params.productId,
        billingInterval: params.billingInterval || "MONTHLY",
        ...(params.metadata || {}),
      },
    };

    const cfOrder = await this.requestCashfree("/orders", "POST", payload);

    return {
      orderId: cfOrder.order_id || params.orderId,
      paymentSessionId: cfOrder.payment_session_id,
      checkoutUrl: cfOrder.payment_session_id
        ? `${config.baseUrl.includes("sandbox") ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg"}/checkout?payment_session_id=${cfOrder.payment_session_id}`
        : undefined,
      amount: cfOrder.order_amount || params.amount,
      currency: cfOrder.order_currency || "INR",
      status: this.normalizeStatus(cfOrder.order_status),
      provider: "CASHFREE",
      createdAt: cfOrder.created_at ? new Date(cfOrder.created_at) : new Date(),
      expiresAt: cfOrder.order_expiry_time ? new Date(cfOrder.order_expiry_time) : undefined,
    };
  }

  /**
   * Fetches the current state of an order from Cashfree PG API.
   */
  async fetchOrder(orderId: string): Promise<PaymentOrderResult> {
    const cfOrder = await this.requestCashfree(`/orders/${orderId}`, "GET");

    return {
      orderId: cfOrder.order_id,
      paymentSessionId: cfOrder.payment_session_id,
      amount: cfOrder.order_amount,
      currency: cfOrder.order_currency,
      status: this.normalizeStatus(cfOrder.order_status),
      provider: "CASHFREE",
      createdAt: cfOrder.created_at ? new Date(cfOrder.created_at) : new Date(),
      expiresAt: cfOrder.order_expiry_time ? new Date(cfOrder.order_expiry_time) : undefined,
    };
  }

  /**
   * Performs server-side payment verification for an order.
   * Validates both order status and individual payment attempt status.
   */
  async verifyPayment(orderId: string): Promise<PaymentVerificationResult> {
    // 1. Fetch order details
    const cfOrder = await this.requestCashfree(`/orders/${orderId}`, "GET");

    // 2. Fetch payments for this order
    let payments: any[] = [];
    try {
      payments = await this.requestCashfree(`/orders/${orderId}/payments`, "GET");
    } catch {
      payments = [];
    }

    // Identify successful payment
    const successfulPayment = Array.isArray(payments)
      ? payments.find((p) => (p.payment_status || "").toUpperCase() === "SUCCESS")
      : null;

    const latestPayment = Array.isArray(payments) && payments.length > 0 ? payments[0] : null;
    const payment = successfulPayment || latestPayment;

    let paymentMethod: string | undefined;
    if (payment?.payment_method) {
      if (typeof payment.payment_method === "string") {
        paymentMethod = payment.payment_method;
      } else if (typeof payment.payment_method === "object") {
        const keys = Object.keys(payment.payment_method);
        paymentMethod = keys.length > 0 ? keys[0] : "ONLINE";
      }
    }

    const rawStatus = successfulPayment
      ? "SUCCESS"
      : (cfOrder.order_status || payment?.payment_status || "PENDING");

    return {
      orderId: cfOrder.order_id,
      paymentId: payment?.cf_payment_id ? String(payment.cf_payment_id) : undefined,
      status: this.normalizeStatus(rawStatus),
      amount: cfOrder.order_amount,
      currency: cfOrder.order_currency,
      paymentMethod,
      paidAt: payment?.payment_time ? new Date(payment.payment_time) : undefined,
      rawResponse: {
        order: cfOrder,
        payment,
      },
    };
  }

  /**
   * Verifies incoming webhook signature and extracts event payload.
   * Official Cashfree Signature Algorithm:
   * signature = HMAC_SHA256(timestamp + rawBody, secret) formatted as Base64.
   */
  async processWebhook(params: WebhookVerificationParams): Promise<WebhookVerificationResult> {
    const config = getCashfreeConfig();
    const headers = params.headers || {};

    const rawTimestamp =
      headers["x-webhook-timestamp"] ||
      headers["X-Webhook-Timestamp"] ||
      headers["x-timestamp"] ||
      "";

    const timestamp = Array.isArray(rawTimestamp) ? rawTimestamp[0] : String(rawTimestamp || "");

    const rawSignature =
      headers["x-webhook-signature"] ||
      headers["X-Webhook-Signature"] ||
      headers["x-signature"] ||
      "";

    const signature = Array.isArray(rawSignature) ? rawSignature[0] : String(rawSignature || "");

    if (!timestamp || !signature) {
      return {
        isValid: false,
        error: "Missing required Cashfree webhook signature headers (x-webhook-timestamp, x-webhook-signature)",
      };
    }

    // Replay attack prevention: timestamp must be within 5 minutes (300 seconds)
    const timestampNumber = Number(timestamp);
    if (!isNaN(timestampNumber)) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const diffSeconds = Math.abs(nowSeconds - timestampNumber);
      // If timestamp is in milliseconds, handle that as well
      const isMilli = timestampNumber > 1e11;
      const actualDiff = isMilli
        ? Math.abs(Date.now() - timestampNumber) / 1000
        : diffSeconds;

      if (actualDiff > 300) {
        return {
          isValid: false,
          error: `Webhook timestamp rejected: potential replay attack (${Math.round(actualDiff)}s drift)`,
        };
      }
    }

    // Verify HMAC-SHA256 signature
    const secret = config.webhookSecret || config.clientSecret;
    if (!secret) {
      return {
        isValid: false,
        error: "Webhook verification failed: secret key not configured on server",
      };
    }

    const payloadToSign = timestamp + params.rawBody;
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadToSign)
      .digest("base64");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(computedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return {
        isValid: false,
        error: "Invalid webhook signature: signature mismatch",
      };
    }

    // Parse JSON body safely
    let parsed: any;
    try {
      parsed = JSON.parse(params.rawBody);
    } catch {
      return {
        isValid: false,
        error: "Invalid webhook payload: JSON parse failure",
      };
    }

    const eventType = parsed.type || parsed.event || "UNKNOWN";
    const data = parsed.data || {};
    const order = data.order || {};
    const payment = data.payment || {};

    const orderId = order.order_id || data.order_id;
    const paymentId = payment.cf_payment_id ? String(payment.cf_payment_id) : undefined;
    const rawStatus = payment.payment_status || order.order_status || "PENDING";
    const amount = order.order_amount || payment.payment_amount;

    return {
      isValid: true,
      eventId: parsed.event_time || String(Date.now()),
      eventType,
      orderId,
      paymentId,
      status: this.normalizeStatus(rawStatus),
      amount,
      occurredAt: parsed.event_time ? new Date(parsed.event_time) : new Date(),
      rawPayload: parsed,
    };
  }

  /**
   * Processes a refund via Cashfree PG API.
   */
  async refundPayment(params: RefundParams): Promise<RefundResult> {
    const config = getCashfreeConfig();
    if (!config.isConfigured) {
      throw new PaymentGatewayNotConfiguredError();
    }

    const refundId = `REFUND_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const payload = {
      refund_id: refundId,
      refund_amount: params.amount,
      refund_note: params.reason || "Customer refund request",
    };

    const result = await this.requestCashfree(
      `/orders/${params.orderId}/refunds`,
      "POST",
      payload
    );

    return {
      refundId: result.refund_id || refundId,
      orderId: params.orderId,
      status:
        (result.refund_status || "").toUpperCase() === "SUCCESS"
          ? "SUCCESS"
          : "PENDING",
      amount: result.refund_amount || params.amount,
      currency: result.refund_currency || "INR",
      processedAt: result.created_at ? new Date(result.created_at) : new Date(),
    };
  }

  normalizeStatus(rawStatus: string): PaymentStatus {
    return normalizePaymentStatus(rawStatus);
  }
}
