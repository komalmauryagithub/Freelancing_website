import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { logger } from "@/lib/logger";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const respondProposalSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = respondProposalSchema.parse(body);

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        projectRequest: { select: { id: true, userId: true, title: true, stage: true } },
      },
    });

    if (!proposal) {
      return apiError("Proposal not found", 404, undefined, "NOT_FOUND");
    }

    // STRICT CROSS-CLIENT AUTHORIZATION CHECK
    if (!canAccessResource(proposal.projectRequest.userId, user.id, user.role)) {
      return apiError("Access denied. You do not own this project.", 403, undefined, "FORBIDDEN");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const isAccept = validatedData.action === "ACCEPT";

      const p = await tx.proposal.update({
        where: { id },
        data: {
          status: isAccept ? "ACCEPTED" : "REJECTED",
        },
      });

      if (isAccept) {
        // Advance stage to APPROVED
        await tx.projectRequest.update({
          where: { id: proposal.projectRequest.id },
          data: { stage: "APPROVED" },
        });

        // Record Stage History
        await tx.projectStageHistory.create({
          data: {
            projectRequestId: proposal.projectRequest.id,
            stage: "APPROVED",
            actorId: user.id,
            actorName: user.name,
            notes: `Proposal "${proposal.title}" accepted by client. Scope formalized for development.`,
          },
        });
      }

      return p;
    });

    logger.info(
      "ProposalResponse",
      `User ${user.id} responded to proposal ${id}: ${validatedData.action}`
    );

    return apiSuccess(
      updated,
      200,
      `Proposal successfully ${validatedData.action === "ACCEPT" ? "accepted" : "declined"}.`
    );
  } catch (error) {
    return handleApiError(error, "POST /api/portal/proposals/[id]/respond");
  }
}
