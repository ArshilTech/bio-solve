from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class Paper(BaseModel):
    id: str = Field(..., description="Stable local identifier in analysis, e.g. P1")
    paper_id: Optional[str] = Field(None, description="Same as id for backend schema compatibility")
    source: str = Field(default="Europe PMC", description="Literature source repository")
    source_id: Optional[str] = Field(None, description="Original source identifier (e.g. PMID, PMCID, or Europe PMC ID)")
    title: str = Field(..., description="Normalized paper title")
    authors: list[str] = Field(default_factory=list, description="List of paper authors")
    publication_year: Optional[int | str] = Field(None, description="Year of publication")
    year: Optional[int | str] = Field(None, description="Duplicate of publication_year for frontend compatibility")
    doi: Optional[str] = Field(None, description="Digital Object Identifier")
    pmid: Optional[str] = Field(None, description="PubMed ID")
    pmcid: Optional[str] = Field(None, description="PubMed Central ID")
    abstract: str = Field(..., description="Paper abstract text")
    source_url: Optional[str] = Field(None, description="URL linking to source publication")
    publication_type: Optional[str] = Field(None, description="Publication type (e.g. Journal Article, Review)")
    retrieved_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    @model_validator(mode="after")
    def sync_id_and_year(self):
        if not self.paper_id:
            self.paper_id = self.id
        if not self.year and self.publication_year:
            self.year = self.publication_year
        elif not self.publication_year and self.year:
            self.publication_year = self.year
        return self


class SearchResponse(BaseModel):
    query: str
    total_returned: int
    papers: list[Paper]
    warnings: list[str] = Field(default_factory=list)
