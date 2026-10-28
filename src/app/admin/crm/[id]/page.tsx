import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LeadDetailClientView } from "./LeadDetailClientView";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  User,
  Phone,
  Layers,
  File,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/admin/crm");
  }

  if (sessionData.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      quotations: {
        include: {
          lineItems: true,
          auditTrail: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      projectRequests: true,
    },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/admin/crm"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Lead CRM</span>
          </Link>
        </div>

        {/* Lead Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-electric-400 bg-electric-500/10 px-2.5 py-1 rounded-md border border-electric-400/20">
                {lead.referenceNumber}
              </span>
              <Badge variant="violet" size="sm">
                Status: {lead.status.replace("_", " ")}
              </Badge>
              {lead.convertedProjectId && (
                <Badge variant="emerald" size="sm">
                  Converted to Project
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lead.name} {lead.company ? `(${lead.company})` : ""}
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Received on {new Date(lead.createdAt).toLocaleString()} via {lead.source || "form"}
            </p>
          </div>
        </div>

        {/* Interactive Client-Side Actions & Details */}
        <LeadDetailClientView lead={lead} />
      </div>
    </div>
  );
}
