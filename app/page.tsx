import {
  powers,
  getRecentMovements,
  updates,
  indicators,
  movements,
} from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Network, ExternalLink, TrendingUp } from "lucide-react";
import { buildKeywordGraphData, CATEGORY_COLORS, KEYWORD_CATEGORIES } from "@/lib/keyword-graph";
import GraphViewWrapper from "@/components/GraphViewWrapper";
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
      <section className="relative min-h-[80vh] flex items-center overflow-hidden border-b border-[#e2e8f0]">
        <Image src="/HERO.png" alt="" fill className="object-cover object-center" priority quality={85} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/88 via-[#f0f9fa]/75 to-[#e0f2f7]/80 z-[1]" />
        <ParticleLayer />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 w-full">
          {latestUpdate && (
            <div className="mb-6 hero-fade-in"><UpdateBadgeInline date={latestUpdate.date} /></div>
          )}
          <h1 className="hero-h1 text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] leading-tight tracking-tight mb-6 overflow-hidden">
            国産漆の70%は、<br />この町で生まれる。
          </h1>
          <p className="text-xl text-[#475569] leading-relaxed max-w-2xl mb-10 hero-fade-in">
            議会の記録・地域の指標・人のつながり——二戸にまつわる公開情報を、市民の言葉で整理しています。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 hero-fade-in">
            <Link href="/powers" className="inline-flex items-center justify-center gap-2 bg-[#2e7d8c] hover:bg-[#1a6477] text-white font-bold px-8 py-4 rounded-xl transition-all text-xl shadow-md">
              まちの今を見る <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/graph" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#2e7d8c] text-[#0e6b7c] hover:bg-[#e0f2f7] font-bold px-8 py-4 rounded-xl transition-all text-xl">
              <Network className="w-5 h-5" /> 言葉の地図で探索する
            </Link>
          </div>
        </div>
        <div className="deco-blob absolute top-[10%] right-[5%] w-72 h-72 hidden sm:block z-[2]" aria-hidden="true" />
        <div className="deco-blob absolute bottom-[20%] left-[3%] w-48 h-48 hidden sm:block z-[2]" aria-hidden="true" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-60">
          <div className="w-6 h-10 border-2 border-[#2e7d8c] rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-3 bg-[#2e7d8c] rounded-full" />
          </div>
        </div>
      </section>

      {/* Section 2: キーワードマップ（最大の革新要素を前面化） */}
      <section className="section-fade kw-pulse-section py-16 section-alt">
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4" data-fade-left>
            <div>
              <h2 className="text-3xl font-black text-[#0f172a]"><span className="heading-accent">二戸をひもとく言葉たち</span></h2>
              <p className="text-lg text-[#475569] mt-2">キーワードのつながりから、この町を読む</p>
            </div>
            <Link href="/graph" className="flex items-center gap-2 bg-[#2e7d8c] hover:bg-[#1a6477] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-lg shadow-md min-h-[44px]">
              <Network className="w-5 h-5" /> 全画面で探索する
            </Link>
          </div>
          <p className="text-lg text-[#475569] leading-relaxed mb-6 max-w-2xl">
            漆・九戸城・里山・南部美人——この土地を形作る言葉が、ここでつながっています。気になるキーワードをクリックして、二戸の文脈を発見してください。
          </p>
          <div className="rounded-2xl overflow-hidden border border-[#e2e8f0]">
            <div className="block md:hidden">
              <GraphViewWrapper data={graphData} height={300} filterOptions={kwFilterOptions} />
            </div>
            <div className="hidden md:block">
              <GraphViewWrapper data={graphData} height={460} filterOptions={kwFilterOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: まちの今：6つのレンズ */}
      <section className="section-fade max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-4" data-fade-left>
          <div>
            <h2 className="text-3xl font-black text-[#0f172a]"><span className="heading-accent">まちの今：6つのレンズ</span></h2>
            <p className="text-lg text-[#475569] mt-2">公開データから見た二戸の現状</p>
          </div>
          <Link href="/powers" className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors min-h-[44px]">
            すべてのテーマを見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-lg text-[#475569] leading-relaxed mb-8 max-w-2xl" data-fade data-delay="2">
          しごと・産業・文化・つながり・医療・暮らしの6つの切り口で、二戸市の現状を整理。各カードをクリックで詳細へ。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {powers.map((power, i) => {
            const colors = POWER_COLOR_MAP[power.slug as PowerSlug];
            const trend = TREND_MAP[power.trend];
            const Icon = ICON_MAP[power.icon] ?? Briefcase;
            return (
              <Link key={power.id} href={`/powers/${power.slug}`}
                data-pop data-delay={Math.min(i + 1, 6)}
                className="power-card-gsap light-card motion-card p-6 block hover:border-[#2e7d8c]/60 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.badge}`}><Icon className="w-7 h-7" /></div>
                  <span className={`text-sm font-bold ${trend.color}`}>{trend.icon} {trend.label}</span>
                </div>
                <h3 className={`text-xl font-black ${colors.text} mb-1`}>{power.name}</h3>
                <p className="text-base text-[#475569] mb-4">{power.description}</p>
                <p className="text-base font-bold text-[#0f172a] mb-4 leading-snug">{power.headline}</p>
                <div className={`flex items-center gap-1.5 text-base font-bold ${colors.text} group-hover:gap-2.5 transition-all`}>
                  現状を読む <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Section 4: 数字で見る二戸 */}
      <section className="section-fade py-16 section-alt">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between" data-fade-left>
            <div>
              <h2 className="text-3xl font-black text-[#0f172a]"><span className="heading-accent">数字で見る二戸</span></h2>
              <p className="text-lg text-[#475569] mt-2">公開統計から整理した主要指標</p>
            </div>
            <Link href="/powers" className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors min-h-[44px]">
              すべての指標を確認する <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-base text-[#475569] mt-3 max-w-2xl" data-fade data-delay="2">公開統計をもとに整理した主要指標です。左から右へ流れています（ホバーで停止）。</p>
        </div>
        <IndicatorCarousel items={kpiItems} />
        <p className="text-sm text-[#475569] max-w-5xl mx-auto px-4 mt-3">※ 最新の数値は各出典元でご確認ください。</p>
      </section>

      {/* Section 5: 議会と政策の動き */}
      <section className="section-fade py-16">
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex items-center justify-between" data-fade-left>
            <div>
              <h2 className="text-3xl font-black text-[#0f172a]"><span className="heading-accent">議会と政策の動き</span></h2>
              <p className="text-lg text-[#475569] mt-2">市議会の最新セッション</p>
            </div>
            <a href="https://www.city.ninohe.lg.jp/menu/21" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors min-h-[44px]">
              市議会公式サイトへ <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <p className="text-base text-[#475569] mt-3 max-w-2xl">二戸市議会の定例会・臨時会の開催情報です。右から左へ流れています（ホバーで停止）。</p>
        </div>
        <CouncilCarousel movements={councilMovements.length > 0 ? councilMovements : recentMovements.slice(0, 6)} />
        <div className="max-w-5xl mx-auto px-4 mt-6 text-right">
          <Link href="/movement" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-bold transition-colors">動きをすべて見る →</Link>
        </div>
      </section>

      {/* About */}
      <section className="section-fade py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="light-card p-8">
            <h2 className="text-2xl font-black text-[#0f172a] mb-4">このダッシュボードについて</h2>
            <p className="text-lg text-[#475569] leading-relaxed mb-3">
              ニノヘミライは、二戸市の公開情報を市民の目線で整理した非公式ダッシュボードです。議会の動き、地域の指標、担い手のネットワークを一つの場所で確認できます。
            </p>
            <p className="text-lg text-[#475569] leading-relaxed mb-6">
              市民・移住検討者・研究者向けに設計されています。掲載データはすべて公開情報に基づき、出典と調査年を明記しています。特定の候補者・政党の支持・批判は行いません。
            </p>
            <div className="flex flex-wrap gap-5">
              <Link href="/methodology" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-semibold transition-colors">データの根拠を確認する →</Link>
              <Link href="/about" className="text-lg text-[#0e6b7c] hover:text-[#0f172a] font-semibold transition-colors">このサイトについて →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
