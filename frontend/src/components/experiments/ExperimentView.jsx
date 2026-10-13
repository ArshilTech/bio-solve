import React, { useState } from "react";
import {
  FlaskConical,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Beaker,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Button from "../common/Button";
import Tag from "../common/Tag";
import PageTitle from "../common/PageTitle";
import EmptyState from "../common/EmptyState";

export default function ExperimentView({
  gap,
  experiment,
  loading,
  error,
  onGenerate,
  onOpenGap,
}) {
  const [copied, setCopied] = useState(false);

  const sections = [
    { key: "research_question", title: "Target Research Question", icon: "01", value: experiment?.research_question },
    { key: "hypothesis", title: "Testable Scientific Hypothesis", icon: "02", value: experiment?.hypothesis },
    { key: "study_design", title: "Methodological Study Design", icon: "03", value: experiment?.study_design },
    { key: "samples_and_conditions", title: "Water Samples & Environmental Matrix Conditions", icon: "04", value: experiment?.samples_and_conditions },
    { key: "measurements", title: "Sensor Measurements & Analytical Reference Standards", icon: "05", value: experiment?.measurements },
    { key: "controls", title: "Negative & Positive Experimental Controls", icon: "06", value: experiment?.controls },
    { key: "analysis_method", title: "Statistical & Concordance Evaluation Methods", icon: "07", value: experiment?.analysis_method },
    { key: "safety_considerations", title: "Safety, Field Handling & Operational Disclaimer", icon: "08", value: experiment?.safety_considerations },
    { key: "limitations", title: "Methodological Boundaries & Known Interferences", icon: "09", value: experiment?.limitations },
  ];

  const handleCopy = async () => {
    if (!experiment) return;
    const fullText = [
      `# RESEARCHRADAR AI EXPERIMENTAL PROPOSAL`,
      `Gap: ${gap?.title || "Candidate Gap"}`,
      `Generated: ${new Date().toISOString()}`,
      `\n--- PROTOCOL SECTIONS ---\n`,
      ...sections
        .filter((s) => s.value)
        .map((s) => `### ${s.title}\n${s.value}\n`),
      `\nDISCLAIMER: AI-generated research proposal. Requires review by a qualified biosciences mentor before any laboratory or field execution.`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!experiment) return;
    const fullText = [
      `# RESEARCHRADAR AI EXPERIMENTAL PROPOSAL`,
      `Target Gap: ${gap?.title || "Candidate Gap"}`,
      `Generated: ${new Date().toISOString()}`,
      `\n--- PROTOCOL ---\n`,
      ...sections
        .filter((s) => s.value)
        .map((s) => `## ${s.title}\n\n${s.value}\n`),
    ].join("\n");

    const blob = new Blob([fullText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `experimental-protocol-${gap?.id || "gap"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Experimental Protocol Lab"
        description="Transform evidence-backed research gaps into structured scientific protocols with defined controls, reference standards, and validation matrices."
      />

      {!gap ? (
        <EmptyState
          icon={FlaskConical}
          title="Select a Candidate Research Gap First"
          detail="Go to Candidate Gaps or Overview, select a discovered gap, and click “Propose Experiment” to generate a customized protocol."
          action={
            <Button onClick={() => onOpenGap(null)} variant="primary">
              View Candidate Gaps
            </Button>
          }
        />
      ) : (
        <>
          {/* Target Gap Banner */}
          <div className="rounded-2xl border border-[#b8f0d5] bg-gradient-to-r from-[#eafaf2] via-[#f0fbf5] to-[#f8fdfa] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0b655b] block mb-1">
                  Target Candidate Gap • {gap.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#102a24] font-display">
                  {gap.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#4d665b] line-clamp-2">
                  {gap.next_research_question || gap.description}
                </p>
              </div>

              {!experiment && (
                <Button
                  variant="primary"
                  onClick={onGenerate}
                  loading={loading}
                  icon={Sparkles}
                  className="shrink-0"
                >
                  {loading ? "Generating Protocol..." : "Generate Protocol"}
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="rounded-3xl border border-[#dce5e0] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#0b655b] border-t-transparent animate-spin mb-4" />
              <h3 className="text-base font-bold text-[#14322a] font-display">
                Formulating scientific study design...
              </h3>
              <p className="mt-1.5 text-xs text-[#6e857b] max-w-md mx-auto">
                Analyzing literature constraints to design controls, sample matrix requirements, and reference measurement standards.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">Protocol Generation Failed</span>
                <p className="mt-0.5">{error}</p>
                <Button variant="secondary" size="sm" onClick={onGenerate} className="mt-3">
                  Retry Protocol Generation
                </Button>
              </div>
            </div>
          )}

          {/* Generated Experiment Plan */}
          {experiment && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#dce5e0]">
                <div className="flex items-center gap-2">
                  <Tag tone="green">Protocol Synthesized</Tag>
                  <span className="text-xs text-[#698478] hidden sm:inline">
                    Ready for mentor review
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    icon={copied ? Check : Copy}
                  >
                    {copied ? "Protocol Copied" : "Copy Protocol"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    icon={Download}
                  >
                    Download Markdown
                  </Button>
                </div>
              </div>

              {/* Protocol Section Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {sections
                  .filter((s) => s.value)
                  .map((s, idx) => {
                    const isFullWidth = idx === 0 || idx === 1 || idx === 2 || idx === 3;
                    return (
                      <section
                        key={s.key}
                        className={`rounded-2xl border border-[#dce5e0] bg-white p-5 sm:p-6 shadow-xs ${
                          isFullWidth ? "md:col-span-2" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#eaf4ef] text-[10px] font-mono font-bold text-[#0b655b]">
                            {s.icon}
                          </span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b655b]">
                            {s.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm leading-relaxed text-[#3c554b] whitespace-pre-line">
                          {s.value}
                        </p>
                      </section>
                    );
                  })}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-amber-900 flex items-start gap-3.5 shadow-xs">
                <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block mb-0.5">
                    Scientific & Biosafety Notice:
                  </span>
                  This proposal is an AI-assisted hypothesis and experimental plan based on retrieved scientific literature.
                  It does not replace laboratory biosafety protocols or certified reference standard validation (e.g., EPA/WHO standards).
                  Unvalidated low-cost biosensors must never be used as sole determinators of drinking water safety without institutional review.
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
