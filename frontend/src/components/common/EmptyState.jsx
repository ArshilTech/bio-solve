import React from "react";
import { HelpCircle, Search, AlertCircle, FileSearch } from "lucide-react";

export default function EmptyState({
  title,
  detail,
  action,
  icon: CustomIcon,
  tone = "default",
}) {
  const Icon = CustomIcon || HelpCircle;

  const toneClasses = {
    default: "bg-[#edf5f0] text-[#0b655b] border-[#d5e7de]",
    search: "bg-[#e8f2f6] text-[#1c647b] border-[#cae2ec]",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="rounded-2xl border border-dashed border-[#d4e1d9] bg-white px-6 py-12 sm:py-16 text-center shadow-xs">
      <div
        className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl border ${
          toneClasses[tone] || toneClasses.default
        }`}
      >
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#15342d] font-display">{title}</h3>
      {detail && (
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-6 text-[#697d74]">
          {detail}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
    </div>
  );
}
