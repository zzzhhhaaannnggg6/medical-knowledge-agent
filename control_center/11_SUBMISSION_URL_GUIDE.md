# 提交 URL 指南

## 总结

飞书提交表单不是让你上传压缩包，而是让你填几个链接。最关键的是：

- GitHub 仓库链接：代码在哪里
- 部署链接：作品在哪里能被评委直接打开
- 技术报告链接：你怎么做的，作为挑战加分项

飞书表单说明已经核验：

> GitHub 仓库和部署链接缺一不可，未同时提交的作品不进入评审。

## 1. GitHub 仓库链接

用途：给评委看你的源码、README、提交记录。

格式通常是：

```text
https://github.com/你的用户名/仓库名
```

例子：

```text
https://github.com/li/zju-ai-hackathon-2026
```

要求：

- 必须是 Public。
- README 要写清楚项目功能、运行方式、部署链接。
- 不要提交 `.env`、token、cookie、私钥。

比赛中常用命令：

```bash
gh auth login
gh repo create zju-ai-hackathon-2026 --public --source=. --remote=origin --push
```

如果项目已经有远程仓库：

```bash
git remote -v
git add .
git commit -m "Initial hackathon submission"
git push -u origin main
```

## 2. 部署链接

用途：给评委直接打开你的作品，不看本地环境。

格式可能是：

```text
https://你的项目.vercel.app
https://你的项目.netlify.app
https://你的服务.onrender.com
```

不允许：

```text
http://localhost:3000
http://127.0.0.1:5173
```

原因：`localhost` 只能在你自己的电脑上打开，评委打不开。

最低合格标准：

- 公网可访问。
- 不登录也能体验核心功能。
- 打开后能看到主要界面。
- 如果模型服务失败，要有错误提示，而不是白屏。

## 3. 技术报告链接

用途：可选加分项，让评委知道你怎么拆题、怎么调用模型、怎么部署。

格式通常是飞书文档链接：

```text
https://xxx.feishu.cn/docx/xxxx
```

要求：

- 飞书文档链接。
- 开启互联网可访问权限。
- 写清楚项目目标、功能、架构、模型调用、部署方式、已知限制。

模板见：

```text
control_center/05_TECH_REPORT_TEMPLATE.md
```

## 4. 飞书提交表单填写顺序

表单链接：

```text
https://my.feishu.cn/share/base/form/shrcn9FnQIJcWF9J857C3sLHi4d
```

填写：

1. 姓名
2. 学号
3. GitHub 仓库链接
4. 部署链接
5. 技术报告链接，如果有

最终提交前，逐个打开这三个链接：

- GitHub 仓库链接
- 部署链接
- 技术报告链接

确认它们在浏览器无痕窗口或未登录状态下也能访问。

