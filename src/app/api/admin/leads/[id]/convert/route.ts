import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { generateReferenceNumber } from "@/lib/reference";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return apiError("Lead record not found.", 404, undefined, "NOT_FOUND");
    }

    if (lead.convertedProjectId) {
      return apiError(
        "This lead has already been converted into a project.",
        400,
        undefined,
        "ALREADY_CONVERTED"
      );
    }

    logger.info("LeadConversion", `Admin ${user.email} converting lead ${lead.id} to project`);

    const result = await prisma.$transaction(async (tx) => {
      // Find or create associated client user account
      let clientUser = await tx.user.findUnique({
        where: { email: lead.email },
      });

      if (!clientUser) {
        clientUser = await tx.user.create({
          data: {
            email: lead.email,
            name: lead.name,
            company: lead.company,
            phone: lead.phone,
            role: "CLIENT",
          },
        });
      }

      const projectRef = generateReferenceNumber("PRJ");

      const projectRequest = await tx.projectRequest.create({
        data: {
          referenceNumber: projectRef,
          leadId: lead.id,
          userId: clientUser.id,
          title: `${lead.projectType ? lead.projectType.replace("_", " ").toUpperCase() : "CLIENT"} Project — ${lead.company || lead.name}`,
          description: lead.requirements || lead.message,
          projectType: lead.projectType,
          selectedFeatures: lead.selectedFeatures,
          budget: lead.indicativeBudget || lead.budgetRange,
          attachments: lead.attachments,
          status: "ACCEPTED",
        },
      });

      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "WON",
          convertedProjectId: projectRequest.id,
          convertedAt: new Date(),
        },
      });

      return { projectRequest, lead: updatedLead, clientUser };
    });

    return apiSuccess(
      {
        projectRequest: result.projectRequest,
        lead: result.lead,
      },
      201,
      "Lead successfully converted to an active project!"
    );
  } catch (error) {
    return handleApiError(error, "POST /api/admin/leads/[id]/convert");
  }
}
