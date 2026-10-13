from fastapi import APIRouter, HTTPException, Query

from app.services.europe_pmc import search_europe_pmc
from app.services.paper_processor import process_papers

router = APIRouter(tags=["Literature"])


@router.get("/search")
async def search(
    q: str = Query(min_length=5, max_length=500),
    limit: int = Query(default=20, ge=1, le=20),
):
    try:
        raw_records = await search_europe_pmc(q, limit)
        papers = process_papers(raw_records)

        return {
            "query": q,
            "total": len(papers),
            "papers": papers,
        }

    except Exception as exc:
        # Log detailed exceptions on the server in the final version.
        raise HTTPException(
            status_code=502,
            detail="Literature search failed. Please retry.",
        ) from exc
