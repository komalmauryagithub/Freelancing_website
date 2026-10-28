import React from "react";
import type { Metadata } from "next";
import { ProjectBuilderForm } from "@/components/forms/ProjectBuilderForm";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/motion/MotionWrapper";

export const metadata: Metadata = {
  title: "Project Scope Builder — K Web Solutions",
  description: "Define your project brief, select custom architectural capabilities, and receive an itemized engineering quotation.",
};

export default function GetStartedPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <FadeIn>
            <Badge variant="electric" size="sm" className="mb-4">
              Project Onboarding &amp; Scope Specification
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Build Your Custom{" "}
              <span className="bg-gradient-to-r from-electric-400 via-violetAccent-400 to-electric-300 bg-clip-text text-transparent">
                Project Brief
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Answer a few questions regarding your desired scope. You will receive an architectural review and itemized quotation.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.1}>
          <ProjectBuilderForm />
        </FadeIn>
      </div>
    </div>
  );
}
