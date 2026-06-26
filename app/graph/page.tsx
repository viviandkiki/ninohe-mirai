import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import { buildGraphData } from "@/lib/graph-data";
import GraphViewWrapper from "@/components/GraphViewWrapper";

export const metadata: Metadata = {
  title: "論点マップ",
  description: "二戸市の政策テーマと担い手のつながりを可視化します。",
};

export default function GraphPage() {
  const graphData = buildGraphData();

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">
          TOPIC MAP
        </p>
        <SectionHeading title="論点マップ" subtitle="政策テーマと担い手のつながり" />
        <p className="text-base text-[#4b5563] leading-relaxed max-w-2xl mb-2">
          議員・行政・地域団体が「どのテーマに関与しているか」を図示しています。
          ノードをクリックするとつながりが表示されます。
        </p>
        <p className="text-sm text-[#4b5563]">
          ※ 線の太さは公開情報に基づく共同関与回数を反映しています。発言量でなく「関与するテーマ」の整理です。
        </p>
      </div>

      <div className="mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>編集部注：</strong>
            このマップは公開情報（市議会会議録・市公式サイト）をもとに編集部が整理したものです。
            「事実」（議会での発言・議案）と「編集部による要約」は区別して表示しています。
            訂正・ご意見はお問い合わせページへ。
          </p>
        </div>

        <GraphViewWrapper data={graphData} height={520} />
      </div>

      <div className="bg-white border border-[#e2ddd6] rounded-xl p-5">
        <h2 className="text-base font-bold text-[#111827] mb-2">データ出典</h2>
        <ul className="text-sm text-[#4b5563] space-y-1">
          <li>・ 二戸市議会会議録（二戸市議会事務局）</li>
          <li>
            ・ 二戸市公式ウェブサイト（
            <a
              href="https://www.city.ninohe.iwate.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2e7d8c] hover:underline"
            >
              https://www.city.ninohe.iwate.jp/
            </a>
            ）
          </li>
          <li>・ 各種公開情報をもとに編集部が整理</li>
        </ul>
      </div>
    </PageContainer>
  );
}
