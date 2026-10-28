import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminHeaderNav } from "@/components/admin/AdminHeaderNav";
import {
  FolderGit2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { ProjectStage } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    stage?: string;
  }>;
}

const STAGES: ProjectStage[] = [
  "ENQUIRY",
  "DISCUSSION",
  "QUOTATION",
  "APPROVED",
  "DEVELOPMENT",
  "REVIEW",
  "DELIVERED",
];

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/admin/projects");
  }

  if (sessionData.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const currentStage = params.stage || "ALL";

  const whereClause: any = {};
  if (currentStage !== "ALL" && STAGES.includes(currentStage as ProjectStage)) {
    whereClause.stage = currentStage as ProjectStage;
  }

  const projects = await prisma.projectRequest.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } },
      service: { select: { title: true } },
      milestones: true,
      changeRequests: true,
      proposals: true,
      invoices: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/admin"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Admin Console
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Project Lifecycle Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active engineering pipelines: ENQUIRY → DISCUSSION → QUOTATION → APPROVED → DEVELOPMENT → REVIEW → DELIVERED
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" href="/admin/crm">
              Lead CRM
            </Button>
            <Button variant="secondary" size="sm" href="/portal">
              Client Portal Preview
            </Button>
          </div>
        </div>

        <AdminHeaderNav />

        {/* Stage Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Link
            href="/admin/projects"
            className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
              currentStage === "ALL"
                ? "bg-electric-500 text-charcoal-950 font-bold border-electric-400 shadow-md"
                : "bg-charcoal-900 text-slate-400 border-white/10 hover:text-white hover:bg-charcoal-850"
            }`}
          >
            All Projects ({projects.length})
          </Link>
          {STAGES.map((st) => (
            <Link
              key={st}
              href={`/admin/projects?stage=${st}`}
              className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all ${
                currentStage === st
                  ? "bg-electric-500 text-charcoal-950 font-bold border-electric-400 shadow-md"
                  : "bg-charcoal-900 text-slate-400 border-white/10 hover:text-white hover:bg-charcoal-850"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        {/* Project Cards Grid */}
        {projects.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-charcoal-900 border border-white/10">
            <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Projects in this Stage</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              There are currently no projects matching stage &ldquo;{currentStage}&rdquo;. You can convert leads from the CRM or create new projects.
            </p>
            <Button variant="outline" size="sm" href="/admin/crm">
              Go to Lead CRM
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => {
              const completedMilestones = p.milestones.filter(
                (m) => m.status === "APPROVED" || m.status === "RELEASED" || m.progressPercentage === 100
              );
              const milestonePercent =
                p.milestones.length > 0
                  ? Math.round((completedMilestones.length / p.milestones.length) * 100)
                  : p.stage === "DELIVERED"
                  ? 100
                  : p.stage === "DEVELOPMENT"
                  ? 50
                  : 15;

              return (
                <Card
                  key={p.id}
                  className="p-6 bg-charcoal-900 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {p.referenceNumber ? (
                        <span className="text-[11px] font-mono font-bold text-electric-400 bg-electric-500/10 px-2 py-0.5 rounded border border-electric-400/20">
                          {p.referenceNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">PRJ-UNASSIGNED</span>
                      )}
                      <Badge
                        variant={
                          p.stage === "DELIVERED"
                            ? "emerald"
                            : p.stage === "DEVELOPMENT"
                            ? "electric"
                            : p.stage === "APPROVED"
                            ? "violet"
                            : "outline"
                        }
                        size="sm"
                      >
                        {p.stage}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1 mb-1">
                      {p.title}
                    </h3>

                    <div className="text-xs text-slate-400 mb-4">
                      Client: <span className="text-slate-200">{p.user?.name || "Client"}</span> ({p.user?.email})
                    </div>

                    <div className="text-xs text-slate-300 line-clamp-2 mb-4 bg-charcoal-850 p-2.5 rounded-lg border border-white/5">
                      {p.description}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Milestones ({completedMilestones.length}/{p.milestones.length})</span>
                        <span className="font-semibold text-electric-400">{milestonePercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-charcoal-800 overflow-hidden">
                        <div
                          className="h-full bg-electric-500 transition-all"
                          style={{ width: `${milestonePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3 mb-4">
                      <span>Service: {p.service?.title || "Custom"}</span>
                      <span className="font-semibold text-white">{p.budget || "Flexible"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      {p.changeRequests.length > 0 && `${p.changeRequests.length} change requests`}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      href={`/admin/projects/${p.id}`}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Manage Project
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
