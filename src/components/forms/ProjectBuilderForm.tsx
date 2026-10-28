"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_TYPES, BUDGET_RANGES, TIMELINES, ProjectTypeOption } from "@/lib/project-types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Globe,
  Layers,
  BarChart3,
  ShoppingBag,
  Cpu,
  Wrench,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  File,
  X,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export function ProjectBuilderForm() {
  const router = useRouter();

  // Multi-step state (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form data state preserved across steps
  const [formData, setFormData] = useState({
    projectType: "business_website",
    selectedFeatures: [] as string[],
    requirements: "",
    indicativeBudget: BUDGET_RANGES[1],
    timeline: TIMELINES[1],
    name: "",
    email: "",
    company: "",
    phone: "",
    attachments: [] as { name: string; url: string; size: number }[],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Idempotency token to prevent duplicate submissions from rapid repeated clicks
  const [idempotencyKey] = useState<string>(() => {
    return `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });

  // Current active project type metadata
  const selectedTypeMeta =
    PROJECT_TYPES.find((t) => t.id === formData.projectType) || PROJECT_TYPES[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
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

  const toggleFeature = (featureLabel: string) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(featureLabel);
      return {
        ...prev,
        selectedFeatures: exists
          ? prev.selectedFeatures.filter((f) => f !== featureLabel)
          : [...prev.selectedFeatures, featureLabel],
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || `Failed to upload ${file.name}`);
        }

        setFormData((prev) => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            { name: file.name, url: json.data.url, size: file.size },
          ],
        }));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!formData.projectType) {
        setErrorMessage("Please select a project type.");
        return false;
      }
    }
    if (step === 2) {
      if (formData.selectedFeatures.length === 0) {
        setErrorMessage("Please select at least one feature for your project.");
        return false;
      }
    }
    if (step === 3) {
      if (formData.requirements.trim().length < 15) {
        setErrorMessage("Please provide at least 15 characters describing your requirements.");
        return false;
      }
    }
    if (step === 6) {
      if (formData.name.trim().length < 2) {
        setErrorMessage("Please provide your full name.");
        return false;
      }
      if (!formData.email.includes("@") || !formData.email.includes(".")) {
        setErrorMessage("Please provide a valid email address.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      setCurrentStep(6);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/project-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: formData.projectType,
          selectedFeatures: formData.selectedFeatures,
          requirements: formData.requirements,
          indicativeBudget: formData.indicativeBudget,
          timeline: formData.timeline,
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
          attachments: formData.attachments.map((a) => a.url),
          idempotencyKey,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to submit project brief.");
      }

      const ref = json.data?.referenceNumber || "PRJ-2025-CONFIRMED";
      router.push(`/project-confirmation?ref=${encodeURIComponent(ref)}`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Submission error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>
            Step {currentStep} of 8:{" "}
            <strong className="text-white">
              {currentStep === 1 && "Select Project Type"}
              {currentStep === 2 && "Choose Core Features"}
              {currentStep === 3 && "Business & Requirements"}
              {currentStep === 4 && "Indicative Budget Range"}
              {currentStep === 5 && "Target Timeline"}
              {currentStep === 6 && "Contact Details"}
              {currentStep === 7 && "Reference Attachments"}
              {currentStep === 8 && "Review & Submit Brief"}
            </strong>
          </span>
          <span className="text-electric-400">{Math.round((currentStep / 8) * 100)}% Complete</span>
        </div>

        <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-electric-500 to-violetAccent-500 transition-all duration-300"
            style={{ width: `${(currentStep / 8) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Select Project Type */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-2xl font-bold text-white">What type of project are you building?</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select the category that best matches your target digital product.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROJECT_TYPES.map((type) => {
              const isSelected = formData.projectType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      projectType: type.id,
                      selectedFeatures: [], // reset features when type changes
                    });
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-charcoal-800 border-electric-400 shadow-lg shadow-electric-500/10 ring-1 ring-electric-400"
                      : "bg-charcoal-900 border-white/10 hover:border-white/20 hover:bg-charcoal-850"
                  }`}
                >
                  <div>
                    <div className="p-3 rounded-xl bg-charcoal-800 border border-white/5 inline-block mb-3">
                      {getIcon(type.icon)}
                    </div>
                    <h3 className="font-bold text-white text-base">{type.title}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {type.tagline}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400">
                    Typical timeline: <span className="text-white font-medium">{type.typicalTimeline}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Select Relevant Features */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto mb-6">
            <Badge variant="violet" size="sm" className="mb-2">
              {selectedTypeMeta.title} Features
            </Badge>
            <h2 className="text-2xl font-bold text-white">Select Relevant Features</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Choose the architectural capabilities you need. (Select all that apply)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedTypeMeta.availableFeatures.map((feat) => {
              const isChecked = formData.selectedFeatures.includes(feat.label);
              return (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.label)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "bg-charcoal-800 border-electric-400 shadow-md ring-1 ring-electric-400"
                      : "bg-charcoal-900 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked
                          ? "bg-electric-500 border-electric-400 text-charcoal-950 font-bold"
                          : "border-white/20 bg-charcoal-800"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{feat.label}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Describe Requirements */}
      {currentStep === 3 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Describe Your Project Requirements</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Provide context regarding your audience, business goals, and current pain points.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Project Scope &amp; Specifications *
              </label>
              <textarea
                rows={6}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Example: We are building a headless SaaS portal for enterprise accounting. We need responsive client dashboards, CSV report exports, role-based access, and sub-second load times..."
                className="w-full px-4 py-3 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400 resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
                <span>Minimum 15 characters</span>
                <span>{formData.requirements.length} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Indicative Budget Range */}
      {currentStep === 4 && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Indicative Budget Range</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select an indicative investment tier. (Note: Indicative budgets are used for feasibility planning and are not final quotes).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUDGET_RANGES.map((b) => {
              const isSelected = formData.indicativeBudget === b;
              return (
                <button
                  type="button"
                  key={b}
                  onClick={() => setFormData({ ...formData, indicativeBudget: b })}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-charcoal-800 border-electric-400 ring-1 ring-electric-400 shadow-lg text-white font-bold"
                      : "bg-charcoal-900 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="text-base font-bold">{b}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Expected Timeline */}
      {currentStep === 5 && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Expected Timeline</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              When do you envision shipping this product to production?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIMELINES.map((t) => {
              const isSelected = formData.timeline === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({ ...formData, timeline: t })}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-charcoal-800 border-electric-400 ring-1 ring-electric-400 shadow-lg text-white font-bold"
                      : "bg-charcoal-900 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className="text-sm font-semibold">{t}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: Provide Contact Details */}
      {currentStep === 6 && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Where should we send your itemized proposal and project brief confirmation?
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal-900 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Marcus Vance"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marcus@vanceventures.io"
                className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Vance Ventures"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: Attach Reference Files */}
      {currentStep === 7 && (
        <div className="space-y-6 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Attach Reference Files (Optional)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload wireframes, design mockups, brand assets, or RFP documents (max 10MB per file).
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-charcoal-900 border-2 border-dashed border-white/15 text-center hover:border-electric-400/40 transition-colors">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-bold text-white">Upload attachments</div>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              PDF, PNG, JPG, WEBP, ZIP, DOCX, TXT up to 10MB
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-800 border border-white/10 text-xs font-semibold text-white hover:bg-charcoal-700 cursor-pointer transition-colors">
              <span>Select Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {isUploading && (
              <p className="text-xs text-electric-400 mt-3 animate-pulse">
                Uploading securely to protected storage...
              </p>
            )}
          </div>

          {formData.attachments.length > 0 && (
            <div className="space-y-2 mt-4">
              <span className="text-xs font-semibold uppercase text-slate-400">
                Uploaded Files ({formData.attachments.length})
              </span>
              {formData.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-charcoal-850 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <File className="w-4 h-4 text-electric-400 shrink-0" />
                    <span className="text-white truncate font-medium">{file.name}</span>
                    <span className="text-slate-500">({Math.round(file.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 8: Review & Submit */}
      {currentStep === 8 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Badge variant="electric" size="sm" className="mb-2">
              Ready for Submission
            </Badge>
            <h2 className="text-2xl font-bold text-white">Review Your Project Brief</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify your scope parameters before finalizing submission.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-charcoal-900 border border-white/10 space-y-6 text-sm">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Project Type
                </span>
                <span className="font-bold text-white text-base">
                  {selectedTypeMeta.title}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Indicative Budget
                </span>
                <span className="font-bold text-electric-400 text-base">
                  {formData.indicativeBudget}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Timeline
                </span>
                <span className="font-medium text-white">{formData.timeline}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Contact
                </span>
                <span className="font-medium text-white">
                  {formData.name} ({formData.email})
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
                Selected Features ({formData.selectedFeatures.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formData.selectedFeatures.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-md bg-charcoal-800 text-slate-200 border border-white/5"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Requirements Overview
              </span>
              <p className="text-xs text-slate-300 bg-charcoal-850 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                {formData.requirements}
              </p>
            </div>

            {formData.attachments.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                  Attachments ({formData.attachments.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {formData.attachments.map((a, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-charcoal-800 text-slate-300 border border-white/5 flex items-center gap-1.5"
                    >
                      <File className="w-3.5 h-3.5 text-electric-400" />
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
            disabled={isSubmitting}
          >
            Previous Step
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 8 ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Continue to Step {currentStep + 1}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            Submit Project Brief
          </Button>
        )}
      </div>
    </div>
  );
}
