import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { LeadStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  internalNotes: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        quotations: {
          include: {
            lineItems: true,
            auditTrail: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
        projectRequests: true,
      },
    });

    if (!lead) {
      return apiError("Lead record not found.", 404, undefined, "NOT_FOUND");
    }

    return apiSuccess(lead);
  } catch (error) {
    return handleApiError(error, "GET /api/admin/leads/[id]");
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: validatedData.status,
        internalNotes: validatedData.internalNotes,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
      },
    });

    return apiSuccess(updated, 200, "Lead updated successfully");
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/leads/[id]");
  }
}
