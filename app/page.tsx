import {
  powers,
  getRecentMovements,
  updates,
  getActorsForMovement,
  getPowerBySlug,
  indicators,
  movements,
  actors,
} from "@/lib/data";
import PowerCard from "@/components/PowerCard";
import MovementCard from "@/components/MovementCard";
import SectionHeading from "@/components/SectionHeading";
import PageContainer from "@/components/PageContainer";
import KpiCard from "@/components/KpiCard";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, ExternalLink, Network } from "lucide-react";
import { buildGraphData } from "@/lib/graph-data";
import GraphViewWrapper from "@/components/GraphViewWrapper";

function UpdateBadgeInline({ date }: { date: string }) {
  const d = new Date(date);
  const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 更新`;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2e7d8c]/10 text-[#2e7d8c] text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d8c] animate-pulse" />
      {label}
    </span>
  );
}

export default function HomePage() {
  const recentMovements = getRecentMovements(4);
  const latestUpdate = updates[0];

  const migration = indicators.find((i) => i.id === "ind-migration-in");
  const aging = indicators.find((i) => i.id === "ind-aging-rate");
  const empRate = indicators.find((i) => i.id === "ind-employment-rate");
  const cultural = indicators.find((i) => i.id === "ind-cultural-assets");
  const volunteer = indicators.find((i) => i.id === "ind-volunteer-count");
  const satisfaction = indicators.find((i) => i.id === "ind-life-satisfaction");

  const councilMovements = movements
    .filter((m) => m.id.startsWith("mov-council-"))
    .slice(0, 4);

  const graphData = buildGraphData();

  return (
    <>
      {/* ===== Section 1: ファーストビュー ===== */}
      <section className="bg-[#f5f2ec] border-b border-[#e2ddd6]">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          {latestUpdate && (
            <div className="mb-5">
              <UpdateBadgeInline date={latestUpdate.date} />
            </div>
          )}

          <div className="flex items-center gap-2 text-[#4b5563] text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span>岩手県 二戸市 ／ 市民公共ダッシュボード</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] leading-tight tracking-tight mb-5">
            二戸市の議会・行政・地域データを
            <br />
            市民に分かりやすく。
          </h1>

          <p className="text-base text-[#4b5563] leading-relaxed max-w-xl mb-8">
            「ニノヘミライ」は、二戸市の公開情報を整理した市民ダッシュボードです。
            議会の動き、地域の指標、担い手のつながりを、ひとつの場所で確認できます。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <KpiCard
              title="総人口"
              value="25,680"
              unit="人"
              change="前年比 −0.9%"
              changeUp={false}
              sourceNote="二戸市統計書"
              updatedAt="2023年"
              accentColor="#1e3a5f"
              sourceTier="city"
              geographyScope="二戸市"
            />
            <KpiCard
              title="移住定住者数"
              value={migration?.value ?? 64}
              unit="人"
              change="前年比 +18人"
              changeUp={true}
              sourceNote="二戸市移住定住実績"
              updatedAt="2023年"
              accentColor="#2e7d8c"
              sourceTier="city"
              geographyScope="二戸市"
            />
            <KpiCard
              title="高齢化率"
              value={aging?.value ?? 37.8}
              unit="%"
              change="前年比 +1.0pt"
              changeUp={false}
              sourceNote="e-Stat 社会・人口統計体系"
              updatedAt="2023年"
              accentColor="#c9614a"
              sourceTier="estat"
              geographyScope="二戸市"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/powers"
              className="inline-flex items-center justify-center gap-2 bg-[#2e7d8c] hover:bg-[#256e7c] text-white font-medium px-6 py-3 rounded-lg transition-colors text-base"
            >
              市の状況を見る
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#e2ddd6] hover:bg-[#e2ddd6]/60 text-[#4b5563] font-medium px-6 py-3 rounded-lg transition-colors text-base"
            >
              <Network className="w-4 h-4" />
              論点マップを見る
            </Link>
          </div>
        </div>
      </section>

      <PageContainer>
        {/* ===== Section 2: 市の全体像（6テーマ） ===== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-3">
            <SectionHeading title="市の現状：6つのテーマ" subtitle="公開データから見た二戸の今" />
            <Link
              href="/powers"
              className="flex items-center gap-1 text-sm text-[#2e7d8c] hover:opacity-80 font-medium"
            >
              詳細を見る <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-base text-[#4b5563] leading-relaxed mb-6 max-w-2xl">
            しごと・産業・文化・つながり・医療・暮らしの6つの切り口で、二戸市の現状を整理しています。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {powers.map((power) => (
              <PowerCard key={power.id} power={power} />
            ))}
          </div>
        </section>

        {/* ===== Section 3: 主要指標 ===== */}
        <section className="mb-16">
          <div className="mb-3">
            <SectionHeading title="主要指標" subtitle="数値で見る二戸の現在地" />
          </div>
          <p className="text-base text-[#4b5563] leading-relaxed mb-6 max-w-2xl">
            公開統計をもとに整理した主要指標です。各数値には出典と更新年を記載しています。
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <KpiCard
              title="就業率"
              value={empRate?.value ?? 57.8}
              unit="%"
              change="前年比 −0.3pt"
              changeUp={false}
              sourceNote="e-Stat 国勢調査"
              updatedAt="2022年"
              accentColor="#c9614a"
              sourceTier="estat"
              geographyScope="二戸市"
            />
            <KpiCard
              title="市内総生産"
              value="810"
              unit="億円"
              change="前年比 +1.5%"
              changeUp={true}
              sourceNote="岩手県市町村民所得統計"
              updatedAt="2021年"
              accentColor="#d97706"
              sourceTier="estimate"
              geographyScope="二戸市"
            />
            <KpiCard
              title="文化財指定件数"
              value={cultural?.value ?? 48}
              unit="件"
              change="前年比 +1件"
              changeUp={true}
              sourceNote="二戸市教育委員会"
              updatedAt="2024年"
              accentColor="#b8872a"
              sourceTier="city"
              geographyScope="二戸市"
            />
            <KpiCard
              title="地域おこし協力隊"
              value={volunteer?.value ?? 12}
              unit="人"
              change="前年比 +2人"
              changeUp={true}
              sourceNote="二戸市公式"
              updatedAt="2024年"
              accentColor="#2e7d8c"
              sourceTier="city"
              geographyScope="二戸市"
            />
            <KpiCard
              title="市民生活満足度"
              value={satisfaction?.value ?? 68}
              unit="%"
              change="前年比 +2pt"
              changeUp={true}
              sourceNote="市民意識調査"
              updatedAt="2023年"
              accentColor="#2d7a5f"
              sourceTier="survey"
              geographyScope="二戸市"
            />
            <KpiCard
              title="観光入込客数"
              value="52"
              unit="万人"
              change="前年比 +3万人"
              changeUp={true}
              sourceNote="岩手県観光統計"
              updatedAt="2023年"
              accentColor="#2d7a5f"
              sourceTier="prefecture"
              geographyScope="二戸市"
            />
            <KpiCard
              title="防災計画策定率"
              value="100"
              unit="%"
              change="デジタル防災無線完了"
              changeUp={true}
              sourceNote="二戸市防災計画"
              updatedAt="2024年"
              accentColor="#3b6fa0"
              sourceTier="city"
              geographyScope="二戸市"
            />
            <KpiCard
              title="子育て支援満足度"
              value="74"
              unit="%"
              change="前年比 +3pt"
              changeUp={true}
              sourceNote="市民意識調査"
              updatedAt="2023年"
              accentColor="#2d7a5f"
              sourceTier="survey"
              geographyScope="二戸市"
            />
          </div>
          <p className="text-xs text-[#4b5563] mt-1">
            ※ 最新の数値は各出典元でご確認ください。このサイトの指標は定期更新中です。
          </p>
        </section>

        {/* ===== Section 4: 最近の議会 ===== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-3">
            <SectionHeading title="最近の議会" subtitle="市議会の最新セッション" />
            <a
              href="https://www.city.ninohe.lg.jp/menu/21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-[#2e7d8c] hover:opacity-80 font-medium"
            >
              議会公式サイト <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-base text-[#4b5563] leading-relaxed mb-6 max-w-2xl">
            二戸市議会の定例会・臨時会の開催情報です。詳細な会議録は市議会公式サイトで公開されています。
          </p>

          <div className="space-y-3 mb-5">
            {councilMovements.map((movement) => {
              const dateStr =
                movement.date.slice(0, 7).replace("-", "年") + "月";
              const cutoff = new Date();
              cutoff.setFullYear(cutoff.getFullYear() - 1);
              const isRecent = new Date(movement.date) >= cutoff;
              return (
                <div
                  key={movement.id}
                  className="bg-white border border-[#e2ddd6] rounded-xl p-4 flex items-start gap-4"
                >
                  <div className="shrink-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-2 ${
                        isRecent ? "bg-[#2e7d8c]" : "bg-[#d1d5db]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-[#4b5563]">
                        <Calendar className="w-3 h-3 inline mr-0.5" />
                        {dateStr}
                      </span>
                      {isRecent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2e7d8c]/10 text-[#2e7d8c] font-medium">
                          直近1年
                        </span>
                      )}
                    </div>
                    <p className="text-base font-semibold text-[#111827]">
                      {movement.title}
                    </p>
                    <p className="text-sm text-[#4b5563] mt-0.5 leading-relaxed">
                      {movement.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#f5f2ec] border border-[#e2ddd6] rounded-xl p-4">
            <p className="text-sm text-[#4b5563] mb-3 font-medium">
              最近の動き（行政・地域）
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentMovements.slice(0, 2).map((movement) => {
                const relatedActors = getActorsForMovement(movement);
                const relatedPowers = movement.powerSlugs
                  .map((slug) => getPowerBySlug(slug))
                  .filter((p): p is NonNullable<typeof p> => p !== undefined);
                return (
                  <MovementCard
                    key={movement.id}
                    movement={movement}
                    relatedActors={relatedActors}
                    relatedPowers={relatedPowers}
                  />
                );
              })}
            </div>
            <div className="mt-3 text-right">
              <Link
                href="/movement"
                className="text-sm text-[#2e7d8c] hover:underline"
              >
                すべての動きを見る →
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Section 5: 論点マップ プレビュー ===== */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-3">
            <SectionHeading title="論点マップ" subtitle="テーマと担い手のつながり" />
            <Link
              href="/graph"
              className="flex items-center gap-1 text-sm text-[#2e7d8c] hover:opacity-80 font-medium"
            >
              全画面で見る <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-base text-[#4b5563] leading-relaxed mb-4 max-w-2xl">
            議員・行政・地域団体がどの政策テーマに関わっているかを可視化しています。
            ノードをクリックするとつながりが確認できます。
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>編集部注：</strong>
              このマップは公開情報をもとに編集部が整理したものです。発言量の評価ではなく、関与テーマの整理です。
            </p>
          </div>
          <GraphViewWrapper data={graphData} height={420} />
        </section>

        {/* ===== About ===== */}
        <section className="bg-white border border-[#e2ddd6] rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-[#111827] mb-3">
            ニノヘミライとは
          </h2>
          <p className="text-base text-[#4b5563] leading-relaxed mb-4">
            二戸市の公開データをもとに、市民・移住検討者・研究者が地域の現状を理解しやすくするダッシュボードです。
            このサイトは特定の候補者・政党を支持・批判するものではありません。
            掲載情報は公開情報に基づき、編集部が独自に整理したものです。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/methodology" className="text-base text-[#2e7d8c] hover:underline">
              調査方法・データ出典 →
            </Link>
            <Link href="/about" className="text-base text-[#2e7d8c] hover:underline">
              運営について →
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
