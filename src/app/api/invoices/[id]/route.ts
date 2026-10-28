import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices/[id] - Get full details of an invoice with strict ownership validation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        lineItems: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        auditTrail: {
          orderBy: { createdAt: "desc" },
        },
        projectRequest: {
          select: {
            id: true,
            title: true,
            referenceNumber: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        quotation: {
          select: { id: true, quotationNumber: true, title: true, validUntil: true },
        },
        milestone: {
          select: { id: true, title: true, status: true, progressPercentage: true },
        },
      },
    });

    if (!invoice) {
      return apiError("Invoice not found", 404);
    }

    // Ownership check: user must be Admin or owner of the invoice/project
    const ownerId = invoice.userId || invoice.projectRequest?.userId;
    if (!canAccessResource(ownerId, user.id, user.role)) {
      return apiError("Forbidden: You cannot access this invoice", 403);
    }

    return apiSuccess({ invoice });
  } catch (error) {
    return handleApiError(error, "GET /api/invoices/[id]");
  }
}
