import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Calendar, FileText, ArrowRight, ShieldCheck, Clock } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function ProjectConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ref = params.ref || "PRJ-2025-PENDING";

  return (
    <div className="pt-28 pb-20 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <Badge variant="emerald" size="sm" className="mb-3">
          Brief Confirmed &amp; Dispatched
        </Badge>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Project Brief Received!
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed mb-6">
          Thank you for providing your project parameters. Your submission has been securely ingested into our engineering queue.
        </p>

        {/* Reference Number Card */}
        <div className="p-5 rounded-2xl bg-charcoal-900 border border-electric-400/30 max-w-md mx-auto mb-8 shadow-xl text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Project Reference Number</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Logged
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-electric-400 tracking-wider">
            {ref}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Quote this reference in all correspondence regarding this specification.
          </p>
        </div>

        {/* What Happens Next Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto mb-10">
          <div className="p-4 rounded-xl bg-charcoal-850 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-electric-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Step 1: Review
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our lead engineer examines your features and technical scope within 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-violetAccent-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Step 2: Quotation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You receive an itemized quotation with milestones, architecture, and schedule.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-850 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Step 3: Kickoff
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upon quotation approval, sprint 1 begins with live staging access.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" href="/contact">
            Schedule Discovery Call
          </Button>
          <Button variant="outline" href="/projects">
            Browse Featured Case Studies
          </Button>
        </div>
      </div>
    </div>
  );
}
