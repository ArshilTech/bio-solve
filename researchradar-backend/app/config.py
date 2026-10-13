from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    xai_api_key: str
    xai_base_url: str = "https://api.x.ai/v1"
    xai_model: str

    europe_pmc_base_url: str = (
        "https://www.ebi.ac.uk/europepmc/webservices/rest"
    )

    request_timeout_seconds: float = 20
    max_papers: int = 20
    max_abstract_chars: int = 3500

    cors_origins: str = (
        "http://localhost:5173,http://localhost:3000"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
