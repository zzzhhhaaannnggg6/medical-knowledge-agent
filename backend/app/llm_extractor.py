"""LLM-backed chapter knowledge extractor with deterministic fallback.

Design contract:
- One chapter per call (to keep context short, as required by the spec).
- Structured JSON output: nodes {id,name,definition,category,chapter,page} and
  edges {source,target,relation_type,description}.
- Relation vocabulary matches the spec: prerequisite / parallel / contains / applies_to.
- Falls back to an enhanced rule-based extractor when no LLM endpoint is configured
  or when the LLM call fails, so the demo still runs end-to-end.

Environment variables (all optional):
    LLM_PROVIDER     "openai" (default) or "none" to force fallback
    LLM_API_KEY      secret
    LLM_BASE_URL     OpenAI-compatible base, e.g. https://api.deepseek.com/v1
    LLM_MODEL        model name, defaults to "gpt-4o-mini"
"""

from __future__ import annotations

import json
import os
import re
import urllib.request
import uuid
from typing import Any

RELATION_TYPES = ("prerequisite", "parallel", "contains", "applies_to")
RELATION_LABELS = {
    "prerequisite": "前置依赖",
    "parallel": "并列关系",
    "contains": "包含关系",
    "applies_to": "应用关系",
}

CATEGORY_CANON = {
    "核心概念",
    "定理",
    "方法",
    "现象",
    "机制",
    "应用",
}

# Seed pairs used when deriving parallel/applies_to/prerequisite relations
# in rule-based fallback. Each pair is (source_name, target_name, relation, rationale).
SEED_RELATIONS: list[tuple[str, str, str, str]] = [
    # prerequisite
    ("静息电位", "动作电位", "prerequisite", "理解动作电位前需要先掌握静息电位"),
    ("细胞", "动作电位", "prerequisite", "动作电位的载体是细胞膜结构，需先理解细胞"),
    ("稳态", "负反馈", "prerequisite", "负反馈是维持稳态的控制机制"),
    ("抗原", "抗体", "prerequisite", "抗体是针对抗原产生的免疫分子"),
    ("细菌", "耐药性", "prerequisite", "耐药性是细菌应对抗生素时出现的现象"),
    # parallel
    ("有丝分裂", "减数分裂", "parallel", "两类并列的细胞分裂方式"),
    ("神经调节", "体液调节", "parallel", "机体功能调节的两种并列方式"),
    ("细菌", "病毒", "parallel", "常见的两类病原体，层级并列"),
    ("细胞", "组织", "parallel", "机体结构层级中相邻的两个层面"),
    ("消毒", "灭菌", "parallel", "两种并列的微生物防控措施"),
    # applies_to
    ("抗体", "体液免疫", "applies_to", "抗体作用于体液免疫应答"),
    ("动作电位", "肌肉收缩", "applies_to", "动作电位应用于触发肌肉收缩"),
    ("负反馈", "血压", "applies_to", "负反馈机制应用于血压调节"),
    ("免疫", "感染", "applies_to", "免疫应答应用于清除病原体和感染"),
    # contains
    ("免疫系统", "T细胞", "contains", "免疫系统包含T细胞等效应细胞"),
    ("循环系统", "血压", "contains", "循环系统的核心指标之一是血压"),
]


def _normalize_category(raw: str) -> str:
    if not raw:
        return "核心概念"
    raw = raw.strip()
    if raw in CATEGORY_CANON:
        return raw
    if "定理" in raw or "定律" in raw:
        return "定理"
    if "方法" in raw or "算法" in raw or "流程" in raw:
        return "方法"
    if "现象" in raw or "病" in raw or "症状" in raw:
        return "现象"
    if "机制" in raw or "调节" in raw:
        return "机制"
    if "应用" in raw:
        return "应用"
    return "核心概念"


def _truncate(text: str, limit: int) -> str:
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def llm_configured() -> bool:
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    if provider == "none":
        return False
    return bool(os.getenv("LLM_API_KEY"))


def extract_chapter(
    chapter_text: str,
    chapter_title: str,
    document_title: str,
    start_page: int,
    *,
    max_nodes: int = 8,
) -> dict[str, Any]:
    """Extract knowledge points and relations for a single chapter.

    Returns {"nodes": [...], "edges": [...], "method": "llm|rules"}.
    Each node: {id,name,definition,category,chapter,page}.
    Each edge: {source,target,relation_type,description}.
    """
    if llm_configured():
        try:
            payload = _call_llm(chapter_text, chapter_title, document_title, start_page, max_nodes)
            nodes, edges = _sanitize(payload, chapter_title, start_page)
            if nodes:
                return {"nodes": nodes, "edges": edges, "method": "llm"}
        except Exception as exc:  # pragma: no cover - network/LLM failures
            # fall through to rule-based extraction
            _log_llm_error(exc)
    nodes, edges = _rule_based_extract(
        chapter_text, chapter_title, document_title, start_page, max_nodes
    )
    return {"nodes": nodes, "edges": edges, "method": "rules"}


# ---------------------------------------------------------------------------
# LLM path
# ---------------------------------------------------------------------------

PROMPT_TEMPLATE = """你是医学教材知识图谱抽取助手。

请仅基于下面给出的【章节正文】抽取该章节的核心知识点与关系，严格输出 JSON，不要输出任何额外文字或 Markdown 代码块围栏。

要求：
1. 每次只处理本章节，不要引入外部知识。
2. 知识点 (nodes) 至少 3 个、至多 {max_nodes} 个，字段固定为：
   - id: 形如 "node_001"
   - name: 知识点名称（简短）
   - definition: 1-2 句定义（≤120 字）
   - category: 在 ["核心概念","定理","方法","现象","机制","应用"] 中选一个
   - chapter: 必须等于 "{chapter_title}"
   - page: 整数页码，参考起始页 {start_page}
3. 关系 (edges) 至少使用 prerequisite / parallel / contains / applies_to 中的三种，字段固定为：
   - source: 对应某个 node.id
   - target: 对应某个 node.id（不可等于 source）
   - relation_type: 上述四者之一
   - description: 1 句中文说明（≤60 字）
4. 最终 JSON 结构：{{"nodes":[...],"edges":[...]}}。

few-shot 示例（仅示意，不要复制到输出）：
{{
  "nodes":[
    {{"id":"node_001","name":"静息电位","definition":"细胞未受刺激时膜两侧的电位差。","category":"核心概念","chapter":"第二章 细胞的基本功能","page":30}},
    {{"id":"node_002","name":"动作电位","definition":"细胞受刺激后膜电位快速可逆倒转。","category":"核心概念","chapter":"第二章 细胞的基本功能","page":35}}
  ],
  "edges":[
    {{"source":"node_001","target":"node_002","relation_type":"prerequisite","description":"理解动作电位需要先掌握静息电位。"}}
  ]
}}

【教材】{document_title}
【章节】{chapter_title}
【起始页】{start_page}
【章节正文（可能被截断）】
{chapter_text}
"""


def _call_llm(
    chapter_text: str,
    chapter_title: str,
    document_title: str,
    start_page: int,
    max_nodes: int,
) -> dict[str, Any]:
    base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    api_key = os.getenv("LLM_API_KEY", "")

    prompt = PROMPT_TEMPLATE.format(
        max_nodes=max_nodes,
        chapter_title=chapter_title,
        start_page=start_page,
        document_title=document_title,
        chapter_text=_truncate(chapter_text, 2400),
    )

    body = json.dumps(
        {
            "model": model,
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "你只输出严格 JSON。字段缺失时用空数组或默认值。",
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
    content = data["choices"][0]["message"]["content"]
    # Be tolerant: strip code-fence artefacts if the model disobeys.
    content = re.sub(r"^```(?:json)?|```$", "", content.strip(), flags=re.MULTILINE).strip()
    parsed = json.loads(content)
    if not isinstance(parsed, dict):
        raise ValueError("LLM response is not a JSON object")
    return parsed


def _sanitize(
    payload: dict[str, Any], chapter_title: str, start_page: int
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    raw_nodes = payload.get("nodes") or []
    raw_edges = payload.get("edges") or []

    nodes: list[dict[str, Any]] = []
    id_map: dict[str, str] = {}
    for item in raw_nodes:
        name = str(item.get("name", "")).strip()
        if not name:
            continue
        original_id = str(item.get("id") or f"node_{uuid.uuid4().hex[:8]}")
        node_id = original_id if re.match(r"^[A-Za-z0-9_\-]+$", original_id) else f"node_{uuid.uuid4().hex[:8]}"
        id_map[original_id] = node_id
        id_map[name] = node_id
        try:
            page_val = int(item.get("page", start_page) or start_page)
        except (TypeError, ValueError):
            page_val = start_page
        nodes.append(
            {
                "id": node_id,
                "name": name,
                "definition": _truncate(str(item.get("definition", "")), 240),
                "category": _normalize_category(str(item.get("category", ""))),
                "chapter": str(item.get("chapter") or chapter_title),
                "page": page_val,
            }
        )

    edges: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()
    for item in raw_edges:
        relation = str(item.get("relation_type") or item.get("relation") or "").strip()
        if relation not in RELATION_TYPES:
            continue
        source = id_map.get(str(item.get("source")), str(item.get("source", "")))
        target = id_map.get(str(item.get("target")), str(item.get("target", "")))
        if not source or not target or source == target:
            continue
        if not any(node["id"] == source for node in nodes):
            continue
        if not any(node["id"] == target for node in nodes):
            continue
        key = (source, target, relation)
        if key in seen:
            continue
        seen.add(key)
        edges.append(
            {
                "source": source,
                "target": target,
                "relation_type": relation,
                "description": _truncate(str(item.get("description", "")), 120)
                or RELATION_LABELS[relation],
            }
        )
    return nodes, edges


def _log_llm_error(exc: Exception) -> None:
    # Best-effort logging without bringing in extra dependencies.
    try:
        import sys

        print(f"[llm_extractor] fallback to rules: {exc}", file=sys.stderr)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Rule-based fallback (covers all 4 relation types)
# ---------------------------------------------------------------------------

CONCEPT_DICTIONARY: list[tuple[str, str, str]] = [
    # (name, category, short-definition-template)
    ("白细胞", "核心概念", "白细胞是参与免疫防御、炎症反应和感染应答的重要细胞"),
    ("白血球", "核心概念", "白血球是白细胞的同义称谓，参与机体免疫防御"),
    ("leukocyte", "核心概念", "leukocyte is a white blood cell involved in immune defense"),
    ("white blood cell", "核心概念", "white blood cell is another name for leukocyte"),
    ("细胞", "核心概念", "细胞是构成生物体结构和功能的基本单位"),
    ("组织", "核心概念", "由同类或不同类细胞按一定规律集合形成的功能单位"),
    ("稳态", "机制", "机体内环境理化性质保持相对稳定的状态"),
    ("内环境", "核心概念", "机体细胞所处的细胞外液总和"),
    ("负反馈", "机制", "输出偏离设定值后反向调节使之回归稳定的控制方式"),
    ("兴奋性", "核心概念", "活组织或细胞对刺激发生反应的能力"),
    ("静息电位", "核心概念", "细胞未受刺激时膜两侧存在的电位差"),
    ("动作电位", "核心概念", "细胞受刺激后膜电位发生的一次快速而可逆的倒转"),
    ("神经调节", "机制", "通过神经反射实现的快速精确调节方式"),
    ("体液调节", "机制", "通过体液中化学物质实现的较缓慢广泛调节方式"),
    ("血压", "现象", "血液对血管壁产生的侧压力"),
    ("心输出量", "核心概念", "心脏每分钟射出的血量"),
    ("肌肉收缩", "现象", "肌细胞在刺激下缩短或产生张力的过程"),
    ("呼吸", "现象", "机体与外界气体交换并在体内运输利用的过程"),
    ("肾小球滤过", "机制", "血浆经肾小球滤过膜形成原尿的过程"),
    ("免疫", "核心概念", "机体识别并清除外来及异常物质以维持稳态的防御功能"),
    ("免疫系统", "核心概念", "由免疫器官、细胞和分子组成的功能系统"),
    ("抗原", "核心概念", "能刺激机体产生特异性免疫应答的物质"),
    ("抗体", "核心概念", "浆细胞产生的能与抗原特异性结合的免疫球蛋白"),
    ("体液免疫", "机制", "以B细胞产生抗体为主的特异性免疫应答"),
    ("细胞免疫", "机制", "以T细胞介导的特异性免疫应答"),
    ("T细胞", "核心概念", "由胸腺分化成熟的淋巴细胞，参与细胞免疫"),
    ("感染", "现象", "病原体侵入机体并与之相互作用的过程"),
    ("炎症", "现象", "组织受损后表现的红肿热痛等血管系统防御反应"),
    ("细菌", "核心概念", "单细胞原核微生物，是常见病原体"),
    ("病毒", "核心概念", "非细胞型微生物，需寄生在活细胞内复制"),
    ("真菌", "核心概念", "具有真正细胞核的真核微生物"),
    ("病原体", "核心概念", "能引起疾病的各类微生物或寄生虫"),
    ("毒力", "机制", "病原体引起宿主损害的能力"),
    ("消毒", "方法", "杀灭物体中病原微生物但不包括所有微生物的方法"),
    ("灭菌", "方法", "杀灭或清除物体中所有微生物的方法"),
    ("耐药性", "现象", "病原体对抗微生物药物产生的抗性"),
    ("有丝分裂", "方法", "体细胞以母细胞复制为两个相同子细胞的过程"),
    ("减数分裂", "方法", "生殖细胞染色体数目减半的分裂过程"),
]

SENTENCE_RE = re.compile(r"[^。！？!?；;\n]{6,160}[。！？!?；;]?")


def _best_sentence(text: str, keyword: str) -> str:
    for sentence in SENTENCE_RE.findall(text or ""):
        if keyword in sentence:
            return _truncate(sentence, 220)
    return ""


def _rule_based_extract(
    chapter_text: str,
    chapter_title: str,
    document_title: str,
    start_page: int,
    max_nodes: int,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    text = chapter_text or ""
    found: list[dict[str, Any]] = []
    name_to_id: dict[str, str] = {}
    for name, category, template in CONCEPT_DICTIONARY:
        if name in text or name in chapter_title:
            node_id = f"node_{uuid.uuid5(uuid.NAMESPACE_URL, chapter_title + name).hex[:8]}"
            if name in name_to_id:
                continue
            name_to_id[name] = node_id
            sentence = _best_sentence(text, name)
            found.append(
                {
                    "id": node_id,
                    "name": name,
                    "definition": sentence or template,
                    "category": category,
                    "chapter": chapter_title,
                    "page": start_page,
                }
            )
        if len(found) >= max_nodes:
            break

    if not found:
        # Last-resort: synthesise a handful of placeholder nodes so the graph isn't empty.
        placeholders = [
            ("核心概念", "基础概念", "该章节中出现的基础概念"),
            ("机制", "机制", "该章节中涉及的机制"),
            ("现象", "现象", "该章节中描述的现象"),
        ]
        for suffix, category, desc in placeholders:
            node_id = f"node_{uuid.uuid5(uuid.NAMESPACE_URL, chapter_title + suffix).hex[:8]}"
            found.append(
                {
                    "id": node_id,
                    "name": f"{chapter_title}-{suffix}",
                    "definition": f"{chapter_title}中的{desc}，需结合原文进一步阅读。",
                    "category": category,
                    "chapter": chapter_title,
                    "page": start_page,
                }
            )
            name_to_id[f"{chapter_title}-{suffix}"] = node_id

    edges: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    # 1) Seed-driven relations across the canonical four types.
    for source_name, target_name, relation, description in SEED_RELATIONS:
        src = name_to_id.get(source_name)
        tgt = name_to_id.get(target_name)
        if not src or not tgt or src == tgt:
            continue
        key = (src, tgt, relation)
        if key in seen:
            continue
        seen.add(key)
        edges.append(
            {
                "source": src,
                "target": tgt,
                "relation_type": relation,
                "description": description,
            }
        )

    # 2) contains: chapter-to-concept virtual node if no contains edge yet.
    if not any(e["relation_type"] == "contains" for e in edges) and len(found) >= 2:
        first, second = found[0], found[1]
        edges.append(
            {
                "source": first["id"],
                "target": second["id"],
                "relation_type": "contains",
                "description": f"章节主干概念{first['name']}涵盖{second['name']}",
            }
        )
        seen.add((first["id"], second["id"], "contains"))

    # 3) parallel: pair up same-category siblings if no parallel yet.
    if not any(e["relation_type"] == "parallel" for e in edges):
        by_cat: dict[str, list[dict[str, Any]]] = {}
        for node in found:
            by_cat.setdefault(node["category"], []).append(node)
        for siblings in by_cat.values():
            if len(siblings) >= 2:
                a, b = siblings[0], siblings[1]
                edges.append(
                    {
                        "source": a["id"],
                        "target": b["id"],
                        "relation_type": "parallel",
                        "description": f"{a['name']}与{b['name']}同属{a['category']}，层级并列",
                    }
                )
                break

    # 4) applies_to: try to pick a mechanism->phenomenon pair from current chapter.
    if not any(e["relation_type"] == "applies_to" for e in edges):
        mech = next((n for n in found if n["category"] in ("机制", "方法", "核心概念")), None)
        phen = next((n for n in found if n["category"] in ("现象", "应用") and n is not mech), None)
        if mech and phen and mech["id"] != phen["id"]:
            edges.append(
                {
                    "source": mech["id"],
                    "target": phen["id"],
                    "relation_type": "applies_to",
                    "description": f"{mech['name']}可应用于解释或实现{phen['name']}",
                }
            )

    return found[:max_nodes], edges
