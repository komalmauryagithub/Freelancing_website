import React from "react";
import { techStackData } from "@/data/techStack";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { Layers, Server, Database, Sparkles } from "lucide-react";

export const TechStackSection: React.FC = () => {
  const getCategoryIcon = (category: string) => {
    if (category.includes("Frontend")) return <Layers className="w-5 h-5 text-electric-400" />;
    if (category.includes("Backend")) return <Server className="w-5 h-5 text-violetAccent-400" />;
    if (category.includes("Database")) return <Database className="w-5 h-5 text-emerald-400" />;
    return <Sparkles className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <section className="py-20 lg:py-28 relative bg-charcoal-900/30 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Core Technology Stack"
          badgeVariant="emerald"
          title="Technologies Used in"
          titleHighlight="My Projects"
          subtitle="The exact, production-proven full-stack technologies used to develop, power, and deploy all 5 live web applications."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStackData.map((cat, idx) => (
            <FadeIn key={cat.category} delay={idx * 0.1}>
              <Card className="h-full bg-charcoal-850/80 border border-white/10 p-6 flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
                  <div className="p-2 rounded-lg bg-charcoal-800 border border-white/10">
                    {getCategoryIcon(cat.category)}
                  </div>
                  <h3 className="font-bold text-white text-base">
                    {cat.category}
                  </h3>
                </div>

                <ul className="space-y-3.5 flex-1">
                  {cat.skills.map((skill) => (
                    <li key={skill.name} className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200">
                        {skill.name}
                      </span>
                      <span className="text-[11px] text-electric-400/90 font-medium">
                        {skill.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
