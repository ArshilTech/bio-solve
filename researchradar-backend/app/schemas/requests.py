from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    question: str = Field(min_length=10, max_length=500)
    max_papers: int = Field(default=20, ge=5, le=20)


class ExperimentRequest(BaseModel):
    analysis_id: str = Field(min_length=1, max_length=100)
    gap_id: str = Field(min_length=1, max_length=100)
