# AI 初审整改分支调度板

## 0. Root 结论

2026-05-10 中期 AI 初审分数：`56.5/100`。

当前最高收益不是继续做大视觉，也不是重写全栈架构，而是把报告明确指出的 0 分 / 半分项拆成并行小分支处理。Root 总控台只负责优先级、边界、验收和最终合并，不在一个对话里吞掉所有修改。

优先级固定：

1. `Deploy-Docker`：补 Dockerfile、docker-compose、README 一键启动说明。
2. `Docs-Prompt`：补 `docs/prompts.md`、Agent 架构决策对照表、RAG Pipeline 详解。
3. `Backend-RAG`：低风险补混合检索；必须保持 smoke test 通过，失败就回退。
4. `Frontend-Sankey`：有余力再加决策桑基图，不能破坏已封版前端。
5. `Review-QA`：逐项验收上述改动，给 PASS/WARN/FAIL。

## 1. 采用 / 暂缓 / 放弃

| 初审建议 | Root 处理 | 原因 |
| --- | --- | --- |
| Dockerfile + docker-compose.yml | 立即采用 | E 部署配置当前 0 分，文件证据明确，风险低 |
| docs/prompts.md | 立即采用 | D Prompt 工程当前 0 分，纯文档高收益 |
| 决策对照表 + RAG Pipeline 详解 | 立即采用 | 文档基础分缺口，风险低 |
| 最小 embedding 检索 | 有条件采用 | 只能做可回退方案，不能引入大模型下载导致后端不可跑 |
| 决策桑基图 | 可选冲分 | 前端已封版，只有在前三项完成且时间足够时做 |
| 真实 LLM 重写抽取/整合 pipeline | 放弃 | 剩余时间风险过高，会破坏已有稳定 demo |
| 公网后端部署 | 暂缓 | 当前提交保底是 GitHub Pages 静态 Demo + 本地 FastAPI 真实闭环 |

## 2. Deploy-Docker 分支提示词

```text
分支身份：Deploy-Docker。
你是 5 月 10 日黑客松总控台的整改分支，不是 Root。
项目根目录：/Users/li/Documents/New project 4

先读取：
- control_center/10_HANDOFF.md
- control_center/04_SUBMISSION_CHECKLIST.md
- control_center/27_AI_REVIEW_FIX_DISPATCH.md
- README.md
- backend/app/main.py
- backend/requirements.txt
- frontend/package.json

任务：
1. 新增根目录 Dockerfile，用 python:3.11-slim 启动 FastAPI 后端，端口 8001。
2. 新增 docker-compose.yml，至少包含 backend 和 frontend 两个 service。
3. 新增 .dockerignore，排除 PDF、.env、缓存、node_modules、frontend/dist、backend/data。
4. 如有必要新增 .env.example，说明 TEXTBOOK_DIR 和 VITE_API_BASE。
5. 在 README 顶部或 Local Run 附近加入 Docker Quick Start。
6. 不要上传教材 PDF，不要改 GitHub Pages workflow，不要处理飞书表单。

验收：
- docker compose 配置能被 `docker compose config` 解析。
- README 能让评审看到一键运行方式。
- git diff 只包含 Docker/README/必要 env 示例。

对话结束四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 3. Docs-Prompt 分支提示词

```text
分支身份：Docs-Prompt。
你是 5 月 10 日黑客松总控台的文档整改分支，不是 Root。
项目根目录：/Users/li/Documents/New project 4

先读取：
- control_center/10_HANDOFF.md
- control_center/27_AI_REVIEW_FIX_DISPATCH.md
- docs/Agent 架构说明.md
- docs/需求分析.md
- docs/系统设计.md
- README.md

任务：
1. 新建 docs/prompts.md。
2. 写 3 个 Prompt 模板：
   - 知识点抽取：角色、输入、JSON 输出 schema、few-shot、防幻觉。
   - 整合决策：输入两个节点，输出 action/reason/confidence/risk。
   - RAG 回答：必须引用教材/章节/页码，未找到必须返回“当前知识库中未找到相关信息”。
3. 在 docs/Agent 架构说明.md 末尾补：
   - 决策对照表：规则提取 vs LLM、章节切片 vs 固定切片、关键词/轻量向量混合检索 vs 纯向量库。
   - RAG Pipeline 详解：分块、检索、引用、未命中、降级策略。
   - 改进路线图：P0/P1/P2，明确当前不虚构真实 LLM。
4. 在 README 文档列表加入 docs/prompts.md。
5. 不要改代码，不要声称已接入真实 LLM 或公网后端。

验收：
- Prompt 文档可直接被评审看到。
- Agent 架构说明能解释为什么当前选择规则/轻量检索，以及后续如何升级。
- 口径必须保持：公网静态 Demo + 本地 FastAPI 真实 MVP 闭环。

对话结束四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 4. Backend-RAG 分支提示词

```text
分支身份：Backend-RAG。
你是 5 月 10 日黑客松总控台的后端整改分支，不是 Root。
项目根目录：/Users/li/Documents/New project 4

先读取：
- control_center/10_HANDOFF.md
- control_center/23_BACKEND_RESTART_HANDOFF.md
- control_center/27_AI_REVIEW_FIX_DISPATCH.md
- backend/app/pipeline.py
- backend/scripts/smoke_test.sh
- backend/requirements.txt

任务：
1. 只做低风险 RAG 检索增强，不重写 pipeline。
2. 优先实现轻量“关键词 + 字符 n-gram embedding/TF-IDF cosine”混合打分，不强制下载 sentence-transformers。
3. 如要加入 sentence-transformers，只能做 optional extra 或 try/except 回退，不能让基础 smoke test 依赖大模型下载。
4. state.json 可缓存章节向量，但 backend/data 不能提交。
5. README / Agent 架构说明中如果需要描述，必须写成“轻量混合检索 / 可选向量增强”，不要夸成完整向量数据库。

验收：
- `BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh` 通过。
- `/api/rag/query` 仍返回教材、章节、页码、片段。
- 未命中问题仍返回固定未找到文案。
- 如果风险变大，立即停止并回报 Root，不要硬改。

对话结束四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 5. Frontend-Sankey 分支提示词

```text
分支身份：Frontend-Sankey。
你是 5 月 10 日黑客松总控台的可选冲分前端分支，不是 Root。
项目根目录：/Users/li/Documents/New project 4

先读取：
- control_center/10_HANDOFF.md
- control_center/27_AI_REVIEW_FIX_DISPATCH.md
- frontend/src/main.jsx
- frontend/src/styles.css

启动条件：
只有 Root 明确说“前三项已完成，可以做桑基图”时才开始。

任务：
1. 在 DecisionsPanel 上方或内部加一个轻量 SankeyPanel。
2. 用 ECharts sankey series 展示：来源教材/节点 -> merge/keep/remove -> 结果节点。
3. 不改变现有 mock/API 数据契约；组件必须能从现有 decisions 和 graph 推导数据。
4. 不继续重做视觉，不破坏已有教师四问、评审模式、RAG 和图谱。

验收：
- `cd frontend && npm run build` 通过。
- 页面中可看到“决策流向/桑基图”独立创新视图。
- 移动端不严重溢出。

对话结束四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 6. Review-QA 分支提示词

```text
分支身份：Review-QA。
你是 5 月 10 日黑客松总控台的逐项验收分支，不是 Root。
项目根目录：/Users/li/Documents/New project 4

先读取：
- control_center/10_HANDOFF.md
- control_center/04_SUBMISSION_CHECKLIST.md
- control_center/27_AI_REVIEW_FIX_DISPATCH.md
- README.md
- docs/Agent 架构说明.md
- docs/prompts.md（如果存在）

任务：
1. 按 AI 初审 Top 5 逐项检查，不主动改代码。
2. 输出 PASS/WARN/FAIL：
   - Docker/Compose
   - Prompt 工程文档
   - 架构决策对照表
   - RAG Pipeline 说明
   - 后端 RAG smoke test
   - 桑基图（若 Root 已启用）
   - README 可复现
   - 提交安全：无 PDF、无 .env、无 token
3. 只提出最高收益的 3 个剩余问题。
4. 把验收结论写入 15_MERGE_QUEUE.md 或交给 Root 合并。

对话结束四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 7. Root 合并顺序

Root 收到分支回传后按这个顺序合并：

1. Deploy-Docker：如果只改 Docker/README，优先合并。
2. Docs-Prompt：纯文档，优先合并。
3. Backend-RAG：只有 smoke test 通过才合并；失败则放弃代码改动，只保留文档说明。
4. Frontend-Sankey：只有前三项已完成且 build 通过才合并。
5. Review-QA：最后复核，更新 `04_SUBMISSION_CHECKLIST.md` 和 `10_HANDOFF.md`。

最终推送前必须检查：

```bash
git status --short
find . -path ./.git -prune -o \( -iname '*.env' -o -iname '*.pem' -o -iname '*.key' -o -iname '*.pdf' -o -iname '*.sqlite' -o -iname '*.db' \) -print
rg -n --hidden -g '!.git' -g '!frontend/package-lock.json' 'token|cookie|private key|BEGIN RSA|BEGIN OPENSSH|api[_-]?key|secret' .
```

