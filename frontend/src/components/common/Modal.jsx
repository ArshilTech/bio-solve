import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0d171e]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-[#dce5e0] overflow-hidden z-10 transition-all animate-in zoom-in-95 duration-200 my-auto`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[#e6ede8] bg-[#f8faf8]">
          <div>
            {subtitle && (
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b655b] block mb-1">
                {subtitle}
              </span>
            )}
            <h3 className="text-lg font-bold text-[#102a24] font-display">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64727b] hover:text-[#102a24] hover:bg-[#eaf1ec] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0b655b]"
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
