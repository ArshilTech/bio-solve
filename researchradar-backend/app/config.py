import os
from pathlib import Path
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    xai_api_key: str = Field(default="", description="API key for Grok or compatible OpenAI endpoint")
    xai_base_url: str = Field(default="https://api.x.ai/v1", description="API base URL")
    xai_model: str = Field(default="openai/gpt-oss-120b", description="Model identifier")

    europe_pmc_base_url: str = "https://www.ebi.ac.uk/europepmc/webservices/rest"

    database_url: str = "sqlite:///./data/researchradar.db"
    demo_mode: bool = False

    request_timeout_seconds: float = 25.0
    max_papers: int = 20
    max_abstract_chars: int = 3500

    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=[
            str(Path(__file__).resolve().parent.parent / ".env"),
            ".env",
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def resolved_base_url(self) -> str:
        # If user configured a gsk_ key (Groq Cloud) with default x.ai URL, auto-route to Groq endpoint
        if self.xai_api_key.startswith("gsk_") and "api.x.ai" in self.xai_base_url:
            return "https://api.groq.com/openai/v1"
        return self.xai_base_url

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

