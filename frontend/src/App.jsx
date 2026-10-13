
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileSearch,
  FlaskConical,
  GitBranch,
  LoaderCircle,
  Microscope,
  Network,
  Search,
  Sparkles,
  AlertTriangle,
  Copy,
  RefreshCw,
  SlidersHorizontal,
  Droplets,
  Clock3,
  Waves,
  X,
} from "lucide-react";
import { analyzeQuestion, generateExperiment } from "./lib/api";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import StatCard from "./components/research/StatCard";
import GapCard from "./components/research/GapCard";

const sampleQuestions = [
  "Can low-cost biosensors reliably detect water contamination in rural communities?",
  "How does long-term field deployment affect low-cost water-quality sensors?",
  "Which water conditions influence the accuracy of portable biosensors?",
];

const cn = (...values) => values.filter(Boolean).join(" ");

function IconBox({ children, className = "" }) {
  return (
    <div
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function Tag({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-cyan-50 text-cyan-700",
    red: "bg-rose-50 text-rose-700",
    dark: "bg-[#e2efea] text-[#245a4c]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  type = "button",
}) {
  const variants = {
    primary:
      "bg-[#176f60] text-white shadow-sm hover:bg-[#12594e] disabled:bg-[#9cbab2]",
    secondary:
      "border border-[#d9e3de] bg-white text-[#24413d] hover:bg-[#f7faf8]",
    ghost: "text-[#55716a] hover:bg-[#edf4f0]",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function PageTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#438878]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[25px] font-bold tracking-tight text-[#173a34] sm:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71847c]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}


function ResearchForm({ question, setQuestion, onAnalyze, loading }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[#173d37] p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-1 -top-4 h-48 w-48 rounded-full border border-white/10" />

      <div className="relative max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#c7f18e]">
          <Sparkles size={13} /> Evidence-backed discovery
        </div>

        <h2 className="max-w-xl text-[25px] font-bold leading-tight tracking-tight sm:text-[32px]">
          Find the questions science hasn't answered yet.
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-[#c0d4cc]">
          Explore water contamination and biosensor literature, then trace
          candidate research gaps back to their sources.
        </p>

        <label
          htmlFor="research-question"
          className="mt-7 block text-xs font-semibold text-[#e3eee8]"
        >
          Your research question
        </label>

        <textarea
          id="research-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. Can low-cost biosensors reliably detect water contamination in rural communities?"
          className="mt-2 w-full resize-y rounded-2xl border border-white/15 bg-[#0f302b]/80 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-[#8da9a0] focus:border-[#b9ef71] focus:ring-2 focus:ring-[#b9ef71]/15"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-[#91b0a4]">
            {question.length}/500 characters
          </span>

          <Button
            onClick={onAnalyze}
            disabled={loading || question.trim().length < 10}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Analyzing literature...
              </>
            ) : (
              <>
                <Search size={16} /> Analyze literature <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {sampleQuestions.map((sample) => (
            <button
              key={sample}
              onClick={() => setQuestion(sample)}
              className="rounded-full border border-white/15 px-3 py-2 text-left text-[10px] text-[#d0e1d9] transition hover:border-[#b9ef71]/60 hover:bg-white/5"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, detail, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-bold text-[#23433c]">{title}</h3>
        {detail && <p className="mt-1 text-xs text-[#87978f]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function PaperCard({ paper, onOpen }) {
  return (
    <article className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
      <div className="flex gap-3">
        <IconBox className="bg-[#edf5ef] text-[#3b7b67]">
          <BookOpen size={18} />
        </IconBox>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="dark">{paper.source || "Literature source"}</Tag>
            {paper.year && (
              <span className="text-[11px] text-[#84948c]">{paper.year}</span>
            )}
          </div>
          <h3 className="mt-2 text-[15px] font-bold leading-6 text-[#214139]">
            {paper.title}
          </h3>
          <p className="mt-1 text-[11px] text-[#819188]">
            {Array.isArray(paper.authors)
              ? paper.authors.join(", ")
              : paper.authors || "Authors not supplied"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-6 text-[#6e8279]">
        {paper.abstract || "No abstract was provided for this record."}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ed] pt-3">
        <div className="text-[10px] text-[#8b9b93]">
          {paper.doi
            ? `DOI: ${paper.doi}`
            : paper.publication_type || "Publication type not supplied"}
        </div>
        <button
          onClick={() => onOpen(paper)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#287361] hover:text-[#164f43]"
        >
          Open source <ExternalLink size={13} />
        </button>
      </div>
    </article>
  );
}

function EvidenceView({ gap, papers, onBack, onExperiment }) {
  const paperMap = Object.fromEntries(papers.map((paper) => [paper.id, paper]));

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#658078] hover:text-[#1c5e4e]"
      >
        <ArrowLeft size={15} /> Back to research gaps
      </button>

      <PageTitle
        eyebrow="Candidate gap · Evidence review"
        title={gap.title}
        description={gap.description}
        action={
          <Button onClick={() => onExperiment(gap)}>
            <FlaskConical size={15} /> Propose experiment
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#e2e9e4] bg-white p-5 sm:p-6">
            <SectionHeading title="Why it may matter" />
            <p className="text-sm leading-7 text-[#637a70]">
              {gap.why_it_matters ||
                "The analysis did not return an explanation for this field."}
            </p>
            <div className="mt-5 rounded-xl border-l-4 border-[#a6d86d] bg-[#f5f9f2] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64865b]">
                Next research question
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-[#315a49]">
                {gap.next_research_question || "No follow-up question supplied."}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e2e9e4] bg-white p-5 sm:p-6">
            <SectionHeading
              title="Source passages"
              detail="Open each paper to inspect the original publication record."
            />
            <div className="space-y-4">
              {(gap.evidence || []).length === 0 && (
                <p className="rounded-xl bg-[#f7faf7] p-4 text-sm text-[#7a8c83]">
                  No source passages were returned for this gap.
                </p>
              )}

              {(gap.evidence || []).map((item, index) => {
                const paper = paperMap[item.paper_id];

                return (
                  <div
                    key={`${item.paper_id}-${index}`}
                    className="rounded-xl border border-[#e7ede8] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-[#2b6252]">
                        {item.paper_id}
                        {paper ? ` · ${paper.title}` : ""}
                      </div>
                      <Tag tone={item.verified === false ? "amber" : "green"}>
                        {item.verified === false
                          ? "Unverified passage"
                          : "Evidence supplied"}
                      </Tag>
                    </div>

                    <blockquote className="mt-3 border-l-2 border-[#b9d8c8] pl-3 text-[13px] leading-6 text-[#64796f]">
                      “{item.passage}”
                    </blockquote>

                    {paper?.source_url && (
                      <a
                        href={paper.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#27735f] hover:underline"
                      >
                        View source <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
            <SectionHeading title="Assessment" />
            <div className="flex items-center justify-between border-b border-[#edf1ed] py-3">
              <span className="text-xs text-[#7b8c84]">Priority score</span>
              <strong className="text-xl text-[#1c5b4b]">
                {gap.priority_score ?? "—"}
                <span className="text-xs font-medium text-[#92a098]">
                  {" "}
                  / 100
                </span>
              </strong>
            </div>
            <div className="flex items-center justify-between border-b border-[#edf1ed] py-3">
              <span className="text-xs text-[#7b8c84]">Priority</span>
              <Tag
                tone={
                  gap.priority === "high"
                    ? "red"
                    : gap.priority === "medium"
                      ? "amber"
                      : "green"
                }
              >
                {gap.priority || "Not ranked"}
              </Tag>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs text-[#7b8c84]">Evidence strength</span>
              <Tag tone="blue">{gap.evidence_strength || "Not rated"}</Tag>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#7e9087]">
              {gap.score_explanation ||
                "Priority scores are indicative and should be interpreted using the scoring method supplied by the backend."}
            </p>
          </section>

          <section className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
            <SectionHeading
              title="Supporting literature"
              detail={`${(gap.supporting_paper_ids || []).length} linked record(s)`}
            />
            <div className="space-y-2">
              {(gap.supporting_paper_ids || []).map((id) => {
                const paper = paperMap[id];

                return (
                  <div
                    key={id}
                    className="flex items-start gap-3 rounded-xl bg-[#f7faf7] p-3"
                  >
                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold text-[#4c7868]">
                      {id}
                    </span>
                    <div className="text-xs leading-5 text-[#5f786d]">
                      {paper?.title || "Source title unavailable"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
            <SectionHeading title="Known limitations" />
            <ul className="space-y-2.5">
              {(gap.limitations || []).map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-xs leading-5 text-[#73867c]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d0a64f]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function EvidenceMap({ analysis, onOpenGap }) {
  const [selected, setSelected] = useState(null);
  const gaps = analysis?.gaps || [];
  const papers = analysis?.papers || [];
  const paperMap = Object.fromEntries(papers.map((paper) => [paper.id, paper]));

  return (
    <div>
      <PageTitle
        eyebrow="Literature relationships"
        title="Evidence map"
        description="Explore how retrieved papers connect to candidate research gaps. Connections are based on the analysis response, not a claim of definitive proof."
      />

      {!gaps.length ? (
        <EmptyState
          title="No evidence map yet"
          detail="Run a literature analysis first to create paper-to-gap relationships."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
            <div className="mb-5 flex flex-wrap items-center gap-4 text-[11px] text-[#70867b]">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1c7764]" /> Paper
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-[#c9ec8d]" /> Candidate gap
              </span>
              <span className="flex items-center gap-2">
                <span className="h-[2px] w-5 bg-[#9db9ad]" /> Supports relationship
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#8ba097]">
                  Source papers
                </div>
                {papers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => setSelected({ type: "paper", item: paper })}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                      selected?.item?.id === paper.id
                        ? "border-[#72a995] bg-[#f0f8f3]"
                        : "border-[#e4ebe5] hover:bg-[#f8faf8]"
                    )}
                  >
                    <span className="rounded-lg bg-[#1c7764] px-2 py-1 text-[10px] font-bold text-white">
                      {paper.id}
                    </span>
                    <span className="text-xs font-medium leading-5 text-[#4c6b5f]">
                      {paper.title}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#8ba097]">
                  Candidate gaps
                </div>
                {gaps.map((gap) => (
                  <button
                    key={gap.id}
                    onClick={() => setSelected({ type: "gap", item: gap })}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                      selected?.item?.id === gap.id
                        ? "border-[#b7d67b] bg-[#f7fbea]"
                        : "border-[#e4ebe5] hover:bg-[#fbfcf7]"
                    )}
                  >
                    <span className="rounded-lg bg-[#d7efaa] px-2 py-1 text-[10px] font-bold text-[#385d3c]">
                      {gap.id}
                    </span>
                    <span className="text-xs font-medium leading-5 text-[#4c6b5f]">
                      {gap.title}
                      <span className="mt-1 block text-[10px] text-[#8a9b91]">
                        {(gap.supporting_paper_ids || []).length} linked papers
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#f7faf7] p-3 text-[11px] leading-5 text-[#84948c]">
              <Network size={14} className="mr-1 inline" /> This compact
              relationship view is built from the backend's paper IDs and
              supporting-paper links. Select a node to inspect its connections.
            </div>
          </div>

          <aside className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
            <SectionHeading title="Selected node" />

            {!selected ? (
              <p className="text-xs leading-5 text-[#87968e]">
                Select a paper or candidate gap to inspect its relationships.
              </p>
            ) : selected.type === "paper" ? (
              <>
                <Tag tone="green">Source paper</Tag>
                <h3 className="mt-3 text-sm font-bold leading-6 text-[#24483d]">
                  {selected.item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#819188]">
                  {selected.item.abstract}
                </p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#8a9b91]">
                  Linked candidate gaps
                </div>
                <div className="mt-2 space-y-2">
                  {gaps
                    .filter((gap) =>
                      (gap.supporting_paper_ids || []).includes(
                        selected.item.id
                      )
                    )
                    .map((gap) => (
                      <button
                        key={gap.id}
                        onClick={() => setSelected({ type: "gap", item: gap })}
                        className="block w-full rounded-lg bg-[#f5f9f5] p-3 text-left text-xs font-medium text-[#477261]"
                      >
                        {gap.title}
                      </button>
                    ))}
                </div>
                {selected.item.source_url && (
                  <a
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#24725f]"
                    href={selected.item.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source <ExternalLink size={12} />
                  </a>
                )}
              </>
            ) : (
              <>
                <Tag tone="amber">Candidate gap</Tag>
                <h3 className="mt-3 text-sm font-bold leading-6 text-[#24483d]">
                  {selected.item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#819188]">
                  {selected.item.description}
                </p>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#8a9b91]">
                  Supporting papers
                </div>
                <div className="mt-2 space-y-2">
                  {(selected.item.supporting_paper_ids || []).map((id) => (
                    <button
                      key={id}
                      onClick={() =>
                        paperMap[id] &&
                        setSelected({ type: "paper", item: paperMap[id] })
                      }
                      className="block w-full rounded-lg bg-[#f5f9f5] p-3 text-left text-xs font-medium text-[#477261]"
                    >
                      {id} · {paperMap[id]?.title || "Paper unavailable"}
                    </button>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => onOpenGap(selected.item)}
                >
                  Inspect gap <ArrowRight size={14} />
                </Button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function ExperimentPage({
  gap,
  experiment,
  loading,
  error,
  onGenerate,
  onCopy,
}) {
  const sections = [
    ["Research question", experiment?.research_question],
    ["Hypothesis", experiment?.hypothesis],
    ["Study design", experiment?.study_design],
    ["Samples and conditions", experiment?.samples_and_conditions],
    ["Measurements", experiment?.measurements],
    ["Controls", experiment?.controls],
    ["Analysis method", experiment?.analysis_method],
    ["Safety considerations", experiment?.safety_considerations],
    ["Limitations", experiment?.limitations],
  ];

  return (
    <div>
      <PageTitle
        eyebrow="From gap to next step"
        title="Experiment lab"
        description="Turn a selected candidate gap into a research proposal grounded in the current analysis."
      />

      {!gap ? (
        <EmptyState
          title="Choose a candidate gap first"
          detail="Open a gap from Research gap analysis and select “Propose experiment” to prepare a study plan."
        />
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-[#dce8de] bg-[#f1f7ef] p-5">
            <div className="flex items-start gap-3">
              <IconBox className="bg-white text-[#42775b]">
                <FlaskConical size={19} />
              </IconBox>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#668d62]">
                  Selected candidate gap
                </div>
                <h2 className="mt-1 text-base font-bold text-[#254a3b]">
                  {gap.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-[#708477]">
                  {gap.next_research_question || gap.description}
                </p>
              </div>
            </div>
          </div>

          {!experiment && (
            <div className="rounded-2xl border border-[#e2e9e4] bg-white p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf4eb] text-[#39755d]">
                <Beaker size={23} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#24483d]">
                Draft a proposed experiment
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b8c83]">
                Generate a structured starting point with study design,
                measurements, controls and limitations.
              </p>
              <Button
                className="mt-5"
                disabled={loading}
                onClick={onGenerate}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" /> Preparing
                    proposal...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} /> Generate proposal
                  </>
                )}
              </Button>
              {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
            </div>
          )}

          {experiment && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Tag tone="green">
                  <CheckCircle2 size={12} className="mr-1" /> Proposal ready for
                  review
                </Tag>
                <Button variant="secondary" onClick={onCopy}>
                  <Copy size={14} /> Copy proposal
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sections
                  .filter(([, value]) => value)
                  .map(([title, value], index) => (
                    <section
                      key={title}
                      className={cn(
                        "rounded-2xl border border-[#e2e9e4] bg-white p-5",
                        index === 0 || index === 2 || index === 8
                          ? "md:col-span-2"
                          : ""
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#48816c]">
                        <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#edf5ef] text-[10px]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {title}
                      </div>
                      <p className="text-sm leading-7 text-[#62796e]">
                        {value}
                      </p>
                    </section>
                  ))}
              </div>

              <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p>
                  This is an AI-generated research proposal, not a validated
                  protocol. Review methods, sample sizes, safety and feasibility
                  with a qualified biosciences mentor before conducting any
                  work.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ title, detail, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d5e1d8] bg-white px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#edf5ef] text-[#51816d]">
        <CircleHelp size={22} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[#34574a]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#82938a]">
        {detail}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [question, setQuestion] = useState(sampleQuestions[0]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGap, setSelectedGap] = useState(null);
  const [view, setView] = useState("list");
  const [experiment, setExperiment] = useState(null);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [experimentError, setExperimentError] = useState("");
  const [paperFilter, setPaperFilter] = useState("");
  const [sort, setSort] = useState("priority");

  const gaps = useMemo(() => {
    const all = [...(analysis?.gaps || [])];

    if (sort === "priority") {
      return all.sort(
        (a, b) => (b.priority_score ?? -1) - (a.priority_score ?? -1)
      );
    }

    if (sort === "evidence") {
      return all.sort(
        (a, b) =>
          (b.supporting_paper_ids?.length || 0) -
          (a.supporting_paper_ids?.length || 0)
      );
    }

    return all;
  }, [analysis, sort]);

  const papers = useMemo(
    () =>
      (analysis?.papers || []).filter((paper) =>
        `${paper.title} ${paper.abstract || ""} ${
          (paper.authors || []).join?.(" ") || ""
        }`
          .toLowerCase()
          .includes(paperFilter.toLowerCase())
      ),
    [analysis, paperFilter]
  );

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setSelectedGap(null);
    setExperiment(null);

    try {
      const result = await analyzeQuestion(question.trim(), 20);

      if (
        !result ||
        !Array.isArray(result.gaps) ||
        !Array.isArray(result.papers)
      ) {
        throw new Error(
          "The backend response is missing the papers or gaps arrays. Check the API response contract."
        );
      }

      setAnalysis(result);
      setActive("gaps");
      setView("list");
    } catch (err) {
      setError(
        err.message ||
          "Analysis failed. Check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function openGap(gap) {
    setSelectedGap(gap);
    setActive("gaps");
    setView("detail");
  }

  async function openExperiment(gap) {
    setSelectedGap(gap);
    setExperiment(null);
    setExperimentError("");
    setActive("experiment");
    setExperimentLoading(true);

    try {
      const result = await generateExperiment(analysis?.analysis_id, gap.id);
      setExperiment(result);
    } catch (err) {
      setExperimentError(err.message || "Could not generate the proposal.");
    } finally {
      setExperimentLoading(false);
    }
  }

  async function copyExperiment() {
    const text = Object.entries(experiment || {})
      .filter(([, value]) => typeof value === "string")
      .map(
        ([key, value]) => `${key.replaceAll("_", " ")}\n${value}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setExperimentError(
        "Clipboard access was unavailable. Select and copy the proposal text manually."
      );
    }
  }

  function openPaper(paper) {
    if (paper.source_url) {
      window.open(paper.source_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7f5]">
      <Sidebar
        active={active}
        setActive={setActive}
        open={menuOpen}
        setOpen={setMenuOpen}
      />

      <div className="min-h-screen lg:pl-[258px]">
        <Header active={active} onMenu={() => setMenuOpen(true)} />

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Could not complete analysis</div>
                <p className="mt-1 text-xs leading-5">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {active === "overview" && (
            <div className="space-y-7">
              <PageTitle
                eyebrow="Water science · Biosensors · SDG 3 / 6 / 13"
                title="Good research starts with better questions."
                description="A focused workspace for exploring scientific literature, surfacing candidate research gaps and planning what to investigate next."
                action={
                  analysis && (
                    <Button
                      variant="secondary"
                      onClick={() => setActive("gaps")}
                    >
                      <Clock3 size={15} /> Current analysis
                    </Button>
                  )
                }
              />

              <ResearchForm
                question={question}
                setQuestion={setQuestion}
                onAnalyze={runAnalysis}
                loading={loading}
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Papers in analysis"
                  value={analysis?.papers?.length ?? "—"}
                  hint={
                    analysis
                      ? "Records returned for this question"
                      : "Appears after your first analysis"
                  }
                  icon={BookOpen}
                  tint="bg-[#e8f2ed] text-[#3c7b66]"
                />
                <StatCard
                  label="Candidate gaps"
                  value={analysis?.gaps?.length ?? "—"}
                  hint={
                    analysis
                      ? "Potential questions surfaced"
                      : "No findings generated yet"
                  }
                  icon={FileSearch}
                  tint="bg-[#edf3dd] text-[#6d8840]"
                />
                <StatCard
                  label="Evidence links"
                  value={
                    analysis
                      ? analysis.gaps.reduce(
                          (sum, gap) => sum + (gap.evidence?.length || 0),
                          0
                        )
                      : "—"
                  }
                  hint="Passages supplied by the analysis"
                  icon={GitBranch}
                  tint="bg-[#e8f3f5] text-[#3e7f88]"
                />
                <StatCard
                  label="Proposed studies"
                  value={experiment ? "1" : "—"}
                  hint="Generated when you select a gap"
                  icon={FlaskConical}
                  tint="bg-[#f7eee0] text-[#a47b3f]"
                />
              </div>

              {analysis?.warnings?.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                  <AlertTriangle size={15} className="mr-2 inline" />
                  {analysis.warnings.join(" ")}
                </div>
              )}

              {analysis ? (
                <section>
                  <SectionHeading
                    title="Latest candidate gaps"
                    detail="Prioritized view from the current analysis"
                    action={
                      <Button
                        variant="ghost"
                        onClick={() => setActive("gaps")}
                      >
                        View all <ArrowRight size={14} />
                      </Button>
                    }
                  />
                  <div className="grid gap-4 xl:grid-cols-2">
                    {gaps.slice(0, 2).map((gap, index) => (
                      <GapCard
                        key={gap.id}
                        gap={gap}
                        index={index}
                        onOpen={openGap}
                        onExperiment={openExperiment}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
                    <IconBox className="bg-[#eaf4ee] text-[#47836b]">
                      <Droplets size={19} />
                    </IconBox>
                    <h3 className="mt-4 text-sm font-bold text-[#315548]">
                      Start with a real question
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#84948c]">
                      Focus on a specific water-quality challenge, sensor
                      limitation or field condition.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
                    <IconBox className="bg-[#eef3df] text-[#738c43]">
                      <Microscope size={19} />
                    </IconBox>
                    <h3 className="mt-4 text-sm font-bold text-[#315548]">
                      Inspect the evidence
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#84948c]">
                      Follow paper IDs and source passages instead of relying
                      on unsupported AI claims.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e2e9e4] bg-white p-5">
                    <IconBox className="bg-[#eaf2f6] text-[#4b8190]">
                      <FlaskConical size={19} />
                    </IconBox>
                    <h3 className="mt-4 text-sm font-bold text-[#315548]">
                      Plan the next study
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#84948c]">
                      Turn a candidate gap into a proposed experiment that a
                      domain expert can review.
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}

          {active === "literature" && (
            <div>
              <PageTitle
                eyebrow="Scientific sources"
                title="Literature explorer"
                description="Browse the paper records returned by the current analysis. Source metadata comes from the backend."
                action={<Tag>{analysis?.papers?.length || 0} records</Tag>}
              />

              {!analysis ? (
                <EmptyState
                  title="No literature loaded"
                  detail="Run a research analysis from Overview to retrieve papers for this question."
                  action={
                    <Button onClick={() => setActive("overview")}>
                      Go to overview
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91a098]"
                      />
                      <input
                        value={paperFilter}
                        onChange={(e) => setPaperFilter(e.target.value)}
                        placeholder="Filter by title, abstract or author..."
                        className="w-full rounded-xl border border-[#dfe8e1] bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#8ebaa7]"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setPaperFilter("")}
                    >
                      <RefreshCw size={14} /> Clear filter
                    </Button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    {papers.map((paper) => (
                      <PaperCard
                        key={paper.id}
                        paper={paper}
                        onOpen={openPaper}
                      />
                    ))}
                  </div>

                  {!papers.length && (
                    <EmptyState
                      title="No matching papers"
                      detail="Try a shorter search term or clear the filter."
                    />
                  )}
                </>
              )}
            </div>
          )}

          {active === "gaps" &&
            (view === "detail" && selectedGap ? (
              <EvidenceView
                gap={selectedGap}
                papers={analysis?.papers || []}
                onBack={() => setView("list")}
                onExperiment={openExperiment}
              />
            ) : (
              <div>
                <PageTitle
                  eyebrow="AI-assisted literature synthesis"
                  title="Candidate research gaps"
                  description="Prioritized questions derived from the retrieved corpus. A candidate gap is not proof that a topic has never been studied."
                  action={
                    analysis && <Tag tone="dark">{gaps.length} candidates</Tag>
                  }
                />

                {!analysis ? (
                  <EmptyState
                    title="No analysis to review"
                    detail="Enter a research question and analyze the literature first."
                    action={
                      <Button onClick={() => setActive("overview")}>
                        Start an analysis
                      </Button>
                    }
                  />
                ) : (
                  <>
                    {analysis.warnings?.length > 0 && (
                      <div className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <p>{analysis.warnings.join(" ")}</p>
                      </div>
                    )}

                    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#e2e9e4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8ba097]">
                          Analyzed question
                        </div>
                        <p className="mt-1 text-sm font-semibold leading-6 text-[#315549]">
                          {analysis.question}
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-[#73867c]">
                        <SlidersHorizontal size={14} />
                        <select
                          value={sort}
                          onChange={(e) => setSort(e.target.value)}
                          className="rounded-lg border border-[#e0e8e1] bg-white px-3 py-2 text-xs text-[#4b6c5d] outline-none"
                        >
                          <option value="priority">Sort: priority score</option>
                          <option value="evidence">Sort: supporting papers</option>
                          <option value="original">Original order</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      {gaps.map((gap, index) => (
                        <GapCard
                          key={gap.id}
                          gap={gap}
                          index={index}
                          onOpen={openGap}
                          onExperiment={openExperiment}
                        />
                      ))}
                    </div>

                    {!gaps.length && (
                      <EmptyState
                        title="No candidate gaps returned"
                        detail="The available literature may be insufficient. Try a more focused or broader question."
                      />
                    )}
                  </>
                )}
              </div>
            ))}

          {active === "graph" && (
            <EvidenceMap analysis={analysis} onOpenGap={openGap} />
          )}

          {active === "experiment" && (
            <ExperimentPage
              gap={selectedGap}
              experiment={experiment}
              loading={experimentLoading}
              error={experimentError}
              onGenerate={() => openExperiment(selectedGap)}
              onCopy={copyExperiment}
            />
          )}

          <footer className="mt-10 flex flex-col justify-between gap-2 border-t border-[#e1e8e2] pt-5 text-[10px] leading-5 text-[#9aa79f] sm:flex-row">
            <span>ResearchRadar AI · BioSolve Hackathon</span>
            <span>
              AI-assisted discovery · Source evidence matters · Expert review
              required
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
