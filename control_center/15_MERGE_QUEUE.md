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
| MQ-009 | 2026-05-10 10:14 | Docs/Report | 评分文档和技术报告草稿已补齐，已引用最新 smoke test 数据：2 本教材、20 章节、123 节点、190 边、24 决策、4.86% 压缩比；仍需回填部署链接、GitHub Public 链接、截图和公网 demo 数据策略 | `docs/`, `report/`, `README.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | Pending | 待 Root 复核并合并最终提交口径 |
| MQ-010 | 2026-05-10 10:37 | Root | 四分支 feedback 分析完成：当前从骨架期切换到前后端合流 + 提交保底；Frontend 接 8001 API，Backend 稳 schema，Docs 回填真实数据，Deploy 走 Vercel 静态保底 | `20_IMMEDIATE_BRANCH_ROUTING.md`, `10_HANDOFF.md` | Merged | 用户仍需 `gh auth login` 和 Vercel 登录 |
| MQ-011 | 2026-05-10 10:44 | Build-Frontend | 前端分支封版：编辑部医学评审稿风格可作为演示前端，后续不再追加视觉；只保留 API 对齐、部署验证和阻塞 bug 修复 | `10_HANDOFF.md`, `09_TASK_TREE.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Merged | Frontend 无阻塞 |
| MQ-012 | 2026-05-10 10:44 | Root | GitHub CLI 已登录账号 `zzzhhhaaannnggg6`；Deploy 下一步改为创建/确认 Public 仓库、推送并部署 | `04_SUBMISSION_CHECKLIST.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | Merged | Vercel CLI 未安装 |
| MQ-013 | 2026-05-10 11:10 | Root | Deploy 分支失效后由 Root 接管：新增 GitHub Pages workflow、Vite Pages base 配置和 Deploy 接手提示词 | `21_DEPLOY_HANDOFF.md`, `.github/workflows/pages.yml`, `frontend/vite.config.js`, `10_HANDOFF.md` | Merged | 下一步推送并检查 Actions |
| MQ-014 | 2026-05-10 | Build-Frontend 优化 | 前端视觉重排：报纸感→评审工作台感。引入 8pt 间距 Scale（--s-1..-s-8）、6px 卡片圆角；去掉 body 横条纹纹理；panel 内边距 16→24px，workspace/rails 间距 14→20/24px；panel-heading 升级为“§编号徽章 + Eyebrow + 中文标题 + 右侧徽章（达标/条数/引用数）”；workspace 新增三栏标签 I/II/III（资料源·压缩 / 图谱 / 决策·RAG）；窄屏断点 1280→1360，中栏 order:-1 置顶，右栏 2×1 等高布局。数据契约、功能、mock/API 双态不变。`npm run build` 通过（CSS 28.66KB gzip 5.69KB，JS 1.21MB gzip 399.52KB，与封版基线一致）。 | `10_HANDOFF.md`, `20_IMMEDIATE_BRANCH_ROUTING.md` | Pending | Root 复核视觉；API/部署阻塞仍在 Deploy 分支 |

## 快速追加模板

```text
| MQ-XXX | 时间 | 分支 | 结论 | 应合并到 | Pending | 备注 |
```
