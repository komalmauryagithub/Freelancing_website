import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { logger } from "@/lib/logger";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const MAX_DOC_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".json",
  ".fig",
]);

const attachDocSchema = z.object({
  name: z.string().min(2),
  filePath: z.string().min(1),
  fileSize: z.number().int().default(1024),
  mimeType: z.string().default("application/octet-stream"),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const project = await prisma.projectRequest.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const documentName = (formData.get("name") as string) || file?.name || "Document";

      if (!file) {
        return apiError("No document file provided", 400, undefined, "FILE_MISSING");
      }

      if (file.size > MAX_DOC_SIZE_BYTES) {
        return apiError("Document size exceeds the 25MB limit", 400, undefined, "FILE_TOO_LARGE");
      }

      const originalName = file.name || "document.pdf";
      const ext = path.extname(originalName).toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return apiError(
          `Extension '${ext}' not permitted for project documents. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
          400,
          undefined,
          "INVALID_FILE_TYPE"
        );
      }

      // Secure storage directory outside public web root
      const secureDocsDir = path.join(process.cwd(), "storage", "documents");
      await fs.mkdir(secureDocsDir, { recursive: true });

      const randomToken = crypto.randomBytes(16).toString("hex");
      const safeFilename = `${Date.now()}-${randomToken}${ext}`;
      const fullPath = path.join(secureDocsDir, safeFilename);

      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

      const document = await prisma.projectDocument.create({
        data: {
          projectRequestId: id,
          name: documentName,
          filePath: path.relative(process.cwd(), fullPath),
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          uploadedBy: user.name,
        },
      });

      logger.info(
        "ProjectDocumentAttached",
        `Admin ${user.name} attached document ${document.name} to project ${id}`
      );

      return apiSuccess(document, 201, "Document attached successfully");
    } else {
      // JSON payload attachment
      const body = await request.json();
      const validatedData = attachDocSchema.parse(body);

      const document = await prisma.projectDocument.create({
        data: {
          projectRequestId: id,
          name: validatedData.name,
          filePath: validatedData.filePath,
          fileSize: validatedData.fileSize,
          mimeType: validatedData.mimeType,
          uploadedBy: user.name,
        },
      });

      return apiSuccess(document, 201, "Document record registered successfully");
    }
  } catch (error) {
    return handleApiError(error, "POST /api/admin/projects/[id]/documents");
  }
}
