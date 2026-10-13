import httpx

from app.config import get_settings

settings = get_settings()


async def search_europe_pmc(
    query: str,
    limit: int = 20,
) -> list[dict]:
    limit = max(1, min(limit, settings.max_papers))

    url = f"{settings.europe_pmc_base_url}/search"

    params = {
        "query": query,
        "format": "json",
        "pageSize": limit,
        "resultType": "core",
    }

    timeout = httpx.Timeout(
        settings.request_timeout_seconds
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        payload = response.json()

    return payload.get("resultList", {}).get("result", [])
