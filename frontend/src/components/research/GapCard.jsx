import React from "react";
import { ArrowRight, BookOpen, FlaskConical, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../common/Button";
import Tag from "../common/Tag";
import PriorityMeter from "./PriorityMeter";

export default function GapCard({ gap, index, onOpen, onExperiment }) {
  const priorityTone =
    gap.priority === "high"
      ? "red"
      : gap.priority === "medium"
      ? "amber"
      : "green";

  const evidenceTone =
    gap.evidence_strength === "strong"
      ? "green"
      : gap.evidence_strength === "moderate"
      ? "blue"
      : "amber";

  const verifiedPassagesCount = Array.isArray(gap.evidence)
    ? gap.evidence.filter((e) => e.verified).length
    : 0;

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-[#dce5e0] bg-white p-5 sm:p-6 transition-all duration-200 hover:border-[#0b655b]/40 hover:shadow-[0_8px_30px_rgba(11,101,91,0.08)]">
      <div>
        {/* Top Badges & Priority Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#eaf4ef] text-xs font-bold text-[#0b655b] font-mono border border-[#cde2d6]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag tone={priorityTone}>{gap.priority || "unranked"} priority</Tag>
              <Tag tone={evidenceTone}>{gap.evidence_strength || "unrated"} evidence</Tag>
            </div>
          </div>

          <PriorityMeter gap={gap} compact />
        </div>

        {/* Gap Title & Description */}
        <h3 className="mt-3.5 text-base sm:text-lg font-bold leading-snug text-[#102a24] font-display group-hover:text-[#0b655b] transition-colors">
          {gap.title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#597067] line-clamp-3">
          {gap.description}
        </p>

        {/* Evidence Telemetry Banner */}
        <div className="mt-4 rounded-xl bg-[#f7faf8] p-3 border border-[#e8f0eb] text-xs">
          <div className="flex items-center justify-between text-[#436257]">
            <span className="flex items-center gap-1.5 font-semibold">
              <BookOpen size={13} className="text-[#0b655b]" /> Supporting Corpus
            </span>
            <span className="font-mono text-[11px] text-[#698479]">
              {(gap.supporting_paper_ids || []).length} linked papers
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6e857b]">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
              <CheckCircle2 size={12} /> {verifiedPassagesCount} verified quotes
            </span>
            {gap.evidence?.length > verifiedPassagesCount && (
              <span className="text-slate-500">
                • {gap.evidence.length - verifiedPassagesCount} unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-[#edf2ef] flex flex-wrap gap-2.5 items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onOpen(gap)}
          className="flex-1 sm:flex-none"
        >
          <span>Inspect Evidence</span>
          <ArrowRight size={13} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExperiment(gap)}
          className="flex-1 sm:flex-none text-[#0b655b]"
        >
          <FlaskConical size={14} />
          <span>Propose Experiment</span>
        </Button>
      </div>
    </article>
  );
}
