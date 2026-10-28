-- Phase 7 Migration: Invoices, Invoice Line Items, Invoice Audit Logs, Razorpay Payments, and Webhook Idempotency

-- AlterEnum
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';

-- AlterTable Invoice
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "quotationId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "milestoneId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "issuedAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "clientName" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "clientEmail" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "clientAddress" TEXT;

-- Foreign Keys on Invoice
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_quotationId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_milestoneId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes on Invoice
CREATE INDEX IF NOT EXISTS "Invoice_quotationId_idx" ON "Invoice"("quotationId");
CREATE INDEX IF NOT EXISTS "Invoice_milestoneId_idx" ON "Invoice"("milestoneId");
CREATE INDEX IF NOT EXISTS "Invoice_userId_idx" ON "Invoice"("userId");

-- CreateTable InvoiceLineItem
CREATE TABLE IF NOT EXISTS "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InvoiceLineItem_invoiceId_idx" ON "InvoiceLineItem"("invoiceId");
ALTER TABLE "InvoiceLineItem" DROP CONSTRAINT IF EXISTS "InvoiceLineItem_invoiceId_fkey";
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable InvoiceAuditLog
CREATE TABLE IF NOT EXISTS "InvoiceAuditLog" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" "InvoiceStatus",
    "toStatus" "InvoiceStatus",
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InvoiceAuditLog_invoiceId_idx" ON "InvoiceAuditLog"("invoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceAuditLog_action_idx" ON "InvoiceAuditLog"("action");
CREATE INDEX IF NOT EXISTS "InvoiceAuditLog_createdAt_idx" ON "InvoiceAuditLog"("createdAt");
ALTER TABLE "InvoiceAuditLog" DROP CONSTRAINT IF EXISTS "InvoiceAuditLog_invoiceId_fkey";
ALTER TABLE "InvoiceAuditLog" ADD CONSTRAINT "InvoiceAuditLog_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Payment
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "failureReason" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "refundRef" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "metadata" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "Payment_transactionRef_idx" ON "Payment"("transactionRef");
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateTable ProcessedWebhookEvent
CREATE TABLE IF NOT EXISTS "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "eventType" TEXT NOT NULL,
    "payload" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProcessedWebhookEvent_eventId_key" ON "ProcessedWebhookEvent"("eventId");
CREATE INDEX IF NOT EXISTS "ProcessedWebhookEvent_eventId_idx" ON "ProcessedWebhookEvent"("eventId");
CREATE INDEX IF NOT EXISTS "ProcessedWebhookEvent_provider_idx" ON "ProcessedWebhookEvent"("provider");
