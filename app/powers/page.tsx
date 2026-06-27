import type { Metadata } from "next";
import { powers, getIndicatorsForPower } from "@/lib/data";
import PageContainer from "@/components/PageContainer";
import PowerCard from "@/components/PowerCard";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "市の現状",
  description: "しごと・産業・文化・つながり・医療・暮らしの6つのテーマで、二戸市の現状を整理します。",
};

export default function PowersPage() {
  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">6 THEMES</p>
        <SectionHeading
          title="市の現状：6つのテーマ"
          subtitle="二戸の資源と課題を6つの視点から整理しています"
        />
        <p className="text-sm text-[#6b7280] leading-relaxed max-w-2xl">
          ニノヘミライでは、二戸市の現状を「しごと・雇用」「産業・経済」「文化・継承」「移住・つながり」「医療・防災」「子育て・暮らし」の6つのテーマで整理しています。
          各テーマについて、指標データ・地域の動き・読み解き文を組み合わせて見える化しています。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {powers.map((power) => {
          const indicatorCount = getIndicatorsForPower(power.id).length;
          return (
            <PowerCard key={power.id} power={power} indicatorCount={indicatorCount} />
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e1da] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1a1a2e] mb-1">カスコアとは</p>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            各力の総合評価値（0-100）。複数の定量指標と定性評価を組み合わせた編集部独自の指数です。
          </p>
        </div>
        <div className="bg-white border border-[#e5e1da] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1a1a2e] mb-1">6つのテーマの枠組みについて</p>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            二戸市総合計画や各種統計を参照しながら、ニノヘミライ編集部が独自に設定した分類です。公式の行政分類とは異なる場合があります。
          </p>
        </div>
        <div className="bg-white border border-[#e5e1da] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1a1a2e] mb-1">データについて</p>
          <p className="text-xs text-[#6b7280] leading-relaxed">
            データは公開情報を元に整理しています。最新・正確な情報は各公式サイトをご確認ください。
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
