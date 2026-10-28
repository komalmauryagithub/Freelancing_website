-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROPOSAL_SENT';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'WON';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'LOST';

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable Lead
ALTER TABLE "Lead" ADD COLUMN "referenceNumber" TEXT;
ALTER TABLE "Lead" ADD COLUMN "phone" TEXT;
ALTER TABLE "Lead" ADD COLUMN "projectType" TEXT;
ALTER TABLE "Lead" ADD COLUMN "selectedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Lead" ADD COLUMN "requirements" TEXT;
ALTER TABLE "Lead" ADD COLUMN "indicativeBudget" TEXT;
ALTER TABLE "Lead" ADD COLUMN "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Lead" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "Lead" ADD COLUMN "followUpDate" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "convertedProjectId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "convertedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "idempotencyKey" TEXT;

-- Update existing leads to have reference numbers if any exist
UPDATE "Lead" SET "referenceNumber" = 'REF-' || SUBSTRING("id", 1, 8) WHERE "referenceNumber" IS NULL;
ALTER TABLE "Lead" ALTER COLUMN "referenceNumber" SET NOT NULL;

-- AlterTable ProjectRequest
ALTER TABLE "ProjectRequest" ADD COLUMN "referenceNumber" TEXT;
ALTER TABLE "ProjectRequest" ADD COLUMN "projectType" TEXT;
ALTER TABLE "ProjectRequest" ADD COLUMN "selectedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ProjectRequest" ADD COLUMN "idempotencyKey" TEXT;

-- CreateTable Quotation
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "leadId" TEXT,
    "projectRequestId" TEXT,
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validUntil" TIMESTAMP(3) NOT NULL,
    "estimatedTimeline" TEXT NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable QuotationLineItem
CREATE TABLE "QuotationLineItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuotationLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable QuotationAuditLog
CREATE TABLE "QuotationAuditLog" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotationAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_referenceNumber_key" ON "Lead"("referenceNumber");
CREATE UNIQUE INDEX "Lead_idempotencyKey_key" ON "Lead"("idempotencyKey");
CREATE INDEX "Lead_referenceNumber_idx" ON "Lead"("referenceNumber");
CREATE INDEX "Lead_projectType_idx" ON "Lead"("projectType");

CREATE UNIQUE INDEX "ProjectRequest_referenceNumber_key" ON "ProjectRequest"("referenceNumber");
CREATE UNIQUE INDEX "ProjectRequest_idempotencyKey_key" ON "ProjectRequest"("idempotencyKey");
CREATE INDEX "ProjectRequest_referenceNumber_idx" ON "ProjectRequest"("referenceNumber");

CREATE UNIQUE INDEX "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");
CREATE INDEX "Quotation_quotationNumber_idx" ON "Quotation"("quotationNumber");
CREATE INDEX "Quotation_leadId_idx" ON "Quotation"("leadId");
CREATE INDEX "Quotation_projectRequestId_idx" ON "Quotation"("projectRequestId");
CREATE INDEX "Quotation_status_idx" ON "Quotation"("status");

CREATE INDEX "QuotationLineItem_quotationId_idx" ON "QuotationLineItem"("quotationId");

CREATE INDEX "QuotationAuditLog_quotationId_idx" ON "QuotationAuditLog"("quotationId");
CREATE INDEX "QuotationAuditLog_action_idx" ON "QuotationAuditLog"("action");
CREATE INDEX "QuotationAuditLog_createdAt_idx" ON "QuotationAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuotationLineItem" ADD CONSTRAINT "QuotationLineItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuotationAuditLog" ADD CONSTRAINT "QuotationAuditLog_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
