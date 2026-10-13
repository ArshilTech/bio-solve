import React, { useState } from "react";
import { Search, ArrowRight, Layers, HelpCircle } from "lucide-react";
import Button from "../common/Button";
import RadarScanner from "./RadarScanner";

export const SAMPLE_QUESTIONS = [
  "Can low-cost biosensors reliably detect water contamination in rural communities?",
  "How does long-term field deployment affect low-cost water-quality sensors?",
  "Which environmental matrix conditions (turbidity, pH, salinity) influence portable biosensor accuracy?",
  "How can portable biosensors for heavy metals in drinking water be validated against laboratory ICP-MS?",
];

export default function DiscoveryComposer({
  question,
  setQuestion,
  maxPapers,
  setMaxPapers,
  onAnalyze,
  loading,
}) {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !loading && question.trim().length >= 10) {
      onAnalyze();
    }
  };

  if (loading) {
    return <RadarScanner query={question} />;
  }

  const isValid = question.trim().length >= 10;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2e27] via-[#0e3b32] to-[#124b40] p-6 sm:p-9 text-white shadow-xl border border-[#1b5d50]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-4 -top-4 h-52 w-52 rounded-full border border-[#b8f0d5]/15" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full border border-white/5" />

      <div className="relative max-w-4xl z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white font-display">
          Find the questions science hasn't answered yet.
        </h2>

        <p className="mt-2.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-[#c0dad0]">
          Search peer-reviewed literature across water contamination, biosensors, and water-quality monitoring.
          Discover underexplored questions backed by verified evidence citations.
        </p>

        {/* Input area */}
        <div className="mt-7">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="research-question-input"
              className="text-xs font-semibold tracking-wide text-[#e1efe8]"
            >
              Formulate your research question
            </label>
            <span className="text-[11px] font-mono text-[#90b8ab]">
              {question.length}/500 chars {question.length < 10 && "(min 10)"}
            </span>
          </div>

          <div
            className={`relative rounded-2xl border transition-all duration-200 bg-[#07241e]/90 shadow-inner ${
              focused
                ? "border-[#34d399] ring-2 ring-[#34d399]/20"
                : "border-white/15 hover:border-white/25"
            }`}
          >
            <textarea
              id="research-question-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Can low-cost biosensors reliably detect water contamination in rural communities?"
              className="w-full resize-y rounded-2xl bg-transparent px-4 py-3.5 text-sm leading-6 text-white outline-none placeholder:text-[#6a9486]"
            />
          </div>

          {/* Controls: Corpus size & Submit button */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#a3c9bd]">
                <Layers size={14} className="text-[#34d399]" />
                <span>Corpus size:</span>
              </label>
              <select
                value={maxPapers}
                onChange={(e) => setMaxPapers(Number(e.target.value))}
                className="rounded-lg border border-white/20 bg-[#07241e] px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-[#34d399]"
              >
                <option value={5}>5 papers (Fastest)</option>
                <option value={10}>10 papers (Balanced)</option>
                <option value={15}>15 papers (Deep)</option>
                <option value={20}>20 papers (Comprehensive)</option>
              </select>
            </div>

            <Button
              onClick={onAnalyze}
              disabled={loading || !isValid}
              variant="mint"
              size="md"
              className="w-full sm:w-auto shadow-[0_4px_20px_rgba(184,240,213,0.3)] hover:scale-[1.02]"
            >
              <Search size={16} />
              <span>Analyze Literature</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>

        {/* Suggested Prompt Pills */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#93bdaf]">
            <HelpCircle size={13} /> Suggested Research Questions:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuestion(sample)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-left text-xs text-[#d2e7de] transition hover:border-[#34d399]/70 hover:bg-white/10 active:scale-95"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
