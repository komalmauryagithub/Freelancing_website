import { NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth, canAccessResource } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { verifyPaymentSignature, reconcilePayment } from "@/lib/payments/razorpay";
import { roundToCurrency } from "@/lib/invoices/invoice-service";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifyPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

/**
 * POST /api/payments/razorpay/verify - Verify client payment signature
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const data = verifyPaymentSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        payments: true,
        projectRequest: { select: { userId: true, title: true } },
      },
    });

    if (!invoice) {
      return apiError("Invoice not found", 404);
    }

    // Ownership check
    const ownerId = invoice.userId || invoice.projectRequest?.userId;
    if (!canAccessResource(ownerId, user.id, user.role)) {
      return apiError("Forbidden: You do not own this invoice", 403);
    }

    // Cryptographic signature check on server
    const isValidSignature = verifyPaymentSignature({
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
    });

    if (!isValidSignature) {
      logger.warn(
        "PaymentVerificationFailed",
        `Invalid signature detected for invoice ${invoice.invoiceNumber}. Order: ${data.razorpay_order_id}, Payment: ${data.razorpay_payment_id}`
      );
      return apiError("Payment signature verification failed. Untrusted payment payload.", 400);
    }

    // Calculate remaining amount strictly from database state
    const completedPayments = invoice.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount - (p.refundedAmount || 0)), 0);

    const payableAmount = roundToCurrency(invoice.total - completedPayments);

    if (payableAmount <= 0 && invoice.status === "PAID") {
      return apiError("Invoice is already fully paid", 400);
    }

    // Reconcile verified payment
    const reconciliation = await reconcilePayment({
      invoiceId: invoice.id,
      amount: payableAmount,
      currency: invoice.currency,
      status: "COMPLETED",
      paymentMethod: "razorpay_checkout",
      transactionRef: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      metadata: {
        verifiedVia: "checkout_client_signature",
        userId: user.id,
        userEmail: user.email,
      },
      actorName: user.name,
    });

    logger.info(
      "PaymentVerified",
      `Payment ${data.razorpay_payment_id} verified for invoice ${invoice.invoiceNumber}. New status: ${reconciliation.invoiceStatus}`
    );

    return apiSuccess({
      success: true,
      settled: reconciliation.settled,
      invoiceStatus: reconciliation.invoiceStatus,
      totalNetPaid: reconciliation.totalNetPaid,
      transactionRef: data.razorpay_payment_id,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/payments/razorpay/verify");
  }
}
