import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessResource } from "@/lib/authorization";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProjectDetailClientView } from "./ProjectDetailClientView";
import { ArrowLeft, ShieldCheck, Layers, Calendar, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalProjectDetailPage({ params }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/portal");
  }

  const { user } = sessionData;
  const { id } = await params;

  const project = await prisma.projectRequest.findUnique({
    where: { id },
    include: {
      service: true,
      milestones: { orderBy: { order: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
      changeRequests: { orderBy: { createdAt: "desc" } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      proposals: {
        include: { milestones: true },
        orderBy: { createdAt: "desc" },
      },
      quotations: {
        include: { lineItems: true, auditTrail: { orderBy: { createdAt: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        include: {
          payments: { orderBy: { createdAt: "desc" } },
          lineItems: true,
          auditTrail: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      stageHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    notFound();
  }

  // STRICT SERVER-SIDE OWNERSHIP ENFORCEMENT
  if (!canAccessResource(project.userId, user.id, user.role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Client Workspace</span>
          </Link>
        </div>

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {project.referenceNumber && (
                <span className="font-mono text-xs font-bold text-electric-400 bg-electric-500/10 px-2.5 py-1 rounded-md border border-electric-400/20">
                  {project.referenceNumber}
                </span>
              )}
              <Badge variant="violet" size="sm">
                Stage: {project.stage}
              </Badge>
              <Badge variant="outline" size="sm">
                Status: {project.status}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Created on {new Date(project.createdAt).toLocaleDateString()} • Managed by K Web Solutions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {project.productionUrl && (
              <a
                href={project.productionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-electric-500 text-charcoal-950 hover:bg-electric-400 transition-colors shadow-md shadow-electric-500/20"
              >
                <span>Live Staging / Production</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Interactive Client View */}
        <ProjectDetailClientView project={project} currentUser={user} />
      </div>
    </div>
  );
}
