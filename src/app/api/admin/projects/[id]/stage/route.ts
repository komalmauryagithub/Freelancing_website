import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { ProjectStage } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateStageSchema = z.object({
  stage: z.nativeEnum(ProjectStage),
  notes: z.string().optional(),
  productionUrl: z.string().url().optional().or(z.literal("")),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  handoverNotes: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStageSchema.parse(body);

    const project = await prisma.projectRequest.findUnique({
      where: { id },
    });

    if (!project) {
      return apiError("Project not found", 404, undefined, "NOT_FOUND");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.projectRequest.update({
        where: { id },
        data: {
          stage: validatedData.stage,
          productionUrl: validatedData.productionUrl || undefined,
          repositoryUrl: validatedData.repositoryUrl || undefined,
          handoverNotes: validatedData.handoverNotes || undefined,
        },
      });

      await tx.projectStageHistory.create({
        data: {
          projectRequestId: id,
          stage: validatedData.stage,
          actorId: user.id,
          actorName: user.name,
          notes:
            validatedData.notes ||
            `Stage updated to ${validatedData.stage} by administrator.`,
        },
      });

      return p;
    });

    return apiSuccess(updated, 200, `Project stage advanced to ${validatedData.stage}`);
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/projects/[id]/stage");
  }
}
