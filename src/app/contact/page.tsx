"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BookCallModal } from "@/components/layout/BookCallModal";
import { FadeIn } from "@/components/motion/MotionWrapper";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Globe,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react";

const BUDGET_RANGES = [
  "< ₹5,000",
  "₹5,000 – ₹15,000",
  "₹15,000 – ₹30,000",
  "₹30,000+",
];

const TIMELINES = [
  "Immediate (2 – 3 Days)",
  "Within 1 Week (4 – 7 Days)",
  "1 – 2 Weeks",
  "Flexible / Planning Stage",
];

const SERVICES = [
  "Dynamic Web Application",
  "CRM / Admin Dashboard",
  "High-Impact Business Website",
  "Headless E-Commerce Store",
  "API & Webhook Integration",
  "Website Redesign & Bug Fixes",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: SERVICES[0],
    budgetRange: BUDGET_RANGES[1],
    timeline: TIMELINES[1],
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          message: `[Service Requested: ${formData.service}]\n\n${formData.message}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to submit project inquiry");
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again or email directly."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <FadeIn>
            <Badge variant="electric" size="sm" className="mb-4">
              Direct Contact &amp; Inquiries
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Start a Conversation About Your{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Next Product
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
              Tell us about your goals, timelines, and technical challenges. You&apos;ll receive an architectural overview and proposal within 24 hours.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct info & Book a call card */}
          <div className="lg:col-span-5 space-y-6">
            <FadeIn delay={0.1}>
              {/* Availability Box */}
              <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Accepting Q4 Client Engagements
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Direct Senior Collaboration
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Direct communication without intermediaries. From initial scope to live deployment, you collaborate 1-on-1 with me on every milestone.
                </p>

                <div className="pt-4 border-t border-white/10 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-electric-400 shrink-0" />
                    <a
                      href="mailto:komalmaurya09072005@gmail.com"
                      className="hover:text-white transition-colors"
                    >
                      komalmaurya09072005@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <a
                      href="tel:+918591240293"
                      className="hover:text-white transition-colors"
                    >
                      +91 8591240293
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Mumbai, Maharashtra, India</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-electric-400 shrink-0" />
                    <span>Response Time: Within 24 Business Hours</span>
                  </div>
                </div>
              </div>

              {/* Fast Track Booking Box */}
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-charcoal-850 to-charcoal-900 border border-electric-400/20 space-y-4">
                <div className="flex items-center gap-2 text-electric-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Prefer Video?</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Schedule a 30-Min Technical Discovery
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Discuss requirements, architectural trade-offs, and estimated milestone schedules face-to-face via Google Meet.
                </p>
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setIsBookModalOpen(true)}
                >
                  Book Discovery Session
                </Button>
              </div>

              {/* Security & Confidentiality note */}
              <div className="p-4 rounded-xl bg-charcoal-900/50 border border-white/5 flex items-start gap-3 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                <span>
                  All project inquiries are strictly confidential and governed by standard NDA protections upon request.
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <FadeIn delay={0.2}>
              <div className="p-8 sm:p-10 rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl relative">
                {isSuccess ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Inquiry Received Successfully!
                    </h3>
                    <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out, <span className="text-electric-400 font-semibold">{formData.name}</span>. We will review your project parameters and reply to <span className="text-white font-medium">{formData.email}</span> within 24 hours with an initial overview.
                    </p>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSuccess(false);
                          setFormData({
                            name: "",
                            email: "",
                            company: "",
                            service: SERVICES[0],
                            budgetRange: BUDGET_RANGES[1],
                            timeline: TIMELINES[1],
                            message: "",
                          });
                        }}
                      >
                        Send Another Note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <h2 className="text-xl font-bold text-white">
                        Project Scope &amp; Details
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Fill out the details below to receive a structured proposal.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Elena Vance"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="elena@company.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        />
                      </div>
                    </div>

                    {/* Company & Service */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Acme Corp"
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Service Category *
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        >
                          {SERVICES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Expected Budget
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        >
                          {BUDGET_RANGES.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          Target Timeline
                        </label>
                        <select
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                        >
                          {TIMELINES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Details */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Tell us about the project *
                      </label>
                      <textarea
                        required
                        rows={4}
                        minLength={10}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe the core goals, features, current pain points, and any technical constraints..."
                        className="w-full px-4 py-3 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isLoading}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Send Project Inquiry
                    </Button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </div>
  );
}
