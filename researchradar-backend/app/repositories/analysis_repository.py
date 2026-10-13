import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from app.config import get_settings
from app.utils.logging import logger

settings = get_settings()

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "researchradar.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                analysis_id TEXT PRIMARY KEY,
                question TEXT NOT NULL,
                created_at TEXT NOT NULL,
                papers_json TEXT NOT NULL,
                gaps_json TEXT NOT NULL,
                warnings_json TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS experiments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id TEXT NOT NULL,
                gap_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                experiment_json TEXT NOT NULL,
                UNIQUE(analysis_id, gap_id)
            )
        """)
        conn.commit()


# In-memory fast cache as well
ANALYSIS_CACHE: dict[str, dict[str, Any]] = {}


def save_analysis(analysis_data: dict[str, Any]) -> None:
    analysis_id = analysis_data["analysis_id"]
    ANALYSIS_CACHE[analysis_id] = analysis_data

    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO analyses (analysis_id, question, created_at, papers_json, gaps_json, warnings_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    analysis_id,
                    analysis_data.get("question", ""),
                    analysis_data.get("created_at", datetime.now(timezone.utc).isoformat()),
                    json.dumps(analysis_data.get("papers", [])),
                    json.dumps(analysis_data.get("gaps", [])),
                    json.dumps(analysis_data.get("warnings", [])),
                ),
            )
            conn.commit()
    except Exception as exc:
        logger.error("Failed to persist analysis %s to SQLite: %s", analysis_id, str(exc))


def get_analysis(analysis_id: str) -> Optional[dict[str, Any]]:
    if analysis_id in ANALYSIS_CACHE:
        return ANALYSIS_CACHE[analysis_id]

    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT analysis_id, question, created_at, papers_json, gaps_json, warnings_json FROM analyses WHERE analysis_id = ?",
                (analysis_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None

            data = {
                "analysis_id": row[0],
                "question": row[1],
                "created_at": row[2],
                "papers_analyzed": len(json.loads(row[3])),
                "papers": json.loads(row[3]),
                "gaps": json.loads(row[4]),
                "warnings": json.loads(row[5]),
            }
            ANALYSIS_CACHE[analysis_id] = data
            return data
    except Exception as exc:
        logger.error("Failed to read analysis %s from SQLite: %s", analysis_id, str(exc))
        return None


def save_experiment(analysis_id: str, gap_id: str, experiment_data: dict[str, Any]) -> None:
    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO experiments (analysis_id, gap_id, created_at, experiment_json)
                VALUES (?, ?, ?, ?)
                """,
                (
                    analysis_id,
                    gap_id,
                    datetime.now(timezone.utc).isoformat(),
                    json.dumps(experiment_data),
                ),
            )
            conn.commit()
    except Exception as exc:
        logger.error("Failed to save experiment for %s/%s: %s", analysis_id, gap_id, str(exc))


def get_experiment(analysis_id: str, gap_id: str) -> Optional[dict[str, Any]]:
    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT experiment_json FROM experiments WHERE analysis_id = ? AND gap_id = ?",
                (analysis_id, gap_id),
            )
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
            return None
    except Exception as exc:
        logger.error("Failed to read experiment for %s/%s: %s", analysis_id, gap_id, str(exc))
        return None


def get_gap_by_id(gap_id: str, analysis_id: Optional[str] = None) -> Optional[dict[str, Any]]:
    # If analysis_id is provided, look in that analysis
    if analysis_id:
        analysis = get_analysis(analysis_id)
        if analysis:
            for gap in analysis.get("gaps", []):
                if gap.get("id") == gap_id:
                    return {"gap": gap, "analysis_id": analysis_id, "question": analysis.get("question")}
        return None

    # Search in all cached or stored analyses
    for aid, a in ANALYSIS_CACHE.items():
        for gap in a.get("gaps", []):
            if gap.get("id") == gap_id:
                return {"gap": gap, "analysis_id": aid, "question": a.get("question")}

    try:
        init_db()
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT analysis_id, gaps_json, question FROM analyses")
            for row in cursor.fetchall():
                aid, gaps_str, q = row
                gaps = json.loads(gaps_str)
                for gap in gaps:
                    if gap.get("id") == gap_id:
                        return {"gap": gap, "analysis_id": aid, "question": q}
    except Exception as exc:
        logger.error("Error searching gap %s: %s", gap_id, str(exc))

    return None
