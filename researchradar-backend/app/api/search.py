from fastapi import APIRouter, HTTPException, Query, Request
from app.schemas.papers import SearchResponse
from app.services.europe_pmc import search_europe_pmc
from app.services.paper_processor import process_papers
from app.utils.logging import logger
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(tags=["Literature"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/search", response_model=SearchResponse)
@limiter.limit("30/minute")
async def search_literature(
    request: Request,
    q: str = Query(..., min_length=3, max_length=500, description="Scientific research search query"),
    limit: int = Query(default=20, ge=1, le=20, description="Maximum number of papers to retrieve"),
):
    try:
        raw_records, warnings = await search_europe_pmc(q, limit=limit)
        papers = process_papers(raw_records)

        return SearchResponse(
            query=q,
            total_returned=len(papers),
            papers=papers,
            warnings=warnings,
        )
    except Exception as exc:
        logger.error("Literature search error: %s", str(exc), exc_info=True)
        raise HTTPException(
            status_code=502,
            detail="Literature retrieval service encountered an error. Please retry.",
        ) from exc
