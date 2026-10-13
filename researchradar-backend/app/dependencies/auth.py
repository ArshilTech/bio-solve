"""
Authentication dependency for expensive endpoints.

If API_KEY is set in the environment, every request to guarded endpoints
must supply the matching value in the ``X-API-Key`` header.
When API_KEY is left empty (default for local dev), the check is skipped
entirely so developers can use the API without any header.
"""
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import get_settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def require_api_key(
    provided_key: str | None = Security(_api_key_header),
) -> None:
    """Dependency: validates X-API-Key when API_KEY env var is configured."""
    settings = get_settings()
    configured_key = settings.api_key.get_secret_value().strip()

    # No key configured → open access (local dev / demo mode)
    if not configured_key:
        return

    if provided_key is None or provided_key != configured_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
