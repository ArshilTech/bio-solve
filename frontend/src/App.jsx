import React, { useMemo, useState } from "react";
import {
  BookOpen,
  FileSearch,
  FlaskConical,
  Network,
  Search,
  ArrowRight,
  AlertTriangle,
  X,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Droplets,
  ShieldCheck,
} from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import PageTitle from "./components/common/PageTitle";
import SectionHeading from "./components/common/SectionHeading";
import EmptyState from "./components/common/EmptyState";
import Button from "./components/common/Button";
import Tag from "./components/common/Tag";

import DiscoveryComposer from "./components/research/DiscoveryComposer";
import StatCard from "./components/research/StatCard";
import GapCard from "./components/research/GapCard";
import GapDetailView from "./components/research/GapDetailView";

import PaperCard from "./components/papers/PaperCard";
import PaperDetailModal from "./components/papers/PaperDetailModal";

import EvidenceGraph from "./components/graph/EvidenceGraph";
import ExperimentView from "./components/experiments/ExperimentView";

import { analyzeQuestion, generateExperiment, searchLiterature, listAnalyses } from "./lib/api";

export default function App() {
  // Navigation & UI state
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  // Discovery state
  const [question, setQuestion] = useState("");
  const [maxPapers, setMaxPapers] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Analyses state (session persistence + SQLite sync)
  const [analysis, setAnalysis] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  // Auto-sync existing persisted analyses from SQLite (not auto-selecting until user clicks)
  React.useEffect(() => {
    async function syncPersistedAnalyses() {
      try {
        const past = await listAnalyses(10);
        if (Array.isArray(past) && past.length > 0) {
          setAnalyses(past);
        }
      } catch (err) {
        // Graceful fallback
      }
    }
    syncPersistedAnalyses();
  }, []);

  // Gap view state
  const [selectedGap, setSelectedGap] = useState(null);
  const [gapViewMode, setGapViewMode] = useState("list"); // "list" | "detail"
  const [sortGapsBy, setSortGapsBy] = useState("priority");

  // Literature view state
  const [paperFilter, setPaperFilter] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [directSearchQuery, setDirectSearchQuery] = useState("");
  const [directSearchLoading, setDirectSearchLoading] = useState(false);
  const [directSearchResults, setDirectSearchResults] = useState(null);

  // Experiment state
  const [experiment, setExperiment] = useState(null);
  const [experimentLoading, setExperimentLoading] = useState(false);
  const [experimentError, setExperimentError] = useState("");

  // Run full question analysis
  async function handleAnalyze() {
    if (!question || question.trim().length < 10) return;

    setLoading(true);
    setError("");
    setSelectedGap(null);
    setExperiment(null);
    setGapViewMode("list");

    try {
      const result = await analyzeQuestion(question.trim(), maxPapers);

      if (!result || !Array.isArray(result.gaps) || !Array.isArray(result.papers)) {
        throw new Error(
          "Backend response did not adhere to required contract: missing 'papers' or 'gaps' array."
        );
      }

      setAnalysis(result);
      setAnalyses((prev) => {
        const exists = prev.some((a) => a.analysis_id === result.analysis_id);
        return exists ? prev : [result, ...prev];
      });

      // Navigate to candidate gaps
      setActive("gaps");
      setGapViewMode("list");
    } catch (err) {
      setError(err.message || "Failed to analyze scientific question. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  // Handle switching session analysis
  function handleSelectSessionAnalysis(selected) {
    setAnalysis(selected);
    setQuestion(selected.question);
    setSelectedGap(null);
    setExperiment(null);
    setGapViewMode("list");
  }

  // Gap actions
  function handleOpenGap(gap) {
    setSelectedGap(gap);
    setGapViewMode("detail");
    setActive("gaps");
  }

  // Experiment actions
  async function handleOpenExperiment(targetGap) {
    const gapToUse = targetGap || selectedGap;
    if (!gapToUse) {
      setActive("experiment");
      return;
    }

    setSelectedGap(gapToUse);
    setActive("experiment");
    setExperiment(null);
    setExperimentError("");
    setExperimentLoading(true);

    try {
      const result = await generateExperiment(analysis?.analysis_id, gapToUse.id);
      setExperiment(result);
    } catch (err) {
      setExperimentError(
        err.message || "Could not synthesize experimental protocol for the selected gap."
      );
    } finally {
      setExperimentLoading(false);
    }
  }

  // Paper modal actions
  function handleOpenPaperModal(paper) {
    setSelectedPaper(paper);
    setIsPaperModalOpen(true);
  }

  // Direct literature search on Europe PMC
  async function handleDirectSearch(e) {
    if (e) e.preventDefault();
    if (!directSearchQuery.trim() || directSearchQuery.trim().length < 3) return;

    setDirectSearchLoading(true);
    try {
      const res = await searchLiterature(directSearchQuery.trim(), 20);
      setDirectSearchResults(res.papers || []);
    } catch (err) {
      setError(err.message || "Direct literature search failed.");
    } finally {
      setDirectSearchLoading(false);
    }
  }

  // Sorted gaps
  const sortedGaps = useMemo(() => {
    const list = [...(analysis?.gaps || [])];
    if (sortGapsBy === "priority") {
      return list.sort((a, b) => (b.priority_score ?? -1) - (a.priority_score ?? -1));
    }
    if (sortGapsBy === "evidence") {
      return list.sort(
        (a, b) => (b.supporting_paper_ids?.length || 0) - (a.supporting_paper_ids?.length || 0)
      );
    }
    return list;
  }, [analysis, sortGapsBy]);

  // Display papers (filtered from analysis or from direct search)
  const displayPapers = useMemo(() => {
    const sourcePapers = directSearchResults || analysis?.papers || [];
    if (!paperFilter.trim()) return sourcePapers;

    const term = paperFilter.toLowerCase();
    return sourcePapers.filter((p) => {
      const titleMatch = (p.title || "").toLowerCase().includes(term);
      const abstractMatch = (p.abstract || "").toLowerCase().includes(term);
      const authorsMatch = (Array.isArray(p.authors) ? p.authors.join(" ") : p.authors || "")
        .toLowerCase()
        .includes(term);
      const idMatch = (p.id || "").toLowerCase().includes(term);
      return titleMatch || abstractMatch || authorsMatch || idMatch;
    });
  }, [analysis, directSearchResults, paperFilter]);

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#122824]">
      {/* Sidebar Navigation */}
      <Sidebar
        active={active}
        setActive={(id) => {
          setActive(id);
          if (id === "gaps") setGapViewMode("list");
        }}
        open={menuOpen}
        setOpen={setMenuOpen}
        analyses={analyses}
        currentAnalysisId={analysis?.analysis_id}
        onSelectAnalysis={handleSelectSessionAnalysis}
      />

      {/* Main Content Area */}
      <div className="min-h-screen lg:pl-[268px] flex flex-col justify-between">
        <div>
          {/* Header */}
          <Header
            active={active}
            onMenu={() => setMenuOpen(true)}
            onNewSearch={() => {
              setActive("overview");
            }}
            hasAnalysis={Boolean(analysis)}
          />

          {/* Main Container */}
          <main className="mx-auto max-w-[1460px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
            {/* Error Notification Alert */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/95 p-4 text-xs sm:text-sm text-rose-800 shadow-sm animate-in fade-in duration-200">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1">
                  <div className="font-bold">Service Alert</div>
                  <p className="mt-0.5 leading-relaxed text-rose-700">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-700"
                  aria-label="Dismiss alert"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* VIEW 1: RESEARCH DISCOVERY & OVERVIEW */}
            {active === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <PageTitle
                  title="Discover Unaddressed Questions in Science"
                  description="An evidence-backed research intelligence platform mapping water contamination, biosensors, and environmental monitoring literature to discover verified research gaps."
                  action={
                    analysis && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setActive("gaps");
                          setGapViewMode("list");
                        }}
                      >
                        <Clock size={14} />
                        <span>View Current Analysis</span>
                      </Button>
                    )
                  }
                />

                {/* Discovery Composer Form */}
                <DiscoveryComposer
                  question={question}
                  setQuestion={setQuestion}
                  maxPapers={maxPapers}
                  setMaxPapers={setMaxPapers}
                  onAnalyze={handleAnalyze}
                  loading={loading}
                />

                {/* Telemetry Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Corpus Size"
                    value={analysis?.papers?.length ?? "—"}
                    hint={
                      analysis
                        ? "Peer-reviewed records in current corpus"
                        : "Loads on scientific analysis"
                    }
                    icon={BookOpen}
                    tint="bg-[#e8f4ee] text-[#0b655b]"
                  />
                  <StatCard
                    label="Candidate Gaps"
                    value={analysis?.gaps?.length ?? "—"}
                    hint={
                      analysis
                        ? "Underexplored questions identified"
                        : "Extracted from literature corpus"
                    }
                    icon={FileSearch}
                    tint="bg-[#edf6e6] text-[#4d7c34]"
                  />
                  <StatCard
                    label="Verified Evidence"
                    value={
                      analysis
                        ? analysis.gaps.reduce(
                            (sum, g) =>
                              sum + (g.evidence?.filter((e) => e.verified).length || 0),
                            0
                          )
                        : "—"
                    }
                    hint="Cross-verified against source abstracts"
                    icon={ShieldCheck}
                    tint="bg-[#e6f3f5] text-[#1c647b]"
                  />
                  <StatCard
                    label="Protocol Proposals"
                    value={experiment ? "1" : "—"}
                    hint="Formulated in Experiment Lab"
                    icon={FlaskConical}
                    tint="bg-[#fbf2e5] text-[#936423]"
                  />
                </div>

                {/* Backend Analysis Warnings if returned */}
                {analysis?.warnings && analysis.warnings.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs leading-relaxed text-amber-900 shadow-2xs">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
                      <AlertTriangle size={15} className="text-amber-600" />
                      <span>Literature Verification Notes:</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Latest Discovered Gaps Preview if analysis ready */}
                {analysis ? (
                  <section className="space-y-4">
                    <SectionHeading
                      title="Top Candidate Research Gaps"
                      detail="Transparently ranked by evidence support, potential impact, and feasibility."
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActive("gaps");
                            setGapViewMode("list");
                          }}
                        >
                          <span>Explore All {analysis.gaps.length} Gaps</span>
                          <ArrowRight size={14} />
                        </Button>
                      }
                    />
                    <div className="grid gap-4 xl:grid-cols-2">
                      {sortedGaps.slice(0, 2).map((gap, idx) => (
                        <GapCard
                          key={gap.id}
                          gap={gap}
                          index={idx}
                          onOpen={handleOpenGap}
                          onExperiment={handleOpenExperiment}
                        />
                      ))}
                    </div>
                  </section>
                ) : (
                  /* Educational Value Pillars when empty */
                  <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-xs">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf4ef] text-[#0b655b] mb-3">
                        <Droplets size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-[#14322a] font-display">
                        Real Water Contamination Science
                      </h4>
                      <p className="mt-1.5 text-xs text-[#5e776d] leading-relaxed">
                        Searches live Europe PMC for peer-reviewed studies on biosensors, heavy metals, pesticides, and portable diagnostic validation.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-xs">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf6e6] text-[#4d7c34] mb-3">
                        <ShieldCheck size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-[#14322a] font-display">
                        Evidence Cross-Verification
                      </h4>
                      <p className="mt-1.5 text-xs text-[#5e776d] leading-relaxed">
                        No fabricated claims. Every candidate research gap is cross-referenced against exact excerpts from retrieved abstracts.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#dce5e0] bg-white p-5 shadow-xs">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f3f5] text-[#1c647b] mb-3">
                        <FlaskConical size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-[#14322a] font-display">
                        From Gap to Lab Protocol
                      </h4>
                      <p className="mt-1.5 text-xs text-[#5e776d] leading-relaxed">
                        Transform discovered gaps into testable hypotheses with controls, matrix conditions, and standard comparison methods.
                      </p>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* VIEW 2: RESEARCH GAPS (List or Detail) */}
            {active === "gaps" &&
              (gapViewMode === "detail" && selectedGap ? (
                <GapDetailView
                  gap={selectedGap}
                  papers={analysis?.papers || []}
                  onBack={() => setGapViewMode("list")}
                  onExperiment={handleOpenExperiment}
                  onOpenPaper={handleOpenPaperModal}
                />
              ) : (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <PageTitle
                    title="Discovered Research Gaps"
                    description="Underexplored research questions derived from retrieved literature corpus. Ranked transparently using evidence strength, impact, and feasibility."
                    action={
                      analysis && (
                        <Tag tone="teal">
                          {sortedGaps.length} Candidate Gaps
                        </Tag>
                      )
                    }
                  />

                  {!analysis ? (
                    <EmptyState
                      icon={FileSearch}
                      title="No Literature Analysis Loaded"
                      detail="Formulate a water contamination or biosensor question in Discovery to extract candidate gaps."
                      action={
                        <Button onClick={() => setActive("overview")}>
                          Go to Research Discovery
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      {/* Analysis Summary & Sort Filter Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#dce5e0] bg-white p-4 shadow-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#698478] block">
                            Active Research Query
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-[#102a24] mt-0.5">
                            “{analysis.question}”
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <SlidersHorizontal size={14} className="text-[#698478]" />
                          <select
                            value={sortGapsBy}
                            onChange={(e) => setSortGapsBy(e.target.value)}
                            className="rounded-xl border border-[#dce5e0] bg-[#f8faf8] px-3 py-1.5 text-xs font-semibold text-[#14322a] outline-none focus:border-[#0b655b]"
                          >
                            <option value="priority">Sort: Priority Score (High to Low)</option>
                            <option value="evidence">Sort: Supporting Paper Count</option>
                            <option value="original">Sort: Corpus Order</option>
                          </select>
                        </div>
                      </div>

                      {/* Candidate Gaps Grid */}
                      <div className="grid gap-4 xl:grid-cols-2">
                        {sortedGaps.map((gap, index) => (
                          <GapCard
                            key={gap.id}
                            gap={gap}
                            index={index}
                            onOpen={handleOpenGap}
                            onExperiment={handleOpenExperiment}
                          />
                        ))}
                      </div>

                      {sortedGaps.length === 0 && (
                        <EmptyState
                          icon={FileSearch}
                          title="No Gaps Identified"
                          detail="The model did not identify confident gaps in this corpus. Try broadening your research question."
                        />
                      )}
                    </>
                  )}
                </div>
              ))}

            {/* VIEW 3: LITERATURE EXPLORER */}
            {active === "literature" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <PageTitle
                  title="Literature Explorer"
                  description="Peer-reviewed research records retrieved from Europe PMC. Filter records or search literature directly."
                  action={
                    <Tag tone="teal">
                      {displayPapers.length} Records Available
                    </Tag>
                  }
                />

                {/* Filter and Direct Search Bar */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b988c]"
                      />
                      <input
                        type="text"
                        value={paperFilter}
                        onChange={(e) => setPaperFilter(e.target.value)}
                        placeholder="Filter corpus by title, author, or abstract keywords..."
                        className="w-full rounded-2xl border border-[#dce5e0] bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm outline-none focus:border-[#0b655b] focus:ring-2 focus:ring-[#0b655b]/10 shadow-xs"
                      />
                    </div>
                    {paperFilter && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPaperFilter("")}
                      >
                        <RefreshCw size={13} /> Clear Filter
                      </Button>
                    )}
                  </div>

                  {/* Direct live search input */}
                  <form
                    onSubmit={handleDirectSearch}
                    className="flex flex-col sm:flex-row items-center gap-2.5 rounded-2xl border border-[#dce5e0] bg-[#f8faf8] p-3 shadow-2xs"
                  >
                    <span className="text-xs font-semibold text-[#506e62] flex items-center gap-1.5 shrink-0">
                      <BookOpen size={14} className="text-[#0b655b]" />
                      Query Europe PMC directly:
                    </span>
                    <input
                      type="text"
                      value={directSearchQuery}
                      onChange={(e) => setDirectSearchQuery(e.target.value)}
                      placeholder="e.g. biosensor arsenic drinking water"
                      className="flex-1 rounded-xl border border-[#dfe7e2] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#0b655b]"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      loading={directSearchLoading}
                      disabled={directSearchQuery.trim().length < 3}
                    >
                      Search Europe PMC
                    </Button>
                    {directSearchResults && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setDirectSearchResults(null)}
                      >
                        Reset to Analysis Corpus
                      </Button>
                    )}
                  </form>
                </div>

                {/* Papers Grid */}
                {displayPapers.length > 0 ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {displayPapers.map((paper) => (
                      <PaperCard
                        key={paper.id || paper.paper_id}
                        paper={paper}
                        onOpen={handleOpenPaperModal}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="No Matching Papers Found"
                    detail={
                      analysis
                        ? "Try adjusting your filter keywords or clearing the search."
                        : "Run a research analysis from Discovery or query Europe PMC directly."
                    }
                  />
                )}
              </div>
            )}

            {/* VIEW 4: EVIDENCE GRAPH */}
            {active === "graph" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <PageTitle
                  title="Evidence Relationship Graph"
                  description="Interactive force-directed graph connecting retrieved literature nodes to candidate research gaps using verified backend relationships."
                />

                {!analysis ? (
                  <EmptyState
                    icon={Network}
                    title="No Evidence Graph Available"
                    detail="Run a question analysis to generate paper-to-gap relationships."
                    action={
                      <Button onClick={() => setActive("overview")}>
                        Start an Analysis
                      </Button>
                    }
                  />
                ) : (
                  <EvidenceGraph
                    analysisId={analysis.analysis_id}
                    onOpenPaper={handleOpenPaperModal}
                    onOpenGap={handleOpenGap}
                    onProposeExperiment={handleOpenExperiment}
                  />
                )}
              </div>
            )}

            {/* VIEW 5: EXPERIMENT LAB */}
            {active === "experiment" && (
              <div className="animate-in fade-in duration-200">
                <ExperimentView
                  gap={selectedGap}
                  experiment={experiment}
                  loading={experimentLoading}
                  error={experimentError}
                  onGenerate={() => handleOpenExperiment(selectedGap)}
                  onOpenGap={() => {
                    setActive("gaps");
                    setGapViewMode("list");
                  }}
                />
              </div>
            )}
          </main>
        </div>

        {/* Global Footer */}
        <footer className="mt-12 border-t border-[#dce5e0] bg-[#f8faf8] px-4 py-5 text-[11px] text-[#789286] sm:px-9">
          <div className="mx-auto max-w-[1460px] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#102a24]">ResearchRadar AI</span>
            </div>
            <div>
              Real Literature • Transparent Scoring
            </div>
          </div>
        </footer>
      </div>

      {/* Paper Detail Modal */}
      <PaperDetailModal
        paper={selectedPaper}
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
      />
    </div>
  );
}
