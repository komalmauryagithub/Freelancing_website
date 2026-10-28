import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Github, Twitter, Linkedin, Mail, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-charcoal-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-violetAccent-500 via-electric-400 to-violetAccent-600 shadow-md shadow-violet-500/25 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="K Web Solutions Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-full bg-white"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                K WEB <span className="text-electric-400">SOLUTIONS</span>
              </span>
            </Link>

            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Bespoke digital engineering studio specialized in high-performance web applications, headless commerce, CRM dashboards, and creative corporate websites.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for Q4 Client Projects
              </div>
              <a
                href="mailto:komalmaurya09072005@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-electric-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-electric-400" />
                <span>komalmaurya09072005@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-electric-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-electric-400 transition-colors">
                  About Studio
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-electric-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-electric-400 transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-electric-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-electric-400 transition-colors">
                  Contact &amp; Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Core Capabilities</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services#business-websites" className="hover:text-electric-400 transition-colors">
                  Business Websites
                </Link>
              </li>
              <li>
                <Link href="/services#dynamic-web-applications" className="hover:text-electric-400 transition-colors">
                  Dynamic Web Apps
                </Link>
              </li>
              <li>
                <Link href="/services#crm-admin-dashboards" className="hover:text-electric-400 transition-colors">
                  CRM &amp; Dashboards
                </Link>
              </li>
              <li>
                <Link href="/services#ecommerce-websites" className="hover:text-electric-400 transition-colors">
                  Headless E-Commerce
                </Link>
              </li>
              <li>
                <Link href="/services#api-integration" className="hover:text-electric-400 transition-colors">
                  API &amp; Webhooks
                </Link>
              </li>
              <li>
                <Link href="/services#website-redesign-bug-fixing" className="hover:text-electric-400 transition-colors">
                  Performance &amp; Bug Fixes
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Connect</h4>
            <div className="space-y-2">
              <a
                href="mailto:komalmaurya09072005@gmail.com"
                aria-label="Email Komal Maurya"
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-electric-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-charcoal-850 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-electric-400 group-hover:border-electric-400/40 group-hover:bg-electric-500/10 transition-colors shrink-0">
                  <Mail className="w-4 h-4 text-electric-400" />
                </div>
                <span className="truncate group-hover:underline">komalmaurya09072005@gmail.com</span>
              </a>

              <a
                href="https://github.com/komalmauryagithub"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Profile"
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-electric-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-charcoal-850 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:border-white/20 transition-colors shrink-0">
                  <Github className="w-4 h-4" />
                </div>
                <span className="truncate group-hover:underline">komalmauryagithub</span>
              </a>
            </div>

            <div className="pt-2 space-y-1 text-xs">
              <div>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link href="/terms" className="hover:text-slate-300 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} K Web Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:komalmaurya09072005@gmail.com"
              className="text-slate-400 hover:text-electric-400 transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-electric-400" />
              <span>komalmaurya09072005@gmail.com</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <p className="flex items-center gap-1">
              Built with Next.js App Router, Tailwind CSS &amp; Motion.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
