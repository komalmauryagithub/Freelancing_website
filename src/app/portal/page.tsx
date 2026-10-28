import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PortalClientView } from "./PortalClientView";
import { User, FolderGit2, FileText, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/portal");
  }

  const { user } = sessionData;

  // Fetch client's isolated project requests
  const projectRequests = await prisma.projectRequest.findMany({
    where: { userId: user.id },
    include: {
      service: { select: { title: true } },
      proposals: { include: { milestones: true } },
      invoices: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="electric" size="sm">
                Client Workspace
              </Badge>
              <Badge variant="outline" size="sm">
                Role: {user.role}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {user.email} • Manage your active scopes, review proposals, and inspect deliverables.
            </p>
          </div>

          <PortalClientView user={user} />
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 bg-charcoal-900 border border-white/10 hover:border-electric-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. My Projects
              </span>
              <FolderGit2 className="w-5 h-5 text-electric-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">
              {projectRequests.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active software builds &amp; scopes</p>
          </Card>

          <Card className="p-6 bg-charcoal-900 border border-white/10 hover:border-violetAccent-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Proposals &amp; Quotes
              </span>
              <FileText className="w-5 h-5 text-violetAccent-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">
              {projectRequests.reduce((acc, p) => acc + p.proposals.length, 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Milestone budgets &amp; deliverables</p>
          </Card>

          <Card className="p-6 bg-charcoal-900 border border-white/10 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Invoices &amp; Billing
              </span>
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">
              {projectRequests.reduce((acc, p) => acc + p.invoices.length, 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Razorpay settlements &amp; receipts</p>
          </Card>
        </div>

        {/* Project Requests List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Project Requests</h2>
            <Button variant="primary" size="sm" href="/contact">
              Submit New Request
            </Button>
          </div>

          {projectRequests.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-white/10">
              <FolderGit2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Project Requests Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                You haven&apos;t submitted any project requests yet. Fill out an inquiry to kick off an engineering roadmap.
              </p>
              <Button variant="outline" size="sm" href="/contact">
                Start an Inquiry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projectRequests.map((req) => (
                <Card key={req.id} className="p-6 bg-charcoal-900 border border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="electric" size="sm">
                          {req.status}
                        </Badge>
                        {req.service && (
                          <span className="text-xs text-slate-400">
                            Service: {req.service.title}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">{req.title}</h3>
                    </div>
                    {req.budget && (
                      <span className="text-sm font-semibold text-electric-400">
                        Budget: {req.budget}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {req.description}
                  </p>

                  {/* Proposals / Milestones preview */}
                  {req.proposals.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                        Attached Proposal
                      </span>
                      {req.proposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 rounded-xl bg-charcoal-850 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{prop.title}</span>
                            <span className="text-slate-400 ml-2">Status: {prop.status}</span>
                          </div>
                          <span className="font-bold text-electric-400">
                            ${prop.totalAmount.toLocaleString()} {prop.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono bg-charcoal-800 px-2.5 py-1 rounded-lg border border-white/5">
                        {req.referenceNumber || "PRJ-ASSIGNED"}
                      </span>
                      <Badge variant="violet" size="sm">
                        Stage: {req.stage}
                      </Badge>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      href={`/portal/projects/${req.id}`}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Open Project Workspace
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
