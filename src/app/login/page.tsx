"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { Sparkles, Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";

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
        throw new Error(json.message || "Invalid email or password.");
      }

      // If user is ADMIN, navigate to /admin unless callbackUrl is specified
      if (json.data?.user?.role === "ADMIN" && callbackUrl === "/portal") {
        window.location.href = "/admin";
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Authentication failed.");
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
                K WEB <span className="text-electric-400">SOLUTIONS</span>
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Access your project requests, milestones, and deliverables.
            </p>
          </div>

          <Card className="p-8 bg-charcoal-900 border border-white/10 shadow-2xl">
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-electric-400 hover:text-electric-300 font-medium"
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
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
              Don&apos;t have a client account yet?{" "}
              <Link
                href="/register"
                className="text-electric-400 hover:text-electric-300 font-semibold"
              >
                Create an Account
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/admin/login"
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Studio Administrator? Access Admin Console</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
