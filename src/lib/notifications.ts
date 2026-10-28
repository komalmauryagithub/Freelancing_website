import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { logger } from "@/lib/logger";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an in-app notification and logs dispatch
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || NotificationType.INFO,
        link: params.link,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    logger.info(
      "NotificationDispatched",
      `Sent ${notification.type} notification to user ${params.userId}: ${params.title}`
    );

    return notification;
  } catch (error) {
    logger.error("NotificationDispatchError", "Failed to dispatch notification", {
      error: String(error),
      userId: params.userId,
    });
    return null;
  }
}

/**
 * Fetch notifications for a specific user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
