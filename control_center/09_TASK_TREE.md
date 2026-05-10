# 树状任务分化

## Root：5 月 10 日黑客松总控台

目标：在 5 小时内交付可运行、可部署、可提交的 AI 应用。

阶段派工建议见：`control_center/18_PHASE_TASK_BREAKDOWN.md`

状态：

- [ ] 微信恢复登录
- [x] GitHub CLI 登录
- [ ] ModelScope 登录
- [x] 开赛后读取赛题
- [x] 建立 Public GitHub 仓库
- [x] 完成 MVP
- [x] 部署公网链接
- [ ] 提交飞书表单

## A：赛前环境 / 账号 / 资料

- [x] Python 3.10+
- [x] Node.js 18+
- [x] git / npm
- [x] Codex / Claude Code
- [x] GitHub CLI 安装
- [x] 飞书 CLI 安装
- [x] 7 本教材 PDF
- [x] GitHub CLI 登录
- [ ] ModelScope 登录确认
- [ ] 飞书网页提交权限确认
- [ ] 微信群恢复读取

## B：微信群消息与链接核验

- [x] 确认群名：`浙大AI全栈极速黑客松！`
- [x] 捕获飞书提交表单链接
- [x] 核验公开赛页
- [x] 核验飞书提交表单字段
- [x] 结构化确认飞书表单必填字段和技术报告选填字段
- [ ] 微信恢复后补齐群历史
- [ ] 比赛中每 10-15 分钟巡检群消息

## C：赛题理解与评分点

- [x] 恢复思路分析分支上下文
- [x] 固化 Agent 小白总控对话协议
- [x] 获取赛题文档
- [x] 提取任务目标
- [x] 提取评分点
- [x] 提取提交要求
- [ ] 明确是否必须使用 ModelScope
- [x] 输出 `必做 MVP / 提分项 / 放弃项`

## D：MVP / 架构 / 技术栈

- [x] 明确赛题未到前不做最终技术栈决策
- [x] 固定读题输出模板：目标、官方要求、评分点、MVP、加分项、放弃项、技术路线、30 分钟动作
- [x] 选择建议技术栈：React + FastAPI + ECharts Graph + JSON/SQLite
- [x] 确定建议数据流：上传教材 → 章节解析 → 知识抽取 → 单本图谱 → 跨教材整合 → RAG → 教师反馈 → 报告
- [x] 确定建议模型调用方式：已有 API 优先，Embedding/关键词检索兜底
- [x] 确定部署方式：GitHub Pages 静态 Demo + 本地 FastAPI 后端复现真实闭环
- [x] 写入 `06_MVP_DECISION_BOARD.md`
- [x] 输出阶段划分与任务分化建议

## H：阶段划分 / Root 派工建议

- [x] Root 正式采纳 09:00-14:00 五阶段时间表
- [x] 09:00-09:30 骨架期：React + FastAPI + 文档骨架 + `.gitignore`
- [x] 09:30-12:00 P0 功能期：文件解析、图谱、整合压缩、RAG 问答
- [x] 12:00-13:00 文档主攻期：Agent 架构说明、需求分析、系统设计、整合报告、README
- [x] 13:00-13:30 部署期：Public GitHub、公网部署、README、权限
- [x] 13:30-14:00 提交复核期：飞书表单、链接无痕检查、停止新增功能
- [x] 多 Agent / 多电脑分派：Root、Build-Frontend、Build-Backend、Docs/Report、Deploy、Review、WeChat
- [x] 输出正式执行板：`control_center/18_PHASE_TASK_BREAKDOWN.md`

## E：开发执行

- [x] 初始化项目
- [x] 跑通本地
- [x] 完成核心功能演示闭环
- [x] Build-Frontend 封版：编辑部医学评审稿风格、教师四问、图谱强化、RAG 引用、教师反馈面板完成
- [x] Build-Backend 完成 FastAPI、解析、抽取、整合压缩、RAG、模拟教师反馈接口
- [x] Build-Backend smoke test 通过：2 本教材、20 章节、106 节点、144 边、31 决策、压缩比 3.44%
- [x] 后端完成基础未命中提示
- [x] 前端接入真实后端 API
- [x] 前端暴露真实上传入口
- [x] 完成错误提示
- [x] 完成 README 交付草稿
- [x] 根据第 2 小时 AI 评审建议完成前三项高收益整改：Docker/Compose、Prompt/架构文档、低风险 RAG 混合检索
- [ ] Review-QA 对 AI 初审整改做终验
- [x] Root 完成自我筛查：4 种以上功能演示达标，但公网真实闭环不完美

## F：部署 / 提交 / 技术报告

- [x] GitHub 仓库 Public
- [x] 公网部署链接可访问（curl HTTP 200，仍建议用户无痕浏览器确认页面交互）
- [ ] 技术报告飞书文档可访问
- [x] 完成提交 URL 指南
- [x] 补齐 `.gitignore` 安全边界
- [x] 确认前端可按 GitHub Pages 静态项目部署
- [x] Docs/Report 初稿：Agent 架构说明、需求分析、系统设计、整合报告、技术报告草稿
- [x] 后端 smoke test 写入报告：2 本教材、20 章节、106 节点、144 边、31 决策、3.44% 压缩比
- [x] Docs/Report 写入前端“教师四问”并预留 GitHub/部署/截图占位
- [x] 回填公网部署链接、GitHub Public 链接
- [x] 修正 README / 报告中过时 Vercel 和占位链接表述
- [x] Agent 架构说明补创新点、取舍和静态 Demo 降级策略
- [ ] 最终截图
- [ ] 飞书表单填写
- [ ] 最终提交复核

## G：赛后复盘

- [ ] 记录最终提交物
- [ ] 记录踩坑
- [ ] 记录可复用技术栈
- [ ] 记录下一次比赛改进点
