# 最终提交检查

## 飞书表单必填

- [ ] 姓名
- [ ] 学号
- [ ] GitHub 仓库链接
- [ ] 部署链接

提交 URL 的解释见：`control_center/11_SUBMISSION_URL_GUIDE.md`

## GitHub 仓库

- [ ] 仓库是 Public（`gh` 已登录，待创建/确认 Public 仓库）
- [ ] README 有项目说明
- [ ] README 有本地运行方式
- [ ] README 有部署链接
- [ ] README 有主要功能截图或说明
- [x] 不含 `.env`、token、cookie、私钥（2026-05-10 10:12 Deploy 本地预检未发现）
- [x] `.gitignore` 已排除教材 PDF、环境变量、缓存、构建产物和密钥文件

## 部署链接

- [ ] 公网可访问（阻塞：Vercel 尚未登录/部署）
- [ ] 不是 localhost（待公网 URL 生成后验证）
- [ ] 无需登录即可体验核心功能
- [ ] 移动/桌面至少一个端可正常打开
- [ ] 模型调用失败时有可理解提示

## Deploy 分支预检记录

- 2026-05-10 10:12 CST：发现 `frontend/` Vite/React 静态前端，可按 Vercel 部署。
- 2026-05-10 10:12 CST：后端已出现且本地冒烟通过，但默认 demo 依赖本机教材路径；公网提交保底仍为前端静态 Demo。
- 2026-05-10 10:12 CST：`gh auth status` 显示 GitHub CLI 未登录，Public repo 创建与推送需要用户授权。
- 2026-05-10 10:18 CST：`frontend` 生产构建通过，`npm audit --audit-level=moderate` 为 0 漏洞；构建产物体积有 Vite chunk 警告，但不阻塞提交。
- 2026-05-10 10:44 CST：`gh auth status` 已登录 GitHub 账号 `zzzhhhaaannnggg6`，下一步可创建/确认 Public 仓库并推送。
- 2026-05-10 10:44 CST：本机未安装 Vercel CLI；Deploy 可选择 Vercel 网页导入 GitHub 仓库，或先安装/登录 Vercel CLI 后部署。
- 2026-05-10 11:10 CST：Deploy 原分支失效，Root 接管并切换到 GitHub Pages 救援路线；目标部署链接为 `https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/`。

## 技术报告可选加分

- [ ] 飞书文档链接
- [ ] 已开启互联网可访问权限
- [ ] 写清楚问题、方案、架构、模型调用、部署方式
- [ ] 有截图或关键流程说明

## 最后 10 分钟

只做提交复核，不新增功能。

```bash
./hackctl.sh submit-fields
gh repo view --web
```
