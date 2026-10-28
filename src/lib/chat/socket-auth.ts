import { prisma } from "@/lib/prisma";
import { canAccessResource } from "@/lib/authorization";
import { SanitizedUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Authenticates a socket connection using database-backed session token.
 * NEVER trusts client-provided user IDs.
 */
export async function authenticateSocketToken(token: string | undefined): Promise<SanitizedUser | null> {
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            company: true,
          },
        },
      },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      logger.warn("SocketAuthExpired", `Expired session token presented for user ${session.userId}`);
      return null;
    }

    return session.user as SanitizedUser;
  } catch (error) {
    logger.error("SocketAuthError", "Failed to authenticate socket token", { error: String(error) });
    return null;
  }
}

/**
 * Verifies that the authenticated user is authorized to join the project room.
 */
export async function authorizeProjectRoomAccess(
  user: SanitizedUser,
  projectRequestId: string
): Promise<{ authorized: boolean; projectTitle?: string; clientOwnerId?: string }> {
  try {
    const project = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      select: {
        id: true,
        userId: true,
        title: true,
      },
    });

    if (!project) {
      return { authorized: false };
    }

    const hasAccess = canAccessResource(project.userId, user.id, user.role);

    return {
      authorized: hasAccess,
      projectTitle: project.title,
      clientOwnerId: project.userId || undefined,
    };
  } catch (error) {
    logger.error("RoomAuthError", "Failed to authorize room access", { error: String(error) });
    return { authorized: false };
  }
}
