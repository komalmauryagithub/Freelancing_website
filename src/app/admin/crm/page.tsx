import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LeadCrmTableView } from "./LeadCrmTableView";
import { AdminHeaderNav } from "@/components/admin/AdminHeaderNav";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    projectType?: string;
    page?: string;
  }>;
}

export default async function AdminCrmPage({ searchParams }: PageProps) {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/admin/crm");
  }

  if (sessionData.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const params = await searchParams;
  const status = params.status || "ALL";
  const search = params.search || "";
  const projectType = params.projectType || "ALL";

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
              Lead CRM &amp; Project Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Search, qualify, quote, and convert inbound client specifications into production deliverables.
            </p>
          </div>

          <Button variant="primary" size="sm" href="/get-started">
            Simulate Client Brief
          </Button>
        </div>

        <AdminHeaderNav />

        {/* Interactive Client-Side Filterable CRM Table */}
        <LeadCrmTableView
          initialStatus={status}
          initialSearch={search}
          initialProjectType={projectType}
        />
      </div>
    </div>
  );
}
