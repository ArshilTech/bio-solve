# ResearchRadar AI — Backend Service

Evidence-backed scientific research-gap discovery platform developed for **BioSolve Hackathon Problem Statement 8: AI Research Gap Finder**.

Focus areas: **Water contamination, water-quality monitoring, biosensors, environmental monitoring, and biological research**.

---

## 1. Architecture Overview

ResearchRadar AI connects real scientific literature with structured AI gap analysis and evidence validation:

```text
Research Question
       │
       ▼
[ Europe PMC REST API ] ──► Real peer-reviewed papers
       │
       ▼
[ Paper Processor ] ──────► Deduplication, metadata extraction & sequential IDs (P1, P2...)
       │
       ▼
[ Grok / xAI Client ] ────► Structured research gap extraction (temperature 0.2, RFC 8259 JSON)
       │
       ▼
[ Evidence Validator ] ───► Strict textual verification of quotes against retrieved abstracts
       │
       ▼
[ Gap Ranker ] ───────────► Transparent heuristic: S = 0.40E + 0.35I + 0.25F / 100
       │
       ▼
[ SQLite Repository ] ────► Persistent analysis storage, paper corpus, and gap models
       │
       ├──────────────────► [ Evidence Graph Builder ] (nodes & edges for literature mapping)
       └──────────────────► [ Experiment Generator ] (grounded experimental protocols)
```

---

## 2. Directory Structure

```text
researchradar-backend/
├── app/
│   ├── main.py                     # FastAPI entry point, CORS middleware, router registration
│   ├── config.py                   # Centralized Pydantic settings & base URL auto-resolution
│   ├── api/
│   │   ├── health.py               # GET /api/health and GET /api/health/ready
│   │   ├── search.py               # GET /api/search?q=...&limit=20
│   │   ├── analysis.py             # POST /api/analyze
│   │   ├── gaps.py                 # GET /api/gaps/{gap_id}
│   │   ├── graph.py                # GET /api/graph/{analysis_id}
│   │   └── experiments.py          # POST /api/experiments
│   ├── schemas/
│   │   ├── requests.py             # AnalyzeRequest, ExperimentRequest
│   │   ├── papers.py               # Normalized Paper model, SearchResponse
│   │   ├── evidence.py             # EvidenceItem schema & verification status
│   │   ├── gaps.py                 # CandidateGap, RankedGap
│   │   ├── graph.py                # GraphNode, GraphEdge, GraphResponse
│   │   └── experiments.py          # ExperimentProposal, ExperimentResponse
│   ├── services/
│   │   ├── europe_pmc.py           # Europe PMC REST client with fallback capability
│   │   ├── paper_processor.py      # Normalization, deduplication, stable ID assignment
│   │   ├── grok_client.py          # OpenAI-compatible Async client with bounded JSON repair
│   │   ├── gap_analyzer.py         # End-to-end research gap analysis pipeline
│   │   ├── evidence_validator.py   # Normalized text matching against source abstracts
│   │   ├── gap_ranker.py           # Transparent 40/35/25 priority scoring formula
│   │   ├── graph_builder.py        # Entity relationship graph generation
│   │   └── experiment_generator.py # Grounded experimental protocol generation
│   ├── repositories/
│   │   └── analysis_repository.py  # SQLite database & memory persistence
│   └── utils/
│       ├── errors.py               # Custom exceptions and error codes
│       └── logging.py              # Safe sanitized logging utility
├── data/
│   ├── sample_papers.json          # Real verified European PMC papers for demo fallback
│   └── researchradar.db            # SQLite database (auto-created on startup)
├── tests/
│   ├── conftest.py                 # Pytest test configuration and path resolution
│   ├── test_health.py              # Health check tests
│   ├── test_paper_processing.py    # Deduplication and metadata extraction tests
│   ├── test_evidence.py            # Evidence quote matching and hallucination rejection
│   ├── test_ranking.py             # Transparent formula and threshold tests
│   ├── test_api.py                 # Full mocked API workflow and schema tests
│   └── test_live_smoke.py          # Live integration test against real APIs
├── .env.example                    # Environment variable template
├── pytest.ini                      # Pytest runner configuration
├── requirements.txt                # Python dependencies
├── run.py                          # Local server launcher
└── README.md                       # Documentation
```

---

## 3. Requirements & Environment Setup

- **Python**: 3.10+ (Tested on Python 3.14)
- **Virtual Environment**:

```bash
cd researchradar-backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate

# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### Environment Variables (`.env`)

Create a `.env` file in `researchradar-backend/` based on `.env.example`:

```ini
XAI_API_KEY=your_actual_api_key_here
XAI_BASE_URL=https://api.x.ai/v1
XAI_MODEL=openai/gpt-oss-120b

EUROPE_PMC_BASE_URL=https://www.ebi.ac.uk/europepmc/webservices/rest
REQUEST_TIMEOUT_SECONDS=25.0
MAX_PAPERS=20
MAX_ABSTRACT_CHARS=3500
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
DATABASE_URL=sqlite:///./data/researchradar.db
DEMO_MODE=false
LOG_LEVEL=INFO
```

> **Smart Base-URL Auto-Resolution**: If your API key begins with `gsk_` (Groq Cloud) and base URL is set to `https://api.x.ai/v1`, the backend automatically resolves to `https://api.groq.com/openai/v1` so you do not experience 400 Bad Request errors.

---

## 4. Running the Application

To launch the FastAPI development server:

```bash
# Using run.py:
python run.py

# Or directly with Uvicorn:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server starts at `http://127.0.0.1:8000`.
- Swagger Interactive Documentation: `http://127.0.0.1:8000/docs`
- Redoc Documentation: `http://127.0.0.1:8000/redoc`

---

## 5. Running Tests

Run the complete test suite (unit tests, mocked workflow, and live integration tests):

```bash
python -m pytest -v
```

To run only offline mocked unit tests without calling external APIs:

```bash
python -m pytest tests/test_health.py tests/test_paper_processing.py tests/test_evidence.py tests/test_ranking.py tests/test_api.py -v
```

---

## 6. API Endpoints

### 1. `GET /api/health`
Basic operational status check.
- **Response `200`**:
```json
{
  "status": "ok",
  "service": "ResearchRadar AI",
  "version": "1.0.0"
}
```

### 2. `GET /api/health/ready`
Deep readiness diagnostic checking external dependencies without leaking credentials.
- **Response `200`**:
```json
{
  "status": "ready",
  "service": "ResearchRadar AI",
  "version": "1.0.0",
  "dependencies": {
    "ai_configured": true,
    "europe_pmc_reachable": true,
    "database_ready": true
  }
}
```

### 3. `GET /api/search?q={query}&limit={limit}`
Search Europe PMC for peer-reviewed literature.
- **Query parameters**:
  - `q` (string, 3–500 chars, required)
  - `limit` (integer, 1–20, default 20)
- **Response `200`**:
```json
{
  "query": "biosensor water contamination",
  "total_returned": 5,
  "papers": [
    {
      "id": "P1",
      "paper_id": "P1",
      "title": "Constructed wetland-microbial fuel cell...",
      "authors": ["Author A", "Author B"],
      "year": 2024,
      "doi": "10.1016/j.envres.2024.108",
      "abstract": "...",
      "source_url": "https://doi.org/10.1016/j.envres.2024.108"
    }
  ],
  "warnings": []
}
```

### 4. `POST /api/analyze`
Core research gap discovery pipeline.
- **Request Body**:
```json
{
  "question": "Can low-cost biosensors reliably detect water contamination in rural communities?",
  "max_papers": 10
}
```
- **Response `200`**:
```json
{
  "analysis_id": "4b684cb3-0000-4000-8000-000000000000",
  "question": "Can low-cost biosensors reliably detect water contamination in rural communities?",
  "papers_analyzed": 5,
  "papers": [...],
  "gaps": [
    {
      "id": "G1",
      "title": "Matrix Interference and Field Biofouling Drift",
      "description": "Natural organic matter and co-existing ions cause signal attenuation in field water.",
      "why_it_matters": "Leads to false negative or inaccurate water safety assessments.",
      "supporting_paper_ids": ["P1", "P2"],
      "evidence": [
        {
          "paper_id": "P1",
          "passage": "fouling reduced sensitivity after 14 days",
          "verified": true,
          "verification_status": "verified",
          "match_detail": "Exact/normalized excerpt verified in retrieved abstract."
        }
      ],
      "limitations": ["Tested only on grab samples, not in situ continuous stream."],
      "next_research_question": "How can antifouling coatings maintain calibration stability across 30 days?",
      "evidence_strength": "strong",
      "priority": "high",
      "priority_score": 82,
      "score_explanation": "Score 82/100 computed via transparent heuristic: Evidence Support (85/100, weight 40%), Potential Impact (80/100, weight 35%), and Feasibility (80/100, weight 25%). 2 source passage(s) were verified directly against retrieved abstracts."
    }
  ],
  "warnings": []
}
```

### 5. `GET /api/gaps/{gap_id}?analysis_id={analysis_id}`
Detailed gap view with full supporting paper objects.
- **Response `200`**: Detailed gap object, supporting papers array, and provenance.
- **Response `404`**: If gap does not exist.

### 6. `GET /api/graph/{analysis_id}`
Evidence relationship graph mapping retrieved papers to candidate gaps.
- **Response `200`**:
```json
{
  "analysis_id": "4b684cb3-...",
  "nodes": [
    { "id": "P1", "type": "paper", "label": "Paper title...", "data": {...} },
    { "id": "G1", "type": "gap", "label": "Candidate gap title...", "data": {...} }
  ],
  "edges": [
    { "source": "P1", "target": "G1", "type": "supports" }
  ]
}
```

### 7. `POST /api/experiments`
Generate an experimental protocol proposal grounded in the analysis.
- **Request Body**:
```json
{
  "analysis_id": "4b684cb3-...",
  "gap_id": "G1"
}
```
- **Response `200`**:
```json
{
  "analysis_id": "4b684cb3-...",
  "gap_id": "G1",
  "experiment": {
    "research_question": "...",
    "hypothesis": "...",
    "study_design": "...",
    "sample_groups": "...",
    "experimental_conditions": "...",
    "samples_and_conditions": "...",
    "measurements": "...",
    "controls": "...",
    "analysis_method": "...",
    "safety_considerations": "Prototype biosensors must never be deployed as the sole basis for drinking water safety decisions without reference standard laboratory verification.",
    "limitations": "...",
    "supporting_paper_ids": ["P1"]
  }
}
```

---

## 7. Frontend Integration

The React frontend runs via Vite on `http://localhost:5173`.
To connect the frontend to this backend:
1. Ensure the backend is running on `http://127.0.0.1:8000`.
2. In `frontend/.env` (or environment), verify:
   ```ini
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```
3. In `frontend/`, run `npm run dev`.
4. CORS is pre-configured to allow requests from `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, and `http://127.0.0.1:3000`.
