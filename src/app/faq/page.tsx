"use client";

import React, { useState } from "react";
import { faqsData } from "@/data/faqs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { HelpCircle, MessageSquare } from "lucide-react";

const CATEGORIES = [
  "All",
  "General",
  "Process & Timeline",
  "Pricing & Billing",
  "Tech Stack & Handover",
] as const;

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredFaqs = faqsData.filter((faq) => {
    if (activeCategory === "All") return true;
    return faq.category === activeCategory;
  });

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center mb-12">
          <FadeIn>
            <Badge variant="electric" size="sm" className="mb-4">
              Answers &amp; Clarity
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
              Everything you need to know about working with K Web Solutions, our development process, milestone payments, and source code ownership.
            </p>
          </FadeIn>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-electric-500 text-charcoal-950 shadow-md shadow-electric-500/20"
                  : "bg-charcoal-900 text-slate-300 hover:text-white hover:bg-charcoal-800 border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <FadeIn delay={0.1}>
          <Accordion items={filteredFaqs} allowMultiple />
        </FadeIn>

        {/* Support Callout */}
        <div className="mt-16 p-8 rounded-2xl bg-charcoal-900 border border-white/10 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-electric-500/10 text-electric-400 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Have a question not listed here?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            Every technical architecture has unique specifications. We are happy to clarify specific integration requirements, legacy migration questions, or custom timelines.
          </p>
          <Button variant="primary" size="sm" href="/contact">
            Ask a Direct Question
          </Button>
        </div>
      </div>

      <ContactCtaSection />
    </div>
  );
}
