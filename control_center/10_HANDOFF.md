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
- 2026-05-10 Build-Backend 分支收窄为 API 对齐：只保证 `/api/dashboard` 字段契约稳定，供前端通过 `VITE_API_BASE` 读取；不再扩后端新功能
- 2026-05-10 10:14 Docs/Report 分支补齐评分文档和技术报告草稿，记录最新 smoke test 数据：2 本教材、20 章节、123 节点、190 边、24 决策、压缩比 4.86%、1 条模拟反馈事件
- 2026-05-10 10:37 Root 分析四个分支 feedback，新增 `control_center/20_IMMEDIATE_BRANCH_ROUTING.md`；当前目标从骨架期切换为前后端合流 + 提交保底
- 2026-05-10 Build-Frontend 优化分支完成视觉升级：确立"编辑部评审工作台"风格（象牙纸底 + 深墨藏青 + 印章式决策标识），新增顶部"教师四问"评审栏（§1 为什么合并 / §2 来源在哪 / §3 压缩≤30% / §4 问答有引用）与点击滚动跳转、图谱节点来源色环+类别筛选+教学关键路径标记、节点详情书脊色带、压缩刻度尺 0-50%、决策钢印、教师批注 diff toast、RAG 批注式引用（书脊+相关度条+引号装饰）。保持 mock/API 双态、数据契约不变。`cd frontend && npm run build` 通过（CSS 22.14KB gzip 4.64KB，JS 1.2MB gzip 398KB，与 echarts 体积基线一致）。
- 2026-05-10 Build-Frontend 优化分支对照赛题评分表（C 图谱 13 分 + F 自由发挥 10 分）追加四项押题特性：① 图谱"教学关键路径"高亮（稳态→细胞损伤→炎症→免疫应答→教学节点），路径节点加翠绿外环，路径边加粗翠绿；② 教学完整性护栏告警，教师把关键节点改为 remove 就弹红色动画警告，直接押 F 分创新点；③ 顶部"评审模式"一键按钮，依次滚动 §1-§4 再触发一次教师 diff，解决"老师一眼看懂"问题；④ 打印评审稿（@media print：去掉交互控件、保留印章/书脊色、A4 页边距、避免分页破相），方便老师带走实物；⑤ RAG 加 4 个快捷提问 chip 含 1 个红色"抽考"选项演示未命中"当前知识库中未找到相关信息"。`npm run build` 通过（CSS 25.66KB gzip 5.30KB，JS +3KB）。
- 2026-05-10 10:44 Root 采纳前端分支封版通告：Build-Frontend 已可作为演示前端使用，不再继续追加视觉；后续只允许修阻塞性 bug、API 字段对齐和部署问题。
- 2026-05-10 10:44 Root 确认 `gh auth status` 已登录 GitHub 账号 `zzzhhhaaannnggg6`；GitHub 阻塞从“登录”切换为“创建/确认 Public 仓库并推送”。
- 2026-05-10 11:10 Deploy 原分支失效，Root 临时接管；新增 GitHub Pages 部署工作流和 `control_center/21_DEPLOY_HANDOFF.md`，部署路线从 Vercel CLI 降级为 GitHub Pages。
- 2026-05-10 Build-Frontend 优化分支完成视觉重排：把"信息密集报纸"改为"医学评审工作台"。引入 8pt 间距 Scale 和 6px 卡片圆角；去掉 body 横条纹纹理；panel padding 16→24、workspace gap 14→24；所有面板标题统一为“§编号黑底徽章 + Eyebrow 英文 + 中文标题 + 右侧胶囊徽章（达标 / 条数 / 引用数 / 已解析比例）”；workspace 加三栏标签 I 资料源·压缩 / II 图谱 / III 决策·RAG；窄屏断点 1280→1360，中栏 order:-1 置顶，右栏两列等高；其它功能、mock/API 双态、数据契约、图谱交互均不变。`cd frontend && npm run build` 通过（CSS 28.66 KB gzip 5.69 KB，JS 1.21 MB gzip 399.52 KB，与封版基线一致）。
- 2026-05-10 Docs/Report 分支已把前端“教师四问”（为什么合并 / 来源在哪 / 压缩≤30% / 问答有引用）写入 `report/整合报告.md` 和 `report/技术报告草稿.md`，并预留 GitHub、部署、技术报告链接和四类截图位置。
- 2026-05-10 Build-Frontend 优化分支追加层次感+交互感升级：app-header 与 reviewer-bar 双层 sticky + 背景雾化；IntersectionObserver 随滚动高亮当前章节 reviewer-card（左侧色条滑出 + 阴影加深）；数字键 1-4 跳 §1-§4，⌘/Ctrl+K 聚焦 RAG 搜索；diff-toast 改为右上角 fixed 滑入+图章按压动画；citation 相关度条 scaleX 补间；教学路径 chip 呼吸脉冲；decision 选中态印章斜角 + hover 右移；textbook/citation hover 轻抬起；source-legend 可点击按教材过滤，可与类别过滤叠加；`@media (prefers-reduced-motion)` 完整降级；`scroll-margin-top` 避开 sticky 遮挡。功能 / 契约 / mock-API 双态不变。`npm run build` 通过（CSS 33.06 KB gzip 6.64 KB，JS 1.21 MB gzip 400.35 KB）。
- 2026-05-10 11:22 Deploy 接手 Agent：创建 Public 仓库 `zzzhhhaaannnggg6/medical-knowledge-agent`，补跑 `e200b1b`（前任 Deploy 未推送的 Pages 工作流 + vite.config + 手卡）和 `0f51b02`（sticky header + ReviewerBar activeKey）并推送到 `main`；Pages workflow `run 25618607225` conclusion=success，目标 URL `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`；本机被 `*.github.io` TLS 重置，curl 验证不出，需用户在无痕窗口/非受限网络确认。同步清理 `git config`：移除全局 `url.https://mirrors.tuna.tsinghua.edu.cn/git/.insteadOf`，仅保留 `pushInsteadOf`，避免再次把 GitHub 推送重写到镜像。
- 2026-05-10 Build-Frontend 优化分支精修可读性与循序渐进层次：新增 `--fs-*` / `--lh-*` 变量，body 基础字号 15.5、行高 1.75；标题与正文全面上浮一档（h2 20 / 决策标题 16.5 / 决策理由 14.5 / 节点定义 15 / 答案 15.5 行高 1.85 / excerpt 14 行高 1.75 / RAG 搜索框 15 / reviewer 数字 34）；每个面板在标题下方加一行 `.panel-lede` 导读（14 italic + 虚线分隔），形成"§编号 → 标题 → 导读 → 正文"的循序；主页载入按区域 stagger fade-rise（header → reviewer-bar → rail-label → 各 panel → footer，0.02–0.52s 依次出现），`prefers-reduced-motion` 完整降级；sticky top 与 scroll-margin-top 随字号调整为 96 / 200 / 190。功能 / 契约 / mock-API 双态不变。`npm run build` 通过（CSS 34.64 KB gzip 6.97 KB，JS 1.21 MB gzip 400.83 KB）。
- 2026-05-10 11:36 Root 完成自我筛查：当前“4 种功能以上”在本地后端 + 前端演示层面达标，但不是完美达标；公网仍主要是静态 Demo，真实上传、RAG、反馈、7 本全量、向量化 RAG 和教师多轮对话存在差距。新增 `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`，后续优先补提交闭环和文档诚实口径。
- 2026-05-10 11:44 Build-Backend 原分支失效，Root 已准备重开手卡 `control_center/23_BACKEND_RESTART_HANDOFF.md`；同时准备 Root 自我重开手卡 `control_center/24_ROOT_RESTART_HANDOFF.md`，并新增 `./hackctl.sh backend-restart` 与 `./hackctl.sh root-restart`。
- 2026-05-10 11:47 Deploy 接手 Agent：根据用户反馈"不整齐、太拥挤"，代付 Build-Frontend 已写好的 MQ-019 可读性修正（`frontend/src/main.jsx` + `frontend/src/styles.css`）并推送到 main。`main @ 041fe02`，Pages workflow `run 25619090600` conclusion=success（35s）；github.io 上线字号 15.5 / 行高 1.75 / 面板 §→标题→导读→正文四段式 / 主页载入 stagger fade-in。push 实际走通路线：`git -c http.version=HTTP/1.1 -c "http.https://github.com/.resolve=github.com:443:20.205.243.166" push`（`140.82.112/113/114/121.3` 四个 IP 今天多次 75s 连接超时，`20.205.243.166` 可用）。
- 2026-05-10 12:01 Build-Backend 重开验证完成：8001 监听进程确认为本项目 `uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8001`；`BASE_URL=http://127.0.0.1:8001 ./backend/scripts/smoke_test.sh` 通过，验证 2 本教材、20 章节、123 节点、190 边、24 决策、压缩比 4.86%、1 条反馈事件、`/api/dashboard` contract 为 `dashboard.v1`。
- 2026-05-10 11:59 用户准备把所有对话迁移到另一个大分支，Root 已新增 `control_center/25_BIG_BRANCH_MIGRATION_HANDOFF.md` 和 `./hackctl.sh migration`。新大分支必须先读迁移手卡，不重新发明计划，直接进入提交收束。
- 2026-05-10 12:xx 接力 Root 已在 `/Users/li/Documents/New project 6` 建立轻量接力总控台；该目录不是新项目，只用于接力 `/Users/li/Documents/New project 4` 的 Root 调度。已回填 README、整合报告、技术报告草稿的 GitHub/Pages/commit，并补充 Agent 架构的创新点与取舍说明。
- 2026-05-10 12:56 Docs/Report 原分支失效，Root 已准备重开手卡 `control_center/26_DOCS_RESTART_HANDOFF.md`，并新增 `./hackctl.sh docs-restart`。新文档分支只做文档收尾、链接回填、诚实口径一致性和提交材料检查，不改代码。
- 2026-05-10 13:02 Docs/Report 重开分支复核：`git log --oneline -5` 最新提交为 `ce0dca1`；`gh run list --limit 5` 最新 Pages workflow `25619159653` 为 success；`curl -I -L https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/` 返回 HTTP 200。README、Agent 架构说明、整合报告、技术报告草稿、提交检查和任务树已统一“公网 GitHub Pages 静态 Demo + 本地 FastAPI 后端真实 MVP 闭环”口径。
- 2026-05-10 13:10 AI review snapshot 已提交并推送，远端 `main` 为 `d649ac2`；最新 Pages workflow `25620476724` 为 success。

## 当前阻塞

- 微信客户端触发账号安全重新登录并黑屏，需要用户手动恢复。
- ModelScope 是否必须使用尚未从赛题中发现强制要求；当前仅作为可选/建议资源。
- GitHub CLI 已登录并已推送 Public 仓库 `zzzhhhaaannnggg6/medical-knowledge-agent`，main 当前在 `d649ac2`。
- 飞书 CLI 尚未配置；如比赛需要 CLI，则运行 `lark-cli config init --new`。
- GitHub Pages 部署链接 `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/` 已由 Actions `run 25620476724` 重建并通过 `curl -I -L` 返回 HTTP 200；仍建议用户用浏览器无痕确认页面交互和移动/桌面显示。
- 本机 `github.com:443` 直连被限速/拦截，`140.82.*` 段多次 75s 超时；当前已知可用 IP 为 `20.205.243.166`，push 命令：`git -c http.version=HTTP/1.1 -c "http.https://github.com/.resolve=github.com:443:20.205.243.166" push`。
- FastAPI 后端仍依赖本机教材路径 `/Users/li/Desktop/黑客松/textbooks` 生成 demo 数据；不要把后端作为公网提交依赖，静态前端 Demo 继续作为提交保底。
- 端口 `8000` 已释放；`8001` 已确认是本项目 FastAPI 后端，health、demo load、RAG、feedback 和 `/api/dashboard` smoke test 均通过。
- 自审结论：项目方向正确但并非完美达标。最大风险是公网体验偏静态，必须在 README / 报告 / 表单前如实说明“公网 Demo + 本地后端真实闭环”的交付口径。
- Build-Backend 原分支已死；重开分支已完成一次接管验证，后续只需保持 `/api/dashboard` 字段契约稳定，不扩后端新功能。
- 即将迁移到新大分支；新分支第一步必须运行 `./hackctl.sh migration`，否则容易漏掉当前 Pages、Backend 重开和自审口径。
- Docs/Report 原分支已死；新文档分支必须从 `./hackctl.sh docs-restart` 接入，不再依赖旧聊天。
- 接力总控台路径：`/Users/li/Documents/New project 6`。若旧项目上下文过大，先在接力台运行 `./hackctl.sh relay` 和 `./hackctl.sh status`，再回旧项目做具体改动。

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
5. 立即进入多 Agent 分化：Build-Frontend 封版，仅处理 API/部署阻塞；Build-Backend 只维护 `/api/dashboard` 字段契约；Docs/Report 等 Deploy 给最终 URL 和截图后回填占位；Deploy 创建/确认 GitHub Public 仓库并部署静态前端。
6. 先用 2 本教材跑通闭环，再扩展到 7 本报告。
7. Deploy 分支下一步：接手 `control_center/21_DEPLOY_HANDOFF.md`，推送 main，检查 GitHub Pages workflow，验证公网 URL。
   进度 11:22：仓库已公开、main 推送 `0f51b02`、Pages workflow `25618607225` 成功。阻塞改为用户无痕验证 `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`。验证通过后 Docs/Report 可回填 GitHub + 部署链接 + commit hash。
8. 立即按 `22_SELF_AUDIT_AND_GAP_ANALYSIS.md` 做 P0 补救：回填 GitHub/部署链接，修正 Vercel 过时表述，Agent 架构说明补创新点和取舍，README 诚实说明公网 Demo 与本地后端边界。
   进度 12:xx：README、整合报告、技术报告草稿、Agent 架构说明已完成主要口径修正。
   进度 13:02：Docs/Report 重开复核完成，README 已补主要功能、已知限制、部署 commit；提交清单和任务树已同步最新 Pages workflow 与 HTTP 200 证据。
   进度 13:10：AI review snapshot 已推送到 `origin/main @ d649ac2`，Pages workflow `25620476724` 成功。
9. 下一步只剩真人动作和最终提交：用户无痕打开 Pages、决定是否生成/提交飞书技术报告链接、填写飞书表单姓名学号并提交。
10. Backend 重开验证已完成；如再次中断，复制 `23_BACKEND_RESTART_HANDOFF.md` 或运行 `./hackctl.sh backend-restart`，继续只做 API 稳定和 smoke test。
11. 如果 Docs/Report 要重开，复制 `26_DOCS_RESTART_HANDOFF.md` 或运行 `./hackctl.sh docs-restart`，继续只做文档收尾和提交口径。
12. 如果 Root 自己要重开，复制 `24_ROOT_RESTART_HANDOFF.md` 或运行 `./hackctl.sh root-restart`。
13. 如果迁移到新大分支，第一步运行 `./hackctl.sh migration`。
14. 如果用户忘记怎么使用本对话，运行 `./hackctl.sh agent`；如果要看阶段表，运行 `./hackctl.sh phase`；如果要派多个 Agent，运行 `./hackctl.sh dispatch`。

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
- `control_center/20_IMMEDIATE_BRANCH_ROUTING.md`
- `control_center/21_DEPLOY_HANDOFF.md`
- `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`
- `control_center/23_BACKEND_RESTART_HANDOFF.md`
- `control_center/24_ROOT_RESTART_HANDOFF.md`
- `control_center/25_BIG_BRANCH_MIGRATION_HANDOFF.md`
- `control_center/26_DOCS_RESTART_HANDOFF.md`
