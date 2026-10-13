from uuid import uuid4
from fastapi import APIRouter, HTTPException, Request
from app.schemas.requests import AnalyzeRequest
from app.services.gap_analyzer import analyze_research_question
from app.repositories.analysis_repository import save_analysis, get_analysis, get_all_analyses
from app.utils.logging import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["Analysis"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze(request: Request, body: AnalyzeRequest):
    try:
        result = await analyze_research_question(
            question=body.question,
            max_papers=body.max_papers,
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


@router.get("/analysis")
def list_analyses(limit: int = 10):
    return get_all_analyses(limit=limit)


@router.get("/analysis/{analysis_id}")
def get_analysis_by_id(analysis_id: str):
    data = get_analysis(analysis_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis '{analysis_id}' was not found.",
        )
    return data
