import re
from typing import Tuple
from app.schemas.evidence import EvidenceItem
from app.schemas.papers import Paper
from app.utils.logging import logger


def normalize_for_matching(text: str) -> str:
    """Lowercase and strip all non-alphanumeric characters for fuzzy substring matching."""
    return re.sub(r"[^a-z0-9]", "", text.lower())


def verify_evidence_passages(
    evidence_items: list[dict | EvidenceItem],
    papers_map: dict[str, Paper],
) -> Tuple[list[EvidenceItem], list[str], list[str]]:
    """
    Validates candidate evidence passages against the retrieved paper corpus.
    Returns:
      - verified_items: list of EvidenceItem with verified flags
      - valid_paper_ids: list of confirmed paper IDs
      - warnings: list of validation warnings
    """
    validated_evidence: list[EvidenceItem] = []
    valid_paper_ids: set[str] = set()
    warnings: list[str] = []

    for item in evidence_items:
        if isinstance(item, dict):
            paper_id = item.get("paper_id", "").strip()
            raw_passage = item.get("passage", "").strip()
        else:
            paper_id = item.paper_id.strip()
            raw_passage = item.passage.strip()

        if not paper_id:
            warnings.append("Evidence item omitted because no paper_id was specified.")
            continue

        if paper_id not in papers_map:
            warnings.append(
                f"Model referenced paper ID '{paper_id}' which does not exist in the retrieved corpus."
            )
            validated_evidence.append(
                EvidenceItem(
                    paper_id=paper_id,
                    passage=raw_passage,
                    verified=False,
                    verification_status="unverified",
                    match_detail=f"Paper ID '{paper_id}' not found in retrieved literature.",
                )
            )
            continue

        paper = papers_map[paper_id]
        if not raw_passage:
            warnings.append(f"Paper '{paper_id}' had an empty evidence quote.")
            continue

        abstract_text = paper.abstract or ""
        if len(abstract_text.strip()) < 20:
            validated_evidence.append(
                EvidenceItem(
                    paper_id=paper_id,
                    passage=raw_passage,
                    verified=False,
                    verification_status="insufficient",
                    match_detail="Retrieved abstract text was too short to verify passage.",
                )
            )
            continue

        # Match check:
        # 1. Direct or normalized substring match
        norm_passage = normalize_for_matching(raw_passage)
        norm_abstract = normalize_for_matching(abstract_text)

        is_verified = False
        detail = ""

        if norm_passage and norm_passage in norm_abstract:
            is_verified = True
            detail = "Exact/normalized excerpt verified in retrieved abstract."
        else:
            words = [re.sub(r"[^a-z0-9]", "", w.lower()) for w in raw_passage.split() if len(w) > 3]
            if words:
                matches = sum(1 for w in words if w in norm_abstract)
                overlap = matches / len(words)
                if overlap >= 0.85:
                    is_verified = True
                    detail = f"High lexical match ({int(overlap * 100)}%) verified in abstract."
                else:
                    is_verified = False
                    detail = f"Passage could not be verified in abstract ({int(overlap * 100)}% match). Full text may be required."
            else:
                is_verified = False
                detail = "Passage too short or lacking distinctive terms to verify in abstract."

        if is_verified:
            valid_paper_ids.add(paper_id)

        validated_evidence.append(
            EvidenceItem(
                paper_id=paper_id,
                passage=raw_passage,
                verified=is_verified,
                verification_status="verified" if is_verified else "unverified",
                match_detail=detail,
            )
        )

    return validated_evidence, sorted(list(valid_paper_ids)), warnings
