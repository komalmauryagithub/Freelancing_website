import React from "react";
import Link from "next/link";
import { servicesData } from "@/data/services";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion/MotionWrapper";
import {
  Globe,
  Layers,
  BarChart3,
  ShoppingBag,
  Cpu,
  Wrench,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const ServicesOverviewSection: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Globe":
        return <Globe className="w-6 h-6 text-electric-400" />;
      case "Layers":
        return <Layers className="w-6 h-6 text-violetAccent-400" />;
      case "BarChart3":
        return <BarChart3 className="w-6 h-6 text-electric-400" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-6 h-6 text-violetAccent-400" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case "Wrench":
        return <Wrench className="w-6 h-6 text-electric-400" />;
      default:
        return <Globe className="w-6 h-6 text-electric-400" />;
    }
  };

  return (
    <section className="py-20 lg:py-28 relative bg-charcoal-900/40 border-y border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Specialized Services"
          badgeVariant="violet"
          title="Engineered to Solve Specific"
          titleHighlight="Digital Challenges"
          subtitle="From high-impact marketing launches to complex SaaS applications, every solution is delivered with type safety, speed, and premium craft."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {servicesData.map((service, idx) => (
            <FadeIn key={service.id} delay={idx * 0.1}>
              <Card
                glow={idx % 2 === 0 ? "blue" : "violet"}
                className="flex flex-col h-full bg-charcoal-850/70 hover:bg-charcoal-850 border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-800 border border-white/10 flex items-center justify-center shrink-0">
                    {getIcon(service.iconName)}
                  </div>
                  {service.isPopular && (
                    <Badge variant="violet" size="sm">
                      Most Requested
                    </Badge>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-bold text-white tracking-tight">
                  {service.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {service.shortDesc}
                </p>

                {/* Turnaround & price meta */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span>
                    Turnaround: <strong className="text-white">{service.turnaroundTime}</strong>
                  </span>
                  <span>
                    Price: <strong className="text-electric-400 font-bold">{service.priceRange || `Starts at ₹${service.priceStartingAt?.toLocaleString("en-IN")}`}</strong>
                  </span>
                </div>

                {/* Key deliverables */}
                <ul className="mt-5 space-y-2 text-xs text-slate-300 mb-6 flex-1">
                  {service.deliverables.slice(0, 3).map((item, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-electric-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/services#${service.slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-electric-400 hover:text-electric-300 transition-colors pt-2"
                >
                  <span>Detailed Deliverables &amp; Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
