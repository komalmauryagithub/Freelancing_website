import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { MilestoneStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string; milestoneId: string }>;
}

const updateMilestoneSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  amount: z.number().optional(),
  plannedDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  order: z.number().int().optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
  progressPercentage: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id, milestoneId } = await params;
    const body = await request.json();
    const validatedData = updateMilestoneSchema.parse(body);

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existingMilestone || existingMilestone.projectRequestId !== id) {
      return apiError("Milestone not found for this project", 404, undefined, "NOT_FOUND");
    }

    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
    if (validatedData.order !== undefined) updateData.order = validatedData.order;
    if (validatedData.plannedDate !== undefined) {
      updateData.plannedDate = validatedData.plannedDate ? new Date(validatedData.plannedDate) : null;
    }
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }
    if (validatedData.progressPercentage !== undefined) {
      updateData.progressPercentage = validatedData.progressPercentage;
    }
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      if (
        (validatedData.status === MilestoneStatus.APPROVED ||
          validatedData.status === MilestoneStatus.RELEASED) &&
        !existingMilestone.completedAt
      ) {
        updateData.completedAt = new Date();
      }
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return apiSuccess(updated, 200, "Milestone updated successfully");
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/projects/[id]/milestones/[milestoneId]");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id, milestoneId } = await params;

    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existingMilestone || existingMilestone.projectRequestId !== id) {
      return apiError("Milestone not found for this project", 404, undefined, "NOT_FOUND");
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return apiSuccess(null, 200, "Milestone deleted successfully");
  } catch (error) {
    return handleApiError(error, "DELETE /api/admin/projects/[id]/milestones/[milestoneId]");
  }
}
