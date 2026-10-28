import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createChangeRequestSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const project = await prisma.projectRequest.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    if (!canAccessResource(project.userId, user.id, user.role)) {
      return apiError("Access denied", 403, undefined, "FORBIDDEN");
    }

    const changeRequests = await prisma.changeRequest.findMany({
      where: { projectRequestId: id },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ changeRequests });
  } catch (error) {
    return handleApiError(error, "GET /api/portal/projects/[id]/change-requests");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = createChangeRequestSchema.parse(body);

    const project = await prisma.projectRequest.findUnique({
      where: { id },
      select: { userId: true, title: true },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    if (!canAccessResource(project.userId, user.id, user.role)) {
      return apiError("Access denied. You do not own this project.", 403, undefined, "FORBIDDEN");
    }

    const changeRequest = await prisma.changeRequest.create({
      data: {
        projectRequestId: id,
        title: validatedData.title,
        description: validatedData.description,
        status: "SUBMITTED",
      },
    });

    return apiSuccess(changeRequest, 201, "Change request submitted for engineering review.");
  } catch (error) {
    return handleApiError(error, "POST /api/portal/projects/[id]/change-requests");
  }
}
