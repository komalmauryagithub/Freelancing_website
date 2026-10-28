import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { markNotificationAsRead } from "@/lib/notifications";

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

    await markNotificationAsRead(id, user.id);

    return apiSuccess({ id, isRead: true }, 200, "Notification marked as read");
  } catch (error) {
    return handleApiError(error, "PATCH /api/notifications/[id]/read");
  }
}
