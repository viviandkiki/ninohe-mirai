"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { NewsArticle } from "@/app/api/news/route";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from "d3-force";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import type { GraphData, GraphNode } from "@/lib/graph-data";

export type FilterOption = { key: string; label: string; color?: string };

interface SimNode extends SimulationNodeDatum {
  id: string;
  label: string;
  sublabel?: string;
  shortLabel?: string;
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

const W = 900;
const H = 600;

const CATEGORIES = ["産業", "歴史", "自然", "文化", "まち"];

const isActorType = (t: string) => t.startsWith("actor-");

export default function GraphView({
  data,
  filterOptions = [{ key: "all", label: "すべて" }],
  fullscreen = false,
  height,
}: {
  data: GraphData;
  height?: number;
  filterOptions?: FilterOption[];
  fullscreen?: boolean;
}) {
  const svgHeight = fullscreen ? "calc(100vh - 200px)" : (height ?? 460);
  const svgRef = useRef<SVGSVGElement>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const simLinksRef = useRef<SimLink[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simRef = useRef<any>(null);

  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const draggingNodeRef = useRef<SimNode | null>(null);
  const isPanningRef = useRef(false);
  const lastPtrRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(viewport);
  useEffect(() => { viewportRef.current = viewport; }, [viewport]);

  // ── Init simulation ──────────────────────────────────────────────────────
  useEffect(() => {
    const actors = data.nodes.filter(n => isActorType(n.type));
    const actorCount = actors.length;

    const nodes: SimNode[] = data.nodes.map(n => {
      if (isActorType(n.type)) {
        const idx = actors.findIndex(a => a.id === n.id);
        const theta = (2 * Math.PI * idx) / actorCount - Math.PI / 2;
        return { ...n, x: W/2 + 280 * Math.cos(theta), y: H/2 + 255 * Math.sin(theta), fx: undefined, fy: undefined } as SimNode;
      }
      const catIdx = CATEGORIES.indexOf(n.type);
      const catNodes = data.nodes.filter(x => x.type === n.type);
      const nIdx = catNodes.findIndex(c => c.id === n.id);
      const catTheta = catIdx >= 0 ? (2 * Math.PI * catIdx) / 5 - Math.PI / 2 : 0;
      const spread = catNodes.length > 1 ? ((nIdx / (catNodes.length - 1)) - 0.5) * 0.9 : 0;
      const r = 90 + (nIdx % 3) * 30;
      return {
        ...n,
        x: W/2 + r * Math.cos(catTheta + spread * 0.7),
        y: H/2 + r * Math.sin(catTheta + spread * 0.7),
        fx: undefined, fy: undefined,
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
            if (l.kind === "keyword-keyword") return 180;
            return Math.max(80, 200 - l.weight * 18);
          })
          .strength(l => {
            if (l.kind === "keyword-keyword") return 0.2;
            return Math.min(0.18 + l.weight * 0.04, 0.5);
          }),
      )
      .force("charge", forceManyBody<SimNode>().strength(n => isActorType(n.type) ? -280 : -520))
      .force("center", forceCenter(W / 2, H / 2).strength(0.025))
      .force("collide", forceCollide<SimNode>().radius(n => n.radius + 24).strength(0.9))
      .alphaDecay(0.008)
      .velocityDecay(0.42)
      .on("tick", () => setTick(t => t + 1));

    simNodesRef.current = nodes;
    simLinksRef.current = links;
    simRef.current = sim;

    const breatheId = setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      for (const node of simNodesRef.current) {
        if (node.fx != null) continue;
        node.vx = (node.vx ?? 0) + (Math.random() - 0.5) * 1.6;
        node.vy = (node.vy ?? 0) + (Math.random() - 0.5) * 1.6;
      }
      s.alpha(0.07).restart();
    }, 5000);

    return () => { sim.stop(); clearInterval(breatheId); };
  }, [data]);

  // ── ノード選択時にニュースを取得 ──────────────────────────────────────────
  useEffect(() => {
    if (!selected) { setNews([]); return; }
    const node = simNodesRef.current.find(n => n.id === selected);
    if (!node) return;

    setNews([]);
    setNewsLoading(true);
    const query = node.label + (node.sublabel ? ` ${node.sublabel}` : "");
    fetch(`/api/news?q=${encodeURIComponent(query)}&limit=5`)
      .then(r => r.json())
      .then(data => { setNews(data.articles ?? []); })
      .catch(() => { setNews([]); })
      .finally(() => setNewsLoading(false));
  }, [selected]);

  // ── Selection: connected IDs ─────────────────────────────────────────────
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
  }, [selected, data.links]);

  const isHighlighted = (id: string) => !selected || !!(connectedIds?.has(id));

  // ── Connection weights (for detail panel) ────────────────────────────────
  const connectionWeights = useMemo(() => {
    if (!selected) return new Map<string, number>();
    const m = new Map<string, number>();
    for (const l of data.links) {
      if (l.source === selected) m.set(l.target, l.weight);
      else if (l.target === selected) m.set(l.source, l.weight);
    }
    return m;
  }, [selected, data.links]);

  // ── Filtered nodes / links ───────────────────────────────────────────────
  const visibleNodes = useMemo(() => {
    if (filterType === "all" || filterType === "担い手") return simNodesRef.current;
    // Category filter: show those keywords + actors connected to them
    const kwIds = new Set(simNodesRef.current.filter(n => n.type === filterType).map(n => n.id));
    const connActors = new Set<string>();
    for (const l of simLinksRef.current) {
      if (l.kind !== "actor-keyword") continue;
      if (kwIds.has(l.source.id)) connActors.add(l.target.id);
      if (kwIds.has(l.target.id)) connActors.add(l.source.id);
    }
    return simNodesRef.current.filter(n => kwIds.has(n.id) || connActors.has(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, tick]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);

  const visibleLinks = useMemo(() => {
    return simLinksRef.current.filter(l => {
      if (!visibleNodeIds.has(l.source.id) || !visibleNodeIds.has(l.target.id)) return false;
      if (filterType === "担い手") return l.kind === "actor-keyword";
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNodeIds, filterType, tick]);

  // ── Coord helpers ────────────────────────────────────────────────────────
  const toGraph = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const vp = viewportRef.current;
    return { x: (cx - rect.left - vp.x) / vp.scale, y: (cy - rect.top - vp.y) / vp.scale };
  }, []);

  // ── Wheel zoom: passive:false でページスクロールを横取りしてズームに使う ──
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      setViewport(v => {
        const newScale = Math.max(0.2, Math.min(5, v.scale * factor));
        const rect = svg.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        return { x: cx - (cx - v.x) * (newScale / v.scale), y: cy - (cy - v.y) * (newScale / v.scale), scale: newScale };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onNodePointerDown = useCallback((e: React.PointerEvent, node: SimNode) => {
    e.stopPropagation();
    draggingNodeRef.current = node;
    node.fx = node.x;
    node.fy = node.y;
    simRef.current?.alphaTarget(0.2).restart();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  const onSvgPointerDown = useCallback((e: React.PointerEvent) => {
    if (draggingNodeRef.current) return;
    isPanningRef.current = true;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    svgRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const dn = draggingNodeRef.current;
    if (dn) {
      const pos = toGraph(e.clientX, e.clientY);
      dn.fx = pos.x; dn.fy = pos.y;
      simRef.current?.alphaTarget(0.05).restart();
      setTick(t => t + 1);
    } else if (isPanningRef.current) {
      const dx = e.clientX - lastPtrRef.current.x;
      const dy = e.clientY - lastPtrRef.current.y;
      lastPtrRef.current = { x: e.clientX, y: e.clientY };
      setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  }, [toGraph]);

  const onPointerUp = useCallback(() => {
    if (draggingNodeRef.current) { simRef.current?.alphaTarget(0); draggingNodeRef.current = null; }
    isPanningRef.current = false;
  }, []);

  const onNodeClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(prev => (prev === id ? null : id));
  }, []);

  const onNodeDblClick = useCallback((e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    node.fx = undefined; node.fy = undefined;
    simRef.current?.alpha(0.15).restart();
  }, []);

  // ── Detail panel data ────────────────────────────────────────────────────
  const selectedNode = simNodesRef.current.find(n => n.id === selected);
  const selIsActor = selectedNode ? isActorType(selectedNode.type) : false;

  const connectedNodes = selected && connectedIds
    ? simNodesRef.current.filter(n => connectedIds.has(n.id) && n.id !== selected)
    : [];

  const connectedKwNodes  = connectedNodes.filter(n => !isActorType(n.type));
  const connectedActorNodes = connectedNodes
    .filter(n => isActorType(n.type))
    .sort((a, b) => (connectionWeights.get(b.id) ?? 0) - (connectionWeights.get(a.id) ?? 0));
  const sortedKwNodes = connectedKwNodes
    .sort((a, b) => (connectionWeights.get(b.id) ?? 0) - (connectionWeights.get(a.id) ?? 0));

  return (
    <div className="flex flex-col gap-3">
      {/* Filter chips — mobile: 横スクロール */}
      <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setFilterType(opt.key)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === opt.key
                ? "bg-[#2e7d8c] text-white"
                : "bg-white border border-[#e2ddd6] text-[#4b5563] hover:border-[#2e7d8c]"
            }`}
          >
            {opt.color && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
            )}
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
        {/* Canvas */}
        <div className="flex-1 min-w-0 rounded-2xl overflow-hidden shadow-lg" style={{ background: "#13141f" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full block"
            style={{
              height: svgHeight,
              minHeight: 260,
              cursor: isPanningRef.current ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={onSvgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => setSelected(null)}
            aria-label="二戸のキーワードと担い手ネットワーク"
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
                const isAK = link.kind === "actor-keyword";
                const rawW = isAK ? 0.5 + link.weight * 0.75 : 0.7;
                const sw = isFocused ? Math.min(rawW * 1.6, 7) : active ? rawW : rawW * 0.5;

                const stroke = isFocused
                  ? (isAK ? "#fbbf24" : "#6ee7d4")
                  : active
                  ? (isAK ? "rgba(251,191,36,0.4)" : "rgba(110,231,212,0.25)")
                  : "rgba(255,255,255,0.05)";

                return (
                  <line
                    key={i}
                    x1={link.source.x} y1={link.source.y}
                    x2={link.target.x} y2={link.target.y}
                    stroke={stroke}
                    strokeWidth={sw}
                  />
                );
              })}

              {/* Nodes */}
              {visibleNodes.map(node => {
                const hl  = isHighlighted(node.id);
                const sel = node.id === selected;
                const isActor = isActorType(node.type);
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
                    {sel && <circle r={node.radius + 13} fill={node.color} opacity={0.2} filter="url(#glow-md)" />}
                    {/* Connected glow */}
                    {hl && !sel && <circle r={node.radius + 5} fill={node.color} opacity={0.13} filter="url(#glow-sm)" />}

                    {/* Dashed outer ring for actor nodes */}
                    {isActor && hl && (
                      <circle r={node.radius + 6} fill="none"
                        stroke={node.color} strokeWidth={1}
                        strokeDasharray="3 4" opacity={sel ? 0.7 : 0.4}
                      />
                    )}

                    {/* Main circle */}
                    <circle
                      r={node.radius}
                      fill={hl ? node.color : "#1e2030"}
                      stroke={sel ? "rgba(255,255,255,0.8)" : isActor && hl ? "rgba(255,255,255,0.35)" : hl ? `${node.color}90` : "#2a2d45"}
                      strokeWidth={sel ? 2 : 1.5}
                      opacity={hl ? 1 : 0.3}
                      style={{ transition: "opacity 0.18s ease, fill 0.18s ease" }}
                    />

                    {/* Inner 2-char label for actor nodes */}
                    {isActor && hl && (
                      <text textAnchor="middle" dy="0.35em" fontSize={7} fill="rgba(255,255,255,0.85)"
                        fontWeight="600" style={{ pointerEvents: "none", userSelect: "none" }}>
                        {(node.shortLabel ?? node.label).slice(0, 2)}
                      </text>
                    )}

                    {/* Label below */}
                    <text
                      textAnchor="middle"
                      dy={node.radius + 13}
                      fontSize={isActor ? 8 : 9.5}
                      fill={hl ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {isActor
                        ? (node.shortLabel ?? node.label).slice(0, 10)
                        : node.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* HUD */}
            <g transform={`translate(12 ${H - 36})`}>
              <text fontSize={9} fill="rgba(255,255,255,0.3)" dy="0">
                ドラッグ移動 · スクロールズーム · ダブルクリックで固定解除
              </text>
              <text fontSize={9} fill="rgba(255,255,255,0.2)" dy="13">
                実線=キーワード間 · 橙線=担い手の関与（太いほど強い関与）
              </text>
            </g>
          </svg>

          {/* Zoom controls */}
          <div className="flex items-center justify-end gap-1 px-3 py-1.5" style={{ background: "#0e0f1a" }}>
            <button onClick={() => setViewport(v => ({ ...v, scale: Math.min(5, v.scale * 1.25) }))}
              className="text-gray-400 hover:text-white text-sm w-7 h-7 rounded flex items-center justify-center hover:bg-white/10">+</button>
            <button onClick={() => setViewport(v => ({ ...v, scale: Math.max(0.2, v.scale / 1.25) }))}
              className="text-gray-400 hover:text-white text-sm w-7 h-7 rounded flex items-center justify-center hover:bg-white/10">−</button>
            <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
              className="text-gray-400 hover:text-white text-xs px-2 h-7 rounded hover:bg-white/10">⌂</button>
          </div>
        </div>

        {/* Detail / legend panel */}
        <div className="w-full lg:w-64 shrink-0">
          {selectedNode ? (
            <div className="rounded-2xl p-4 border border-[#e2ddd6] bg-white overflow-y-auto max-h-[580px]">
              <div className="w-9 h-9 rounded-full mb-3 flex items-center justify-center shrink-0"
                style={{ backgroundColor: selectedNode.color }}>
                <span className="text-white text-xs font-bold">
                  {(selectedNode.shortLabel ?? selectedNode.label).slice(0, 1)}
                </span>
              </div>
              <p className="text-[11px] text-[#6b7280] mb-0.5 font-medium uppercase tracking-wide">
                {selIsActor ? "担い手" : selectedNode.type}
              </p>
              <h3 className="text-sm font-bold text-[#111827] mb-0.5 leading-tight">{selectedNode.label}</h3>
              {selectedNode.sublabel && (
                <p className="text-[11px] text-[#6b7280] mb-3 leading-snug">{selectedNode.sublabel}</p>
              )}

              {selIsActor ? (
                /* Actor: show connected keywords sorted by weight */
                sortedKwNodes.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-[#4b5563] mb-2">
                      関連キーワード ({sortedKwNodes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sortedKwNodes.map(n => (
                        <button key={n.id}
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs text-white hover:opacity-80"
                          style={{ backgroundColor: n.color }}
                          onClick={() => setSelected(n.id)}>
                          {n.label}
                          {(connectionWeights.get(n.id) ?? 0) > 1 && (
                            <span className="text-[10px] opacity-75">×{connectionWeights.get(n.id)}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )
              ) : (
                /* Keyword: show keyword connections + actor connections */
                <>
                  {connectedKwNodes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-[#4b5563] mb-2">
                        キーワードのつながり ({connectedKwNodes.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {connectedKwNodes.map(n => (
                          <button key={n.id}
                            className="px-2 py-0.5 rounded-full text-xs text-white hover:opacity-80"
                            style={{ backgroundColor: n.color }}
                            onClick={() => setSelected(n.id)}>
                            {n.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {connectedActorNodes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#4b5563] mb-2">
                        関わる担い手 ({connectedActorNodes.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {connectedActorNodes.map(n => (
                          <button key={n.id}
                            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs text-white hover:opacity-80"
                            style={{ backgroundColor: n.color }}
                            onClick={() => setSelected(n.id)}>
                            {n.shortLabel ?? n.label}
                            {(connectionWeights.get(n.id) ?? 0) > 1 && (
                              <span className="text-[10px] opacity-75">×{connectionWeights.get(n.id)}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* 関連ニュース */}
              <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                <p className="text-xs font-semibold text-[#4b5563] mb-2 flex items-center gap-1">
                  <span>📰</span> 関連ニュース
                </p>
                {newsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse rounded-lg bg-[#f1f5f9] p-2">
                        <div className="h-3 bg-[#e2e8f0] rounded w-full mb-1.5" />
                        <div className="h-3 bg-[#e2e8f0] rounded w-2/3" />
                        <div className="h-2 bg-[#e2e8f0] rounded w-1/3 mt-1" />
                      </div>
                    ))}
                  </div>
                ) : news.length > 0 ? (
                  <div className="space-y-2">
                    {news.map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg p-2.5 bg-[#f8fafc] hover:bg-[#e0f2f7] border border-[#e2e8f0] hover:border-[#2e7d8c]/40 transition-colors group"
                      >
                        <p className="text-xs font-medium text-[#0f172a] leading-snug line-clamp-2 group-hover:text-[#0e6b7c]">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {article.source && (
                            <span className="text-[10px] text-[#475569] truncate max-w-[100px]">{article.source}</span>
                          )}
                          {article.publishedLabel && (
                            <span className="text-[10px] text-[#94a3b8] ml-auto shrink-0">{article.publishedLabel}</span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#9ca3af]">関連ニュースが見つかりませんでした</p>
                )}
              </div>

              <button className="mt-4 text-xs text-[#9ca3af] hover:text-[#4b5563]" onClick={() => setSelected(null)}>
                ✕ 選択解除
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-4 border border-[#e2ddd6] bg-[#f9f8f5]">
              <p className="text-xs font-bold text-[#111827] mb-2">キーワード</p>
              <div className="space-y-1.5 mb-4">
                {filterOptions.filter(o => o.key !== "all" && o.key !== "担い手").map(opt => (
                  opt.color ? (
                    <div key={opt.key} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                      <span className="text-xs text-[#4b5563]">{opt.label}</span>
                    </div>
                  ) : null
                ))}
              </div>

              <p className="text-xs font-bold text-[#111827] mb-2">担い手</p>
              <div className="space-y-1.5 mb-4">
                {[
                  { label: "行政", color: "#2563eb" },
                  { label: "地域団体", color: "#475569" },
                  { label: "NPO", color: "#b45309" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-white/60 shrink-0"
                      style={{ backgroundColor: color }} />
                    <span className="text-xs text-[#4b5563]">{label}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e2ddd6] pt-3">
                <p className="text-[11px] font-semibold text-[#4b5563] mb-1.5">線の太さ = 関与の強さ</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#fbbf24" strokeWidth="1.5"/></svg>
                    <span className="text-[10px] text-[#9ca3af]">弱い関与（1回）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#fbbf24" strokeWidth="3"/></svg>
                    <span className="text-[10px] text-[#9ca3af]">中程度（複数）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#fbbf24" strokeWidth="5"/></svg>
                    <span className="text-[10px] text-[#9ca3af]">強い関与（多数）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="#6ee7d4" strokeWidth="1"/></svg>
                    <span className="text-[10px] text-[#9ca3af]">キーワード間の関連</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#9ca3af] leading-relaxed mt-3">
                ノードをクリックするとつながりが表示されます。グラフは5秒ごとに揺らぎます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
