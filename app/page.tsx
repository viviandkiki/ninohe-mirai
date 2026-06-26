import {
  powers,
  getRecentMovements,
  updates,
  indicators,
  movements,
} from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Network, Calendar, ExternalLink, TrendingUp } from "lucide-react";
import { buildKeywordGraphData, CATEGORY_COLORS, KEYWORD_CATEGORIES } from "@/lib/keyword-graph";
import GraphViewWrapper from "@/components/GraphViewWrapper";
import AnimatedCounter from "@/components/AnimatedCounter";
import HeroGsapAnimator from "@/components/HeroGsapAnimator";
import GSAPSetup from "@/components/GSAPSetup";
import IndicatorCarousel from "@/components/IndicatorCarousel";
import CouncilCarousel from "@/components/CouncilCarousel";
import { POWER_COLOR_MAP, TREND_MAP } from "@/lib/utils";
import type { PowerSlug } from "@/lib/schemas";
import { Briefcase, BookOpen, Users, Shield, Home } from "lucide-react";
import React from "react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase, TrendingUp, BookOpen, Users, Shield, Home,
};

function UpdateBadgeInline({ date }: { date: string }) {
  const d = new Date(date);
  const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 更新`;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e0f2f7] text-[#0e6b7c] text-sm font-semibold border border-[#2e7d8c]/40">
      <span className="w-2 h-2 rounded-full bg-[#2e7d8c] animate-pulse" />
      {label}
    </span>
  );
}

function ParticleLayer() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${(i * 1.3) % 8}s`,
    duration: `${6 + (i * 0.7) % 8}s`,
    size: 2 + (i % 3),
    opacity: 0.3 + (i % 5) * 0.12,
  }));
  return (
    <div className="hero-particle-overlay" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            left: p.left,
            bottom: "0",
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const recentMovements = getRecentMovements(4);
  const latestUpdate = updates[0];
  const migration = indicators.find((i) => i.id === "ind-migration-in");
  const aging = indicators.find((i) => i.id === "ind-aging-rate");

  const councilMovements = movements
    .filter((m) => m.id.startsWith("mov-council-"))
    .slice(0, 8);

  const graphData = buildKeywordGraphData();
  const kwFilterOptions = [
    { key: "all", label: "すべて" },
    ...KEYWORD_CATEGORIES.map(cat => ({ key: cat, label: cat, color: CATEGORY_COLORS[cat] })),
  ];

  const kpiItems = [
    { title: "総人口", value: 23837, unit: "人", change: "2023年比 −1,843人", changeUp: false as const, sourceNote: "岩手県オープンデータ", accentColor: "#4dd4e7", sourceTier: "prefecture" as const, geographyScope: "二戸市" as const },
    { title: "移住定住者数", value: migration?.value ?? 64, unit: "人", change: "前年比 +18人", changeUp: true as const, sourceNote: "二戸市移住定住実績", accentColor: "#52d68a", sourceTier: "city" as const, geographyScope: "二戸市" as const },
    { title: "高齢化率", value: aging?.value ?? 40.4, unit: "%", change: "2023年比 +2.6pt", changeUp: false as const, sourceNote: "岩手県オープンデータ", accentColor: "#f97316", sourceTier: "prefecture" as const, geographyScope: "二戸市" as const },
    { title: "就業率", value: 57.8, unit: "%", change: "前年比 −0.3pt", changeUp: false as const, sourceNote: "e-Stat 国勢調査", accentColor: "#c9614a", sourceTier: "estat" as const, geographyScope: "二戸市" as const },
    { title: "市内総生産", value: "810", unit: "億円", change: "前年比 +1.5%", changeUp: true as const, sourceNote: "岩手県市町村民所得統計", accentColor: "#d97706", sourceTier: "estimate" as const, geographyScope: "二戸市" as const },
    { title: "文化財指定件数", value: 48, unit: "件", change: "前年比 +1件", changeUp: true as const, sourceNote: "二戸市教育委員会", accentColor: "#b8872a", sourceTier: "city" as const, geographyScope: "二戸市" as const },
    { title: "地域おこし協力隊", value: 12, unit: "人", change: "前年比 +2人", changeUp: true as const, sourceNote: "二戸市公式", accentColor: "#2e7d8c", sourceTier: "city" as const, geographyScope: "二戸市" as const },
    { title: "市民生活満足度", value: 68, unit: "%", change: "前年比 +2pt", changeUp: true as const, sourceNote: "市民意識調査", accentColor: "#2d7a5f", sourceTier: "survey" as const, geographyScope: "二戸市" as const },
    { title: "観光入込客数", value: "52", unit: "万人", change: "前年比 +3万人", changeUp: true as const, sourceNote: "岩手県観光統計", accentColor: "#2d7a5f", sourceTier: "prefecture" as const, geographyScope: "二戸市" as const },
    { title: "子育て支援満足度", value: 74, unit: "%", change: "前年比 +3pt", changeUp: true as const, sourceNote: "市民意識調査", accentColor: "#6b7280", sourceTier: "survey" as const, geographyScope: "二戸市" as const },
  ];

  return (
    <>
      <HeroGsapAnimator />
      <GSAPSetup />

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden border-b border-[#e2e8f0]">
        <Image src="/HERO.png" alt="" fill className="object-cover object-center" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/88 via-[#f0f9fa]/75 to-[#e0f2f7]/80 z-[1]" />
        <ParticleLayer />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 w-full">
          {latestUpdate && (
            <div className="mb-6 hero-fade-in"><UpdateBadgeInline date={latestUpdate.date} /></div>
          )}
          <h1 className="hero-h1 text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] leading-tight tracking-tight mb-6 overflow-hidden">
            二戸市の議会・行政・地域データを<br />市民に分かりやすく。
          </h1>
          <p className="text-xl text-[#475569] leading-relaxed max-w-2xl mb-10 hero-fade-in">
            「ニノヘミライ」は、二戸市の公開情報を整理した市民ダッシュボードです。
            議会の動き、地域の指標、担い手のつながりを、ひとつの場所で確認できます。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 hero-fade-in">
            <div className="light-card p-6 kpi-hover">
              <p className="text-sm font-bold text-[#475569] mb-2 uppercase tracking-widest">総人口</p>
              <p className="text-5xl font-black text-[#0e6b7c] tabular-nums leading-none mb-1">
                <AnimatedCounter target={23837} duration={1400} />
                <span className="text-2xl font-medium ml-2 text-[#475569]">人</span>
              </p>
              <p className="text-base text-red-700 font-semibold">2023年比 −1,843人</p>
            </div>
            <div className="light-card p-6 kpi-hover">
              <p className="text-sm font-bold text-[#475569] mb-2 uppercase tracking-widest">移住定住者数</p>
              <p className="text-5xl font-black text-emerald-700 tabular-nums leading-none mb-1">
                <AnimatedCounter target={migration?.value ?? 64} duration={1000} />
                <span className="text-2xl font-medium ml-2 text-[#475569]">人</span>
              </p>
              <p className="text-base text-emerald-700 font-semibold">前年比 +18人</p>
            </div>
            <div className="light-card p-6 kpi-hover">
              <p className="text-sm font-bold text-[#475569] mb-2 uppercase tracking-widest">高齢化率</p>
              <p className="text-5xl font-black text-orange-700 tabular-nums leading-none mb-1">
                <AnimatedCounter target={aging?.value ?? 40.4} duration={1200} decimals={1} />
                <span className="text-2xl font-medium ml-2 text-[#475569]">%</span>
              </p>
              <p className="text-base text-orange-700 font-semibold">2023年比 +2.6pt</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 hero-fade-in">
            <Link href="/powers" className="inline-flex items-center justify-center gap-2 bg-[#2e7d8c] hover:bg-[#1a6477] text-white font-bold px-8 py-4 rounded-xl transition-all text-xl shadow-md">
              市の状況を見る <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/graph" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#2e7d8c] text-[#0e6b7c] hover:bg-[#e0f2f7] font-bold px-8 py-4 rounded-xl transition-all text-xl">
              <Network className="w-5 h-5" /> キーワードマップ（全画面）
            </Link>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-60">
          <div className="w-6 h-10 border-2 border-[#2e7d8c] rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-[#2e7d8c] rounded-full" />
          </div>
        </div>
      </section>

      {/* HAIKEI1 */}
      <div className="relative h-44 overflow-hidden">
        <Image src="/HAIKEI1.png" alt="" fill className="object-cover object-top opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-transparent to-[#f8fafc]" />
      </div>

      {/* Section 2: 6テーマ */}
      <section className="section-fade max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-[#0e6b7c] uppercase tracking-widest mb-1">6 THEMES</p>
            <h2 className="text-3xl font-black text-[#0f172a]">市の現状：6つのテーマ</h2>
            <p className="text-lg text-[#475569] mt-1">公開データから見た二戸の今</p>
          </div>
          <Link href="/powers" className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">
            詳細を見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-2xl">
          しごと・産業・文化・つながり・医療・暮らしの6つの切り口で、二戸市の現状を整理。各カードをクリックで詳細へ。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {powers.map((power) => {
            const colors = POWER_COLOR_MAP[power.slug as PowerSlug];
            const trend = TREND_MAP[power.trend];
            const Icon = ICON_MAP[power.icon] ?? Briefcase;
            return (
              <Link key={power.id} href={`/powers/${power.slug}`}
                className="power-card-gsap light-card p-6 block hover:border-[#2e7d8c]/60 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.badge}`}><Icon className="w-7 h-7" /></div>
                  <span className={`text-sm font-bold ${trend.color}`}>{trend.icon} {trend.label}</span>
                </div>
                <h3 className={`text-xl font-black ${colors.text} mb-1`}>{power.name}</h3>
                <p className="text-sm text-[#475569] mb-3">{power.description}</p>
                {power.score !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-[#475569] mb-1">
                      <span>総合スコア</span><span className="font-bold text-[#0f172a]">{power.score}/100</span>
                    </div>
                    <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#2e7d8c]" style={{ width: `${power.score}%` }} />
                    </div>
                  </div>
                )}
                <p className="text-base font-bold text-[#0f172a] mb-2 leading-snug">{power.headline}</p>
                <p className="text-base text-[#475569] leading-relaxed line-clamp-3 mb-4">{power.summary}</p>
                <div className={`flex items-center gap-1.5 text-base font-bold ${colors.text} group-hover:gap-2.5 transition-all`}>
                  詳細を見る <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HAIKEI2 */}
      <div className="relative h-44 overflow-hidden">
        <Image src="/HAIKEI2.png" alt="" fill className="object-cover object-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] via-transparent to-[#f8fafc]" />
      </div>

      {/* Section 3: 主要指標カルーセル（左→右） */}
      <section className="section-fade py-16 section-alt">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0e6b7c] uppercase tracking-widest mb-1">KEY INDICATORS</p>
              <h2 className="text-3xl font-black text-[#0f172a]">主要指標</h2>
              <p className="text-lg text-[#475569] mt-1">数値で見る二戸の現在地</p>
            </div>
            <Link href="/powers" className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">
              全指標を見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-base text-[#475569] mt-3 max-w-2xl">公開統計をもとに整理した主要指標です。左から右へ流れています（ホバーで停止）。</p>
        </div>
        <IndicatorCarousel items={kpiItems} />
        <p className="text-sm text-[#475569] max-w-5xl mx-auto px-4 mt-3">※ 最新の数値は各出典元でご確認ください。</p>
      </section>

      {/* Section 4: 最近の議会（右→左カルーセル） */}
      <section className="section-fade py-16">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0e6b7c] uppercase tracking-widest mb-1">COUNCIL</p>
              <h2 className="text-3xl font-black text-[#0f172a]">最近の議会</h2>
              <p className="text-lg text-[#475569] mt-1">市議会の最新セッション</p>
            </div>
            <a href="https://www.city.ninohe.lg.jp/menu/21" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">
              議会公式 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-base text-[#475569] mt-3 max-w-2xl">二戸市議会の定例会・臨時会の開催情報です。右から左へ流れています（ホバーで停止）。</p>
        </div>
        <CouncilCarousel movements={councilMovements.length > 0 ? councilMovements : recentMovements.slice(0, 6)} />
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentMovements.slice(0, 2).map((movement) => {
              const dateStr = movement.date.slice(0, 7).replace("-", "年") + "月";
              return (
                <div key={movement.id} className="light-card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#2e7d8c]" />
                    <span className="text-sm text-[#475569]">{dateStr}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#e0f2f7] text-[#0e6b7c] border border-[#2e7d8c]/30">最新</span>
                  </div>
                  <p className="text-lg font-bold text-[#0f172a] leading-snug mb-1">{movement.title}</p>
                  <p className="text-base text-[#475569] leading-relaxed line-clamp-2">{movement.summary}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-right">
            <Link href="/movement" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">すべての動きを見る →</Link>
          </div>
        </div>
      </section>

      {/* Section 5: キーワードマップ */}
      <section className="section-fade kw-pulse-section py-16 section-alt">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-[#0e6b7c] uppercase tracking-widest mb-1">KEYWORD MAP</p>
              <h2 className="text-3xl font-black text-[#0f172a]">キーワードマップ</h2>
              <p className="text-lg text-[#475569] mt-1">二戸をひもとく言葉のネットワーク</p>
            </div>
            <Link href="/graph" className="flex items-center gap-2 bg-[#2e7d8c] hover:bg-[#1a6477] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-lg shadow-md">
              <Network className="w-5 h-5" /> 全画面で開く
            </Link>
          </div>
          <p className="text-lg text-[#475569] leading-relaxed mb-6 max-w-2xl">
            漆・九戸城・里山・南部美人など、二戸にまつわるキーワードが力学的に配置されます。ノードをクリックすると説明とつながりが表示されます。
          </p>
          <div className="rounded-2xl overflow-hidden border border-[#e2e8f0]">
            <GraphViewWrapper data={graphData} height={500} filterOptions={kwFilterOptions} />
          </div>
          <div className="mt-5 text-center">
            <Link href="/graph" className="inline-flex items-center gap-2 text-xl text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">
              <Network className="w-5 h-5" /> 全画面キーワードマップで詳しく見る →
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section-fade py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="light-card p-8">
            <h2 className="text-2xl font-black text-[#0f172a] mb-4">ニノヘミライとは</h2>
            <p className="text-lg text-[#475569] leading-relaxed mb-6">
              二戸市の公開データをもとに、市民・移住検討者・研究者が地域の現状を理解しやすくするダッシュボードです。
              このサイトは特定の候補者・政党を支持・批判するものではありません。
              掲載情報は公開情報に基づき、編集部が独自に整理したものです。
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/methodology" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-semibold transition-colors">調査方法・データ出典 →</Link>
              <Link href="/about" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-semibold transition-colors">運営について →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
