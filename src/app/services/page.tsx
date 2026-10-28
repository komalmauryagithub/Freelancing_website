import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { servicesData } from "@/data/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import {
  Globe,
  Layers,
  BarChart3,
  ShoppingBag,
  Cpu,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Engineering Services — K Web Solutions",
  description:
    "Comprehensive freelance development services including business websites, dynamic web apps, CRM dashboards, e-commerce, and API integrations.",
};

export default function ServicesPage() {
  const getIcon = (name: string) => {
    switch (name) {
      case "Globe":
        return <Globe className="w-8 h-8 text-electric-400" />;
      case "Layers":
        return <Layers className="w-8 h-8 text-violetAccent-400" />;
      case "BarChart3":
        return <BarChart3 className="w-8 h-8 text-electric-400" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-8 h-8 text-violetAccent-400" />;
      case "Cpu":
        return <Cpu className="w-8 h-8 text-emerald-400" />;
      case "Wrench":
        return <Wrench className="w-8 h-8 text-electric-400" />;
      default:
        return <Globe className="w-8 h-8 text-electric-400" />;
    }
  };

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <FadeIn>
            <Badge variant="violet" size="sm" className="mb-4">
              Services &amp; Capabilities
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Tailored Engineering for{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                High-Stakes Products
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed">
              Every service is delivered with dedicated senior engineering focus, strict type safety, modern performance budgets, and transparent communication.
            </p>
          </FadeIn>
        </div>

        {/* Detailed Service Cards */}
        <div className="space-y-16 my-16">
          {servicesData.map((service, idx) => (
            <div
              key={service.id}
              id={service.slug}
              className="scroll-mt-32 p-8 md:p-12 rounded-3xl bg-charcoal-900 border border-white/10 relative overflow-hidden"
            >
              {/* Subtle side glow */}
              <div
                className={`absolute top-0 ${
                  idx % 2 === 0 ? "right-0" : "left-0"
                } w-96 h-96 bg-gradient-to-b from-electric-500/10 to-transparent blur-[100px] pointer-events-none`}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                {/* Left Col: Overview & Pricing */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-charcoal-800 border border-white/10 flex items-center justify-center mb-6">
                      {getIcon(service.iconName)}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="electric" size="sm">
                        {service.category}
                      </Badge>
                      {service.isPopular && (
                        <Badge variant="violet" size="sm">
                          Popular Choice
                        </Badge>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                      {service.title}
                    </h2>

                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      {service.fullDesc}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Typical Turnaround:</span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-electric-400" />
                        {service.turnaroundTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Estimated Investment:</span>
                      <span className="font-bold text-electric-400 text-base">
                        {service.priceRange || `Starts at ₹${service.priceStartingAt?.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        className="w-full"
                        href={`/contact?service=${service.slug}`}
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Inquire About This Service
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right Col: Deliverables & Process */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 bg-charcoal-850/80 p-6 sm:p-8 rounded-2xl border border-white/10">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-electric-400" />
                      What&apos;s Included
                    </h3>
                    <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                      {service.deliverables.map((item, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-violetAccent-400" />
                      Execution Steps
                    </h3>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                      {service.processSteps.map((step, sIdx) => (
                        <li key={sIdx} className="p-2.5 rounded-lg bg-charcoal-800 border border-white/5">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactCtaSection />
    </div>
  );
}
