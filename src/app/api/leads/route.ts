import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { createLeadSchema } from "@/lib/validations/lead";
import { logger } from "@/lib/logger";

import { generateReferenceNumber } from "@/lib/reference";

export const dynamic = "force-dynamic";

/**
 * POST /api/leads - Create new lead inquiry from contact form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createLeadSchema.parse(body);

    logger.info("LeadSubmission", `Received new lead inquiry from ${validatedData.email}`);

    // Create lead securely in database
    const lead = await prisma.lead.create({
      data: {
        referenceNumber: generateReferenceNumber("LEAD"),
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company || null,
        budgetRange: validatedData.budgetRange || null,
        timeline: validatedData.timeline || null,
        message: validatedData.message,
        source: validatedData.source || "contact_form",
      },
    });

    return apiSuccess(
      {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        createdAt: lead.createdAt,
      },
      201,
      "Inquiry received successfully. We will get back to you within 24 hours."
    );
  } catch (error) {
    return handleApiError(error, "POST /api/leads");
  }
}
