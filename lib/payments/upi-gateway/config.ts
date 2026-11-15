import { UpiGatewayConfig } from "./types";

export function getUpiGatewayConfig(): UpiGatewayConfig {
  const baseUrl = (process.env.UPI_GATEWAY_BASE_URL || "https://payments.yourdomain.com").replace(
    /\/+$/,
    ""
  );
  const apiKey = process.env.UPI_GATEWAY_API_KEY || "test_key_pravaah_sandbox";
  const apiSecret = process.env.UPI_GATEWAY_API_SECRET || "test_sec_pravaah_sandbox";
  const webhookSecret = process.env.UPI_GATEWAY_WEBHOOK_SECRET || "whsec_pravaah_upi_sandbox_2026";
  const sandboxMode = process.env.UPI_GATEWAY_SANDBOX_MODE !== "false";
  const timeoutMs = parseInt(process.env.UPI_GATEWAY_TIMEOUT_MS || "10000", 10);

  return {
    baseUrl,
    apiKey,
    apiSecret,
    webhookSecret,
    sandboxMode,
    timeoutMs,
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
