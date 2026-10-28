"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { RealtimeChatBox } from "@/components/chat/RealtimeChatBox";
import {
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Download,
  Send,
  Plus,
  AlertCircle,
  ExternalLink,
  Github,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  FileCode,
  DollarSign,
  ArrowRight,
  CreditCard,
  Printer,
} from "lucide-react";

const STAGES = [
  "ENQUIRY",
  "DISCUSSION",
  "QUOTATION",
  "APPROVED",
  "DEVELOPMENT",
  "REVIEW",
  "DELIVERED",
];

const STAGE_CONFIG: { [key: string]: { label: string; desc: string } } = {
  ENQUIRY: { label: "1. Enquiry", desc: "Brief Review" },
  DISCUSSION: { label: "2. Discussion", desc: "Consultation" },
  QUOTATION: { label: "3. Quotation", desc: "Pricing & Scope" },
  APPROVED: { label: "4. Approved", desc: "Contract Active" },
  DEVELOPMENT: { label: "5. Build", desc: "Active Coding" },
  REVIEW: { label: "6. Review", desc: "QA & Testing" },
  DELIVERED: { label: "7. Delivered", desc: "Live Launch" },
};

export function ProjectDetailClientView({
  project,
  currentUser,
}: {
  project: any;
  currentUser: any;
}) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "overview" | "milestones" | "documents" | "proposals" | "changes" | "messages" | "invoices" | "handover"
  >("overview");

  // Message thread state
  const [messageInput, setMessageInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Change request modal state
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeTitle, setChangeTitle] = useState("");
  const [changeDesc, setChangeDesc] = useState("");
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  // Milestone Progress Computation
  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100
  );
  const progressPercentage =
    milestones.length > 0
      ? Math.round((completedMilestones.length / milestones.length) * 100)
      : project.stage === "DELIVERED"
      ? 100
      : project.stage === "DEVELOPMENT"
      ? 50
      : 15;

  const currentStageIndex = STAGES.indexOf(project.stage);

  // Send message
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
      console.error("Message send failure", err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Submit change request
  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingChange(true);
    setChangeError(null);

    try {
      const res = await fetch(`/api/portal/projects/${project.id}/change-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: changeTitle,
          description: changeDesc,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to submit change request.");
      }

      setChangeTitle("");
      setChangeDesc("");
      setIsChangeModalOpen(false);
      router.refresh();
    } catch (err) {
      setChangeError(err instanceof Error ? err.message : "Error submitting request.");
    } finally {
      setIsSubmittingChange(false);
    }
  };

  // Proposal respond handler
  const handleRespondProposal = async (proposalId: string, action: "ACCEPT" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action === "ACCEPT" ? "accept" : "decline"} this proposal?`)) return;

    try {
      const res = await fetch(`/api/portal/proposals/${proposalId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to respond to proposal", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. PROJECT WORKFLOW PIPELINE TRACKER */}
      <Card className="p-6 bg-charcoal-900 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lifecycle Workflow
          </span>
          <span className="text-xs font-semibold text-electric-400">
            {progressPercentage}% Overall Completion
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-electric-500 via-violetAccent-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stages steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const config = STAGE_CONFIG[st] || { label: `${idx + 1}. ${st}`, desc: "" };

            return (
              <div
                key={st}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "bg-charcoal-800 border-electric-400 ring-2 ring-electric-400/30 text-white font-bold"
                    : isCompleted
                    ? "bg-charcoal-850 border-emerald-500/20 text-emerald-400"
                    : "bg-charcoal-900/60 border-white/5 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Clock className="w-3.5 h-3.5 text-electric-400 animate-pulse" />
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">0{idx + 1}</span>
                  )}
                  <span className="text-[11px] font-bold uppercase">{config.label}</span>
                </div>
                <span className="text-[9px] text-slate-400 block line-clamp-1">{config.desc}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4 Primary Intuitive Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 border-b border-white/10 pb-4">
        {[
          {
            id: "overview",
            number: "1",
            title: "1. Progress & Milestones",
            desc: "Milestones & target deadlines",
            icon: Clock,
            badge: `${progressPercentage}% Done`,
          },
          {
            id: "messages",
            number: "2",
            title: "2. Team Chat & Files",
            desc: "Discussions & documents",
            icon: MessageSquare,
            badge: `${(project.messages?.length || 0) + (project.documents?.length || 0)} items`,
          },
          {
            id: "invoices",
            number: "3",
            title: "3. Proposals & Invoices",
            desc: "Quotes & online payments",
            icon: DollarSign,
            badge: `${(project.proposals?.length || 0) + (project.invoices?.length || 0)} files`,
          },
          {
            id: "changes",
            number: "4",
            title: "4. Changes & Delivery",
            desc: "Scope requests & final code",
            icon: ShieldCheck,
            badge: `${project.changeRequests?.length || 0} reqs`,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.id === "overview" && activeTab === "milestones") ||
            (tab.id === "messages" && activeTab === "documents") ||
            (tab.id === "invoices" && activeTab === "proposals") ||
            (tab.id === "changes" && activeTab === "handover");

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-charcoal-850 border-electric-400 ring-2 ring-electric-400/20 shadow-lg shadow-electric-500/10"
                  : "bg-charcoal-900 border-white/5 hover:border-white/20 hover:bg-charcoal-850"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive
                      ? "bg-electric-500 text-charcoal-950 font-bold shadow-md shadow-electric-500/20"
                      : "bg-charcoal-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-electric-500/20 text-electric-400 border border-electric-500/30"
                      : "bg-charcoal-800 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              </div>
              <div>
                <div
                  className={`text-sm font-bold ${
                    isActive ? "text-white" : "text-slate-300"
                  }`}
                >
                  {tab.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. PROGRESS & MILESTONES */}
      {(activeTab === "overview" || activeTab === "milestones") && (
        <div className="space-y-6">
          {/* Milestone Roadmap */}
          <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Milestone Roadmap &amp; Progress</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target delivery schedules, checkpoints, and completion status for this project.
                </p>
              </div>
              <span className="text-xs font-bold text-electric-400 bg-electric-500/10 px-3 py-1 rounded-full border border-electric-500/20">
                {progressPercentage}% Completed
              </span>
            </div>

            {milestones.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Milestones are being finalized following quotation approval.
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((m: any, idx: number) => {
                  const isDone = m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100;
                  return (
                    <div
                      key={m.id}
                      className="p-5 rounded-xl bg-charcoal-850 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isDone
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-charcoal-800 text-slate-400 border border-white/10"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{m.title}</h4>
                          {m.description && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {m.description}
                            </p>
                          )}
                          {m.dueDate && (
                            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-electric-400" />
                              <span>Target Deadline: {new Date(m.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0">
                        <Badge
                          variant={isDone ? "emerald" : m.status === "IN_PROGRESS" ? "electric" : "charcoal"}
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                        <div className="text-xs font-mono font-bold text-white mt-1.5">
                          {m.progressPercentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Project Scope & Specifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white">Project Scope &amp; Specifications</h2>
                <p className="text-sm text-slate-300 bg-charcoal-850 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>

                {project.selectedFeatures && project.selectedFeatures.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Architectural Features Included
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.selectedFeatures.map((f: string) => (
                        <span
                          key={f}
                          className="text-xs px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-200 border border-white/10"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Stage History Log */}
              <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white">Project Activity &amp; Stage History</h2>
                {project.stageHistory && project.stageHistory.length === 0 ? (
                  <p className="text-xs text-slate-400">Initial submission logged.</p>
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
                  Key Parameters
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Indicative Budget:</span>
                    <span className="font-semibold text-white">{project.budget || "Flexible"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client Owner:</span>
                    <span className="font-semibold text-white">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service Category:</span>
                    <span className="font-semibold text-electric-400">
                      {project.service?.title || "Custom Engineering"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. TEAM CHAT & SECURE DOCUMENTS */}
      {(activeTab === "messages" || activeTab === "documents") && (
        <div className="space-y-8">
          {/* Real-time live messaging */}
          <RealtimeChatBox
            projectRequestId={project.id}
            projectTitle={project.title}
            currentUser={currentUser}
            initialMessages={project.messages}
          />

          {/* Secure Document Vault */}
          <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Protected Project Documents</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Contracts, architecture specifications, wireframes, and sign-off records with authenticated access control.
              </p>
            </div>

            {project.documents && project.documents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No project documents uploaded yet. Documents will appear here once generated by the team.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {project.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="py-4 flex items-center justify-between gap-4 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-charcoal-800 text-electric-400 border border-white/5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{doc.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Uploaded by {doc.uploadedBy} • {Math.round(doc.fileSize / 1024)} KB
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/api/portal/documents/${doc.id}/download`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs font-semibold text-white hover:bg-charcoal-700 hover:text-electric-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 3. PROPOSALS & INVOICES */}
      {(activeTab === "invoices" || activeTab === "proposals") && (
        <div className="space-y-8">
          {/* Proposals & Quotations review */}
          <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Project Proposals &amp; Quotations</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and formally approve itemized development milestones.
              </p>
            </div>

            {project.proposals && project.proposals.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Your customized proposal is being prepared following discovery review.
              </div>
            ) : (
              <div className="space-y-6">
                {project.proposals.map((prop: any) => (
                  <div
                    key={prop.id}
                    className="p-6 rounded-2xl bg-charcoal-850 border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="violet" size="sm">
                            {prop.status}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-white">{prop.title}</h3>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-electric-400">
                          ${prop.totalAmount.toLocaleString()} {prop.currency}
                        </div>
                        {prop.validUntil && (
                          <div className="text-xs text-slate-400">
                            Valid until {new Date(prop.validUntil).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-charcoal-900/60 p-4 rounded-xl">
                      {prop.summary}
                    </p>

                    {prop.terms && (
                      <div className="text-xs text-slate-400 italic">
                        Terms: {prop.terms}
                      </div>
                    )}

                    {/* Actions */}
                    {prop.status !== "ACCEPTED" && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRespondProposal(prop.id, "REJECT")}
                        >
                          Decline / Request Revision
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRespondProposal(prop.id, "ACCEPT")}
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Accept Proposal &amp; Formalize Scope
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Invoices & Settlement Records */}
          <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Invoices &amp; Settlement Records</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review milestone billing, itemized taxes, and download printable statements.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  Razorpay Secure Checkout
                </Badge>
              </div>
            </div>

            {project.invoices && project.invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No invoices generated yet. Invoices are issued upon approved milestone checkpoints.
              </div>
            ) : (
              <div className="space-y-4">
                {project.invoices.map((inv: any) => {
                  const completedPayments = (inv.payments || []).filter(
                    (p: any) => p.status === "COMPLETED"
                  );
                  const totalPaid = completedPayments.reduce(
                    (acc: number, p: any) => acc + (p.amount - (p.refundedAmount || 0)),
                    0
                  );
                  const balanceDue = Math.max(0, inv.total - totalPaid);
                  const isPaid = inv.status === "PAID" || balanceDue <= 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-5 rounded-2xl bg-charcoal-850 border border-white/10 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-400 flex items-center justify-center shrink-0 border border-electric-500/20">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-sm">
                                {inv.invoiceNumber}
                              </span>
                              <Badge
                                variant={
                                  isPaid
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
                          {inv.tax > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Includes ${inv.tax.toLocaleString()} tax ({inv.taxRate}%)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Line Items Preview */}
                      {inv.lineItems && inv.lineItems.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/5 space-y-1.5 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Billed Scope Items
                          </span>
                          <div className="divide-y divide-white/5">
                            {inv.lineItems.map((item: any, i: number) => (
                              <div key={item.id || i} className="py-1.5 flex justify-between">
                                <span className="text-slate-300">
                                  {item.description}{" "}
                                  {item.quantity > 1 && (
                                    <span className="text-slate-500 font-mono">× {item.quantity}</span>
                                  )}
                                </span>
                                <span className="font-mono text-slate-200">
                                  ${item.total.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confirmed Payments list if any */}
                      {completedPayments.length > 0 && (
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Settled: ${totalPaid.toLocaleString()}
                          </span>
                          {completedPayments.map((p: any) => (
                            <span key={p.id} className="font-mono text-[11px] text-slate-400">
                              Ref: {p.transactionRef}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="text-xs">
                          {!isPaid && balanceDue > 0 ? (
                            <span className="text-electric-400 font-medium">
                              Outstanding Balance:{" "}
                              <strong>
                                ${balanceDue.toLocaleString()} {inv.currency}
                              </strong>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Invoice Paid &amp; Reconciled
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/portal/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 border border-white/10 text-xs font-semibold text-white hover:bg-charcoal-700 hover:text-electric-400 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Statement / PDF</span>
                          </a>

                          {!isPaid && balanceDue > 0 && (
                            <a
                              href={`/portal/invoices/${inv.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-electric-500 to-violet-600 text-charcoal-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-electric-500/20 transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay with Razorpay</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 4. SCOPE CHANGES & HANDOVER */}
      {(activeTab === "changes" || activeTab === "handover") && (
        <div className="space-y-8">
          {/* Scope Change Requests */}
          <Card className="p-6 bg-charcoal-900 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Scope Change Requests</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit additions or adjustments to your approved scope for architectural review.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsChangeModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Submit Change Request
              </Button>
            </div>

            {project.changeRequests && project.changeRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No change requests submitted. Everything is proceeding according to the baseline scope.
              </div>
            ) : (
              <div className="space-y-4">
                {project.changeRequests.map((cr: any) => (
                  <div
                    key={cr.id}
                    className="p-5 rounded-xl bg-charcoal-850 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{cr.title}</h4>
                      <Badge variant={cr.status === "APPROVED" ? "emerald" : "charcoal"} size="sm">
                        {cr.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{cr.description}</p>
                    {cr.impactAssessment && (
                      <div className="p-3 rounded-lg bg-charcoal-900 text-xs space-y-1 mt-2">
                        <span className="font-bold text-electric-400 block">Engineering Impact:</span>
                        <p className="text-slate-300">{cr.impactAssessment}</p>
                        {cr.additionalCost && (
                          <div className="text-emerald-400 font-semibold mt-1">
                            Estimated Cost Adjustment: +${cr.additionalCost.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Delivery & Handover */}
          <Card className="p-6 bg-charcoal-900 border border-emerald-500/20 space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Project Handover &amp; Deliverables</h2>
                <p className="text-xs text-slate-400">
                  Full intellectual property transfer, repository access, and post-launch warranty certificate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-charcoal-850 border border-white/10 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Production Deployment
                </span>
                {project.productionUrl ? (
                  <a
                    href={project.productionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-electric-400 hover:underline flex items-center gap-1.5 font-semibold"
                  >
                    <span>{project.productionUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">Staging URL configured upon sprint release.</span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-white/10 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Source Code Repository
                </span>
                {project.repositoryUrl ? (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violetAccent-400 hover:underline flex items-center gap-1.5 font-semibold"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>{project.repositoryUrl}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">GitHub repository transferred upon final sign-off.</span>
                )}
              </div>
            </div>

            {project.handoverNotes && (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-white/5 space-y-1">
                <span className="text-xs font-bold uppercase text-slate-400 block">
                  Engineer Handover Notes
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {project.handoverNotes}
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> 30-Day Post-Launch Bug Warranty Active
              </span>
              <p>
                Your project includes 30 days of comprehensive defect remediation directly from our principal engineering team.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* SUBMIT CHANGE REQUEST MODAL */}
      <Modal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        title="Submit Scope Change Request"
        description="Describe any new features or revisions required outside the initial baseline scope."
      >
        <form onSubmit={handleSubmitChangeRequest} className="space-y-4 mt-2">
          {changeError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {changeError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={changeTitle}
              onChange={(e) => setChangeTitle(e.target.value)}
              placeholder="e.g. Integrate Apple Pay checkout option"
              className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Detailed Scope &amp; Rationale *
            </label>
            <textarea
              required
              rows={4}
              value={changeDesc}
              onChange={(e) => setChangeDesc(e.target.value)}
              placeholder="Explain the desired behavior, user story, or API requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-electric-400 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsChangeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmittingChange}
            >
              Submit for Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
