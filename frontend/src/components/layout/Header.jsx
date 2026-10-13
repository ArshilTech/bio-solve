
import { Menu } from "lucide-react";

export default function Header({ active, onMenu }) {
  const labels = {
    overview: "Overview",
    literature: "Literature explorer",
    gaps: "Research gap analysis",
    graph: "Evidence map",
    experiment: "Experiment lab",
  };

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e2e9e4] bg-[#f8faf8]/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-[#42645a] hover:bg-[#eaf1ec] lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#789087]">
            Research workspace
          </div>
          <div className="mt-0.5 text-[15px] font-bold text-[#193a35]">
            {labels[active] || "Overview"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[#e0e8e2] bg-white px-3 py-2 text-[11px] font-medium text-[#5d766e] sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#32a879]" />
          Frontend ready
        </div>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dcebe3] text-xs font-bold text-[#285a4b]">
          RR
        </div>
      </div>
    </header>
  );
}
