"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import type { GraphData, GraphNode } from "@/lib/graph-data";

// d3-force mutates nodes in place — extend GraphNode with simulation fields
interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  sublabel?: string;
  type: string;
  color: string;
  radius: number;
  x: number;
  y: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
  weight: number;
  kind: string;
}

const W = 860;
const H = 580;

const TYPE_LABELS: Record<string, string> = {
  theme:     "政策テーマ",
  official:  "行政",
  council:   "議会",
  npo:       "NPO・組合",
  community: "地域団体",
};

const FILTER_OPTIONS = [
  { key: "all",       label: "すべて" },
  { key: "council",   label: "議会" },
  { key: "official",  label: "行政" },
  { key: "npo",       label: "NPO" },
  { key: "community", label: "地域団体" },
];

export default function GraphView({ data }: { data: GraphData; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  // d3 mutates these arrays — keep in refs, not state
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simRef = useRef<any>(null);

  const [tick, setTick] = useState(0);           // incremented each sim tick → triggers re-render
  const [selected, setSelected] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });

  // Interaction refs (avoid stale closures + avoid re-renders mid-gesture)
  const draggingNodeRef = useRef<SimNode | null>(null);
  const isPanningRef = useRef(false);
  const lastPtrRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);

  // ── Initialize force simulation ──────────────────────────────────────────
  useEffect(() => {
    const nodes: SimNode[] = data.nodes.map((n, i) => {
      const theta = (2 * Math.PI * i) / data.nodes.length;
      const r = n.type === "theme" ? 100 : 220;
      return {
        ...n,
        x: W / 2 + r * Math.cos(theta),
        y: H / 2 + r * Math.sin(theta),
        fx: undefined,
        fy: undefined,
      } as SimNode;
    });

    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const links: SimLink[] = data.links
      .map(l => ({
        source: nodeById.get(l.source)!,
        target: nodeById.get(l.target)!,
        weight: l.weight,
        kind: l.kind,
      }))
      .filter(l => l.source && l.target) as SimLink[];

    const sim = forceSimulation(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .distance(l => {
            if (l.kind === "actor-actor") return 85;
            const isThemeSide = (l.source as SimNode).type === "theme" || (l.target as SimNode).type === "theme";
            return isThemeSide ? 110 : 80;
          })
          .strength(l => (l.kind === "actor-actor" ? 0.25 : 0.5)),
      )
      .force("charge", forceManyBody<SimNode>().strength(n => (n.type === "theme" ? -600 : -220)))
      .force("center", forceCenter(W / 2, H / 2).strength(0.04))
      .force("collide", forceCollide<SimNode>().radius(n => n.radius + 14).strength(0.85))
      .alphaDecay(0.012)
      .velocityDecay(0.35)
      .on("tick", () => setTick(t => t + 1));

    simNodesRef.current = nodes;
    simLinksRef.current = links;
    simRef.current = sim;

    // Periodic "alive" breathing — nudge nodes every 5 seconds after settling
    const breatheId = setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      for (const node of simNodesRef.current) {
        if (node.fx != null) continue; // don't disturb pinned nodes
        node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * 1.8;
        node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * 1.8;
      }
      s.alpha(0.08).restart();
    }, 5000);

    return () => {
      sim.stop();
      clearInterval(breatheId);
    };
  }, [data]);

  // ── Connected node IDs for selection highlight ───────────────────────────
  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const ids = new Set<string>([selected]);
    for (const l of data.links) {
      if (l.source === selected || l.target === selected) {
        ids.add(l.source);
        ids.add(l.target);
      }
    }
    return ids;
  }, [selected, data]);

  const isHighlighted = (id: string) => !selected || !!(connectedIds?.has(id));

  // ── Filtered nodes/links ─────────────────────────────────────────────────
  const visibleNodes = useMemo(() => {
    if (filterType === "all") return simNodesRef.current;
    return simNodesRef.current.filter(n => n.type === filterType || n.type === "theme");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, tick]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);

  const visibleLinks = useMemo(
    () => simLinksRef.current.filter(l => visibleNodeIds.has(l.source.id) && visibleNodeIds.has(l.target.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleNodeIds, tick],
  );

  // ── SVG client → graph coords ────────────────────────────────────────────
  const toGraph = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vp = viewportRef.current;
    return {
      x: (cx - rect.left - vp.x) / vp.scale,
      y: (cy - rect.top  - vp.y) / vp.scale,
    };
  }, []);

  // ── Zoom on wheel ────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.88 : 1.14;
    setViewport(v => {
      const newScale = Math.max(0.25, Math.min(5, v.scale * factor));
      const svg = svgRef.current;
      if (!svg) return v;
      const rect = svg.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      return {
        x: cx - (cx - v.x) * (newScale / v.scale),
        y: cy - (cy - v.y) * (newScale / v.scale),
        scale: newScale,
      };
    });
  }, []);

  // ── Pointer down on node ─────────────────────────────────────────────────
  const onNodePointerDown = useCallback((e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    draggingNodeRef.current = node;
    node.fx = node.x;
    node.fy = node.y;
    simRef.current?.alphaTarget(0.2).restart();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  // ── Pointer down on background → pan ────────────────────────────────────
  const onSvgPointerDown = useCallback((e: React.PointerEvent) => {
    if (draggingNodeRef.current) return;
    isPanningRef.current = true;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    svgRef.current?.setPointerCapture(e.pointerId);
  }, []);

  // ── Pointer move ─────────────────────────────────────────────────────────
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const dn = draggingNodeRef.current;
    if (dn) {
      const pos = toGraph(e.clientX, e.clientY);
      dn.fx = pos.x;
      dn.fy = pos.y;
      simRef.current?.alphaTarget(0.05).restart();
      setTick(t => t + 1);
    } else if (isPanningRef.current) {
      const dx = e.clientX - lastPtrRef.current.x;
      const dy = e.clientY - lastPtrRef.current.y;
      lastPtrRef.current = { x: e.clientX, y: e.clientY };
      setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  }, [toGraph]);

  // ── Pointer up ───────────────────────────────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (draggingNodeRef.current) {
      simRef.current?.alphaTarget(0);
      draggingNodeRef.current = null;
    }
    isPanningRef.current = false;
  }, []);

  // ── Click node ───────────────────────────────────────────────────────────
  const onNodeClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(prev => (prev === id ? null : id));
  }, []);

  // ── Double-click → unpin ─────────────────────────────────────────────────
  const onNodeDblClick = useCallback((e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    node.fx = undefined;
    node.fy = undefined;
    simRef.current?.alpha(0.15).restart();
  }, []);

  const selectedNode = simNodesRef.current.find(n => n.id === selected);
  const connectedNodes = selected && connectedIds
    ? simNodesRef.current.filter(n => connectedIds.has(n.id) && n.id !== selected)
    : [];

  return (
    <div className="flex flex-col gap-3">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilterType(opt.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === opt.key
                ? "bg-[#2e7d8c] text-white"
                : "bg-white border border-[#e2ddd6] text-[#4b5563] hover:border-[#2e7d8c]"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
          className="ml-auto px-3 py-1 rounded-full text-xs bg-white border border-[#e2ddd6] text-[#4b5563] hover:border-[#2e7d8c]"
        >
          表示リセット
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Graph canvas */}
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden shadow-lg" style={{ background: "#13141f" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full block"
            style={{ height: 560, cursor: isPanningRef.current ? "grabbing" : "grab", touchAction: "none" }}
            onWheel={handleWheel}
            onPointerDown={onSvgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => setSelected(null)}
            aria-label="二戸市の政策テーマと担い手の関係マップ"
          >
            <defs>
              <filter id="glow-sm">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-md">
                <feGaussianBlur stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
              {/* Edges */}
              {visibleLinks.map((link, i) => {
                const hlSrc = isHighlighted(link.source.id);
                const hlTgt = isHighlighted(link.target.id);
                const active = hlSrc && hlTgt;
                const isFocused = selected && (link.source.id === selected || link.target.id === selected);
                const isActorActor = link.kind === "actor-actor";

                return (
                  <line
                    key={i}
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    stroke={
                      isFocused
                        ? isActorActor ? "#a78bfa" : "#6ee7d4"
                        : active
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(255,255,255,0.05)"
                    }
                    strokeWidth={isFocused ? Math.min(2 + link.weight * 0.5, 3.5) : 0.75}
                    strokeDasharray={isActorActor ? "4 3" : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {visibleNodes.map(node => {
                const hl = isHighlighted(node.id);
                const isSel = node.id === selected;
                const isTheme = node.type === "theme";
                const nx = node.x ?? W / 2;
                const ny = node.y ?? H / 2;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${nx} ${ny})`}
                    style={{ cursor: "pointer" }}
                    onPointerDown={e => onNodePointerDown(e, node)}
                    onClick={e => onNodeClick(e, node.id)}
                    onDoubleClick={e => onNodeDblClick(e, node)}
                  >
                    {/* Selection glow */}
                    {isSel && (
                      <circle
                        r={node.radius + 12}
                        fill={node.color}
                        opacity={0.22}
                        filter="url(#glow-md)"
                      />
                    )}
                    {/* Hover/connected glow */}
                    {hl && !isSel && (
                      <circle
                        r={node.radius + 4}
                        fill={node.color}
                        opacity={0.15}
                        filter="url(#glow-sm)"
                      />
                    )}
                    {/* Main circle */}
                    <circle
                      r={node.radius}
                      fill={hl ? node.color : "#1e2030"}
                      stroke={isSel ? node.color : hl ? `${node.color}90` : "#2e3050"}
                      strokeWidth={isSel ? 2.5 : 1.5}
                      opacity={hl ? 1 : 0.35}
                      style={{ transition: "opacity 0.18s ease, fill 0.18s ease" }}
                    />
                    {/* Inner label for theme nodes */}
                    {isTheme && hl && (
                      <text
                        textAnchor="middle"
                        dy="0.35em"
                        fontSize={10}
                        fill="white"
                        fontWeight="700"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {node.label.replace("の力", "").slice(0, 4)}
                      </text>
                    )}
                    {/* Label below node */}
                    <text
                      textAnchor="middle"
                      dy={node.radius + 13}
                      fontSize={isTheme ? 11 : 9.5}
                      fill={hl ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)"}
                      fontWeight={isTheme ? "700" : "400"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Corner HUD */}
            <g transform={`translate(12 ${H - 36})`}>
              <text fontSize={9} fill="rgba(255,255,255,0.3)" dy="0">
                ドラッグ移動 · スクロールズーム · ダブルクリックで固定解除
              </text>
              <text fontSize={9} fill="rgba(255,255,255,0.2)" dy="13">
                実線 = テーマ接続　破線 = 担い手間の共通関心
              </text>
            </g>
          </svg>

          {/* Zoom controls */}
          <div className="flex items-center justify-end gap-1 px-3 py-1.5" style={{ background: "#0e0f1a" }}>
            <button
              onClick={() => setViewport(v => ({ ...v, scale: Math.min(5, v.scale * 1.25) }))}
              className="text-gray-400 hover:text-white text-sm w-7 h-7 rounded flex items-center justify-center hover:bg-white/10"
            >+</button>
            <button
              onClick={() => setViewport(v => ({ ...v, scale: Math.max(0.25, v.scale / 1.25) }))}
              className="text-gray-400 hover:text-white text-sm w-7 h-7 rounded flex items-center justify-center hover:bg-white/10"
            >−</button>
            <button
              onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
              className="text-gray-400 hover:text-white text-xs px-2 h-7 rounded hover:bg-white/10"
            >⌂</button>
          </div>
        </div>

        {/* Detail / legend panel */}
        <div className="w-full lg:w-60 shrink-0">
          {selectedNode ? (
            <div className="rounded-2xl p-4 border border-[#e2ddd6] bg-white">
              <div className="w-9 h-9 rounded-full mb-3 flex items-center justify-center"
                style={{ backgroundColor: selectedNode.color }}>
                <span className="text-white text-xs font-bold">{selectedNode.label.slice(0, 1)}</span>
              </div>
              <p className="text-[11px] text-[#6b7280] mb-0.5 font-medium uppercase tracking-wide">
                {TYPE_LABELS[selectedNode.type] ?? selectedNode.type}
              </p>
              <h3 className="text-base font-bold text-[#111827] mb-1 leading-tight">{selectedNode.label}</h3>
              {selectedNode.sublabel && (
                <p className="text-xs text-[#6b7280] mb-3">{selectedNode.sublabel}</p>
              )}
              {connectedNodes.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-[#4b5563] mb-2">つながり ({connectedNodes.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedNodes.map(n => (
                      <button
                        key={n.id}
                        className="px-2 py-0.5 rounded-full text-xs text-white hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: n.color }}
                        onClick={() => setSelected(n.id)}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                className="mt-4 text-xs text-[#9ca3af] hover:text-[#4b5563]"
                onClick={() => setSelected(null)}
              >
                ✕ 選択解除
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4 border border-[#e2ddd6] bg-[#f9f8f5]">
              <p className="text-sm font-bold text-[#111827] mb-3">凡例</p>
              <div className="space-y-2 mb-4">
                {[
                  { color: "#c9614a", label: "政策テーマ（大ノード）" },
                  { color: "#1e3a5f", label: "行政" },
                  { color: "#2e7d8c", label: "議会" },
                  { color: "#2d7a5f", label: "地域団体" },
                  { color: "#b8872a", label: "NPO・組合" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[#4b5563]">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#e2ddd6] pt-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 border-t border-[#4b5563]" />
                  <span className="text-xs text-[#4b5563]">テーマとのつながり</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 border-t-2 border-dashed border-[#a78bfa]" />
                  <span className="text-xs text-[#4b5563]">担い手間の共通関心</span>
                </div>
              </div>
              <p className="text-[11px] text-[#9ca3af] mt-3 leading-relaxed">
                共通の政策テーマを持つ担い手同士が破線でつながっています。グラフは5秒ごとにゆっくり再配置されます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
