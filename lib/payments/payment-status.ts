/**
 * Standard Payment Status Constants and Normalization Helpers
 */

import { PaymentStatus } from "./payment-types";

export const PAYMENT_STATUS = {
  PENDING: "PENDING" as const,
  PROCESSING: "PROCESSING" as const,
  PAID: "PAID" as const,
  FAILED: "FAILED" as const,
  CANCELLED: "CANCELLED" as const,
  EXPIRED: "EXPIRED" as const,
  REFUNDED: "REFUNDED" as const,
  USER_DROPPED: "USER_DROPPED" as const,
};

/**
 * Normalizes payment statuses from various gateway representations
 * into canonical Pravaah UPSC PaymentStatus.
 */
export function normalizePaymentStatus(rawStatus: string | undefined | null): PaymentStatus {
  if (!rawStatus) return "PENDING";

  const upper = rawStatus.trim().toUpperCase();

  switch (upper) {
    case "PAID":
    case "SUCCESS":
    case "SUCCEEDED":
    case "CHARGED":
    case "COMPLETED":
      return "PAID";

    case "PENDING":
    case "ACTIVE":
    case "CREATED":
    case "INITIATED":
      return "PENDING";

    case "PROCESSING":
    case "UNDER_REVIEW":
    case "IN_PROGRESS":
      return "PROCESSING";

    case "FAILED":
    case "ERROR":
    case "DECLINED":
    case "REJECTED":
      return "FAILED";

    case "CANCELLED":
    case "CANCELED":
    case "TERMINATED":
      return "CANCELLED";

    case "EXPIRED":
    case "TIMEOUT":
      return "EXPIRED";

    case "REFUNDED":
    case "REVERSED":
      return "REFUNDED";

    case "USER_DROPPED":
    case "DROPPED":
    case "ABANDONED":
      return "USER_DROPPED";

    default:
      return "PENDING";
  }
}
