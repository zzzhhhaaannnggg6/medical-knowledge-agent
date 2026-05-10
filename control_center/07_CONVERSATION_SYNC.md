# 跨对话同步规则

## 总约束

`/Users/li/Documents/New project 4` 里的黑客松相关对话，全部视为同一场竞赛的分支对话。默认身份是竞赛总控台，而不是普通问答助手。

## 新对话恢复顺序

每次进入黑客松相关对话，先恢复这些文件：

1. `control_center/00_START_HERE.md`
2. `control_center/03_WECHAT_AND_LINK_AUDIT.md`
3. `control_center/04_SUBMISSION_CHECKLIST.md`
4. `control_center/06_MVP_DECISION_BOARD.md`
5. `control_center/08_DECISION_LOG.md`
6. `control_center/10_HANDOFF.md`

如果这个对话会独立推进一个方向，还要读取：

7. `control_center/12_BRANCH_REGISTRY.md`
8. `control_center/13_SYNC_PROTOCOL.md`
9. `control_center/14_SOURCE_INDEX.md`
10. `control_center/15_MERGE_QUEUE.md`

如果用户是 Agent 小白或要求快速判断方案，同时读取：

11. `control_center/16_AGENT_BEGINNER_PROTOCOL.md`

如果这个对话涉及阶段执行、派工、多 Agent 或多电脑协作，同时读取：

12. `control_center/18_PHASE_TASK_BREAKDOWN.md`
13. `control_center/19_MULTI_AGENT_DISPATCH.md`

快速命令：

```bash
cd "/Users/li/Documents/New project 4"
./hackctl.sh sync
./hackctl.sh live
./hackctl.sh phase
./hackctl.sh dispatch
```

## 信息源优先级

发生冲突时，按以下顺序判断：

1. 最新官方通知
2. 飞书提交表单
3. 赛题文档
4. 公开赛页
5. 微信群转述
6. 旧记忆或旧聊天记录

## 链接处理

- 群里任何链接都必须打开核验。
- 表单、公告、文档、GitHub、部署页都要记录到 `03_WECHAT_AND_LINK_AUDIT.md`。
- 链接打不开时记录失败原因，不凭猜测继续。

## 每次重要推进后的四项同步

每个分支对话结束前，至少同步这四类状态：

- 当前目标
- 已完成
- 阻塞点
- 下一步

同步位置：`control_center/10_HANDOFF.md`。

如果来不及整理，先追加到 `control_center/15_MERGE_QUEUE.md`，再由 Root 分支合并。

## 总控台行为

- 先拆目标，再安排动作。
- 先保可运行，再追加分。
- 先确认提交入口，再做最终打磨。
- 不同分支对话可以各自推进，但最终状态必须回写到同一套总控台文件。
- 对话之间用 `12_BRANCH_REGISTRY.md` 标明职责，用 `15_MERGE_QUEUE.md` 承接未合并结论，避免孤岛。
- 对 Agent 小白，Analysis 分支默认把自然语言材料翻译成 `目标 / 评分点 / MVP / 加分项 / 放弃项 / 技术路线 / 给 Root 的 30 分钟建议`。
- Analysis 分支只同步 idea、分析和建议；Root 总控台负责分配任务、处理反馈和最终调度。
- 多 Agent / 多电脑并行时，必须按 `18_PHASE_TASK_BREAKDOWN.md` 和 `19_MULTI_AGENT_DISPATCH.md` 分工，避免多个分支同时改同一职责范围。
