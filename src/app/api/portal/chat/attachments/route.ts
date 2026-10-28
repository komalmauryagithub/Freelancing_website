import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { logger } from "@/lib/logger";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".zip",
  ".docx",
  ".txt",
  ".json",
  ".csv",
]);

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No attachment provided", 400, undefined, "FILE_MISSING");
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      return apiError("Attachment exceeds the 15MB limit", 400, undefined, "FILE_TOO_LARGE");
    }

    const originalName = file.name || "attachment";
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTS.has(ext)) {
      return apiError(
        `Extension '${ext}' is not permitted. Allowed: ${Array.from(ALLOWED_EXTS).join(", ")}`,
        400,
        undefined,
        "INVALID_FILE_TYPE"
      );
    }

    // Protected attachments directory
    const attachDir = path.join(process.cwd(), "public", "uploads", "chat");
    await fs.mkdir(attachDir, { recursive: true });

    const randomHex = crypto.randomBytes(12).toString("hex");
    const safeFilename = `${Date.now()}-${randomHex}${ext}`;
    const targetPath = path.join(attachDir, safeFilename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(targetPath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/chat/${safeFilename}`;

    logger.info(
      "ChatAttachmentUploaded",
      `User ${user.id} uploaded chat attachment: ${originalName} (${file.size} bytes)`
    );

    return apiSuccess(
      {
        url: publicUrl,
        name: originalName,
        size: file.size,
        type: file.type || "application/octet-stream",
      },
      201,
      "Attachment uploaded successfully"
    );
  } catch (error) {
    return handleApiError(error, "POST /api/portal/chat/attachments");
  }
}
