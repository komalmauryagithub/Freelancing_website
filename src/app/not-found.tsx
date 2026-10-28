import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 pt-20">
      <div className="w-16 h-16 rounded-2xl bg-charcoal-850 border border-white/10 flex items-center justify-center text-electric-400 mb-6">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-electric-400 mb-2">
        Error 404
      </span>

      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
        Page Not Located
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The route you are attempting to visit does not exist or may have been reorganized during a recent deployment.
      </p>

      <Button
        variant="primary"
        href="/"
        icon={<ArrowLeft className="w-4 h-4" />}
        iconPosition="left"
      >
        Return to Home
      </Button>
    </div>
  );
}
