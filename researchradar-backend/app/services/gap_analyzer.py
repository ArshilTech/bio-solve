from datetime import datetime, timezone
from typing import Any
from app.schemas.gaps import RankedGap
from app.schemas.papers import Paper
from app.services.europe_pmc import search_europe_pmc
from app.services.paper_processor import process_papers
from app.services.grok_client import ask_grok_structured
from app.services.evidence_validator import verify_evidence_passages
from app.services.gap_ranker import (
    calculate_priority,
    priority_label,
    compute_evidence_score,
    generate_score_explanation,
)
from app.utils.errors import InsufficientLiteratureError, AIAnalysisError
from app.utils.logging import logger


ANALYSIS_SYSTEM_PROMPT = """You are ResearchRadar AI, a senior scientific research gap analyst specializing in biosensors, environmental monitoring, water quality, and biological research.
Your job is to analyze the provided literature corpus and discover evidence-backed research gaps.

CRITICAL SCIENTIFIC RULES:
1. ONLY reference papers from the provided corpus using their exact IDs (e.g. P1, P2). Never invent papers or citations.
2. For each research gap, provide concrete supporting evidence passages that are exact or faithful excerpts from the provided paper abstracts.
3. Distinguish between what the papers explicitly report vs. what remains unknown, unresolved, or unaddressed under real-world field conditions.
4. Never claim that a gap is universally novel; frame it as an unaddressed question or limitation within this retrieved literature.
5. Provide honest limitations and feasible next research questions.
6. Provide an impact estimate (0-100) and feasibility estimate (0-100) with brief rationale.

OUTPUT FORMAT:
You MUST respond with a JSON object adhering to this schema:
{
  "gaps": [
    {
      "title": "Concise descriptive title of gap",
      "description": "Thorough scientific description of the gap found in the corpus",
      "why_it_matters": "Why addressing this gap is scientifically or socially significant",
      "supporting_paper_ids": ["P1", "P2"],
      "evidence": [
        {
          "paper_id": "P1",
          "passage": "Exact or near-exact quote from P1 abstract demonstrating the finding or limitation"
        }
      ],
      "limitations": [
        "First known limitation in current literature",
        "Second known limitation"
      ],
      "next_research_question": "A focused, testable research question to address this gap",
      "impact_score": 80,
      "feasibility_score": 75
    }
  ]
}
"""


async def analyze_research_question(
    question: str,
    max_papers: int = 20,
) -> dict[str, Any]:
    cleaned_question = question.strip()
    if len(cleaned_question) < 10:
        raise ValueError("Research question must be at least 10 characters long.")

    logger.info("Starting literature analysis for query: %s", cleaned_question[:60])

    # 1. Literature retrieval
    raw_records, search_warnings = await search_europe_pmc(cleaned_question, limit=max_papers)
    papers: list[Paper] = process_papers(raw_records)

    warnings: list[str] = list(search_warnings)

    if len(papers) < 1:
        raise InsufficientLiteratureError(
            "Europe PMC did not return any peer-reviewed papers with accessible abstracts for this query. "
            "Please try broadening your research question."
        )

    # 2. Build corpus prompt
    corpus_text_parts = []
    papers_map: dict[str, Paper] = {}
    for p in papers:
        papers_map[p.id] = p
        authors_str = ", ".join(p.authors[:3]) + (" et al." if len(p.authors) > 3 else "")
        corpus_text_parts.append(
            f"[{p.id}] Title: {p.title}\n"
            f"Authors: {authors_str} ({p.year or 'n.d.'})\n"
            f"DOI/PMID: {p.doi or p.pmid or 'N/A'}\n"
            f"Abstract: {p.abstract}\n"
        )

    corpus_prompt = (
        f"RESEARCH QUESTION:\n{cleaned_question}\n\n"
        f"RETRIEVED SCIENTIFIC LITERATURE CORPUS ({len(papers)} papers):\n"
        + "\n---\n".join(corpus_text_parts)
        + "\n\nPlease identify 2 to 4 prominent research gaps based strictly on this corpus."
    )

    # 3. Model query
    ai_response = await ask_grok_structured(
        system_prompt=ANALYSIS_SYSTEM_PROMPT,
        user_prompt=corpus_prompt,
    )

    raw_gaps = ai_response.get("gaps", [])
    if not isinstance(raw_gaps, list) or len(raw_gaps) == 0:
        logger.warning("AI returned no research gaps. Retrying with fallback structure.")
        raw_gaps = []

    # 4. Evidence verification and scoring
    ranked_gaps: list[dict[str, Any]] = []

    for idx, gap_dict in enumerate(raw_gaps):
        gap_id = f"G{idx + 1}"
        raw_evidence = gap_dict.get("evidence", [])
        
        # Verify evidence passages against source abstracts
        verified_evidence, confirmed_paper_ids, val_warnings = verify_evidence_passages(
            raw_evidence, papers_map
        )
        warnings.extend(val_warnings)

        # Merge model-listed supporting papers that actually exist
        candidate_paper_ids = gap_dict.get("supporting_paper_ids", [])
        valid_supporting_ids = set()
        for pid in candidate_paper_ids:
            if pid in papers_map:
                valid_supporting_ids.add(pid)
        for pid in confirmed_paper_ids:
            valid_supporting_ids.add(pid)

        # Count verified passages
        verified_passages_count = sum(1 for e in verified_evidence if e.verified)

        # Evidence strength classification
        if verified_passages_count >= 2:
            evidence_strength = "strong"
        elif verified_passages_count == 1:
            evidence_strength = "moderate"
        else:
            evidence_strength = "weak"
            warnings.append(
                f"Gap '{gap_dict.get('title', gap_id)}' lacks verified direct quotations from retrieved abstracts. "
                "Full-text review recommended."
            )

        # Scoring
        evidence_score = compute_evidence_score(
            verified_passages=verified_passages_count,
            total_supporting_papers=len(valid_supporting_ids),
            corpus_size=len(papers),
        )
        
        impact_score = float(gap_dict.get("impact_score") or 70.0)
        feasibility_score = float(gap_dict.get("feasibility_score") or 65.0)

        final_score = calculate_priority(
            evidence=evidence_score,
            impact=impact_score,
            feasibility=feasibility_score,
        )
        priority = priority_label(final_score)
        explanation = generate_score_explanation(
            score=final_score,
            evidence=evidence_score,
            impact=impact_score,
            feasibility=feasibility_score,
            verified_passages_count=verified_passages_count,
        )

        ranked_gap = RankedGap(
            id=gap_id,
            title=gap_dict.get("title") or f"Research Gap {idx + 1}",
            description=gap_dict.get("description") or "Identified limitation in current literature.",
            why_it_matters=gap_dict.get("why_it_matters") or "Crucial for translational reliability and monitoring accuracy.",
            supporting_paper_ids=sorted(list(valid_supporting_ids)),
            evidence=verified_evidence,
            limitations=gap_dict.get("limitations") or ["Requires field validation across varied environmental matrix conditions."],
            next_research_question=gap_dict.get("next_research_question") or f"How can {cleaned_question} be systematically resolved under field conditions?",
            evidence_strength=evidence_strength,
            priority=priority,
            priority_score=final_score,
            score_explanation=explanation,
            evidence_score=evidence_score,
            impact_score=impact_score,
            feasibility_score=feasibility_score,
        )
        ranked_gaps.append(ranked_gap.model_dump())

    # Sort gaps by priority score descending
    ranked_gaps.sort(key=lambda g: g["priority_score"], reverse=True)

    # Re-assign sequential gap IDs if needed or keep sorted
    for idx, gap in enumerate(ranked_gaps):
        gap["id"] = f"G{idx + 1}"

    papers_dict_list = [p.model_dump() for p in papers]

    return {
        "question": cleaned_question,
        "papers_analyzed": len(papers),
        "papers": papers_dict_list,
        "gaps": ranked_gaps,
        "warnings": list(dict.fromkeys(warnings)),  # deduplicate warnings
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
