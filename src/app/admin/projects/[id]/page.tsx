import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AdminProjectDetailView } from "./AdminProjectDetailView";
import { ArrowLeft, ExternalLink, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectManagementPage({ params }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/admin/projects");
  }

  if (sessionData.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const { id } = await params;

  const project = await prisma.projectRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, company: true, phone: true } },
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

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects Pipeline</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/portal/projects/${project.id}`}
              target="_blank"
              className="text-xs text-electric-400 hover:underline flex items-center gap-1"
            >
              <span>View As Client In Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
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
              <Badge variant="charcoal" size="sm">
                Client: {project.user?.name || "Client"}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Client: {project.user?.name} ({project.user?.email}) • Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Admin Management Interface */}
        <AdminProjectDetailView project={project} currentUser={sessionData.user} />
      </div>
    </div>
  );
}
