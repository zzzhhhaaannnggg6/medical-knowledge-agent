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
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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

function GraphPanel({ graph, selectedNodeId, onSelectNode }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) || graph.nodes[0],
    [graph.nodes, selectedNodeId],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;

    const categories = ["概念", "机制", "病理过程", "整合节点"].map((name) => ({ name }));
    const colorMap = {
      "病理学 第9版": "#d4553f",
      "生理学 第9版": "#257e73",
      医学免疫学: "#6a63b6",
      跨教材整合: "#b47b1f",
    };

    chart.setOption({
      tooltip: {
        trigger: "item",
        formatter(params) {
          if (params.dataType === "edge") {
            return `${relationLabels[params.data.relation] || params.data.relation}`;
          }
          return `${params.data.name}<br/>${params.data.chapter}<br/>${params.data.pages}`;
        },
      },
      legend: {
        top: 8,
        left: 12,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "#4b5563", fontSize: 12 },
        data: categories.map((item) => item.name),
      },
      series: [
        {
          type: "graph",
          layout: "force",
          roam: true,
          draggable: true,
          categories,
          edgeSymbol: ["none", "arrow"],
          force: {
            repulsion: 360,
            edgeLength: [88, 180],
            gravity: 0.08,
          },
          label: {
            show: true,
            position: "right",
            color: "#17202a",
            fontSize: 12,
          },
          lineStyle: {
            color: "#a1a8b3",
            width: 1.4,
            curveness: 0.12,
          },
          emphasis: {
            focus: "adjacency",
            lineStyle: { width: 3 },
          },
          data: graph.nodes.map((node) => ({
            ...node,
            value: node.sourceCount,
            category: categories.findIndex((item) => item.name === node.category),
            symbolSize: 34 + node.sourceCount * 8,
            itemStyle: {
              color: node.id === selectedNodeId ? "#101828" : colorMap[node.textbook] || "#64748b",
              borderColor: "#fff",
              borderWidth: node.id === selectedNodeId ? 4 : 2,
            },
          })),
          links: graph.edges.map((edge) => ({
            source: edge.source,
            target: edge.target,
            relation: edge.relation,
            label: {
              show: true,
              formatter: relationLabels[edge.relation] || edge.relation,
              color: "#667085",
              fontSize: 10,
            },
          })),
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
  }, [graph, selectedNodeId, onSelectNode]);

  return (
    <section className="graph-shell" aria-label="知识图谱">
      <div className="section-title">
        <div>
          <p>Knowledge Graph</p>
          <h2>跨教材知识图谱</h2>
        </div>
        <div className="graph-tools">
          <span className="tool-pill"><Network size={14} /> 缩放拖拽</span>
          <span className="tool-pill"><Layers3 size={14} /> 来源映射</span>
        </div>
      </div>
      <div className="graph-grid">
        <div className="graph-canvas" ref={containerRef} />
        <aside className="node-detail">
          <div className="detail-header">
            <span>{selectedNode.category}</span>
            <strong>{selectedNode.name}</strong>
          </div>
          <p>{selectedNode.definition}</p>
          <dl>
            <div>
              <dt>来源教材</dt>
              <dd>{selectedNode.textbook}</dd>
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
              <dt>频次</dt>
              <dd>{selectedNode.sourceCount} 处</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

function TextbookPanel({ textbooks }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <BookOpen size={18} />
        <h2>教材解析</h2>
      </div>
      <div className="textbook-list">
        {textbooks.map((book) => (
          <article className="textbook-card" key={book.id}>
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
                    <span>{chapter.pages} · {formatNumber(chapter.chars)} 字</span>
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
  return (
    <section className="panel compression-panel">
      <div className="panel-heading">
        <GitMerge size={18} />
        <h2>整合压缩</h2>
      </div>
      <div className="ratio-card">
        <div>
          <span>压缩比</span>
          <strong>{compression.ratio}%</strong>
        </div>
        <span className={`target ${passed ? "pass" : "fail"}`}>
          {passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          目标 {"<="} {compression.target}%
        </span>
      </div>
      <div className="bar-track">
        <div style={{ width: `${Math.min(compression.ratio, 100)}%` }} />
        <span style={{ left: `${compression.target}%` }} />
      </div>
      <div className="metric-row">
        <span>原始正文 {formatNumber(compression.originalChars)} 字</span>
        <span>整合后 {formatNumber(compression.integratedChars)} 字</span>
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

  return (
    <section className="panel">
      <div className="panel-heading">
        <SlidersHorizontal size={18} />
        <h2>整合决策</h2>
      </div>
      <div className="decision-list">
        {decisions.map((decision) => (
          <button
            className={`decision ${selected === decision.id ? "selected" : ""}`}
            key={decision.id}
            onClick={() => setSelected(decision.id)}
            type="button"
          >
            <span className={`decision-type ${decision.type}`}>{typeLabels[decision.type]}</span>
            <strong>{decision.result}</strong>
            <p>{decision.reason}</p>
            <small>置信度 {(decision.confidence * 100).toFixed(0)}% · {decision.nodes.join(" / ")}</small>
          </button>
        ))}
      </div>
      <div className="feedback-box">
        <div>
          <span>模拟教师反馈</span>
          <strong>对选中决策执行修改</strong>
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
        <button className="primary-action" onClick={() => onApplyFeedback(selected, feedback)} type="button">
          应用反馈
        </button>
      </div>
    </section>
  );
}

function RagPanel({ rag }) {
  const [query, setQuery] = useState(rag.question);
  const [answer, setAnswer] = useState(rag);

  const ask = () => {
    if (!query.trim()) return;
    if (query.includes("不存在") || query.includes("未收录")) {
      setAnswer({
        question: query,
        answer: "当前知识库中未找到相关信息。",
        citations: [],
      });
      return;
    }
    setAnswer({ ...rag, question: query });
  };

  return (
    <section className="panel rag-panel">
      <div className="panel-heading">
        <MessageSquareText size={18} />
        <h2>RAG 引用问答</h2>
      </div>
      <div className="search-box">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} />
        <button onClick={ask} type="button">提问</button>
      </div>
      <div className="answer-box">
        <p>{answer.answer}</p>
      </div>
      <div className="citation-list">
        {answer.citations.length === 0 ? (
          <div className="empty-citation">未返回教材引用</div>
        ) : (
          answer.citations.map((citation) => (
            <article key={`${citation.textbook}-${citation.pages}`}>
              <div>
                <strong>{citation.textbook}</strong>
                <span>{citation.chapter} · {citation.pages} · 相关度 {(citation.relevance * 100).toFixed(0)}%</span>
              </div>
              <p>{citation.excerpt}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function Header({ source, loading, error, onReload }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={22} /></div>
        <div>
          <p>Medical Knowledge Integration Agent</p>
          <h1>医学教材知识整合智能体</h1>
        </div>
      </div>
      <div className="header-actions">
        {error && <span className="api-warning"><AlertCircle size={15} /> {error}</span>}
        <span className={`source-badge ${source}`}>{source === "api" ? "真实 API" : "Demo 数据"}</span>
        <button className="icon-button" onClick={onReload} type="button" aria-label="刷新数据">
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

  useEffect(() => {
    setDecisions(data.decisions);
    if (!data.graph.nodes.find((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(data.graph.nodes[0]?.id || "");
    }
  }, [data, selectedNodeId]);

  const applyFeedback = (decisionId, feedbackType) => {
    setDecisions((current) =>
      current.map((decision) =>
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
  };

  return (
    <main className="app">
      <Header source={source} loading={loading} error={error} onReload={reload} />
      <section className="summary-band">
        <div>
          <FileText size={20} />
          <span>教材</span>
          <strong>{data.textbooks.filter((book) => book.status === "parsed").length}/{data.textbooks.length}</strong>
        </div>
        <div>
          <Network size={20} />
          <span>知识点</span>
          <strong>{data.graph.nodes.length}</strong>
        </div>
        <div>
          <GitMerge size={20} />
          <span>整合决策</span>
          <strong>{decisions.length}</strong>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>压缩目标</span>
          <strong>{data.compression.ratio <= data.compression.target ? "达标" : "待优化"}</strong>
        </div>
      </section>
      <div className="workspace-grid">
        <div className="left-rail">
          <TextbookPanel textbooks={data.textbooks} />
          <CompressionPanel compression={data.compression} />
        </div>
        <GraphPanel graph={data.graph} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
        <div className="right-rail">
          <DecisionsPanel decisions={decisions} onApplyFeedback={applyFeedback} />
          <RagPanel rag={data.rag} />
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
