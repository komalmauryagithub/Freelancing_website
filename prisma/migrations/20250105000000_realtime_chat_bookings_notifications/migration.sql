-- AlterTable Booking
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "googleEventId" TEXT;

-- AlterTable Message
ALTER TABLE "Message" ALTER COLUMN "receiverId" DROP NOT NULL;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentSize" INTEGER;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "attachmentType" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- Update foreign keys on Message
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_receiverId_fkey";
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_projectRequestId_fkey";
ALTER TABLE "Message" ADD CONSTRAINT "Message_projectRequestId_fkey" FOREIGN KEY ("projectRequestId") REFERENCES "ProjectRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Index
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

-- AlterTable Notification
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- Create Index
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");
