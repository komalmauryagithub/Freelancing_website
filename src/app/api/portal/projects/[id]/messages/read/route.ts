import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { markProjectMessagesRead } from "@/lib/chat/chat-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const result = await markProjectMessagesRead(id, user.id);

    return apiSuccess(result, 200, "Messages marked as read");
  } catch (error) {
    return handleApiError(error, "PATCH /api/portal/projects/[id]/messages/read");
  }
}
