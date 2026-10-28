import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";
import { markAllNotificationsAsRead } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    await markAllNotificationsAsRead(user.id);

    return apiSuccess(null, 200, "All notifications marked as read");
  } catch (error) {
    return handleApiError(error, "POST /api/notifications/read-all");
  }
}
