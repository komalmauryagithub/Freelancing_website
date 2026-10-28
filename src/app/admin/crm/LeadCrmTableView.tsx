"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  FileText,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const STATUS_FILTERS = [
  "ALL",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];

export function LeadCrmTableView({
  initialStatus = "ALL",
  initialSearch = "",
  initialProjectType = "ALL",
}: {
  initialStatus?: string;
  initialSearch?: string;
  initialProjectType?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState(initialSearch);
  const [projectType, setProjectType] = useState(initialProjectType);
  const [page, setPage] = useState(1);

  const [leads, setLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        status,
        search,
        projectType,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/admin/leads?${query.toString()}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setLeads(json.data.leads);
        setPagination(json.data.pagination);
      }
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [status, projectType, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const getStatusBadgeVariant = (st: string) => {
    switch (st) {
      case "NEW":
        return "electric";
      case "CONTACTED":
        return "charcoal";
      case "QUALIFIED":
        return "violet";
      case "PROPOSAL_SENT":
        return "electric";
      case "WON":
        return "emerald";
      case "LOST":
        return "outline";
      default:
        return "charcoal";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ref number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={projectType}
            onChange={(e) => {
              setProjectType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-charcoal-900 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-400"
          >
            <option value="ALL">All Project Types</option>
            <option value="business_website">Business Website</option>
            <option value="dynamic_application">Dynamic Web App</option>
            <option value="crm_admin_panel">CRM &amp; Admin Panel</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="dashboard">Dashboard</option>
            <option value="custom">Custom</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchLeads}>
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              status === s
                ? "bg-electric-500 text-charcoal-950 shadow-md"
                : "bg-charcoal-900 text-slate-400 hover:text-white hover:bg-charcoal-800"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-charcoal-900">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-charcoal-850/80 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            <tr>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Client / Company</th>
              <th className="py-3 px-4">Type &amp; Features</th>
              <th className="py-3 px-4">Indicative Budget</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Quotes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-electric-400" />
                    <span>Loading leads...</span>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No lead records match your filter criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-electric-400 whitespace-nowrap">
                    {lead.referenceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{lead.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {lead.company ? `${lead.company} • ` : ""}
                      {lead.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-white capitalize">
                      {lead.projectType ? lead.projectType.replace("_", " ") : "Custom"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {lead.selectedFeatures?.length || 0} features selected
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-200">
                      {lead.indicativeBudget || lead.budgetRange || "Flexible"}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(lead.status)} size="sm">
                      {lead.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-white">
                      {lead.quotations?.length || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      href={`/admin/crm/${lead.id}`}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Page {page} of {pagination.totalPages} ({pagination.total} leads)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
