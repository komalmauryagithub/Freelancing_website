"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BookCallModal } from "@/components/layout/BookCallModal";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ArrowRight, Calendar, Sparkles, Code2, Zap, ShieldCheck } from "lucide-react";

export const HeroSection: React.FC = () => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-electric-500/15 via-violetAccent-600/15 to-transparent blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-electric-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-10 w-[350px] h-[350px] bg-violetAccent-600/10 blur-[110px] rounded-full pointer-events-none" />

        {/* Subtle Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Availability pill */}
          <FadeIn delay={0.1} direction="down">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-850/90 border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-sm shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Select Q4 Freelance &amp; Contract Projects</span>
              <span className="text-white/20">|</span>
              <span className="text-electric-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bespoke Craft
              </span>
            </div>
          </FadeIn>

          {/* Main Headline */}
          <FadeIn delay={0.2}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
              Engineering Modern{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Web Applications
              </span>{" "}
              &amp; High-Impact Studio Websites.
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.3}>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Full-stack freelance software engineer crafting responsive web applications, e-commerce stores, and AI dashboards with React, Node.js, Express, and Python.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                href="/projects"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Projects
              </Button>

              <Button
                variant="secondary"
                size="lg"
                href="/contact"
              >
                Start a Project
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsBookModalOpen(true)}
                icon={<Calendar className="w-4 h-4 text-electric-400" />}
                iconPosition="left"
              >
                Book a Call
              </Button>
            </div>
          </FadeIn>

          {/* Trust Highlights */}
          <FadeIn delay={0.5}>
            <div className="mt-16 pt-10 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-400/20 flex items-center justify-center text-electric-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">&lt; 500ms</div>
                  <div className="text-xs text-slate-400">Fast Load Speed</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violetAccent-500/10 border border-violetAccent-400/20 flex items-center justify-center text-violetAccent-300 shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Full-Stack</div>
                  <div className="text-xs text-slate-400">React, Node &amp; Express</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Databases</div>
                  <div className="text-xs text-slate-400">MongoDB &amp; PostgreSQL</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">100% Deployed</div>
                  <div className="text-xs text-slate-400">Live on Render Cloud</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Book Call Modal */}
      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </>
  );
};
