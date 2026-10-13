
const styles = {
  default: "bg-[#edf3ef] text-[#526b62]",
  success: "bg-[#e1f4e9] text-[#28744b]",
  warning: "bg-[#fff2d8] text-[#986313]",
  danger: "bg-[#fde8e5] text-[#b34336]",
};

export default function Tag({ children, variant = "default", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[variant] || styles.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
