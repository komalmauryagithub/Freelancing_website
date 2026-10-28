import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { ChangeRequestStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string; requestId: string }>;
}

const updateChangeRequestSchema = z.object({
  status: z.nativeEnum(ChangeRequestStatus).optional(),
  impactAssessment: z.string().optional().nullable(),
  additionalCost: z.number().optional().nullable(),
  additionalDays: z.number().int().optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id, requestId } = await params;
    const body = await request.json();
    const validatedData = updateChangeRequestSchema.parse(body);

    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id: requestId },
    });

    if (!changeRequest || changeRequest.projectRequestId !== id) {
      return apiError("Change request not found for this project", 404, undefined, "NOT_FOUND");
    }

    const updated = await prisma.changeRequest.update({
      where: { id: requestId },
      data: {
        ...(validatedData.status !== undefined && { status: validatedData.status }),
        ...(validatedData.impactAssessment !== undefined && {
          impactAssessment: validatedData.impactAssessment,
        }),
        ...(validatedData.additionalCost !== undefined && {
          additionalCost: validatedData.additionalCost,
        }),
        ...(validatedData.additionalDays !== undefined && {
          additionalDays: validatedData.additionalDays,
        }),
      },
    });

    return apiSuccess(updated, 200, "Change request updated successfully");
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/projects/[id]/change-requests/[requestId]");
  }
}
