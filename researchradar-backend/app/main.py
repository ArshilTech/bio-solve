from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.api.health import router as health_router
from app.api.search import router as search_router
from app.api.analysis import router as analysis_router
from app.api.gaps import router as gaps_router
from app.api.graph import router as graph_router
from app.api.experiments import router as experiments_router
from app.repositories.analysis_repository import init_db
from app.utils.logging import logger

settings = get_settings()

# Initialize database schema on startup
init_db()

app = FastAPI(
    title="ResearchRadar AI",
    description=(
        "Evidence-backed scientific research gap discovery platform "
        "for water contamination and biosensors."
    ),
    version="1.0.0",
)

# CORS middleware for React Vite frontend (port 5173, port 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(health_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(gaps_router, prefix="/api")
app.include_router(graph_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "ResearchRadar AI",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "ready": "/api/health/ready",
    }
