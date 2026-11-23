/**
 * Payment System Configuration & Feature Flag Controller
 * Pravaah UPSC — Cashfree-Ready Architecture
 */

export const PAYMENTS_DISABLED_MESSAGE =
  "Online payments are temporarily unavailable while our secure payment system is being configured. Please check back soon.";

export interface CashfreeConfig {
  isConfigured: boolean;
  clientId?: string;
  clientSecret?: string;
  environment: "TEST" | "PROD";
  apiVersion: string;
  webhookSecret?: string;
  appUrl: string;
}

/**
 * Master kill switch for paid checkout.
 * Set to FALSE until Cashfree merchant onboarding is approved and credentials provided.
 */
export function isPaymentSystemEnabled(): boolean {
  // Hardcoded to false while Cashfree merchant account is under review
  if (process.env.ENABLE_PAYMENTS !== "true") {
    return false;
  }
  // Even if flag is toggled, require full Cashfree credentials
  const cashfree = getCashfreeConfig();
  return cashfree.isConfigured;
}

/**
 * Cashfree configuration contract inspector.
 * Validates presence of server-side secrets without exposing them.
 */
export function getCashfreeConfig(): CashfreeConfig {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const environment = process.env.CASHFREE_ENVIRONMENT?.toUpperCase() === "PROD" ? "PROD" : "TEST";
  const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pravaah-upsc.vercel.app";

  const isConfigured = Boolean(
    clientId &&
      clientSecret &&
      clientId.trim().length > 0 &&
      clientSecret.trim().length > 0 &&
      !clientId.includes("fake_") &&
      !clientSecret.includes("fake_")
  );

  return {
    isConfigured,
    clientId,
    clientSecret,
    environment,
    apiVersion,
    webhookSecret,
    appUrl,
  };
}
