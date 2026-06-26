"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/graph-data";
import type { FilterOption } from "@/components/GraphView";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] flex items-center justify-center rounded-2xl"
      style={{ background: "#13141f" }}>
      <span className="text-sm text-gray-400">グラフを読み込み中…</span>
    </div>
  ),
});

export default function GraphViewWrapper({
  data,
  height,
  filterOptions,
}: {
  data: GraphData;
  height?: number;
  filterOptions?: FilterOption[];
}) {
  return (
    <GraphView
      data={data}
      height={height}
      filterOptions={filterOptions}
    />
  );
}
