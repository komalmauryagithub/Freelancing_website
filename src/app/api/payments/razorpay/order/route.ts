import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { createPaymentOrder } from "@/lib/payments/razorpay";
import { roundToCurrency } from "@/lib/invoices/invoice-service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
});

/**
 * POST /api/payments/razorpay/order - Create server-side Razorpay order
 * Amount is derived strictly on the server from the invoice balance.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const { invoiceId } = createOrderSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
        projectRequest: { select: { userId: true, title: true } },
      },
    });

    if (!invoice) {
      return apiError("Invoice not found", 404);
    }

    // Ownership check: only invoice owner or admin can pay
    const ownerId = invoice.userId || invoice.projectRequest?.userId;
    if (!canAccessResource(ownerId, user.id, user.role)) {
      return apiError("Forbidden: You do not own this invoice", 403);
    }

    // Status checks
    if (invoice.status === "PAID") {
      return apiError("Invoice is already paid in full", 400);
    }

    if (invoice.status === "CANCELLED") {
      return apiError("Cannot process payment for a cancelled invoice", 400);
    }

    if (invoice.status === "DRAFT") {
      return apiError("Invoice is in DRAFT state and has not been issued for payment", 400);
    }

    // Compute remaining payable amount strictly on server
    const completedPayments = invoice.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount - (p.refundedAmount || 0)), 0);

    const remainingBalance = roundToCurrency(invoice.total - completedPayments);

    if (remainingBalance <= 0) {
      return apiError("No outstanding balance remaining on this invoice", 400);
    }

    const order = await createPaymentOrder({
      invoiceId: invoice.id,
      amount: remainingBalance,
      currency: invoice.currency,
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        userId: user.id,
      },
    });

    return apiSuccess({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: order.keyId,
      invoiceNumber: invoice.invoiceNumber,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/razorpay/order");
  }
}
