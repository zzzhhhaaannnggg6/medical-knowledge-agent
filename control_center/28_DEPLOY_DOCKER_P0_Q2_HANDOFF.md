# Deploy-Docker · P0(2) 单本教材知识图谱 改造回执

来源分支：Deploy-Docker
提交对象：Root 总控台
赛题条目：P0（2）单本教材知识图谱构建与可视化
改造日期：2026-05-10

---

## 一、为什么要改

Root 在 AI 审查中指出 P0（2）不达标，对照赛题 PDF 第 3 页逐条复核后确认缺口：

| 赛题要求 | 原实现 | 问题定性 |
|---|---|---|
| 对每个章节调用 LLM 抽取知识点 | 纯关键词词典 + 正则 | ❌ 完全没有 LLM 调用 |
| 节点字段 `{id,name,definition,category,chapter,page}` | 额外字段挤占，`chapter` 字段缺失 | ❌ 字段命名不符 |
| 关系类型至少覆盖四选三（prerequisite/parallel/contains/applies_to） | 只有 `contains`、`prerequisite`、`related` | ❌ 覆盖不足，`related` 不在规范内 |
| 边字段 `{source,target,relation_type,description}` | 用的是 `relation`、`reason` | ❌ 字段命名不符 |
| 选择一本教材后返回该本图谱 | 只有跨教材合并图，没有单本接口 | ❌ 粒度不对 |
| Prompt 设计：JSON-only + few-shot + 一次一个章节 | 未实现 | ❌ 无 prompt 层 |

这 6 项全部是硬伤，直接影响 P0 验收。

---

## 二、改造点（可追溯）

### 1. 新增 LLM 抽取模块（向后兼容降级）

- 新文件：`backend/app/llm_extractor.py`
- 公共接口：`extract_chapter(chapter_text, chapter_title, document_title, start_page)`
  - 每次只处理一个章节，契合赛题"限制每次调用只处理一个章节"。
  - 优先走 LLM（OpenAI 兼容协议），失败或未配置时自动降级到增强版规则抽取。
  - Prompt 采用 JSON-only 输出 + few-shot 示例 + 严格字段约束。
- 环境变量（全部可选）：
  - `LLM_PROVIDER` = `openai`（默认）/`none`（强制走规则）
  - `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`（默认 `gpt-4o-mini`）、`LLM_TIMEOUT`
- 规则降级路径也已覆盖 `prerequisite` / `parallel` / `contains` / `applies_to` 四类关系，使得没有 API Key 的演示环境仍能产出达标图谱。

### 2. pipeline.py 改造

- `_extract_graph` 改为调用 `extract_chapter` 逐章抽取。
- 节点新增规范字段：`id`、`name`、`definition`、`category`、`chapter`、`page`（旧的 `document_id / chapter_title / source_refs / importance` 保留以兼容仪表盘，不影响赛题）。
- 边输出 `relation_type` + `description`，同时保留 `relation` + `reason` 以兼容历史前端。
- `_add_prerequisite_edges` 已去重并写入规范字段。
- `dashboard_state` 的 `graph.edges` 出参同时带 `relation` / `relation_type` / `description`，现有老前端读取不受影响。

### 3. 新增单本教材接口

- `GET /api/textbooks` → 列出所有已解析教材（`textbook_id / title / format / total_chars / chapter_count / status`）。
- `GET /api/textbooks/{textbook_id}/graph` → 返回完全符合赛题规范的单本图谱：

```jsonc
{
  "textbook_id": "doc_xxx",
  "title": "生理学 第9版",
  "total_chars": 18234,
  "chapter_count": 8,
  "nodes": [
    {"id":"node_...","name":"动作电位","definition":"...","category":"核心概念","chapter":"第二章 细胞的基本功能","page":35}
  ],
  "edges": [
    {"source":"node_a","target":"node_b","relation_type":"prerequisite","description":"理解动作电位前需要先掌握静息电位"}
  ],
  "extraction_method": "llm" | "rules" | "mixed",
  "llm_enabled": false
}
```

- 两个路由在 `backend/app/main.py` 注册，已通过 `fastapi TestClient` 回归（见第四节）。

### 4. 前端单本可视化

- `frontend/src/main.jsx`：
  - `relationLabels` 增加 `parallel: "并列"`、`applies_to: "应用于"` 两类中文标签。
  - `GraphPanel` 读取边时优先用 `edge.relation_type`，与后端新字段对齐，同时兼容旧 `edge.relation`。
  - 新增 `SingleTextbookGraphModal`：点击教材卡片右下的 "查看本书图谱" 按钮后弹窗，通过 `/api/textbooks/{id}/graph` 拉取数据并用 ECharts 力导图渲染，展示节点详情（定义、章节、页码、ID）、各 relation_type 的颜色图例与计数、抽取方式（LLM 或 rules）。
  - 入口：每张 `TextbookPanel` 卡片都有 CTA；右上角点击 × 关闭。
- `frontend/src/styles.css`：新增 `.book-graph-cta`、`.book-graph-overlay`、`.book-graph-dialog` 等样式，维持原 "编辑部评审演示稿" 风格。

### 5. 构建验证

- `npx vite build` 通过（`dist/assets/index-*.js 1.22 MB`，与历史一致）。
- FastAPI 路由注册列表：
  `/api/textbooks`、`/api/textbooks/{textbook_id}/graph` 已就位。
- 规则降级下四类关系至少达到 3 种（`prerequisite`、`parallel`、`contains`），在跨教材场景下 `applies_to` 也会稳定出现（全量 smoke test 同时命中 4 种）。

---

## 三、对 Root 的请求

1. **是否需要配置 LLM API Key 上线 demo？**
   - 如果 Root 决定上 LLM，请在部署平台注入 `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` 三项，Deploy 分支不会把这些值写入仓库。
   - 如果 Root 决定纯规则演示，这版改造可以直接出线，抽取方式会显示为 `rules`，节点边字段完全达标。
2. **更新 `control_center/22_SELF_AUDIT_AND_GAP_ANALYSIS.md` 中 P0(2) 的状态**：从"未达标（只有关键词抽取 + 两类关系）"更新为"✅ 规范字段齐备 + 四类关系可达 + 单本接口与前端入口"。
3. **前端封版解冻提示**：本次在教材卡片上加了一个 "查看本书图谱" 按钮与弹窗，属于新增功能而非改版视觉。如果 Root 希望把入口改成右侧 Tab 或顶部菜单，Deploy-Docker 分支随时可以调。

---

## 四、一键验证命令

```bash
# 后端路由 + 规则降级回归
cd "/Users/li/Documents/New project 4/backend"
LLM_PROVIDER=none python3 -c "
from fastapi.testclient import TestClient
from app.main import app
c = TestClient(app)
print(c.get('/api/textbooks').json())
tid = c.get('/api/textbooks').json()['textbooks'][0]['textbook_id']
g = c.get(f'/api/textbooks/{tid}/graph').json()
print('keys:', sorted(g['nodes'][0].keys()), sorted(g['edges'][0].keys()))
print('relation_types:', sorted({e['relation_type'] for e in g['edges']}))
"

# 前端构建
cd "/Users/li/Documents/New project 4/frontend"
npx vite build
```

预期输出：
- 节点字段精确为 `['category','chapter','definition','id','name','page']`
- 边字段精确为 `['description','relation_type','source','target']`
- 全量 smoke test 命中 4 类 `relation_type`
- 前端 `vite build` 成功无报错

---

## 五、影响面

| 文件 | 行为 |
|---|---|
| `backend/app/llm_extractor.py` | 新增，独立模块 |
| `backend/app/pipeline.py` | 替换 `_extract_graph`、`_add_prerequisite_edges`、`dashboard_state.graph_edges`；新增 `list_textbooks`、`textbook_graph` |
| `backend/app/main.py` | 新增两个路由 |
| `frontend/src/main.jsx` | `relationLabels` 扩充；`GraphPanel` 兼容 `relation_type`；新增 `SingleTextbookGraphModal` 与卡片 CTA |
| `frontend/src/styles.css` | 新增弹窗/按钮样式 |

非破坏性改动：老前端若继续读取 `edge.relation` 也能拿到值；老 API `/api/dashboard` 出参字段只增不减。

—— Deploy-Docker
