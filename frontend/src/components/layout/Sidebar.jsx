import React from "react";
import {
  Compass,
  BookOpen,
  FileSearch,
  FlaskConical,
  Network,
  X,
  History,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar({
  active,
  setActive,
  open,
  setOpen,
  analyses = [],
  currentAnalysisId = null,
  onSelectAnalysis,
}) {
  const items = [
    { id: "overview", label: "Research Discovery", icon: Compass, badge: null },
    { id: "gaps", label: "Candidate Gaps", icon: FileSearch, badge: null },
    { id: "literature", label: "Literature Explorer", icon: BookOpen, badge: null },
    { id: "graph", label: "Evidence Graph", icon: Network, badge: null },
    { id: "experiment", label: "Experiment Lab", icon: FlaskConical, badge: null },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-[#0d171e]/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col bg-[#101c24] text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-[74px] items-center justify-between border-b border-[#1c2e3a] px-6">
          <div>
            <div className="text-[17px] font-bold tracking-tight text-white font-display">
              ResearchRadar <span className="text-[#b8f0d5] font-light text-xs ml-0.5">AI</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7da698]">
              Scientific Intelligence
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-4 pt-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#607d72]">
            Scientific Workflow
          </div>

          <nav className="space-y-1.5" aria-label="Main navigation">
            {items.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActive(id);
                    setOpen(false);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-all duration-200 select-none ${
                    isActive
                      ? "bg-gradient-to-r from-[#0b655b] to-[#12534a] text-white shadow-[0_4px_16px_rgba(11,101,91,0.35)] border border-[#1b7a6d]"
                      : "text-[#9cb5ab] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive ? "text-[#b8f0d5]" : "text-[#7b998e]"}`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{label}</span>
                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-[#b8f0d5] shadow-[0_0_8px_#b8f0d5]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Session History section if multiple analyses exist */}
          {analyses.length > 0 && (
            <div className="mt-7 pt-5 border-t border-[#1c2e3a]">
              <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#607d72]">
                <span className="flex items-center gap-1.5">
                  <History size={11} /> Session Queries
                </span>
                <span className="text-[10px] text-[#7da698] font-mono">{analyses.length}</span>
              </div>
              <div className="space-y-1 mt-1 max-h-36 overflow-y-auto custom-scrollbar">
                {analyses.map((a, idx) => {
                  const isCurrent = a.analysis_id === currentAnalysisId;
                  return (
                    <button
                      key={a.analysis_id || idx}
                      onClick={() => {
                        onSelectAnalysis?.(a);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isCurrent
                          ? "bg-white/10 text-[#b8f0d5] font-medium"
                          : "text-[#88a599] hover:bg-white/5 hover:text-white"
                      }`}
                      title={a.question}
                    >
                      <span className="truncate pr-2">{a.question}</span>
                      {isCurrent && <CheckCircle2 size={12} className="shrink-0 text-[#b8f0d5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
