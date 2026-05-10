# 跨对话交接

## 当前目标

建立并维护 5 月 10 日黑客松总控台。所有黑客松相关对话都作为该总控台的分支，最终回写到同一套控制文件。

当前对话定位：Root 总控台。负责采纳 Analysis 结论、分化阶段任务、调度 Build/Docs/Deploy/Review 分支、处理反馈和最终提交复核。

Agent 小白模式已启用：用户只需贴赛题、群消息、截图文字或链接；Root 总控台负责把材料转成任务、风险、决策和下一步动作。

边界提醒：Analysis 只提供 idea 和分析建议；Root 负责分配任务、处理反馈、合并结论和最终调度。

## 已完成

- 建立本地总控台目录：`/Users/li/Documents/New project 4`
- 建立入口脚本：`./hackctl.sh`
- 建立赛前预检、比赛时间轴、微信群核验、提交检查、技术报告模板、MVP 决策板
- 安装并确认 `gh 2.92.0`
- 安装并确认 `lark-cli 1.0.27`
- 确认 7 本教材 PDF 在 `/Users/li/Desktop/黑客松/textbooks`
- 核验公开赛页与飞书提交表单
- 建立跨对话同步规则、决策记录、任务树和交接文件
- 2026-05-09 23:20 二次验证：运行环境、教材数量、公开赛页、ModelScope 首页均正常
- 2026-05-09 23:22 结构化解析飞书提交表单，确认姓名、学号、GitHub 仓库链接、部署链接必填，技术报告选填
- 新增提交 URL 指南：`control_center/11_SUBMISSION_URL_GUIDE.md`
- 2026-05-09 23:31 思路分析分支已恢复上下文并回写分支职责；赛题未到前不做最终功能和技术栈决策
- 2026-05-10 增强多对话流通机制：新增分支注册表、同步协议、来源索引、合并队列，以及 `hackctl.sh live/reentry` 入口
- 2026-05-10 固化 Agent 小白总控对话协议：新增 `control_center/16_AGENT_BEGINNER_PROTOCOL.md`，新增快捷入口 `./hackctl.sh agent`
- 2026-05-10 明确 Analysis 分支边界：只同步思路、MVP 取舍、技术路线和风险建议；Root 总控台负责派工与反馈处理
- 2026-05-10 Analysis 分支已解析正式赛题 PDF，产出 `control_center/17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`
- 2026-05-10 确认 7 本教材实际目录为 `/Users/li/Desktop/黑客松/textbooks`，旧目录 `/Users/li/Desktop/textbooks` 已过时
- 2026-05-10 Analysis 分支完成阶段划分与任务分化建议，产出 `control_center/18_PHASE_TASK_BREAKDOWN.md`
- 2026-05-10 已补充细节核对清单，明确 30% 压缩公式、字数统计口径、知识点粒度、重复判定、RAG 引用、教师反馈和文档评分细节
- 2026-05-10 Root 正式采纳 09:00-14:00 五阶段执行表，并将 `control_center/18_PHASE_TASK_BREAKDOWN.md` 升级为正式执行板
- 2026-05-10 用户授权多 Agent / 多电脑并行分派，已固化 Root、Build-Frontend、Build-Backend、Docs/Report、Deploy、Review、WeChat 执行单元
- 2026-05-10 新增 `control_center/19_MULTI_AGENT_DISPATCH.md` 和 `./hackctl.sh dispatch`，用于复制分支提示词到其他 Agent/电脑
- 2026-05-10 Build-Frontend 分支完成前端骨架：`frontend/` 可本地启动，包含 mock/API 双态、ECharts 知识图谱、教材解析、整合压缩、RAG 引用问答和模拟教师反馈面板
- 2026-05-10 10:12 Deploy 分支发现 `frontend/` Vite/React 前端，补齐 `.gitignore` 和 Vercel 静态部署配置；当前以静态前端 Demo 数据兜底作为提交保底路线
- 2026-05-10 10:18 Deploy 分支本地验证：前端生产构建通过、`npm audit` 0 漏洞；后端本地冒烟通过，但默认 demo 依赖本机教材路径，暂不作为公网部署硬依赖
- 2026-05-10 Build-Backend 分支完成 FastAPI 后端：`/health`、`/api/dashboard`、`/api/demo/load`、`/api/documents`、`/api/state`、`/api/rag/query`、`/api/feedback`；本地 smoke test 在 `http://127.0.0.1:8001` 通过
- 2026-05-10 10:14 Docs/Report 分支补齐评分文档和技术报告草稿，记录最新 smoke test 数据：2 本教材、20 章节、123 节点、190 边、24 决策、压缩比 4.86%、1 条模拟反馈事件

## 当前阻塞

- 微信客户端触发账号安全重新登录并黑屏，需要用户手动恢复。
- ModelScope 是否必须使用尚未从赛题中发现强制要求；当前仅作为可选/建议资源。
- GitHub CLI 尚未登录，需要用户运行 `gh auth login`，否则无法创建/确认 Public 仓库和推送。
- 飞书 CLI 尚未配置；如比赛需要 CLI，则运行 `lark-cli config init --new`。
- Vercel 尚未登录/部署，当前还没有公网部署 URL。
- FastAPI 后端已有本地版本，但公网 Render 部署前需要 Build-Backend 去除对本机教材路径的默认依赖或提供远端安全 demo 数据。
- 端口 `8000` 已释放；`8001` 当前有后端服务可用，Root/Frontend 对接前仍需确认服务进程归属和接口路径。

## 下一步

1. 用户恢复微信登录后，说：`微信好了，继续看群`。
2. 总控台继续读取微信群历史，补写到 `03_WECHAT_AND_LINK_AUDIT.md`。
3. 开赛前运行：

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh sync
./hackctl.sh live
./hackctl.sh status
./hackctl.sh submit-guide
```

4. Root 总控台按 `control_center/18_PHASE_TASK_BREAKDOWN.md` 派工。
5. 立即进入多 Agent 分化：Build-Frontend 对接后端 `8001` API；Docs/Report 等待截图、部署链接和最终数据后回填报告；Deploy 确认 GitHub Public 和部署路线。
6. 先用 2 本教材跑通闭环，再扩展到 7 本报告。
7. Deploy 分支下一步：完成 `frontend` 构建预检；用户完成 `gh auth login` 后创建/推送 Public 仓库；用户完成 Vercel 登录后生成公网 URL 并无痕验证。
8. 如果用户忘记怎么使用本对话，运行 `./hackctl.sh agent`；如果要看阶段表，运行 `./hackctl.sh phase`；如果要派多个 Agent，运行 `./hackctl.sh dispatch`。

## 新对话恢复提示

如果这是一个新的黑客松对话，先读取：

- `control_center/07_CONVERSATION_SYNC.md`
- `control_center/10_HANDOFF.md`
- `control_center/09_TASK_TREE.md`
- `control_center/08_DECISION_LOG.md`
- `control_center/12_BRANCH_REGISTRY.md`
- `control_center/15_MERGE_QUEUE.md`
- `control_center/16_AGENT_BEGINNER_PROTOCOL.md`
- `control_center/17_PROBLEM_ANALYSIS_MEDICAL_KNOWLEDGE_AGENT.md`
- `control_center/18_PHASE_TASK_BREAKDOWN.md`
- `control_center/19_MULTI_AGENT_DISPATCH.md`
