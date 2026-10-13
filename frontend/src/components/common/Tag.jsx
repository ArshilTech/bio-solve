
const tones = {
  slate: "bg-slate-100 text-slate-600",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-cyan-50 text-cyan-700",
  red: "bg-rose-50 text-rose-700",
  dark: "bg-[#e2efea] text-[#245a4c]",
};

export default function Tag({
  children,
  tone = "slate",
  variant,
  className = "",
}) {
  const selectedTone = variant
    ? {
        default: "slate",
        success: "green",
        warning: "amber",
        danger: "red",
      }[variant] || tone
    : tone;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        tones[selectedTone] || tones.slate
      } ${className}`}
    >
      {children}
    </span>
  );
}
