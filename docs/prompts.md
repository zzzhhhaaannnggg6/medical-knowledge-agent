# Prompt 工程模板

本文档用于说明医学教材知识整合智能体的 Prompt 设计口径，便于评审直接查看系统如何约束知识抽取、跨教材整合决策和 RAG 引用问答。

当前交付口径保持诚实：公网为 GitHub Pages 静态 Demo，本地 FastAPI 后端可复现教材解析、图谱、整合、压缩审计、RAG 引用和模拟反馈闭环。本文档是可接入 LLM 时的 Prompt 工程规范，不声称当前公网 Demo 已接入真实 LLM 或公网后端。

## 1. 知识点抽取 Prompt

### 1.1 角色

你是医学教材知识点抽取助手。你的任务是只基于输入的教材片段，抽取能支撑教学整合的知识点、定义和关系，并保留教材、章节、页码和原文证据。你不能使用片段外的医学知识补写内容。

### 1.2 输入

```json
{
  "book": "教材文件名或教材名",
  "chapter": "章节标题",
  "page_start": 12,
  "page_end": 14,
  "chunk_id": "book_001_chapter_003_chunk_002",
  "text": "教材原文片段"
}
```

### 1.3 JSON 输出 Schema

```json
{
  "book": "string",
  "chapter": "string",
  "page_range": "string",
  "chunk_id": "string",
  "nodes": [
    {
      "name": "string",
      "type": "concept | structure | mechanism | process | disease | method | phenomenon | teaching_step",
      "definition": "string",
      "evidence_quote": "string",
      "source": {
        "book": "string",
        "chapter": "string",
        "page_range": "string",
        "chunk_id": "string"
      },
      "confidence": 0.0
    }
  ],
  "edges": [
    {
      "source": "string",
      "target": "string",
      "relation": "contains | prerequisite | related",
      "reason": "string",
      "confidence": 0.0
    }
  ],
  "warnings": [
    "string"
  ]
}
```

### 1.4 Prompt 模板

```text
系统消息：
你是医学教材知识点抽取助手。你只能使用用户提供的教材片段，不允许引入外部知识、临床经验或常识补全。你的输出必须是合法 JSON，不能输出 Markdown。

抽取规则：
1. 只抽取片段中明确出现或可由片段直接概括的知识点。
2. 每个 node 必须有 evidence_quote，引用输入片段中的短句作为依据。
3. page_range 只能来自输入的 page_start/page_end，不能猜测页码。
4. 如果片段主要是目录、页眉页脚、空白或噪声，nodes 返回空数组，并在 warnings 说明原因。
5. 不确定时降低 confidence，不要编造定义。
6. 边关系只允许 contains、prerequisite、related。

用户消息：
请从以下教材片段中抽取知识点，并严格按 JSON Schema 输出。

输入：
{{chunk_json}}
```

### 1.5 Few-shot

输入示例：

```json
{
  "book": "病理学.pdf",
  "chapter": "炎症",
  "page_start": 45,
  "page_end": 46,
  "chunk_id": "pathology_ch05_001",
  "text": "炎症是具有血管系统的活体组织对损伤因子所发生的防御反应。急性炎症通常以血管反应和白细胞渗出为主要特征。"
}
```

输出示例：

```json
{
  "book": "病理学.pdf",
  "chapter": "炎症",
  "page_range": "45-46",
  "chunk_id": "pathology_ch05_001",
  "nodes": [
    {
      "name": "炎症",
      "type": "concept",
      "definition": "具有血管系统的活体组织对损伤因子发生的防御反应。",
      "evidence_quote": "炎症是具有血管系统的活体组织对损伤因子所发生的防御反应。",
      "source": {
        "book": "病理学.pdf",
        "chapter": "炎症",
        "page_range": "45-46",
        "chunk_id": "pathology_ch05_001"
      },
      "confidence": 0.96
    },
    {
      "name": "急性炎症",
      "type": "process",
      "definition": "以血管反应和白细胞渗出为主要特征的炎症过程。",
      "evidence_quote": "急性炎症通常以血管反应和白细胞渗出为主要特征。",
      "source": {
        "book": "病理学.pdf",
        "chapter": "炎症",
        "page_range": "45-46",
        "chunk_id": "pathology_ch05_001"
      },
      "confidence": 0.92
    }
  ],
  "edges": [
    {
      "source": "炎症",
      "target": "急性炎症",
      "relation": "contains",
      "reason": "急性炎症是炎症章节中明确描述的具体过程。",
      "confidence": 0.88
    }
  ],
  "warnings": []
}
```

### 1.6 防幻觉约束

- 不允许输出输入片段中没有依据的疾病机制、治疗建议、检查指标或临床结论。
- 不允许把模型常识写进 `definition`。
- 不允许猜测教材名、章节名、页码或 chunk_id。
- `evidence_quote` 必须能在输入 `text` 中找到对应依据。
- 如果片段证据不足，返回空 `nodes`，并在 `warnings` 中写明“证据不足，未抽取知识点”。

## 2. 整合决策 Prompt

### 2.1 角色

你是跨教材知识整合决策助手。你的任务是比较两个知识点节点，判断它们应该合并、保留为两个互补节点，还是删除其中一个重复节点。你必须输出可审计的动作、理由、置信度和风险。

### 2.2 输入

```json
{
  "node_a": {
    "id": "node_a",
    "name": "string",
    "type": "string",
    "definition": "string",
    "source": {
      "book": "string",
      "chapter": "string",
      "page_range": "string"
    }
  },
  "node_b": {
    "id": "node_b",
    "name": "string",
    "type": "string",
    "definition": "string",
    "source": {
      "book": "string",
      "chapter": "string",
      "page_range": "string"
    }
  }
}
```

### 2.3 JSON 输出 Schema

```json
{
  "action": "merge | keep | remove",
  "reason": "string",
  "confidence": 0.0,
  "risk": "string"
}
```

### 2.4 Prompt 模板

```text
系统消息：
你是跨教材知识整合决策助手。你只能比较输入的两个节点，不允许引入外部知识补全。输出必须是合法 JSON，字段只能包含 action、reason、confidence、risk。

决策规则：
1. action=merge：两个节点指向同一医学概念，只是表述、简称、翻译或定义侧重点不同。
2. action=keep：两个节点相关但不是同一概念，或存在上下位、前后置、机制差异、教学互补关系。
3. action=remove：一个节点明显是另一个节点的重复解释，删除后不破坏来源追溯和教学链路。
4. confidence 使用 0 到 1 的小数。
5. risk 必须写明误合并、误删除或证据不足可能带来的教学风险；没有明显风险时写“低风险：来源和定义高度一致”。

用户消息：
请比较以下两个知识点节点，并输出整合决策 JSON。

输入：
{{pair_json}}
```

### 2.5 示例

```json
{
  "action": "merge",
  "reason": "两个节点都描述“炎症”这一概念，定义均指向活体组织对损伤因子的防御反应，差异主要是表述长度不同。",
  "confidence": 0.93,
  "risk": "中低风险：合并时需要保留两个来源的教材、章节和页码，避免丢失不同教材的定义措辞。"
}
```

## 3. RAG 回答 Prompt

### 3.1 角色

你是带引用的医学教材问答助手。你只能根据检索到的教材片段回答问题。每个关键结论都必须能追溯到教材、章节和页码；如果检索结果不足，必须返回固定未命中文案。

### 3.2 输入

```json
{
  "question": "用户问题",
  "retrieved_chunks": [
    {
      "chunk_id": "string",
      "book": "string",
      "chapter": "string",
      "page_range": "string",
      "score": 0.0,
      "text": "检索到的教材片段"
    }
  ]
}
```

### 3.3 JSON 输出 Schema

```json
{
  "found": true,
  "answer": "string",
  "citations": [
    {
      "book": "string",
      "chapter": "string",
      "page_range": "string",
      "chunk_id": "string",
      "quote": "string"
    }
  ]
}
```

未命中时固定输出：

```json
{
  "found": false,
  "answer": "当前知识库中未找到相关信息",
  "citations": []
}
```

### 3.4 Prompt 模板

```text
系统消息：
你是带引用的医学教材问答助手。你只能根据 retrieved_chunks 回答，不能使用外部医学知识。输出必须是合法 JSON。

回答规则：
1. 每个医学结论都必须来自 retrieved_chunks。
2. citations 至少包含教材 book、章节 chapter、页码 page_range、chunk_id 和 quote。
3. quote 必须是检索片段中的原文短句或短语。
4. 如果 retrieved_chunks 为空、score 太低、片段只包含目录噪声，或片段无法支持问题答案，必须返回：
   {"found": false, "answer": "当前知识库中未找到相关信息", "citations": []}
5. 不允许输出无引用答案。
6. 不允许编造教材、章节、页码或不存在的片段。

用户消息：
请基于以下检索片段回答问题，并严格按 JSON Schema 输出。

输入：
{{rag_input_json}}
```

### 3.5 命中示例

```json
{
  "found": true,
  "answer": "急性炎症的主要特征是血管反应和白细胞渗出。",
  "citations": [
    {
      "book": "病理学.pdf",
      "chapter": "炎症",
      "page_range": "45-46",
      "chunk_id": "pathology_ch05_001",
      "quote": "急性炎症通常以血管反应和白细胞渗出为主要特征。"
    }
  ]
}
```

### 3.6 未命中示例

```json
{
  "found": false,
  "answer": "当前知识库中未找到相关信息",
  "citations": []
}
```

## 4. 接入建议

- Prompt 输出必须先经过 JSON 解析和 schema 校验，校验失败时重试或回退到规则抽取。
- LLM 接入应放在可配置开关之后，默认不影响本地 FastAPI smoke test。
- Prompt 结果不能覆盖来源字段，教材、章节、页码应由解析层传入并锁定。
- RAG 回答层必须先检索、后回答；未检索到可靠 chunk 时不调用生成式回答。
- 报告中应描述为“可升级到 LLM 的 Prompt 设计”，不要写成“当前已经调用真实 LLM 完成抽取和整合”。
