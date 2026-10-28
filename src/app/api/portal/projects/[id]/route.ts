import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/portal/projects/[id] - Fetch specific project with cross-client protection
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const project = await prisma.projectRequest.findUnique({
      where: { id },
      include: {
        proposals: { include: { milestones: true } },
        invoices: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    // STRICT CROSS-CLIENT AUTHORIZATION CHECK
    if (!canAccessResource(project.userId, user.id, user.role)) {
      logger.warn(
        "CrossClientViolation",
        `User ${user.id} attempted to access project ${id} owned by ${project.userId}`
      );
      return apiError("Access denied. You do not own this project.", 403, undefined, "FORBIDDEN");
    }

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error, "GET /api/portal/projects/[id]");
  }
}
