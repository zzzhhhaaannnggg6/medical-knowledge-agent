FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Set RAG_EXTRAS=1 at build time to pull in sentence-transformers + faiss-cpu.
# Default image stays lightweight and ships pure-Python BM25+TF-IDF retrieval.
ARG RAG_EXTRAS=0

COPY backend/requirements.txt /app/backend/requirements.txt
COPY backend/requirements-rag.txt /app/backend/requirements-rag.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install -r /app/backend/requirements.txt \
    && if [ "$RAG_EXTRAS" = "1" ]; then \
           python -m pip install -r /app/backend/requirements-rag.txt; \
       fi

COPY backend /app/backend

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8001"]
