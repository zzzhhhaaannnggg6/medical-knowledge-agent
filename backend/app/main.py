from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .models import DocumentLoadRequest, FeedbackRequest, RagQuery
from .pipeline import DEFAULT_DEMO_PATHS, KnowledgePipeline
from .storage import JsonStateStore

APP_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = APP_ROOT / "data"
UPLOAD_DIR = DATA_DIR / "uploads"

store = JsonStateStore(DATA_DIR / "state.json")
pipeline = KnowledgePipeline(store)

app = FastAPI(
    title="Medical Knowledge Integration Backend",
    version="0.1.0",
    description="FastAPI backend for parsing textbooks, building a graph, merging knowledge, RAG, and teacher feedback.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "medical-knowledge-backend",
        "storage": str(store.path),
    }


@app.post("/api/demo/load")
def load_demo(request: DocumentLoadRequest | None = None) -> dict[str, Any]:
    payload = request or DocumentLoadRequest()
    paths = payload.paths or [str(path) for path in DEFAULT_DEMO_PATHS]
    try:
        return pipeline.load_documents(paths, max_pages_per_document=payload.max_pages_per_document)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/documents")
async def load_documents(request: Request) -> dict[str, Any]:
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        form = await request.form()
        max_pages = int(form.get("max_pages_per_document", 40))
        files = form.getlist("files")
        if not files:
            raise HTTPException(status_code=400, detail="No uploaded files were provided.")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        paths: list[str] = []
        for item in files:
            filename = Path(getattr(item, "filename", "")).name
            if not filename:
                continue
            suffix = Path(filename).suffix.lower()
            if suffix not in {".pdf", ".md", ".txt"}:
                raise HTTPException(status_code=400, detail=f"Unsupported file format: {filename}")
            target = UPLOAD_DIR / filename
            with target.open("wb") as output:
                shutil.copyfileobj(item.file, output)
            paths.append(str(target))

        if not paths:
            raise HTTPException(status_code=400, detail="No valid PDF/MD/TXT files were uploaded.")
        try:
            return pipeline.load_documents(paths, max_pages_per_document=max_pages)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    body = await request.body()
    payload = DocumentLoadRequest()
    if body:
        payload = DocumentLoadRequest.model_validate_json(body)
    paths = payload.paths or [str(path) for path in DEFAULT_DEMO_PATHS]
    try:
        return pipeline.load_documents(paths, max_pages_per_document=payload.max_pages_per_document)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/state")
def get_state() -> dict[str, Any]:
    return store.load()


@app.post("/api/rag/query")
def query_rag(query: RagQuery) -> dict[str, Any]:
    return pipeline.answer_question(query.question, top_k=query.top_k)


@app.post("/api/feedback")
def apply_feedback(feedback: FeedbackRequest) -> dict[str, Any]:
    try:
        return pipeline.apply_feedback(feedback)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
