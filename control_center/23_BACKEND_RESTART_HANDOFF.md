# Build-Backend 重开交接手卡

时间：2026-05-10 11:44 CST

用途：原 Build-Backend 后端分支失效时，给新后端分支直接接手，避免重新读全量上下文。

## 新对话第一句话

```text
你现在是 5 月 10 日黑客松总控台的 Build-Backend 重开分支。项目根目录是 /Users/li/Documents/New project 4。
请先运行或读取：
./hackctl.sh backend-restart
然后只负责后端 API 稳定、smoke test 和本地复现，不扩新功能、不改前端主布局、不处理部署提交。
对话结束前必须输出四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 必读文件

- `control_center/10_HANDOFF.md`
- `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`
- `control_center/18_PHASE_TASK_BREAKDOWN.md`
- `backend/README.md`
- `backend/scripts/smoke_test.sh`
- `backend/app/main.py`
- `backend/app/pipeline.py`

## 当前后端状态

- FastAPI 后端已存在，核心目录为 `backend/app/`。
- 已有接口：
  - `GET /health`
  - `POST /api/demo/load`
  - `POST /api/documents`
  - `GET /api/state`
  - `GET /api/dashboard`
  - `POST /api/rag/query`
  - `POST /api/feedback`
- 默认 demo 教材路径：
  - `/Users/li/Desktop/黑客松/textbooks/03_生理学.pdf`
  - `/Users/li/Desktop/黑客松/textbooks/04_医学微生物学.pdf`
- 后端定位：本地真实闭环，不作为公网提交硬依赖。
- 公网提交保底仍是 GitHub Pages 静态前端 Demo。

## 首要任务

1. 保持 `/api/dashboard` 字段契约稳定，优先保证前端读取不崩。
2. 确认后端能在 8001 启动。
3. 运行 smoke test，验证健康检查、demo 加载、RAG、反馈和 dashboard contract。
4. 如果失败，只修阻塞性 bug，不做重构。
5. 把最终状态写回 `control_center/15_MERGE_QUEUE.md` 或 `10_HANDOFF.md`。

## 启动与测试命令

```bash
cd "/Users/li/Documents/New project 4"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend --port 8001
```

另开终端测试：

```bash
cd "/Users/li/Documents/New project 4"
BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh
```

如果 8001 被占用：

```bash
uvicorn app.main:app --reload --app-dir backend --port 8002
BASE_URL=http://127.0.0.1:8002 ./backend/scripts/smoke_test.sh
```

## 禁止事项

- 不处理 7 本全量教材。
- 不接入向量库、embedding、rerank 或 ModelScope 大改。
- 不把教材 PDF、缓存、密钥提交到仓库。
- 不改前端视觉和布局。
- 不把本地后端说成已经公网部署。

## 对 Root 的回报格式

```text
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

如果 smoke test 通过，结论写：

```text
Build-Backend 重开完成：8001 后端可启动，smoke test 通过，/api/dashboard contract 稳定；后端仍定位为本地复现能力，公网提交继续使用静态前端 Demo。
```
