"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BookCallModal } from "./BookCallModal";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Menu, X, ArrowUpRight, Sparkles, LogIn, ShieldCheck, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SanitizedUser } from "@/lib/auth";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SanitizedUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch current user session dynamically on mount and route changes
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setCurrentUser(json.data?.user || null);
          }
        }
      } catch {
        // Silently fallback to unauthenticated state
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "py-3.5 bg-charcoal-950/80 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20"
            : "py-5 bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 rounded-lg"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-violetAccent-500 via-electric-400 to-violetAccent-600 shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="K Web Solutions Logo"
                  width={40}
                  height={40}
                  priority
                  className="w-full h-full object-contain rounded-full bg-white"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-white flex items-center gap-1">
                  K WEB <span className="text-electric-400">SOLUTIONS</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold -mt-1">
                  Creative Digital Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-charcoal-900/60 border border-white/[0.08] px-4 py-1.5 rounded-full backdrop-blur-sm">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xs lg:text-sm font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400",
                      isActive
                        ? "text-white bg-white/10 font-semibold shadow-inner"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <NotificationCenter />

              {/* Dynamic User Authentication State */}
              {!isAuthLoading && (
                <>
                  {currentUser ? (
                    currentUser.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-violetAccent-500/15 text-violetAccent-300 border border-violetAccent-500/30 hover:bg-violetAccent-500/25 transition-all shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-violetAccent-400" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        href="/portal"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-electric-500/15 text-electric-300 border border-electric-500/30 hover:bg-electric-500/25 transition-all shadow-sm"
                      >
                        <FolderGit2 className="w-3.5 h-3.5 text-electric-400" />
                        <span>Client Portal</span>
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/login"
                      className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors inline-flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookModalOpen(true)}
              >
                Book a Call
              </Button>
              <Button
                variant="primary"
                size="sm"
                href="/get-started"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Start a Project
              </Button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <NotificationCenter />
              <button
                type="button"
                onClick={() => setIsBookModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-electric-500/10 text-electric-400 border border-electric-400/20"
              >
                Book Call
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-charcoal-900 border border-white/10"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 px-4 pt-2 pb-6 bg-charcoal-900/95 border-b border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "text-electric-400 bg-electric-400/10 font-semibold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Mobile Dynamic Auth Link */}
              <div className="pt-2">
                {currentUser ? (
                  currentUser.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-violetAccent-500/15 text-violetAccent-300 border border-violetAccent-500/30"
                    >
                      <ShieldCheck className="w-4 h-4 text-violetAccent-400" />
                      <span>Admin Console</span>
                    </Link>
                  ) : (
                    <Link
                      href="/portal"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-electric-500/15 text-electric-300 border border-electric-500/30"
                    >
                      <FolderGit2 className="w-4 h-4 text-electric-400" />
                      <span>Client Portal</span>
                    </Link>
                  )
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <LogIn className="w-4 h-4 text-slate-400" />
                    <span>Sign In to Account</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full"
                href="/get-started"
                icon={<ArrowUpRight className="w-4 h-4" />}
              >
                Start a Project
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBookModalOpen(true);
                }}
              >
                Book a 30-Min Call
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Book Call Modal */}
      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
    </>
  );
};
