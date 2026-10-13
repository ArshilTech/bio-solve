import React, { useState } from "react";
import { ExternalLink, Copy, Check, BookOpen, Calendar, User, FileCode } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Tag from "../common/Tag";

export default function PaperDetailModal({ paper, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  if (!paper) return null;

  const authorsString = Array.isArray(paper.authors)
    ? paper.authors.join(", ")
    : paper.authors || "Not listed";

  const handleCopyDoi = async () => {
    if (!paper.doi) return;
    try {
      await navigator.clipboard.writeText(paper.doi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyCitation = async () => {
    const authors = Array.isArray(paper.authors) ? paper.authors.slice(0, 3).join(", ") + (paper.authors.length > 3 ? " et al." : "") : paper.authors || "";
    const citation = `${authors} (${paper.year || paper.publication_year || "n.d."}). ${paper.title}.${paper.doi ? ` DOI: https://doi.org/${paper.doi}` : ""}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paper.title}
      subtitle={`Literature Record • ${paper.id || paper.paper_id || "Paper"}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="dark">{paper.source || "Europe PMC"}</Tag>
          {(paper.year || paper.publication_year) && (
            <Tag tone="slate" icon={Calendar}>
              {paper.year || paper.publication_year}
            </Tag>
          )}
          {paper.publication_type && (
            <Tag tone="blue">{paper.publication_type}</Tag>
          )}
          {paper.doi && (
            <Tag tone="teal">DOI: {paper.doi}</Tag>
          )}
        </div>

        {/* Authors */}
        <div className="rounded-xl bg-[#f7faf8] p-4 border border-[#e8f1eb]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#698478] flex items-center gap-1.5 mb-1">
            <User size={13} /> Authors
          </span>
          <p className="text-xs sm:text-sm text-[#183930] font-medium leading-relaxed">
            {authorsString}
          </p>
        </div>

        {/* Abstract */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#14342b] block mb-2">
            Abstract
          </span>
          <div className="rounded-xl border border-[#e4ede7] bg-white p-4 text-xs sm:text-sm leading-relaxed text-[#3f574d] max-h-72 overflow-y-auto custom-scrollbar">
            {paper.abstract || "No abstract text was provided in the repository record."}
          </div>
        </div>

        <div className="pt-4 border-t border-[#edf2ef] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {paper.doi && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyDoi}
                icon={copied ? Check : Copy}
              >
                {copied ? "DOI Copied" : "Copy DOI"}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCitation}
              icon={copiedCitation ? Check : FileCode}
            >
              {copiedCitation ? "Citation Copied" : "Copy Citation"}
            </Button>
          </div>

          {paper.source_url && (
            <a
              href={paper.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0b655b] text-white hover:bg-[#084e46] transition-colors shadow-xs"
            >
              <span>Open in Europe PMC</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
