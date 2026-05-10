# 分支结论合并队列

## 使用说明

分支对话产生了重要结论，但还没有整理进正式文件时，先放这里。Root 分支负责定期合并。

状态：

- `Pending`：待合并
- `Merged`：已合并到正式文件
- `Superseded`：被更新来源覆盖
- `Rejected`：确认不采用

## 待合并队列

| ID | 时间 | 来源分支 | 结论 | 应合并到 | 状态 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| MQ-001 | 2026-05-10 | Root | 建立多对话流通机制：分支注册、同步协议、来源索引、合并队列、实时入口 | `07_CONVERSATION_SYNC.md`, `10_HANDOFF.md`, `hackctl.sh` | Merged | 本次机制建设 |
| MQ-002 | 2026-05-10 | Analysis | 固化 Agent 小白总控对话协议，提供 `./hackctl.sh agent` 快捷入口和读题固定输出模板 | `16_AGENT_BEGINNER_PROTOCOL.md`, `06_MVP_DECISION_BOARD.md`, `10_HANDOFF.md`, `hackctl.sh` | Merged | 本次机制建设 |
| MQ-003 | 2026-05-10 | Analysis | 正式赛题解析完成：医学教材知识整合智能体，建议标准全栈路线，MVP/加分/放弃项和评分体系已整理 | `17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`, `06_MVP_DECISION_BOARD.md`, `09_TASK_TREE.md`, `10_HANDOFF.md` | Merged | 供 Root 派工，不由 Analysis 分配任务 |
| MQ-004 | 2026-05-10 | Analysis | 阶段划分与任务分化建议完成：P0 骨架、P1 数据闭环、P2 整合压缩、P3 RAG 反馈、P4 文档、P5 部署、P6 复核 | `18_PHASE_TASK_BREAKDOWN.md`, `09_TASK_TREE.md`, `10_HANDOFF.md` | Merged | 供 Root 派工，不由 Analysis 直接分配 |
| MQ-005 | 2026-05-10 | Root | 正式采纳 09:00-14:00 五阶段执行表，并加入多 Agent / 多电脑分派规则 | `18_PHASE_TASK_BREAKDOWN.md`, `02_RACE_DAY_CONSOLE.md`, `09_TASK_TREE.md`, `10_HANDOFF.md`, `hackctl.sh` | Merged | Root 执行版 |
| MQ-006 | 2026-05-10 | Root | 新增多 Agent / 多电脑可复制派工提示词，覆盖 Build-Frontend、Build-Backend、Docs/Report、Deploy、Review、WeChat | `19_MULTI_AGENT_DISPATCH.md`, `10_HANDOFF.md`, `hackctl.sh`, `README.md` | Merged | 供多端并行使用 |
| MQ-007 | 2026-05-10 | Build-Frontend | 前端骨架完成：`frontend/` 已提供 React + Vite、ECharts 图谱、教材解析区、整合压缩区、RAG 引用问答和模拟教师反馈；支持 mock 数据，预留 `VITE_API_BASE` + `/api/dashboard` 接口 | `10_HANDOFF.md`, `README.md` | Pending | 本地 `npm run build` 通过，`http://localhost:5173/` 可打开 |
| MQ-008 | 2026-05-10 | Build-Backend | 后端 FastAPI 已实现 `/health`、`/api/dashboard`、demo 加载、文档解析、知识图谱、整合压缩、RAG 问答、模拟教师反馈；smoke test 已通过，验证 2 本教材生成 20 章节、123 节点、190 边、24 决策，压缩比 4.86% | `10_HANDOFF.md`, `09_TASK_TREE.md`, `README.md`, `backend/` | Pending | 端口 8000 先前占用已释放；当前 8001 可用 |
| MQ-009 | 2026-05-10 10:14 | Docs/Report | 评分文档和技术报告草稿已补齐，已引用最新 smoke test 数据：2 本教材、20 章节、106 节点、144 边、31 决策、3.44% 压缩比；仍需回填部署链接、GitHub Public 链接、截图和公网 demo 数据策略 | `docs/`, `report/`, `README.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | Pending | 待 Root 复核并合并最终提交口径 |
| MQ-010 | 2026-05-10 10:37 | Root | 四分支 feedback 分析完成：当前从骨架期切换到前后端合流 + 提交保底；Frontend 接 8001 API，Backend 稳 schema，Docs 回填真实数据，Deploy 走 Vercel 静态保底 | `20_IMMEDIATE_BRANCH_ROUTING.md`, `10_HANDOFF.md` | Merged | 用户仍需 `gh auth login` 和 Vercel 登录 |
| MQ-011 | 2026-05-10 10:44 | Build-Frontend | 前端分支封版：编辑部医学评审稿风格可作为演示前端，后续不再追加视觉；只保留 API 对齐、部署验证和阻塞 bug 修复 | `10_HANDOFF.md`, `09_TASK_TREE.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Merged | Frontend 无阻塞 |
| MQ-012 | 2026-05-10 10:44 | Root | GitHub CLI 已登录账号 `zzzhhhaaannnggg6`；Deploy 下一步改为创建/确认 Public 仓库、推送并部署 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | Merged | Vercel CLI 未安装 |
| MQ-013 | 2026-05-10 11:10 | Root | Deploy 分支失效后由 Root 接管：新增 GitHub Pages workflow、Vite Pages base 配置和 Deploy 接手提示词 | `21_DEPLOY_HANDOFF.md`, `.github/workflows/pages.yml`, `frontend/vite.config.js`, `10_HANDOFF.md` | Merged | 下一步推送并检查 Actions |
| MQ-014 | 2026-05-10 | Build-Frontend 优化 | 前端视觉重排：报纸感→评审工作台感。引入 8pt 间距 Scale（--s-1..-s-8）、6px 卡片圆角；去掉 body 横条纹纹理；panel 内边距 16→24px，workspace/rails 间距 14→20/24px；panel-heading 升级为“§编号徽章 + Eyebrow + 中文标题 + 右侧徽章（达标/条数/引用数）”；workspace 新增三栏标签 I/II/III（资料源·压缩 / 图谱 / 决策·RAG）；窄屏断点 1280→1360，中栏 order:-1 置顶，右栏 2×1 等高布局。数据契约、功能、mock/API 双态不变。`npm run build` 通过（CSS 28.66KB gzip 5.69KB，JS 1.21MB gzip 399.52KB，与封版基线一致）。 | `10_HANDOFF.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Pending | Root 复核视觉；API/部署阻塞仍在 Deploy 分支 |
| MQ-015 | 2026-05-10 | Docs/Report | 已把前端“教师四问”写入整合报告和技术报告草稿，并预留 GitHub Public URL、部署 URL、飞书技术报告 URL 和四类截图位置 | `report/整合报告.md`, `report/技术报告草稿.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | Pending | 等 Deploy 给最终 URL 后回填 |
| MQ-016 | 2026-05-10 | Build-Backend | 后端分支收窄为 API 对齐，不扩新功能；`/api/dashboard` 字段契约已写入 smoke test 和 backend README；后端 demo 仍依赖本机教材路径，公网提交继续以静态前端 Demo 保底 | `backend/README.md`, `backend/scripts/smoke_test.sh`, `10_HANDOFF.md`, `README.md` | Pending | 前端只需设置 `VITE_API_BASE` 指向可用后端即可读取 |
| MQ-017 | 2026-05-10 | Build-Frontend 优化 | 层次感 + 交互升级：app-header 与 reviewer-bar 双层 sticky 带模糊背景；IntersectionObserver 监听当前章节，reviewer-card 加 `.is-active` 高亮（左侧色条滑出 + 阴影加深）；数字键 1-4 跳 §1-§4，⌘/Ctrl+K 聚焦 RAG 搜索；diff-toast 改为右上角 fixed 滑入动画 + 图章按压；citation 相关度条 scaleX 补间；教学路径 chip `.active` 呼吸脉冲；decision 选中态加印章斜角 + hover 右移 2px；textbook/citation hover 轻抬起；source-legend 变可点击按钮，支持按教材过滤，与类别过滤叠加；补 `@media (prefers-reduced-motion)` 降级；`scroll-margin-top: 180px` 避开 sticky 遮挡。数据契约、功能、mock/API 双态不变。`npm run build` 通过（CSS 33.06KB gzip 6.64KB，JS 1.21MB gzip 400.35KB，与封版基线一致）。 | `10_HANDOFF.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Pending | Root 复核视觉与交互；API/部署阻塞仍在 Deploy/Root-接管 分支 |
| MQ-018 | 2026-05-10 11:22 | Deploy 接手 Agent | GitHub Public 仓库已创建并推送：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`，main @ `0f51b02`；GitHub Pages workflow `run 25618607225` conclusion=success；sticky header + ReviewerBar activeKey 两处小修也随前端视觉重排一起合入；清理全局 `url.*.insteadOf` 镜像重写。剩余阻塞：本机 `*.github.io` TLS 重置，需用户无痕窗口验证 `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`。 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md`, `21_DEPLOY_HANDOFF.md` | Pending | 用户验证通过即可回填到 submission checklist 和 report 链接位 |
| MQ-019 | 2026-05-10 | Build-Frontend 优化 | 精修第二轮（可读性 + 层次循序）：新增 `--fs-*` / `--lh-*` 变量，body base 15.5px，行高 1.75；standard 字号阶梯：h1 clamp(24,34)，h2 20，决策标题 16.5，决策理由 14.5，节点详情定义 15，答案 15.5（行高 1.85），excerpt 14（1.75），RAG 搜索框 15，reviewer 数字 34；每个面板标题下方新增 `.panel-lede` / `.section-lede` 小节导读（14px italic，虚线分隔），形成"§编号 → 标题 → 导读 → 正文"循序；主页载入按区域 stagger fade-rise，header / reviewer-bar / rail-label / 各 panel / footer 在 0.02s–0.52s 内依次出现；sticky top 与 scroll-margin-top 随字号调整为 96 / 200 / 190；保留 `prefers-reduced-motion` 降级；功能 / 契约 / mock-API 双态不变。`npm run build` 通过（CSS 34.64KB gzip 6.97KB，JS 1.21MB gzip 400.83KB）。 | `10_HANDOFF.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Merged | Deploy 接手 Agent 代付 commit `041fe02` 并 push；Pages `run 25619090600` success；若老师现场需再大字号，可把 `--fs-body` 从 15.5 调到 16 一次性全局放大 |
| MQ-022 | 2026-05-10 11:47 | Deploy 接手 Agent | 因用户反馈"太拥挤、看不进去"，代付 Build-Frontend 已写好的 MQ-019；commit `041fe02`，push 走 `20.205.243.166`；Pages `run 25619090600` conclusion=success。main 指针从 `0f51b02` → `041fe02`。 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md` | Merged | 用户无痕复验 github.io，若仍拥挤，考虑把 `--fs-body` → 16 再走一次 |
| MQ-020 | 2026-05-10 11:36 | Root 自审 | 当前“4 种功能以上”在本地后端 + 前端演示层面达标，但不是完美达标；最大差距是公网静态 Demo 未覆盖真实上传、真实 RAG、真实反馈、7 本全量和向量化语义能力。提交策略改为诚实说明“公网 Demo + 本地后端真实闭环”。 | `22_SELF_AUDIT_AND_GAP_ANALYSIS.md`, `10_HANDOFF.md`, `09_TASK_TREE.md`, `08_DECISION_LOG.md` | Merged | 下一步修 README、报告、Agent 架构说明和提交清单 |
| MQ-021 | 2026-05-10 11:44 | Root | Build-Backend 原分支失效，已建立后端重开手卡和 Root 自我重开手卡；新增 `./hackctl.sh backend-restart`、`./hackctl.sh root-restart`；smoke test 默认端口统一到 8001。 | `23_BACKEND_RESTART_HANDOFF.md`, `24_ROOT_RESTART_HANDOFF.md`, `19_MULTI_AGENT_DISPATCH.md`, `12_BRANCH_REGISTRY.md`, `10_HANDOFF.md`, `backend/scripts/smoke_test.sh`, `hackctl.sh` | Merged | 新 Backend 分支只做 API 稳定和 smoke test，不扩功能 |
| MQ-022 | 2026-05-10 11:59 | Root | 用户准备把所有对话迁移到另一个大分支；已建立迁移总手卡和 `./hackctl.sh migration`，新大分支必须从迁移手卡接管，不重新拆题。 | `25_BIG_BRANCH_MIGRATION_HANDOFF.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md`, `hackctl.sh` | Merged | 迁移后优先做链接验证、文档回填和提交复核 |
| MQ-023 | 2026-05-10 12:01 | Build-Backend 重开 | 8001 后端进程已确认为本项目 uvicorn；smoke test 全部通过：2 本教材、20 章节、106 节点、144 边、31 决策、压缩比 3.44%、1 条反馈事件，`/api/dashboard` contract 稳定为 `dashboard.v1`；未发现需修的阻塞性后端 bug。 | `10_HANDOFF.md`, `15_MERGE_QUEUE.md`, `backend/scripts/smoke_test.sh` | Merged | 后端仍定位为本地复现能力，公网提交继续使用 GitHub Pages 静态前端 Demo |
| MQ-024 | 2026-05-10 12:56 | Root | Docs/Report 原分支失效，已建立文档重开手卡和 `./hackctl.sh docs-restart`；新文档分支只做文档收尾、链接回填、诚实口径一致性和提交材料检查，不改代码。 | `26_DOCS_RESTART_HANDOFF.md`, `19_MULTI_AGENT_DISPATCH.md`, `12_BRANCH_REGISTRY.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md`, `hackctl.sh` | Merged | 下一步新开 Docs/Report 重开分支并按手卡收尾 |
| MQ-025 | 2026-05-10 13:10 | Root | 中期 AI 初审快照已推送：`d649ac2 Docs: prepare AI review snapshot`；远端 main 已同步，Pages workflow `25620476724` success。 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md` | Merged | 用户现在可私聊组织者发送姓名、GitHub 仓库链接和邮箱 |
| MQ-026 | 2026-05-10 | Root | AI 初审报告已登记为整改调度板：优先 Docker/Compose、Prompt 文档、架构/RAG 文档，再做低风险 RAG 检索增强；桑基图仅作为可选冲分。Root 不在单一对话中直接吞掉所有改动，改为 Deploy-Docker、Docs-Prompt、Backend-RAG、Frontend-Sankey、Review-QA 分支并行。 | `27_AI_REVIEW_FIX_DISPATCH.md`, `19_MULTI_AGENT_DISPATCH.md`, `12_BRANCH_REGISTRY.md`, `hackctl.sh`, `10_HANDOFF.md` | Merged | 入口：`./hackctl.sh ai-review` |
| MQ-027 | 2026-05-10 | Deploy-Docker | Docker 整改完成：新增 `Dockerfile`、`docker-compose.yml`、`.dockerignore`、`.env.example`，README 已补 Docker Quick Start；本机无 Docker CLI，Ruby YAML 结构校验通过。 | `README.md`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`, `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md` | Merged | Review-QA 在有 Docker Desktop 环境补跑 `docker compose config` |
| MQ-028 | 2026-05-10 | Docs-Prompt | Prompt / 架构文档整改完成：`docs/prompts.md` 已含知识点抽取、整合决策、RAG 回答 3 个模板；`docs/Agent 架构说明.md` 已补决策对照表、RAG Pipeline 详解和 P0/P1/P2 路线图；README 文档列表已加入 `docs/prompts.md`。 | `docs/prompts.md`, `docs/Agent 架构说明.md`, `README.md`, `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md` | Merged | 口径保持“公网静态 Demo + 本地 FastAPI 真实 MVP 闭环” |
| MQ-029 | 2026-05-10 | Backend-RAG | 后端 RAG 低风险增强完成：仅修改 `backend/app/pipeline.py`，加入关键词 + 字符 n-gram TF-IDF cosine 混合检索，不增加外部模型依赖；Root 复跑 `BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh` 通过。 | `backend/app/pipeline.py`, `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md` | Merged | 未命中仍返回固定文案，`backend/data/` 保持 gitignored |
| MQ-030 | 2026-05-10 | Review-QA | 最终整改验收完成：后端 RAG smoke test PASS，Docker 教材路径三处耦合 PASS，提交安全检查 PASS；本机无 Docker CLI，`docker compose config/up` 保留非阻塞 WARN。 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md` | Merged | Root 已采纳；下一步进入 commit/push 和飞书提交复核 |

## 快速追加模板

```text
| MQ-XXX | 时间 | 分支 | 结论 | 应合并到 | Pending | 备注 |
```
