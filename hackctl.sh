#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEXTBOOK_DIR="/Users/li/Desktop/黑客松/textbooks"
SUBMISSION_FORM="https://my.feishu.cn/share/base/form/shrcn9FnQIJcWF9J857C3sLHi4d"
HACKATHON_PAGE="https://tuotuzju.com/hackathon"
MODELSCOPE="https://www.modelscope.cn/"

print_title() {
  printf "\n== %s ==\n" "$1"
}

check_cmd() {
  local name="$1"
  shift
  if command -v "$name" >/dev/null 2>&1; then
    printf "[OK] %-10s " "$name"
    "$@" 2>&1 | head -n 1
  else
    printf "[MISSING] %s\n" "$name"
  fi
}

status() {
  print_title "Time"
  TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S %Z"

  print_title "Runtime"
  check_cmd python3 python3 --version
  check_cmd node node --version
  check_cmd git git --version
  check_cmd npm npm --version
  check_cmd gh gh --version
  check_cmd lark-cli lark-cli --version
  check_cmd codex codex --version
  check_cmd claude claude --version

  print_title "GitHub Auth"
  if command -v gh >/dev/null 2>&1; then
    gh auth status 2>&1 || true
  else
    echo "gh is not installed."
  fi

  print_title "Textbooks"
  if [ -d "$TEXTBOOK_DIR" ]; then
    local count
    count="$(find "$TEXTBOOK_DIR" -maxdepth 1 -type f \( -iname '*.pdf' -o -iname '*.PDF' \) | wc -l | tr -d ' ')"
    echo "PDF count: $count"
    find "$TEXTBOOK_DIR" -maxdepth 1 -type f \( -iname '*.pdf' -o -iname '*.PDF' \) | sort
  else
    echo "Missing textbook directory: $TEXTBOOK_DIR"
  fi

  print_title "Control Files"
  echo "$ROOT/control_center/00_START_HERE.md"
  echo "$ROOT/control_center/02_RACE_DAY_CONSOLE.md"
  echo "$ROOT/control_center/04_SUBMISSION_CHECKLIST.md"
  echo "$ROOT/control_center/07_CONVERSATION_SYNC.md"
  echo "$ROOT/control_center/10_HANDOFF.md"
}

links() {
  print_title "Known Links"
  echo "Hackathon page: $HACKATHON_PAGE"
  echo "Submission form: $SUBMISSION_FORM"
  echo "ModelScope: $MODELSCOPE"
  echo "GitHub auth check: gh auth status"
}

open_all() {
  open "$ROOT/control_center/00_START_HERE.md"
  open "$TEXTBOOK_DIR" 2>/dev/null || true
  open "$HACKATHON_PAGE"
  open "$SUBMISSION_FORM"
  open "$MODELSCOPE"
}

submit_fields() {
  print_title "Submission Form Fields"
  echo "Required:"
  echo "- 姓名"
  echo "- 学号"
  echo "- GitHub 仓库链接: must be Public"
  echo "- 部署链接: public URL, not localhost"
  echo
  echo "Optional bonus:"
  echo "- 技术报告: Feishu doc link, internet-accessible permission enabled"
}

submit_guide() {
  sed -n '1,260p' "$ROOT/control_center/11_SUBMISSION_URL_GUIDE.md"
}

agent_protocol() {
  sed -n '1,260p' "$ROOT/control_center/16_AGENT_BEGINNER_PROTOCOL.md"
}

sync_state() {
  print_title "Cross-Conversation Recovery"
  echo "Root: $ROOT"
  echo "Mode: hackathon command desk"
  echo
  echo "Read first:"
  echo "- $ROOT/control_center/07_CONVERSATION_SYNC.md"
  echo "- $ROOT/control_center/10_HANDOFF.md"
  echo "- $ROOT/control_center/09_TASK_TREE.md"
  echo "- $ROOT/control_center/08_DECISION_LOG.md"
  echo "- $ROOT/control_center/18_PHASE_TASK_BREAKDOWN.md"

  print_title "Current Handoff"
  sed -n '1,220p' "$ROOT/control_center/10_HANDOFF.md"

  print_title "Open Blocks"
  sed -n '/## 当前阻塞/,$p' "$ROOT/control_center/10_HANDOFF.md"
}

task_tree() {
  sed -n '1,260p' "$ROOT/control_center/09_TASK_TREE.md"
}

decision_log() {
  sed -n '1,220p' "$ROOT/control_center/08_DECISION_LOG.md"
}

branches() {
  sed -n '1,260p' "$ROOT/control_center/12_BRANCH_REGISTRY.md"
}

protocol() {
  sed -n '1,260p' "$ROOT/control_center/13_SYNC_PROTOCOL.md"
}

sources() {
  sed -n '1,260p' "$ROOT/control_center/14_SOURCE_INDEX.md"
}

merge_queue() {
  sed -n '1,260p' "$ROOT/control_center/15_MERGE_QUEUE.md"
}

phase_plan() {
  sed -n '1,320p' "$ROOT/control_center/18_PHASE_TASK_BREAKDOWN.md"
}

dispatch_plan() {
  sed -n '1,320p' "$ROOT/control_center/19_MULTI_AGENT_DISPATCH.md"
}

live() {
  print_title "Live Command Desk"
  TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S %Z"
  echo "Root: $ROOT"
  echo "Identity: 竞赛总控台"

  print_title "Active Branches"
  sed -n '/## 固定分支/,$p' "$ROOT/control_center/12_BRANCH_REGISTRY.md" | sed -n '1,16p'

  print_title "Open Blocks"
  sed -n '/## 当前阻塞/,$p' "$ROOT/control_center/10_HANDOFF.md" | sed -n '1,80p'

  print_title "Source Index"
  sed -n '/## 已登记来源/,$p' "$ROOT/control_center/14_SOURCE_INDEX.md" | sed -n '1,12p'

  print_title "Merge Queue"
  sed -n '/## 待合并队列/,$p' "$ROOT/control_center/15_MERGE_QUEUE.md" | sed -n '1,14p'
}

reentry() {
  cat <<'EOF'
【黑客松总控台｜新分支接入】

请先恢复总控台上下文：

cd "/Users/li/Documents/New project 4"
./hackctl.sh live
./hackctl.sh sync
./hackctl.sh agent
./hackctl.sh phase
./hackctl.sh dispatch

本对话属于以下分支之一，请先识别并声明：
- Root：主总控台，最终合并和提交状态
- Analysis：思路分析，赛题目标、评分点、MVP、技术路线
- WeChat：微信群消息与链接核验
- Build：开发执行，代码、功能、README
- Deploy：部署与提交，GitHub Public、部署 URL、飞书表单
- Report：技术报告，飞书文档与加分说明
- Review：AI 评审建议，第 2 小时反馈后的提分路线

工作规则：
1. 先读取 control_center/12_BRANCH_REGISTRY.md 和 13_SYNC_PROTOCOL.md。
2. 链接先进入 14_SOURCE_INDEX.md，核验后再做决定。
3. 重要但未合并的结论先进入 15_MERGE_QUEUE.md。
4. 如果用户是 Agent 小白或正在读赛题，按 16_AGENT_BEGINNER_PROTOCOL.md 输出方案。
5. 如果要派工或执行，按 18_PHASE_TASK_BREAKDOWN.md 的阶段和多 Agent 分派规则推进。
6. 对话结束前给出四行交接：
   当前结论：
   影响文件：
   阻塞点：
   下一分支动作：

你始终作为黑客松竞赛总控台的分支工作，不能让本对话孤立。
EOF
}

case "${1:-status}" in
  status) status ;;
  links) links ;;
  open) open_all ;;
  submit-fields) submit_fields ;;
  submit-guide) submit_guide ;;
  agent) agent_protocol ;;
  sync) sync_state ;;
  live) live ;;
  tree) task_tree ;;
  decisions) decision_log ;;
  branches) branches ;;
  protocol) protocol ;;
	  sources) sources ;;
	  merge-queue) merge_queue ;;
	  phase|phases) phase_plan ;;
	  dispatch) dispatch_plan ;;
	  reentry) reentry ;;
	  handoff) sed -n '1,260p' "$ROOT/control_center/10_HANDOFF.md" ;;
	  *)
	    echo "Usage: ./hackctl.sh [status|links|open|submit-fields|submit-guide|agent|sync|live|tree|decisions|branches|protocol|sources|merge-queue|phase|phases|dispatch|reentry|handoff]"
    exit 1
    ;;
esac
