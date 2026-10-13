from fastapi import APIRouter, HTTPException
from app.repositories.analysis_repository import get_analysis
from app.services.graph_builder import build_evidence_graph
from app.schemas.graph import GraphResponse

router = APIRouter(tags=["Graph"])


@router.get("/graph/{analysis_id}", response_model=GraphResponse)
def get_graph_by_analysis_id(analysis_id: str):
    analysis_data = get_analysis(analysis_id)
    if not analysis_data:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis with ID '{analysis_id}' was not found.",
        )

    return build_evidence_graph(analysis_data)
