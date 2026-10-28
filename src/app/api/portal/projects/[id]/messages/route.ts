import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import {
  saveProjectMessage,
  getProjectChatHistory,
  sendMessageSchema,
} from "@/lib/chat/chat-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

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

    const { messages, unreadCount } = await getProjectChatHistory(id, user.id, 100);

    return apiSuccess({ messages, unreadCount });
  } catch (error) {
    return handleApiError(error, "GET /api/portal/projects/[id]/messages");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    const project = await prisma.projectRequest.findUnique({
      where: { id },
      select: { userId: true, title: true },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    if (!canAccessResource(project.userId, user.id, user.role)) {
      return apiError("Access denied", 403, undefined, "FORBIDDEN");
    }

    const message = await saveProjectMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      projectRequestId: id,
      content: validatedData.content,
      attachmentUrl: validatedData.attachmentUrl,
      attachmentName: validatedData.attachmentName,
      attachmentSize: validatedData.attachmentSize,
      attachmentType: validatedData.attachmentType,
    });

    return apiSuccess(message, 201, "Message sent successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/portal/projects/[id]/messages");
  }
}
