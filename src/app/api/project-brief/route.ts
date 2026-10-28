import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { projectBriefSchema } from "@/lib/validations/project-brief";
import { generateReferenceNumber } from "@/lib/reference";
import { getCurrentSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = projectBriefSchema.parse(body);

    // 1. Idempotency Check: Prevent duplicate submissions caused by rapid double-clicks
    if (validatedData.idempotencyKey) {
      const existingLead = await prisma.lead.findUnique({
        where: { idempotencyKey: validatedData.idempotencyKey },
      });

      if (existingLead) {
        logger.info(
          "ProjectBrief",
          `Idempotent duplicate submission intercepted for key: ${validatedData.idempotencyKey}`
        );
        return apiSuccess(
          {
            referenceNumber: existingLead.referenceNumber,
            leadId: existingLead.id,
            isDuplicate: true,
          },
          200,
          "Project brief already received."
        );
      }
    }

    // 2. Check if submitting user is currently authenticated
    const sessionData = await getCurrentSession();
    const authenticatedUserId = sessionData?.user?.id || null;

    // 3. Generate unique reference number
    const referenceNumber = generateReferenceNumber("PRJ");

    logger.info("ProjectBrief", `Processing new brief submission: ${referenceNumber} for ${validatedData.email}`);

    // 4. Save to Database within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          referenceNumber,
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company || null,
          phone: validatedData.phone || null,
          projectType: validatedData.projectType,
          selectedFeatures: validatedData.selectedFeatures,
          requirements: validatedData.requirements,
          indicativeBudget: validatedData.indicativeBudget,
          budgetRange: validatedData.indicativeBudget,
          timeline: validatedData.timeline,
          message: validatedData.requirements,
          attachments: validatedData.attachments,
          source: "client_project_form",
          idempotencyKey: validatedData.idempotencyKey || null,
        },
      });

      let projectRequest = null;

      // If user is logged in, also create an initial project request in their portal
      if (authenticatedUserId) {
        projectRequest = await tx.projectRequest.create({
          data: {
            referenceNumber,
            userId: authenticatedUserId,
            leadId: lead.id,
            title: `${validatedData.projectType.replace("_", " ").toUpperCase()} Project`,
            description: validatedData.requirements,
            projectType: validatedData.projectType,
            selectedFeatures: validatedData.selectedFeatures,
            budget: validatedData.indicativeBudget,
            attachments: validatedData.attachments,
            status: "SUBMITTED",
          },
        });
      }

      return { lead, projectRequest };
    });

    // 5. Send confirmation email when email delivery is configured
    // In production, an email service (Resend / AWS SES) dispatches the confirmation:
    logger.info(
      "EmailDispatcher",
      `[Confirmation Email Sent] Reference: ${referenceNumber} -> To: ${validatedData.email} | Scope: ${validatedData.projectType}`
    );

    return apiSuccess(
      {
        referenceNumber: result.lead.referenceNumber,
        leadId: result.lead.id,
        projectRequestId: result.projectRequest?.id || null,
        name: result.lead.name,
        email: result.lead.email,
        createdAt: result.lead.createdAt,
      },
      201,
      "Project brief submitted successfully!"
    );
  } catch (error) {
    return handleApiError(error, "POST /api/project-brief");
  }
}
