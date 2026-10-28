import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NotificationType } from "@prisma/client";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().max(2000, "Message cannot exceed 2000 characters"),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  attachmentSize: z.number().int().optional().nullable(),
  attachmentType: z.string().optional().nullable(),
}).refine((data) => data.content.trim().length > 0 || Boolean(data.attachmentUrl), {
  message: "Message must contain either text content or an attachment",
});

export interface SaveMessageParams {
  senderId: string;
  senderName: string;
  senderRole: string;
  projectRequestId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  attachmentType?: string | null;
}

/**
 * Persists message to PostgreSQL with rate-limiting and notification dispatch
 */
export async function saveProjectMessage(params: SaveMessageParams) {
  // Rate-limiting: max 15 messages per 10 seconds per user
  const rateLimit = checkRateLimit(params.senderId, {
    keyPrefix: "chat_msg",
    maxRequests: 15,
    windowSeconds: 10,
  });

  if (!rateLimit.success) {
    throw new Error(`Message rate limit reached. Please wait ${rateLimit.resetSeconds}s.`);
  }

  // Find project and determine recipient
  const project = await prisma.projectRequest.findUnique({
    where: { id: params.projectRequestId },
    select: { id: true, userId: true, title: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  let receiverId: string | null = null;
  if (params.senderRole === "ADMIN") {
    receiverId = project.userId;
  } else {
    // If sender is client, notify administrator
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    receiverId = admin?.id || null;
  }

  const message = await prisma.message.create({
    data: {
      senderId: params.senderId,
      receiverId,
      projectRequestId: params.projectRequestId,
      content: params.content.trim(),
      attachmentUrl: params.attachmentUrl || null,
      attachmentName: params.attachmentName || null,
      attachmentSize: params.attachmentSize || null,
      attachmentType: params.attachmentType || null,
      isRead: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
          avatar: true,
        },
      },
    },
  });

  // Notify recipient
  if (receiverId && receiverId !== params.senderId) {
    await createNotification({
      userId: receiverId,
      title: `New message on ${project.title}`,
      message: `${params.senderName}: ${params.content.slice(0, 100) || "Sent an attachment"}`,
      type: NotificationType.INFO,
      link: params.senderRole === "ADMIN"
        ? `/portal/projects/${project.id}`
        : `/admin/projects/${project.id}`,
      metadata: {
        messageId: message.id,
        projectRequestId: project.id,
      },
    });
  }

  return message;
}

/**
 * Fetch messages for a project with unread counts
 */
export async function getProjectChatHistory(
  projectRequestId: string,
  currentUserId: string,
  limit = 50
) {
  const [messages, unreadCount] = await Promise.all([
    prisma.message.findMany({
      where: { projectRequestId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.message.count({
      where: {
        projectRequestId,
        isRead: false,
        senderId: { not: currentUserId },
      },
    }),
  ]);

  return { messages, unreadCount };
}

/**
 * Mark messages in a project as read by the current user
 */
export async function markProjectMessagesRead(
  projectRequestId: string,
  readerUserId: string
) {
  const now = new Date();
  const updateResult = await prisma.message.updateMany({
    where: {
      projectRequestId,
      senderId: { not: readerUserId },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: now,
    },
  });

  return { count: updateResult.count, readAt: now };
}
