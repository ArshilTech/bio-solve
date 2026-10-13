
export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-[#183f3b] text-white hover:bg-[#24554e] focus:ring-[#183f3b]",
    secondary:
      "border border-[#d8e2dd] bg-white text-[#294540] hover:bg-[#f3f7f4] focus:ring-[#9ab8ad]",
    ghost:
      "text-[#55716a] hover:bg-[#edf3ef] hover:text-[#183f3b] focus:ring-[#9ab8ad]",
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
