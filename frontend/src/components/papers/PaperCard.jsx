import React from "react";
import { BookOpen, ExternalLink, FileText, Calendar } from "lucide-react";
import Tag from "../common/Tag";
import Button from "../common/Button";

export default function PaperCard({ paper, onOpen }) {
  const authorsText = Array.isArray(paper.authors)
    ? paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "")
    : paper.authors || "Authors not listed";

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[#dce5e0] bg-white p-5 transition-all duration-200 hover:border-[#0b655b]/40 hover:shadow-[0_6px_24px_rgba(11,101,91,0.06)]">
      <div>
        {/* Top Badges */}
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0b655b] text-xs font-bold text-[#b8f0d5] font-mono shadow-2xs">
            {paper.id || paper.paper_id || "P"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag tone="teal">{paper.source || "Europe PMC"}</Tag>
              {(paper.year || paper.publication_year) && (
                <Tag tone="slate" icon={Calendar}>
                  {paper.year || paper.publication_year}
                </Tag>
              )}
            </div>

            <h3 className="mt-2 text-sm sm:text-base font-bold leading-snug text-[#123129] font-display line-clamp-2">
              {paper.title}
            </h3>
            <p className="mt-1 text-xs text-[#627c71] line-clamp-1">
              {authorsText}
            </p>
          </div>
        </div>

        {/* Abstract snippet */}
        <p className="mt-3.5 text-xs sm:text-[13px] leading-relaxed text-[#4d665b] line-clamp-3">
          {paper.abstract || "No abstract text was provided in the repository record."}
        </p>
      </div>

      {/* Footer info & Actions */}
      <div className="mt-4 pt-3.5 border-t border-[#edf2ef] flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-[11px] font-mono text-[#789286] truncate max-w-[200px]">
          {paper.doi ? `DOI: ${paper.doi}` : paper.publication_type || "Scientific Article"}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(paper)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0b655b] hover:text-[#084e46] hover:underline cursor-pointer px-2 py-1"
          >
            <FileText size={13} />
            <span>Full Details</span>
          </button>

          {paper.source_url && (
            <a
              href={paper.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#507064] hover:text-[#0b655b] px-2 py-1"
            >
              <span>Source</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
