# 比赛当天总控台

## 时间表

| 时间 | 目标 | 总控台动作 |
| --- | --- | --- |
| 09:00-09:30 | 骨架期 | Build 跑通 React + FastAPI；Docs 建文档骨架；Deploy 确认 GitHub/.gitignore |
| 09:30-10:20 | 文件解析 | 支持 PDF/MD/TXT，优先稳定解析 PDF 和章节结构 |
| 10:20-11:00 | 图谱期 | 抽取知识点，ECharts 展示节点、关系、来源和详情 |
| 11:00-11:30 | 整合压缩 | 2 本教材生成 `merge / keep / remove`，显示理由和 30% 压缩比 |
| 11:30-12:00 | RAG 问答 | 回答带教材、章节、页码引用；未命中时明确说未找到 |
| 12:00-13:00 | 文档主攻 | `Agent 架构说明` 优先，同时补模拟教师反馈 |
| 13:00-13:30 | 部署上线 | Public GitHub + 公网部署链接；仓库不含教材 PDF 和密钥 |
| 13:30-14:00 | 提交复核 | 停止新增功能，检查飞书表单、GitHub、部署、技术报告权限 |

完整阶段执行板见：`control_center/18_PHASE_TASK_BREAKDOWN.md`。

```bash
./hackctl.sh phase
```

## 读题后必须先回答

- 题目要求产物是什么？
- 是否限制技术栈？
- 数据源在哪里？
- 是否必须使用 ModelScope？
- 评分点有哪些？
- 提交物有哪些？
- 哪个功能构成最小可运行闭环？

## Agent 小白总控输出

如果用户贴赛题、群消息或链接，先按 `control_center/16_AGENT_BEGINNER_PROTOCOL.md` 工作。读题后固定输出：

- 这题到底要做什么
- 官方要求
- 评分点
- 必做 MVP
- 高收益加分项
- 明确放弃项
- 最稳技术路线
- 接下来 30 分钟

## 默认技术策略

- 前端：React + Vite + ECharts Graph。
- 后端：FastAPI，先保留必要 API，不做复杂架构。
- 存储：MVP 使用 JSON/SQLite。
- 模型：已有 API 优先；Embedding 不稳时用 TF-IDF/关键词检索兜底。
- 部署：优先公网可访问、步骤少的方案；部署链接不能是 localhost。
- 文档：`Agent 架构说明` 优先，README 写清功能、运行方式、部署链接、模型调用方式。

## 红线

- 不把 `localhost` 当部署链接提交。
- 不提交 Private GitHub 仓库。
- 不在最后 20 分钟重构。
- 不为了完整做完所有功能而牺牲可运行性。
