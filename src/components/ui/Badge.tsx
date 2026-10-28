import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "electric" | "violet" | "emerald" | "charcoal" | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "electric",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full tracking-wide";

  const sizeStyles = {
    sm: "text-[10px] uppercase px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  const variantStyles = {
    electric: "bg-electric-500/10 text-electric-400 border border-electric-400/20",
    violet: "bg-violetAccent-500/10 text-violetAccent-300 border border-violetAccent-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    charcoal: "bg-charcoal-800 text-slate-300 border border-white/10",
    outline: "bg-transparent text-slate-400 border border-white/15",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
