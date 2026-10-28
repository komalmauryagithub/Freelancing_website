import React from "react";
import Image from "next/image";
import { testimonialsData } from "@/data/testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { Quote, Info } from "lucide-react";

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Sample Client Reviews"
          badgeVariant="electric"
          title="Demonstrating Feedback &amp;"
          titleHighlight="Working Relationships"
          subtitle="Illustrative examples showing how previous engineering sprints and client collaborations are evaluated."
        />

        {/* Clear Sample Notice Banner */}
        <div className="max-w-2xl mx-auto mb-10 p-3.5 rounded-xl bg-charcoal-850 border border-electric-400/20 text-xs text-slate-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-electric-400 shrink-0" />
          <span>
            <strong>Sample Demonstration Content:</strong> The testimonials below represent sample feedback scenarios for demonstration purposes and will be replaced with verified client endorsements.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((t, idx) => (
            <FadeIn key={t.id} delay={idx * 0.15}>
              <Card className="flex flex-col h-full bg-charcoal-900 border border-white/10 p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="p-2 rounded-lg bg-electric-500/10 text-electric-400">
                    <Quote className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" size="sm">
                    Sample Review
                  </Badge>
                </div>

                <p className="text-slate-300 text-sm md:text-base leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="mt-8 pt-5 border-t border-white/10 flex items-center gap-3.5">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/20 shrink-0 bg-charcoal-800">
                    <Image
                      src={t.avatar}
                      alt={t.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">
                      {t.author}
                    </span>
                    <span className="text-xs text-slate-400">
                      {t.role}, {t.company}
                    </span>
                    {t.projectTitle && (
                      <span className="text-[11px] text-electric-400 font-medium mt-0.5">
                        Ref: {t.projectTitle} (Sample)
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
