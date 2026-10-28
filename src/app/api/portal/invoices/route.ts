import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/authorization";

export const dynamic = "force-dynamic";

/**
 * GET /api/portal/invoices - List invoices belonging strictly to the authenticated client
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    const where =
      user.role === "ADMIN"
        ? {}
        : {
            OR: [
              { userId: user.id },
              { projectRequest: { userId: user.id } },
            ],
          };

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        lineItems: true,
        payments: { orderBy: { createdAt: "desc" } },
        auditTrail: { orderBy: { createdAt: "desc" } },
        projectRequest: { select: { title: true, id: true, referenceNumber: true } },
        quotation: { select: { id: true, quotationNumber: true, title: true } },
        milestone: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ invoices });
  } catch (error) {
    return handleApiError(error, "GET /api/portal/invoices");
  }
}
