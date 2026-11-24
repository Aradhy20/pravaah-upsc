-- AlterTable
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "cashfreeOrderId" TEXT;
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "cashfreePaymentId" TEXT;
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "paymentSessionId" TEXT;
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "planId" TEXT;
ALTER TABLE "PaymentOrder" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentOrder_cashfreeOrderId_key" ON "PaymentOrder"("cashfreeOrderId");
CREATE INDEX IF NOT EXISTS "PaymentOrder_cashfreeOrderId_idx" ON "PaymentOrder"("cashfreeOrderId");
