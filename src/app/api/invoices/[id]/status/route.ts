import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/authorization";
import {
  updateInvoiceStatus,
  updateInvoiceStatusSchema,
} from "@/lib/invoices/invoice-service";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/invoices/[id]/status - Update invoice status with audit tracking (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();

    const validated = updateInvoiceStatusSchema.parse(body);

    const updatedInvoice = await updateInvoiceStatus(
      id,
      validated.status,
      { id: user.id, name: user.name },
      validated.notes
    );

    return apiSuccess({ invoice: updatedInvoice });
  } catch (error: any) {
    if (error?.message?.includes("Cannot transition")) {
      return apiError(error.message, 400);
    }
    return handleApiError(error, "PATCH /api/invoices/[id]/status");
  }
}
