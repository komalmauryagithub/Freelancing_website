"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Invalid administrator credentials.");
      }

      if (json.data?.user?.role !== "ADMIN") {
        throw new Error(
          "Access Denied: This account is registered as a Client. Please use the Client Portal to log in."
        );
      }

      // Hard redirect to Admin Console
      window.location.href = "/admin";
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Administrator authentication failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center pt-24 pb-16 px-4">
      <div className="w-full max-w-md">
        <FadeIn>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-violetAccent-500 via-electric-400 to-violetAccent-600 shadow-md shadow-violet-500/25 shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/images/logo.png"
                  alt="K Web Solutions Logo"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-contain rounded-full bg-white"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                K WEB SOLUTIONS<span className="text-violetAccent-400">.</span>ADMIN
              </span>
            </Link>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="violet" size="sm">
                Studio Operations
              </Badge>
              <Badge variant="outline" size="sm">
                Restricted Console
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Administrator Access
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Sign in with your master studio credentials to manage projects, CRM, and finances.
            </p>
          </div>

          <Card className="p-8 bg-charcoal-900 border border-violetAccent-500/30 shadow-2xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violetAccent-500 via-electric-500 to-violetAccent-500" />

            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMessage}</span>
                  {errorMessage.includes("Client") && (
                    <div className="mt-2">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-electric-400 hover:underline"
                      >
                        <span>Switch to Client Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@vanguard.studio"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violetAccent-400 focus:ring-1 focus:ring-violetAccent-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Master Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-violetAccent-400 hover:text-violetAccent-300 font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violetAccent-400 focus:ring-1 focus:ring-violetAccent-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violetAccent-600 to-indigo-600 hover:from-violetAccent-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violetAccent-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Master Credentials...</span>
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Enter Admin Console</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Looking for your project workspace?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-electric-400 hover:text-electric-300 hover:underline inline-flex items-center gap-1"
                >
                  <span>Client Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio Homepage</span>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
