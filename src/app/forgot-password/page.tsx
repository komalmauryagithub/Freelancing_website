"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/motion/MotionWrapper";
import { Sparkles, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to process request.");
      }

      setIsSuccess(true);
      if (json.data?.devToken) {
        setDevToken(json.data.devToken);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
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
              Reset Your Password
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Enter your email and we&apos;ll dispatch a secure recovery link.
            </p>
          </div>

          <Card className="p-8 bg-charcoal-900 border border-white/10 shadow-2xl">
            {isSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Instructions Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If an account exists with <span className="text-electric-400 font-semibold">{email}</span>, a secure password reset link has been dispatched.
                </p>

                {devToken && (
                  <div className="p-3 rounded-lg bg-electric-500/10 border border-electric-400/20 text-left text-xs space-y-2 mt-4">
                    <span className="text-electric-400 font-bold block">Developer Mode Token Preview:</span>
                    <Link
                      href={`/reset-password?token=${devToken}`}
                      className="text-white hover:underline block break-all text-[11px] font-mono bg-charcoal-800 p-2 rounded"
                    >
                      /reset-password?token={devToken}
                    </Link>
                  </div>
                )}

                <div className="pt-4">
                  <Button variant="outline" className="w-full text-xs" href="/login">
                    Return to Sign In
                  </Button>
                </div>
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
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
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
                    Send Reset Instructions
                  </Button>
                </div>

                <div className="pt-4 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
