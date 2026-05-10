# Frontend

React + Vite front end for the medical textbook knowledge integration agent.

## Run

```bash
cd frontend
npm ci
npm run dev -- --port 5173
```

Open <http://localhost:5173/>.

## Build

```bash
cd frontend
npm ci
npm run build
```

## API Mode

By default the page uses built-in demo data so the UI can be demonstrated before the backend is ready.

Set `VITE_API_BASE` to connect a backend that exposes:

```text
GET /api/dashboard
```

Expected top-level fields:

- `textbooks`: uploaded or parsed textbook metadata, chapter counts, chapter ranges, and character counts
- `graph`: `nodes` and `edges` for the ECharts knowledge graph
- `compression`: original characters, integrated characters, compression ratio, target, and guardrails
- `decisions`: merge / keep / remove / split decisions with reasons and confidence
- `rag`: answer plus textbook, chapter, page, relevance, and excerpt citations

The current frontend keeps working with demo data if the API is unavailable.
