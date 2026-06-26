"use client";

import { useState, useMemo } from "react";
import type { GraphData, GraphNode } from "@/lib/graph-data";

interface GraphViewProps {
  data: GraphData;
  height?: number;
  showLabels?: boolean;
  filterType?: "all" | "theme" | "member";
}

function radialPos(index: number, total: number, radius: number, cx: number, cy: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export default function GraphView({
  data,
  height = 520,
  showLabels = true,
  filterType = "all",
}: GraphViewProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const cx = 300;
  const cy = 260;
  const THEME_RADIUS = 130;
  const ACTOR_RADIUS = 235;

  const { nodePositions, filteredNodes, filteredLinks } = useMemo(() => {
    const themeNodes = data.nodes.filter((n) => n.type === "theme");
    const actorNodes = data.nodes.filter((n) => n.type !== "theme");

    const fNodes =
      filterType === "theme"
        ? [
            ...themeNodes,
            ...actorNodes.filter(
              (n) => n.type === "council" || n.type === "official"
            ),
          ]
        : filterType === "member"
        ? actorNodes
        : data.nodes;

    const filteredNodeIds = new Set(fNodes.map((n) => n.id));
    const fLinks = data.links.filter(
      (l) => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
    );

    const positions = new Map<string, { x: number; y: number }>();

    themeNodes.forEach((node, i) => {
      positions.set(node.id, radialPos(i, themeNodes.length, THEME_RADIUS, cx, cy));
    });

    actorNodes.forEach((node, i) => {
      positions.set(node.id, radialPos(i, actorNodes.length, ACTOR_RADIUS, cx, cy));
    });

    return { nodePositions: positions, filteredNodes: fNodes, filteredLinks: fLinks };
  }, [data, filterType, cx, cy]);

  const selectedNode = data.nodes.find((n) => n.id === selected);
  const connectedIds = selected
    ? new Set(
        filteredLinks
          .filter((l) => l.source === selected || l.target === selected)
          .flatMap((l) => [l.source, l.target])
      )
    : null;

  const isHighlighted = (id: string) => {
    if (!selected) return true;
    return id === selected || (connectedIds?.has(id) ?? false);
  };

  const connectedNodes = selected
    ? data.nodes.filter((n) => connectedIds?.has(n.id) && n.id !== selected)
    : [];

  const typeLabel = (type: string) => {
    if (type === "theme") return "政策テーマ";
    if (type === "official") return "行政";
    if (type === "council") return "議会";
    if (type === "npo") return "NPO・組合";
    return "地域団体";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0">
        <svg
          viewBox={`0 0 600 ${height}`}
          className="w-full border border-[var(--color-border)] rounded-xl bg-white"
          role="img"
          aria-label="二戸市の政策テーマと担い手の関係マップ"
        >
          {/* Links */}
          {filteredLinks.map((link, i) => {
            const sourcePos = nodePositions.get(link.source);
            const targetPos = nodePositions.get(link.target);
            if (!sourcePos || !targetPos) return null;
            const highlighted =
              isHighlighted(link.source) && isHighlighted(link.target);
            return (
              <line
                key={i}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={highlighted ? "#2e7d8c" : "#e2ddd6"}
                strokeWidth={
                  highlighted ? Math.min(1 + link.weight * 0.6, 3.5) : 0.8
                }
                strokeOpacity={highlighted ? 0.55 : 0.3}
              />
            );
          })}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;
            const isTheme = node.type === "theme";
            const highlighted = isHighlighted(node.id);
            const isSelected = selected === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() =>
                  setSelected(selected === node.id ? null : node.id)
                }
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={node.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelected(selected === node.id ? null : node.id);
                  }
                }}
              >
                {isSelected && (
                  <circle
                    r={node.radius + 6}
                    fill={node.color}
                    fillOpacity={0.15}
                    stroke={node.color}
                    strokeWidth={2}
                  />
                )}
                <circle
                  r={node.radius}
                  fill={highlighted ? node.color : "#d1d5db"}
                  fillOpacity={highlighted ? (isTheme ? 0.9 : 0.85) : 0.4}
                  stroke={isSelected ? node.color : "white"}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s ease" }}
                />
                {showLabels && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isTheme ? 12 : 10}
                    fill={highlighted ? "white" : "#9ca3af"}
                    fontWeight={isTheme ? "700" : "500"}
                    style={{ pointerEvents: "none", transition: "all 0.2s ease" }}
                  >
                    {node.label.length > 5
                      ? node.label.slice(0, 4) + "…"
                      : node.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center label */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="#9ca3af"
            fontWeight="600"
          >
            二戸市
          </text>
        </svg>

        <p className="text-xs text-[var(--color-text-muted)] mt-2 text-center">
          ノードをクリックするとつながりが表示されます
        </p>
      </div>

      {/* Detail panel */}
      <div className="w-full lg:w-64 shrink-0">
        {selectedNode ? (
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-4">
            <div
              className="w-8 h-8 rounded-full mb-3"
              style={{ backgroundColor: selectedNode.color }}
            />
            <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
              {typeLabel(selectedNode.type)}
            </p>
            <h3 className="text-base font-bold text-[var(--color-text)] mb-3">
              {selectedNode.label}
            </h3>
            {connectedNodes.length > 0 && (
              <>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
                  つながっている担い手・テーマ
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {connectedNodes.map((n) => (
                    <span
                      key={n.id}
                      className="px-2 py-0.5 rounded-full text-xs text-white"
                      style={{ backgroundColor: n.color }}
                    >
                      {n.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
              凡例
            </p>
            <div className="space-y-2">
              {[
                { color: "#c9614a", label: "政策テーマ（働く力 等）" },
                { color: "#1e3a5f", label: "行政（市長）" },
                { color: "#2e7d8c", label: "議会議員" },
                { color: "#2d7a5f", label: "地域団体・経済団体" },
                { color: "#b8872a", label: "NPO・組合" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
              線の太さは共同関与回数を示します。ノードをクリックして詳細を確認できます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
