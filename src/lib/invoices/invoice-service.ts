import { prisma } from "@/lib/prisma";
import { generateReferenceNumber } from "@/lib/reference";
import { logger } from "@/lib/logger";
import { InvoiceStatus, PaymentStatus, Prisma } from "@prisma/client";
import { z } from "zod";

// Zod Schemas
export const invoiceLineItemSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export const createInvoiceSchema = z.object({
  projectRequestId: z.string().optional().nullable(),
  quotationId: z.string().optional().nullable(),
  milestoneId: z.string().optional().nullable(),
  source: z.enum(["CUSTOM", "QUOTATION", "MILESTONE"]).default("CUSTOM"),
  lineItems: z.array(invoiceLineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100).default(0),
  currency: z.string().length(3).default("USD"),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientEmail: z.string().email().optional().nullable(),
  clientAddress: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ISSUED"]).default("ISSUED"),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;

/**
 * Monetary rounding helper: rounds to 2 decimal places safely
 */
export function roundToCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates line items subtotal, tax, and grand total
 */
export function calculateInvoiceTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  taxRate: number = 0
): { amount: number; tax: number; total: number } {
  const amount = roundToCurrency(
    lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  );
  const tax = roundToCurrency((amount * (taxRate || 0)) / 100);
  const total = roundToCurrency(amount + tax);
  return { amount, tax, total };
}

/**
 * Validates allowed status transitions
 */
export function isValidInvoiceTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  if (from === to) return true;

  const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    DRAFT: ["ISSUED", "CANCELLED"],
    ISSUED: ["PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
    PARTIALLY_PAID: ["PAID", "CANCELLED"],
    OVERDUE: ["PARTIALLY_PAID", "PAID", "CANCELLED"],
    PAID: ["ISSUED", "CANCELLED"], // Only upon authorized refund or manual reversal
    CANCELLED: [], // Terminal
  };

  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Creates an invoice in the database with line items and audit log
 */
export async function createInvoice(
  input: CreateInvoiceInput,
  actor: { id?: string; name: string }
) {
  const invoiceNumber = generateReferenceNumber("INV");
  const totals = calculateInvoiceTotals(input.lineItems, input.taxRate);

  let targetUserId: string | null = null;

  // If linked to a project request, find the owner's userId
  if (input.projectRequestId) {
    const project = await prisma.projectRequest.findUnique({
      where: { id: input.projectRequestId },
      select: { userId: true, user: { select: { name: true, email: true } } },
    });
    if (project) {
      targetUserId = project.userId || null;
      if (!input.clientName && project.user) {
        input.clientName = project.user.name;
      }
      if (!input.clientEmail && project.user) {
        input.clientEmail = project.user.email;
      }
    }
  }

  const dueDate = input.dueDate
    ? new Date(input.dueDate)
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default
  const issuedAt = input.status === "ISSUED" ? new Date() : null;

  logger.info(
    "InvoiceService",
    `Creating ${input.status} invoice ${invoiceNumber} for $${totals.total} ${input.currency}`
  );

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        projectRequestId: input.projectRequestId || null,
        quotationId: input.quotationId || null,
        milestoneId: input.milestoneId || null,
        userId: targetUserId,
        amount: totals.amount,
        taxRate: input.taxRate,
        tax: totals.tax,
        total: totals.total,
        currency: input.currency.toUpperCase(),
        status: input.status,
        dueDate,
        issuedAt,
        notes: input.notes || null,
        clientName: input.clientName || null,
        clientEmail: input.clientEmail || null,
        clientAddress: input.clientAddress || null,
        lineItems: {
          create: input.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: roundToCurrency(item.quantity * item.unitPrice),
          })),
        },
        auditTrail: {
          create: {
            action: "CREATED",
            toStatus: input.status,
            actorId: actor.id || null,
            actorName: actor.name,
            notes: `Invoice created with ${input.lineItems.length} line items (Total: $${totals.total} ${input.currency})`,
          },
        },
      },
      include: {
        lineItems: true,
        auditTrail: true,
      },
    });

    return invoice;
  });
}

/**
 * Creates an invoice directly from an approved quotation
 */
export async function createInvoiceFromQuotation(
  quotationId: string,
  actor: { id?: string; name: string },
  taxRate: number = 0,
  dueDays: number = 14
) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: {
      lineItems: true,
      projectRequest: { select: { id: true, userId: true, user: true } },
      lead: true,
    },
  });

  if (!quotation) {
    throw new Error(`Quotation with ID ${quotationId} not found`);
  }

  const clientName = quotation.projectRequest?.user?.name || quotation.lead?.name || "Client";
  const clientEmail = quotation.projectRequest?.user?.email || quotation.lead?.email;

  const lineItems: InvoiceLineItemInput[] = quotation.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

  const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  return await createInvoice(
    {
      projectRequestId: quotation.projectRequestId || null,
      quotationId: quotation.id,
      source: "QUOTATION",
      lineItems,
      taxRate,
      currency: quotation.currency,
      dueDate,
      notes: `Generated from Approved Quotation ${quotation.quotationNumber} (${quotation.title})`,
      clientName,
      clientEmail,
      status: "ISSUED",
    },
    actor
  );
}

/**
 * Creates an invoice directly from a project milestone
 */
export async function createInvoiceFromMilestone(
  milestoneId: string,
  actor: { id?: string; name: string },
  taxRate: number = 0,
  dueDays: number = 14
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      projectRequest: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new Error(`Milestone with ID ${milestoneId} not found`);
  }

  const clientName = milestone.projectRequest?.user?.name || "Valued Client";
  const clientEmail = milestone.projectRequest?.user?.email;

  const lineItems: InvoiceLineItemInput[] = [
    {
      description: `${milestone.title}${milestone.description ? ` - ${milestone.description}` : ""}`,
      quantity: 1,
      unitPrice: milestone.amount,
    },
  ];

  const dueDate = milestone.dueDate
    ? milestone.dueDate.toISOString()
    : new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();

  return await createInvoice(
    {
      projectRequestId: milestone.projectRequestId || null,
      milestoneId: milestone.id,
      source: "MILESTONE",
      lineItems,
      taxRate,
      currency: "USD",
      dueDate,
      notes: `Milestone Delivery Billing: ${milestone.title}`,
      clientName,
      clientEmail,
      status: "ISSUED",
    },
    actor
  );
}

/**
 * Updates an invoice status with audit tracking
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: InvoiceStatus,
  actor: { id?: string; name: string },
  notes?: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, status: true, invoiceNumber: true, total: true, currency: true },
  });

  if (!invoice) {
    throw new Error(`Invoice with ID ${invoiceId} not found`);
  }

  if (!isValidInvoiceTransition(invoice.status, newStatus)) {
    throw new Error(
      `Cannot transition invoice ${invoice.invoiceNumber} from ${invoice.status} to ${newStatus}`
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        issuedAt: newStatus === "ISSUED" && !invoice.status ? new Date() : undefined,
        paidAt: newStatus === "PAID" ? new Date() : undefined,
        auditTrail: {
          create: {
            action: `STATUS_${newStatus}`,
            fromStatus: invoice.status,
            toStatus: newStatus,
            actorId: actor.id || null,
            actorName: actor.name,
            notes: notes || `Invoice status transitioned from ${invoice.status} to ${newStatus}`,
          },
        },
      },
      include: {
        lineItems: true,
        auditTrail: true,
        payments: true,
      },
    });

    return updated;
  });
}
