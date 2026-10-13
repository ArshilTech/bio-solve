import React from "react";

export default function Tag({ children, tone = "slate", className = "", icon: Icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    emerald: "bg-emerald-500/10 text-emerald-800 border-emerald-300",
    amber: "bg-amber-50 text-amber-800 border-amber-200/90",
    blue: "bg-sky-50 text-sky-800 border-sky-200/80",
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
    red: "bg-rose-50 text-rose-800 border-rose-200/80",
    dark: "bg-[#101c24] text-[#b8f0d5] border-[#223946]",
    mint: "bg-[#b8f0d5]/40 text-[#0b544b] border-[#9de2c0]",
    teal: "bg-[#0b655b]/10 text-[#0b655b] border-[#0b655b]/25",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border tracking-tight ${
        tones[tone] || tones.slate
      } ${className}`}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      {children}
    </span>
  );
}
