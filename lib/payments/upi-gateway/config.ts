import service from "../../../service.mjs";
import { UpiGatewayConfig } from "./types";

let cachedCredentials: { apiKey: string; apiSecret: string; webhookSecret: string } | undefined;

function gatewayCredentials() {
  if (!cachedCredentials) {
    // Read at request time through the service input, never process.env.
    cachedCredentials = {
      apiKey: service.input().UPI_GATEWAY_API_KEY.expose(),
      apiSecret: service.input().UPI_GATEWAY_API_SECRET.expose(),
      webhookSecret: service.input().UPI_GATEWAY_WEBHOOK_SECRET.expose(),
    };
  }
  return cachedCredentials;
}

export function getUpiGatewayConfig(): UpiGatewayConfig {
  const { apiKey, apiSecret, webhookSecret } = gatewayCredentials();
  const baseUrl = (process.env.UPI_GATEWAY_BASE_URL || "https://payments.yourdomain.com").replace(
    /\/+$/,
    ""
  );
  const sandboxMode = process.env.UPI_GATEWAY_SANDBOX_MODE !== "false";
  const timeoutMs = parseInt(process.env.UPI_GATEWAY_TIMEOUT_MS || "10000", 10);

  // Personal Receiving Account Configuration
  const receivingUpiId = process.env.UPI_RECEIVING_ID || "jainaradhy123@okicici";
  const payeeName = process.env.UPI_PAYEE_NAME || "Aradhy Jain";
  const upiApp = process.env.UPI_APPLICATION || "Google Pay";
  const upiBank = process.env.UPI_BANK || "ICICI Bank";

  return {
    baseUrl,
    apiKey,
    apiSecret,
    webhookSecret,
    sandboxMode,
    timeoutMs,
    receivingUpiId,
    payeeName,
    upiApp,
    upiBank,
  };
}

/**
 * Returns public receiving UPI account coordinates for student checkouts
 */
export function getReceivingAccountInfo() {
  const cfg = getUpiGatewayConfig();
  return {
    upiId: cfg.receivingUpiId,
    payeeName: cfg.payeeName,
    app: cfg.upiApp,
    bank: cfg.upiBank,
    isPersonalAccount: true,
    verificationMethod: "MANUAL_UTR_AND_WEBHOOK",
  };
}

/**
 * Masks sensitive secrets for secure debugging and audit logs
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return "[NOT_SET]";
  if (secret.length <= 8) return "********";
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
