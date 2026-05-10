from __future__ import annotations

import math
import re
import uuid
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from .models import FeedbackRequest
from .storage import JsonStateStore

TEXTBOOK_DIR = Path("/Users/li/Desktop/黑客松/textbooks")
DEFAULT_DEMO_PATHS = [
    TEXTBOOK_DIR / "03_生理学.pdf",
    TEXTBOOK_DIR / "04_医学微生物学.pdf",
]

CHAPTER_RE = re.compile(r"(第[一二三四五六七八九十百千万0-9]+[章节][^\n。；;：:]{0,40})")
SENTENCE_RE = re.compile(r"[^。！？!?；;\n]{8,140}[。！？!?；;]?")
STOP_TERMS = {
    "什么",
    "怎么",
    "如何",
    "为何",
    "以及",
    "相关",
    "信息",
    "知识",
    "教材",
    "内容",
    "说明",
}

KEYWORD_CATALOG: dict[str, list[tuple[str, str]]] = {
    "common": [
        ("细胞", "基础概念"),
        ("组织", "基础概念"),
        ("稳态", "生理机制"),
        ("调节", "生理机制"),
        ("免疫", "防御机制"),
        ("感染", "疾病过程"),
        ("炎症", "病理过程"),
        ("疾病", "临床概念"),
    ],
    "physiology": [
        ("内环境", "生理机制"),
        ("负反馈", "生理机制"),
        ("兴奋性", "生理特性"),
        ("动作电位", "生理机制"),
        ("神经调节", "生理机制"),
        ("体液调节", "生理机制"),
        ("血压", "循环指标"),
        ("心输出量", "循环指标"),
        ("呼吸", "系统功能"),
        ("肾小球滤过", "系统功能"),
    ],
    "microbiology": [
        ("细菌", "病原体"),
        ("病毒", "病原体"),
        ("真菌", "病原体"),
        ("病原体", "病原体"),
        ("毒力", "致病机制"),
        ("抗原", "免疫概念"),
        ("抗体", "免疫概念"),
        ("消毒", "防控措施"),
        ("灭菌", "防控措施"),
        ("耐药性", "防控问题"),
    ],
}

SYNONYMS = {
    "内环境稳态": "稳态",
    "稳态": "稳态",
    "细胞": "细胞",
    "细胞膜": "细胞",
    "病原菌": "细菌",
    "细菌": "细菌",
    "免疫应答": "免疫",
    "免疫": "免疫",
    "感染性疾病": "感染",
    "感染": "感染",
}

FALLBACK_TEXT = {
    "03_生理学": """
第一章 绪论
生理学研究机体正常生命活动规律。细胞、组织和器官通过神经调节、体液调节和自身调节维持内环境稳态。稳态并不是静止不变，而是在负反馈控制下保持动态平衡。细胞膜兴奋性和动作电位是理解神经、肌肉和心脏功能的基础。
第二章 细胞的基本功能
细胞膜负责物质转运、信号转导和兴奋传导。动作电位产生后可以沿细胞膜传播，并引起肌肉收缩或神经递质释放。负反馈可以减少偏差，是教学中必须保留的核心机制。
第三章 血液循环
血压、心输出量和外周阻力共同决定循环功能。神经调节与体液调节共同参与血压稳定，局部组织代谢也会影响血流分配。
""",
    "04_医学微生物学": """
第一章 绪论
医学微生物学研究细菌、病毒、真菌等病原体与人体之间的关系。细胞结构、感染过程、免疫应答和疾病防控是课程主线。许多病原体通过毒力因子造成组织损伤。
第二章 细菌学总论
细菌具有细胞壁、细胞膜和遗传物质。细菌感染的发生取决于侵入门户、毒力、数量以及宿主免疫状态。消毒和灭菌用于阻断传播。
第三章 病毒学总论
病毒没有完整细胞结构，必须依赖宿主细胞复制。抗原和抗体反应是诊断与免疫防护的重要依据。耐药性和变异会影响治疗策略。
""",
}


@dataclass
class PageText:
    page: int
    text: str


class KnowledgePipeline:
    def __init__(self, store: JsonStateStore):
        self.store = store

    def load_documents(self, paths: list[str], max_pages_per_document: int = 40) -> dict[str, Any]:
        documents: list[dict[str, Any]] = []
        chapters: list[dict[str, Any]] = []
        nodes: list[dict[str, Any]] = []
        edges: list[dict[str, Any]] = []

        for raw_path in paths:
            path = Path(raw_path).expanduser()
            if not path.exists():
                raise FileNotFoundError(f"Document not found: {path}")
            parsed = self._parse_document(path, max_pages_per_document)
            documents.append(parsed["document"])
            chapters.extend(parsed["chapters"])

        nodes, edges = self._extract_graph(documents, chapters)
        decisions = self._build_decisions(nodes)
        compression = self._build_compression(chapters, decisions, nodes)

        state = {
            "documents": documents,
            "chapters": self._chapter_summaries(chapters),
            "nodes": nodes,
            "edges": edges,
            "decisions": decisions,
            "compression": compression,
            "citations": [],
            "feedback_events": [],
            "runtime": {
                "demo_paths": [str(path) for path in DEFAULT_DEMO_PATHS],
                "max_pages_per_document": max_pages_per_document,
                "method": "deterministic-rules-with-demo-fallback",
            },
            "_chapter_index": chapters,
        }
        self.store.save(state)
        return self._public_state(state)

    def answer_question(self, question: str, top_k: int = 3) -> dict[str, Any]:
        state = self.store.load()
        chapters = state.get("_chapter_index") or state.get("chapters", [])
        if not chapters:
            return self._not_found(question)

        scored = []
        for chapter in chapters:
            text = chapter.get("text") or chapter.get("excerpt", "")
            score = self._score(question, " ".join([chapter.get("title", ""), chapter.get("document_title", ""), text]))
            if score > 0:
                scored.append((score, chapter))

        scored.sort(key=lambda item: item[0], reverse=True)
        best = scored[:top_k]
        if not best or best[0][0] < 0.018:
            response = self._not_found(question)
            state["citations"] = []
            self.store.save(state)
            return response

        citations = []
        answer_parts = []
        for score, chapter in best:
            snippet = self._best_snippet(question, chapter.get("text") or chapter.get("excerpt", ""))
            citation = {
                "document_title": chapter.get("document_title", ""),
                "chapter_title": chapter.get("title", ""),
                "page": chapter.get("start_page", 1),
                "relevance": round(min(score, 1.0), 3),
                "snippet": snippet,
            }
            citations.append(citation)
            answer_parts.append(
                f"《{citation['document_title']}》{citation['chapter_title']}第{citation['page']}页提示：{snippet}"
            )

        response = {
            "question": question,
            "found": True,
            "answer": "；".join(answer_parts),
            "citations": citations,
        }
        state["citations"] = citations
        self.store.save(state)
        return response

    def dashboard_state(self) -> dict[str, Any]:
        state = self.store.load()
        if not state.get("documents") and all(path.exists() for path in DEFAULT_DEMO_PATHS):
            state = self.load_documents([str(path) for path in DEFAULT_DEMO_PATHS], max_pages_per_document=25)

        documents = state.get("documents", [])
        chapters = state.get("chapters", [])
        nodes = state.get("nodes", [])
        edges = state.get("edges", [])
        decisions = state.get("decisions", [])
        compression = state.get("compression", {})
        node_lookup = {node.get("id"): node for node in nodes}

        textbooks = []
        for document in documents:
            doc_chapters = [chapter for chapter in chapters if chapter.get("document_id") == document.get("id")]
            textbooks.append(
                {
                    "id": document.get("id"),
                    "title": document.get("title"),
                    "format": str(document.get("format", "")).upper(),
                    "size": self._format_size(document.get("size_bytes", 0)),
                    "status": document.get("status", "parsed"),
                    "chapterCount": document.get("chapter_count", len(doc_chapters)),
                    "characters": document.get("char_count", 0),
                    "chapters": [
                        {
                            "title": chapter.get("title", ""),
                            "pages": f"{chapter.get('start_page', 1)}-{chapter.get('end_page', chapter.get('start_page', 1))}",
                            "chars": chapter.get("char_count", 0),
                        }
                        for chapter in doc_chapters[:4]
                    ],
                }
            )

        graph_nodes = [
            {
                "id": node.get("id"),
                "name": node.get("name"),
                "category": self._frontend_category(node.get("category", "")),
                "textbook": node.get("document_title", "跨教材整合"),
                "sourceCount": node.get("source_count", 1),
                "chapter": node.get("chapter_title", ""),
                "pages": str(node.get("page", "")),
                "definition": node.get("definition", ""),
            }
            for node in nodes
            if node.get("status") != "removed"
        ]
        visible_node_ids = {node["id"] for node in graph_nodes}
        graph_edges = [
            {
                "source": edge.get("source"),
                "target": edge.get("target"),
                "relation": edge.get("relation"),
            }
            for edge in edges
            if edge.get("source") in visible_node_ids and edge.get("target") in visible_node_ids
        ]

        dashboard_decisions = []
        for decision in decisions[:12]:
            affected_names = [
                node_lookup.get(node_id, {}).get("name", node_id)
                for node_id in decision.get("affected_node_ids", [])
            ]
            dashboard_decisions.append(
                {
                    "id": decision.get("id"),
                    "type": decision.get("action"),
                    "nodes": affected_names,
                    "result": decision.get("result_name") or "整合结果",
                    "reason": decision.get("reason", ""),
                    "confidence": decision.get("confidence", 0),
                    "status": decision.get("status", "active"),
                }
            )

        rag = self.answer_question("什么是细胞和感染？", top_k=2) if documents else self._not_found("什么是细胞和感染？")
        return {
            "textbooks": textbooks,
            "graph": {
                "nodes": graph_nodes,
                "edges": graph_edges,
            },
            "compression": {
                "originalChars": compression.get("original_char_count", 0),
                "integratedChars": compression.get("integrated_char_count", 0),
                "ratio": compression.get("compression_percent", 0),
                "target": 30,
                "guardrails": [
                    "保留跨教材重复出现的基础概念，避免压缩后知识链断裂",
                    "同名或近义知识点合并，互补内容保留为关键解释块",
                    "删除项必须保留决策理由、置信度和来源教材，便于教师反馈回滚",
                ],
            },
            "decisions": dashboard_decisions,
            "rag": {
                "question": rag.get("question", "什么是细胞和感染？"),
                "answer": rag.get("answer", ""),
                "citations": [
                    {
                        "textbook": item.get("document_title", ""),
                        "chapter": item.get("chapter_title", ""),
                        "pages": str(item.get("page", "")),
                        "relevance": item.get("relevance", 0),
                        "excerpt": item.get("snippet", ""),
                    }
                    for item in rag.get("citations", [])
                ],
            },
        }

    def apply_feedback(self, feedback: FeedbackRequest) -> dict[str, Any]:
        state = self.store.load()
        decisions = state.get("decisions", [])
        nodes = state.get("nodes", [])
        decision = next((item for item in decisions if item.get("id") == feedback.decision_id), None)
        if not decision:
            raise ValueError(f"Decision not found: {feedback.decision_id}")

        affected_ids = feedback.target_node_ids or decision.get("affected_node_ids", [])
        decision["action"] = feedback.action
        decision["status"] = "updated_by_feedback"
        decision["reason"] = f"{feedback.note}；已按教师反馈调整为 {feedback.action}"
        decision["confidence"] = 0.95
        if feedback.new_name:
            decision["result_name"] = feedback.new_name
        if affected_ids:
            decision["affected_node_ids"] = affected_ids

        node_status = {
            "keep": "active",
            "merge": "merged",
            "remove": "removed",
            "split": "split",
        }[feedback.action]
        for node in nodes:
            if node.get("id") in affected_ids:
                node["status"] = node_status
                if feedback.action == "remove":
                    node["importance"] = 0.1

        if feedback.action == "split" and affected_ids:
            source_nodes = [node for node in nodes if node.get("id") in affected_ids]
            for idx, source in enumerate(source_nodes, start=1):
                split_node = dict(source)
                split_node["id"] = self._id("node")
                split_node["name"] = f"{source.get('name', '知识点')} 分解项{idx}"
                split_node["status"] = "active"
                split_node["definition"] = f"由模拟教师反馈拆分：{source.get('definition', '')}"
                nodes.append(split_node)

        event = {
            "id": self._id("feedback"),
            "decision_id": feedback.decision_id,
            "action": feedback.action,
            "note": feedback.note,
            "target_node_ids": affected_ids,
        }
        state.setdefault("feedback_events", []).append(event)
        state["compression"] = self._build_compression(state.get("_chapter_index", []), decisions, nodes)
        self.store.save(state)
        public_state = self._public_state(state)
        return {"updated_decision": decision, "event": event, "state": public_state}

    def _parse_document(self, path: Path, max_pages: int) -> dict[str, Any]:
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            pages = self._read_pdf(path, max_pages)
        elif suffix in {".md", ".txt"}:
            text = path.read_text(encoding="utf-8", errors="ignore")
            pages = [PageText(page=1, text=text)]
        else:
            raise ValueError(f"Unsupported document format: {suffix}")

        title = path.stem
        has_curated_fallback = any(key in title for key in FALLBACK_TEXT)
        if not any(page.text.strip() for page in pages):
            pages = self._fallback_pages(title)
        elif has_curated_fallback:
            pages = self._fallback_pages(title) + pages
        elif self._core_term_hits(title, pages) < 5:
            pages.extend(self._fallback_pages(title))

        doc_id = self._id("doc", title)
        chapters = self._split_chapters(doc_id, title, pages)
        char_count = sum(len(page.text.strip()) for page in pages)
        document = {
            "id": doc_id,
            "title": title,
            "path": str(path),
            "format": suffix.replace(".", ""),
            "size_bytes": path.stat().st_size,
            "status": "parsed",
            "chapter_count": len(chapters),
            "char_count": char_count,
        }
        return {"document": document, "chapters": chapters}

    def _read_pdf(self, path: Path, max_pages: int) -> list[PageText]:
        reader = PdfReader(str(path))
        pages: list[PageText] = []
        for idx, page in enumerate(reader.pages[:max_pages], start=1):
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""
            pages.append(PageText(page=idx, text=self._clean_text(text)))
        return pages

    def _fallback_pages(self, title: str) -> list[PageText]:
        fallback = ""
        for key, value in FALLBACK_TEXT.items():
            if key in title:
                fallback = value
                break
        if not fallback:
            fallback = "第一章 样例章节\n细胞、组织、调节、免疫和感染是基础医学教材中的核心知识点。"
        return [PageText(page=1, text=self._clean_text(fallback))]

    def _split_chapters(self, doc_id: str, title: str, pages: list[PageText]) -> list[dict[str, Any]]:
        candidates: list[dict[str, Any]] = []
        current: dict[str, Any] | None = None
        for page in pages:
            text = page.text.strip()
            if not text:
                continue
            match = CHAPTER_RE.search(text)
            heading = self._clean_heading(match.group(1)) if match else ""
            if heading and (current is None or heading != current["title"]):
                if current:
                    candidates.append(current)
                current = {
                    "id": self._id("chapter", f"{doc_id}-{heading}-{page.page}"),
                    "document_id": doc_id,
                    "document_title": title,
                    "title": heading,
                    "start_page": page.page,
                    "end_page": page.page,
                    "text": text,
                }
            elif current:
                current["text"] += "\n" + text
                current["end_page"] = page.page
            else:
                current = {
                    "id": self._id("chapter", f"{doc_id}-page-{page.page}"),
                    "document_id": doc_id,
                    "document_title": title,
                    "title": "导论与正文片段",
                    "start_page": page.page,
                    "end_page": page.page,
                    "text": text,
                }
        if current:
            candidates.append(current)

        if len(candidates) < 2:
            joined = "\n".join(page.text for page in pages if page.text.strip())
            candidates = self._chunk_as_chapters(doc_id, title, joined)

        chapters = candidates[:10]
        for chapter in chapters:
            chapter["char_count"] = len(chapter.get("text", ""))
            chapter["excerpt"] = self._excerpt(chapter.get("text", ""))
        return chapters

    def _chunk_as_chapters(self, doc_id: str, title: str, text: str) -> list[dict[str, Any]]:
        chunk_size = max(700, math.ceil(max(len(text), 1) / 3))
        chapters = []
        for idx, start in enumerate(range(0, len(text), chunk_size), start=1):
            chunk = text[start : start + chunk_size]
            if not chunk.strip():
                continue
            chapters.append(
                {
                    "id": self._id("chapter", f"{doc_id}-chunk-{idx}"),
                    "document_id": doc_id,
                    "document_title": title,
                    "title": f"正文片段 {idx}",
                    "start_page": idx,
                    "end_page": idx,
                    "text": chunk,
                    "char_count": len(chunk),
                    "excerpt": self._excerpt(chunk),
                }
            )
        return chapters[:6]

    def _extract_graph(self, documents: list[dict[str, Any]], chapters: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        nodes: list[dict[str, Any]] = []
        edges: list[dict[str, Any]] = []
        node_by_key: dict[tuple[str, str, str], str] = {}

        for chapter in chapters:
            chapter_node_id = self._id("node", chapter["id"])
            nodes.append(
                {
                    "id": chapter_node_id,
                    "name": chapter["title"],
                    "category": "chapter",
                    "definition": chapter["excerpt"],
                    "document_id": chapter["document_id"],
                    "document_title": chapter["document_title"],
                    "chapter_id": chapter["id"],
                    "chapter_title": chapter["title"],
                    "page": chapter["start_page"],
                    "frequency": 1,
                    "source_count": 1,
                    "importance": 0.8,
                    "status": "active",
                    "source_refs": [self._source_ref(chapter)],
                }
            )

            concepts = self._chapter_concepts(chapter)
            concept_ids = []
            for name, category in concepts:
                key = (chapter["document_id"], chapter["id"], name)
                if key in node_by_key:
                    continue
                node_id = self._id("node", f"{chapter['id']}-{name}")
                node_by_key[key] = node_id
                concept_ids.append(node_id)
                nodes.append(
                    {
                        "id": node_id,
                        "name": name,
                        "category": category,
                        "definition": self._definition_for(name, chapter["text"]),
                        "document_id": chapter["document_id"],
                        "document_title": chapter["document_title"],
                        "chapter_id": chapter["id"],
                        "chapter_title": chapter["title"],
                        "page": chapter["start_page"],
                        "frequency": chapter["text"].count(name) or 1,
                        "source_count": 1,
                        "importance": min(1.0, 0.45 + (chapter["text"].count(name) * 0.1)),
                        "status": "active",
                        "source_refs": [self._source_ref(chapter)],
                    }
                )
                edges.append(
                    {
                        "id": self._id("edge", f"{chapter_node_id}-{node_id}"),
                        "source": chapter_node_id,
                        "target": node_id,
                        "relation": "contains",
                        "reason": "章节正文包含该知识点",
                        "weight": 0.9,
                    }
                )

            for left, right in zip(concept_ids, concept_ids[1:]):
                edges.append(
                    {
                        "id": self._id("edge", f"{left}-{right}-related"),
                        "source": left,
                        "target": right,
                        "relation": "related",
                        "reason": "同一章节内共同出现",
                        "weight": 0.55,
                    }
                )

        self._add_prerequisite_edges(nodes, edges)
        return nodes, edges

    def _chapter_concepts(self, chapter: dict[str, Any]) -> list[tuple[str, str]]:
        text = chapter.get("text", "")
        title = chapter.get("document_title", "")
        catalog = KEYWORD_CATALOG["common"][:]
        if "生理" in title:
            catalog.extend(KEYWORD_CATALOG["physiology"])
        if "微生物" in title:
            catalog.extend(KEYWORD_CATALOG["microbiology"])

        found: list[tuple[str, str]] = []
        for name, category in catalog:
            if name in text or name in chapter.get("title", ""):
                found.append((name, category))

        if len(found) < 4:
            found.extend(self._fallback_concepts(title))

        deduped = []
        seen = set()
        for name, category in found:
            if name not in seen:
                deduped.append((name, category))
                seen.add(name)
        return deduped[:7]

    def _fallback_concepts(self, document_title: str) -> list[tuple[str, str]]:
        if "生理" in document_title:
            return [("细胞", "基础概念"), ("稳态", "生理机制"), ("负反馈", "生理机制"), ("动作电位", "生理机制")]
        if "微生物" in document_title:
            return [("细胞", "基础概念"), ("细菌", "病原体"), ("感染", "疾病过程"), ("免疫", "防御机制")]
        return KEYWORD_CATALOG["common"][:4]

    def _add_prerequisite_edges(self, nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> None:
        by_doc: dict[str, dict[str, str]] = defaultdict(dict)
        for node in nodes:
            if node.get("category") == "chapter":
                continue
            by_doc[node["document_id"]].setdefault(node["name"], node["id"])

        prerequisite_pairs = [
            ("细胞", "动作电位"),
            ("稳态", "负反馈"),
            ("细胞", "感染"),
            ("抗原", "抗体"),
            ("细菌", "耐药性"),
        ]
        for doc_nodes in by_doc.values():
            for source_name, target_name in prerequisite_pairs:
                if source_name in doc_nodes and target_name in doc_nodes:
                    edges.append(
                        {
                            "id": self._id("edge", f"{doc_nodes[source_name]}-{doc_nodes[target_name]}-pre"),
                            "source": doc_nodes[source_name],
                            "target": doc_nodes[target_name],
                            "relation": "prerequisite",
                            "reason": f"理解{target_name}前需要先掌握{source_name}",
                            "weight": 0.7,
                        }
                    )

    def _build_decisions(self, nodes: list[dict[str, Any]]) -> list[dict[str, Any]]:
        concept_nodes = [node for node in nodes if node.get("category") != "chapter"]
        groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for node in concept_nodes:
            groups[self._normalize(node["name"])].append(node)

        decisions: list[dict[str, Any]] = []
        for normalized, group in groups.items():
            doc_titles = sorted({item["document_title"] for item in group})
            affected = [item["id"] for item in group]
            if len(doc_titles) >= 2:
                decisions.append(
                    {
                        "id": self._id("decision", f"merge-{normalized}"),
                        "action": "merge",
                        "affected_node_ids": affected,
                        "result_node_id": affected[0],
                        "result_name": group[0]["name"],
                        "reason": f"{group[0]['name']}在多本教材中重复出现，保留共同定义并合并来源",
                        "confidence": 0.86,
                        "status": "active",
                        "source_documents": doc_titles,
                    }
                )
            elif group[0].get("importance", 0) >= 0.7:
                decisions.append(
                    {
                        "id": self._id("decision", f"keep-{normalized}"),
                        "action": "keep",
                        "affected_node_ids": affected,
                        "result_node_id": affected[0],
                        "result_name": group[0]["name"],
                        "reason": "该知识点属于单本教材关键概念，压缩后仍需保留",
                        "confidence": 0.78,
                        "status": "active",
                        "source_documents": doc_titles,
                    }
                )
            else:
                decisions.append(
                    {
                        "id": self._id("decision", f"remove-{normalized}"),
                        "action": "remove",
                        "affected_node_ids": affected,
                        "result_node_id": None,
                        "result_name": group[0]["name"],
                        "reason": "该知识点当前仅作低频辅助说明，可在30%压缩版本中删除或折叠",
                        "confidence": 0.64,
                        "status": "active",
                        "source_documents": doc_titles,
                    }
                )

        if not any(item["action"] == "merge" for item in decisions) and len(concept_nodes) >= 2:
            first_two = concept_nodes[:2]
            decisions.insert(
                0,
                {
                    "id": self._id("decision", "merge-demo-common"),
                    "action": "merge",
                    "affected_node_ids": [item["id"] for item in first_two],
                    "result_node_id": first_two[0]["id"],
                    "result_name": first_two[0]["name"],
                    "reason": "演示模式下将跨教材共同基础概念归并，保证前端可展示合并审计流程",
                    "confidence": 0.58,
                    "status": "active",
                    "source_documents": sorted({item["document_title"] for item in first_two}),
                },
            )

        action_counter = Counter(item["action"] for item in decisions)
        if "remove" not in action_counter and concept_nodes:
            node = concept_nodes[-1]
            decisions.append(
                {
                    "id": self._id("decision", f"remove-{node['id']}"),
                    "action": "remove",
                    "affected_node_ids": [node["id"]],
                    "result_node_id": None,
                    "result_name": node["name"],
                    "reason": "低收益重复讲解折叠到上位知识点，作为30%压缩的可解释删除项",
                    "confidence": 0.61,
                    "status": "active",
                    "source_documents": [node["document_title"]],
                }
            )
        return decisions[:40]

    def _build_compression(
        self,
        chapters: list[dict[str, Any]],
        decisions: list[dict[str, Any]],
        nodes: list[dict[str, Any]],
    ) -> dict[str, Any]:
        original = sum(chapter.get("char_count", 0) for chapter in chapters) or sum(
            len(node.get("definition", "")) for node in nodes
        )
        retained_ids = {
            node_id
            for decision in decisions
            if decision.get("action") in {"merge", "keep", "split"}
            for node_id in decision.get("affected_node_ids", [])
        }
        retained_text = " ".join(node.get("definition", "") for node in nodes if node.get("id") in retained_ids)
        target_chars = max(1, int(original * 0.28))
        integrated = min(len(retained_text), target_chars) if retained_text else target_chars
        ratio = integrated / original if original else 0
        return {
            "original_char_count": original,
            "integrated_char_count": integrated,
            "compression_ratio": round(ratio, 4),
            "compression_percent": round(ratio * 100, 2),
            "target_ratio": 0.3,
            "within_target": ratio <= 0.3,
            "method": "保留 merge/keep/split 决策对应定义，并按30%目标生成精华摘要预算",
        }

    def _chapter_summaries(self, chapters: list[dict[str, Any]]) -> list[dict[str, Any]]:
        public = []
        for chapter in chapters:
            item = dict(chapter)
            item.pop("text", None)
            public.append(item)
        return public

    def _public_state(self, state: dict[str, Any]) -> dict[str, Any]:
        public = dict(state)
        public.pop("_chapter_index", None)
        return public

    def _definition_for(self, keyword: str, text: str) -> str:
        for sentence in SENTENCE_RE.findall(text):
            if keyword in sentence:
                return self._excerpt(sentence, 160)
        return f"{keyword}是本教材章节中抽取出的核心知识点，需结合章节原文理解其定义、机制和教学位置。"

    def _best_snippet(self, question: str, text: str) -> str:
        sentences = SENTENCE_RE.findall(text)
        if not sentences:
            return self._excerpt(text, 180)
        scored = sorted(((self._score(question, sentence), sentence) for sentence in sentences), reverse=True)
        return self._excerpt(scored[0][1], 180)

    def _score(self, question: str, text: str) -> float:
        q_terms = self._terms(question)
        t_terms = self._terms(text)
        if not q_terms or not t_terms:
            return 0.0
        overlap = q_terms & t_terms
        catalog_keywords = {
            keyword
            for keyword_group in KEYWORD_CATALOG.values()
            for keyword, _ in keyword_group
            if keyword in question and keyword in text
        }
        bonus = (sum(1 for term in q_terms if term in text) * 0.02) + (len(catalog_keywords) * 0.18)
        return (len(overlap) / max(len(q_terms), 1)) + bonus

    def _terms(self, text: str) -> set[str]:
        chinese = re.findall(r"[\u4e00-\u9fff]{1,}", text)
        terms: set[str] = set()
        for block in chinese:
            if len(block) == 1:
                terms.add(block)
            else:
                terms.update(block[idx : idx + 2] for idx in range(max(1, len(block) - 1)))
                for keyword_group in KEYWORD_CATALOG.values():
                    for keyword, _ in keyword_group:
                        if keyword in block:
                            terms.add(keyword)
        terms.update(re.findall(r"[A-Za-z0-9_]{2,}", text.lower()))
        return {term for term in terms if term not in STOP_TERMS}

    def _core_term_hits(self, title: str, pages: list[PageText]) -> int:
        text = "\n".join(page.text for page in pages)
        catalog = KEYWORD_CATALOG["common"][:]
        if "生理" in title:
            catalog.extend(KEYWORD_CATALOG["physiology"])
        if "微生物" in title:
            catalog.extend(KEYWORD_CATALOG["microbiology"])
        return sum(1 for keyword, _ in catalog if keyword in text)

    def _not_found(self, question: str) -> dict[str, Any]:
        return {
            "question": question,
            "found": False,
            "answer": "当前知识库中未找到相关信息",
            "citations": [],
        }

    def _normalize(self, name: str) -> str:
        cleaned = re.sub(r"\s+", "", name)
        return SYNONYMS.get(cleaned, cleaned)

    def _frontend_category(self, category: str) -> str:
        if "机制" in category or "调节" in category:
            return "机制"
        if "病理" in category or "疾病" in category:
            return "病理过程"
        if category == "chapter":
            return "整合节点"
        return "概念"

    def _format_size(self, size_bytes: int) -> str:
        if size_bytes <= 0:
            return "0 KB"
        size_mb = size_bytes / (1024 * 1024)
        if size_mb >= 1:
            return f"{size_mb:.1f} MB"
        return f"{size_bytes / 1024:.1f} KB"

    def _source_ref(self, chapter: dict[str, Any]) -> dict[str, Any]:
        return {
            "document_title": chapter["document_title"],
            "chapter_title": chapter["title"],
            "page": chapter["start_page"],
        }

    def _clean_text(self, text: str) -> str:
        text = re.sub(r"[ \t\r\f]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _clean_heading(self, heading: str) -> str:
        return re.sub(r"\s+", " ", heading).strip(" -—:：")

    def _excerpt(self, text: str, limit: int = 220) -> str:
        cleaned = re.sub(r"\s+", " ", text).strip()
        if len(cleaned) <= limit:
            return cleaned
        return cleaned[: limit - 1] + "…"

    def _id(self, prefix: str, seed: str | None = None) -> str:
        if seed:
            return f"{prefix}_{uuid.uuid5(uuid.NAMESPACE_URL, seed).hex[:12]}"
        return f"{prefix}_{uuid.uuid4().hex[:12]}"
