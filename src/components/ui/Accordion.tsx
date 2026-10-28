"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  isOpen = false,
  onToggle,
}) => {
  return (
    <div className="border-b border-white/[0.08] last:border-b-0">
      <button
        type="button"
        id={`accordion-btn-${id}`}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
        onClick={onToggle}
        className="w-full py-5 px-4 flex items-center justify-between text-left font-medium text-slate-200 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 rounded-lg group"
      >
        <span className="text-base md:text-lg group-hover:text-electric-300 transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 group-hover:text-electric-400",
            isOpen && "rotate-180 text-electric-400"
          )}
        />
      </button>
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-labelledby={`accordion-btn-${id}`}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out px-4",
          isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="text-slate-400 text-sm md:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface AccordionProps {
  items: {
    id: string;
    question: string;
    answer: string;
  }[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>([items[0]?.id || ""]);

  const handleToggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-charcoal-850/80 border border-white/[0.08] divide-y divide-white/[0.08] backdrop-blur-md",
        className
      )}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          title={item.question}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.answer}
        </AccordionItem>
      ))}
    </div>
  );
};
