import { NextRequest, NextResponse } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".zip",
  ".docx",
  ".txt",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return apiError("No file provided in request.", 400, undefined, "FILE_MISSING");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return apiError(
        "File size exceeds the 10MB limit.",
        400,
        undefined,
        "FILE_TOO_LARGE"
      );
    }

    const originalName = file.name || "upload";
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return apiError(
        `File extension '${ext}' is not permitted. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
        400,
        undefined,
        "INVALID_FILE_TYPE"
      );
    }

    // Generate secure randomized filename to prevent path traversal
    const randomHex = crypto.randomBytes(16).toString("hex");
    const sanitizedSafeName = `${Date.now()}-${randomHex}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, sanitizedSafeName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    logger.info("FileUpload", `Stored attachment: ${sanitizedSafeName} (${file.size} bytes)`);

    const fileUrl = `/uploads/${sanitizedSafeName}`;

    return apiSuccess(
      {
        url: fileUrl,
        filename: originalName,
        size: file.size,
      },
      201,
      "File uploaded successfully"
    );
  } catch (error) {
    return handleApiError(error, "POST /api/upload");
  }
}
