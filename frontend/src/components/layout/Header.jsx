
import { Bell, FlaskConical } from "lucide-react";

export default function Header({
  title = "Research Workspace",
  subtitle = "Discover evidence and uncover new research directions.",
}) {
  return (
    <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-[#e3eae4] bg-white px-6 py-4 lg:px-8">
      <div>
        <p className="text-xs font-medium text-[#819087]">
          ResearchRadar / Workspace
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#203b35]">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[#7a8981]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[#e2eae3] bg-[#f8faf8] px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-[#4b9a70]" />
          <span className="text-xs font-medium text-[#557267]">
            Research mode
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1e9e2] text-[#64776e] transition-colors hover:bg-[#f3f7f3]"
        >
          <Bell size={18} />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ed] text-[#355e50]">
          <FlaskConical size={19} />
        </div>
      </div>
    </header>
  );
}
