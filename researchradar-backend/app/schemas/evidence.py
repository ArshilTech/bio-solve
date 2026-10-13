from typing import Literal, Optional
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    paper_id: str = Field(..., description="Referenced paper ID (e.g. P1)")
    passage: str = Field(..., min_length=5, description="Exact or near-exact quote/passage from source abstract")
    verified: bool = Field(default=False, description="Whether the passage was matched against the source text")
    verification_status: Literal["verified", "unverified", "insufficient"] = Field(
        default="unverified",
        description="Detailed verification state"
    )
    match_detail: Optional[str] = Field(None, description="Explanation or similarity score")
