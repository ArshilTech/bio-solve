from typing import Literal
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    paper_id: str
    passage: str = Field(min_length=5, max_length=1500)


class CandidateGap(BaseModel):
    title: str
    description: str
    why_it_matters: str
    supporting_paper_ids: list[str]
    evidence: list[EvidenceItem]
    limitations: list[str]
    next_research_question: str
    evidence_strength: Literal["weak", "moderate", "strong"]


class RankedGap(CandidateGap):
    id: str
    priority: Literal["high", "medium", "low"]
    priority_score: int = Field(ge=0, le=100)
    score_explanation: str
