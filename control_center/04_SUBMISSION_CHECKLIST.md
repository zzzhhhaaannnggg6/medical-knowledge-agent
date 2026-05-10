# 最终提交检查

## 飞书表单必填

- [ ] 姓名
- [ ] 学号
- [x] GitHub 仓库链接：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`
- [x] 部署链接：`https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`

提交 URL 的解释见：`control_center/11_SUBMISSION_URL_GUIDE.md`

## GitHub 仓库

- [x] 仓库是 Public：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`（已推送，main @ `ce0dca1`）
- [x] README 有项目说明
- [x] README 有本地运行方式
- [x] README 有部署链接
- [x] README 有主要功能说明
- [x] 不含 `.env`、token、cookie、私钥（2026-05-10 10:12 Deploy 本地预检未发现）
- [x] `.gitignore` 已排除教材 PDF、环境变量、缓存、构建产物和密钥文件

## 部署链接

- [x] GitHub Pages 工作流已成功：run 25618607225 初版、run 25619090600 上线 MQ-019 可读性修正、run 25619159653 记录最终部署提交
- [x] 公网 HTTP 头验证：`https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/` 返回 HTTP 200（2026-05-10 13:02 CST，本机 curl 验证）
- [x] 不是 localhost（部署链接为 github.io 子域）
- [x] 无需登录即可访问部署页（HTTP 200）
- [ ] 移动/桌面至少一个端可正常打开（待用户验证）
- [x] 后端不可用时前端使用内置 Demo，不白屏

## Deploy 分支预检记录

- 2026-05-10 10:12 CST：发现 `frontend/` Vite/React 静态前端，可按 Vercel 部署。
- 2026-05-10 10:12 CST：后端已出现且本地冒烟通过，但默认 demo 依赖本机教材路径；公网提交保底仍为前端静态 Demo。
- 2026-05-10 10:12 CST：`gh auth status` 显示 GitHub CLI 未登录，Public repo 创建与推送需要用户授权。
- 2026-05-10 10:18 CST：`frontend` 生产构建通过，`npm audit --audit-level=moderate` 为 0 漏洞；构建产物体积有 Vite chunk 警告，但不阻塞提交。
- 2026-05-10 10:44 CST：`gh auth status` 已登录 GitHub 账号 `zzzhhhaaannnggg6`，下一步可创建/确认 Public 仓库并推送。
- 2026-05-10 10:44 CST：本机未安装 Vercel CLI；Deploy 可选择 Vercel 网页导入 GitHub 仓库，或先安装/登录 Vercel CLI 后部署。
- 2026-05-10 11:10 CST：Deploy 原分支失效，Root 接管并切换到 GitHub Pages 救援路线；目标部署链接为 `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`。
- 2026-05-10 11:22 CST：Deploy 接手 Agent 已创建 Public 仓库 `zzzhhhaaannnggg6/medical-knowledge-agent`，main 推送至 `0f51b02`，Pages workflow run 25618607225 conclusion=success。本机对 `*.github.io` 有 TLS 重置，需要用户在非受限网络/无痕窗口验证部署链接。
- 2026-05-10 12:xx CST：接力 Root 已回填 README、整合报告、技术报告草稿中的 GitHub 仓库链接、GitHub Pages 链接和当前部署提交 `ce0dca1`；提交口径统一为“公网静态 Demo + 本地 FastAPI 后端真实 MVP 闭环”。
- 2026-05-10 13:02 CST：Docs/Report 重开分支复核 `git log --oneline -5`，最新提交为 `ce0dca1`；复核 `gh run list --limit 5`，最新 Pages workflow `25619159653` 为 success；`curl -I -L` 部署链接返回 HTTP 200。

## 技术报告可选加分

- [ ] 飞书文档链接
- [ ] 已开启互联网可访问权限
- [ ] 写清楚问题、方案、架构、模型调用、部署方式
- [ ] 有截图或关键流程说明

## 中期 AI 初审

- [x] 群通知已登记：私聊组织者发送姓名、GitHub 仓库链接、邮箱
- [ ] 初审前 GitHub 快照已推送
- [ ] 用户已私聊发送姓名、仓库链接、邮箱
- [ ] 收到邮箱评审报告
- [ ] 根据 Top 5 建议选择高收益项修正

## 最后 10 分钟

只做提交复核，不新增功能。

```bash
./hackctl.sh submit-fields
gh repo view --web
```
