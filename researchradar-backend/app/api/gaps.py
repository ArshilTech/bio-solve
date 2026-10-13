from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.repositories.analysis_repository import get_gap_by_id, get_analysis

router = APIRouter(tags=["Gaps"])


@router.get("/gaps/{gap_id}")
def get_gap_detail(
    gap_id: str,
    analysis_id: Optional[str] = Query(None, description="Analysis ID the gap belongs to"),
):
    result = get_gap_by_id(gap_id, analysis_id=analysis_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Research gap '{gap_id}' was not found.",
        )

    gap = result["gap"]
    aid = result["analysis_id"]
    analysis = get_analysis(aid) or {}
    papers = analysis.get("papers", [])
    papers_map = {p.get("id"): p for p in papers}

    supporting_papers = [
        papers_map[pid]
        for pid in gap.get("supporting_paper_ids", [])
        if pid in papers_map
    ]

    return {
        "gap": gap,
        "analysis_id": aid,
        "research_question": result.get("question"),
        "supporting_papers": supporting_papers,
        "evidence": gap.get("evidence", []),
        "priority_score": gap.get("priority_score"),
        "priority": gap.get("priority"),
        "score_explanation": gap.get("score_explanation"),
        "limitations": gap.get("limitations", []),
        "next_research_question": gap.get("next_research_question"),
    }
