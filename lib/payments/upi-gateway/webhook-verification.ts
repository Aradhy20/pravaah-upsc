import crypto from "crypto";
import { WebhookVerificationError } from "./errors";

export interface VerifyWebhookSignatureOptions {
  signatureHeader: string | null | undefined;
  rawBody: string;
  secret: string;
  toleranceSeconds?: number;
}

export interface VerificationResult {
  isValid: boolean;
  timestamp?: number;
  error?: string;
}

/**
 * Validates HMAC-SHA256 timestamped signatures from UPI Gateway webhook deliveries.
 * Specification: X-Signature: t=UNIX_TIMESTAMP,v1=HMAC_SHA256
 * Signed payload: timestamp + "." + exact_raw_request_body
 */
export function verifyWebhookSignature({
  signatureHeader,
  rawBody,
  secret,
  toleranceSeconds = 300,
}: VerifyWebhookSignatureOptions): VerificationResult {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    return {
      isValid: false,
      error: "Missing or malformed X-Signature header",
    };
  }

  if (!secret || typeof secret !== "string") {
    return {
      isValid: false,
      error: "Webhook signing secret is not configured",
    };
  }

  // 1. Parse t=... and v1=... via strict regex
  const match = signatureHeader.trim().match(/^t=(\d+),v1=([a-f0-9]{64})$/);
  if (!match) {
    return {
      isValid: false,
      error: "Invalid X-Signature format. Expected: t=<timestamp>,v1=<64-char-hex-hmac>",
    };
  }

  const [, timestampStr, signature] = match;
  const timestamp = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);

  // 2. Validate timestamp against replay attacks (default: 5 minutes / 300 seconds)
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return {
      isValid: false,
      timestamp,
      error: `Webhook timestamp expired or in the future. Drift: ${Math.abs(now - timestamp)}s (max allowed: ${toleranceSeconds}s)`,
    };
  }

  // 3. Compute expected HMAC-SHA256 over `${timestamp}.${rawBody}`
  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // 4. Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return {
      isValid: false,
      timestamp,
      error: "Signature length mismatch",
    };
  }

  const isMatch = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  if (!isMatch) {
    return {
      isValid: false,
      timestamp,
      error: "HMAC signature mismatch",
    };
  }

  return {
    isValid: true,
    timestamp,
  };
}

/**
 * Helper to compute a valid test signature for unit/integration tests
 */
export function generateTestWebhookSignature(
  rawBody: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000)
): string {
  const signedPayload = `${timestamp}.${rawBody}`;
  const hmac = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${timestamp},v1=${hmac}`;
}
