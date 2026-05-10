#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8000}"

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
  | python3 -c 'import json,sys; d=json.load(sys.stdin); print({"textbooks":len(d["textbooks"]),"graph_nodes":len(d["graph"]["nodes"]),"graph_edges":len(d["graph"]["edges"]),"decisions":len(d["decisions"]),"rag_citations":len(d["rag"]["citations"]),"ratio":d["compression"]["ratio"]})'
