import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import { QuotationStatus, LeadStatus } from "@prisma/client";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateQuotationStatusSchema = z.object({
  status: z.nativeEnum(QuotationStatus),
  notes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateQuotationStatusSchema.parse(body);

    const quotation = await prisma.quotation.findUnique({
      where: { id },
    });

    if (!quotation) {
      return apiError("Quotation not found", 404, undefined, "NOT_FOUND");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatePayload: Record<string, unknown> = {
        status: validatedData.status,
      };

      if (validatedData.status === "SENT") {
        updatePayload.sentAt = new Date();
      } else if (validatedData.status === "ACCEPTED") {
        updatePayload.acceptedAt = new Date();
      } else if (validatedData.status === "REJECTED") {
        updatePayload.rejectedAt = new Date();
        updatePayload.rejectionReason = validatedData.rejectionReason || null;
      }

      const q = await tx.quotation.update({
        where: { id },
        data: updatePayload,
      });

      // Record audit log
      await tx.quotationAuditLog.create({
        data: {
          quotationId: id,
          action: `STATUS_${validatedData.status}`,
          actorId: user.id,
          actorName: user.name,
          notes:
            validatedData.notes ||
            (validatedData.rejectionReason
              ? `Status changed to ${validatedData.status}. Reason: ${validatedData.rejectionReason}`
              : `Status changed to ${validatedData.status}.`),
        },
      });

      // Update linked Lead status if applicable
      if (quotation.leadId) {
        if (validatedData.status === "ACCEPTED") {
          await tx.lead.update({
            where: { id: quotation.leadId },
            data: { status: LeadStatus.WON },
          });
        } else if (validatedData.status === "REJECTED") {
          await tx.lead.update({
            where: { id: quotation.leadId },
            data: { status: LeadStatus.LOST },
          });
        }
      }

      return q;
    });

    return apiSuccess(updated, 200, `Quotation status updated to ${validatedData.status}`);
  } catch (error) {
    return handleApiError(error, "PATCH /api/admin/quotations/[id]/status");
  }
}
