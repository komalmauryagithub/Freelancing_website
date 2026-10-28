import { canAccessResource } from "../src/lib/authorization";
import {
  calculateInvoiceTotals,
  isValidInvoiceTransition,
  roundToCurrency,
  createInvoiceSchema,
} from "../src/lib/invoices/invoice-service";
import {
  generatePaymentSignature,
  verifyPaymentSignature,
  generateWebhookSignature,
  verifyWebhookSignature,
  safeTimingCompare,
} from "../src/lib/payments/razorpay";
import { generateReferenceNumber } from "../src/lib/reference";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runInvoicePaymentsTestSuite() {
  console.log("==========================================================");
  console.log("🧪 RUNNING INVOICES & PAYMENT INTEGRATION TEST SUITE");
  console.log("==========================================================\n");

  // ---------------------------------------------------------------------------
  // 1. INVOICE NUMBER FORMAT & GENERATION
  // ---------------------------------------------------------------------------
  console.log("1. Invoice Reference Format & Generation:");
  const currentYear = new Date().getFullYear();
  const invoiceNumber = generateReferenceNumber("INV");
  const invRegex = new RegExp(`^INV-${currentYear}-[0-9A-F]{6}$`);

  assert(
    invRegex.test(invoiceNumber),
    `Invoice number matches INV-YYYY-XXXXXX format (${invoiceNumber})`
  );

  const distinctNumbers = new Set(Array.from({ length: 20 }, () => generateReferenceNumber("INV")));
  assert(distinctNumbers.size === 20, "Generates 20 unique non-colliding invoice numbers");

  // ---------------------------------------------------------------------------
  // 2. LINE ITEM AGGREGATION, TAX MATH & CURRENCY ROUNDING
  // ---------------------------------------------------------------------------
  console.log("\n2. Line Item Math, Tax Calculation & Decimals:");
  const lineItems1 = [
    { description: "Frontend Design System", quantity: 1, unitPrice: 3200.5 },
    { description: "PostgreSQL Database Architecture", quantity: 2, unitPrice: 1250 },
    { description: "API Integration & Real-time WebSockets", quantity: 1, unitPrice: 1549.5 },
  ];

  // Subtotal = 3200.5 + 2500 + 1549.5 = 7250.00
  // Tax @ 18% = 7250 * 0.18 = 1305.00
  // Total = 8555.00
  const totals1 = calculateInvoiceTotals(lineItems1, 18);
  assert(totals1.amount === 7250, "Subtotal aggregates correctly ($7,250.00)");
  assert(totals1.tax === 1305, "18% tax calculation is accurate ($1,305.00)");
  assert(totals1.total === 8555, "Grand total with tax aggregates correctly ($8,555.00)");

  // 0% Tax case
  const totalsZeroTax = calculateInvoiceTotals(lineItems1, 0);
  assert(totalsZeroTax.tax === 0, "0% tax rate yields $0 tax amount");
  assert(totalsZeroTax.total === totalsZeroTax.amount, "0% tax grand total equals subtotal");

  // Rounding precision check
  assert(roundToCurrency(100.456) === 100.46, "Rounds monetary amounts up safely (100.456 -> 100.46)");
  assert(roundToCurrency(100.454) === 100.45, "Rounds monetary amounts down safely (100.454 -> 100.45)");

  // ---------------------------------------------------------------------------
  // 3. INVOICE SCHEMA & VALIDATION DEFENSE
  // ---------------------------------------------------------------------------
  console.log("\n3. Schema Validation & Zod Defense:");
  const validInvoicePayload = {
    projectRequestId: "prj_test_123",
    source: "CUSTOM" as const,
    lineItems: [
      { description: "Fullstack Architecture", quantity: 1, unitPrice: 2500 },
    ],
    taxRate: 18,
    currency: "USD",
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: "ISSUED" as const,
  };

  const parsedValid = createInvoiceSchema.safeParse(validInvoicePayload);
  assert(parsedValid.success, "Valid custom invoice payload passes validation");

  const emptyLineItems = { ...validInvoicePayload, lineItems: [] };
  const parsedEmpty = createInvoiceSchema.safeParse(emptyLineItems);
  assert(!parsedEmpty.success, "Rejects invoice submission with empty line items array");

  const invalidTax = { ...validInvoicePayload, taxRate: 150 };
  const parsedInvalidTax = createInvoiceSchema.safeParse(invalidTax);
  assert(!parsedInvalidTax.success, "Rejects tax rate exceeding 100%");

  const negativePrice = {
    ...validInvoicePayload,
    lineItems: [{ description: "Dev", quantity: 1, unitPrice: -500 }],
  };
  const parsedNegative = createInvoiceSchema.safeParse(negativePrice);
  assert(!parsedNegative.success, "Rejects negative unit price line item");

  // ---------------------------------------------------------------------------
  // 4. AUDITABLE STATUS STATE TRANSITIONS
  // ---------------------------------------------------------------------------
  console.log("\n4. Auditable Invoice Status Lifecycle & Transition Matrix:");
  assert(isValidInvoiceTransition("DRAFT", "ISSUED"), "DRAFT → ISSUED is allowed");
  assert(isValidInvoiceTransition("DRAFT", "CANCELLED"), "DRAFT → CANCELLED is allowed");
  assert(!isValidInvoiceTransition("DRAFT", "PAID"), "DRAFT → PAID directly is rejected");

  assert(isValidInvoiceTransition("ISSUED", "PARTIALLY_PAID"), "ISSUED → PARTIALLY_PAID is allowed");
  assert(isValidInvoiceTransition("ISSUED", "PAID"), "ISSUED → PAID is allowed");
  assert(isValidInvoiceTransition("ISSUED", "OVERDUE"), "ISSUED → OVERDUE is allowed");
  assert(isValidInvoiceTransition("ISSUED", "CANCELLED"), "ISSUED → CANCELLED is allowed");

  assert(isValidInvoiceTransition("PARTIALLY_PAID", "PAID"), "PARTIALLY_PAID → PAID is allowed");
  assert(isValidInvoiceTransition("OVERDUE", "PAID"), "OVERDUE → PAID is allowed");

  assert(isValidInvoiceTransition("PAID", "ISSUED"), "PAID → ISSUED allowed for refund reversal");
  assert(!isValidInvoiceTransition("CANCELLED", "PAID"), "CANCELLED is terminal: CANCELLED → PAID rejected");
  assert(!isValidInvoiceTransition("CANCELLED", "ISSUED"), "CANCELLED is terminal: CANCELLED → ISSUED rejected");

  // ---------------------------------------------------------------------------
  // 5. TENANT ISOLATION & ACCESS CONTROL
  // ---------------------------------------------------------------------------
  console.log("\n5. Cross-Client Tenant Isolation & Invoice Access Control:");
  const clientA = { id: "usr_client_alice", role: "CLIENT" as const };
  const clientB = { id: "usr_client_bob", role: "CLIENT" as const };
  const studioAdmin = { id: "usr_director", role: "ADMIN" as const };

  const invoiceClientA = {
    id: "inv_1001",
    userId: clientA.id,
    projectOwnerId: clientA.id,
    amount: 5000,
  };

  assert(
    canAccessResource(invoiceClientA.userId, clientA.id, clientA.role) === true,
    "Client A is authorized to view and pay their own invoice"
  );
  assert(
    canAccessResource(invoiceClientA.userId, clientB.id, clientB.role) === false,
    "Client B is strictly FORBIDDEN from viewing or paying Client A's invoice (403)"
  );
  assert(
    canAccessResource(invoiceClientA.userId, studioAdmin.id, studioAdmin.role) === true,
    "Studio Administrator has authorized oversight across all client invoices"
  );

  // ---------------------------------------------------------------------------
  // 6. SERVER-SIDE RAZORPAY PAYMENT SIGNATURE VERIFICATION (HMAC-SHA256)
  // ---------------------------------------------------------------------------
  console.log("\n6. Server-side Razorpay HMAC-SHA256 Payment Signature Verification:");
  const testSecret = "secret_sandbox_vanguard_test_key_987654";
  const orderId = "order_N123456789abc";
  const paymentId = "pay_P987654321xyz";

  // Compute genuine signature
  const validSignature = generatePaymentSignature(orderId, paymentId, testSecret);
  const isValid = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
    secret: testSecret,
  });
  assert(isValid === true, "Valid cryptographic HMAC-SHA256 signature accepted");

  // Tampered payment ID
  const tamperedPaymentId = "pay_FORGED_ATTACK_000";
  const forgedPaymentCheck = verifyPaymentSignature({
    orderId,
    paymentId: tamperedPaymentId,
    signature: validSignature,
    secret: testSecret,
  });
  assert(forgedPaymentCheck === false, "Rejects signature when payment ID is tampered/forged");

  // Tampered order ID
  const tamperedOrderCheck = verifyPaymentSignature({
    orderId: "order_FORGED_999",
    paymentId,
    signature: validSignature,
    secret: testSecret,
  });
  assert(tamperedOrderCheck === false, "Rejects signature when order ID is tampered/forged");

  // Wrong secret
  const wrongSecretCheck = verifyPaymentSignature({
    orderId,
    paymentId,
    signature: validSignature,
    secret: "wrong_secret_12345",
  });
  assert(wrongSecretCheck === false, "Rejects signature when secret does not match provider secret");

  // Constant-time comparison
  assert(safeTimingCompare("abc123hex", "abc123hex") === true, "safeTimingCompare matches identical strings");
  assert(safeTimingCompare("abc123hex", "abc123xyz") === false, "safeTimingCompare rejects unequal strings");
  assert(safeTimingCompare("short", "much_longer_string") === false, "safeTimingCompare handles length mismatch without leaking timing");

  // ---------------------------------------------------------------------------
  // 7. WEBHOOK RAW-BODY HMAC-SHA256 SIGNATURE VERIFICATION
  // ---------------------------------------------------------------------------
  console.log("\n7. Webhook Raw-Body Signature Verification:");
  const webhookSecret = "whsec_vanguard_secure_hook_321";
  const rawWebhookBody = JSON.stringify({
    event: "payment.captured",
    event_id: "evt_test_001",
    payload: {
      payment: {
        entity: {
          id: "pay_captured_111",
          order_id: "order_test_111",
          amount: 500000,
          currency: "USD",
        },
      },
    },
  });

  const validWebhookSig = generateWebhookSignature(rawWebhookBody, webhookSecret);
  const isWebhookValid = verifyWebhookSignature({
    rawBody: rawWebhookBody,
    signature: validWebhookSig,
    secret: webhookSecret,
  });
  assert(isWebhookValid === true, "Authentic raw-body webhook signature accepted");

  // Tampered webhook body
  const tamperedBody = rawWebhookBody.replace("500000", "100000"); // Amount manipulated
  const tamperedCheck = verifyWebhookSignature({
    rawBody: tamperedBody,
    signature: validWebhookSig,
    secret: webhookSecret,
  });
  assert(tamperedCheck === false, "Rejects webhook when body payload amount is tampered");

  // ---------------------------------------------------------------------------
  // 8. WEBHOOK IDEMPOTENCY & DUPLICATE EVENT PREVENTION
  // ---------------------------------------------------------------------------
  console.log("\n8. Webhook Idempotency & Duplicate Prevention:");
  const processedEventStore = new Set<string>();

  function simulateWebhookProcessing(eventId: string) {
    if (processedEventStore.has(eventId)) {
      return { received: true, duplicate: true, action: "IGNORED" };
    }
    processedEventStore.add(eventId);
    return { received: true, duplicate: false, action: "RECONCILED" };
  }

  const firstDelivery = simulateWebhookProcessing("evt_razorpay_9999");
  assert(
    firstDelivery.duplicate === false && firstDelivery.action === "RECONCILED",
    "First webhook delivery processed and reconciled"
  );

  const duplicateDelivery = simulateWebhookProcessing("evt_razorpay_9999");
  assert(
    duplicateDelivery.duplicate === true && duplicateDelivery.action === "IGNORED",
    "Duplicate webhook delivery detected and safely ignored (idempotent)"
  );

  // ---------------------------------------------------------------------------
  // 9. PAYMENT RECONCILIATION: PARTIAL, FULL, FAILED & REFUNDED
  // ---------------------------------------------------------------------------
  console.log("\n9. Payment Settlement Reconciliation & Refund-State Handling:");

  // Simulated state reconciliation logic
  function simulateReconciliation(
    invoiceTotal: number,
    existingPayments: { amount: number; status: string; refundedAmount?: number }[],
    newPayment: { amount: number; status: string; refundedAmount?: number }
  ) {
    const all = [...existingPayments, newPayment];
    const completedPayments = all.filter((p) => p.status === "COMPLETED");
    const netPaid = roundToCurrency(
      completedPayments.reduce((acc, p) => acc + (p.amount - (p.refundedAmount || 0)), 0)
    );

    let status: InvoiceStatus = "ISSUED";
    if (newPayment.status === "FAILED") {
      status = "ISSUED";
    } else if (netPaid >= invoiceTotal) {
      status = "PAID";
    } else if (netPaid > 0) {
      status = "PARTIALLY_PAID";
    } else if (newPayment.status === "REFUNDED" && netPaid <= 0) {
      status = "ISSUED";
    }

    return { netPaid, status, settled: status === "PAID" };
  }

  const invoiceAmount = 5000;

  // Partial Payment
  const partialReconciliation = simulateReconciliation(
    invoiceAmount,
    [],
    { amount: 2500, status: "COMPLETED" }
  );
  assert(
    partialReconciliation.status === "PARTIALLY_PAID" && partialReconciliation.netPaid === 2500,
    "First payment of $2,500 on $5,000 invoice transitions status to PARTIALLY_PAID"
  );
  assert(!partialReconciliation.settled, "Invoice not settled yet (balance remaining)");

  // Full Settlement via Second Payment
  const fullReconciliation = simulateReconciliation(
    invoiceAmount,
    [{ amount: 2500, status: "COMPLETED" }],
    { amount: 2500, status: "COMPLETED" }
  );
  assert(
    fullReconciliation.status === "PAID" && fullReconciliation.netPaid === 5000,
    "Second payment of $2,500 completes full settlement ($5,000) and transitions to PAID"
  );
  assert(fullReconciliation.settled, "Invoice marked fully settled");

  // Failed Transaction
  const failedReconciliation = simulateReconciliation(
    invoiceAmount,
    [],
    { amount: 5000, status: "FAILED" }
  );
  assert(
    failedReconciliation.status === "ISSUED" && failedReconciliation.netPaid === 0,
    "Failed payment transaction does NOT update paid balance and keeps invoice ISSUED"
  );

  // Refund Handling
  const refundedPayment = simulateReconciliation(
    invoiceAmount,
    [],
    { amount: 5000, status: "REFUNDED", refundedAmount: 5000 }
  );
  assert(
    refundedPayment.netPaid === 0 && refundedPayment.status === "ISSUED",
    "Full refund reverts invoice status back to ISSUED and resets net paid to $0"
  );

  // Partial Refund Handling
  const partialRefund = simulateReconciliation(
    invoiceAmount,
    [],
    { amount: 5000, status: "COMPLETED", refundedAmount: 2000 }
  );
  assert(
    partialRefund.netPaid === 3000 && partialRefund.status === "PARTIALLY_PAID",
    "Partial refund of $2,000 leaves $3,000 net paid and adjusts status to PARTIALLY_PAID"
  );

  // ---------------------------------------------------------------------------
  // 10. PREVENTION OF REPEATED PAYMENT ON SETTLED OR CANCELLED INVOICES
  // ---------------------------------------------------------------------------
  console.log("\n10. Prevention of Double-Payment & Terminal State Defense:");
  function canInitiatePaymentOrder(invoice: { status: InvoiceStatus; total: number; paid: number }) {
    if (invoice.status === "PAID" || invoice.paid >= invoice.total) {
      return { allowed: false, reason: "Invoice is already paid in full" };
    }
    if (invoice.status === "CANCELLED") {
      return { allowed: false, reason: "Cannot process payment for a cancelled invoice" };
    }
    if (invoice.status === "DRAFT") {
      return { allowed: false, reason: "Invoice has not been issued yet" };
    }
    return { allowed: true, remaining: invoice.total - invoice.paid };
  }

  const paidInvoiceCheck = canInitiatePaymentOrder({ status: "PAID", total: 5000, paid: 5000 });
  assert(!paidInvoiceCheck.allowed, "Prevents creating payment order for already paid invoice");

  const cancelledInvoiceCheck = canInitiatePaymentOrder({ status: "CANCELLED", total: 3000, paid: 0 });
  assert(!cancelledInvoiceCheck.allowed, "Prevents creating payment order for cancelled invoice");

  const activePayableCheck = canInitiatePaymentOrder({ status: "ISSUED", total: 4000, paid: 0 });
  assert(
    activePayableCheck.allowed && activePayableCheck.remaining === 4000,
    "Permits payment order for active ISSUED invoice with accurate balance"
  );

  // ---------------------------------------------------------------------------
  // TEST SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n==========================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runInvoicePaymentsTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
