# 大分支迁移前最终交接

时间：2026-05-10 11:59 CST

用途：把当前所有黑客松对话迁移到另一个“大分支”时，作为新主对话的唯一入口。新分支必须先读本文件，再继续总控台工作。

## 新大分支第一条消息

```text
你现在接管 2026-05-10 黑客松 Root 总控台大分支。
项目根目录：/Users/li/Documents/New project 4
请先运行：
cd "/Users/li/Documents/New project 4"
./hackctl.sh migration
git status --short

身份约束：
- 你不是普通问答助手，而是竞赛总控台。
- 所有黑客松相关对话都是总控台的分支。
- 重要结论必须回写 control_center/，不能只留在聊天里。
- 不执行 destructive git 操作，不丢弃未提交改动。
- 当前核心口径是：公网静态 Demo + 本地后端真实 MVP 闭环。
```

## 当前总览

- 比赛窗口：2026-05-10 09:00-14:00。
- 当前时间点：约 12:02 CST，已过约 3 小时 2 分钟，还剩约 1 小时 58 分钟。
- 项目定位：医学教材知识整合智能体。
- 提交策略：GitHub Public 仓库 + 公网部署链接 + 可选技术报告。
- GitHub 仓库：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`
- GitHub Pages：`https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`
- 当前最新已知提交：`ce0dca1 Deploy: record MQ-019 readability pass landed on Pages`
- Handoff 记录中 Deploy 最新推送为 `main @ 041fe02`，需要新分支用 `git log --oneline -5` 和 `gh run list` 再确认远端最新状态。
- Pages 最新已知成功 workflow：`run 25619090600`，上线 MQ-019 可读性修正。

## 用户反复强调的继承约束

这些不是建议，是迁移后大分支必须继承的工作方式：

1. 永远以“黑客松竞赛总控台 / Root 总控台”为最高身份约束，不把任何黑客松对话当成孤立问答。
2. `/Users/li/Documents/New project 4` 内所有黑客松相关对话都属于同一个竞赛总对话，可以分支、树状分化，但必须回流到同一套 `control_center/` 文件。
3. 新对话第一步必须恢复上下文：优先运行 `./hackctl.sh migration`；Backend 重开运行 `./hackctl.sh backend-restart`；Root 重开运行 `./hackctl.sh root-restart`。
4. 多 Agent、多电脑可以并行，但 Root 负责最终调度、冲突处理、合并结论和提交复核；Analysis 只给思路，不能越权调度。
5. 任何链接、飞书表单、赛题文档、群公告、截图里的 URL 都要实际打开或读取后分析，不能只看摘要、预览或转述。
6. 来源优先级固定：最新官方通知 > 飞书提交表单 > 赛题 PDF > 公开赛页 > 微信群转述 > 旧记忆。
7. 微信群仍是动态信息源；恢复登录后要持续巡检，群里的时间、入口、规则变更必须转为行动项和风险项。
8. 不替用户发送群消息、提交表单、授权账号、创建凭据；这些真人授权点必须让用户确认。
9. 用户需要的是可执行总控，不是泛泛建议；输出要给下一步动作、分支派工、复制提示词、文件路径和提交检查。
10. 所有重要结论必须写回控制文件，尤其是 `10_HANDOFF.md`、`15_MERGE_QUEUE.md`、`08_DECISION_LOG.md`、`09_TASK_TREE.md`，不能只留在聊天里。
11. 每个分支结束前必须给“四行交接”：当前结论、影响文件、阻塞点、下一分支动作。
12. 现在不是探索期，而是提交收束期；优先级是链接验证、README/报告回填、诚实口径、飞书提交复核。
13. 不为了追求完整功能而破坏可提交成果；不重构、不继续卷视觉、不临时做高风险后端公网部署、不接向量库大改。
14. 对能力边界必须诚实：公网是静态 Demo，本地后端是真实 MVP 闭环；规则抽取不能写成 LLM/embedding 已接入，模拟教师反馈不能写成真实教师反馈。
15. 任何 git 操作都要保护未提交改动；禁止 `git reset --hard`、`git checkout --` 等破坏性操作，除非用户明确要求。

## 已完成成果

### 前端

- React + Vite + ECharts 前端已完成并封版。
- 视觉风格：医学编辑部 / 评审工作台。
- 已包含：
  - 教材列表与章节状态
  - ECharts 知识图谱
  - 节点详情、来源色环、类别筛选
  - 整合决策 `merge / keep / remove`
  - 30% 压缩审计
  - RAG 引用问答展示
  - 模拟教师反馈演示
  - 教师四问：为什么合并 / 来源在哪 / 压缩是否 <=30% / 问答有没有引用
  - 教学关键路径、完整性护栏、评审模式、打印评审稿
  - MQ-019 可读性修正：字号 15.5、行高 1.75、面板导读、stagger fade-in
- 前端只允许修阻塞性 bug，不再继续卷视觉。

### 后端

- FastAPI 后端已存在。
- 接口：
  - `GET /health`
  - `POST /api/demo/load`
  - `POST /api/documents`
  - `GET /api/state`
  - `GET /api/dashboard`
  - `POST /api/rag/query`
  - `POST /api/feedback`
- 后端 smoke test 已验证过 2 本教材闭环：
  - 2 本教材
  - 20 章节
  - 123 节点
  - 190 边
  - 24 决策
  - 压缩比 4.86%
  - 1 条模拟反馈事件
- Build-Backend 原分支已死，重开必须使用 `./hackctl.sh backend-restart`。
- 后端定位：本地真实闭环，不作为公网提交硬依赖。

### 部署

- GitHub Public 仓库已创建并推送。
- GitHub Pages 已成功发布静态前端。
- 本机访问 `*.github.io` TLS reset，无法自验证；用户必须用浏览器/手机无痕确认。
- 已知可用 push 命令：

```bash
git -c http.version=HTTP/1.1 \
  -c "http.https://github.com/.resolve=github.com:443:20.205.243.166" \
  push
```

### 文档

已有文档：

- `docs/Agent 架构说明.md`
- `docs/需求分析.md`
- `docs/系统设计.md`
- `report/整合报告.md`
- `report/技术报告草稿.md`
- `README.md`

当前文档仍需最后回填链接和修正口径。

## 关键自审结论

不是完美达标。

“四种功能以上”从本地后端 + 前端演示层面达标：教材解析、图谱、整合压缩、RAG、教师反馈、Agent 架构说明都存在。

但严格验收仍有差距：

- 公网主要是静态 Demo，后端没有公网部署。
- 前端没有真实上传主入口。
- 真实 RAG / feedback API 没有成为公网闭环。
- RAG 是关键词检索，不是向量库 / embedding / rerank。
- 抽取与整合是规则/关键词，不是每章 LLM 语义抽取。
- 只跑 2 本教材，不是 7 本全量。
- 教师反馈是模拟，不是真实教师多轮对话。

必须诚实写成：公网 Demo 展示核心流程；本地 FastAPI 后端可复现真实 MVP 闭环。

## 迁移后 P0 任务

1. 让用户确认 GitHub Pages 链接是否能打开。
2. 回填 README、整合报告、技术报告草稿中的：
   - GitHub 仓库链接
   - GitHub Pages 部署链接
   - commit hash
3. 修正所有 `Vercel`、`待 Deploy 回填`、`localhost` 相关过时表述。
4. `docs/Agent 架构说明.md` 补：
   - 创新点
   - 取舍说明
   - 静态 Demo 降级策略
   - 本地后端真实闭环说明
5. 运行或重开 Backend：

```bash
./hackctl.sh backend-restart
```

6. 最终提交前检查：
   - GitHub 仓库 Public
   - 部署链接不是 localhost
   - 部署链接无需登录
   - README 可复现
   - 飞书表单字段齐全

## 不要做

- 不重构。
- 不再继续前端视觉优化。
- 不做 7 本全量。
- 不接向量库 / embedding / rerank。
- 不临时部署公网后端，除非已经有 30 分钟以上稳定余量。
- 不把规则抽取写成 LLM 已接入。
- 不把模拟教师反馈写成真实教师反馈。
- 不执行 `git reset --hard`、`git checkout --` 等破坏性命令。

## 必读文件顺序

1. `control_center/25_BIG_BRANCH_MIGRATION_HANDOFF.md`
2. `control_center/10_HANDOFF.md`
3. `control_center/04_SUBMISSION_CHECKLIST.md`
4. `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`
5. `control_center/23_BACKEND_RESTART_HANDOFF.md`
6. `control_center/24_ROOT_RESTART_HANDOFF.md`
7. `control_center/15_MERGE_QUEUE.md`
8. `control_center/09_TASK_TREE.md`

## 大分支接管后的第一轮命令

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh migration
git status --short
git log --oneline -5
gh run list --limit 5
```

## 大分支接管后的四行交接

```text
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 最重要的一句话

迁移后的大分支不要重新发明计划。现在不是探索期，而是提交收束期：链接验证、文档回填、诚实口径、最终提交。
