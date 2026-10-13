
import {
  Activity,
  BookOpen,
  FileSearch,
  FlaskConical,
  Network,
  ShieldCheck,
  Waves,
  X,
} from "lucide-react";

const cn = (...values) => values.filter(Boolean).join(" ");

export default function Sidebar({ active, setActive, open, setOpen }) {
  const items = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "literature", label: "Literature", icon: BookOpen },
    { id: "gaps", label: "Research gaps", icon: FileSearch },
    { id: "graph", label: "Evidence map", icon: Network },
    { id: "experiment", label: "Experiment lab", icon: FlaskConical },
  ];

  return (
    <>
      {open && (
        <button
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-[#102a2a] text-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#b9ef71] text-[#173c32]">
            <Waves size={22} strokeWidth={2.4} />
          </div>

          <div>
            <div className="text-[17px] font-bold tracking-tight">
              ResearchRadar
            </div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#9ab9af]">
              Scientific discovery
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-1 text-white/60 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#78978e]">
            Workspace
          </div>

          <nav className="space-y-1" aria-label="Main navigation">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActive(id);
                  setOpen(false);
                }}
                aria-current={active === id ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium transition",
                  active === id
                    ? "bg-[#234642] text-white shadow-inner"
                    : "text-[#a8c0b8] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
                {active === id && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c4f47e]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#d4e5dd]">
              <ShieldCheck size={15} className="text-[#b9ef71]" />
              Evidence first
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#91aaa1]">
              Candidate gaps are linked to source records. Findings still need
              scientific review.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-[#6f9085]">
            <span className="h-2 w-2 rounded-full bg-[#b9ef71]" />
            BioSolve Hackathon · Problem 8
          </div>
        </div>
      </aside>
    </>
  );
}
