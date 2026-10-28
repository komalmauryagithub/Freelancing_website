"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glow";
  size?: "sm" | "md" | "lg";
  href?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      isLoading = false,
      icon,
      iconPosition = "right",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-electric-500 to-electric-600 text-charcoal-950 font-semibold hover:from-electric-400 hover:to-electric-500 shadow-lg shadow-electric-500/20 hover:shadow-electric-400/30",
      secondary:
        "bg-gradient-to-r from-violetAccent-600 to-violetAccent-700 text-white font-semibold hover:from-violetAccent-500 hover:to-violetAccent-600 shadow-lg shadow-violetAccent-600/20 hover:shadow-violetAccent-500/30",
      outline:
        "border border-white/15 bg-charcoal-850/60 text-slate-200 hover:bg-white/10 hover:border-white/25 hover:text-white backdrop-blur-sm",
      ghost:
        "text-slate-300 hover:text-white hover:bg-white/5",
      glow:
        "bg-charcoal-900 border border-electric-400/30 text-electric-300 hover:border-electric-400 hover:text-electric-200 shadow-[0_0_20px_-3px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_-1px_rgba(56,189,248,0.45)]",
    };

    const combinedClassName = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      className
    );

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && icon && iconPosition === "left" && icon}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === "right" && icon}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
