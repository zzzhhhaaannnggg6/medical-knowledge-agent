import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as echarts from "echarts";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  GitMerge,
  Layers3,
  MessageSquareText,
  Printer,
  Quote,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stamp,
  UploadCloud,
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const DEFAULT_UPLOAD_API_BASE = API_BASE || "http://127.0.0.1:8001";
const SUPPORTED_UPLOAD_EXTENSIONS = new Set(["pdf", "md", "txt"]);

const mockState = {
  textbooks: [
    {
      id: "pathology",
      title: "病理学 第9版",
      format: "PDF",
      size: "126.4 MB",
      status: "parsed",
      chapterCount: 18,
      characters: 48200,
      chapters: [
        { title: "细胞和组织的适应与损伤", pages: "12-42", chars: 9800 },
        { title: "炎症", pages: "43-79", chars: 12400 },
        { title: "肿瘤", pages: "80-138", chars: 16800 },
      ],
    },
    {
      id: "physiology",
      title: "生理学 第9版",
      format: "PDF",
      size: "118.9 MB",
      status: "parsed",
      chapterCount: 15,
      characters: 43600,
      chapters: [
        { title: "绪论与稳态", pages: "1-22", chars: 6200 },
        { title: "细胞膜物质转运", pages: "23-58", chars: 11100 },
        { title: "血液循环", pages: "97-168", chars: 15400 },
      ],
    },
    {
      id: "immunology",
      title: "医学免疫学",
      format: "PDF",
      size: "83.1 MB",
      status: "queued",
      chapterCount: 0,
      characters: 0,
      chapters: [],
    },
  ],
  graph: {
    nodes: [
      {
        id: "cell-injury",
        name: "细胞损伤",
        category: "概念",
        textbook: "病理学 第9版",
        sourceCount: 2,
        chapter: "细胞和组织的适应与损伤",
        pages: "19-27",
        definition: "细胞在应激超过适应能力后出现的结构和功能异常，是疾病发生的基础环节。",
      },
      {
        id: "reversible-injury",
        name: "可逆性损伤",
        category: "机制",
        textbook: "病理学 第9版",
        sourceCount: 1,
        chapter: "细胞和组织的适应与损伤",
        pages: "22-24",
        definition: "细胞损伤早期阶段，去除刺激后结构和功能仍可恢复。",
      },
      {
        id: "necrosis",
        name: "坏死",
        category: "病理过程",
        textbook: "病理学 第9版",
        sourceCount: 2,
        chapter: "细胞和组织的适应与损伤",
        pages: "25-31",
        definition: "活体局部组织细胞死亡，常伴随炎症反应。",
      },
      {
        id: "homeostasis",
        name: "稳态",
        category: "概念",
        textbook: "生理学 第9版",
        sourceCount: 3,
        chapter: "绪论与稳态",
        pages: "6-13",
        definition: "机体内环境理化性质保持相对稳定的状态。",
      },
      {
        id: "inflammation",
        name: "炎症",
        category: "病理过程",
        textbook: "病理学 第9版",
        sourceCount: 2,
        chapter: "炎症",
        pages: "43-62",
        definition: "血管系统对损伤因子和坏死组织产生的防御反应。",
      },
      {
        id: "immune-response",
        name: "免疫应答",
        category: "机制",
        textbook: "医学免疫学",
        sourceCount: 1,
        chapter: "免疫应答概述",
        pages: "31-46",
        definition: "免疫系统识别抗原后发生的一系列活化、增殖和效应过程。",
      },
      {
        id: "teaching-path",
        name: "教学关键路径",
        category: "整合节点",
        textbook: "跨教材整合",
        sourceCount: 4,
        chapter: "综合摘要",
        pages: "多源",
        definition: "保留稳态、损伤、炎症、免疫应答之间的因果链，避免压缩后断裂。",
      },
    ],
    edges: [
      { source: "homeostasis", target: "cell-injury", relation: "prerequisite" },
      { source: "cell-injury", target: "reversible-injury", relation: "contains" },
      { source: "cell-injury", target: "necrosis", relation: "contains" },
      { source: "necrosis", target: "inflammation", relation: "related" },
      { source: "inflammation", target: "immune-response", relation: "related" },
      { source: "homeostasis", target: "teaching-path", relation: "contains" },
      { source: "cell-injury", target: "teaching-path", relation: "contains" },
      { source: "immune-response", target: "teaching-path", relation: "related" },
    ],
  },
  compression: {
    originalChars: 91800,
    integratedChars: 24840,
    ratio: 27.1,
    target: 30,
    guardrails: [
      "保留稳态 -> 细胞损伤 -> 炎症 -> 免疫应答的前置链路",
      "同义定义合并，互补机制保留为解释块",
      "删除重复叙述前检查章节来源和页码证据",
    ],
  },
  decisions: [
    {
      id: "D-001",
      type: "merge",
      nodes: ["细胞损伤", "细胞适应失败"],
      result: "细胞损伤",
      reason: "两本教材均指向应激超过适应能力后的细胞结构和功能异常，可合并为同一核心概念。",
      confidence: 0.91,
      status: "active",
    },
    {
      id: "D-002",
      type: "keep",
      nodes: ["稳态"],
      result: "稳态",
      reason: "稳态是理解损伤和代偿机制的前置概念，压缩时保留定义和控制系统框架。",
      confidence: 0.86,
      status: "active",
    },
    {
      id: "D-003",
      type: "remove",
      nodes: ["炎症章节重复病例导入"],
      result: "删除重复导入",
      reason: "两处病例导入服务于同一炎症定义，保留更短且带页码的病理学版本。",
      confidence: 0.78,
      status: "active",
    },
  ],
  rag: {
    question: "为什么压缩后仍然需要保留稳态这个概念？",
    answer:
      "稳态是解释细胞损伤和代偿失败的前置概念。若直接从坏死或炎症开始，学生会缺少“正常调节失衡如何进入病理状态”的因果桥梁，因此系统将它标记为教学关键路径节点并保留。",
    citations: [
      {
        textbook: "生理学 第9版",
        chapter: "绪论与稳态",
        pages: "6-13",
        relevance: 0.88,
        excerpt: "内环境理化性质保持相对稳定，是细胞正常活动的必要条件。",
      },
      {
        textbook: "病理学 第9版",
        chapter: "细胞和组织的适应与损伤",
        pages: "19-22",
        relevance: 0.81,
        excerpt: "当刺激超过细胞适应能力时，可出现可逆或不可逆损伤。",
      },
    ],
  },
};

const typeLabels = {
  merge: "合并",
  keep: "保留",
  remove: "删除",
  split: "拆分",
};

const alignmentLabels = {
  exact_name: "同名对齐",
  synonym: "同义词对齐",
  local_char_ngram_vector: "本地 n-gram 向量",
  synonym_or_local_vector: "同义/本地向量",
};

const relationLabels = {
  contains: "包含",
  prerequisite: "前置",
  related: "相关",
  parallel: "并列",
  applies_to: "应用于",
};

const RELATION_COLOR = {
  prerequisite: "#b3452e",
  contains: "#1f6b5e",
  parallel: "#a67017",
  applies_to: "#5a4e9c",
  related: "#667085",
};

const sourceColorMap = {
  "病理学 第9版": "#b3452e",
  "生理学 第9版": "#1f6b5e",
  医学免疫学: "#5a4e9c",
  跨教材整合: "#a67017",
};

// 教学关键路径：稳态 → 细胞损伤 → 炎症 → 免疫应答 → 教学路径
// 老师最想看的"教学完整性护栏"在图上就是这条链
const TEACHING_PATH_NODES = new Set([
  "homeostasis",
  "cell-injury",
  "inflammation",
  "immune-response",
  "teaching-path",
]);
const TEACHING_PATH_EDGES = [
  ["homeostasis", "cell-injury"],
  ["cell-injury", "inflammation"],
  ["inflammation", "immune-response"],
  ["immune-response", "teaching-path"],
];

function isTeachingPathEdge(edge) {
  return TEACHING_PATH_EDGES.some(
    ([s, t]) =>
      (edge.source === s && edge.target === t) || (edge.source === t && edge.target === s),
  );
}

function sourceColor(textbook) {
  return sourceColorMap[textbook] || "#4a5a6a";
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fileFormat(filename) {
  const ext = filename.split(".").pop() || "";
  return ext.toUpperCase();
}

function normalizeApiBase(value) {
  return value.trim().replace(/\/+$/, "");
}

function applyDashboardPayload(next) {
  return {
    textbooks: next.textbooks || mockState.textbooks,
    graph: next.graph || mockState.graph,
    compression: next.compression || mockState.compression,
    decisions: next.decisions || mockState.decisions,
    rag: next.rag || mockState.rag,
  };
}

function useDashboardData() {
  const [data, setData] = useState(mockState);
  const [source, setSource] = useState("mock");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    if (!API_BASE) {
      setSource("mock");
      setData(mockState);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const next = await res.json();
      setData(applyDashboardPayload(next));
      setSource("api");
    } catch (err) {
      setData(mockState);
      setSource("mock");
      setError("后端暂不可用，当前展示可演示样例数据。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadUploadedDashboard = (next) => {
    setData(applyDashboardPayload(next));
    setSource("api");
    setError("");
  };

  return { data, source, loading, error, reload: loadData, loadUploadedDashboard };
}

function ReviewerBar({ stats, onJump, activeKey }) {
  const items = [
    {
      key: "decisions",
      kicker: "§1 · 为什么合并",
      label: "整合决策",
      value: stats.decisionCount,
      hint: `${stats.mergeCount} 合并 · ${stats.keepCount} 保留 · ${stats.removeCount} 删除`,
      icon: GitMerge,
      tone: "merge",
    },
    {
      key: "graph",
      kicker: "§2 · 来源在哪",
      label: "跨教材节点",
      value: stats.nodeCount,
      hint: `${stats.textbookCount} 本教材 · ${stats.edgeCount} 条关系`,
      icon: Layers3,
      tone: "source",
    },
    {
      key: "compression",
      kicker: "§3 · 压缩 ≤ 30%",
      label: "整合压缩比",
      value: `${stats.ratio}%`,
      hint: stats.ratioPass ? `达标 · 目标 ≤ ${stats.target}%` : `未达标 · 目标 ≤ ${stats.target}%`,
      icon: Scale,
      tone: stats.ratioPass ? "pass" : "fail",
    },
    {
      key: "rag",
      kicker: "§4 · 问答是否有引用",
      label: "RAG 引用证据",
      value: stats.citationCount,
      hint: stats.citationCount > 0 ? "全部带教材 / 章节 / 页码" : "未返回教材引用",
      icon: Quote,
      tone: "rag",
    },
  ];

  return (
    <section className="reviewer-bar" aria-label="教师评审四问">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeKey === item.key;
        return (
          <button
            type="button"
            key={item.key}
            className={`reviewer-card tone-${item.tone} ${isActive ? "is-active" : ""}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onJump(item.key)}
          >
            <span className="kicker">{item.kicker}</span>
            <div className="reviewer-head">
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
            <strong>{item.value}</strong>
            <small>{item.hint}</small>
          </button>
        );
      })}
    </section>
  );
}

function PanelHeading({ tag, eyebrow, title, icon: Icon, meta, lede }) {
  return (
    <>
      <div className="panel-heading">
        {tag && <span className="heading-tag">§{tag}</span>}
        {Icon && <Icon size={18} />}
        <div className="heading-text">
          {eyebrow && <small>{eyebrow}</small>}
          <h2>{title}</h2>
        </div>
        {meta && <span className="heading-badge">{meta}</span>}
      </div>
      {lede && <p className="panel-lede">{lede}</p>}
    </>
  );
}

function SectionHeading({ index, eyebrow, title, meta, actions, lede }) {
  return (
    <div className="section-heading">
      <div className="heading-main">
        <span className="section-index">§{index}</span>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          {lede && <span className="section-lede">{lede}</span>}
        </div>
      </div>
      <div className="heading-meta">
        {meta && <span className="section-meta">{meta}</span>}
        {actions}
      </div>
    </div>
  );
}

function GraphPanel({
  graph,
  selectedNodeId,
  onSelectNode,
  categoryFilter,
  setCategoryFilter,
  textbookFilter,
  setTextbookFilter,
  showTeachingPath,
  setShowTeachingPath,
  integrityWarning,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const categories = useMemo(
    () => Array.from(new Set(graph.nodes.map((node) => node.category))),
    [graph.nodes],
  );

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) || graph.nodes[0],
    [graph.nodes, selectedNodeId],
  );

  const textbooks = useMemo(
    () => Array.from(new Set(graph.nodes.map((node) => node.textbook))),
    [graph.nodes],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;

    const visibleNodes = graph.nodes.filter(
      (node) =>
        (categoryFilter === "__all__" || node.category === categoryFilter) &&
        (textbookFilter === "__all__" || node.textbook === textbookFilter),
    );
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const echartsCategories = categories.map((name) => ({ name }));

    chart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(22, 30, 40, 0.94)",
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: "#f5efe2", fontSize: 12, lineHeight: 18 },
        formatter(params) {
          if (params.dataType === "edge") {
            const rel = params.data.relation_type || params.data.relation;
            return `<b>${relationLabels[rel] || rel}</b>`;
          }
          const n = params.data;
          return `
            <div style="font-family:'Source Serif Pro','Noto Serif SC',serif;font-size:13px;letter-spacing:0.3px;margin-bottom:4px;"><b>${n.name}</b></div>
            <div style="color:#d5c9a8;font-size:11px;">${n.textbook}</div>
            <div style="color:#b8b2a1;font-size:11px;">${n.chapter} · 页 ${n.pages}</div>
            <div style="color:#b8b2a1;font-size:11px;">频次 ${n.sourceCount} · ${n.category}</div>`;
        },
      },
      legend: {
        top: 8,
        left: 14,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "#3d4552", fontSize: 12 },
        data: echartsCategories.map((item) => item.name),
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          categories: echartsCategories,
          edgeSymbol: ["none", "arrow"],
          force: {
            repulsion: 420,
            edgeLength: [100, 200],
            gravity: 0.08,
          },
          label: {
            show: true,
            position: "right",
            color: "#1d2330",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC','Source Serif Pro',serif",
          },
          lineStyle: {
            color: "#9aa3ad",
            width: 1.3,
            curveness: 0.12,
            opacity: 0.75,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 2.6, color: "#1f3b5c" },
            label: { fontWeight: 700 },
          },
          data: visibleNodes.map((node) => {
            const color = sourceColor(node.textbook);
            const isSelected = node.id === selectedNodeId;
            const onPath = showTeachingPath && TEACHING_PATH_NODES.has(node.id);
            return {
              ...node,
              value: node.sourceCount,
              category: categories.findIndex((name) => name === node.category),
              symbolSize: 30 + node.sourceCount * 7,
              itemStyle: {
                color,
                borderColor: isSelected
                  ? "#101828"
                  : onPath
                    ? "#1f6b5e"
                    : "#f7f1e1",
                borderWidth: isSelected ? 4 : onPath ? 3 : 2,
                shadowBlur: isSelected ? 14 : onPath ? 10 : 0,
                shadowColor: isSelected
                  ? "rgba(16,24,40,0.35)"
                  : onPath
                    ? "rgba(31,107,94,0.45)"
                    : "transparent",
              },
            };
          }),
          links: graph.edges
            .filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
            .map((edge) => {
              const onPath = showTeachingPath && isTeachingPathEdge(edge);
              const rel = edge.relation_type || edge.relation;
              return {
                source: edge.source,
                target: edge.target,
                relation: rel,
                relation_type: rel,
                lineStyle: onPath
                  ? { color: "#1f6b5e", width: 2.8, opacity: 0.95, curveness: 0.08 }
                  : undefined,
                label: {
                  show: true,
                  formatter: relationLabels[rel] || rel,
                  color: onPath ? "#1f6b5e" : "#667085",
                  fontWeight: onPath ? 700 : 400,
                  fontSize: 10,
                  fontFamily: "'Source Serif Pro','Noto Serif SC',serif",
                },
              };
            }),
        },
      ],
    });

    chart.on("click", (params) => {
      if (params.dataType === "node") onSelectNode(params.data.id);
    });

    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [graph, selectedNodeId, onSelectNode, categoryFilter, textbookFilter, categories, showTeachingPath]);

  const selectedColor = sourceColor(selectedNode.textbook);
  const isTeachingPath = selectedNode.category === "整合节点" || selectedNode.textbook === "跨教材整合";

  return (
    <section className="graph-shell" id="section-graph" aria-label="知识图谱">
      <SectionHeading
        index="2"
        eyebrow="Knowledge Graph"
        title="跨教材知识图谱"
        lede="节点颜色代表来源教材，节点大小代表跨书频次；点击节点可查看定义、章节、页码。"
        meta={`${graph.nodes.length} 节点 · ${graph.edges.length} 关系`}
        actions={
          <div className="filter-row">
            <button
              type="button"
              className={`filter-chip path-chip ${showTeachingPath ? "active" : ""}`}
              onClick={() => setShowTeachingPath(!showTeachingPath)}
              title="高亮稳态→损伤→炎症→免疫应答的教学因果链"
            >
              <ShieldCheck size={12} /> 教学关键路径
            </button>
            <button
              type="button"
              className={`filter-chip ${categoryFilter === "__all__" ? "active" : ""}`}
              onClick={() => setCategoryFilter("__all__")}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-chip ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      />
      <div className="source-legend" role="group" aria-label="按教材过滤">
        <button
          type="button"
          className={`legend-item ${textbookFilter === "__all__" ? "active" : ""}`}
          onClick={() => setTextbookFilter("__all__")}
          aria-pressed={textbookFilter === "__all__"}
        >
          <i className="swatch all" />
          全部教材
        </button>
        {textbooks.map((tb) => {
          const active = textbookFilter === tb;
          return (
            <button
              type="button"
              key={tb}
              className={`legend-item ${active ? "active" : ""}`}
              onClick={() => setTextbookFilter(active ? "__all__" : tb)}
              aria-pressed={active}
              style={{ "--swatch": sourceColor(tb) }}
            >
              <i className="swatch" style={{ background: sourceColor(tb) }} />
              {tb}
            </button>
          );
        })}
      </div>
      {integrityWarning && (
        <div className="integrity-alarm" role="alert">
          <AlertCircle size={14} />
          <div>
            <strong>教学完整性护栏：链路可能断裂</strong>
            <p>{integrityWarning}</p>
          </div>
        </div>
      )}
      <div className="graph-grid">
        <div className="graph-canvas" ref={containerRef} />
        <aside className="node-detail" style={{ "--source-accent": selectedColor }}>
          <div className="detail-ribbon" />
          <div className="detail-header">
            <div className="detail-kicker">
              <span className="node-cat">{selectedNode.category}</span>
              {isTeachingPath && (
                <span className="teaching-flag">
                  <ShieldCheck size={12} /> 教学关键路径
                </span>
              )}
            </div>
            <strong>{selectedNode.name}</strong>
          </div>
          <p className="node-definition">{selectedNode.definition}</p>
          <dl>
            <div>
              <dt>来源教材</dt>
              <dd>
                <span className="source-dot" style={{ background: selectedColor }} />
                {selectedNode.textbook}
              </dd>
            </div>
            <div>
              <dt>章节</dt>
              <dd>{selectedNode.chapter}</dd>
            </div>
            <div>
              <dt>页码</dt>
              <dd>{selectedNode.pages}</dd>
            </div>
            <div>
              <dt>跨书频次</dt>
              <dd>
                <span className="freq-pill">× {selectedNode.sourceCount}</span>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function TextbookPanel({ textbooks, onViewGraph }) {
  const parsedCount = textbooks.filter((b) => b.status === "parsed").length;
  return (
    <section className="panel" id="section-textbooks">
      <PanelHeading
        tag="0"
        eyebrow="Source Corpus"
        title="教材资料源"
        icon={BookOpen}
        meta={`${parsedCount}/${textbooks.length} 已解析`}
        lede="每一本教材以书脊色带区分，章节卡列出页码与字符数；所有知识点、引用和图谱颜色都从这里开始回溯。"
      />
      <div className="textbook-list">
        {textbooks.map((book) => (
          <article
            className="textbook-card"
            key={book.id}
            style={{ "--source-accent": sourceColor(book.title) }}
          >
            <span className="textbook-spine" />
            <div className="book-topline">
              <div>
                <h3>{book.title}</h3>
                <p>{book.format} · {book.size}</p>
              </div>
              <span className={`status ${book.status}`}>
                {book.status === "parsed" ? "已解析" : "待处理"}
              </span>
            </div>
            <div className="book-metrics">
              <span>{book.chapterCount} 章</span>
              <span>{formatNumber(book.characters)} 字</span>
            </div>
            {book.chapters.length > 0 && (
              <div className="chapter-list">
                {book.chapters.map((chapter) => (
                  <div key={`${book.id}-${chapter.title}`}>
                    <strong>{chapter.title}</strong>
                    <span>页 {chapter.pages} · {formatNumber(chapter.chars)} 字</span>
                  </div>
                ))}
              </div>
            )}
            {onViewGraph && book.status === "parsed" && book.id && (
              <button
                type="button"
                className="book-graph-cta"
                onClick={() => onViewGraph(book)}
                title="查看该教材的单本知识图谱"
              >
                <Layers3 size={13} /> 查看本书图谱
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SingleTextbookGraphModal({ open, textbook, apiBase, onClose }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!open || !textbook || !apiBase) return;
    let cancelled = false;
    const run = async () => {
      setStatus("loading");
      setError("");
      try {
        const endpoint = normalizeApiBase(apiBase);
        const res = await fetch(
          `${endpoint}/api/textbooks/${encodeURIComponent(textbook.id)}/graph`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setPayload(data);
        setSelectedId(data.nodes?.[0]?.id || "");
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "加载失败");
        setPayload(null);
        setStatus("error");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, textbook, apiBase]);

  useEffect(() => {
    if (!open || status !== "ready" || !containerRef.current || !payload) return;
    const chart = echarts.init(containerRef.current);
    const categoryNames = Array.from(new Set(payload.nodes.map((n) => n.category)));
    chart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(22, 30, 40, 0.94)",
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: "#f5efe2", fontSize: 12, lineHeight: 18 },
        formatter(params) {
          if (params.dataType === "edge") {
            const rel = params.data.relation_type || params.data.relation;
            const desc = params.data.description || "";
            return `<b>${relationLabels[rel] || rel}</b>${desc ? `<br/><span style='color:#d5c9a8;font-size:11px'>${desc}</span>` : ""}`;
          }
          const n = params.data;
          return `
            <div style="font-family:'Source Serif Pro','Noto Serif SC',serif;font-size:13px;margin-bottom:4px;"><b>${n.name}</b></div>
            <div style="color:#d5c9a8;font-size:11px;">${n.category} · ${n.chapter || ""}</div>
            <div style="color:#b8b2a1;font-size:11px;">页 ${n.page}</div>
            <div style="color:#b8b2a1;font-size:11px;margin-top:4px;max-width:260px;">${n.definition || ""}</div>`;
        },
      },
      legend: {
        top: 8,
        left: 14,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "#3d4552", fontSize: 12 },
        data: categoryNames,
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          categories: categoryNames.map((n) => ({ name: n })),
          edgeSymbol: ["none", "arrow"],
          force: { repulsion: 340, edgeLength: [90, 180], gravity: 0.08 },
          label: {
            show: true,
            position: "right",
            color: "#1d2330",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Noto Serif SC','Source Serif Pro',serif",
          },
          lineStyle: { width: 1.3, curveness: 0.12, opacity: 0.8 },
          emphasis: { focus: "adjacency", lineStyle: { width: 2.6 } },
          data: payload.nodes.map((n) => ({
            ...n,
            value: 1,
            category: categoryNames.indexOf(n.category),
            symbolSize: n.id === selectedId ? 48 : 36,
            itemStyle: {
              color: sourceColor(payload.title || textbook.title),
              borderColor: n.id === selectedId ? "#101828" : "#f7f1e1",
              borderWidth: n.id === selectedId ? 4 : 2,
            },
          })),
          links: payload.edges.map((e) => {
            const rel = e.relation_type || e.relation;
            return {
              source: e.source,
              target: e.target,
              relation_type: rel,
              description: e.description,
              lineStyle: { color: RELATION_COLOR[rel] || "#667085", width: 1.6, opacity: 0.85 },
              label: {
                show: true,
                formatter: relationLabels[rel] || rel,
                color: RELATION_COLOR[rel] || "#667085",
                fontSize: 10,
                fontWeight: 600,
                fontFamily: "'Source Serif Pro','Noto Serif SC',serif",
              },
            };
          }),
        },
      ],
    });
    chart.on("click", (params) => {
      if (params.dataType === "node") setSelectedId(params.data.id);
    });
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [open, status, payload, selectedId, textbook]);

  if (!open) return null;

  const selectedNode = payload?.nodes?.find((n) => n.id === selectedId) || payload?.nodes?.[0];
  const relationCounter = (payload?.edges || []).reduce((acc, e) => {
    const rel = e.relation_type || e.relation || "other";
    acc[rel] = (acc[rel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="book-graph-overlay" role="dialog" aria-modal="true">
      <div className="book-graph-dialog">
        <header>
          <div>
            <small>Single Textbook · Knowledge Graph</small>
            <h3>{textbook?.title} · 单本知识图谱</h3>
            {payload && (
              <p className="book-graph-summary">
                {payload.nodes.length} 节点 · {payload.edges.length} 关系 · 抽取方式{" "}
                <code>{payload.extraction_method}</code>
                {payload.llm_enabled ? "（LLM 已启用）" : "（LLM 未配置，使用规则抽取）"}
              </p>
            )}
          </div>
          <button className="book-graph-close" type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>
        <div className="book-graph-body">
          {status === "loading" && <div className="book-graph-state">加载中……</div>}
          {status === "error" && (
            <div className="book-graph-state error">
              <AlertCircle size={14} /> 加载失败：{error}
            </div>
          )}
          {status === "ready" && payload && (
            <>
              <div className="book-graph-canvas" ref={containerRef} />
              <aside className="book-graph-aside">
                <div className="relation-legend">
                  {Object.entries(relationLabels)
                    .filter(([k]) => k !== "related")
                    .map(([k, label]) => (
                      <span key={k} style={{ "--chip": RELATION_COLOR[k] || "#667085" }}>
                        <i />
                        {label}
                        <em>{relationCounter[k] || 0}</em>
                      </span>
                    ))}
                </div>
                {selectedNode && (
                  <div className="book-graph-detail">
                    <small>{selectedNode.category}</small>
                    <strong>{selectedNode.name}</strong>
                    <p>{selectedNode.definition || "（暂无定义）"}</p>
                    <dl>
                      <div>
                        <dt>所在章节</dt>
                        <dd>{selectedNode.chapter || "-"}</dd>
                      </div>
                      <div>
                        <dt>页码</dt>
                        <dd>{selectedNode.page}</dd>
                      </div>
                      <div>
                        <dt>节点 ID</dt>
                        <dd>
                          <code>{selectedNode.id}</code>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </aside>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadPanel({ apiBase, setApiBase, onDashboardLoaded, onUploaded }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const addFiles = (fileList) => {
    const next = Array.from(fileList || []).map((file) => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const supported = SUPPORTED_UPLOAD_EXTENSIONS.has(ext);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        name: file.name,
        format: fileFormat(file.name),
        size: formatFileSize(file.size),
        status: supported ? "selected" : "failed",
        note: supported ? "待解析" : "仅支持 PDF / MD / TXT",
      };
    });
    setItems(next);
    setMessage(next.length ? "" : "未选择文件");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const uploadFiles = async () => {
    const endpoint = normalizeApiBase(apiBase);
    const ready = items.filter((item) => item.status !== "failed");
    if (!endpoint) {
      setMessage("请填写本地 FastAPI 后端地址");
      return;
    }
    if (!ready.length) {
      setMessage("请先选择 PDF、Markdown 或 TXT 教材");
      return;
    }

    setUploading(true);
    setMessage("解析中");
    setItems((prev) =>
      prev.map((item) =>
        item.status === "failed" ? item : { ...item, status: "parsing", note: "解析中" },
      ),
    );

    try {
      const body = new FormData();
      ready.forEach((item) => body.append("files", item.file));
      body.append("max_pages_per_document", "25");

      const uploadRes = await fetch(`${endpoint}/api/documents`, {
        method: "POST",
        body,
      });
      if (!uploadRes.ok) {
        let detail = `上传失败：${uploadRes.status}`;
        try {
          const err = await uploadRes.json();
          detail = err.detail || detail;
        } catch (_) {
          // Keep the HTTP status message when the backend does not return JSON.
        }
        throw new Error(detail);
      }

      const dashboardRes = await fetch(`${endpoint}/api/dashboard`);
      if (!dashboardRes.ok) throw new Error(`Dashboard ${dashboardRes.status}`);
      const dashboard = await dashboardRes.json();

      onDashboardLoaded(dashboard);
      setItems((prev) =>
        prev.map((item) =>
          item.status === "failed" ? item : { ...item, status: "done", note: "已完成" },
        ),
      );
      setMessage(`解析完成：${dashboard.textbooks?.length || ready.length} 本教材已进入工作台`);
      onUploaded && onUploaded();
    } catch (err) {
      const text = err instanceof Error ? err.message : "解析失败";
      setItems((prev) =>
        prev.map((item) =>
          item.status === "parsing" ? { ...item, status: "failed", note: text } : item,
        ),
      );
      setMessage(text);
    } finally {
      setUploading(false);
    }
  };

  const parsedCount = items.filter((item) => item.status === "done").length;

  return (
    <section className="panel upload-panel" id="section-upload">
      <PanelHeading
        tag="U"
        eyebrow="Textbook Upload"
        title="上传教材解析"
        icon={UploadCloud}
        meta={items.length ? `${parsedCount}/${items.length} 完成` : "PDF / MD / TXT"}
        lede="把教材文件送入本地 FastAPI 解析后，工作台会刷新教材、章节、图谱、压缩与引用数据。"
      />
      <div
        className={`drop-zone ${dragActive ? "active" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.md,.txt,application/pdf,text/markdown,text/plain"
          onChange={(event) => addFiles(event.target.files)}
        />
        <UploadCloud size={24} />
        <strong>拖拽教材到这里，或点击选择</strong>
        <span>支持批量 PDF / Markdown / TXT</span>
      </div>
      <label className="api-base-field">
        <span>后端地址</span>
        <input
          value={apiBase}
          onChange={(event) => setApiBase(event.target.value)}
          placeholder="http://127.0.0.1:8001"
        />
      </label>
      {items.length > 0 && (
        <div className="upload-list">
          {items.map((item) => (
            <article className={`upload-item status-${item.status}`} key={item.id}>
              <FileText size={16} />
              <div>
                <strong>{item.name}</strong>
                <span>{item.format} · {item.size}</span>
              </div>
              <em>{item.note}</em>
            </article>
          ))}
        </div>
      )}
      <div className="upload-actions">
        <button
          className="primary-action"
          type="button"
          onClick={uploadFiles}
          disabled={uploading}
        >
          <UploadCloud size={14} /> {uploading ? "解析中..." : "开始解析"}
        </button>
        {message && <span className="upload-message">{message}</span>}
      </div>
    </section>
  );
}

function CompressionPanel({ compression }) {
  const passed = compression.ratio <= compression.target;
  const saved = compression.originalChars - compression.integratedChars;
  const ratioCapped = Math.min(compression.ratio, 100);
  return (
    <section className="panel compression-panel" id="section-compression">
      <PanelHeading
        tag="3"
        eyebrow="Compression Audit"
        title="字数稽核与压缩比"
        icon={Scale}
        meta={passed ? "达标" : "未达标"}
        lede="原始正文与整合后字数的刻度尺；红色刻度标记 30% 硬线，超过即视为压缩失败，并保留护栏原则。"
      />
      <div className="ratio-card">
        <div>
          <span>压缩比</span>
          <strong>{compression.ratio}%</strong>
        </div>
        <span className={`target ${passed ? "pass" : "fail"}`}>
          {passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          目标 ≤ {compression.target}%
        </span>
      </div>
      <div className="ruler-scale" aria-hidden="true">
        {[0, 10, 20, 30, 40, 50].map((tick) => (
          <span key={tick} style={{ left: `${Math.min(tick, 100)}%` }}>
            <i />
            <em>{tick}</em>
          </span>
        ))}
        <b style={{ left: `${Math.min(compression.target, 100)}%` }} title="目标" />
        <div className="ruler-fill" style={{ width: `${ratioCapped}%` }} />
      </div>
      <div className="compression-stats">
        <div>
          <span>原始正文</span>
          <strong>{formatNumber(compression.originalChars)} 字</strong>
        </div>
        <div className="arrow" aria-hidden="true">→</div>
        <div>
          <span>整合后</span>
          <strong>{formatNumber(compression.integratedChars)} 字</strong>
        </div>
        <div className="saved">
          <span>节省</span>
          <strong>-{formatNumber(saved)}</strong>
        </div>
      </div>
      <div className="guardrail-list">
        {compression.guardrails.map((item) => (
          <p key={item}><ShieldCheck size={15} /> {item}</p>
        ))}
      </div>
    </section>
  );
}

function DecisionsPanel({ decisions, onApplyFeedback, feedbackBusy, feedbackError }) {
  const [feedback, setFeedback] = useState("keep");
  const [selected, setSelected] = useState(decisions[0]?.id || "");

  useEffect(() => {
    if (!selected && decisions[0]) setSelected(decisions[0].id);
  }, [decisions, selected]);

  const selectedDecision = decisions.find((d) => d.id === selected);

  return (
    <section className="panel decisions-panel" id="section-decisions">
      <PanelHeading
        tag="1"
        eyebrow="Integration Decisions"
        title="整合决策评审"
        icon={SlidersHorizontal}
        meta={`${decisions.length} 条`}
        lede="每一条决策都有印章式标识（合并 / 保留 / 删除 / 拆分）、受影响节点、理由与置信度；教师可在下方批注区改判并立即生效。"
      />
      <div className="decision-list">
        {decisions.map((decision) => (
          <button
            className={`decision ${selected === decision.id ? "selected" : ""} tone-${decision.type}`}
            key={decision.id}
            onClick={() => setSelected(decision.id)}
            type="button"
          >
            <div className="decision-top">
              <span className={`stamp stamp-${decision.type}`}>
                <Stamp size={12} />
                {typeLabels[decision.type]}
              </span>
              <span className="decision-id">{decision.id}</span>
            </div>
            <strong>{decision.result}</strong>
            <p>{decision.reason}</p>
            <div className="decision-foot">
              <span className="conf">
                置信 {(decision.confidence * 100).toFixed(0)}%
              </span>
              {decision.alignmentMethod && (
                <span className="alignment-method">
                  {alignmentLabels[decision.alignmentMethod] || decision.alignmentMethod}
                </span>
              )}
              <span className="nodes">{decision.nodes.join(" · ")}</span>
              {decision.status === "teacher-adjusted" && (
                <span className="teacher-mark">教师已批改</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="feedback-box">
        <div className="feedback-head">
          <div>
            <span>模拟教师批注</span>
            <strong>对 {selectedDecision ? selectedDecision.id : "——"} 重新裁定</strong>
          </div>
          {selectedDecision && (
            <span className={`current-type stamp-${selectedDecision.type}`}>
              现为 {typeLabels[selectedDecision.type]}
            </span>
          )}
        </div>
        <div className="segmented">
          {["keep", "split", "merge", "remove"].map((item) => (
            <button
              key={item}
              className={feedback === item ? "active" : ""}
              onClick={() => setFeedback(item)}
              type="button"
            >
              {typeLabels[item]}
            </button>
          ))}
        </div>
        <button
          className="primary-action"
          onClick={() => onApplyFeedback(selected, feedback)}
          type="button"
          disabled={feedbackBusy}
        >
          <Stamp size={14} /> {feedbackBusy ? "写回中..." : "盖章应用批注"}
        </button>
        {feedbackError && <p className="feedback-error">{feedbackError}</p>}
      </div>
    </section>
  );
}

const QUICK_QUESTIONS = [
  "为什么压缩后仍然要保留稳态？",
  "免疫应答在哪一本教材里？",
  "细胞损伤和坏死能合并吗？",
  "抽考：一个未收录的概念会怎么回答？",
];

function RagPanel({ rag, apiBase, seed, onSeedConsumed }) {
  const [query, setQuery] = useState(rag.question);
  const [answer, setAnswer] = useState(rag);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const normalizeRagResponse = (payload, question) => ({
    question: payload.question || question,
    answer: payload.answer || "当前知识库中未找到相关信息。",
    citations: (payload.citations || []).map((item) => ({
      textbook: item.textbook || item.document_title || "",
      chapter: item.chapter || item.chapter_title || "",
      pages: String(item.pages || item.page || ""),
      relevance: item.relevance || 0,
      excerpt: item.excerpt || item.snippet || "",
    })),
  });

  const ask = async (raw) => {
    const q = (typeof raw === "string" ? raw : query).trim();
    if (!q) return;
    setQuery(q);
    setError("");

    const endpoint = normalizeApiBase(apiBase);
    if (endpoint) {
      setAsking(true);
      try {
        const res = await fetch(`${endpoint}/api/rag/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, top_k: 3 }),
        });
        if (!res.ok) throw new Error(`RAG ${res.status}`);
        const payload = await res.json();
        setAnswer(normalizeRagResponse(payload, q));
        return;
      } catch (err) {
        setError("后端问答暂不可用，已回退到 Demo 回答。");
      } finally {
        setAsking(false);
      }
    }

    if (q.includes("不存在") || q.includes("未收录") || q.includes("抽考")) {
      setAnswer({
        question: q,
        answer: "当前知识库中未找到相关信息。",
        citations: [],
      });
      return;
    }
    setAnswer({ ...rag, question: q });
  };

  useEffect(() => {
    if (seed) {
      ask(seed);
      onSeedConsumed && onSeedConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  return (
    <section className="panel rag-panel" id="section-rag">
      <PanelHeading
        tag="4"
        eyebrow="RAG with Citation"
        title="引用问答"
        icon={MessageSquareText}
        meta={`${answer.citations.length} 条引用`}
        lede="提问后系统会给出答案和逐条教材证据——书脊色带定位来源、相关度条显示命中强度；未命中会明确回复“当前知识库中未找到相关信息”。"
      />
      <div className={`search-box ${asking ? "is-loading" : ""}`}>
        <Search size={17} />
        <input
          id="rag-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="向医学知识库提问……（⌘/Ctrl + K 聚焦）"
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button onClick={() => ask()} type="button" disabled={asking}>
          {asking ? "检索中..." : "提问"}
        </button>
      </div>
      {error && <p className="rag-error">{error}</p>}
      <div className="quick-questions">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            className={`quick-chip ${q.startsWith("抽考") ? "probe" : ""}`}
            onClick={() => ask(q)}
          >
            {q}
          </button>
        ))}
      </div>
      <div className="answer-box">
        <Quote size={14} className="answer-quote" />
        <p>{answer.answer}</p>
      </div>
      <div className="citation-list">
        {answer.citations.length === 0 ? (
          <div className="empty-citation">
            <AlertCircle size={14} /> 未返回教材引用
          </div>
        ) : (
          answer.citations.map((citation) => (
            <article
              key={`${citation.textbook}-${citation.pages}`}
              style={{ "--source-accent": sourceColor(citation.textbook) }}
            >
              <span className="citation-spine" />
              <div className="citation-head">
                <strong>{citation.textbook}</strong>
                <span className="relevance">
                  相关度 {(citation.relevance * 100).toFixed(0)}%
                </span>
              </div>
              <div className="citation-meta">
                {citation.chapter} · 页 {citation.pages}
              </div>
              <div className="relevance-bar">
                <div style={{ width: `${Math.round(citation.relevance * 100)}%` }} />
              </div>
              <p className="excerpt">{citation.excerpt}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Header({ source, loading, error, onReload, onReview, onPrint, reviewRunning }) {
  const now = new Date();
  const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={20} />
        </div>
        <div className="brand-text">
          <p>Medical Textbook · Knowledge Integration Review</p>
          <h1>医学教材知识整合工作台</h1>
          <div className="brand-meta">
            <span>编辑部 · 评审演示稿</span>
            <span className="dot" />
            <span>卷 01 · {stamp}</span>
          </div>
        </div>
      </div>
      <div className="header-actions">
        {error && (
          <span className="api-warning" role="status">
            <AlertCircle size={15} /> {error}
          </span>
        )}
        <span className={`source-badge ${source}`}>
          {source === "api" ? "● 真实 API" : "● Demo 数据"}
        </span>
        <button
          type="button"
          className={`header-cta ${reviewRunning ? "running" : ""}`}
          onClick={onReview}
          disabled={reviewRunning}
          title="一键带老师走完 §1-§4 评审"
        >
          <Sparkles size={14} /> {reviewRunning ? "评审中…" : "评审模式"}
        </button>
        <button
          type="button"
          className="header-ghost"
          onClick={onPrint}
          title="打印为评审稿"
        >
          <Printer size={14} /> 打印
        </button>
        <button
          className="icon-button"
          onClick={onReload}
          type="button"
          aria-label="刷新数据"
          title="刷新数据"
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
        </button>
      </div>
    </header>
  );
}

function App() {
  const { data, source, loading, error, reload, loadUploadedDashboard } = useDashboardData();
  const [apiBase, setApiBase] = useState(DEFAULT_UPLOAD_API_BASE);
  const [selectedNodeId, setSelectedNodeId] = useState(data.graph.nodes[0]?.id || "");
  const [decisions, setDecisions] = useState(data.decisions);
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [textbookFilter, setTextbookFilter] = useState("__all__");
  const [feedbackDiff, setFeedbackDiff] = useState(null);
  const [showTeachingPath, setShowTeachingPath] = useState(true);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [ragSeed, setRagSeed] = useState(null);
  const [activeKey, setActiveKey] = useState("decisions");
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [bookGraphTarget, setBookGraphTarget] = useState(null);

  useEffect(() => {
    const sections = [
      { key: "decisions", id: "section-decisions" },
      { key: "graph", id: "section-graph" },
      { key: "compression", id: "section-compression" },
      { key: "rag", id: "section-rag" },
    ];
    const entries = sections
      .map((s) => ({ key: s.key, el: document.getElementById(s.id) }))
      .filter((s) => s.el);
    if (entries.length === 0) return;
    const observer = new IntersectionObserver(
      (obs) => {
        // 取最大可见比例的 section 作为当前
        const visible = obs
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const match = entries.find((e) => e.el === visible[0].target);
          if (match) setActiveKey(match.key);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.15, 0.4, 0.75] },
    );
    entries.forEach((e) => observer.observe(e.el));
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
      // ⌘/Ctrl + K 聚焦搜索
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const el = document.getElementById("rag-search-input");
        if (el) {
          document.getElementById("section-rag")?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => el.focus(), 240);
        }
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const jumpMap = { 1: "decisions", 2: "graph", 3: "compression", 4: "rag" };
      if (jumpMap[e.key]) {
        e.preventDefault();
        jumpTo(jumpMap[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDecisions(data.decisions);
    if (!data.graph.nodes.find((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(data.graph.nodes[0]?.id || "");
    }
  }, [data, selectedNodeId]);

  const stats = useMemo(() => {
    const mergeCount = decisions.filter((d) => d.type === "merge").length;
    const keepCount = decisions.filter((d) => d.type === "keep").length;
    const removeCount = decisions.filter((d) => d.type === "remove").length;
    return {
      decisionCount: decisions.length,
      mergeCount,
      keepCount,
      removeCount,
      nodeCount: data.graph.nodes.length,
      edgeCount: data.graph.edges.length,
      textbookCount: data.textbooks.filter((b) => b.status === "parsed").length,
      ratio: data.compression.ratio,
      target: data.compression.target,
      ratioPass: data.compression.ratio <= data.compression.target,
      citationCount: data.rag.citations?.length || 0,
    };
  }, [data, decisions]);

  // 教学完整性护栏：若某条涉及稳态 / 细胞损伤 / 炎症 / 免疫应答的决策被改为 remove，则判定为链路断裂风险
  const integrityWarning = useMemo(() => {
    const PATH_KEYWORDS = ["稳态", "细胞损伤", "炎症", "免疫应答"];
    const broken = decisions.find(
      (d) =>
        d.type === "remove" &&
        (PATH_KEYWORDS.some((k) => d.result.includes(k)) ||
          d.nodes.some((n) => PATH_KEYWORDS.some((k) => n.includes(k)))),
    );
    if (!broken) return "";
    return `决策 ${broken.id} 将“${broken.result || broken.nodes.join("/")}”标记为删除，可能切断稳态→损伤→炎症→免疫应答的教学因果链。`;
  }, [decisions]);

  const applyFeedback = async (decisionId, feedbackType) => {
    const current = decisions.find((d) => d.id === decisionId);
    if (!current) return;

    const endpoint = normalizeApiBase(apiBase);
    setFeedbackError("");
    setFeedbackBusy(true);
    try {
      if (endpoint) {
        const res = await fetch(`${endpoint}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision_id: decisionId,
            action: feedbackType,
            note: `模拟教师反馈：将该整合决策调整为${typeLabels[feedbackType]}`,
          }),
        });
        if (!res.ok) throw new Error(`Feedback ${res.status}`);
        const payload = await res.json();
        const dashboard = await fetch(`${endpoint}/api/dashboard`);
        if (dashboard.ok) {
          loadUploadedDashboard(await dashboard.json());
        } else if (payload.state) {
          loadUploadedDashboard(payload.state);
        }
      }

      setDecisions((prev) =>
        prev.map((decision) =>
          decision.id === decisionId
            ? {
                ...decision,
                type: feedbackType,
                status: "teacher-adjusted",
                reason: `模拟教师反馈已将该决策调整为“${typeLabels[feedbackType]}”，并写回后端状态。`,
              }
            : decision,
        ),
      );
      if (current.type !== feedbackType) {
        setFeedbackDiff({
          id: decisionId,
          from: current.type,
          to: feedbackType,
          at: Date.now(),
        });
        window.setTimeout(() => setFeedbackDiff((cur) => (cur && cur.id === decisionId ? null : cur)), 6000);
      }
    } catch (err) {
      setFeedbackError("后端反馈写回失败，已保留当前页面状态。");
      setDecisions((prev) =>
        prev.map((decision) =>
          decision.id === decisionId
            ? {
                ...decision,
                type: feedbackType,
                status: "teacher-adjusted",
                reason: `模拟教师反馈已将该决策调整为“${typeLabels[feedbackType]}”，但后端写回失败。`,
              }
            : decision,
        ),
      );
    } finally {
      setFeedbackBusy(false);
    }
  };

  const jumpTo = (key) => {
    const targetId = {
      decisions: "section-decisions",
      graph: "section-graph",
      compression: "section-compression",
      rag: "section-rag",
    }[key];
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUploadedDashboard = (dashboard) => {
    loadUploadedDashboard(dashboard);
    window.setTimeout(() => jumpTo("graph"), 120);
  };

  // 一键评审：依次跳到 §1 §2 §3 §4，再触发一次教师 diff 演示
  const runReview = () => {
    if (reviewRunning) return;
    setReviewRunning(true);
    const order = ["decisions", "graph", "compression", "rag"];
    order.forEach((key, i) => {
      window.setTimeout(() => jumpTo(key), i * 1400);
    });
    // 最后触发教师反馈演示
    window.setTimeout(() => {
      const target = decisions.find((d) => d.type === "merge") || decisions[0];
      if (target) {
        const next = target.type === "keep" ? "split" : "keep";
        applyFeedback(target.id, next);
      }
      setReviewRunning(false);
    }, order.length * 1400 + 300);
  };

  const runPrint = () => {
    window.print();
  };

  return (
    <main className="app">
      <Header
        source={source}
        loading={loading}
        error={error}
        onReload={reload}
        onReview={runReview}
        onPrint={runPrint}
        reviewRunning={reviewRunning}
      />
      <ReviewerBar stats={stats} onJump={jumpTo} activeKey={activeKey} />
      {feedbackDiff && (
        <div className="diff-toast" role="status">
          <span className={`stamp stamp-${feedbackDiff.to}`}>
            <Stamp size={12} /> {typeLabels[feedbackDiff.to]}
          </span>
          <span className="diff-text">
            {feedbackDiff.id} 由 <b>{typeLabels[feedbackDiff.from]}</b> 改为{" "}
            <b>{typeLabels[feedbackDiff.to]}</b>，决策已刷新。
          </span>
        </div>
      )}
      <div className="workspace-grid">
        <div className="left-rail">
          <div className="rail-label">
            <span>I</span>
            <div>
              <small>Corpus · Compression</small>
              <strong>资料源 / 压缩稽核</strong>
            </div>
          </div>
          <UploadPanel
            apiBase={apiBase}
            setApiBase={setApiBase}
            onDashboardLoaded={handleUploadedDashboard}
            onUploaded={() => setActiveKey("graph")}
          />
          <TextbookPanel textbooks={data.textbooks} onViewGraph={setBookGraphTarget} />
          <CompressionPanel compression={data.compression} />
        </div>
        <div className="center-rail">
          <div className="rail-label center">
            <span>II</span>
            <div>
              <small>Knowledge Graph</small>
              <strong>跨教材知识图谱</strong>
            </div>
          </div>
          <GraphPanel
            graph={data.graph}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            textbookFilter={textbookFilter}
            setTextbookFilter={setTextbookFilter}
            showTeachingPath={showTeachingPath}
            setShowTeachingPath={setShowTeachingPath}
            integrityWarning={integrityWarning}
          />
        </div>
        <div className="right-rail">
          <div className="rail-label">
            <span>III</span>
            <div>
              <small>Decisions · RAG</small>
              <strong>决策 / 引用问答</strong>
            </div>
          </div>
          <DecisionsPanel
            decisions={decisions}
            onApplyFeedback={applyFeedback}
            feedbackBusy={feedbackBusy}
            feedbackError={feedbackError}
          />
          <RagPanel
            rag={data.rag}
            apiBase={apiBase}
            seed={ragSeed}
            onSeedConsumed={() => setRagSeed(null)}
          />
        </div>
      </div>
      <footer className="app-footer">
        <span>Medical Knowledge Integration Agent · 编辑部评审演示稿</span>
        <span className="footer-meta">
          {stats.textbookCount} 本教材 · {stats.nodeCount} 节点 · {stats.decisionCount} 决策 · 压缩比 {stats.ratio}%
        </span>
      </footer>
      <SingleTextbookGraphModal
        open={Boolean(bookGraphTarget)}
        textbook={bookGraphTarget}
        apiBase={apiBase}
        onClose={() => setBookGraphTarget(null)}
      />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
