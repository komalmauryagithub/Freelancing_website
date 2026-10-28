import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { MilestoneStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createMilestoneSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  amount: z.number().default(0),
  plannedDate: z.string().optional(),
  dueDate: z.string().optional(),
  order: z.number().int().default(0),
  status: z.nativeEnum(MilestoneStatus).default("PENDING"),
  progressPercentage: z.number().int().min(0).max(100).default(0),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id } = await params;

    const milestones = await prisma.milestone.findMany({
      where: { projectRequestId: id },
      orderBy: { order: "asc" },
    });

    return apiSuccess({ milestones });
  } catch (error) {
    return handleApiError(error, "GET /api/admin/projects/[id]/milestones");
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id } = await params;
    const body = await request.json();
    const validatedData = createMilestoneSchema.parse(body);

    const milestone = await prisma.milestone.create({
      data: {
        projectRequestId: id,
        title: validatedData.title,
        description: validatedData.description,
        amount: validatedData.amount,
        plannedDate: validatedData.plannedDate ? new Date(validatedData.plannedDate) : null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        order: validatedData.order,
        status: validatedData.status,
        progressPercentage: validatedData.progressPercentage,
      },
    });

    return apiSuccess(milestone, 201, "Milestone created successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/admin/projects/[id]/milestones");
  }
}
