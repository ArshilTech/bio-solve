
export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
}) {
  const variants = {
    primary:
      "bg-[#176f60] text-white shadow-sm hover:bg-[#12594e] disabled:bg-[#9cbab2]",
    secondary:
      "border border-[#d9e3de] bg-white text-[#24413d] hover:bg-[#f7faf8]",
    ghost:
      "text-[#55716a] hover:bg-[#edf4f0]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
