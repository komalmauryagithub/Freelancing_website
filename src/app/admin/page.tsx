import React from "react";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AdminHeaderNav } from "@/components/admin/AdminHeaderNav";
import { PortalClientView } from "../portal/PortalClientView";
import {
  ShieldAlert,
  Users,
  MessageSquare,
  Calendar,
  Layers,
  Database,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sessionData = await getCurrentSession();

  if (!sessionData) {
    redirect("/login?callbackUrl=/admin");
  }

  // Strict RBAC Enforcement
  if (sessionData.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const { user } = sessionData;

  const [totalUsers, totalLeads, totalBookings, totalProjectRequests] =
    await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.booking.count(),
      prisma.projectRequest.count(),
    ]);

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet" size="sm">
                Administrator Console
              </Badge>
              <Badge variant="emerald" size="sm">
                Root Access
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Studio Operational Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Logged in as {user.email} • Private management panel for inquiries, leads, and scopes.
            </p>
          </div>

          <PortalClientView user={user} />
        </div>

        {/* Global Admin Navigation */}
        <AdminHeaderNav />

        {/* High Level Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 bg-charcoal-900 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Users</span>
              <Users className="w-5 h-5 text-electric-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{totalUsers}</div>
          </Card>

          <Card className="p-6 bg-charcoal-900 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Leads</span>
              <MessageSquare className="w-5 h-5 text-violetAccent-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{totalLeads}</div>
          </Card>

          <Card className="p-6 bg-charcoal-900 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Bookings</span>
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{totalBookings}</div>
          </Card>

          <Card className="p-6 bg-charcoal-900 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Scopes / Requests</span>
              <Layers className="w-5 h-5 text-electric-300" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{totalProjectRequests}</div>
          </Card>
        </div>

        {/* Quick Management Navigation */}
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" size="md" href="/admin/projects" icon={<ArrowRight className="w-4 h-4" />}>
            Manage Projects Pipeline
          </Button>
          <Button variant="outline" size="md" href="/admin/crm" icon={<Users className="w-4 h-4" />}>
            Open Lead CRM
          </Button>
          <Button variant="secondary" size="md" href="/portal">
            Client Portal Workspace
          </Button>
        </div>

        {/* Recent Inquiries & Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Recent Client Inquiries</span>
              <Badge variant="electric" size="sm">Latest 5</Badge>
            </h2>

            {recentLeads.length === 0 ? (
              <p className="text-xs text-slate-400">No leads recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-charcoal-850 border border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{lead.name}</span>
                      <span className="text-electric-400 font-semibold">{lead.budgetRange}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{lead.email} • {lead.timeline}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                      {lead.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Upcoming Discovery Calls</span>
              <Badge variant="violet" size="sm">Scheduled</Badge>
            </h2>

            {recentBookings.length === 0 ? (
              <p className="text-xs text-slate-400">No calls scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-charcoal-850 border border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{b.name}</span>
                      <Badge variant="outline" size="sm">{b.status}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.email} • {new Date(b.scheduledAt).toLocaleString()}
                    </div>
                    <p className="text-xs text-electric-400 font-medium">
                      Topic: {b.topic}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
