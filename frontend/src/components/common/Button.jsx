import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  icon: Icon,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] select-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b655b] focus-visible:ring-offset-2";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2.5",
  };

  const variants = {
    primary:
      "bg-[#0b655b] text-white shadow-sm hover:bg-[#084e46] hover:shadow-[0_4px_16px_rgba(11,101,91,0.25)] border border-[#09574e]",
    secondary:
      "border border-[#dce5e0] bg-white text-[#1a3832] shadow-xs hover:bg-[#f4f7f5] hover:border-[#b8cfc5]",
    dark:
      "bg-[#101c24] text-white hover:bg-[#182a36] border border-[#203440] shadow-sm",
    ghost:
      "text-[#385e54] hover:bg-[#ebf3ef] hover:text-[#0b655b]",
    mint:
      "bg-[#b8f0d5] text-[#0b544b] font-bold hover:bg-[#9de4c2] border border-[#96ddba]",
    outline:
      "border border-[#0b655b]/30 text-[#0b655b] hover:bg-[#0b655b]/5",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === "sm" ? 13 : 16} />
      ) : Icon ? (
        <Icon className="shrink-0" size={size === "sm" ? 14 : 17} />
      ) : null}
      {children}
    </button>
  );
}
