import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin, requireAuth } from "@/lib/authorization";
import {
  createInvoice,
  createInvoiceFromQuotation,
  createInvoiceFromMilestone,
  createInvoiceSchema,
} from "@/lib/invoices/invoice-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/invoices - List invoices with filtering (Admin gets all, Client gets owned)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const where: any = {};

    if (user.role !== "ADMIN") {
      where.OR = [
        { userId: user.id },
        { projectRequest: { userId: user.id } },
      ];
    }

    if (projectId) {
      where.projectRequestId = projectId;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        lineItems: true,
        payments: true,
        projectRequest: { select: { id: true, title: true, referenceNumber: true } },
        quotation: { select: { id: true, quotationNumber: true, title: true } },
        milestone: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess({ invoices });
  } catch (error) {
    return handleApiError(error, "GET /api/invoices");
  }
}

/**
 * POST /api/invoices - Create an invoice (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();

    if (body.source === "QUOTATION" && body.quotationId) {
      const invoice = await createInvoiceFromQuotation(
        body.quotationId,
        { id: user.id, name: user.name },
        body.taxRate || 0,
        body.dueDays || 14
      );
      return apiSuccess({ invoice }, 201);
    }

    if (body.source === "MILESTONE" && body.milestoneId) {
      const invoice = await createInvoiceFromMilestone(
        body.milestoneId,
        { id: user.id, name: user.name },
        body.taxRate || 0,
        body.dueDays || 14
      );
      return apiSuccess({ invoice }, 201);
    }

    const validatedData = createInvoiceSchema.parse(body);
    const invoice = await createInvoice(validatedData, { id: user.id, name: user.name });

    return apiSuccess({ invoice }, 201);
  } catch (error) {
    return handleApiError(error, "POST /api/invoices");
  }
}
