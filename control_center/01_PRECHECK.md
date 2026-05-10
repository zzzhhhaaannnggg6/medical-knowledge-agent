# 赛前预检清单

## 环境

- [x] Python 3.10+：已确认 `Python 3.14.3`
- [x] Node.js 18+：已确认 `v25.8.2`
- [x] git：已确认 `git version 2.50.1`
- [x] npm：已确认 `11.12.1`
- [x] OpenAI Codex：已确认 `codex-cli 0.118.0`
- [x] Claude Code：已确认 `2.1.118`
- [x] GitHub CLI：已安装 `gh 2.92.0`
- [x] 飞书 CLI：已安装 `lark-cli 1.0.27`

## 账号

- [ ] GitHub：运行 `gh auth login`，随后确认 `gh auth status`
- [ ] ModelScope：登录 <https://www.modelscope.cn/>
- [ ] 飞书网页：确认提交表单能打开，飞书文档权限能设为互联网可访问
- [ ] 飞书 CLI：`lark-cli doctor` 当前显示 `config_file: not configured`，如比赛要求 CLI 操作，运行 `lark-cli config init --new` 后按提示完成授权
- [ ] 微信：确认 `浙大AI全栈极速黑客松！` 群可正常读取

## 资料

教材目录：`/Users/li/Desktop/黑客松/textbooks`

- [x] `01_局部解剖学.pdf`
- [x] `02_组织学与胚胎学.pdf`
- [x] `03_生理学.pdf`
- [x] `04_医学微生物学.pdf`
- [x] `05_病理学.pdf`
- [x] `06_传染病学.pdf`
- [x] `07_病理生理学.pdf`

## 开赛前最后检查

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh status
./hackctl.sh submit-fields
```
