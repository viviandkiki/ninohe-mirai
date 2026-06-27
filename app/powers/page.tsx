import type { Metadata } from "next";
import { powers, getIndicatorsForPower } from "@/lib/data";
import PageContainer from "@/components/PageContainer";
import PowerCard from "@/components/PowerCard";
import Image from "next/image";

export const metadata: Metadata = {
  title: "市の現状",
  description: "しごと・産業・文化・つながり・医療・暮らしの6つのテーマで、二戸市の現状を整理します。",
  alternates: {
    canonical: "/powers",
  },
};

export default function PowersPage() {
  return (
    <PageContainer>
      {/* Hero banner */}
      <div className="relative h-36 sm:h-48 rounded-xl overflow-hidden mb-8 -mx-4 sm:mx-0">
        <Image src="/images/haikei3.jpg" alt="馬淵川 — 二戸市を流れる川" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e6b7c]/70 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">6 THEMES</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow">市の現状：6つのテーマ</h1>
          </div>
        </div>
        <p className="absolute bottom-2 right-3 text-[10px] text-white/50">馬淵川 (CC BY-SA 3.0, Sengoku40)</p>
      </div>

      <div className="mb-8">
        <p className="text-base font-semibold text-[#475569] leading-relaxed max-w-2xl mb-2">二戸の資源と課題を6つの視点から整理しています。</p>
        <p className="text-base text-[#6b7280] leading-relaxed max-w-2xl">
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
          <p className="text-xs font-semibold text-[#1a1a2e] mb-1">スコアとは</p>
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
