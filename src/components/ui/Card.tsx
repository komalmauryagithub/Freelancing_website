import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: "none" | "blue" | "violet";
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = true,
  glow = "none",
  children,
  ...props
}) => {
  const glowStyles = {
    none: "",
    blue: "hover:border-electric-400/30 hover:shadow-[0_0_30px_-5px_rgba(56,189,248,0.2)]",
    violet: "hover:border-violetAccent-500/30 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-charcoal-850/80 border border-white/[0.08] p-6 backdrop-blur-md transition-all duration-300",
        hoverEffect && "hover:border-white/20 hover:-translate-y-1",
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
