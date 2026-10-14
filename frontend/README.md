# ResearchRadar AI — Web Application Frontend 🖥️✨

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide-React-F05032?style=for-the-badge)](https://lucide.dev/)

The interactive web dashboard for **ResearchRadar AI**, built for **BioSolve Hackathon Problem Statement 8 (AI Research Gap Finder)**. Designed with a modern, high-contrast bio-sensing aesthetic (deep emeralds, mint accents and clean scientific typography) that makes exploring complex literature and research gaps intuitive and visual.

---

## 🎨 UI Architecture & Views

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ResearchRadar AI Web UI                           │
├───────────────┬─────────────────────────────────────────────────────────────┤
│ 🛰️ Overview   │ Discovery Composer, Sample Inquiries & Animated Radar State │
│ 🔍 Gaps       │ Ranked Knowledge Gaps, Priority Badges, Quote Verification  │
│ 📚 Literature │ Europe PMC Corpus Cards, Abstract Modal & Direct Search     │
│ 🕸️ Graph      │ Interactive Visual Topology: Question ──► Gaps ──► Papers   │
│ 🧪 Experiment │ Wet-Lab Protocol Studio (Hypothesis, Controls, Metrics)     │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

### 1. 🛰️ Discovery Composer & Radar Scanner
- Provides an intuitive search input with pre-loaded scientific prompts focusing on water contamination, biosensors and heavy metal detection.
- Features selectable corpus sizing (`5 papers` for fast scanning, `10 papers` for balanced inquiry, `15 papers` for deep synthesis).
- Displays a real-time animated **Radar Scanner** while the backend queries Europe PMC and verifies quotes against abstracts.

### 2. 🔍 Ranked Research Gaps
- Interactive cards displaying discovered knowledge gaps ordered by their transparent heuristic score ($S = 0.40E + 0.35I + 0.25F$).
- Includes filter tabs to sort by **Priority Score** or **Supporting Evidence Volume**.
- Expandable detail view revealing **Why It Matters**, **Literature Limitations**, **Next Research Question** and **Verified Quote Passages** with verified checkmarks.

### 3. 🕸️ Interactive Evidence Graph
- Visualizes the relationship network connecting the central research question, discovered gaps, and supporting literature nodes.
- Helps researchers and evaluators spot knowledge clusters and under-researched areas at a glance.

### 4. 📚 Literature Corpus Explorer
- Browse the papers retrieved for the current analysis session.
- Real-time client-side keyword filtering across titles, authors and abstracts.
- Deep modal view displaying full abstract text and direct clickable DOI links to Europe PMC.
- Direct search bar allowing ad-hoc searches against Europe PMC.

### 5. 🧪 Grounded Experiment Studio
- Closes the scientific loop by synthesizing a testable experimental protocol from any discovered gap.
- Formats structured wet-lab / field designs including **Objective**, **Hypothesis**, **Study Design**, **Controls**, **Quantitative Readouts**, and **Safety Pitfalls**.

---

## 📂 Component Structure

```text
frontend/src/
├── App.jsx                            # Main state coordinator & view router
├── main.jsx                           # Application entry point
├── index.css                          # Tailwind directives & custom animations
│
├── components/
│   ├── common/                        # Reusable atomic UI elements
│   │   ├── Button.jsx                 # Styled accessible button
│   │   ├── EmptyState.jsx             # Clean fallback views
│   │   ├── PageTitle.jsx              # Standard page header
│   │   ├── SectionHeading.jsx         # Subsection typography
│   │   └── Tag.jsx                    # Pill tags (High/Med/Low priority, etc.)
│   │
│   ├── layout/                        # Shell layout components
│   │   ├── Header.jsx                 # Top bar with status and query trigger
│   │   └── Sidebar.jsx                # Collapsible navigation & session history
│   │
│   ├── research/                      # Gap analysis & discovery
│   │   ├── DiscoveryComposer.jsx      # Query input & preset questions
│   │   ├── RadarScanner.jsx           # Animated radar scanning state
│   │   ├── StatCard.jsx               # Metric summary cards
│   │   ├── GapCard.jsx                # Ranked gap summary card
│   │   └── GapDetailView.jsx          # Deep evidence & quote inspection
│   │
│   ├── papers/                        # Literature corpus components
│   │   ├── PaperCard.jsx              # Paper citation card with DOI badge
│   │   └── PaperDetailModal.jsx       # Full abstract & author viewer modal
│   │
│   ├── graph/                         # Network visualization
│   │   └── EvidenceGraph.jsx          # Interactive relationship network
│   │
│   └── experiments/                   # Actionable protocol viewer
│       └── ExperimentView.jsx         # Structured protocol display
│
└── lib/
    └── api.js                         # Typed API client connecting to backend
```

---

## 🚀 Getting Started

### 1. Installation

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed:

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` root (a template is provided in `.env.example`):

```ini
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

> **Note:** Variables prefixed with `VITE_` are bundled into client-side code. Do not store private API keys here; all LLM credentials are securely kept on the backend.

### 3. Development Server

Start the local Vite dev server:

```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite dev server with instant Hot Module Replacement (HMR). |
| `npm run build` | Compiles and optimizes assets into the `dist/` directory for production. |
| `npm run preview` | Locally serves the production build from `dist/` for testing. |

---

## 🔗 Backend Contract & Communication

The frontend communicates with the FastAPI backend through `src/lib/api.js`:

| Action | API Route | Description |
| :--- | :--- | :--- |
| Health Check | `GET /api/health` | Verifies backend connectivity on initial load |
| Gap Analysis | `POST /api/analyze` | Initiates Europe PMC retrieval & gap extraction |
| Evidence Graph | `GET /api/graph/{id}` | Fetches graph nodes and edges for network view |
| Protocol Design | `POST /api/experiments` | Synthesizes experimental protocol for a gap |
| Direct Search | `GET /api/search?q=...` | Ad-hoc query against Europe PMC literature |
| Session Sync | `GET /api/analyses` | Retrieves past analyses from SQLite for persistence |

---

## 🎨 Design Principles

- **Bio-Sensing Color Palette:** Uses deep moss green (`#0c2e27`), emerald accents (`#10b981`), and mint highlights (`#34d399`) tailored for environmental and biological technology.
- **Glassmorphism & Contrast:** Subtle borders, backdrop blur and dark-card accents for clarity.
- **Micro-Interactions:** Smooth scale transitions on cards, active hover feedback and pulse indicators on verified badges.
