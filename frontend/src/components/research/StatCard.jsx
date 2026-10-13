
export default function StatCard({ label, value, hint, icon: Icon, tint }) {
  return (
    <div className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-[#74877f]">{label}</div>
          <div className="mt-3 text-[29px] font-bold tracking-tight text-[#1a3b35]">
            {value}
          </div>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#91a098]">{hint}</div>
    </div>
  );
}
