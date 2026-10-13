import json
import os
from pathlib import Path
from typing import Tuple
import httpx

from app.config import get_settings
from app.utils.logging import logger

settings = get_settings()


async def search_europe_pmc(
    query: str,
    limit: int = 20,
    allow_fallback: bool = True,
) -> Tuple[list[dict], list[str]]:
    """
    Search Europe PMC REST API for scientific literature.
    Returns (raw_records, warnings).
    """
    bounded_limit = max(1, min(limit, settings.max_papers))
    warnings: list[str] = []

    url = f"{settings.europe_pmc_base_url}/search"
    params = {
        "query": query,
        "format": "json",
        "pageSize": bounded_limit,
        "resultType": "core",
        "sort": "CITED desc",
    }

    timeout = httpx.Timeout(settings.request_timeout_seconds)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
            records = payload.get("resultList", {}).get("result", [])
            logger.info("Europe PMC returned %d records for query: %s", len(records), query[:40])
            return records, warnings

    except (httpx.RequestError, httpx.HTTPStatusError) as exc:
        logger.warning("Europe PMC request failed: %s", str(exc))
        if allow_fallback:
            fallback_path = Path(__file__).resolve().parent.parent.parent / "data" / "sample_papers.json"
            if fallback_path.exists():
                try:
                    with open(fallback_path, "r", encoding="utf-8") as f:
                        fallback_data = json.load(f)
                    warnings.append(
                        "Live Europe PMC retrieval was temporarily unavailable. "
                        "Demonstration dataset containing verified scientific literature was used."
                    )
                    logger.info("Loaded %d fallback records from sample_papers.json", len(fallback_data))
                    return fallback_data[:bounded_limit], warnings
                except Exception as file_exc:
                    logger.error("Failed reading fallback data: %s", str(file_exc))

        warnings.append(f"Europe PMC search encountered a network or service issue: {type(exc).__name__}")
        return [], warnings
