import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldX, ArrowLeft, UserCheck } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-24 pb-16 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">
          Access Restricted (403 Forbidden)
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
          Unauthorized Access
        </h1>

        <p className="text-sm text-slate-300 mb-8 leading-relaxed">
          You do not possess the required security privileges or role permissions to access this administrative resource.
        </p>

        <div className="p-4 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-slate-400 mb-8 text-left space-y-1.5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <UserCheck className="w-4 h-4 text-electric-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <p>
            Administrative panels require verified <code className="text-electric-400 font-mono">ADMIN</code> credentials provisioned via the secure server-side bootstrap procedure.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" href="/portal">
            Go to Client Portal
          </Button>
          <Button variant="outline" href="/login">
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
}
