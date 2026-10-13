from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.requests import AnalyzeRequest
from app.services.gap_analyzer import analyze_research_question

router = APIRouter(tags=["Analysis"])


ANALYSES: dict[str, dict] = {}


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_research_question(
            question=request.question,
            max_papers=request.max_papers,
        )

        analysis_id = str(uuid4())

        result["analysis_id"] = analysis_id
        result["question"] = request.question

        ANALYSES[analysis_id] = result

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        
        raise HTTPException(
            status_code=502,
            detail="Analysis failed. Please retry.",
        ) from exc
