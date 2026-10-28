import { NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { getCurrentSession } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionData = await getCurrentSession();
    if (!sessionData) {
      return apiSuccess({ notifications: [], unreadCount: 0 });
    }

    const { user } = sessionData;
    const notifications = await getUserNotifications(user.id, 30);
    const unreadCount = await getUnreadNotificationCount(user.id);

    return apiSuccess({ notifications, unreadCount });
  } catch (error) {
    return handleApiError(error, "GET /api/notifications");
  }
}
