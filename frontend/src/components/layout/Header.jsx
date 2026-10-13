import React, { useEffect, useState } from "react";
import { Menu, RefreshCw, Cpu, Database, Globe } from "lucide-react";
import { checkHealthReady } from "../../lib/api";

export default function Header({ active, onMenu, onNewSearch, hasAnalysis }) {
  const [readiness, setReadiness] = useState({
    loading: true,
    status: "checking",
    dependencies: null,
    error: null,
  });
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await checkHealthReady();
      setReadiness({
        loading: false,
        status: data.status,
        dependencies: data.dependencies,
        error: null,
      });
    } catch (err) {
      setReadiness({
        loading: false,
        status: "offline",
        dependencies: null,
        error: err.message,
      });
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll readiness every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const labels = {
    overview: "Research Discovery & Overview",
    literature: "Scientific Literature Explorer",
    gaps: "Candidate Research Gaps",
    graph: "Evidence Relationship Graph",
    experiment: "Experimental Protocol Lab",
  };

  const isOnline = readiness.status === "ready";
  const isDegraded = readiness.status === "degraded";

  return (
    <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#dce5e0] bg-[#f8faf8]/95 px-4 backdrop-blur-md sm:px-7 lg:px-9 transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation menu"
          className="rounded-xl p-2 text-[#35524b] hover:bg-[#ebf2ee] lg:hidden focus:ring-2 focus:ring-[#0b655b] outline-none"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="text-base sm:text-lg font-bold text-[#102a24] font-display">
            {labels[active] || "Overview"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Status Telemetry Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusPopover(!showStatusPopover)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all shadow-2xs ${
              isOnline
                ? "border-emerald-200 bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100/90"
                : isDegraded
                ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                : "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
            title="Click to view live backend telemetry"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline
                    ? "bg-emerald-400 animate-ping"
                    : isDegraded
                    ? "bg-amber-400 animate-ping"
                    : "bg-rose-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isOnline
                    ? "bg-emerald-500"
                    : isDegraded
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
            </span>
            <span className="hidden sm:inline">
              {readiness.loading
                ? "Checking services..."
                : isOnline
                ? "Services Online"
                : isDegraded
                ? "Services Degraded"
                : "Backend Offline"}
            </span>
          </button>

          {showStatusPopover && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowStatusPopover(false)}
              />
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#dce5e0] bg-white p-4 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#eef3f0]">
                  <span className="text-xs font-bold text-[#15342d]">System Telemetry</span>
                  <button
                    onClick={fetchStatus}
                    className="p-1 rounded-md text-[#61746c] hover:bg-[#f0f5f2]"
                    title="Refresh telemetry"
                  >
                    <RefreshCw size={13} className={readiness.loading ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5e746a]">
                      <Globe size={13} /> Europe PMC API
                    </span>
                    <span
                      className={`font-semibold ${
                        readiness.dependencies?.europe_pmc_reachable
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {readiness.dependencies?.europe_pmc_reachable ? "Connected" : "Unreachable"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5e746a]">
                      <Cpu size={13} /> Grok AI Synthesis
                    </span>
                    <span
                      className={`font-semibold ${
                        readiness.dependencies?.ai_configured
                          ? "text-emerald-700"
                          : "text-amber-600"
                      }`}
                    >
                      {readiness.dependencies?.ai_configured ? "Configured" : "Missing Key"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#5e746a]">
                      <Database size={13} /> SQLite Repository
                    </span>
                    <span
                      className={`font-semibold ${
                        readiness.dependencies?.database_ready
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {readiness.dependencies?.database_ready ? "Connected" : "Error"}
                    </span>
                  </div>
                </div>

                {readiness.error && (
                  <p className="mt-3 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                    {readiness.error}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
