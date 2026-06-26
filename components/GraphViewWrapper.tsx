"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/graph-data";
import type { FilterOption } from "@/components/GraphView";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl" style={{ background: "#13141f", minHeight: 400 }}>
      <span className="text-sm text-gray-400">グラフを読み込み中…</span>
    </div>
  ),
});

export default function GraphViewWrapper({
  data,
  height,
  filterOptions,
  fullscreen,
}: {
  data: GraphData;
  height?: number;
  filterOptions?: FilterOption[];
  fullscreen?: boolean;
}) {
  return (
    <GraphView
      data={data}
      height={height}
      filterOptions={filterOptions}
      fullscreen={fullscreen}
    />
  );
}
