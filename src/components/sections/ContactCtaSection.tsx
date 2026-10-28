"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BookCallModal } from "@/components/layout/BookCallModal";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

export const ContactCtaSection: React.FC = () => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  return (
    <>
      <section className="py-20 lg:py-28 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-electric-500/15 via-violetAccent-600/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn>
            <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-b from-charcoal-850 to-charcoal-900 border border-white/10 text-center relative overflow-hidden shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-400/20 text-electric-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Elevate Your Platform?</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
                Let&apos;s Build Something Extraordinary Together.
              </h2>

              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
                Whether you need a dynamic web app, custom CRM dashboard, or full-scale site redesign, we turn ambitious ideas into high-performing reality.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  href="/contact"
                  icon={<ArrowRight className="w-4 h-4" />}
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
                  Book a Discovery Call
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </>
  );
};
