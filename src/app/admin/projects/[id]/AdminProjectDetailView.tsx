"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { RealtimeChatBox } from "@/components/chat/RealtimeChatBox";
import {
  Layers,
  Clock,
  FileText,
  Plus,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Printer,
  Receipt,
} from "lucide-react";
import { ProjectStage, MilestoneStatus, ChangeRequestStatus, InvoiceStatus } from "@prisma/client";

const STAGES: ProjectStage[] = [
  "ENQUIRY",
  "DISCUSSION",
  "QUOTATION",
  "APPROVED",
  "DEVELOPMENT",
  "REVIEW",
  "DELIVERED",
];

const MILESTONE_STATUSES: MilestoneStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "RELEASED",
];

const CHANGE_STATUSES: ChangeRequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "IMPLEMENTED",
];

export function AdminProjectDetailView({
  project,
  currentUser,
}: {
  project: any;
  currentUser?: any;
}) {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "milestones" | "change-requests" | "documents" | "messages" | "invoices"
  >("pipeline");

  // Stage Management State
  const [selectedStage, setSelectedStage] = useState<ProjectStage>(project.stage);
  const [stageNotes, setStageNotes] = useState("");
  const [productionUrl, setProductionUrl] = useState(project.productionUrl || "");
  const [repositoryUrl, setRepositoryUrl] = useState(project.repositoryUrl || "");
  const [handoverNotes, setHandoverNotes] = useState(project.handoverNotes || "");
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageFeedback, setStageFeedback] = useState<string | null>(null);

  // New Milestone Modal State
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState<number>(0);
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestoneOrder, setMilestoneOrder] = useState<number>(
    (project.milestones?.length || 0) + 1
  );
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);

  // Edit Milestone State
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editMilestoneStatus, setEditMilestoneStatus] = useState<MilestoneStatus>("PENDING");
  const [editMilestoneProgress, setEditMilestoneProgress] = useState<number>(0);
  const [editMilestoneDueDate, setEditMilestoneDueDate] = useState<string>("");
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);

  // Change Request Review State
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [changeStatus, setChangeStatus] = useState<ChangeRequestStatus>("UNDER_REVIEW");
  const [changeAssessment, setChangeAssessment] = useState("");
  const [changeCost, setChangeCost] = useState<number>(0);
  const [changeDays, setChangeDays] = useState<number>(0);
  const [isSavingChange, setIsSavingChange] = useState(false);

  // Document Upload State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Discussion Message State
  const [messageInput, setMessageInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Invoices & Billing State
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceSource, setInvoiceSource] = useState<"CUSTOM" | "QUOTATION" | "MILESTONE">("CUSTOM");
  const [selectedQuotationId, setSelectedQuotationId] = useState(
    project.quotations?.[0]?.id || ""
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    project.milestones?.[0]?.id || ""
  );
  const [customLineItems, setCustomLineItems] = useState([
    { description: "Phase Deliverable Implementation", quantity: 1, unitPrice: 2000 },
  ]);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState(0);
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceFeedback, setInvoiceFeedback] = useState<string | null>(null);

  // Status Change State
  const [editingInvoiceStatusId, setEditingInvoiceStatusId] = useState<string | null>(null);
  const [targetInvoiceStatus, setTargetInvoiceStatus] = useState<InvoiceStatus>("ISSUED");
  const [statusChangeNotes, setStatusChangeNotes] = useState("");
  const [isUpdatingInvoiceStatus, setIsUpdatingInvoiceStatus] = useState(false);

  // Handle Create Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingInvoice(true);
    setInvoiceFeedback(null);

    try {
      let body: any = {
        projectRequestId: project.id,
        source: invoiceSource,
        taxRate: Number(invoiceTaxRate),
      };

      if (invoiceSource === "QUOTATION") {
        if (!selectedQuotationId) throw new Error("Please select a quotation");
        body.quotationId = selectedQuotationId;
      } else if (invoiceSource === "MILESTONE") {
        if (!selectedMilestoneId) throw new Error("Please select a milestone");
        body.milestoneId = selectedMilestoneId;
      } else {
        body.lineItems = customLineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }));
        body.dueDate = invoiceDueDate ? new Date(invoiceDueDate).toISOString() : undefined;
        body.notes = invoiceNotes || undefined;
        body.status = "ISSUED";
      }

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to create invoice");
      }

      setIsAddInvoiceOpen(false);
      setInvoiceFeedback("Invoice issued successfully!");
      router.refresh();
    } catch (err: any) {
      setInvoiceFeedback(`Error: ${err.message}`);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  // Handle Status Update
  const handleUpdateInvoiceStatus = async (invoiceId: string) => {
    setIsUpdatingInvoiceStatus(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetInvoiceStatus,
          notes: statusChangeNotes || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to update status");
      }

      setEditingInvoiceStatusId(null);
      setStatusChangeNotes("");
      router.refresh();
    } catch (err: any) {
      alert(`Error updating invoice status: ${err.message}`);
    } finally {
      setIsUpdatingInvoiceStatus(false);
    }
  };

  // Handle Stage Update
  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStage(true);
    setStageFeedback(null);

    try {
      const res = await fetch(`/api/admin/projects/${project.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: selectedStage,
          notes: stageNotes,
          productionUrl,
          repositoryUrl,
          handoverNotes,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to update project stage");
      }

      setStageFeedback("Stage and handover details updated successfully!");
      setStageNotes("");
      router.refresh();
    } catch (err: any) {
      setStageFeedback(`Error: ${err.message}`);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  // Handle Add Milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMilestone(true);

    try {
      const res = await fetch(`/api/admin/projects/${project.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: milestoneTitle,
          description: milestoneDesc || undefined,
          amount: Number(milestoneAmount),
          dueDate: milestoneDueDate ? new Date(milestoneDueDate).toISOString() : undefined,
          order: Number(milestoneOrder),
        }),
      });

      if (res.ok) {
        setMilestoneTitle("");
        setMilestoneDesc("");
        setMilestoneAmount(0);
        setMilestoneDueDate("");
        setIsAddMilestoneOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingMilestone(false);
    }
  };

  // Handle Save Milestone Edit
  const handleSaveMilestone = async (milestoneId: string) => {
    setIsSavingMilestone(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editMilestoneStatus,
          progressPercentage: Number(editMilestoneProgress),
          dueDate: editMilestoneDueDate ? new Date(editMilestoneDueDate).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        setEditingMilestoneId(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingMilestone(false);
    }
  };

  // Handle Delete Milestone
  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save Change Request Review
  const handleSaveChangeRequest = async (requestId: string) => {
    setIsSavingChange(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}/change-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: changeStatus,
          impactAssessment: changeAssessment || undefined,
          additionalCost: Number(changeCost),
          additionalDays: Number(changeDays),
        }),
      });

      if (res.ok) {
        setEditingChangeId(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingChange(false);
    }
  };

  // Handle Document Upload
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;

    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", docFile);
      if (docName) formData.append("name", docName);

      const res = await fetch(`/api/admin/projects/${project.id}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setDocFile(null);
        setDocName("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    setIsSendingMessage(true);
    try {
      const res = await fetch(`/api/portal/projects/${project.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageInput }),
      });

      if (res.ok) {
        setMessageInput("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100
  );
  const milestonePercent =
    milestones.length > 0
      ? Math.round((completedMilestones.length / milestones.length) * 100)
      : project.stage === "DELIVERED"
      ? 100
      : project.stage === "DEVELOPMENT"
      ? 50
      : 15;

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: "pipeline", label: "Pipeline & Handover", icon: Layers },
          { id: "milestones", label: `Milestones (${milestones.length})`, icon: Clock },
          {
            id: "change-requests",
            label: `Change Requests (${project.changeRequests?.length || 0})`,
            icon: Plus,
          },
          {
            id: "documents",
            label: `Protected Docs (${project.documents?.length || 0})`,
            icon: FileText,
          },
          {
            id: "invoices",
            label: `Invoices & Settlement (${project.invoices?.length || 0})`,
            icon: Receipt,
          },
          {
            id: "messages",
            label: `Client Discussions (${project.messages?.length || 0})`,
            icon: MessageSquare,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? "bg-electric-500 text-charcoal-950 font-bold shadow-md"
                  : "bg-charcoal-900 text-slate-400 hover:text-white hover:bg-charcoal-850"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PIPELINE & STAGE MANAGEMENT */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Stage Progression &amp; Handover</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Transition this project across engineering checkpoints and configure client delivery details.
                </p>
              </div>

              {stageFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    stageFeedback.startsWith("Error")
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {stageFeedback}
                </div>
              )}

              <form onSubmit={handleUpdateStage} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Select Target Project Stage
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {STAGES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStage(st)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                          selectedStage === st
                            ? "bg-electric-500 text-charcoal-950 border-electric-400 shadow-md"
                            : "bg-charcoal-850 text-slate-400 border-white/5 hover:text-white hover:bg-charcoal-800"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Stage Transition Audit Notes
                  </label>
                  <input
                    type="text"
                    value={stageNotes}
                    onChange={(e) => setStageNotes(e.target.value)}
                    placeholder="e.g. Scope approved by client; development sprint 1 initiated."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Handover &amp; Staging Credentials (Delivered State)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Production / Live Staging URL
                      </label>
                      <input
                        type="url"
                        value={productionUrl}
                        onChange={(e) => setProductionUrl(e.target.value)}
                        placeholder="https://app.clientdomain.com"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Repository / VCS URL
                      </label>
                      <input
                        type="url"
                        value={repositoryUrl}
                        onChange={(e) => setRepositoryUrl(e.target.value)}
                        placeholder="https://github.com/vanguard-studios/client-repo"
                        className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Handover Guide / Hosting Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={handoverNotes}
                      onChange={(e) => setHandoverNotes(e.target.value)}
                      placeholder="Deployment instructions, DNS records, administrator user guide, and access credentials."
                      className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isUpdatingStage}
                  >
                    Save Stage &amp; Handover Details
                  </Button>
                </div>
              </form>
            </Card>

            {/* Stage History */}
            <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Stage Progression Audit Trail</h3>
              {project.stageHistory && project.stageHistory.length === 0 ? (
                <p className="text-xs text-slate-400">No stage history logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {project.stageHistory.map((h: any) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl bg-charcoal-850 border border-white/5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="violet" size="sm">
                          {h.stage}
                        </Badge>
                        <span className="text-slate-500 font-mono">
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium">{h.notes}</p>
                      <span className="text-[10px] text-slate-400">Actor: {h.actorName}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Client Summary
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-semibold text-white">{project.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-white">{project.user?.email}</span>
                </div>
                {project.user?.company && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Company:</span>
                    <span className="font-semibold text-white">{project.user.company}</span>
                  </div>
                )}
                {project.user?.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold text-white">{project.user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Indicative Budget:</span>
                  <span className="font-semibold text-electric-400">{project.budget || "N/A"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Milestone Progress
              </h3>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Completed Checkpoints</span>
                <span className="font-bold text-electric-400">{milestonePercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
                <div
                  className="h-full bg-electric-500"
                  style={{ width: `${milestonePercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {completedMilestones.length} of {milestones.length} milestones completed
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES MANAGEMENT */}
      {activeTab === "milestones" && (
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Milestones &amp; Deadlines</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage development deliverables, assign completion deadlines, and adjust progress percentage.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddMilestoneOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Milestone
            </Button>
          </div>

          {milestones.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No milestones defined yet. Click &ldquo;Add Milestone&rdquo; to create the first delivery checkpoint.
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((m: any, idx: number) => {
                const isEditing = editingMilestoneId === m.id;
                const isDone =
                  m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100;

                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-xl bg-charcoal-850 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{m.title}</h4>
                          <span className="text-[11px] text-slate-400">
                            Deadline: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "No deadline"} • Order: #{m.order}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isDone ? "emerald" : m.status === "IN_PROGRESS" ? "electric" : "outline"}
                          size="sm"
                        >
                          {m.status} ({m.progressPercentage}%)
                        </Badge>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingMilestoneId(null);
                            } else {
                              setEditingMilestoneId(m.id);
                              setEditMilestoneStatus(m.status);
                              setEditMilestoneProgress(m.progressPercentage);
                              setEditMilestoneDueDate(
                                m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : ""
                              );
                            }
                          }}
                          className="p-1.5 rounded-lg bg-charcoal-800 text-slate-300 hover:text-white border border-white/5 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {m.description && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-charcoal-900/60 p-3 rounded-lg border border-white/5">
                        {m.description}
                      </p>
                    )}

                    {/* Inline Editing Form */}
                    {isEditing && (
                      <div className="p-4 rounded-xl bg-charcoal-900 border border-electric-500/30 space-y-3">
                        <h5 className="text-xs font-bold text-electric-400">Edit Milestone Details</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Status</label>
                            <select
                              value={editMilestoneStatus}
                              onChange={(e) => setEditMilestoneStatus(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            >
                              {MILESTONE_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Progress Percentage ({editMilestoneProgress}%)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editMilestoneProgress}
                              onChange={(e) => setEditMilestoneProgress(Number(e.target.value))}
                              className="w-full accent-electric-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={editMilestoneDueDate}
                              onChange={(e) => setEditMilestoneDueDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            >
                            </input>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMilestoneId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isSavingMilestone}
                            onClick={() => handleSaveMilestone(m.id)}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Milestone Modal */}
          <Modal
            isOpen={isAddMilestoneOpen}
            onClose={() => setIsAddMilestoneOpen(false)}
            title="Create Project Milestone"
          >
            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. Phase 1 Architecture & Database Schema"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows={3}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Outline key deliverables, tests, and deliverables expected in this milestone."
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-electric-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={milestoneOrder}
                    onChange={(e) => setMilestoneOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddMilestoneOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isCreatingMilestone}
                >
                  Create Milestone
                </Button>
              </div>
            </form>
          </Modal>
        </Card>
      )}

      {/* TAB 3: CHANGE REQUESTS MANAGEMENT */}
      {activeTab === "change-requests" && (
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Client Change Requests</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review modifications requested by the client, provide engineering impact assessments, and adjust billing/timelines.
            </p>
          </div>

          {project.changeRequests?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No change requests have been submitted for this project.
            </div>
          ) : (
            <div className="space-y-4">
              {project.changeRequests.map((cr: any) => {
                const isEditing = editingChangeId === cr.id;

                return (
                  <div
                    key={cr.id}
                    className="p-5 rounded-xl bg-charcoal-850 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">{cr.title}</h4>
                          <Badge
                            variant={
                              cr.status === "APPROVED"
                                ? "emerald"
                                : cr.status === "IMPLEMENTED"
                                ? "violet"
                                : "outline"
                            }
                            size="sm"
                          >
                            {cr.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Submitted on {new Date(cr.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            setEditingChangeId(null);
                          } else {
                            setEditingChangeId(cr.id);
                            setChangeStatus(cr.status);
                            setChangeAssessment(cr.impactAssessment || "");
                            setChangeCost(cr.additionalCost || 0);
                            setChangeDays(cr.additionalDays || 0);
                          }
                        }}
                      >
                        {isEditing ? "Close Review" : "Review Request"}
                      </Button>
                    </div>

                    <div className="text-xs text-slate-300 bg-charcoal-900 p-3.5 rounded-lg border border-white/5 leading-relaxed">
                      {cr.description}
                    </div>

                    {cr.impactAssessment && !isEditing && (
                      <div className="text-xs text-slate-300 bg-charcoal-800 p-3.5 rounded-lg border border-electric-500/20 space-y-1">
                        <span className="font-bold text-electric-400">Engineering Assessment:</span>
                        <p>{cr.impactAssessment}</p>
                        <div className="flex gap-4 pt-1 text-[11px] text-slate-400">
                          <span>Cost Delta: ${cr.additionalCost || 0}</span>
                          <span>Timeline Delta: +{cr.additionalDays || 0} days</span>
                        </div>
                      </div>
                    )}

                    {/* Review Form */}
                    {isEditing && (
                      <div className="p-4 rounded-xl bg-charcoal-900 border border-electric-500/30 space-y-3">
                        <h5 className="text-xs font-bold text-electric-400">
                          Engineering Review &amp; Impact
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Status Decision
                            </label>
                            <select
                              value={changeStatus}
                              onChange={(e) => setChangeStatus(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            >
                              {CHANGE_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Additional Cost ($ USD)
                            </label>
                            <input
                              type="number"
                              value={changeCost}
                              onChange={(e) => setChangeCost(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Additional Timeline (Days)
                            </label>
                            <input
                              type="number"
                              value={changeDays}
                              onChange={(e) => setChangeDays(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Impact Assessment &amp; Feasibility Notes
                          </label>
                          <textarea
                            rows={3}
                            value={changeAssessment}
                            onChange={(e) => setChangeAssessment(e.target.value)}
                            placeholder="Detail technical scope change, architectural implications, and acceptance conditions."
                            className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingChangeId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isSavingChange}
                            onClick={() => handleSaveChangeRequest(cr.id)}
                          >
                            Save Review
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: DOCUMENTS MANAGEMENT */}
      {activeTab === "documents" && (
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Protected Project Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload architecture diagrams, signed contracts, wireframes, and deliverables with strictly authorized downloads.
              </p>
            </div>
          </div>

          {/* Upload Box */}
          <form
            onSubmit={handleUploadDocument}
            className="p-5 rounded-xl bg-charcoal-850 border border-dashed border-white/20 space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Attach New Protected Document
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Phase 1 Architecture Blueprint"
                  className="w-full px-3 py-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Select File (PDF, DOCX, ZIP, PNG, JSON - max 25MB)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full px-2 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-electric-500 file:text-charcoal-950 file:font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUploadingDoc}
                icon={<UploadCloud className="w-3.5 h-3.5" />}
              >
                Upload &amp; Protect Document
              </Button>
            </div>
          </form>

          {/* Document List */}
          {project.documents?.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No documents attached to this project yet.
            </div>
          ) : (
            <div className="space-y-3">
              {project.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-charcoal-850 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-electric-500/10 text-electric-400 flex items-center justify-center shrink-0 border border-electric-500/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded by {doc.uploadedBy} on {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/api/portal/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-charcoal-800 text-electric-400 hover:text-white hover:bg-electric-500/20 border border-electric-500/20 transition-colors"
                  >
                    <span>Download</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 6: INVOICES & SETTLEMENT */}
      {activeTab === "invoices" && (
        <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Project Invoices &amp; Settlement</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Issue auditable statements, track tax rates, and review verified Razorpay settlements.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddInvoiceOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Issue New Invoice
            </Button>
          </div>

          {invoiceFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold ${
                invoiceFeedback.startsWith("Error")
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {invoiceFeedback}
            </div>
          )}

          {project.invoices && project.invoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No invoices generated for this project yet. Invoices can be generated from approved
              quotations, milestones, or custom scope line items.
            </div>
          ) : (
            <div className="space-y-4">
              {project.invoices.map((inv: any) => {
                const isEditingStatus = editingInvoiceStatusId === inv.id;
                const completedPayments = (inv.payments || []).filter(
                  (p: any) => p.status === "COMPLETED"
                );
                const totalPaid = completedPayments.reduce(
                  (acc: number, p: any) => acc + (p.amount - (p.refundedAmount || 0)),
                  0
                );
                const balanceDue = Math.max(0, inv.total - totalPaid);

                return (
                  <div
                    key={inv.id}
                    className="p-5 rounded-2xl bg-charcoal-850 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-400 flex items-center justify-center shrink-0 border border-electric-500/20">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">
                              {inv.invoiceNumber}
                            </span>
                            <Badge
                              variant={
                                inv.status === "PAID"
                                  ? "emerald"
                                  : inv.status === "PARTIALLY_PAID"
                                  ? "electric"
                                  : inv.status === "OVERDUE"
                                  ? "charcoal"
                                  : "outline"
                              }
                              size="sm"
                            >
                              {inv.status}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Issued: {new Date(inv.createdAt).toLocaleDateString()}
                            {inv.dueDate && ` • Due: ${new Date(inv.dueDate).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-base font-bold text-white font-mono">
                          ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                          {inv.currency}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Subtotal: ${inv.amount.toLocaleString()} • Tax: ${inv.tax.toLocaleString()} (
                          {inv.taxRate}%)
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    {inv.lineItems && inv.lineItems.length > 0 && (
                      <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Line Items
                        </span>
                        {inv.lineItems.map((item: any, idx: number) => (
                          <div key={item.id || idx} className="flex justify-between text-slate-300">
                            <span>
                              {item.description}{" "}
                              {item.quantity > 1 && (
                                <span className="text-slate-500">× {item.quantity}</span>
                              )}
                            </span>
                            <span className="font-mono text-slate-200">
                              ${item.total.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Settlements summary */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <div className="space-x-3">
                        <span className="text-slate-400">
                          Total Settled:{" "}
                          <strong className="text-emerald-400 font-mono">
                            ${totalPaid.toLocaleString()}
                          </strong>
                        </span>
                        {balanceDue > 0 && (
                          <span className="text-slate-400">
                            Remaining:{" "}
                            <strong className="text-electric-400 font-mono">
                              ${balanceDue.toLocaleString()}
                            </strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/portal/invoices/${inv.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs font-semibold text-white hover:bg-charcoal-700 hover:text-electric-400 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Statement / PDF</span>
                        </a>

                        <button
                          onClick={() => {
                            if (isEditingStatus) {
                              setEditingInvoiceStatusId(null);
                            } else {
                              setEditingInvoiceStatusId(inv.id);
                              setTargetInvoiceStatus(inv.status);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-charcoal-800 text-slate-300 hover:text-white border border-white/5 transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{isEditingStatus ? "Close" : "Change Status"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Status Changer */}
                    {isEditingStatus && (
                      <div className="p-4 rounded-xl bg-charcoal-900 border border-electric-500/30 space-y-3">
                        <h5 className="text-xs font-bold text-electric-400">
                          Update Invoice Status &amp; Audit Log
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              New Invoice Status
                            </label>
                            <select
                              value={targetInvoiceStatus}
                              onChange={(e) => setTargetInvoiceStatus(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="ISSUED">ISSUED</option>
                              <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                              <option value="PAID">PAID</option>
                              <option value="OVERDUE">OVERDUE</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">
                              Audit / Transition Notes
                            </label>
                            <input
                              type="text"
                              value={statusChangeNotes}
                              onChange={(e) => setStatusChangeNotes(e.target.value)}
                              placeholder="e.g. Verified wire transfer receipt or client waiver"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingInvoiceStatusId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            isLoading={isUpdatingInvoiceStatus}
                            onClick={() => handleUpdateInvoiceStatus(inv.id)}
                          >
                            Save Status Change
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Issue Invoice Modal */}
          <Modal
            isOpen={isAddInvoiceOpen}
            onClose={() => setIsAddInvoiceOpen(false)}
            title="Issue Project Invoice"
          >
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Invoice Source</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceSource("CUSTOM")}
                    className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-colors ${
                      invoiceSource === "CUSTOM"
                        ? "bg-electric-500 text-charcoal-950 border-electric-400"
                        : "bg-charcoal-800 text-slate-300 border-white/5 hover:text-white"
                    }`}
                  >
                    Custom Scope
                  </button>

                  <button
                    type="button"
                    disabled={!project.quotations?.length}
                    onClick={() => setInvoiceSource("QUOTATION")}
                    className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-colors disabled:opacity-40 ${
                      invoiceSource === "QUOTATION"
                        ? "bg-electric-500 text-charcoal-950 border-electric-400"
                        : "bg-charcoal-800 text-slate-300 border-white/5 hover:text-white"
                    }`}
                  >
                    Quotation ({project.quotations?.length || 0})
                  </button>

                  <button
                    type="button"
                    disabled={!project.milestones?.length}
                    onClick={() => setInvoiceSource("MILESTONE")}
                    className={`py-2 px-2.5 rounded-lg border text-center font-bold text-xs transition-colors disabled:opacity-40 ${
                      invoiceSource === "MILESTONE"
                        ? "bg-electric-500 text-charcoal-950 border-electric-400"
                        : "bg-charcoal-800 text-slate-300 border-white/5 hover:text-white"
                    }`}
                  >
                    Milestone ({project.milestones?.length || 0})
                  </button>
                </div>
              </div>

              {invoiceSource === "QUOTATION" && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Select Approved Quotation *
                  </label>
                  <select
                    value={selectedQuotationId}
                    onChange={(e) => setSelectedQuotationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white"
                  >
                    {project.quotations.map((q: any) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.title} (${q.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {invoiceSource === "MILESTONE" && (
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Select Milestone *</label>
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white"
                  >
                    {project.milestones.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.title} - ${m.amount} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {invoiceSource === "CUSTOM" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-medium text-slate-300">Custom Line Items</label>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomLineItems([
                          ...customLineItems,
                          { description: "Deliverable item", quantity: 1, unitPrice: 500 },
                        ])
                      }
                      className="text-electric-400 hover:underline font-semibold"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {customLineItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...customLineItems];
                            updated[idx].description = e.target.value;
                            setCustomLineItems(updated);
                          }}
                          placeholder="Description"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-charcoal-850 border border-white/10 text-white"
                        />
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...customLineItems];
                            updated[idx].quantity = Number(e.target.value);
                            setCustomLineItems(updated);
                          }}
                          className="w-16 px-2 py-1.5 rounded-lg bg-charcoal-850 border border-white/10 text-white text-center font-mono"
                          title="Quantity"
                        />
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...customLineItems];
                            updated[idx].unitPrice = Number(e.target.value);
                            setCustomLineItems(updated);
                          }}
                          className="w-24 px-2 py-1.5 rounded-lg bg-charcoal-850 border border-white/10 text-white text-right font-mono"
                          title="Unit Price"
                        />
                        {customLineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setCustomLineItems(customLineItems.filter((_, i) => i !== idx))
                            }
                            className="p-1.5 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={invoiceDueDate}
                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-charcoal-850 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Notes / Terms</label>
                      <input
                        type="text"
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        placeholder="e.g. Net 14 days"
                        className="w-full px-3 py-1.5 rounded-lg bg-charcoal-850 border border-white/10 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Applicable Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoiceTaxRate}
                  onChange={(e) => setInvoiceTaxRate(Number(e.target.value))}
                  placeholder="e.g. 18 for 18% GST/VAT"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button variant="outline" type="button" onClick={() => setIsAddInvoiceOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isCreatingInvoice}>
                  Issue Invoice
                </Button>
              </div>
            </form>
          </Modal>
        </Card>
      )}

      {/* TAB 5: MESSAGES / DISCUSSIONS & REAL-TIME CHAT */}
      {activeTab === "messages" && (
        <RealtimeChatBox
          projectRequestId={project.id}
          projectTitle={project.title}
          currentUser={currentUser || { id: "admin", name: "Studio Director", role: "ADMIN" }}
          initialMessages={project.messages}
        />
      )}
    </div>
  );
}
