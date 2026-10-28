"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, FolderGit2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeaderNav() {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/admin", icon: BarChart3 },
    { name: "CRM & Leads", href: "/admin/crm", icon: Users },
    { name: "Client Projects", href: "/admin/projects", icon: FolderGit2 },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-violetAccent-500 text-white shadow-md shadow-violetAccent-500/25 font-bold"
                  : "bg-charcoal-900 text-slate-400 hover:text-white hover:bg-charcoal-850 border border-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/portal"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-900 hover:bg-charcoal-850 text-slate-300 hover:text-white border border-white/10 transition-colors"
      >
        <span>Preview Client Portal</span>
        <ExternalLink className="w-3.5 h-3.5 text-electric-400" />
      </Link>
    </div>
  );
}
