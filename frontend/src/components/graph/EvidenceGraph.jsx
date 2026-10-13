import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Network,
  BookOpen,
  FileSearch,
  ArrowRight,
  ExternalLink,
  FlaskConical,
  AlertCircle,
} from "lucide-react";
import Button from "../common/Button";
import Tag from "../common/Tag";
import { getGraph } from "../../lib/api";

export default function EvidenceGraph({
  analysisId,
  onOpenPaper,
  onOpenGap,
  onProposeExperiment,
}) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Graph interaction states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  // Physics simulation nodes
  const [simNodes, setSimNodes] = useState([]);
  const svgRef = useRef(null);

  // Fetch genuine graph data from backend
  const fetchGraphData = async () => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getGraph(analysisId);
      setGraphData(data);
      initializeSimulation(data.nodes, data.edges);
    } catch (err) {
      setError(err.message || "Failed to load evidence graph from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [analysisId]);

  // Initialize and run simple 2D force layout
  const initializeSimulation = (nodes = [], edges = []) => {
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    // Distribute nodes initial positions
    const initialNodes = nodes.map((node, i) => {
      const isPaper = node.type === "paper";
      // Put papers on left/center-top, gaps on right/center-bottom
      const angle = (i / Math.max(1, nodes.length)) * 2 * Math.PI;
      const radius = isPaper ? 180 + (i % 3) * 40 : 120 + (i % 2) * 30;

      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: isPaper ? 22 : 28,
      };
    });

    // Run force iterations
    for (let step = 0; step < 70; step++) {
      // Repulsion between all node pairs
      for (let i = 0; i < initialNodes.length; i++) {
        for (let j = i + 1; j < initialNodes.length; j++) {
          const n1 = initialNodes[i];
          const n2 = initialNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          if (dist < 260) {
            const force = (260 - dist) / dist * 0.12;
            n1.x -= dx * force;
            n1.y -= dy * force;
            n2.x += dx * force;
            n2.y += dy * force;
          }
        }
      }

      // Edge spring attraction
      edges.forEach((edge) => {
        const sourceNode = initialNodes.find((n) => n.id === edge.source);
        const targetNode = initialNodes.find((n) => n.id === edge.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 130;
          const force = (dist - targetDist) * 0.04;
          sourceNode.x += (dx / dist) * force;
          sourceNode.y += (dy / dist) * force;
          targetNode.x -= (dx / dist) * force;
          targetNode.y -= (dy / dist) * force;
        }
      });

      // Gravity towards center
      initialNodes.forEach((n) => {
        n.x += (centerX - n.x) * 0.015;
        n.y += (centerY - n.y) * 0.015;
      });
    }

    setSimNodes(initialNodes);
  };

  // Dragging a node
  const [draggedNodeId, setDraggedNodeId] = useState(null);

  const handleMouseDownNode = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (draggedNodeId) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      setSimNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY } : n))
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  const handleStartPan = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(2.5, Math.max(0.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  };

  // Connected nodes map
  const connectedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId || !graphData?.edges) return new Set();

    const ids = new Set([activeId]);
    graphData.edges.forEach((edge) => {
      if (edge.source === activeId) ids.add(edge.target);
      if (edge.target === activeId) ids.add(edge.source);
    });
    return ids;
  }, [hoveredNodeId, selectedNodeId, graphData]);

  // Find currently selected node
  const selectedNode = useMemo(() => {
    return simNodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, simNodes]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#dce5e0] bg-white p-12 text-center shadow-xs">
        <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#0b655b] border-t-transparent animate-spin mb-4" />
        <h3 className="text-base font-bold text-[#14322a] font-display">
          Building evidence relationship network...
        </h3>
        <p className="mt-1 text-xs text-[#6e857b]">
          Mapping verified links between retrieved literature and candidate research gaps.
        </p>
      </div>
    );
  }

  if (error || !graphData || graphData.nodes?.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#dce5e0] bg-white p-12 text-center">
        <Network size={36} className="mx-auto text-[#728b80] mb-3" />
        <h3 className="text-base font-bold text-[#14322a]">
          {error ? "Evidence Graph Unavailable" : "No Graph Data Generated"}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#698478] max-w-md mx-auto">
          {error || "Run a scientific question analysis first to build evidence-to-gap relationships."}
        </p>
        <Button onClick={fetchGraphData} variant="secondary" size="sm" className="mt-5">
          <RefreshCw size={13} /> Retry Graph Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce5e0] bg-white p-3.5 shadow-xs">
        {/* Search for a node */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#80988d]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search visible papers or gaps..."
            className="w-full rounded-xl border border-[#dfe8e2] bg-[#f8faf8] py-2 pl-8 pr-3 text-xs outline-none focus:border-[#0b655b] focus:bg-white"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#506c60]">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#0b655b] border border-[#074b43]" />
            <span>Source Paper ({graphData.nodes.filter((n) => n.type === "paper").length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-lg bg-[#34d399] border border-[#22b27b]" />
            <span>Candidate Gap ({graphData.nodes.filter((n) => n.type === "gap").length})</span>
          </span>
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <span className="h-0.5 w-4 bg-[#7ebaa0] border-t border-dashed" />
            <span>Supports Link</span>
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 rounded-lg border border-[#dfe8e2] bg-white text-[#47655a] hover:bg-[#f2f7f4]"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
            className="p-1.5 rounded-lg border border-[#dfe8e2] bg-white text-[#47655a] hover:bg-[#f2f7f4]"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 rounded-lg border border-[#dfe8e2] bg-white text-[#47655a] hover:bg-[#f2f7f4]"
            title="Reset View"
          >
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Graph Canvas & Inspector Grid */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {/* Interactive SVG Canvas */}
        <div
          className="relative h-[560px] rounded-3xl border border-[#dce5e0] bg-gradient-to-b from-[#f8faf8] to-[#edf3ef] overflow-hidden shadow-inner cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleStartPan}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Subtle Background Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: "radial-gradient(#0b655b 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <svg
            ref={svgRef}
            className="h-full w-full"
            viewBox="0 0 800 550"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Arrow marker for supports edges */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0b655b" opacity="0.6" />
              </marker>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {graphData.edges.map((edge, idx) => {
                const s = simNodes.find((n) => n.id === edge.source);
                const t = simNodes.find((n) => n.id === edge.target);
                if (!s || !t) return null;

                const isConnected =
                  connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);
                const isActive = (selectedNodeId || hoveredNodeId) && isConnected;

                return (
                  <line
                    key={`edge-${idx}`}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={isActive ? "#0b655b" : "#97b8aa"}
                    strokeWidth={isActive ? 2.8 : 1.4}
                    strokeDasharray={isActive ? "none" : "4 3"}
                    opacity={selectedNodeId || hoveredNodeId ? (isActive ? 1 : 0.2) : 0.7}
                    markerEnd="url(#arrow)"
                    className="transition-all duration-200"
                  />
                );
              })}

              {/* Nodes */}
              {simNodes.map((node) => {
                const isPaper = node.type === "paper";
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const matchesSearch =
                  !searchFilter ||
                  node.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  node.id.toLowerCase().includes(searchFilter.toLowerCase());

                const opacity =
                  (selectedNodeId || hoveredNodeId) && !isConnected && !isSelected
                    ? 0.25
                    : matchesSearch
                    ? 1
                    : 0.3;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform duration-75"
                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    opacity={opacity}
                  >
                    {/* Glow outline if selected or hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={node.radius + 8}
                        fill="none"
                        stroke={isPaper ? "#0b655b" : "#34d399"}
                        strokeWidth="3"
                        opacity="0.8"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Body */}
                    {isPaper ? (
                      <circle
                        r={node.radius}
                        fill={isSelected ? "#084e46" : "#0b655b"}
                        stroke="#b8f0d5"
                        strokeWidth={isSelected ? 3 : 1.5}
                        className="transition-all hover:scale-105"
                      />
                    ) : (
                      <rect
                        x={-node.radius}
                        y={-node.radius}
                        width={node.radius * 2}
                        height={node.radius * 2}
                        rx="10"
                        fill={isSelected ? "#10b981" : "#34d399"}
                        stroke="#0b655b"
                        strokeWidth={isSelected ? 3 : 1.5}
                        className="transition-all hover:scale-105"
                      />
                    )}

                    {/* Node ID Label */}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill={isPaper ? "#b8f0d5" : "#083e33"}
                      fontSize={isPaper ? "11px" : "12px"}
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                      className="pointer-events-none select-none"
                    >
                      {node.id}
                    </text>

                    {/* Short label caption under node */}
                    <text
                      textAnchor="middle"
                      dy={node.radius + 14}
                      fill="#12342c"
                      fontSize="9.5px"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                      style={{ maxWidth: "80px" }}
                    >
                      {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick instructions pill */}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-3 py-1 text-[10px] text-[#557367] border border-[#dce5e0] shadow-2xs pointer-events-none">
            💡 Drag nodes to rearrange • Scroll to zoom • Click to inspect details
          </div>
        </div>

        {/* Right Inspector Panel */}
        <aside className="rounded-3xl border border-[#dce5e0] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#edf2ef] pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#102a24] flex items-center gap-1.5">
                <Network size={14} className="text-[#0b655b]" /> Network Inspector
              </span>
              {selectedNode && (
                <Tag tone={selectedNode.type === "paper" ? "teal" : "green"}>
                  {selectedNode.type === "paper" ? "Source Paper" : "Candidate Gap"}
                </Tag>
              )}
            </div>

            {!selectedNode ? (
              <div className="py-12 text-center text-xs text-[#70897f]">
                <Network size={28} className="mx-auto text-[#97b3a7] mb-2 opacity-60" />
                <p className="font-semibold text-[#183930]">No Node Selected</p>
                <p className="mt-1 text-[11px] leading-5">
                  Click on any paper circle or candidate gap square in the graph to inspect its evidence connections.
                </p>
              </div>
            ) : selectedNode.type === "paper" ? (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0b655b] text-[#b8f0d5]">
                    {selectedNode.id}
                  </span>
                  <h4 className="mt-2 text-sm font-bold leading-snug text-[#102a24]">
                    {selectedNode.data?.title || selectedNode.label}
                  </h4>
                  <p className="mt-1 text-xs text-[#637d72]">
                    {Array.isArray(selectedNode.data?.authors)
                      ? selectedNode.data.authors.slice(0, 3).join(", ")
                      : selectedNode.data?.authors || "Authors not listed"}
                  </p>
                </div>

                {selectedNode.data?.abstract && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#607d71] block mb-1">
                      Abstract Excerpt
                    </span>
                    <p className="text-xs leading-relaxed text-[#455f54] bg-[#f7faf8] p-3 rounded-xl border border-[#e4ede7] max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedNode.data.abstract}
                    </p>
                  </div>
                )}

                {/* Connected candidate gaps */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#607d71] block mb-1.5">
                    Connected Research Gaps
                  </span>
                  <div className="space-y-1.5">
                    {graphData.edges
                      .filter((e) => e.source === selectedNode.id)
                      .map((edge) => {
                        const gapNode = simNodes.find((n) => n.id === edge.target);
                        return (
                          <button
                            key={edge.target}
                            onClick={() => setSelectedNodeId(edge.target)}
                            className="w-full text-left p-2 rounded-lg bg-[#f0f7f3] hover:bg-[#e1f0e7] transition-colors text-xs font-medium text-[#113a30] truncate block"
                          >
                            → {edge.target}: {gapNode?.label || "Candidate Gap"}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onOpenPaper(selectedNode.data || { id: selectedNode.id, title: selectedNode.label })}
                    className="w-full"
                  >
                    <BookOpen size={13} /> View Full Paper Metadata
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#34d399] text-[#083a30]">
                    {selectedNode.id}
                  </span>
                  <h4 className="mt-2 text-sm font-bold leading-snug text-[#102a24]">
                    {selectedNode.data?.title || selectedNode.label}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#506a5f]">
                    {selectedNode.data?.description || "Candidate research question surfaced from retrieved corpus."}
                  </p>
                </div>

                {selectedNode.data?.priority_score && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7faf8] border border-[#e2ede6]">
                    <span className="text-xs text-[#527064]">Priority Score</span>
                    <span className="font-mono text-base font-extrabold text-[#0b655b]">
                      {selectedNode.data.priority_score} / 100
                    </span>
                  </div>
                )}

                {/* Supporting papers for this gap */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#607d71] block mb-1.5">
                    Supporting Source Papers
                  </span>
                  <div className="space-y-1.5">
                    {graphData.edges
                      .filter((e) => e.target === selectedNode.id)
                      .map((edge) => {
                        const paperNode = simNodes.find((n) => n.id === edge.source);
                        return (
                          <button
                            key={edge.source}
                            onClick={() => setSelectedNodeId(edge.source)}
                            className="w-full text-left p-2 rounded-lg bg-[#f0f7f3] hover:bg-[#e1f0e7] transition-colors text-xs font-medium text-[#113a30] truncate block"
                          >
                            ← {edge.source}: {paperNode?.label || "Paper"}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onOpenGap(selectedNode.data || { id: selectedNode.id, title: selectedNode.label })}
                    className="w-full"
                  >
                    <FileSearch size={13} /> Deep Evidence Inspection
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onProposeExperiment(selectedNode.data || { id: selectedNode.id, title: selectedNode.label })}
                    className="w-full text-[#0b655b]"
                  >
                    <FlaskConical size={13} /> Propose Experiment Protocol
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#edf2ef] text-[10px] text-[#789286]">
            Every node and relationship represents actual data from Europe PMC and the analysis model.
          </div>
        </aside>
      </div>
    </div>
  );
}
