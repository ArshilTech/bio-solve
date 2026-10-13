
import {
  LayoutDashboard,
  BookOpen,
  Lightbulb,
  Network,
  FlaskConical,
  Radar,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "literature", label: "Literature Review", icon: BookOpen },
  { id: "gaps", label: "Research Gaps", icon: Lightbulb },
  { id: "evidence", label: "Evidence Map", icon: Network },
  { id: "experiments", label: "Experiments", icon: FlaskConical },
];

export default function Sidebar({
  activePage = "overview",
  onNavigate = () => {},
}) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#e0e8e2] bg-white">
      <div className="flex items-center gap-3 border-b border-[#edf1ed] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183f3b] text-white">
          <Radar size={23} />
        </div>

        <div>
          <h1 className="text-base font-semibold tracking-tight text-[#183333]">
            ResearchRadar
          </h1>
          <p className="mt-0.5 text-xs text-[#7c8b83]">AI Research Workspace</p>
        </div>
      </div>

      <div className="px-4 pt-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a69e]">
          Workspace
        </p>

        <nav className="space-y-1" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-[#eaf3ed] font-semibold text-[#24564b]"
                    : "text-[#697b72] hover:bg-[#f5f8f5] hover:text-[#294b40]"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={15} />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-xl border border-[#e4ebe5] bg-[#f7faf7] p-3">
          <p className="text-xs font-semibold text-[#35564b]">
            Research workspace
          </p>
          <p className="mt-1 text-xs leading-5 text-[#7b8b82]">
            Explore literature, connect evidence, and identify research gaps.
          </p>
        </div>
      </div>
    </aside>
  );
}
