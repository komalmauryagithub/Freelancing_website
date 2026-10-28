import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — K Web Solutions",
  description: "Privacy policy and client data handling practices for K Web Solutions.",
};

export default function PrivacyPage() {
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

        <Badge variant="electric" size="sm" className="mb-4">
          Legal &amp; Data Transparency
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 mb-12">
          Last Updated: 2026 • Policy for K Web Solutions
        </p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-sm sm:text-base text-slate-300 leading-relaxed">
          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you submit an inquiry through our contact form or book a discovery session, we collect basic contact information including your name, email address, company name, project specifications, and scheduling preferences.
            </p>
            <p>
              We do not track visitors with third-party tracking pixels, sell user data, or share client information with advertising brokers.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">2. How We Use Collected Data</h2>
            <p>Information supplied is used strictly to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
              <li>Evaluate project requirements and produce engineering proposals.</li>
              <li>Coordinate discovery video calls and send calendar invites.</li>
              <li>Execute milestone contracts and provide technical handover documentation.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">3. Code Confidentiality &amp; NDAs</h2>
            <p>
              All proprietary business logic, client repository code, database credentials, and internal operational data shared during an engagement are held under strict confidentiality. We execute mutual non-disclosure agreements (NDAs) prior to reviewing any proprietary software.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Contacting Data Controller</h2>
            <p>
              If you have any questions regarding your personal information or wish to request data deletion, contact us directly at{" "}
              <a href="mailto:komalmaurya09072005@gmail.com" className="text-electric-400 hover:underline">
                komalmaurya09072005@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
