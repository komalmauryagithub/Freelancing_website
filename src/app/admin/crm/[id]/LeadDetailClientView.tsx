"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  FileText,
  Mail,
  User,
  Phone,
  Layers,
  File,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Send,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

export function LeadDetailClientView({ lead }: { lead: any }) {
  const router = useRouter();

  // Status & Notes state
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [internalNotes, setInternalNotes] = useState(lead.internalNotes || "");
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 10) : ""
  );

  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState<string | null>(null);

  // Convert to Project state
  const [isConverting, setIsConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  // Quotation Modal state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    title: `${lead.projectType ? lead.projectType.replace("_", " ").toUpperCase() : "Custom"} Project Proposal`,
    scope: lead.requirements || "Detailed engineering scope and delivery milestones.",
    estimatedTimeline: lead.timeline || "3-4 Weeks",
    validDays: 30,
    lineItems: [
      { description: "Architecture, Data Schema & UI Design System", quantity: 1, unitPrice: 2000 },
      { description: "Frontend & Backend Next.js Implementation", quantity: 1, unitPrice: 3500 },
      { description: "Quality Assurance, Lighthouse 90+ & Production Launch", quantity: 1, unitPrice: 1500 },
    ],
  });

  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Status transition handler for leads
  const handleStatusChange = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    try {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Save internal notes & follow up date
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setNotesFeedback(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalNotes,
          followUpDate: followUpDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save notes");
      setNotesFeedback("Notes saved successfully.");
      setTimeout(() => setNotesFeedback(null), 3000);
      router.refresh();
    } catch {
      setNotesFeedback("Error saving notes.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Convert to project
  const handleConvertToProject = async () => {
    if (!confirm("Are you sure you want to convert this lead into an active project?")) return;
    setIsConverting(true);
    setConversionMessage(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/convert`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to convert lead.");

      setConversionMessage("Lead converted to project successfully!");
      router.refresh();
    } catch (err) {
      setConversionMessage(err instanceof Error ? err.message : "Conversion error.");
    } finally {
      setIsConverting(false);
    }
  };

  // Line item helpers
  const addLineItem = () => {
    setQuoteForm((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { description: "Additional Milestone / Deliverable", quantity: 1, unitPrice: 1000 },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    setQuoteForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setQuoteForm((prev) => {
      const updated = [...prev.lineItems];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, lineItems: updated };
    });
  };

  const calculatedQuoteTotal = quoteForm.lineItems.reduce(
    (acc, item) => acc + (item.quantity || 1) * (item.unitPrice || 0),
    0
  );

  // Submit quotation
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingQuote(true);
    setQuoteError(null);

    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          title: quoteForm.title,
          scope: quoteForm.scope,
          estimatedTimeline: quoteForm.estimatedTimeline,
          validDays: quoteForm.validDays,
          lineItems: quoteForm.lineItems.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create quotation.");

      setIsQuoteModalOpen(false);
      router.refresh();
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : "Quotation creation error.");
    } finally {
      setIsCreatingQuote(false);
    }
  };

  // Change quotation status (e.g. mark sent, accepted, rejected)
  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: string) => {
    const reason =
      newStatus === "REJECTED" ? prompt("Please enter the client's rejection reason (optional):") : "";

    try {
      await fetch(`/api/admin/quotations/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: reason || undefined,
        }),
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update quotation status", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Requirements, Features & Quotations */}
      <div className="lg:col-span-8 space-y-8">
        {/* Project Parameters Card */}
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-electric-400" />
              Project Specification &amp; Brief
            </h2>
            <span className="text-xs text-slate-400 capitalize">
              Type: <strong className="text-white">{lead.projectType ? lead.projectType.replace("_", " ") : "Custom"}</strong>
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Business &amp; Requirements
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 bg-charcoal-850 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
              {lead.requirements || lead.message}
            </p>
          </div>

          {/* Selected Features */}
          {lead.selectedFeatures && lead.selectedFeatures.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Selected Features ({lead.selectedFeatures.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.selectedFeatures.map((feat: string) => (
                  <span
                    key={feat}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-200 border border-white/10"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {lead.attachments && lead.attachments.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Attachments ({lead.attachments.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.attachments.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-electric-400 hover:text-electric-300 flex items-center gap-1.5"
                  >
                    <File className="w-3.5 h-3.5" />
                    <span>View File {idx + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Quotations & Proposals Section */}
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-violetAccent-400" />
                Itemized Quotations ({lead.quotations?.length || 0})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Formal quotations sent to the client with line items and audit logs.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuoteModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Quotation
            </Button>
          </div>

          {lead.quotations && lead.quotations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No quotations prepared yet for this lead. Click &quot;Create Quotation&quot; to build line items.
            </div>
          ) : (
            <div className="space-y-6">
              {lead.quotations.map((quote: any) => (
                <div
                  key={quote.id}
                  className="p-5 rounded-xl bg-charcoal-850 border border-white/10 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-electric-400">
                          {quote.quotationNumber}
                        </span>
                        <Badge variant="violet" size="sm">
                          {quote.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-white text-base mt-1">{quote.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-white">
                        ${quote.price.toLocaleString()} {quote.currency}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Valid until {new Date(quote.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto rounded-lg border border-white/5 bg-charcoal-900/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-charcoal-800 text-[10px] uppercase text-slate-400">
                        <tr>
                          <th className="p-2.5">Deliverable Description</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {quote.lineItems?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="p-2.5">{item.description}</td>
                            <td className="p-2.5 text-center">{item.quantity}</td>
                            <td className="p-2.5 text-right">${item.unitPrice.toLocaleString()}</td>
                            <td className="p-2.5 text-right font-semibold text-white">
                              ${item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Audit Trail */}
                  {quote.auditTrail && quote.auditTrail.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 block mb-1">
                        Audit Trail:
                      </span>
                      {quote.auditTrail.map((log: any) => (
                        <div key={log.id} className="flex items-start gap-2">
                          <span className="font-mono text-electric-400 shrink-0">
                            [{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                          </span>
                          <span>
                            <strong>{log.actorName}</strong>: {log.notes}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Bar for Quotation */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 justify-end">
                    {quote.status === "DRAFT" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateQuoteStatus(quote.id, "SENT")}
                        icon={<Send className="w-3.5 h-3.5" />}
                      >
                        Mark as Sent to Client
                      </Button>
                    )}
                    {quote.status !== "ACCEPTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuoteStatus(quote.id, "ACCEPTED")}
                        className="text-emerald-400 hover:text-emerald-300 border-emerald-500/20"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Record Acceptance
                      </Button>
                    )}
                    {quote.status !== "REJECTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuoteStatus(quote.id, "REJECTED")}
                        className="text-red-400 hover:text-red-300 border-red-500/20"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Record Rejection
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right Column: Lead Management & Actions */}
      <div className="lg:col-span-4 space-y-6">
        {/* Contact Info Card */}
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
            Client Details
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-electric-400 shrink-0" />
              <span className="font-semibold text-white">{lead.name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-electric-400 shrink-0" />
              <a href={`mailto:${lead.email}`} className="hover:text-white transition-colors truncate">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-electric-400 shrink-0" />
                <span>{lead.phone}</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
              <div>
                Indicative Budget: <strong className="text-white">{lead.indicativeBudget || lead.budgetRange || "Flexible"}</strong>
              </div>
              <div>
                Target Timeline: <strong className="text-white">{lead.timeline}</strong>
              </div>
            </div>
          </div>
        </Card>

        {/* Lead Status Selector Card */}
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
            Lead Status
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"].map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  currentStatus === st
                    ? "bg-electric-500 text-charcoal-950 shadow-md ring-1 ring-electric-400"
                    : "bg-charcoal-800 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </Card>

        {/* Convert to Project Action */}
        <Card className="p-6 bg-charcoal-900 border border-emerald-500/20 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Project Conversion
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Convert this lead into an active project request with client portal access and delivery milestones.
          </p>

          {conversionMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              {conversionMessage}
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleConvertToProject}
            isLoading={isConverting}
            disabled={isConverting || Boolean(lead.convertedProjectId)}
          >
            {lead.convertedProjectId ? "Already Converted" : "Convert Lead to Project"}
          </Button>
        </Card>

        {/* Internal Notes & Follow-up Card */}
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
            Internal Notes &amp; Follow-Up
          </h2>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Next Follow-Up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
              Private Internal Notes
            </label>
            <textarea
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Record call takeaways, client objections, technical dependencies..."
              className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-electric-400 resize-none"
            />
          </div>

          {notesFeedback && (
            <div className="text-xs text-electric-400 font-medium">
              {notesFeedback}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={handleSaveNotes}
            isLoading={isSavingNotes}
          >
            Save Notes &amp; Date
          </Button>
        </Card>
      </div>

      {/* CREATE QUOTATION MODAL */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Create Itemized Quotation"
        description="Build line items, establish timeline, and formalize scope for this client."
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4 mt-2">
          {quoteError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {quoteError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Quotation Title *
            </label>
            <input
              type="text"
              required
              value={quoteForm.title}
              onChange={(e) => setQuoteForm({ ...quoteForm, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Estimated Timeline *
              </label>
              <input
                type="text"
                required
                value={quoteForm.estimatedTimeline}
                onChange={(e) => setQuoteForm({ ...quoteForm, estimatedTimeline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Validity (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={quoteForm.validDays}
                onChange={(e) => setQuoteForm({ ...quoteForm, validDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400"
              />
            </div>
          </div>

          {/* Line items manager */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase text-slate-400">
                Line Items ({quoteForm.lineItems.length})
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-electric-400 hover:text-electric-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {quoteForm.lineItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                    placeholder="Deliverable description"
                    className="flex-1 px-3 py-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, "quantity", Number(e.target.value))}
                    className="w-16 px-2 py-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs text-center focus:outline-none focus:border-electric-400"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(idx, "unitPrice", Number(e.target.value))}
                    className="w-24 px-2 py-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs text-right focus:outline-none focus:border-electric-400"
                  />
                  {quoteForm.lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 rounded-xl bg-charcoal-850 border border-white/5 flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Computed Quotation Total:</span>
              <span className="text-lg font-black text-electric-400">
                ${calculatedQuoteTotal.toLocaleString()} USD
              </span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsQuoteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreatingQuote}
            >
              Create Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
