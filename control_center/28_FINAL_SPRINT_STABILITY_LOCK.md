# 最终冲刺稳定锁

## 目标

从现在开始，Root 总控台只做三件事：

1. 收分支四行交接。
2. 判断是否合并、提交、推送。
3. 更新最终提交清单。

不再主动开启大功能，不再做视觉扩展，不再重构，不再把多个分支的任务塞进同一个对话。

## Root 当前规则

- 只接受四行交接：
  - 当前结论：
  - 影响文件：
  - 阻塞点：
  - 下一分支动作：
- 对分支结果只做 `采用 / 暂缓 / 放弃` 判断。
- 只允许修提交阻塞：
  - smoke test 未通过
  - Docker / README 明显不可复现
  - GitHub Pages 不可访问
  - 飞书表单字段缺失
  - 仓库含 PDF / .env / token / 私钥 / 数据库
- 不再开启 Frontend-Sankey。
- 不再接入真实 LLM 大改。
- 不再部署公网后端。
- 不再改前端视觉，除非页面白屏或构建失败。

## 多重备份

最新备份时间：`20260510-141822`

主备份目录：

```text
/Users/li/Documents/hackathon_backups/new_project_4_20260510-141822
```

桌面副本：

```text
/Users/li/Desktop/黑客松备份/new_project_4_20260510-141822
```

备份内容：

- `repo.bundle`：完整 Git 仓库 bundle。
- `working-tree.diff`：当前未提交改动的二进制 diff。
- `working-tree.stat.txt`：diff 统计。
- `git-status.txt`：当前工作树状态。
- `git-log-20.txt`：最近 20 个提交。
- `untracked-files.txt`：未追踪文件清单。
- `critical/`：README、Docker、后端、前端源码、docs、report、control_center、hackctl 快照。
- `workspace-sanitized.tar.gz`：排除 `.git`、`.venv`、node_modules、dist、PDF、env、数据库后的脱敏项目包。

## 恢复方法

如果当前工作区乱了，但不想覆盖现有文件，先新建恢复目录：

```bash
mkdir -p "/Users/li/Documents/recover_project_4"
cd "/Users/li/Documents/recover_project_4"
git clone "/Users/li/Documents/hackathon_backups/new_project_4_20260510-141822/repo.bundle" .
git apply "/Users/li/Documents/hackathon_backups/new_project_4_20260510-141822/working-tree.diff"
```

如果只想看关键文件：

```bash
open "/Users/li/Documents/hackathon_backups/new_project_4_20260510-141822/critical"
```

如果只想看当前未提交改动：

```bash
less "/Users/li/Documents/hackathon_backups/new_project_4_20260510-141822/working-tree.diff"
```

## 最终冲刺下一步

1. 等 Review-QA / 修复验收分支回传后端 smoke test 和 Docker 路径结果。
2. Root 更新 `04_SUBMISSION_CHECKLIST.md`。
3. 做最终安全检查。
4. commit / push。
5. 检查 GitHub Pages workflow。
6. 用户填写飞书表单。

