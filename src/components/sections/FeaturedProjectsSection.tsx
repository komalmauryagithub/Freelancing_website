import React from "react";
import Link from "next/link";
import Image from "next/image";
import { projectsData } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ArrowRight, ExternalLink, ArrowUpRight } from "lucide-react";

export const FeaturedProjectsSection: React.FC = () => {
  const featured = projectsData.filter((p) => p.isFeatured).slice(0, 3);

  const formatCategory = (cat: string) => {
    switch (cat) {
      case "ADMIN_CRM":
        return "CRM & Analytics";
      case "ECOMMERCE":
        return "E-Commerce";
      case "BUSINESS_WEBSITES":
        return "Business Website";
      case "DYNAMIC_WEB_APPS":
        return "Dynamic Web App";
      case "API_INTEGRATION":
        return "AI & API Integration";
      default:
        return cat;
    }
  };

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Featured Portfolio"
          badgeVariant="electric"
          title="Handcrafted Solutions Built for"
          titleHighlight="Measurable Scale"
          subtitle="Explore recent case studies highlighting full-stack engineering, bespoke interactive design, and performance optimizations."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featured.map((project, idx) => (
            <FadeIn key={project.id} delay={idx * 0.15}>
              <Card
                glow={idx % 2 === 0 ? "blue" : "violet"}
                className="group flex flex-col h-full overflow-hidden p-0 bg-charcoal-900 border border-white/10"
              >
                {/* Visual Preview */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-950 border-b border-white/10">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="electric" size="sm">
                      {formatCategory(project.category)}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-electric-300 transition-colors">
                    {project.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {project.tagline}
                  </p>

                  {/* Sample metric callout */}
                  {project.sampleMetrics[0] && (
                    <div className="mt-4 p-2.5 rounded-lg bg-electric-500/10 border border-electric-400/20 text-xs text-electric-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-400 shrink-0" />
                      <span className="truncate">{project.sampleMetrics[0]}</span>
                    </div>
                  )}

                  {/* Tech stack badges */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 border border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-400">
                        +{project.technologies.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Footer CTAs */}
                  <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between mt-auto">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-electric-400 transition-colors"
                    >
                      <span>Read Case Study</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Live demo for ${project.title}`}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span>Demo</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* View all projects button */}
        <div className="mt-14 text-center">
          <Button
            variant="outline"
            size="lg"
            href="/projects"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore All Projects &amp; Demos
          </Button>
        </div>
      </div>
    </section>
  );
};
