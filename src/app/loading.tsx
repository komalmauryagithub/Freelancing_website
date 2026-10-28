import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-electric-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-electric-400 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400 animate-pulse">
        Loading K Web Solutions...
      </p>
    </div>
  );
}
