import React from "react";
import { processSteps } from "@/data/process";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { CheckCircle2 } from "lucide-react";

export const ProcessSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="How I Work"
          badgeVariant="electric"
          title="A Transparent, Step-by-Step"
          titleHighlight="Development Workflow"
          subtitle="No guesswork or confusion. A structured 5-step process delivering tangible milestones and full transparency from day one."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {processSteps.map((step, idx) => (
            <FadeIn key={step.number} delay={idx * 0.1}>
              <div className="relative p-6 rounded-2xl bg-charcoal-900 border border-white/10 flex flex-col h-full hover:border-electric-400/30 transition-colors group">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-white/20 group-hover:text-electric-400/40 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-electric-400/40 group-hover:bg-electric-400" />
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-electric-300 transition-colors">
                  {step.title}
                </h3>

                <p className="mt-1 text-xs text-electric-400/80 font-medium">
                  {step.tagline}
                </p>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>

                <div className="mt-6 pt-4 border-t border-white/[0.08] mt-auto">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Key Outputs
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {step.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-electric-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
