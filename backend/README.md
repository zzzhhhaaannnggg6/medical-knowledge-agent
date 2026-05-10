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
- `GET /api/textbooks`
- `GET /api/textbooks/{textbook_id}/graph`
- `GET /api/rag/status`
- `POST /api/rag/index`
- `POST /api/rag/query`
- `POST /api/feedback`

## RAG Boundary

The default retrieval path is intentionally local and reproducible:

- chunk size: `RAG_CHUNK_SIZE=650`
- overlap: `RAG_CHUNK_OVERLAP=80`
- retrieval: character n-gram TF-IDF + BM25
- optional embedding: set `EMBEDDING_BACKEND=sentence_transformers` and install `backend/requirements-rag.txt`
- citation cleanup: obvious table-of-contents, page-number, and header lines are downranked or stripped before the API returns snippets/source chunks

This should be described as lightweight local hybrid retrieval, not as a full vector database, rerank, or LLM semantic-judgement pipeline.

## Frontend Contract

The only frontend-facing contract to keep stable is `GET /api/dashboard`.
It must return:

- `textbooks[]`: `id`, `title`, `format`, `size`, `status`, `chapterCount`, `characters`, `chapters[]`
- `textbooks[].chapters[]`: `title`, `pages`, `chars`
- `graph.nodes[]`: `id`, `name`, `category`, `textbook`, `sourceCount`, `chapter`, `pages`, `definition`
- `graph.edges[]`: `source`, `target`, `relation`
- `compression`: `originalChars`, `integratedChars`, `ratio`, `target`, `guardrails[]`
- `decisions[]`: `id`, `type`, `nodes[]`, `result`, `reason`, `confidence`, `status`
- `rag`: `question`, `answer`, `citations[]`
- `rag.citations[]`: `textbook`, `chapter`, `pages`, `relevance`, `excerpt`
- `rag.indexStatus`: `indexedTextbooks`, `totalChunks`, `embeddingBackend`, `chunkSize`, `chunkOverlap`, `noiseFilter`, `ready`

Do not add backend features during final integration. Only fix this response shape if the frontend cannot read it.

## Public Deployment Note

`/api/demo/load` reads the two smallest demo textbooks from
`/Users/li/Desktop/黑客松/textbooks` by default and only parses an MVP-sized page
window. Textbook PDFs are local inputs and must not be committed.

Because the demo backend still depends on that local textbook path, do not make
the backend a public-submission dependency yet. The submission fallback remains
the static frontend Demo deployment.
