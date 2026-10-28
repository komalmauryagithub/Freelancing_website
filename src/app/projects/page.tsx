"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { projectsData } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { BookCallModal } from "@/components/layout/BookCallModal";
import {
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";

const CATEGORIES = [
  { label: "All Works", value: "ALL" },
  { label: "Dynamic Web Apps", value: "DYNAMIC_WEB_APPS" },
  { label: "E-Commerce", value: "ECOMMERCE" },
  { label: "CRM & Dashboards", value: "ADMIN_CRM" },
  { label: "Business Websites", value: "BUSINESS_WEBSITES" },
  { label: "API & Backend", value: "API_INTEGRATION" },
  { label: "Redesign & Fix", value: "REDESIGN_PERFORMANCE" },
];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const matchesCategory =
        selectedCategory === "ALL" || project.category === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <FadeIn>
            <Badge variant="electric" size="sm" className="mb-4">
              Selected Projects &amp; Case Studies
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Crafted with{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Technical Rigor
              </span>{" "}
              &amp; Precision.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
              Explore our catalogue of production web applications, headless commerce platforms, and internal tools.
            </p>
          </FadeIn>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by tech, keyword..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Counter */}
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-white font-bold">{filteredProjects.length}</span>{" "}
              {filteredProjects.length === 1 ? "project" : "projects"}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
                  selectedCategory === cat.value
                    ? "bg-electric-500 text-charcoal-950 shadow-md shadow-electric-500/20"
                    : "bg-charcoal-900 text-slate-300 hover:text-white hover:bg-charcoal-800 border border-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-charcoal-900 border border-white/10 p-8">
            <Layers className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No projects match your filter</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Try adjusting your search query or reset the category filters to view all case studies.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, idx) => (
              <FadeIn key={project.id} delay={idx * 0.08}>
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
                        {project.category.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-electric-300 transition-colors">
                      {project.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {project.tagline}
                    </p>

                    {/* Sample metric */}
                    {project.sampleMetrics[0] && (
                      <div className="mt-4 p-2.5 rounded-lg bg-electric-500/10 border border-electric-400/20 text-xs text-electric-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-400 shrink-0" />
                        <span className="truncate">{project.sampleMetrics[0]}</span>
                      </div>
                    )}

                    {/* Tech Badges */}
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

                    {/* Actions */}
                    <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between mt-auto">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-electric-400 transition-colors"
                      >
                        <span>Full Case Study</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <span>Live Demo</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        )}

        {/* "Build Something Similar" CTA block */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-charcoal-900 border border-white/10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violetAccent-500/10 border border-violetAccent-500/20 text-violetAccent-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Have a Similar Scope in Mind?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
            Build Something Similar for Your Brand
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Every project starts with an in-depth technical discovery and clear milestone deliverables. Share your vision and get an exact roadmap.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" size="lg" href="/contact">
              Start Project Inquiry
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsBookModalOpen(true)}
              icon={<Calendar className="w-4 h-4 text-electric-400" />}
              iconPosition="left"
            >
              Book a 30-Min Call
            </Button>
          </div>
        </div>
      </div>

      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </div>
  );
}
