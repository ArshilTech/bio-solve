from fastapi import APIRouter
import httpx
from app.config import get_settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ResearchRadar AI",
        "version": "1.0.0",
    }


@router.get("/health/ready")
async def health_ready():
    settings = get_settings()
    
    # Check AI key readiness without revealing value
    ai_configured = bool(
        settings.xai_api_key.get_secret_value()
        and len(settings.xai_api_key.get_secret_value().strip()) > 5
    )
    
    # Check Europe PMC reachability with light HEAD/GET
    europe_pmc_ready = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.europe_pmc_base_url}/search",
                params={"query": "test", "format": "json", "pageSize": 1}
            )
            europe_pmc_ready = resp.status_code == 200
    except Exception:
        europe_pmc_ready = False

    is_ready = ai_configured and europe_pmc_ready

    # Return minimal status - avoid exposing internal dependency details publicly
    return {
        "status": "ready" if is_ready else "degraded",
        "service": "ResearchRadar AI",
        "version": "1.0.0",
    }
