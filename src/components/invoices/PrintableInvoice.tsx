"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Mail,
  Calendar,
  FileText,
  RotateCcw,
} from "lucide-react";
import { InvoiceStatus } from "@prisma/client";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string | null;
  transactionRef?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

interface InvoiceAuditRecord {
  id: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  actorName: string;
  notes?: string | null;
  createdAt: string;
}

export interface PrintableInvoiceProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    taxRate: number;
    tax: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    dueDate?: string | null;
    issuedAt?: string | null;
    paidAt?: string | null;
    notes?: string | null;
    clientName?: string | null;
    clientEmail?: string | null;
    clientAddress?: string | null;
    createdAt: string;
    projectRequest?: {
      id: string;
      title: string;
      referenceNumber?: string | null;
    } | null;
    quotation?: {
      id: string;
      quotationNumber: string;
      title: string;
    } | null;
    milestone?: {
      id: string;
      title: string;
    } | null;
    lineItems: InvoiceLineItem[];
    payments: PaymentRecord[];
    auditTrail?: InvoiceAuditRecord[];
  };
  currentUser?: {
    id: string;
    name: string;
    role: "ADMIN" | "CLIENT" | "FREELANCER";
  };
  onPayNow?: () => void;
  isPaying?: boolean;
}

export function PrintableInvoice({
  invoice,
  currentUser,
  onPayNow,
  isPaying = false,
}: PrintableInvoiceProps) {
  const [showAudit, setShowAudit] = useState(false);

  // Status badge styling
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID":
        return <Badge variant="emerald">PAID &amp; SETTLED</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="electric">PARTIALLY PAID</Badge>;
      case "ISSUED":
        return <Badge variant="outline">PAYMENT DUE</Badge>;
      case "OVERDUE":
        return <Badge variant="charcoal">OVERDUE</Badge>;
      case "CANCELLED":
        return <Badge variant="charcoal">CANCELLED</Badge>;
      case "DRAFT":
      default:
        return <Badge variant="outline">DRAFT</Badge>;
    }
  };

  // Compute total paid amount
  const completedPayments = (invoice.payments || []).filter((p) => p.status === "COMPLETED");
  const totalPaid = completedPayments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, invoice.total - totalPaid);

  const canPay =
    (invoice.status === "ISSUED" ||
      invoice.status === "PARTIALLY_PAID" ||
      invoice.status === "OVERDUE") &&
    balanceDue > 0;

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-charcoal-900 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-electric-500/10 text-electric-400 border border-electric-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Invoice Statement</h3>
            <p className="text-xs text-slate-400 font-mono">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {canPay && onPayNow && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPayNow}
              isLoading={isPaying}
              icon={<CreditCard className="w-4 h-4" />}
            >
              Pay ${balanceDue.toLocaleString()} with Razorpay
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print / Save PDF
          </Button>

          {invoice.auditTrail && invoice.auditTrail.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAudit(!showAudit)}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {showAudit ? "Hide Audit Log" : "Audit History"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Printable Sheet */}
      <div
        id="printable-invoice"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 max-w-4xl mx-auto"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="K Web Solutions"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                K WEB SOLUTIONS
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Full-Stack Web Development &amp; Modern Applications
              <br />
              Enterprise Solutions • Creative Digital Platforms
              <br />
              komalmaurya09072005@gmail.com
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              INVOICE
            </h1>
            <div className="text-sm font-mono font-bold text-slate-800">
              {invoice.invoiceNumber}
            </div>
            <div className="pt-2">{getStatusBadge(invoice.status)}</div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To
            </span>
            <div className="font-bold text-sm text-slate-900">
              {invoice.clientName || "Valued Client"}
            </div>
            {invoice.clientEmail && (
              <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{invoice.clientEmail}</span>
              </div>
            )}
            {invoice.clientAddress && (
              <div className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                {invoice.clientAddress}
              </div>
            )}
            {invoice.projectRequest && (
              <div className="mt-2 text-slate-500">
                Project: <strong className="text-slate-700">{invoice.projectRequest.title}</strong>
                {invoice.projectRequest.referenceNumber && (
                  <span className="font-mono ml-1">({invoice.projectRequest.referenceNumber})</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 sm:text-right">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Issue Date
              </span>
              <span className="font-semibold text-slate-700">
                {invoice.issuedAt
                  ? new Date(invoice.issuedAt).toLocaleDateString()
                  : new Date(invoice.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Due Date
              </span>
              <span className="font-semibold text-slate-900">
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : "Due Upon Receipt"}
              </span>
            </div>

            {invoice.quotation && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Reference Quotation
                </span>
                <span className="font-mono text-slate-700">
                  {invoice.quotation.quotationNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-1">Description</th>
                <th className="py-2.5 px-3 text-center w-20">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Rate</th>
                <th className="py-2.5 px-1 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.lineItems.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3.5 px-1 font-medium text-slate-800 leading-relaxed">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-600 font-mono">
                    ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-1 text-right font-bold text-slate-900 font-mono">
                    ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Totals */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="max-w-xs space-y-2">
            {invoice.notes && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Terms &amp; Notes
                </span>
                <p className="text-slate-600 leading-relaxed">{invoice.notes}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">
                Verified Digital Settlement
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Payments are securely processed via Razorpay. Cryptographically verified server-side
                with instant receipt reconciliation.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-slate-700">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-mono font-medium">
                ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                {invoice.currency}
              </span>
            </div>

            {invoice.taxRate > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tax ({invoice.taxRate}%):</span>
                <span className="font-mono font-medium">
                  +${invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
              <span>Total Payable:</span>
              <span className="font-mono">
                ${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                {invoice.currency}
              </span>
            </div>

            {totalPaid > 0 && (
              <div className="flex justify-between py-1 text-emerald-600 font-semibold">
                <span>Amount Paid:</span>
                <span className="font-mono">
                  -${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Balance Due:</span>
              <span className="font-mono text-emerald-600">
                ${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                {invoice.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Transaction History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Payment Records</span>
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {invoice.payments.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-800">
                      {p.transactionRef || "Processing Transaction"}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-2">
                      via {p.paymentMethod || "Razorpay"} •{" "}
                      {new Date(p.paidAt || p.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "REFUNDED"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail Drawer (Admin/Operational History) */}
      {showAudit && invoice.auditTrail && invoice.auditTrail.length > 0 && (
        <div className="print:hidden p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-electric-400" />
              <span>Auditable Invoice History</span>
            </h4>
            <span className="text-xs text-slate-400">
              {invoice.auditTrail.length} Logged Events
            </span>
          </div>

          <div className="space-y-3">
            {invoice.auditTrail.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-charcoal-850 border border-white/5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-electric-400">{log.action}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.notes && <p className="text-slate-300">{log.notes}</p>}
                <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                  <span>Actor: {log.actorName}</span>
                  {log.fromStatus && log.toStatus && (
                    <span>
                      ({log.fromStatus} → {log.toStatus})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
