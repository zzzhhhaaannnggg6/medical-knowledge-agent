# 10:37 Root 即时分支路由

## 当前判定

- 当前时间：2026-05-10 10:37 CST。
- 前端 `5173` 正在运行。
- 后端 `8001` 正在运行，`/health` 已返回 OK。
- `/api/dashboard` 已返回真实后端数据：2 本教材、章节、节点、边、整合信息。
- `gh auth status` 仍未登录，GitHub Public 仓库和推送卡在用户授权。
- `gh auth status` 已登录账号 `zzzhhhaaannnggg6`，GitHub 下一步是创建/确认 Public 仓库并推送。
- 本机未安装 Vercel CLI；可使用 Vercel 网页导入 GitHub 仓库，或先安装/登录 Vercel CLI。
- 当前目标从“第一阶段骨架”切换为“前后端合流 + 提交保底”。

## 四个分支马上做什么

| 分支 | 立即任务 | 验收口径 | 回流给 Root |
| --- | --- | --- | --- |
| Build-Frontend | 封版；只处理 `http://127.0.0.1:8001/api/dashboard` 字段对齐、部署阻塞和严重 bug | 页面可作为演示前端，错误时仍可用 mock，不白屏 | 截图/说明：API 模式是否成功、哪些字段不匹配 |
| Build-Backend | 固定 API schema，保证 `/api/dashboard` 字段稳定；补远端 demo 数据策略，减少对本机教材路径依赖 | 前端能无改动消费 dashboard；后端可解释“本地教材不进仓库”的部署策略 | API 字段清单、远端部署是否可行、是否建议继续只部署静态前端 |
| Docs/Report | 用当前真实数据更新文档：2 本教材、20 章节、106 节点、144 边、31 决策、3.44% 压缩比；预留 GitHub/部署链接位置 | 文档口径和系统数据一致，说明静态 Demo + 本地后端关系 | 需要回填的链接、截图和最终数据项 |
| Deploy | 继续保底路线：Vercel 静态前端优先；立即创建/确认 Public 仓库、推送、部署 | `npm run build` 通过；仓库无 PDF/密钥；拿到公网 URL 后无痕验证 | repo URL、deploy URL、提交风险 |

## Root 要求

- 不要再开新 Analysis。
- Frontend 已封版，不再追加视觉；Frontend 和 Backend 只对齐数据结构，不要各自扩功能。
- Docs 不等部署完成，先把正文写实，链接处留 `待回填`。
- Deploy 不等后端公网化，先把静态前端 Demo 作为提交保底。
- 用户现在最该做：让 Deploy 分支创建/确认 Public 仓库并推送；如果 Vercel 未登录，也要完成 Vercel 登录。

## 下一次检查

- Frontend 回报 API 模式截图或错误。
- Backend 回报 dashboard schema 是否稳定。
- Deploy 回报 GitHub auth / Vercel 状态。
- Docs 回报是否已把最终数据写入所有文档。
