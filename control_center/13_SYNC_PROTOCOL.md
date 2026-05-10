# 分支同步协议

## 新对话开头

每个黑客松新对话第一步使用：

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh reentry
```

如果用户是 Agent 小白或需要快速读题拆解，再使用：

```bash
./hackctl.sh agent
```

如果要按阶段执行或分派多个 Agent / 多台电脑，再使用：

```bash
./hackctl.sh phase
./hackctl.sh dispatch
```

然后选择分支：

- `Analysis`：思路分析
- `WeChat`：群消息核验
- `Build`：开发执行
- `Build-Frontend`：前端执行
- `Build-Backend`：后端执行
- `Deploy`：部署提交
- `Report`：技术报告
- `Review`：AI 评审建议

## 对话结束四行交接

每个分支对话结束前，必须产出这四行：

```text
当前结论：
影响文件：
阻塞点：
下一分支动作：
```

如果结论还没有写入正式文件，先写入 `15_MERGE_QUEUE.md`。

## 实时同步规则

- `10_HANDOFF.md` 只放当前全局状态，不堆长过程。
- `15_MERGE_QUEUE.md` 放还没合并的分支结论。
- `14_SOURCE_INDEX.md` 放所有来源链接和核验状态。
- `08_DECISION_LOG.md` 只放已经确认的关键决策。
- `09_TASK_TREE.md` 放任务状态，不放长解释。

## 冲突处理

同一问题出现多个结论时：

1. 查 `14_SOURCE_INDEX.md` 的来源等级。
2. 按优先级选择最新可信来源。
3. 把被覆盖结论标记为 `Superseded`，不要直接删除。
4. 在 `08_DECISION_LOG.md` 记录最终决定。

来源优先级：

```text
最新官方通知 > 飞书提交表单 > 赛题文档 > 公开赛页 > 微信群转述 > 旧记忆
```

## 低摩擦原则

如果时间紧，只做三件事：

1. `./hackctl.sh live`
2. 把新结论追加到 `15_MERGE_QUEUE.md`
3. 更新 `10_HANDOFF.md` 的下一步
