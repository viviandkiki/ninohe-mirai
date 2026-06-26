"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/graph-data";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="h-80 flex items-center justify-center bg-white border border-[#e2ddd6] rounded-xl">
      <span className="text-sm text-[#4b5563]">読み込み中...</span>
    </div>
  ),
});

export default function GraphViewWrapper({
  data,
  height,
}: {
  data: GraphData;
  height?: number;
}) {
  return <GraphView data={data} height={height} />;
}
