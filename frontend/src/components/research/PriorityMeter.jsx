import React from "react";
import Tag from "../common/Tag";
import { Info, Award, Gauge, Sparkles } from "lucide-react";

export default function PriorityMeter({ gap, compact = false }) {
  const score = Number.isFinite(Number(gap.priority_score)) ? Number(gap.priority_score) : null;
  const evidenceScore = Number.isFinite(Number(gap.evidence_score)) ? Number(gap.evidence_score) : null;
  const impactScore = Number.isFinite(Number(gap.impact_score)) ? Number(gap.impact_score) : null;
  const feasibilityScore = Number.isFinite(Number(gap.feasibility_score)) ? Number(gap.feasibility_score) : null;

  const priority = gap.priority || "medium";
  const priorityTone = priority === "high" ? "red" : priority === "medium" ? "amber" : "green";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-xl font-extrabold text-[#0b655b] font-mono leading-none">
            {score ?? "—"}
            <span className="text-[11px] font-normal text-[#758f84]">/100</span>
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[#758f84] mt-0.5 font-semibold">
            Priority Score
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#edf2ef] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-[#0b655b]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#14322a]">
            Scientific Priority Scoring
          </h4>
        </div>
        <Tag tone={priorityTone}>{priority} priority</Tag>
      </div>

      {/* Main Score Display */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-3xl font-black text-[#0b655b] font-mono">
            {score ?? "—"}
          </span>
          <span className="text-sm font-semibold text-[#758f84] ml-1">/ 100</span>
        </div>
        <Tag tone={gap.evidence_strength === "strong" ? "green" : gap.evidence_strength === "moderate" ? "blue" : "amber"}>
          {gap.evidence_strength || "unrated"} evidence
        </Tag>
      </div>

      {/* Score Progress Bar */}
      {score !== null && (
        <div className="w-full bg-[#ebf3ef] rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#0b655b] to-[#34d399]"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      )}

      {/* Component breakdown meters if available from backend */}
      {(evidenceScore !== null || impactScore !== null || feasibilityScore !== null) && (
        <div className="space-y-2.5 pt-3 border-t border-[#edf2ef]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#71877d]">
            Transparent Scoring Breakdown
          </div>

          {evidenceScore !== null && (
            <div>
              <div className="flex justify-between text-xs text-[#4b645b] mb-1">
                <span>Evidence Support</span>
                <span className="font-mono font-semibold">{evidenceScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, evidenceScore))}%` }}
                />
              </div>
            </div>
          )}

          {impactScore !== null && (
            <div>
              <div className="flex justify-between text-xs text-[#4b645b] mb-1">
                <span>Scientific / Societal Impact</span>
                <span className="font-mono font-semibold">{impactScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, impactScore))}%` }}
                />
              </div>
            </div>
          )}

          {feasibilityScore !== null && (
            <div>
              <div className="flex justify-between text-xs text-[#4b645b] mb-1">
                <span>Experimental Feasibility</span>
                <span className="font-mono font-semibold">{feasibilityScore.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, feasibilityScore))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score Explanation */}
      {gap.score_explanation && (
        <div className="mt-4 rounded-xl bg-[#f7faf8] p-3 text-xs leading-5 text-[#597067] border border-[#e4ede7]">
          <span className="font-semibold text-[#183930] block mb-1">Scoring Methodology:</span>
          {gap.score_explanation}
        </div>
      )}
    </div>
  );
}
