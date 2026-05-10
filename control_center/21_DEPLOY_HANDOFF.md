# Deploy 分支交接

## 当前结论

- Deploy 原分支已失效，Root 总控台临时接管。
- GitHub CLI 已登录账号：`zzzhhhaaannnggg6`。
- GitHub 仓库已存在且为 Public：`https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent`。
- 本机未安装 Vercel CLI；为降低风险，当前部署路线切换为 GitHub Pages。
- 前端已封版，后续只修部署阻塞、API 字段对齐和严重 bug。

## Root 已接管动作

- 需要把 `origin` 修正为 GitHub 官方仓库：

```bash
git remote set-url origin https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent.git
```

- 已新增 GitHub Pages 工作流：`.github/workflows/pages.yml`。
- 已新增 Vite Pages base 配置：`frontend/vite.config.js`。
- GitHub Pages 目标 URL：

```text
https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/
```

## 新 Deploy 对话第一条提示词

```text
你现在是 Deploy 分支接手 Agent。项目根目录是 /Users/li/Documents/New project 4。
请先读取：
- control_center/10_HANDOFF.md
- control_center/04_SUBMISSION_CHECKLIST.md
- control_center/20_IMMEDIATE_BRANCH_ROUTING.md
- control_center/21_DEPLOY_HANDOFF.md

当前状态：
- 前端已封版，不再追加视觉。
- GitHub CLI 已登录 zzzhhhaaannnggg6。
- Public 仓库是 https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent。
- 原 Vercel 路线因 CLI 不存在降级，Root 已切到 GitHub Pages。

你的任务：
1. 确认 git remote 指向 https://github.com/zzzhhhaaannnggg6/medical-knowledge-agent.git。
2. 确认 `npm run build` 在 frontend 下通过。
3. 提交并推送 main。
4. 到 GitHub Actions 查看 Pages workflow 是否成功。
5. 打开并验证 https://zzzhhhaaannnggg6.github.io/medical-knowledge-agent/。
6. 把 GitHub 仓库链接、部署链接、commit hash 回写给 Root。

禁止：
- 不要继续改前端视觉。
- 不要上传教材 PDF、.env、token、cookie、私钥。
- 不要把 localhost 当部署链接。

结束前输出四行交接：
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

## 提交前检查

```bash
git status --short
find . -path ./.git -prune -o -path ./frontend/node_modules -prune -o -path ./.venv -prune -o -path ./frontend/dist -prune -o \( -iname '*.env' -o -iname '*.pem' -o -iname '*.key' -o -iname '*.pdf' -o -iname '*.PDF' -o -iname '*.sqlite' -o -iname '*.db' \) -print
cd frontend && npm run build
```
