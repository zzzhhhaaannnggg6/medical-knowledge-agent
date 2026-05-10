# 多 Agent / 多电脑派工提示词

## 使用方式

把对应分支提示词复制到新的 Agent 或另一台电脑的新对话中。每个分支必须先恢复总控台上下文，再开始工作。

通用开场：

```text
你现在是 5 月 10 日黑客松总控台的一个执行分支。项目根目录是 /Users/li/Documents/New project 4。
请先读取：
- control_center/10_HANDOFF.md
- control_center/18_PHASE_TASK_BREAKDOWN.md
- control_center/12_BRANCH_REGISTRY.md
- control_center/13_SYNC_PROTOCOL.md
不要让本对话孤立。重要结论必须回写到 control_center/15_MERGE_QUEUE.md 或 10_HANDOFF.md。
对话结束前必须输出四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## Build-Frontend

```text
分支身份：Build-Frontend。
目标：实现 React 前端、ECharts 知识图谱、整合/RAG/反馈面板。
优先级：
1. 先做可演示 UI，不等后端全好。
2. 支持 mock 数据和真实 API 两种状态。
3. 图谱至少支持缩放拖拽、点击节点详情、来源颜色/频次大小。
4. 右侧面板展示整合决策、压缩比、RAG 引用、模拟教师反馈。
禁止：不要改后端核心逻辑；不要为了视觉效果牺牲可运行性。
回流：完成后更新 10_HANDOFF.md 或把结论写入 15_MERGE_QUEUE.md。
```

## Build-Backend

```text
分支身份：Build-Backend。
目标：实现 FastAPI 后端、文件解析、知识抽取、跨教材整合、RAG、教师反馈接口。
优先级：
1. /health 先通。
2. PDF/MD/TXT 解析先支持 2 本教材，PDF 稳定优先。
3. 输出章节、知识点、边、merge/keep/remove 决策、压缩比。
4. RAG 回答必须带教材、章节、页码和原文片段。
5. 教师反馈至少能修改一条整合决策。
禁止：不要一开始全量处理 824MB；不要把教材 PDF、密钥、缓存写入仓库。
回流：完成后更新 10_HANDOFF.md 或把结论写入 15_MERGE_QUEUE.md。
```

## Docs/Report

```text
分支身份：Docs/Report。
目标：补齐评分文档，优先 Agent 架构说明。
优先级：
1. docs/Agent 架构说明.md
2. docs/需求分析.md
3. docs/系统设计.md
4. report/整合报告.md
5. README.md
必须解释：知识点粒度、重复判定、30% 压缩公式、教学完整性、RAG 引用、模拟教师反馈。
禁止：不要写无法验证的夸张描述；不要假装有真实教师反馈。
回流：完成后更新 10_HANDOFF.md 或把结论写入 15_MERGE_QUEUE.md。
```

## Deploy

```text
分支身份：Deploy。
目标：保证作品可提交。
优先级：
1. 确认 GitHub 仓库 Public。
2. 检查 .gitignore，排除教材 PDF、.env、token、cookie、私钥、缓存。
3. 获取公网部署链接，不能是 localhost 或 127.0.0.1。
4. 用无痕/新窗口验证 GitHub、部署链接、技术报告链接。
5. 准备飞书表单字段：姓名、学号、GitHub 仓库链接、部署链接、可选技术报告链接。
禁止：不要提交 Private 仓库；不要提交不可公网访问链接。
回流：记录最终 repo URL、deploy URL、commit hash、提交时间。
```

## Review

```text
分支身份：Review。
目标：处理第 2 小时 AI 评审建议。
优先级：
1. 只挑最高收益问题修。
2. 优先修提交阻塞、README 可复现、RAG 引用、压缩比、图谱可视化、教师反馈。
3. 不做低收益大改，不重构。
回流：把建议、采用项、放弃项写入 15_MERGE_QUEUE.md，Root 决定合并。
```

## WeChat

```text
分支身份：WeChat。
目标：微信群消息与链接核验。
优先级：
1. 群名：浙大AI全栈极速黑客松！
2. 任何链接必须打开核验，不凭预览判断。
3. 时间、入口、规则变更要转成行动项和风险项。
4. 核验结果写入 03_WECHAT_AND_LINK_AUDIT.md 和 14_SOURCE_INDEX.md。
禁止：不要替用户发送群消息；不要代替用户授权账号。
回流：重要变化写入 15_MERGE_QUEUE.md，Root 决定是否更新正式计划。
```
