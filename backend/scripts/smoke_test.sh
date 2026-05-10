#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8001}"

echo "== health =="
curl -sS "$BASE_URL/health"
echo

echo "== demo load =="
curl -sS -X POST "$BASE_URL/api/demo/load" \
  -H "Content-Type: application/json" \
  -d '{"max_pages_per_document": 25}' \
  | python3 -m json.tool >/tmp/build_backend_demo_state.json
python3 - <<'PY'
import json
state = json.load(open("/tmp/build_backend_demo_state.json", encoding="utf-8"))
print({
    "documents": len(state["documents"]),
    "chapters": len(state["chapters"]),
    "nodes": len(state["nodes"]),
    "edges": len(state["edges"]),
    "decisions": len(state["decisions"]),
    "compression_percent": state["compression"]["compression_percent"],
    "within_target": state["compression"]["within_target"],
})
PY

echo "== rag hit =="
curl -sS -X POST "$BASE_URL/api/rag/query" \
  -H "Content-Type: application/json" \
  -d '{"question":"什么是细胞和感染？","top_k":2}' \
  | python3 -m json.tool

echo "== feedback =="
DECISION_ID="$(python3 - <<'PY'
import json
state = json.load(open("/tmp/build_backend_demo_state.json", encoding="utf-8"))
print(state["decisions"][0]["id"])
PY
)"
curl -sS -X POST "$BASE_URL/api/feedback" \
  -H "Content-Type: application/json" \
  -d "{\"decision_id\":\"$DECISION_ID\",\"action\":\"keep\",\"note\":\"模拟教师反馈：该点教学价值高，保留。\"}" \
  | python3 -m json.tool >/tmp/build_backend_feedback.json
python3 - <<'PY'
import json
result = json.load(open("/tmp/build_backend_feedback.json", encoding="utf-8"))
print({
    "updated_decision": result["updated_decision"]["id"],
    "action": result["updated_decision"]["action"],
    "status": result["updated_decision"]["status"],
    "feedback_events": len(result["state"]["feedback_events"]),
})
PY

echo "== dashboard =="
curl -sS "$BASE_URL/api/dashboard" \
  >/tmp/build_backend_dashboard.json
python3 - <<'PY'
import json

data = json.load(open("/tmp/build_backend_dashboard.json", encoding="utf-8"))

required_top = {"textbooks", "graph", "compression", "decisions", "rag"}
required_textbook = {"id", "title", "format", "size", "status", "chapterCount", "characters", "chapters"}
required_chapter = {"title", "pages", "chars"}
required_node = {"id", "name", "category", "textbook", "sourceCount", "chapter", "pages", "definition"}
required_edge = {"source", "target", "relation"}
required_compression = {"originalChars", "integratedChars", "ratio", "target", "guardrails"}
required_decision = {"id", "type", "nodes", "result", "reason", "confidence", "status"}
required_rag = {"question", "answer", "citations"}
required_citation = {"textbook", "chapter", "pages", "relevance", "excerpt"}

def require_keys(name, item, keys):
    missing = keys - set(item)
    if missing:
        raise SystemExit(f"{name} missing keys: {sorted(missing)}")

require_keys("dashboard", data, required_top)
require_keys("graph", data["graph"], {"nodes", "edges"})
require_keys("compression", data["compression"], required_compression)
require_keys("rag", data["rag"], required_rag)

if data["textbooks"]:
    require_keys("textbook", data["textbooks"][0], required_textbook)
    if data["textbooks"][0]["chapters"]:
        require_keys("chapter", data["textbooks"][0]["chapters"][0], required_chapter)
if data["graph"]["nodes"]:
    require_keys("graph node", data["graph"]["nodes"][0], required_node)
if data["graph"]["edges"]:
    require_keys("graph edge", data["graph"]["edges"][0], required_edge)
if data["decisions"]:
    require_keys("decision", data["decisions"][0], required_decision)
if data["rag"]["citations"]:
    require_keys("citation", data["rag"]["citations"][0], required_citation)

print({
    "textbooks": len(data["textbooks"]),
    "graph_nodes": len(data["graph"]["nodes"]),
    "graph_edges": len(data["graph"]["edges"]),
    "decisions": len(data["decisions"]),
    "rag_citations": len(data["rag"]["citations"]),
    "ratio": data["compression"]["ratio"],
    "contract": "dashboard.v1",
})
PY
