# Build-Backend API

FastAPI backend for the medical textbook knowledge integration demo.

## Run

```bash
cd "/Users/li/Documents/New project 4"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend --port 8001
```

Default API root for this branch: <http://127.0.0.1:8001>

## Smoke Test

```bash
./backend/scripts/smoke_test.sh
```

## Core Endpoints

- `GET /health`
- `POST /api/demo/load`
- `POST /api/documents`
- `GET /api/state`
- `GET /api/dashboard`
- `POST /api/rag/query`
- `POST /api/feedback`

`/api/demo/load` reads the two smallest demo textbooks from
`/Users/li/Desktop/黑客松/textbooks` by default and only parses an MVP-sized page
window. Textbook PDFs are local inputs and must not be committed.
