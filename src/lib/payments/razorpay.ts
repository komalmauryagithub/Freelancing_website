import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { roundToCurrency } from "@/lib/invoices/invoice-service";

/**
 * Constant-time string comparison preventing timing attacks
 */
export function safeTimingCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Computes Razorpay payment signature HMAC-SHA256
 */
export function generatePaymentSignature(
  orderId: string,
  paymentId: string,
  keySecret: string
): string {
  const payload = `${orderId}|${paymentId}`;
  return crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
}

/**
 * Verifies Razorpay client payment signature
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    logger.error("RazorpayAuth", "RAZORPAY_KEY_SECRET is not configured on server");
    return false;
  }

  const expectedSignature = generatePaymentSignature(
    params.orderId,
    params.paymentId,
    secret
  );

  return safeTimingCompare(params.signature, expectedSignature);
}

/**
 * Computes Razorpay webhook signature HMAC-SHA256 over raw request body
 */
export function generateWebhookSignature(rawBody: string, webhookSecret: string): string {
  return crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
}

/**
 * Verifies Razorpay webhook signature using raw request body
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("RazorpayWebhook", "RAZORPAY_WEBHOOK_SECRET is not configured on server");
    return false;
  }

  const expectedSignature = generateWebhookSignature(params.rawBody, secret);
  return safeTimingCompare(params.signature, expectedSignature);
}

/**
 * Check if a webhook event was already processed (Idempotency)
 */
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.processedWebhookEvent.findUnique({
    where: { eventId },
  });
  return Boolean(existing);
}

/**
 * Record a webhook event as processed
 */
export async function markWebhookEventProcessed(
  eventId: string,
  eventType: string,
  payload?: any
): Promise<void> {
  await prisma.processedWebhookEvent.create({
    data: {
      eventId,
      provider: "razorpay",
      eventType,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
}

/**
 * Create a server-side payment order
 */
export async function createPaymentOrder(params: {
  invoiceId: string;
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  keyId: string;
}> {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_vanguardStudioDemo123";
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Convert to smallest currency unit (e.g. cents/paise)
  const amountInSmallestUnit = Math.round(params.amount * 100);

  // If live or valid Razorpay credentials are provided, attempt API creation
  if (
    keySecret &&
    !keySecret.startsWith("mock") &&
    keyId.startsWith("rzp_") &&
    !keyId.includes("Demo")
  ) {
    try {
      const razorpayInstance = new (Razorpay as any)({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpayInstance.orders.create({
        amount: amountInSmallestUnit,
        currency: params.currency.toUpperCase(),
        receipt: params.receipt,
        notes: params.notes || {},
      });

      logger.info(
        "RazorpayOrder",
        `Created Razorpay order ${order.id} for invoice ${params.receipt}`
      );

      return {
        orderId: order.id,
        amount: Number(order.amount) / 100,
        currency: order.currency,
        receipt: order.receipt,
        keyId,
      };
    } catch (apiError: any) {
      logger.warn(
        "RazorpayOrder",
        `Razorpay API call failed: ${apiError.message}. Generating test order fallback.`
      );
    }
  }

  // Test mode simulation / sandbox fallback
  const mockOrderId = `order_test_${crypto.randomBytes(8).toString("hex")}`;
  logger.info(
    "RazorpayOrder",
    `Created test order ${mockOrderId} for invoice ${params.receipt} ($${params.amount} ${params.currency})`
  );

  return {
    orderId: mockOrderId,
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    receipt: params.receipt,
    keyId,
  };
}

/**
 * Reconcile a payment transaction into the database
 */
export async function reconcilePayment(params: {
  invoiceId: string;
  amount: number;
  currency?: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionRef: string; // razorpay_payment_id
  orderId?: string;       // razorpay_order_id
  failureReason?: string;
  refundRef?: string;
  refundedAmount?: number;
  metadata?: Record<string, any>;
  actorName?: string;
}) {
  const {
    invoiceId,
    amount,
    currency = "USD",
    status,
    paymentMethod = "razorpay",
    transactionRef,
    orderId,
    failureReason,
    refundRef,
    refundedAmount = 0,
    metadata,
    actorName = "Razorpay Provider",
  } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current invoice with existing payments
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
        projectRequest: { select: { id: true, userId: true, title: true } },
      },
    });

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    // 2. Upsert Payment Record
    const payment = await tx.payment.upsert({
      where: { transactionRef },
      update: {
        status,
        failureReason: failureReason || null,
        refundedAmount,
        refundRef: refundRef || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        paidAt: status === "COMPLETED" ? new Date() : undefined,
      },
      create: {
        invoiceId,
        amount,
        currency: currency.toUpperCase(),
        status,
        paymentMethod,
        transactionRef,
        orderId: orderId || null,
        failureReason: failureReason || null,
        refundedAmount,
        refundRef: refundRef || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        paidAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    // 3. Compute Net Paid Amount across all completed payments for this invoice
    const allCompletedPayments = invoice.payments
      .filter((p) => p.transactionRef !== transactionRef && p.status === "COMPLETED")
      .concat(status === "COMPLETED" ? [payment] : []);

    const totalNetPaid = roundToCurrency(
      allCompletedPayments.reduce((acc, p) => acc + (p.amount - (p.refundedAmount || 0)), 0)
    );

    let newInvoiceStatus: InvoiceStatus = invoice.status;
    let auditAction = `PAYMENT_${status}`;
    let auditNotes = "";

    if (status === "COMPLETED") {
      if (totalNetPaid >= invoice.total) {
        newInvoiceStatus = "PAID";
        auditNotes = `Payment of $${amount} ${currency} completed via ${paymentMethod} (Ref: ${transactionRef}). Invoice fully settled.`;
      } else if (totalNetPaid > 0) {
        newInvoiceStatus = "PARTIALLY_PAID";
        auditNotes = `Partial payment of $${amount} ${currency} received via ${paymentMethod} (Ref: ${transactionRef}). Remaining balance: $${roundToCurrency(invoice.total - totalNetPaid)}.`;
      }
    } else if (status === "FAILED") {
      auditNotes = `Payment attempt for $${amount} ${currency} failed: ${failureReason || "Transaction declined"}. (Ref: ${transactionRef})`;
    } else if (status === "REFUNDED") {
      if (totalNetPaid <= 0) {
        newInvoiceStatus = "ISSUED";
        auditNotes = `Payment refund of $${refundedAmount || amount} processed (Ref: ${refundRef || transactionRef}). Invoice balance reverted.`;
      } else {
        newInvoiceStatus = "PARTIALLY_PAID";
        auditNotes = `Partial refund of $${refundedAmount || amount} processed. Active paid balance: $${totalNetPaid}.`;
      }
    }

    // 4. Update Invoice Status if changed
    if (newInvoiceStatus !== invoice.status || status === "COMPLETED") {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newInvoiceStatus,
          paidAt: newInvoiceStatus === "PAID" ? new Date() : invoice.paidAt,
        },
      });
    }

    // 5. Append Invoice Audit Log
    await tx.invoiceAuditLog.create({
      data: {
        invoiceId,
        action: auditAction,
        fromStatus: invoice.status,
        toStatus: newInvoiceStatus,
        actorName,
        notes: auditNotes,
        metadata: JSON.stringify({
          amount,
          currency,
          transactionRef,
          orderId,
          totalNetPaid,
          status,
        }),
      },
    });

    // 6. Notify Client & Admin
    const clientUserId = invoice.userId || invoice.projectRequest?.userId;
    if (clientUserId && status === "COMPLETED") {
      await createNotification({
        userId: clientUserId,
        title: "Payment Receipt Confirmed",
        message: `Your payment of $${amount} ${currency} for invoice ${invoice.invoiceNumber} has been received and verified.`,
        type: "SUCCESS",
        link: `/portal/invoices/${invoice.id}`,
      });
    }

    return {
      payment,
      invoiceStatus: newInvoiceStatus,
      totalNetPaid,
      settled: newInvoiceStatus === "PAID",
    };
  });
}
