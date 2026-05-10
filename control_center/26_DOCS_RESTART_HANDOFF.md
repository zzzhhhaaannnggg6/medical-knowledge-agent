# Docs/Report 重开交接手卡

时间：2026-05-10 12:56 CST

用途：原 Docs/Report 文档分支失效时，给新文档分支直接接手。新分支只做提交收束、链接回填、口径一致性和文档检查，不重新分析赛题、不改代码。

## 新对话第一句话

```text
你现在是 5 月 10 日黑客松总控台的 Docs/Report 重开分支。主项目根目录是 /Users/li/Documents/New project 4；接力总控台在 /Users/li/Documents/New project 6。
请先运行或读取：
cd "/Users/li/Documents/New project 4"
./hackctl.sh docs-restart
然后只负责文档收尾：README、docs/Agent 架构说明.md、report/整合报告.md、report/技术报告草稿.md、提交链接和诚实口径。
不要改前端、后端或部署配置。
对话结束前必须输出四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 必读文件

- `control_center/25_BIG_BRANCH_MIGRATION_HANDOFF.md`
- `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`
- `control_center/04_SUBMISSION_CHECKLIST.md`
- `control_center/10_HANDOFF.md`
- `docs/Agent 架构说明.md`
- `docs/需求分析.md`
- `docs/系统设计.md`
- `report/整合报告.md`
- `report/技术报告草稿.md`
- `README.md`

## 当前文档状态

- `docs/Agent 架构说明.md` 已补公网 GitHub Pages 静态 Demo + 本地 FastAPI 后端真实闭环、创新点、取舍说明。
- `report/整合报告.md` 已补 2 本教材 smoke test 数据、图谱/整合/压缩/RAG/模拟反馈结果、GitHub 仓库链接和 GitHub Pages 部署链接。
- `report/技术报告草稿.md` 已补技术架构、当前验证数据、教师四问、GitHub 仓库链接和 GitHub Pages 部署链接。
- `README.md` 仍需最终检查：部署口径、运行方式、链接、已知限制要和报告一致。
- 若接力总控台 `/Users/li/Documents/New project 6` 有更新，先读取其 `./hackctl.sh relay` 或 README，再回主项目改文件。

## 当前提交链接

- GitHub 仓库：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`
- GitHub Pages：`https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`
- 当前本地最新提交：`ce0dca1 Deploy: record MQ-019 readability pass landed on Pages`
- Handoff 中 Deploy 曾记录 `main @ 041fe02` 和 Pages workflow `25619090600`；新分支需用 `git log --oneline -5` 和 `gh run list --limit 5` 复核，不要盲信旧记录。

## 必须统一的诚实口径

使用：

```text
公网部署提供 GitHub Pages 静态 Demo，用于展示核心流程、教师四问和样例结果；本地 FastAPI 后端用于复现真实教材解析、图谱构建、整合压缩、RAG 引用问答和模拟教师反馈闭环。
```

禁止：

- 不把公网静态 Demo 写成公网后端。
- 不把规则抽取写成 LLM / embedding / vector DB 已完成。
- 不把关键词 RAG 写成向量化 RAG。
- 不把模拟教师反馈写成真实教师多轮对话。
- 不把 2 本教材页窗 smoke test 写成 7 本教材全量整合。

## 新 Docs 分支 P0 任务

1. 全仓搜索并修正过时词：

```bash
rg -n "Vercel|待 Deploy|待提交前|localhost|127.0.0.1|真实教师|向量|embedding|ModelScope|7 本|全量" README.md docs report control_center
```

2. 检查 README 是否包含项目简介、环境依赖、前端启动、后端启动、smoke test 8001、GitHub 链接、Pages 链接、边界说明、已知限制。
3. 检查 `docs/Agent 架构说明.md` 是否包含架构总览、Agent 职责、数据流图、设计取舍、创新点、失败与降级、诚实边界。
4. 检查 `report/整合报告.md` 是否包含输入教材、解析统计、图谱统计、整合决策、压缩公式、RAG 引用、模拟反馈、提交链接。
5. 若没有飞书技术报告链接，不要硬填；保留为可选项，并由 Root 决定是否填写。

## 禁止事项

- 不改 `frontend/`。
- 不改 `backend/app/`。
- 不改部署 workflow。
- 不追求长篇扩写，优先一致、准确、可提交。
- 不删除其他分支留下的未提交改动。

## 完成后回报 Root

```text
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

推荐完成结论：

```text
Docs/Report 重开完成：README、Agent 架构说明、整合报告、技术报告草稿的链接和诚实口径已对齐；仍需 Root 确认 GitHub Pages 无痕可打开，并决定是否提交飞书技术报告链接。
```
