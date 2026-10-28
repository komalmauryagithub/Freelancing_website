-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('ENQUIRY', 'DISCUSSION', 'QUOTATION', 'APPROVED', 'DEVELOPMENT', 'REVIEW', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED');

-- AlterTable ProjectRequest
ALTER TABLE "ProjectRequest" ADD COLUMN "stage" "ProjectStage" NOT NULL DEFAULT 'ENQUIRY';
ALTER TABLE "ProjectRequest" ADD COLUMN "productionUrl" TEXT;
ALTER TABLE "ProjectRequest" ADD COLUMN "repositoryUrl" TEXT;
ALTER TABLE "ProjectRequest" ADD COLUMN "handoverNotes" TEXT;

-- AlterTable Milestone
ALTER TABLE "Milestone" ADD COLUMN "projectRequestId" TEXT;
ALTER TABLE "Milestone" ADD COLUMN "plannedDate" TIMESTAMP(3);
ALTER TABLE "Milestone" ADD COLUMN "progressPercentage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Milestone" ALTER COLUMN "proposalId" DROP NOT NULL;
ALTER TABLE "Milestone" ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateTable ProjectStageHistory
CREATE TABLE "ProjectStageHistory" (
    "id" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "stage" "ProjectStage" NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProjectDocument
CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "downloadToken" TEXT,
    "downloadTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable ChangeRequest
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "projectRequestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impactAssessment" TEXT,
    "additionalCost" DOUBLE PRECISION,
    "additionalDays" INTEGER,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectRequest_stage_idx" ON "ProjectRequest"("stage");

CREATE INDEX "Milestone_projectRequestId_idx" ON "Milestone"("projectRequestId");

CREATE INDEX "ProjectStageHistory_projectRequestId_idx" ON "ProjectStageHistory"("projectRequestId");
CREATE INDEX "ProjectStageHistory_stage_idx" ON "ProjectStageHistory"("stage");
CREATE INDEX "ProjectStageHistory_createdAt_idx" ON "ProjectStageHistory"("createdAt");

CREATE UNIQUE INDEX "ProjectDocument_downloadToken_key" ON "ProjectDocument"("downloadToken");
CREATE INDEX "ProjectDocument_projectRequestId_idx" ON "ProjectDocument"("projectRequestId");
CREATE INDEX "ProjectDocument_downloadToken_idx" ON "ProjectDocument"("downloadToken");

CREATE INDEX "ChangeRequest_projectRequestId_idx" ON "ChangeRequest"("projectRequestId");
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectStageHistory" ADD CONSTRAINT "ProjectStageHistory_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
