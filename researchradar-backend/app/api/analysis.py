from uuid import uuid4
from fastapi import APIRouter, HTTPException
from app.schemas.requests import AnalyzeRequest
from app.services.gap_analyzer import analyze_research_question
from app.repositories.analysis_repository import save_analysis
from app.utils.logging import logger

router = APIRouter(tags=["Analysis"])


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        result = await analyze_research_question(
            question=request.question,
            max_papers=request.max_papers,
        )

        analysis_id = str(uuid4())
        result["analysis_id"] = analysis_id

        # Persist to repository
        save_analysis(result)

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        logger.error("Analysis endpoint unexpected error: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Scientific literature analysis failed. Please verify your query or retry.",
        ) from exc
