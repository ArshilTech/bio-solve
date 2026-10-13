from typing import Any, Literal
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str = Field(..., description="Unique node identifier (e.g. P1, G1)")
    type: Literal["paper", "gap"] = Field(..., description="Node entity type")
    label: str = Field(..., description="Display title / label")
    data: dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class GraphEdge(BaseModel):
    source: str = Field(..., description="Source node ID (paper)")
    target: str = Field(..., description="Target node ID (gap)")
    type: str = Field(default="supports", description="Relationship type")


class GraphResponse(BaseModel):
    analysis_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]
