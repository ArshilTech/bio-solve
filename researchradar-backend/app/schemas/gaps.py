from typing import Literal, Optional
from pydantic import BaseModel, Field
from app.schemas.evidence import EvidenceItem


class CandidateGap(BaseModel):
    title: str = Field(..., description="Concise title for the candidate research gap")
    description: str = Field(..., description="Detailed description of the gap identified in literature")
    why_it_matters: str = Field(..., description="Scientific or practical significance")
    supporting_paper_ids: list[str] = Field(default_factory=list, description="List of paper IDs referenced (e.g. ['P1', 'P2'])")
    evidence: list[EvidenceItem] = Field(default_factory=list, description="Passages cited from source literature")
    limitations: list[str] = Field(default_factory=list, description="Limitations of current literature or evidence")
    next_research_question: str = Field(..., description="Actionable follow-up research question")
    evidence_strength: Literal["weak", "moderate", "strong"] = Field(
        default="moderate",
        description="Assessed evidence strength based on verified papers"
    )
    priority: Literal["high", "medium", "low"] = Field(default="medium", description="Priority tier")
    priority_score: int = Field(default=50, ge=0, le=100, description="Overall transparent score / 100")
    score_explanation: str = Field(default="", description="Detailed transparent breakdown of scoring")
    evidence_score: Optional[float] = Field(None, description="Score component for evidence support (0-100)")
    impact_score: Optional[float] = Field(None, description="Score component for scientific/societal impact (0-100)")
    feasibility_score: Optional[float] = Field(None, description="Score component for investigation feasibility (0-100)")


class RankedGap(CandidateGap):
    id: str = Field(..., description="Stable identifier in analysis, e.g. G1")
