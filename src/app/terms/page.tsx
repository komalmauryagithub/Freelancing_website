import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — K Web Solutions",
  description: "Terms and conditions of client engagements with K Web Solutions.",
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <Badge variant="violet" size="sm" className="mb-4">
          Terms &amp; Working Agreements
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 mb-12">
          Last Updated: 2026 • Working Agreements for K Web Solutions
        </p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">1. Scope of Work &amp; Engagement</h2>
            <p>
              All software development, consulting, and design services provided by K Web Solutions are governed by a mutually agreed Statement of Work (SOW) or written proposal detailing specific deliverables, milestones, and timelines.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">2. Milestone Payments &amp; Invoicing</h2>
            <p>
              Engagements typically follow a structured milestone cadence (e.g. 50% deposit upon kickoff, 50% upon final acceptance and production release). Invoices are payable within 14 days of issuance. Work pauses if past-due milestones remain unaddressed.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">3. Intellectual Property Transfer</h2>
            <p>
              Upon complete payment of all project fees, full and exclusive copyright, repository ownership, and intellectual property rights in the custom deliverables transfer entirely to the client.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Warranty &amp; Post-Launch Support</h2>
            <p>
              Each fixed-price project includes a standard 30-day bug warranty period following production deployment, during which any defects directly resulting from the agreed specification are resolved at no additional cost.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
