"""RAG pipeline: sliding-window chunking + hybrid retrieval + answer generation.

Design contract (matches the hackathon brief):
- Chunking: 500–800 chars per chunk with 50–100 char overlap, metadata preserved
  (textbook, chapter, start_page, end_page).
- Retrieval: local TF-IDF (char n-gram) + BM25 hybrid, top-K; optional
  sentence-transformers embedding if EMBEDDING_BACKEND=sentence_transformers.
- Generation: prompt the LLM with strict "only use context + citations" rules
  when LLM_API_KEY is set; otherwise fall back to an extractive answer that
  still carries citations.
- Not-found response: returns "当前知识库中未找到相关信息" + empty citations.
"""

from __future__ import annotations

import json
import math
import os
import re
import time
import urllib.request
import uuid
from collections import Counter
from dataclasses import dataclass, field
from typing import Any, Iterable


CHUNK_SIZE = int(os.getenv("RAG_CHUNK_SIZE", "650"))
CHUNK_OVERLAP = int(os.getenv("RAG_CHUNK_OVERLAP", "80"))
TOP_K_DEFAULT = int(os.getenv("RAG_TOP_K", "5"))
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "local").lower()
NOT_FOUND_MESSAGE = "当前知识库中未找到相关信息"

SENTENCE_RE = re.compile(r"[^。！？!?；;\n]{8,160}[。！？!?；;]?")
WHITESPACE_RE = re.compile(r"\s+")


@dataclass
class Chunk:
    id: str
    textbook: str
    textbook_id: str
    chapter: str
    chapter_id: str
    start_page: int
    end_page: int
    page: int
    text: str
    order: int

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "textbook": self.textbook,
            "textbook_id": self.textbook_id,
            "chapter": self.chapter,
            "chapter_id": self.chapter_id,
            "start_page": self.start_page,
            "end_page": self.end_page,
            "page": self.page,
            "text": self.text,
            "order": self.order,
        }


@dataclass
class RetrievalHit:
    chunk: Chunk
    score: float
    tfidf_score: float = 0.0
    bm25_score: float = 0.0
    embedding_score: float = 0.0


def _clean(text: str) -> str:
    return WHITESPACE_RE.sub(" ", text or "").strip()


def _char_ngrams(text: str, sizes: Iterable[int] = (1, 2, 3)) -> list[str]:
    grams: list[str] = []
    # Chinese blocks: generate n-grams per contiguous block
    for block in re.findall(r"[\u4e00-\u9fff]+", text):
        for n in sizes:
            if len(block) < n:
                if n == 1:
                    grams.extend(list(block))
                continue
            grams.extend(block[i : i + n] for i in range(len(block) - n + 1))
    # Latin / numeric tokens
    grams.extend(token.lower() for token in re.findall(r"[A-Za-z0-9_]{2,}", text))
    return grams


def build_chunks(
    chapters: list[dict[str, Any]],
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    """Sliding-window chunking that preserves textbook/chapter/page metadata."""

    chunks: list[Chunk] = []
    if chunk_size < 200:
        chunk_size = 200
    if overlap < 0 or overlap >= chunk_size:
        overlap = max(0, min(overlap, chunk_size - 50))
    step = max(1, chunk_size - overlap)

    for chapter in chapters:
        text = _clean(chapter.get("text") or chapter.get("excerpt") or "")
        if not text:
            continue
        start_page = int(chapter.get("start_page", 1) or 1)
        end_page = int(chapter.get("end_page", start_page) or start_page)
        span = max(1, end_page - start_page + 1)
        textbook = chapter.get("document_title", "") or chapter.get("textbook", "")
        textbook_id = chapter.get("document_id", "")
        chapter_title = chapter.get("title", "")
        chapter_id = chapter.get("id", "")

        for order, offset in enumerate(range(0, max(1, len(text)), step)):
            window = text[offset : offset + chunk_size]
            if not window.strip():
                continue
            # Approximate the chunk's page using its relative offset.
            ratio = offset / max(1, len(text))
            page = start_page + int(min(span - 1, math.floor(ratio * span)))
            chunks.append(
                Chunk(
                    id=f"chunk_{uuid.uuid5(uuid.NAMESPACE_URL, f'{chapter_id}:{order}').hex[:12]}",
                    textbook=textbook,
                    textbook_id=textbook_id,
                    chapter=chapter_title,
                    chapter_id=chapter_id,
                    start_page=start_page,
                    end_page=end_page,
                    page=page,
                    text=window,
                    order=order,
                )
            )
            if offset + chunk_size >= len(text):
                break
    return chunks


# ---------------------------------------------------------------------------
# Vector / BM25 index
# ---------------------------------------------------------------------------


class RagIndex:
    """Hybrid char-n-gram TF-IDF + BM25 index. Pure Python, no numpy dep."""

    def __init__(
        self,
        chunks: list[Chunk],
        *,
        k1: float = 1.5,
        b: float = 0.75,
        tfidf_weight: float = 0.5,
        bm25_weight: float = 0.5,
    ):
        self.chunks = chunks
        self.k1 = k1
        self.b = b
        self.tfidf_weight = tfidf_weight
        self.bm25_weight = bm25_weight
        self.backend = "char_ngram_tfidf+bm25"
        self._embedding_model = None
        self._embedding_matrix: list[list[float]] = []

        total = len(chunks)
        self.doc_lengths = [0] * total
        self.doc_tf: list[Counter[str]] = []
        doc_freq: Counter[str] = Counter()
        length_sum = 0
        for idx, chunk in enumerate(chunks):
            tokens = _char_ngrams(chunk.text)
            tf = Counter(tokens)
            self.doc_tf.append(tf)
            self.doc_lengths[idx] = len(tokens)
            length_sum += len(tokens)
            for term in tf:
                doc_freq[term] += 1
        self.avg_length = (length_sum / total) if total else 1.0

        self.idf: dict[str, float] = {
            term: math.log((total + 1) / (freq + 1)) + 1.0
            for term, freq in doc_freq.items()
        }

        # Pre-compute TF-IDF vectors (L2 normalised) for cosine similarity.
        self.doc_vectors: list[dict[str, float]] = []
        for idx in range(total):
            tf = self.doc_tf[idx]
            length = max(1, self.doc_lengths[idx])
            vec = {term: (count / length) * self.idf.get(term, 1.0) for term, count in tf.items()}
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
            self.doc_vectors.append({term: value / norm for term, value in vec.items()})

        # Opt-in sentence-transformers embeddings.
        if EMBEDDING_BACKEND == "sentence_transformers" and total:
            try:
                from sentence_transformers import SentenceTransformer  # type: ignore

                model_name = os.getenv(
                    "EMBEDDING_MODEL",
                    "paraphrase-multilingual-MiniLM-L12-v2",
                )
                self._embedding_model = SentenceTransformer(model_name)
                matrix = self._embedding_model.encode(
                    [chunk.text for chunk in chunks],
                    normalize_embeddings=True,
                    convert_to_numpy=False,
                )
                self._embedding_matrix = [list(row) for row in matrix]
                self.backend = f"sentence_transformers({model_name})"
            except Exception as exc:  # pragma: no cover - optional path
                import sys

                print(f"[rag_pipeline] embedding fallback: {exc}", file=sys.stderr)
                self._embedding_model = None
                self._embedding_matrix = []

    # ------------------------------------------------------------------
    # retrieval helpers
    # ------------------------------------------------------------------

    def _tfidf_cosine(self, query_tokens: list[str]) -> list[float]:
        tf = Counter(query_tokens)
        length = max(1, len(query_tokens))
        q_vec = {term: (count / length) * self.idf.get(term, 1.0) for term, count in tf.items()}
        norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
        q_vec = {term: value / norm for term, value in q_vec.items()}
        scores: list[float] = []
        for doc_vec in self.doc_vectors:
            if len(q_vec) <= len(doc_vec):
                scores.append(sum(weight * doc_vec.get(term, 0.0) for term, weight in q_vec.items()))
            else:
                scores.append(sum(weight * q_vec.get(term, 0.0) for term, weight in doc_vec.items()))
        return scores

    def _bm25(self, query_tokens: list[str]) -> list[float]:
        scores = [0.0] * len(self.chunks)
        if not query_tokens:
            return scores
        unique = set(query_tokens)
        for term in unique:
            if term not in self.idf:
                continue
            idf = self.idf[term]
            for idx, tf in enumerate(self.doc_tf):
                freq = tf.get(term)
                if not freq:
                    continue
                dl = self.doc_lengths[idx]
                denom = freq + self.k1 * (1 - self.b + self.b * dl / max(1.0, self.avg_length))
                scores[idx] += idf * (freq * (self.k1 + 1)) / max(1e-6, denom)
        return scores

    def _embedding_scores(self, question: str) -> list[float]:
        if not self._embedding_model or not self._embedding_matrix:
            return []
        try:
            q_vec = self._embedding_model.encode(
                [question], normalize_embeddings=True, convert_to_numpy=False
            )[0]
            q_vec = list(q_vec)
        except Exception:  # pragma: no cover - optional path
            return []
        scores: list[float] = []
        for row in self._embedding_matrix:
            scores.append(sum(a * b for a, b in zip(q_vec, row)))
        return scores

    @staticmethod
    def _normalise(values: list[float]) -> list[float]:
        if not values:
            return values
        peak = max(values)
        if peak <= 0:
            return [0.0] * len(values)
        return [value / peak for value in values]

    def retrieve(self, question: str, top_k: int = TOP_K_DEFAULT) -> list[RetrievalHit]:
        if not self.chunks:
            return []
        q_tokens = _char_ngrams(question)
        tfidf_raw = self._tfidf_cosine(q_tokens)
        bm25_raw = self._bm25(q_tokens)
        embed_raw = self._embedding_scores(question)

        tfidf_norm = self._normalise(tfidf_raw)
        bm25_norm = self._normalise(bm25_raw)
        embed_norm = self._normalise(embed_raw)

        use_embed = bool(embed_norm)
        if use_embed:
            w_tfidf = 0.35
            w_bm25 = 0.35
            w_embed = 0.30
        else:
            w_tfidf = self.tfidf_weight
            w_bm25 = self.bm25_weight
            w_embed = 0.0

        hits: list[RetrievalHit] = []
        for idx, chunk in enumerate(self.chunks):
            combined = (
                w_tfidf * tfidf_norm[idx]
                + w_bm25 * bm25_norm[idx]
                + (w_embed * embed_norm[idx] if use_embed else 0.0)
            )
            if combined <= 0:
                continue
            hits.append(
                RetrievalHit(
                    chunk=chunk,
                    score=combined,
                    tfidf_score=tfidf_raw[idx],
                    bm25_score=bm25_raw[idx],
                    embedding_score=(embed_raw[idx] if use_embed else 0.0),
                )
            )
        hits.sort(key=lambda hit: hit.score, reverse=True)
        return hits[:top_k]


# ---------------------------------------------------------------------------
# Answer generation
# ---------------------------------------------------------------------------


ANSWER_PROMPT = """你是医学教材问答助手。以下为从教材中检索到的上下文片段，请严格遵守规则：
1. 只能基于【上下文】回答，不要使用外部知识；若上下文不足以回答，请原样输出「当前知识库中未找到相关信息」。
2. 回答结尾附引用来源列表，格式为 [教材名称, 第 X 章, 第 X 页]；可以多条。
3. 回答使用中文，不超过 200 字。

【问题】
{question}

【上下文】
{context}
"""


def _llm_available() -> bool:
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    if provider == "none":
        return False
    return bool(os.getenv("LLM_API_KEY"))


def _call_llm(prompt: str) -> str | None:
    if not _llm_available():
        return None
    try:
        base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = os.getenv("LLM_MODEL", "gpt-4o-mini")
        api_key = os.getenv("LLM_API_KEY", "")
        body = json.dumps(
            {
                "model": model,
                "temperature": 0.1,
                "messages": [
                    {
                        "role": "system",
                        "content": "你只基于用户提供的上下文回答，遇到知识外问题必须回答「当前知识库中未找到相关信息」。",
                    },
                    {"role": "user", "content": prompt},
                ],
            }
        ).encode("utf-8")
        req = urllib.request.Request(
            url=f"{base_url}/chat/completions",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        timeout = float(os.getenv("LLM_TIMEOUT", "30"))
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
        data = json.loads(raw)
        return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:  # pragma: no cover - network failures
        import sys

        print(f"[rag_pipeline] llm fallback: {exc}", file=sys.stderr)
        return None


def _best_sentence(question: str, text: str) -> str:
    sentences = SENTENCE_RE.findall(text)
    if not sentences:
        return _clean(text)[:180]
    q_tokens = set(_char_ngrams(question))
    if not q_tokens:
        return _clean(sentences[0])
    best = max(
        sentences,
        key=lambda sent: len(q_tokens & set(_char_ngrams(sent))) + len(sent) * 0.001,
    )
    return _clean(best)


def _extractive_answer(question: str, hits: list[RetrievalHit]) -> str:
    parts: list[str] = []
    for hit in hits[:2]:
        sentence = _best_sentence(question, hit.chunk.text)
        if not sentence:
            continue
        parts.append(
            f"《{hit.chunk.textbook}》{hit.chunk.chapter}第{hit.chunk.page}页提示：{sentence}"
        )
    if not parts:
        return NOT_FOUND_MESSAGE
    citation_tail = "；".join(
        f"[{hit.chunk.textbook}, {hit.chunk.chapter}, 第{hit.chunk.page}页]"
        for hit in hits[:3]
    )
    return "；".join(parts) + f"。 引用：{citation_tail}"


def _build_context_block(hits: list[RetrievalHit]) -> str:
    lines: list[str] = []
    for idx, hit in enumerate(hits, start=1):
        lines.append(
            f"[{idx}] 《{hit.chunk.textbook}》{hit.chunk.chapter} 第{hit.chunk.page}页：{hit.chunk.text}"
        )
    return "\n".join(lines)


def generate_answer(question: str, hits: list[RetrievalHit]) -> str:
    if not hits:
        return NOT_FOUND_MESSAGE
    context = _build_context_block(hits)
    llm_text = _call_llm(ANSWER_PROMPT.format(question=question, context=context))
    if llm_text:
        return llm_text
    return _extractive_answer(question, hits)


def format_hits_for_api(hits: list[RetrievalHit]) -> tuple[list[dict[str, Any]], list[str]]:
    """Return spec-compliant citations + source_chunks."""

    citations: list[dict[str, Any]] = []
    source_chunks: list[str] = []
    peak = max((hit.score for hit in hits), default=1.0) or 1.0
    for hit in hits:
        chunk = hit.chunk
        citations.append(
            {
                "textbook": chunk.textbook,
                "chapter": chunk.chapter,
                "page": chunk.page,
                "relevance_score": round(min(1.0, hit.score / peak), 3),
                # Back-compat fields consumed by existing frontend paths.
                "document_title": chunk.textbook,
                "chapter_title": chunk.chapter,
                "relevance": round(min(1.0, hit.score / peak), 3),
                "snippet": _clean(chunk.text)[:180],
                "chunk_id": chunk.id,
                "start_page": chunk.start_page,
                "end_page": chunk.end_page,
            }
        )
        source_chunks.append(chunk.text)
    return citations, source_chunks


def not_found_response(question: str) -> dict[str, Any]:
    return {
        "question": question,
        "found": False,
        "answer": NOT_FOUND_MESSAGE,
        "citations": [],
        "source_chunks": [],
    }


def index_status(index: RagIndex | None) -> dict[str, Any]:
    if not index or not index.chunks:
        return {
            "indexed_textbooks": 0,
            "total_chunks": 0,
            "embedding_backend": EMBEDDING_BACKEND,
            "chunk_size": CHUNK_SIZE,
            "chunk_overlap": CHUNK_OVERLAP,
            "ready": False,
        }
    textbooks = {chunk.textbook for chunk in index.chunks if chunk.textbook}
    return {
        "indexed_textbooks": len(textbooks),
        "total_chunks": len(index.chunks),
        "embedding_backend": index.backend,
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "ready": True,
    }


def build_rag_state(chapters: list[dict[str, Any]]) -> tuple[RagIndex, list[Chunk], dict[str, Any]]:
    chunks = build_chunks(chapters)
    index = RagIndex(chunks)
    status = index_status(index)
    status["last_built_at"] = int(time.time())
    return index, chunks, status
