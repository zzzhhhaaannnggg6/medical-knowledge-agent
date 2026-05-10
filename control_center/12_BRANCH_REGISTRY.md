# 对话分支注册表

## 使用原则

每个黑客松相关对话都要归入一个分支。分支可以并行，但结论必须回流到总控台。

## 固定分支

| ID | 分支 | 职责 | 必读文件 | 产出 | 禁止事项 | 回流文件 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Root | 主总控台 | 最终合并、冲突处理、提交状态 | `07_CONVERSATION_SYNC.md`, `10_HANDOFF.md`, `09_TASK_TREE.md`, `15_MERGE_QUEUE.md` | 统一结论、下一步调度 | 不绕过来源核验 | `08_DECISION_LOG.md`, `09_TASK_TREE.md`, `10_HANDOFF.md` | Active |
| Analysis | 思路分析 | 赛题目标、评分点、MVP、技术路线 | `06_MVP_DECISION_BOARD.md`, `09_TASK_TREE.md`, `14_SOURCE_INDEX.md`, `16_AGENT_BEGINNER_PROTOCOL.md` | idea、MVP 取舍、技术路线建议 | 不分配任务；不处理反馈；不代替 Root 调度；赛题未到前不锁最终技术栈；不急着写代码 | `06_MVP_DECISION_BOARD.md`, `08_DECISION_LOG.md`, `15_MERGE_QUEUE.md` | Active |
| WeChat | 群消息核验 | 微信群通知、链接、时间变更 | `03_WECHAT_AND_LINK_AUDIT.md`, `14_SOURCE_INDEX.md` | 已核验通知和行动项 | 不凭转述或预览做决定 | `03_WECHAT_AND_LINK_AUDIT.md`, `14_SOURCE_INDEX.md`, `15_MERGE_QUEUE.md` | Blocked: 微信需恢复 |
| Build | 开发执行 | 代码、功能、README | `06_MVP_DECISION_BOARD.md`, `09_TASK_TREE.md`, `10_HANDOFF.md` | 可运行项目、提交记录 | 不无视 MVP；不最后 20 分钟重构 | `09_TASK_TREE.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md` | Waiting |
| Build-Frontend | 前端执行 | React 页面、ECharts 图谱、整合/RAG/反馈面板 | `17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`, `18_PHASE_TASK_BREAKDOWN.md` | 可演示 UI、交互状态、前端 README 片段 | 不等后端全好才开始；不改后端核心逻辑 | `09_TASK_TREE.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md` | Waiting |
| Build-Backend | 后端执行 | FastAPI、解析、抽取、整合、RAG、反馈接口 | `06_MVP_DECISION_BOARD.md`, `18_PHASE_TASK_BREAKDOWN.md`, `23_BACKEND_RESTART_HANDOFF.md` | 可运行 API、数据结构、样例结果 | 不一开始处理全量 824MB；不改前端主布局 | `09_TASK_TREE.md`, `10_HANDOFF.md`, `15_MERGE_QUEUE.md` | Restart prepared: 原分支已死 |
| Deploy | 部署提交 | GitHub Public、部署 URL、飞书表单 | `04_SUBMISSION_CHECKLIST.md`, `11_SUBMISSION_URL_GUIDE.md` | 可提交链接和最终复核 | 不提交 localhost；不提交 Private 仓库 | `04_SUBMISSION_CHECKLIST.md`, `08_DECISION_LOG.md`, `10_HANDOFF.md` | Waiting |
| Report | 技术报告 | 飞书技术报告和加分说明 | `05_TECH_REPORT_TEMPLATE.md`, `11_SUBMISSION_URL_GUIDE.md`, `26_DOCS_RESTART_HANDOFF.md` | 可公开访问的报告链接 | 不写无法验证的夸张描述；不改代码 | `04_SUBMISSION_CHECKLIST.md`, `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Restart prepared: 原分支已死 |
| Review | AI 评审建议 | 第 2 小时反馈后的提分路线 | `15_MERGE_QUEUE.md`, `09_TASK_TREE.md` | 提分项优先级 | 不做低收益大改 | `08_DECISION_LOG.md`, `09_TASK_TREE.md`, `10_HANDOFF.md` | Waiting |
| Deploy-Docker | AI 初审部署整改 | Dockerfile、docker-compose、README Quick Start | `27_AI_REVIEW_FIX_DISPATCH.md`, `04_SUBMISSION_CHECKLIST.md`, `README.md` | Docker/Compose 配置和一键运行说明 | 不改业务逻辑；不提交教材/密钥 | `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Ready |
| Docs-Prompt | AI 初审文档整改 | prompts.md、决策对照表、RAG Pipeline 详解 | `27_AI_REVIEW_FIX_DISPATCH.md`, `docs/Agent 架构说明.md`, `README.md` | Prompt 工程文档和架构补充 | 不改代码；不虚构真实 LLM | `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Ready |
| Backend-RAG | AI 初审后端整改 | 低风险混合检索与 smoke test | `27_AI_REVIEW_FIX_DISPATCH.md`, `23_BACKEND_RESTART_HANDOFF.md`, `backend/app/pipeline.py` | 可回退 RAG 检索增强 | 不引入不可控大模型下载；不破坏 smoke test | `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Ready |
| Frontend-Sankey | AI 初审前端冲分 | 可选决策桑基图 | `27_AI_REVIEW_FIX_DISPATCH.md`, `frontend/src/main.jsx`, `frontend/src/styles.css` | 决策流向创新视图 | 未经 Root 开启不得动前端封版 | `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Optional |
| Review-QA | AI 初审整改验收 | 逐项 PASS/WARN/FAIL | `27_AI_REVIEW_FIX_DISPATCH.md`, `04_SUBMISSION_CHECKLIST.md`, `README.md` | 验收清单和剩余风险 | 不主动改代码 | `15_MERGE_QUEUE.md`, `10_HANDOFF.md` | Ready |

## 分支登记模板

```text
时间：
分支：
输入：
当前结论：
影响文件：
阻塞点：
下一分支动作：
是否已回流：
```
