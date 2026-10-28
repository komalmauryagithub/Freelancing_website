import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsData } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} — Case Study | K Web Solutions`,
    description: project.tagline,
  };
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const projectIndex = projectsData.findIndex((p) => p.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const project = projectsData[projectIndex];
  const prevProject = projectIndex > 0 ? projectsData[projectIndex - 1] : null;
  const nextProject =
    projectIndex < projectsData.length - 1 ? projectsData[projectIndex + 1] : null;

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Projects</span>
          </Link>
        </div>

        {/* Hero Meta */}
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="electric" size="sm">
              {project.category.replace("_", " ")}
            </Badge>
            {project.clientName && (
              <Badge variant="charcoal" size="sm">
                Client: {project.clientName}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            {project.tagline}
          </p>

          {/* Links */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-500 text-charcoal-950 font-bold text-xs hover:bg-electric-400 transition-colors shadow-md shadow-electric-500/20"
              >
                <span>Launch Live Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Large Cover Visual */}
        <div className="mt-12 rounded-3xl overflow-hidden border border-white/10 bg-charcoal-900 relative aspect-[16/9] max-h-[580px] w-full shadow-2xl">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Case Study Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 my-20">
          {/* Main narrative */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-electric-400" />
                Project Overview
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* The Challenge */}
            {project.challenge && (
              <div className="p-8 rounded-2xl bg-charcoal-900 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-3 text-red-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  The Architectural Challenge
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {project.challenge}
                </p>
              </div>
            )}

            {/* The Solution */}
            {project.solution && (
              <div className="p-8 rounded-2xl bg-charcoal-900 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-3 text-electric-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-electric-400" />
                  Engineering Strategy &amp; Solution
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {project.solution}
                </p>
              </div>
            )}

            {/* Core Features Delivered */}
            {project.features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-violetAccent-400" />
                  Key Features &amp; Technical Capabilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-charcoal-850 border border-white/10 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-electric-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Meta */}
          <div className="lg:col-span-4 space-y-6">
            {/* Impact Metrics */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Technical Highlights &amp; Metrics
              </h3>
              <ul className="space-y-3">
                {project.sampleMetrics.map((metric, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium"
                  >
                    {metric}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Breakdown */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-electric-400" />
                Technologies &amp; Libraries
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-200 border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-electric-950/40 to-charcoal-900 border border-electric-400/20">
              <h4 className="font-bold text-white text-base mb-2">Need a Similar System?</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                We can architect and deliver a tailored solution adhering to the same performance standards.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                href={`/contact?ref=${project.slug}`}
              >
                Inquire About Similar Project
              </Button>
            </div>
          </div>
        </div>

        {/* Project Navigation (Prev / Next) */}
        <div className="border-t border-white/10 pt-10 mt-16 flex items-center justify-between">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="flex items-center gap-3 text-left group"
            >
              <div className="p-2.5 rounded-xl bg-charcoal-850 border border-white/10 group-hover:border-electric-400/40 transition-colors">
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-electric-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-slate-400">Previous Case</div>
                <div className="text-sm font-bold text-white group-hover:text-electric-300">
                  {prevProject.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="flex items-center gap-3 text-right group ml-auto"
            >
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-slate-400">Next Case</div>
                <div className="text-sm font-bold text-white group-hover:text-electric-300">
                  {nextProject.title}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-charcoal-850 border border-white/10 group-hover:border-electric-400/40 transition-colors">
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-electric-400" />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      <ContactCtaSection />
    </div>
  );
}
