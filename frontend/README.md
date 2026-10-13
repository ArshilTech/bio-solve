# ResearchRadar AI — Frontend

React, Vite, and Tailwind CSS frontend for BioSolve Hackathon Problem 8.

## Run locally

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

## API integration

The frontend sends requests directly to the configured backend. No sample records or fallback analysis responses are included.

- `GET /health`
- `POST /analyze` with `{ "question": "...", "max_papers": 20 }`
- `GET /graph/{analysis_id}`
- `POST /experiments` with `{ "analysis_id": "...", "gap_id": "..." }`

The analysis response must include `analysis_id`, `question`, `papers`, and `gaps`. Optional `warnings` may be returned by the backend.

Each paper should provide the fields used by the literature cards, including `id`, `title`, `authors`, `year`, `abstract`, and `source_url` where available.

Each gap should include `id`, `title`, `description`, `why_it_matters`, `priority`, `priority_score`, `evidence_strength`, `supporting_paper_ids`, `evidence`, `limitations`, and `next_research_question` where available.

The graph endpoint should return `nodes` and `edges`. The experiment endpoint may return proposal fields directly or inside an `experiment` object.

The backend must allow requests from the frontend origin through its CORS configuration. Keep private API keys on the backend; variables prefixed with `VITE_` are exposed to browser code.
