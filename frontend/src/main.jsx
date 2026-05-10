import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as echarts from "echarts";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
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
} from "lucide-react";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";

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

const relationLabels = {
  contains: "包含",
  prerequisite: "前置",
  related: "相关",
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
      setData({
        textbooks: next.textbooks || mockState.textbooks,
        graph: next.graph || mockState.graph,
        compression: next.compression || mockState.compression,
        decisions: next.decisions || mockState.decisions,
        rag: next.rag || mockState.rag,
      });
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

  return { data, source, loading, error, reload: loadData };
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

function PanelHeading({ tag, eyebrow, title, icon: Icon, meta }) {
  return (
    <div className="panel-heading">
      {tag && <span className="heading-tag">§{tag}</span>}
      {Icon && <Icon size={18} />}
      <div className="heading-text">
        {eyebrow && <small>{eyebrow}</small>}
        <h2>{title}</h2>
      </div>
      {meta && <span className="heading-badge">{meta}</span>}
    </div>
  );
}

function SectionHeading({ index, eyebrow, title, meta, actions }) {
  return (
    <div className="section-heading">
      <div className="heading-main">
        <span className="section-index">§{index}</span>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
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
      (node) => categoryFilter === "__all__" || node.category === categoryFilter,
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
            return `<b>${relationLabels[params.data.relation] || params.data.relation}</b>`;
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
              return {
                source: edge.source,
                target: edge.target,
                relation: edge.relation,
                lineStyle: onPath
                  ? { color: "#1f6b5e", width: 2.8, opacity: 0.95, curveness: 0.08 }
                  : undefined,
                label: {
                  show: true,
                  formatter: relationLabels[edge.relation] || edge.relation,
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
  }, [graph, selectedNodeId, onSelectNode, categoryFilter, categories, showTeachingPath]);

  const selectedColor = sourceColor(selectedNode.textbook);
  const isTeachingPath = selectedNode.category === "整合节点" || selectedNode.textbook === "跨教材整合";

  return (
    <section className="graph-shell" id="section-graph" aria-label="知识图谱">
      <SectionHeading
        index="2"
        eyebrow="Knowledge Graph"
        title="跨教材知识图谱"
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
      <div className="source-legend">
        {textbooks.map((tb) => (
          <span key={tb} className="legend-item">
            <i style={{ background: sourceColor(tb) }} />
            {tb}
          </span>
        ))}
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

function TextbookPanel({ textbooks }) {
  const parsedCount = textbooks.filter((b) => b.status === "parsed").length;
  return (
    <section className="panel" id="section-textbooks">
      <PanelHeading
        tag="0"
        eyebrow="Source Corpus"
        title="教材资料源"
        icon={BookOpen}
        meta={`${parsedCount}/${textbooks.length} 已解析`}
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
          </article>
        ))}
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

function DecisionsPanel({ decisions, onApplyFeedback }) {
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
        >
          <Stamp size={14} /> 盖章应用批注
        </button>
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

function RagPanel({ rag, seed, onSeedConsumed }) {
  const [query, setQuery] = useState(rag.question);
  const [answer, setAnswer] = useState(rag);

  const ask = (raw) => {
    const q = (typeof raw === "string" ? raw : query).trim();
    if (!q) return;
    setQuery(q);
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
      />
      <div className="search-box">
        <Search size={17} />
        <input
          id="rag-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="向医学知识库提问……（⌘/Ctrl + K 聚焦）"
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <button onClick={() => ask()} type="button">提问</button>
      </div>
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
  const { data, source, loading, error, reload } = useDashboardData();
  const [selectedNodeId, setSelectedNodeId] = useState(data.graph.nodes[0]?.id || "");
  const [decisions, setDecisions] = useState(data.decisions);
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [feedbackDiff, setFeedbackDiff] = useState(null);
  const [showTeachingPath, setShowTeachingPath] = useState(true);
  const [reviewRunning, setReviewRunning] = useState(false);
  const [ragSeed, setRagSeed] = useState(null);
  const [activeKey, setActiveKey] = useState("decisions");

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

  const applyFeedback = (decisionId, feedbackType) => {
    const current = decisions.find((d) => d.id === decisionId);
    if (!current) return;
    setDecisions((prev) =>
      prev.map((decision) =>
        decision.id === decisionId
          ? {
              ...decision,
              type: feedbackType,
              status: "teacher-adjusted",
              reason: `模拟教师反馈已将该决策调整为“${typeLabels[feedbackType]}”，前端状态已刷新，等待后端持久化接口接入。`,
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
      <ReviewerBar stats={stats} onJump={jumpTo} />
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
          <TextbookPanel textbooks={data.textbooks} />
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
          <DecisionsPanel decisions={decisions} onApplyFeedback={applyFeedback} />
          <RagPanel rag={data.rag} seed={ragSeed} onSeedConsumed={() => setRagSeed(null)} />
        </div>
      </div>
      <footer className="app-footer">
        <span>Medical Knowledge Integration Agent · 编辑部评审演示稿</span>
        <span className="footer-meta">
          {stats.textbookCount} 本教材 · {stats.nodeCount} 节点 · {stats.decisionCount} 决策 · 压缩比 {stats.ratio}%
        </span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
