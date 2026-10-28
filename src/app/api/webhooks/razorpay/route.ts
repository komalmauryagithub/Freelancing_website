import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyWebhookSignature,
  isWebhookEventProcessed,
  markWebhookEventProcessed,
  reconcilePayment,
} from "@/lib/payments/razorpay";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/razorpay - Razorpay Webhook Endpoint
 * Validates HMAC SHA-256 signature using raw body and handles events idempotently.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      logger.warn("RazorpayWebhook", "Missing x-razorpay-signature header");
      return new Response("Missing webhook signature", { status: 400 });
    }

    // Read raw body string for cryptographic verification
    const rawBody = await request.text();

    const isValidSignature = verifyWebhookSignature({ rawBody, signature });
    if (!isValidSignature) {
      logger.warn("RazorpayWebhook", "Invalid webhook signature rejected");
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const eventId =
      payload.event_id ||
      payload.id ||
      `${eventType}_${payload.payload?.payment?.entity?.id || payload.created_at || Date.now()}`;

    logger.info("RazorpayWebhook", `Received event [${eventType}] (Event ID: ${eventId})`);

    // Webhook Idempotency: Ignore duplicate deliveries
    const alreadyProcessed = await isWebhookEventProcessed(eventId);
    if (alreadyProcessed) {
      logger.info(
        "RazorpayWebhook",
        `Duplicate webhook event ${eventId} safely ignored (idempotent response)`
      );
      return Response.json(
        { received: true, duplicate: true, event: eventType },
        { status: 200 }
      );
    }

    // Process Supported Events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const transactionRef = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        const amount = paymentEntity.amount / 100;
        const currency = paymentEntity.currency || "USD";
        const paymentMethod = paymentEntity.method || "razorpay";
        const invoiceId = paymentEntity.notes?.invoiceId;

        let targetInvoice = null;
        if (invoiceId) {
          targetInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        }

        if (!targetInvoice && orderId) {
          const matchingPayment = await prisma.payment.findFirst({
            where: { orderId },
            include: { invoice: true },
          });
          targetInvoice = matchingPayment?.invoice || null;
        }

        if (!targetInvoice && paymentEntity.notes?.invoiceNumber) {
          targetInvoice = await prisma.invoice.findUnique({
            where: { invoiceNumber: paymentEntity.notes.invoiceNumber },
          });
        }

        if (targetInvoice) {
          await reconcilePayment({
            invoiceId: targetInvoice.id,
            amount,
            currency,
            status: "COMPLETED",
            paymentMethod,
            transactionRef,
            orderId,
            metadata: {
              source: "razorpay_webhook",
              eventId,
              email: paymentEntity.email,
              contact: paymentEntity.contact,
            },
            actorName: "Razorpay Webhook",
          });
        } else {
          logger.warn(
            "RazorpayWebhook",
            `No matching invoice found for payment ${transactionRef} (order: ${orderId})`
          );
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const transactionRef = paymentEntity.id;
        const orderId = paymentEntity.order_id;
        const amount = paymentEntity.amount / 100;
        const currency = paymentEntity.currency || "USD";
        const failureReason =
          paymentEntity.error_description || paymentEntity.error_reason || "Payment declined";
        const invoiceId = paymentEntity.notes?.invoiceId;

        let targetInvoice = null;
        if (invoiceId) {
          targetInvoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        }

        if (targetInvoice) {
          await reconcilePayment({
            invoiceId: targetInvoice.id,
            amount,
            currency,
            status: "FAILED",
            paymentMethod: paymentEntity.method || "razorpay",
            transactionRef,
            orderId,
            failureReason,
            metadata: {
              source: "razorpay_webhook",
              eventId,
              errorCode: paymentEntity.error_code,
            },
            actorName: "Razorpay Webhook",
          });
        }
      }
    } else if (eventType === "refund.processed" || eventType === "refund.created") {
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity) {
        const refundRef = refundEntity.id;
        const paymentRef = refundEntity.payment_id;
        const refundedAmount = refundEntity.amount / 100;
        const currency = refundEntity.currency || "USD";

        // Find existing payment
        const existingPayment = await prisma.payment.findUnique({
          where: { transactionRef: paymentRef },
          include: { invoice: true },
        });

        if (existingPayment) {
          await reconcilePayment({
            invoiceId: existingPayment.invoiceId,
            amount: existingPayment.amount,
            currency,
            status: "REFUNDED",
            transactionRef: paymentRef,
            refundRef,
            refundedAmount,
            metadata: {
              source: "razorpay_webhook",
              eventId,
              refundSpeed: refundEntity.speed_processed,
            },
            actorName: "Razorpay Webhook",
          });
        }
      }
    }

    // Mark event as processed for idempotency
    await markWebhookEventProcessed(eventId, eventType, payload);

    return Response.json({ received: true, event: eventType }, { status: 200 });
  } catch (error) {
    logger.error("RazorpayWebhookError", "Error processing webhook event", {
      error: String(error),
    });
    return new Response("Webhook processing failed", { status: 500 });
  }
}
