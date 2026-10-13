from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.health import router as health_router
from app.api.search import router as search_router
from app.api.analysis import router as analysis_router

settings = get_settings()

app = FastAPI(
    title="ResearchRadar AI",
    description=(
        "Evidence-backed scientific research gap discovery "
        "for water contamination and biosensors."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "ResearchRadar AI API",
        "docs": "/docs",
        "health": "/api/health",
    }
