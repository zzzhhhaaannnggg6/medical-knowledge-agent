# 5 小时黑客松 Root 阶段执行板

## 状态

- 采纳分支：Root 总控台
- 输入来源：Analysis 分支赛题解读、用户确认的时间分配、多 Agent / 多电脑并行授权
- 比赛窗口：2026-05-10 09:00-14:00
- 核心作品：医学教材知识整合智能体
- 默认栈：React + FastAPI + ECharts Graph + JSON/SQLite
- 数据策略：先用 2 本教材跑通闭环，7 本教材作为报告和加分扩展

## 总原则

- 先交付可运行、可部署、可提交的 MVP，再做加分项。
- 多 Agent / 多电脑可以并行，但必须由 Root 统一合并状态。
- 最后 30 分钟停止新增功能，只修提交阻塞问题。
- 文档与开发并行，`Agent 架构说明` 优先级高于普通 README 打磨。
- 教材路径统一使用 `/Users/li/Desktop/黑客松/textbooks`，教材 PDF 不进入 GitHub。
- 所有页面围绕老师问题设计：为什么合并、依据在哪、压缩后缺不缺、问答是否可信。

## 阶段总览

| 时间 | 阶段 | 主目标 | Root 验收口径 |
| --- | --- | --- | --- |
| 09:00-09:30 | 骨架期 | React + FastAPI 跑通，文档骨架出现 | 前端可打开，后端 `/health` OK，README 有启动命令草稿 |
| 09:30-12:00 | P0 功能期 | 文件解析、图谱、整合压缩、RAG、对话闭环 | 2 本教材形成解析 -> 图谱 -> 整合 -> 压缩统计 -> 引用问答 |
| 12:00-13:00 | 文档主攻期 | 补齐高分文档，同时完成教师反馈 | 文档能解释粒度、重复判定、30% 口径、RAG 引用和反馈机制 |
| 13:00-13:30 | 部署期 | GitHub Public + 公网部署链接 | 非 localhost 部署链接可打开，仓库无教材 PDF 和密钥 |
| 13:30-14:00 | 提交复核期 | 停止新增功能，检查飞书提交 | GitHub、部署、报告权限逐项打开验证 |

## 09:00-09:30 骨架期

Build-Frontend：

- 初始化 React + Vite 前端。
- 做基础页面：教材区、知识图谱区、整合/RAG/反馈区。
- 用 mock 数据先把页面和状态流跑通。

Build-Backend：

- 初始化 FastAPI 后端。
- 提供 `/health` 和基础 API 结构。
- 准备 JSON/SQLite 数据层，先支持本地样例数据。

Docs：

- 创建 `docs/Agent 架构说明.md`、`docs/需求分析.md`、`docs/系统设计.md`、`report/整合报告.md`。
- README 写入本地启动命令草稿和不要提交教材 PDF 的说明。

Deploy：

- 确认 GitHub 登录与仓库策略。
- `.gitignore` 必须排除 `.env`、缓存、教材 PDF。

通过标准：

- 浏览器能打开前端。
- 后端健康检查返回 OK。
- README 有前后端启动命令。

## 09:30-12:00 P0 功能期

09:30-10:20 文件解析与章节结构：

- Build-Backend 支持 PDF/MD/TXT，PDF 稳定优先。
- Build-Frontend 显示文件名、格式、大小、解析状态、章节数量。
- 章节结构至少包含章节名、页码或页范围、字符数。

10:20-11:00 知识点抽取与单本图谱：

- Build-Backend 抽取概念、定义、类别、章节、页码、来源教材。
- Build-Frontend 用 ECharts Graph 展示节点和边，支持缩放拖拽、点击详情。
- 关系类型至少覆盖 3 类，例如 `contains`、`prerequisite`、`related`。

11:00-11:30 跨教材整合与压缩：

- Build-Backend 至少对 2 本教材生成 `merge / keep / remove` 决策。
- 每条决策有受影响节点、结果节点、理由、置信度。
- Build-Frontend 显示原始总字数、整合后字数、压缩比和是否 `<= 30%`。

11:30-12:00 RAG 问答：

- Build-Backend 返回回答、教材、章节、页码、相关度和原文片段。
- 找不到时返回“当前知识库中未找到相关信息”。
- embedding 不稳时使用 TF-IDF/关键词检索兜底，并在文档说明。

通过标准：

- 2 本教材形成“解析 -> 图谱 -> 整合 -> 压缩统计 -> 引用问答”闭环。
- 前端能解释为什么合并、来源在哪、压缩后是否达标。

## 12:00-13:00 文档主攻期

Docs 优先级：

1. `docs/Agent 架构说明.md`
2. `docs/需求分析.md`
3. `docs/系统设计.md`
4. `report/整合报告.md`
5. `README.md`

Build 只补教师反馈：

- 明确标注为“模拟教师反馈”。
- 至少支持保留、拆分、合并、删除中的一种真实可执行修改。
- 反馈后能改变一条整合决策，并刷新图谱或决策列表。

Root：

- 把当前实现映射到评分点。
- 砍掉未开始的低收益功能，不做复杂多 Agent、多视图图谱、DOCX/Excel、Docker。

通过标准：

- 文档能解释知识点粒度、重复判定、30% 压缩口径、教学完整性、RAG 引用和教师反馈机制。
- 整合报告数据与系统展示一致。

## 13:00-13:30 部署期

Deploy：

- 创建或确认 Public GitHub 仓库。
- 确认仓库不包含教材 PDF、`.env`、token、cookie、私钥。
- 部署到公网，部署链接不能是 `localhost` 或 `127.0.0.1`。
- 如果后端部署不稳，前端必须展示可用 Demo 数据和 API 说明。

Build：

- 修启动错误、跨域、环境变量和基础异常提示。
- 模型失败时页面不能白屏，要显示可理解提示或演示数据。

Docs：

- README 写入部署链接、本地运行、配置说明和已知限制。

通过标准：

- 无登录状态也能打开部署链接。
- GitHub 仓库 Public。
- README 能让另一个开发者跑起来。

## 13:30-14:00 提交复核期

Root：

- 停止新增功能，只修提交阻塞问题。
- 检查飞书表单字段：姓名、学号、GitHub 仓库链接、部署链接。
- 如果有技术报告，检查飞书文档互联网访问权限。

Deploy：

- 无痕或新窗口打开 GitHub 仓库、部署链接、技术报告链接。
- 记录最终 commit hash、部署 URL、提交时间。

有余力才做 P2 技术报告：

- 优先主题 1：不同 chunk 大小对 RAG 引用准确率的影响。
- 优先主题 2：不同合并阈值对重复知识点识别的影响。

通过标准：

- 飞书表单字段完整。
- GitHub 和部署链接都能打开。
- 最后 20 分钟不重构、不新增重功能。

## 多 Agent / 多电脑分派

| 执行单元 | 职责 | 必读 | 产出 | 禁止 |
| --- | --- | --- | --- | --- |
| Root | 时间线、取舍、评分点对齐、最终提交检查 | `18_PHASE_TASK_BREAKDOWN.md`, `10_HANDOFF.md`, `09_TASK_TREE.md` | 决策、合并、派工、最终复核 | 不跳过来源核验 |
| Build-Frontend | 页面骨架、图谱、整合/RAG/反馈面板 | `17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`, `18_PHASE_TASK_BREAKDOWN.md` | 可演示前端 | 不等后端全好才开始 |
| Build-Backend | 解析、抽取、整合、RAG、反馈接口 | `06_MVP_DECISION_BOARD.md`, `18_PHASE_TASK_BREAKDOWN.md` | 可运行 API 和数据闭环 | 不一开始处理全量 824MB |
| Docs/Report | 文档、整合报告、技术报告草稿 | `17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`, `18_PHASE_TASK_BREAKDOWN.md` | 高分文档 | 不写无法验证的夸张描述 |
| Deploy | GitHub、部署、飞书提交预检 | `04_SUBMISSION_CHECKLIST.md`, `11_SUBMISSION_URL_GUIDE.md` | Public 仓库、公网链接 | 不提交 localhost 或 Private 仓库 |
| Review | 第 2 小时 AI 评审建议 | `09_TASK_TREE.md`, `15_MERGE_QUEUE.md` | 提分优先级 | 不做低收益大改 |
| WeChat | 群通知和链接核验 | `03_WECHAT_AND_LINK_AUDIT.md`, `14_SOURCE_INDEX.md` | 已核验通知 | 不凭截图预览决策 |

## 多端同步规则

- 每个 Agent / 每台电脑开工前先读 `./hackctl.sh reentry` 和 `./hackctl.sh phase`。
- 每个分支结束必须给四行交接：当前结论、影响文件、阻塞点、下一分支动作。
- 重要结论回写到 `15_MERGE_QUEUE.md`，由 Root 决定是否进入正式文件。
- 代码分支尽量按前端、后端、文档、部署分开，避免多人改同一文件。
- 不同电脑如果同步代码，必须先 `git status`，不要覆盖他人未合并修改。

## 检查项

- 本地测试：前端页面可打开，后端健康检查通过。
- 功能测试：至少 2 本教材能生成章节、节点、边、整合决策和压缩比。
- RAG 测试：回答含教材、章节、页码；未命中时明确说未找到。
- 反馈测试：模拟教师反馈能改变一条整合决策。
- 提交测试：GitHub Public、公网部署链接、README、飞书表单链接齐全。
- 文档测试：只看文档也能理解系统目标、架构、Agent 流程、压缩逻辑、引用策略和取舍。
