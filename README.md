# 医学教材知识整合智能体

May 10 ZJU AI full-stack hackathon project. The current deliverable is a Vite/React demo for a medical textbook knowledge-integration agent, plus the local command-center files used to coordinate build, deploy, report, and submission branches.

## Current App

- Frontend: React + Vite + ECharts graph
- Demo data: built in, so the deployed page remains usable without a backend
- API mode: set `VITE_API_BASE` to a FastAPI service that exposes the stable `/api/dashboard` contract
- Deployment target: GitHub Pages static frontend
- Backend status: local FastAPI service is present and smoke-tested, but it is not yet required for public deployment
- Public repository: <https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent>
- Public demo: <https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/>

## Main Features

- Teacher review flow: answers the four review questions, "why merge", "where is the source", "is compression <=30%", and "does QA cite evidence".
- Knowledge graph: ECharts graph with concepts, source metadata, node details, category filters, and teaching-path highlights.
- Integration audit: shows `merge / keep / remove` decisions, reasons, confidence, and simulated feedback changes.
- Compression audit: records original text size, retained text size, compression ratio, and the 30% threshold.
- Citation QA: RAG-style answer panel returns textbook, chapter, page, relevance, and source excerpt.
- Local backend loop: FastAPI can reproduce parsing, graph construction, integration, compression, QA, and simulated feedback from local textbook PDFs.

## Report Docs

- `docs/Agent 架构说明.md`
- `docs/prompts.md`
- `docs/需求分析.md`
- `docs/系统设计.md`
- `report/整合报告.md`
- `report/技术报告草稿.md`

## Docker Quick Start

Requires Docker Desktop with Compose support. The compose setup runs the FastAPI backend on port `8001` and the Vite frontend on port `5173`.

```bash
cp .env.example .env
# Required: edit TEXTBOOK_DIR in .env so it points to the textbook PDF folder on this machine.
docker compose up --build
```

Open:

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:8001/health>

The backend image does not copy textbook PDFs. `docker-compose.yml` mounts `TEXTBOOK_DIR` read-only into the container at `/textbooks`, and generated backend state is kept in a Docker volume. If `TEXTBOOK_DIR` points to a missing folder, the backend demo loader will not find the default PDFs.

## Local Run

Requires Node.js `>=22.12.0`.

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL printed by the terminal, usually `http://localhost:5173`.

## Local Backend

The backend is useful for local validation and API alignment. By default it reads local textbook PDFs from `/Users/li/Desktop/黑客松/textbooks`; set `TEXTBOOK_DIR` to override that path. Those PDFs are not committed. Until the backend has public-safe demo data that does not depend on local textbooks, the static frontend Demo remains the submission fallback.

```bash
cd "/Users/li/Documents/New project 4"
source .venv/bin/activate
uvicorn app.main:app --reload --app-dir backend --host 127.0.0.1 --port 8001
```

Smoke test:

```bash
BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh
```

## Production Build

```bash
cd frontend
npm ci
npm run build
npm run preview
```

## Deploy

Default public deployment is GitHub Pages. The Pages workflow builds `frontend/` and publishes the static frontend from `frontend/dist`.

Required public links before Feishu submission:

- GitHub repository: <https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent>
- Deployment URL: <https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/>
- Technical report: local draft at `report/技术报告草稿.md`; public Feishu link is optional and should only be added if Root creates an accessible Feishu document

If the backend is unavailable, the frontend falls back to the built-in demo data and shows an understandable API warning instead of a blank page. For this submission, the public link is a static demo of the core workflow; the real parsing, RAG, compression audit, and simulated feedback loop can be reproduced locally through the FastAPI backend.

## Known Limits

- The public GitHub Pages link is a static demo, not a public backend deployment.
- The smoke test covers 2 textbook page windows, not the full 7-book corpus.
- Current RAG uses lightweight hybrid retrieval: keyword/rule scoring plus character n-gram TF-IDF cosine. It is not a full embedding/vector-database pipeline.
- Teacher feedback is simulated feedback for one integration decision, not a real teacher multi-turn conversation.
- Some PDF excerpts still contain table-of-contents or header noise and need further cleaning.

## Submission Safety

Do not commit textbook PDFs or local secrets. Textbook PDFs stay outside the repo at:

```text
/Users/li/Desktop/黑客松/textbooks
```

Before pushing, run:

```bash
git status --short
find . -path ./.git -prune -o \( -iname '*.env' -o -iname '*.pem' -o -iname '*.key' -o -iname '*.pdf' -o -iname '*.sqlite' -o -iname '*.db' \) -print
rg -n --hidden -g '!.git' -g '!frontend/package-lock.json' 'token|cookie|private key|BEGIN RSA|BEGIN OPENSSH|api[_-]?key|secret' .
```

## Command Center

The `control_center/` directory tracks hackathon decisions, task routing, source verification, and final submission state.

Start here:

```bash
./hackctl.sh status
```

Core files:

- `control_center/00_START_HERE.md`: one-page command desk
- `control_center/01_PRECHECK.md`: machine/account/material checklist
- `control_center/02_RACE_DAY_CONSOLE.md`: race-day timebox
- `control_center/03_WECHAT_AND_LINK_AUDIT.md`: group-message and link audit protocol
- `control_center/04_SUBMISSION_CHECKLIST.md`: final submission checklist
- `control_center/05_TECH_REPORT_TEMPLATE.md`: optional technical report template
- `control_center/06_MVP_DECISION_BOARD.md`: feature triage board
- `control_center/07_CONVERSATION_SYNC.md`: cross-conversation sync rules
- `control_center/08_DECISION_LOG.md`: decision record
- `control_center/09_TASK_TREE.md`: task tree
- `control_center/10_HANDOFF.md`: current handoff state
- `control_center/11_SUBMISSION_URL_GUIDE.md`: what each submission URL means
- `control_center/12_BRANCH_REGISTRY.md`: branch registry
- `control_center/13_SYNC_PROTOCOL.md`: branch sync protocol
- `control_center/14_SOURCE_INDEX.md`: source index
- `control_center/15_MERGE_QUEUE.md`: pending branch conclusions
- `control_center/16_AGENT_BEGINNER_PROTOCOL.md`: beginner-friendly Agent command protocol
- `control_center/17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`: official problem analysis
- `control_center/18_PHASE_TASK_BREAKDOWN.md`: 5-hour Root execution board
- `control_center/19_MULTI_AGENT_DISPATCH.md`: copyable prompts for parallel agents and machines

Known source links:

- Hackathon page: <https://tuotuzju.com/hackathon>
- Submission form: <https://my.feishu.cn/share/base/form/shrcn9FnQIJcWF9J857C3sLHi4d>
- ModelScope: <https://www.modelscope.cn/>

Before the race, finish the two human steps:

1. Restore WeChat login so Codex can continue reading the hackathon group.
2. Run `gh auth login` and confirm `gh auth status`.
3. If Feishu CLI is required, run `lark-cli config init --new`, then `lark-cli doctor`.

Cross-conversation recovery:

```bash
./hackctl.sh sync
```

Live branch routing:

```bash
./hackctl.sh live
./hackctl.sh reentry
```

Submission URL guide:

```bash
./hackctl.sh submit-guide
```

Agent beginner protocol:

```bash
./hackctl.sh agent
```

Current phase plan:

```bash
./hackctl.sh phase
```

Parallel agent dispatch prompts:

```bash
./hackctl.sh dispatch
```

Backend API:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend --port 8001
```

Smoke test:

```bash
BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh
```
