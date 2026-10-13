
import { Search } from "lucide-react";

export default function EmptyState({
  title = "Nothing to show yet",
  description = "Start a research analysis to see results here.",
  icon: Icon = Search,
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d6e1db] bg-white/70 px-6 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ef] text-[#477267]">
        <Icon size={21} />
      </div>

      <h3 className="text-sm font-semibold text-[#29443c]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[#7a8982]">
        {description}
      </p>
    </div>
  );
}
