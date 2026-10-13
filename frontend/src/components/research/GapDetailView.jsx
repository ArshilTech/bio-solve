import React from "react";
import {
  ArrowLeft,
  FlaskConical,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
} from "lucide-react";
import Button from "../common/Button";
import Tag from "../common/Tag";
import PageTitle from "../common/PageTitle";
import SectionHeading from "../common/SectionHeading";
import PriorityMeter from "./PriorityMeter";

export default function GapDetailView({
  gap,
  papers = [],
  onBack,
  onExperiment,
  onOpenPaper,
}) {
  const paperMap = Object.fromEntries(papers.map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#507266] hover:text-[#0b655b] transition-colors group cursor-pointer"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to candidate research gaps</span>
      </button>

      <PageTitle
        title={gap.title}
        description={gap.description}
        action={
          <Button
            variant="primary"
            onClick={() => onExperiment(gap)}
            icon={FlaskConical}
          >
            Propose Experiment
          </Button>
        }
      />

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
        {/* Left Column: Scientific Narrative & Verified Evidence */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-xs">
            <SectionHeading title="Scientific & Practical Significance" />
            <p className="text-sm leading-relaxed text-[#4e685e]">
              {gap.why_it_matters || "No explicit significance description was returned by the analysis."}
            </p>

            {/* Actionable Next Research Question */}
            <div className="mt-5 rounded-xl border-l-4 border-[#0b655b] bg-[#f2f8f5] p-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b655b] block mb-1">
                Actionable Follow-up Question
              </span>
              <p className="text-sm font-semibold text-[#12392f] leading-6">
                {gap.next_research_question || "How can this gap be addressed in laboratory or field conditions?"}
              </p>
            </div>
          </section>

          {/* Evidence Passages */}
          <section className="rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-xs">
            <SectionHeading
              title="Cited Literature Passages"
              detail="Passages extracted from peer-reviewed literature and verified against source text."
            />

            <div className="space-y-4 mt-4">
              {(!gap.evidence || gap.evidence.length === 0) && (
                <p className="rounded-xl bg-[#f7faf8] p-4 text-xs text-[#6e857b]">
                  No specific evidence passages were returned for this gap.
                </p>
              )}

              {(gap.evidence || []).map((item, index) => {
                const paper = paperMap[item.paper_id];
                const isVerified = item.verified === true;

                return (
                  <div
                    key={`${item.paper_id}-${index}`}
                    className="rounded-xl border border-[#e2ece6] bg-[#fbfcfa] p-4 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef4f0] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0b655b] text-[#b8f0d5]">
                          {item.paper_id}
                        </span>
                        {paper && (
                          <span className="text-xs font-semibold text-[#183930] truncate max-w-sm">
                            {paper.title}
                          </span>
                        )}
                      </div>

                      <Tag
                        tone={isVerified ? "green" : "amber"}
                        icon={isVerified ? CheckCircle2 : AlertTriangle}
                      >
                        {isVerified ? "Verified Citation" : "Unverified Passage"}
                      </Tag>
                    </div>

                    {/* Passage text */}
                    <blockquote className="mt-3 border-l-2 border-[#0b655b]/40 pl-3.5 text-xs sm:text-sm italic leading-relaxed text-[#405c51]">
                      “{item.passage}”
                    </blockquote>

                    {item.match_detail && (
                      <div className="mt-2 text-[11px] text-[#6b857a] font-mono">
                        Verification match: {item.match_detail}
                      </div>
                    )}

                    {/* Paper Action links */}
                    <div className="mt-3 pt-2 flex items-center justify-between gap-3 text-xs">
                      {paper ? (
                        <button
                          type="button"
                          onClick={() => onOpenPaper(paper)}
                          className="inline-flex items-center gap-1 font-semibold text-[#0b655b] hover:underline cursor-pointer"
                        >
                          <FileText size={13} /> View paper metadata
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Paper record outside corpus</span>
                      )}

                      {paper?.source_url && (
                        <a
                          href={paper.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#40685c] hover:text-[#0b655b]"
                        >
                          Source publication <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Known Limitations */}
          {gap.limitations && gap.limitations.length > 0 && (
            <section className="rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-xs">
              <SectionHeading title="Identified Boundaries & Limitations" />
              <ul className="space-y-2 mt-3">
                {gap.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#506c60] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column: Priority Meter & Supporting Literature */}
        <div className="space-y-6">
          <PriorityMeter gap={gap} />

          {/* Supporting literature cards */}
          <section className="rounded-2xl border border-[#dce5e0] bg-white p-6 shadow-xs">
            <SectionHeading
              title="Corpus References"
              detail={`${(gap.supporting_paper_ids || []).length} referenced paper(s)`}
            />

            <div className="space-y-2.5 mt-3">
              {(gap.supporting_paper_ids || []).map((id) => {
                const paper = paperMap[id];
                return (
                  <div
                    key={id}
                    className="flex items-start gap-3 rounded-xl bg-[#f7faf8] p-3 border border-[#e8f1eb]"
                  >
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#e3efe8] text-[#0b655b]">
                      {id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#183930] truncate">
                        {paper?.title || "Title unavailable"}
                      </div>
                      <div className="text-[11px] text-[#698478] truncate mt-0.5">
                        {paper?.year ? `${paper.year} • ` : ""}
                        {Array.isArray(paper?.authors) ? paper.authors.slice(0, 2).join(", ") : "Authors not listed"}
                      </div>
                      {paper && (
                        <button
                          type="button"
                          onClick={() => onOpenPaper(paper)}
                          className="mt-1 text-[11px] font-semibold text-[#0b655b] hover:underline block"
                        >
                          Open record details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="rounded-2xl border border-[#b8f0d5] bg-gradient-to-br from-[#eafaf2] to-[#d6f5e7] p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b655b]">
              <FlaskConical size={16} />
              <span>Ready for Experimental Design?</span>
            </div>
            <p className="mt-1.5 text-xs text-[#2b594b] leading-relaxed">
              Generate a structured protocol with sample conditions, analytical controls, and sensor validation methods.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExperiment(gap)}
              className="mt-4 w-full"
            >
              Generate Protocol Proposal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
