import type { Metadata } from "next";
import { buildKeywordGraphData, CATEGORY_COLORS, KEYWORD_CATEGORIES } from "@/lib/keyword-graph";
import GraphViewWrapper from "@/components/GraphViewWrapper";
import Link from "next/link";
import { ArrowLeft, Network } from "lucide-react";

export const metadata: Metadata = {
  title: "キーワードマップ",
  description: "漆・九戸城・里山・南部美人…二戸を語るキーワードと担い手が有機的につながるナレッジグラフ。",
};

const FILTER_OPTIONS = [
  { key: "all", label: "すべて" },
  ...KEYWORD_CATEGORIES.map(cat => ({ key: cat, label: cat, color: CATEGORY_COLORS[cat] })),
  { key: "担い手", label: "担い手のみ" },
];

export default function GraphPage() {
  const graphData = buildKeywordGraphData();

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* 全画面ヘッダー */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2a3a] bg-[#0a0e1a]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-base text-[#9ca3af] hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </Link>
          <span className="text-[#1e2a3a]">|</span>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#2e7d8c]" />
            <div>
              <span className="text-xs text-[#2e7d8c] font-bold uppercase tracking-widest block">KEYWORD MAP</span>
              <span className="text-lg font-black text-white leading-none">キーワードマップ</span>
            </div>
          </div>
        </div>
        <p className="hidden md:block text-sm text-[#6b7280] max-w-sm">
          漆・九戸城・里山・南部美人など、二戸のキーワードと担い手のネットワーク
        </p>
      </div>

      {/* 全画面グラフ */}
      <div className="flex-1 relative" style={{ minHeight: "calc(100vh - 130px)" }}>
        <GraphViewWrapper
          data={graphData}
          filterOptions={FILTER_OPTIONS}
          fullscreen
        />
      </div>

      {/* フッター注記 */}
      <div className="px-4 py-3 border-t border-[#1e2a3a] bg-[#050810]">
        <p className="text-sm text-[#4b5563] text-center">
          線の太さ=関与の強さ ・ 丸の大きさ=接続数 ・ ドラッグで移動 ・ スクロールでズーム ・ ダブルクリックで固定解除
        </p>
      </div>
    </div>
  );
}
