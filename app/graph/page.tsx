import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import { buildKeywordGraphData, CATEGORY_COLORS, KEYWORD_CATEGORIES } from "@/lib/keyword-graph";
import GraphViewWrapper from "@/components/GraphViewWrapper";

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
    <PageContainer>
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">
          KEYWORD MAP
        </p>
        <SectionHeading title="キーワードマップ" subtitle="二戸をひもとく言葉のネットワーク" />
        <p className="text-base text-[#4b5563] leading-relaxed max-w-2xl">
          漆・九戸城・里山・南部美人など、二戸にまつわるキーワードと担い手（行政・団体・NPO）が有機的につながります。
          線の太さは関与の強さ、丸の大きさは接続数を表します。ノードをクリックするとつながりが表示されます。
        </p>
      </div>

      <GraphViewWrapper
        data={graphData}
        filterOptions={FILTER_OPTIONS}
      />

      <div className="mt-8 bg-white border border-[#e2ddd6] rounded-xl p-5">
        <h2 className="text-base font-bold text-[#111827] mb-2">このマップについて</h2>
        <p className="text-sm text-[#4b5563] leading-relaxed">
          二戸の産業・歴史・自然・文化・くらしに関するキーワードを収録しています。
          キーワード間の線は「関連性」を示しています。
          データは <code className="bg-[#f5f2ec] px-1 rounded text-xs">data/keywords.json</code> で管理しており、
          新しいキーワードを追加するとグラフに自動反映されます。
        </p>
      </div>
    </PageContainer>
  );
}
