import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { generateReferenceNumber } from "@/lib/reference";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const quotationLineItemSchema = z.object({
  description: z.string().min(2, "Description is required"),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().positive("Unit price must be positive"),
});

const createQuotationSchema = z.object({
  leadId: z.string().optional().nullable(),
  projectRequestId: z.string().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  scope: z.string().min(10, "Scope description must be at least 10 characters"),
  estimatedTimeline: z.string().min(2, "Estimated timeline is required"),
  validDays: z.number().int().min(1).max(90).default(30),
  lineItems: z.array(quotationLineItemSchema).min(1, "At least one line item is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createQuotationSchema.parse(body);

    const quotationNumber = generateReferenceNumber("QUO");
    const validUntil = new Date(Date.now() + validatedData.validDays * 24 * 60 * 60 * 1000);

    // Calculate total price from line items
    const lineItemsWithTotals = validatedData.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const totalPrice = lineItemsWithTotals.reduce((acc, curr) => acc + curr.total, 0);

    logger.info("CreateQuotation", `Creating quotation ${quotationNumber} (Total: $${totalPrice})`);

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          leadId: validatedData.leadId || null,
          projectRequestId: validatedData.projectRequestId || null,
          title: validatedData.title,
          scope: validatedData.scope,
          price: totalPrice,
          currency: "USD",
          validUntil,
          estimatedTimeline: validatedData.estimatedTimeline,
          status: "DRAFT",
          lineItems: {
            create: lineItemsWithTotals,
          },
          auditTrail: {
            create: {
              action: "CREATED",
              actorId: user.id,
              actorName: user.name,
              notes: `Quotation draft initialized with ${lineItemsWithTotals.length} line items totaling $${totalPrice.toLocaleString()}.`,
            },
          },
        },
        include: {
          lineItems: true,
          auditTrail: true,
        },
      });

      // If tied to a lead, update lead status to PROPOSAL_SENT
      if (validatedData.leadId) {
        await tx.lead.update({
          where: { id: validatedData.leadId },
          data: { status: "PROPOSAL_SENT" },
        });
      }

      return q;
    });

    return apiSuccess(quotation, 201, "Quotation created successfully");
  } catch (error) {
    return handleApiError(error, "POST /api/admin/quotations");
  }
}
