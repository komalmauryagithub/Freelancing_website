"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { Sparkles, Lock, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to reset password.");
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Reset error occurred.");
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
              Set New Password
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Create a strong new password for your account.
            </p>
          </div>

          <Card className="p-8 bg-charcoal-900 border border-white/10 shadow-2xl">
            {isSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Password Updated!</h3>
                <p className="text-xs text-slate-300">
                  Your password has been successfully updated. All active sessions have been revoked.
                </p>
                <div className="pt-4">
                  <Button variant="primary" className="w-full" href="/login">
                    Sign In with New Password
                  </Button>
                </div>
              </div>
            ) : !token ? (
              <div className="text-center py-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  Missing password reset token. Please use the link provided in your email or request a new one.
                </div>
                <Button variant="outline" className="w-full" href="/forgot-password">
                  Request New Reset Link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-400 focus:ring-1 focus:ring-electric-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
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
                    Update Password
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
