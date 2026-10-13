
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import Button from "../common/Button";
import Tag from "../common/Tag";

export default function GapCard({ gap, index, onOpen, onExperiment }) {
  const priorityTone =
    gap.priority === "high"
      ? "red"
      : gap.priority === "medium"
        ? "amber"
        : "green";

  return (
    <article className="rounded-2xl border border-[#e2e9e4] bg-white p-5 transition hover:border-[#c5d9cf] hover:shadow-[0_8px_28px_rgba(27,67,54,0.05)]">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef5ef] text-xs font-bold text-[#3e7867]">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={priorityTone}>
              {gap.priority || "unranked"} priority
            </Tag>
            <Tag
              tone={
                gap.evidence_strength === "strong"
                  ? "green"
                  : gap.evidence_strength === "moderate"
                    ? "blue"
                    : "amber"
              }
            >
              {gap.evidence_strength || "unrated"} evidence
            </Tag>
          </div>

          <h4 className="mt-3 text-[16px] font-bold leading-6 text-[#1c4038]">
            {gap.title}
          </h4>
          <p className="mt-2 text-[13px] leading-6 text-[#71837b]">
            {gap.description}
          </p>
        </div>

        <div className="hidden min-w-[62px] text-right sm:block">
          <div className="text-2xl font-bold text-[#1b5145]">
            {Number.isFinite(Number(gap.priority_score))
              ? gap.priority_score
              : "—"}
          </div>
          <div className="text-[9px] uppercase tracking-wide text-[#91a098]">
            priority / 100
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[#f7faf7] p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#47695e]">
          <BookOpen size={14} /> Evidence coverage
        </div>
        <p className="mt-1.5 text-xs leading-5 text-[#7d8e85]">
          {(gap.supporting_paper_ids || []).length} supporting paper(s) linked ·{" "}
          {Array.isArray(gap.evidence) ? gap.evidence.length : 0} evidence
          passage(s) supplied
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => onOpen(gap)}
          className="flex-1 sm:flex-none"
        >
          Inspect evidence <ArrowRight size={14} />
        </Button>
        <Button
          variant="ghost"
          onClick={() => onExperiment(gap)}
          className="flex-1 sm:flex-none"
        >
          <FlaskConical size={14} /> Propose experiment
        </Button>
      </div>
    </article>
  );
}
