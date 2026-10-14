# ResearchRadar AI 🔬🛰️
### Evidence-Backed Scientific Research Gap Discovery & Protocol Synthesis Platform

[![BioSolve Hackathon](https://img.shields.io/badge/BioSolve%20Hackathon-Problem%20Statement%208-emerald?style=for-the-badge)](https://github.com/ArshilTech/bio-solve)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Europe PMC](https://img.shields.io/badge/Europe_PMC-Live_API-orange?style=for-the-badge)](https://europepmc.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

Modern scientific literature expands faster than human researchers can read. Traditional literature reviews are slow, susceptible to confirmation bias and standard LLMs frequently hallucinate nonexistent citations and unsupported claims.

**ResearchRadar AI** solves this for **BioSolve Hackathon Problem Statement 8 (AI Research Gap Finder)**. It connects real-time peer-reviewed literature across **water contamination, water-quality monitoring, biosensors and environmental research** with an automated, anti-hallucination analysis pipeline. 

Instead of generating ungrounded ideas, ResearchRadar AI identifies what science **has not answered yet**, mathematically ranks each gap with verified supporting citations, maps the evidence visually and generates publication-ready experimental test protocols.

---

## ✨ Key Innovations & Features

| Capability | How ResearchRadar AI Delivers It |
| :--- | :--- |
| 📚 **Live Literature Ingestion** | Real-time querying against **Europe PMC REST API**; no stale scraped datasets. Retrieves real titles, authors, DOIs and abstracts. |
| 🛡️ **Anti-Hallucination Quote Validator** | Every supporting quote attributed to a paper is strictly verified via normalized substring & sentence matching against the retrieved abstract. |
| ⚖️ **Explainable Mathematical Ranking** | Gaps are scored through a transparent formula ($S = 0.40E + 0.35I + 0.25F$) balancing evidence volume, scientific impact and technical feasibility. |
| 🕸️ **Interactive Evidence Graph** | Visual network mapping research questions, candidate gaps, and supporting literature nodes to reveal knowledge clusters. |
| 🧪 **Grounded Experiment Synthesizer** | Closes the scientific loop by drafting complete experimental protocols (Hypothesis, Controls, Methodology, Metrics and Pitfalls). |
| 💾 **Persistent SQLite Storage** | Every query, corpus, gap score and experiment is archived and instantly recallable across sessions. |

---

## 🏛️ System Architecture

```text
                                [ User Research Query ]
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │  Vite / React UI     │
                               │  (Modern Dashboard)  │
                               └──────────┬───────────┘
                                          │  REST API
                                          ▼
                               ┌──────────────────────┐
                               │ FastAPI Backend Svc  │
                               └──────────┬───────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
┌────────────────┐               ┌────────────────┐                ┌────────────────┐
│   Europe PMC   │               │   Grok / xAI   │                │ Evidence Check │
│   REST API     │               │   Reasoning    │                │  & Verification│
│ (Real Papers)  │               │ (Gap Extraction│                │ (Abstract Match│
└───────┬────────┘               └────────┬───────┘                └────────┬───────┘
        │                                 │                                 │
        └────────────────────────► [ Paper Processor ] ◄────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │  Gap Ranking Engine  │
                              │ 40% E + 35% I + 25% F│
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         ┌─────────────────────┐                   ┌─────────────────────┐
         │ Evidence Graph View │                   │ Protocol Synthesizer│
         │  (Network Topology) │                   │ (Actionable Studies)│
         └─────────────────────┘                   └─────────────────────┘
```

---

## 📂 Project Repository Structure

```text
bio-solve/
├── README.md                          # Repository root documentation (You are here)
├── LICENSE                            # Open source MIT license
│
├── frontend/                          # React + Vite + Tailwind CSS web dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                # Badges, buttons, modals, page headings
│   │   │   ├── experiments/           # Experimental protocol viewer & printer
│   │   │   ├── graph/                 # Interactive SVG/Canvas evidence network graph
│   │   │   ├── layout/                # Sidebar, header, responsive navigation
│   │   │   ├── papers/                # Literature cards, DOI links, abstract modal
│   │   │   └── research/              # Radar scanner, gap cards, detail inspection
│   │   ├── lib/api.js                 # Axios/Fetch client connecting to FastAPI backend
│   │   ├── App.jsx                    # Root state coordinator and tab router
│   │   ├── index.css                  # Modern Tailwind typography and animations
│   │   └── main.jsx                   # React 18 DOM mount point
│   ├── index.html                     # HTML5 shell with Google Inter font
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite bundler configuration
│   └── README.md                      # Dedicated frontend guide
│
└── researchradar-backend/             # FastAPI asynchronous backend application
    ├── app/
    │   ├── main.py                    # Application lifecycle, CORS, route registry
    │   ├── config.py                  # Pydantic BaseSettings & auto URL resolution
    │   ├── api/                       # API route endpoints (/health, /analyze, etc.)
    │   ├── schemas/                   # Pydantic validation models & JSON schemas
    │   ├── services/                  # Core services (Europe PMC, Grok, Ranker, Graph)
    │   ├── repositories/              # SQLite analysis & corpus persistence
    │   └── utils/                     # Sanitized logging and custom exceptions
    ├── data/                          # SQLite DB & offline verified demo fallbacks
    ├── tests/                         # Pytest test suite (health, parser, ranking, live)
    ├── requirements.txt               # Backend Python dependencies
    ├── run.py                         # Local server runner
    └── README.md                      # Dedicated backend architecture guide
```

---

## ⚡ Quick Start Guide

Follow these instructions to run the complete stack locally on your machine.

### Prerequisites
- **Node.js**: v18.0 or newer
- **Python**: v3.10 or newer (tested on 3.10, 3.11, 3.12, 3.14)
- **API Key**: Grok / xAI key (or Groq Cloud key starting with `gsk_`)

---

### 1. Launch the Backend Service

```bash
# 1. Navigate to the backend directory
cd researchradar-backend

# 2. Create and activate a Python virtual environment
# On Windows:
python -m venv .venv
.venv\Scripts\activate

# On Linux / macOS:
# python3 -m venv .venv
# source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment configuration
# Copy template:
cp .env.example .env
```

Open `.env` in your editor and add your key:
```ini
XAI_API_KEY=your_actual_api_key_here
XAI_BASE_URL=https://api.x.ai/v1
XAI_MODEL=openai/gpt-oss-120b
```

> **Smart Resolution:** If you use a Groq API key (`gsk_...`), the backend automatically detects it and connects to `https://api.groq.com/openai/v1` without configuration issues.

```bash
# 5. Start the FastAPI backend server
python run.py
```
* Backend runs at: `http://127.0.0.1:8000`
* Swagger UI Docs: `http://127.0.0.1:8000/docs`

---

### 2. Launch the Frontend Application

Open a new terminal window:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```

* Frontend dashboard opens at: **`http://localhost:5173`**

---

## 🧪 How to Test & Demo the Platform

### Recommended Test Query:
```text
Can low-cost biosensors reliably detect water contamination in rural communities?
```

### Guided Walkthrough (6-Step Flow):

```text
[ 1. Overview Input ] ──────► Enter query & choose corpus size (5–15 papers)
          │
          ▼
[ 2. Radar Scanner ]  ──────► Live Europe PMC retrieval & evidence verification
          │
          ▼
[ 3. Ranked Gaps ]    ──────► View scored gaps with formula breakdown (0–100)
          │
          ▼
[ 4. Evidence Modal ] ──────► Inspect green VERIFIED quote badges from real abstracts
          │
          ▼
[ 5. Evidence Graph ] ──────► Explore interactive visual network of papers & gaps
          │
          ▼
[ 6. Experiment Lab ] ──────► One-click generation of wet-lab / field protocol
```

---

## 📊 Priority Ranking Formula

Candidate research gaps are evaluated using a transparent, multi-factor scoring formula:

$$\text{Priority Score} = \frac{0.40 \cdot E + 0.35 \cdot I + 0.25 \cdot F}{100}$$

* **$E$ (Evidence Support, 40%):** Volume and density of verified quotes in peer-reviewed abstracts. Gaps with verified citations are ranked significantly higher.
* **$I$ (Potential Impact, 35%):** Value to real-world environmental health, public drinking water safety, and clinical bio-sensing.
* **$F$ (Technical Feasibility, 25%):** Whether the open question can realistically be tested with modern bioanalytical instrumentation.

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Operational health check |
| `GET` | `/api/health/ready` | Deep readiness check (AI key, Europe PMC status, DB) |
| `GET` | `/api/search?q=...` | Direct search across Europe PMC database |
| `POST` | `/api/analyze` | Core gap discovery pipeline (fetches papers, extracts gaps, ranks) |
| `GET` | `/api/gaps/{id}` | Detailed gap view with complete provenance |
| `GET` | `/api/graph/{id}` | Graph nodes and edges for network topology visualization |
| `POST` | `/api/experiments` | Synthesizes actionable experimental study design |

Interactive documentation is available at [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs).

---

## 🧪 Running Automated Tests

To run the backend test suite:

```bash
cd researchradar-backend
python -m pytest -v
```

This verifies:
1. Health and readiness endpoints (`test_health.py`)
2. Europe PMC paper deduplication and normalization (`test_paper_processing.py`)
3. Strict anti-hallucination quote validator (`test_evidence.py`)
4. Deterministic gap ranking calculations (`test_ranking.py`)
5. Full mocked end-to-end workflow (`test_api.py`)

---

## 🤝 Problem Statement Alignment (BioSolve Hackathon)

| Requirement | Implementation in ResearchRadar AI |
| :--- | :--- |
| **Real Scientific Ingestion** | Integrated with Europe PMC REST API with full metadata and DOI traceability. |
| **Domain Relevance** | Optimized for water contamination, biofouling, heavy metal detection and environmental biosensors. |
| **Explainable Output** | Every gap discloses *Why It Matters*, *Prior Limitations*, *Next Question* and exact supporting quotes. |
| **Actionable Insights** | Automated synthesis of testable experimental protocols with positive/negative controls. |
| **Production Architecture** | Decoupled client-server design, asynchronous processing, persistent SQLite database and comprehensive test coverage. |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
