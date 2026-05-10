# Root 总控台自我重开交接手卡

时间：2026-05-10 11:44 CST

用途：当前 Root 总控台对话失效时，新 Root 能在 2 分钟内接回比赛主线。

## 新 Root 第一句话

```text
你现在是 5 月 10 日黑客松 Root 总控台重开对话。项目根目录是 /Users/li/Documents/New project 4。
请先运行或读取：
./hackctl.sh root-restart
然后继续做最终调度、分支合并、提交检查和风险收束。不要把本对话当成普通问答。
```

## 必读文件

- `control_center/00_START_HERE.md`
- `control_center/07_CONVERSATION_SYNC.md`
- `control_center/10_HANDOFF.md`
- `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md`
- `control_center/04_SUBMISSION_CHECKLIST.md`
- `control_center/09_TASK_TREE.md`
- `control_center/15_MERGE_QUEUE.md`
- `control_center/23_BACKEND_RESTART_HANDOFF.md`

## 当前关键状态

- 当前身份：Root 总控台。
- 比赛窗口：2026-05-10 09:00-14:00。
- 当前时间点：约 11:44 CST，已过约 2 小时 44 分钟。
- GitHub Public 仓库：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`
- GitHub Pages 目标链接：`https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`
- Pages workflow 已成功，但本机对 `*.github.io` TLS reset，需要用户用浏览器/手机无痕验证。
- 前端已封版，公网是静态 Demo 保底。
- 后端有本地 FastAPI 真闭环，但 Build-Backend 原分支已死，已准备 `23_BACKEND_RESTART_HANDOFF.md`。
- 自审结论：4 种以上功能在代码/演示层面达标，但不是完美达标；必须诚实写成“公网 Demo + 本地后端真实 MVP 闭环”。
- 工作树存在多分支未提交改动，不能随意丢弃或重置。

## 新 Root 启动命令

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh root-restart
git status --short
```

## 当前 P0 行动

1. 让用户验证 GitHub Pages 链接是否可打开。
2. 回填 README、整合报告、技术报告草稿里的 GitHub 和部署链接。
3. 修正 Vercel 旧口径，统一为 GitHub Pages 静态前端 + 本地 FastAPI 后端。
4. `docs/Agent 架构说明.md` 补创新点、取舍说明和降级策略。
5. 确认最终提交清单：姓名、学号、GitHub 仓库链接、部署链接；技术报告可选。
6. 最后 30 分钟停止新增功能，只做提交复核。

## 冲突处理规则

优先级：

1. 最新官方通知
2. 飞书提交表单
3. 赛题 PDF
4. 公开赛页
5. 微信群转述
6. 旧记忆或旧对话

## 禁止事项

- 不执行 `git reset --hard`、`git checkout --` 等破坏性操作。
- 不把静态 Demo 说成完整公网后端。
- 不把模拟教师反馈说成真实教师反馈。
- 不把规则抽取说成 LLM/embedding 已接入。
- 不再追大功能，除非它直接解除提交阻塞。

## Root 对外口径

本项目完成医学教材知识整合智能体 MVP：本地后端支持解析、图谱、整合压缩、RAG 引用问答和模拟教师反馈；公网部署提供静态演示前端，展示核心流程、教师四问和结果样例。剩余增强项是公网后端、7 本全量处理和向量化 RAG。

## 新 Root 四行交接格式

```text
当前结论：
影响文件：
阻塞点：
下一分支动作：
```
