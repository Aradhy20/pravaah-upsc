/**
 * Payment System Configuration & Feature Flag Controller
 * Pravaah UPSC — Official Cashfree Payments Gateway Architecture
 */

export const PAYMENTS_DISABLED_MESSAGE =
  "Online payments are temporarily unavailable while our secure payment system is being configured. Please check back soon.";

export interface CashfreeConfig {
  isConfigured: boolean;
  clientId: string;
  clientSecret: string;
  environment: "TEST" | "PROD";
  apiVersion: string;
  webhookSecret: string;
  appUrl: string;
  baseUrl: string;
}

/**
 * Returns true if Cashfree payments are configured and enabled.
 * Strictly requires ENABLE_PAYMENTS="true" and complete credentials.
 * Defaults to false for launch beta safety.
 */
export function isPaymentSystemEnabled(): boolean {
  if (process.env.ENABLE_PAYMENTS !== "true") {
    return false;
  }
  const cashfree = getCashfreeConfig();
  return cashfree.isConfigured;
}

/**
 * Cashfree configuration inspector.
 * Validates presence of server-side credentials and returns environment-specific endpoints.
 */
export function getCashfreeConfig(): CashfreeConfig {
  const clientId = process.env.CASHFREE_CLIENT_ID || "";
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET || "";
  const envRaw = (
    process.env.CASHFREE_ENVIRONMENT ||
    process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT ||
    "sandbox"
  ).toUpperCase();

  let environment: "TEST" | "PROD" =
    envRaw === "PROD" || envRaw === "PRODUCTION" ? "PROD" : "TEST";

  // Auto-detect production key format
  if (clientSecret.startsWith("cfsk_ma_prod_") && envRaw !== "TEST" && envRaw !== "SANDBOX") {
    environment = "PROD";
  }

  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || clientSecret;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://pravaah-upsc.vercel.app");

  const baseUrl =
    environment === "PROD"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

  const isConfigured = Boolean(
    clientId &&
      clientSecret &&
      clientId.trim().length > 0 &&
      clientSecret.trim().length > 0 &&
      !clientId.startsWith("fake_") &&
      !clientSecret.startsWith("fake_")
  );

  return {
    isConfigured,
    clientId,
    clientSecret,
    environment,
    apiVersion,
    webhookSecret,
    appUrl,
    baseUrl,
  };
}
