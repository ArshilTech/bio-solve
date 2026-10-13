import React, { useEffect, useState } from "react";
import { Loader2, Radio, BookOpen, Clock } from "lucide-react";

export default function RadarScanner({ query }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#0b655b]/40 bg-gradient-to-b from-[#0e1d24] to-[#071318] p-8 sm:p-12 text-center text-white shadow-2xl">
      {/* Background Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(#b8f0d5 1px, transparent 1px), radial-gradient(#b8f0d5 1px, #071318 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Radar Scanner Visualizer */}
      <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#0b655b]/30" />
        <div className="absolute inset-4 rounded-full border border-[#0b655b]/40" />
        <div className="absolute inset-10 rounded-full border border-[#0b655b]/50 border-dashed" />
        <div className="absolute inset-16 rounded-full border border-[#b8f0d5]/30" />
        <div className="absolute inset-22 rounded-full border border-[#b8f0d5]/50" />

        {/* Crosshair grid lines */}
        <div className="absolute h-full w-[1px] bg-[#0b655b]/30" />
        <div className="absolute w-full h-[1px] bg-[#0b655b]/30" />

        {/* Radar Sweep Needle */}
        <div className="absolute inset-0 animate-radar origin-center pointer-events-none">
          <div
            className="h-1/2 w-1/2 origin-bottom-right"
            style={{
              background:
                "conic-gradient(from 180deg at 100% 100%, rgba(184, 240, 213, 0.45) 0deg, rgba(11, 101, 91, 0.1) 45deg, transparent 60deg)",
              borderRight: "2px solid #b8f0d5",
              boxShadow: "0 0 15px rgba(184, 240, 213, 0.6)",
            }}
          />
        </div>

        <div className="relative z-10 grid h-12 w-12 place-items-center rounded-full bg-[#0b655b] text-[#b8f0d5] shadow-[0_0_24px_#34d399] border border-[#b8f0d5]/60 animate-pulse-ring">
          <Radio size={20} className="animate-spin text-[#b8f0d5]" style={{ animationDuration: "6s" }} />
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto">


        <h3 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
          Scanning literature for scientific research gaps...
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[#92b2a6] leading-relaxed">
          Retrieving real peer-reviewed abstracts matching your query, extracting candidate gaps, and cross-verifying quotations.
        </p>

        {/* Live Elapsed Timer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono text-[#b8f0d5]">
          <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <Clock size={13} /> Elapsed: {elapsed}s
          </span>
          <span className="text-[#6d8d81]">•</span>
          <span className="text-[#9cb5ab] text-[11px]">
            Targeting up to 20 peer-reviewed papers
          </span>
        </div>
      </div>
    </div>
  );
}
