import React from "react";

export default function StatCard({ label, value, hint, icon: Icon, tint }) {
  return (
    <div className="rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#b9d5c8] hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-[#5c776c] uppercase tracking-wider text-[10px]">
            {label}
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a24] font-display">
            {value}
          </div>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            tint || "bg-[#eaf4ef] text-[#0b655b]"
          }`}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#708a7e]">{hint}</div>
    </div>
  );
}
