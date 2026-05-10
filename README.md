# 医学教材知识整合智能体

May 10 ZJU AI full-stack hackathon project. The current deliverable is a Vite/React demo for a medical textbook knowledge-integration agent, plus the local command-center files used to coordinate build, deploy, report, and submission branches.

## Current App

- Frontend: React + Vite + ECharts graph
- Demo data: built in, so the deployed page remains usable without a backend
- API mode: set `VITE_API_BASE` after Build unifies frontend `/api/dashboard` with backend `/api/state`
- Deployment target: Vercel static frontend
- Backend status: local FastAPI service is present and smoke-tested, but it is not yet required for public deployment

## Report Docs

- `docs/Agent 架构说明.md`
- `docs/需求分析.md`
- `docs/系统设计.md`
- `report/整合报告.md`
- `report/技术报告草稿.md`

## Local Run

Requires Node.js `>=22.12.0`.

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL printed by the terminal, usually `http://localhost:5173`.

## Local Backend

The backend is useful for local validation and future API integration. It reads local textbook PDFs from `/Users/li/Desktop/黑客松/textbooks`; those PDFs are not committed.

```bash
cd "/Users/li/Documents/New project 4"
source .venv/bin/activate
uvicorn app.main:app --reload --app-dir backend
```

Smoke test:

```bash
./backend/scripts/smoke_test.sh
```

## Production Build

```bash
cd frontend
npm ci
npm run build
npm run preview
```

## Deploy

Default deployment is Vercel from the repository root. The root `vercel.json` runs the frontend build and publishes `frontend/dist`.

Required public links before Feishu submission:

- GitHub repository: pending GitHub login and Public repo creation
- Deployment URL: pending Vercel deployment
- Technical report: local draft at `report/技术报告草稿.md`; public Feishu link pending

If the backend is unavailable, the frontend falls back to the built-in demo data and shows an understandable API warning instead of a blank page. For this submission, the safest public deployment path is the static frontend first; deploy the backend only after its public demo data path no longer depends on local PDFs.

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
