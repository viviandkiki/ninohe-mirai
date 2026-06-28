import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPowerBySlug,
  getIndicatorsForPower,
  getMovementsForPower,
  getActorsForMovement,
  getSourceById,
} from "@/lib/data";
import { powers } from "@/lib/data";
import { getPowerScore } from "@/lib/data/index";
import { POWER_COLOR_MAP, TREND_MAP } from "@/lib/utils";
import type { PowerSlug } from "@/lib/schemas";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import StatCard from "@/components/StatCard";
import MovementCard from "@/components/MovementCard";
import SourceList from "@/components/SourceList";
import ScoreBar from "@/components/ScoreBar";
import MiniTrendChart from "@/components/MiniTrendChart";
import { Briefcase, TrendingUp, BookOpen, Users, Shield, Home, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const POWER_IMAGES: Record<string, { src: string; alt: string; credit: string }> = {
  work:    { src: "/images/haikei3.jpg",     alt: "馬淵川（二戸市）",                    credit: "馬淵川 二戸市 (CC BY-SA 3.0, Sengoku40)" },
  earn:    { src: "/images/img-sake.jpg",    alt: "徳利と猪口（日本酒・地域産業）",       credit: "徳利と猪口 Miyajima (CC BY 2.0, shankar s.)" },
  inherit: { src: "/images/img-craft.jpg",   alt: "楽焼茶碗（江戸時代・伝統工芸）",      credit: "楽焼茶碗 江戸時代 (CC BY-SA 4.0, Gryffindor)" },
  connect: { src: "/images/img-matsuri.jpg", alt: "金魚ちょうちんねぶた祭り（地域のつながり）", credit: "金魚ちょうちんねぶた (CC BY-SA 3.0, Wikimedia Commons)" },
  prepare: { src: "/images/img-mountain.jpg",alt: "宝来山（岩手の山岳景観）",            credit: "宝来山 (CC BY-SA 3.0, Junpei Satoh)" },
  live:    { src: "/images/haikei4.jpg",     alt: "稲の天日干し（農村の暮らし）",         credit: "稲の天日干し (CC BY-SA 3.0, Kropsoq)" },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase, TrendingUp, BookOpen, Users, Shield, Home,
};

export async function generateStaticParams() {
  return powers.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const power = getPowerBySlug(slug);
  if (!power) return {};
  return {
    title: power.name,
    description: power.summary,
    alternates: {
      canonical: `/powers/${slug}`,
    },
  };
}

export default async function PowerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const power = getPowerBySlug(slug);
  if (!power) notFound();

  const indicators = getIndicatorsForPower(power.id);
  const movements = getMovementsForPower(slug);
  const colors = POWER_COLOR_MAP[power.slug as PowerSlug];
  const trend = TREND_MAP[power.trend];
  const Icon = ICON_MAP[power.icon] ?? Briefcase;
  const scoreEntry = getPowerScore(power.slug);
  const displayScore = scoreEntry?.score ?? power.score;

  const relatedSourceIds = [...new Set(indicators.map((i) => i.sourceId))];
  const relatedSources = relatedSourceIds
    .map((id) => getSourceById(id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const heroImage = POWER_IMAGES[slug];

  return (
    <PageContainer>
      {/* Hero image */}
      {heroImage && (
        <div className="relative h-44 sm:h-60 rounded-xl overflow-hidden mb-6 -mx-4 sm:mx-0">
          <Image src={heroImage.src} alt={heroImage.alt} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <p className="absolute bottom-2 right-3 text-[10px] text-white/60 drop-shadow">{heroImage.credit}</p>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-[#6b7280] mb-6">
        <Link href="/" className="hover:text-[#1a1a2e]">ホーム</Link>
        <span className="mx-1.5">/</span>
        <Link href="/powers" className="hover:text-[#1a1a2e]">現状</Link>
        <span className="mx-1.5">/</span>
        <span className="text-[#1a1a2e]">{power.name}</span>
      </nav>

      {/* Hero */}
      <div className={`bg-white border border-[#e5e1da] ${colors.leftBorder} rounded-xl p-6 mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${colors.badge} shrink-0`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl font-bold ${colors.text}`}>{power.name}</h1>
              <span className={`text-sm font-medium ${trend.color}`}>{trend.icon} {trend.label}</span>
            </div>
            <p className="text-base text-[#6b7280] mb-3">{power.description}</p>

            {displayScore !== undefined && (
              <div className="max-w-xs">
                <ScoreBar score={displayScore} />
                {scoreEntry?.scoreLabel && (
                  <p className="text-[11px] text-[#6b7280] mt-1">
                    評価: <span className={`font-semibold ${colors.text}`}>{scoreEntry.scoreLabel}</span>
                    {scoreEntry.basis && <span className="ml-2">{scoreEntry.basis}</span>}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#e5e1da]">
          <p className={`text-base font-semibold ${colors.text} mb-2`}>{power.headline}</p>
          <p className="text-sm text-[#6b7280] leading-relaxed">{power.summary}</p>
        </div>
      </div>

      {/* Interpretation */}
      {power.interpretation && (
        <div className="bg-[#f7f4ef] border border-[#e5e1da] rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-[#2e7d8c] uppercase tracking-widest mb-2">編集部のまとめ</p>
          <p className="text-sm text-[#1a1a2e] leading-relaxed">{power.interpretation}</p>
        </div>
      )}

      {/* Strengths & Challenges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-700 mb-3">
            <CheckCircle2 className="w-4 h-4" /> 活かされている資源
          </h3>
          <ul className="space-y-2">
            {power.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[#1a1a2e] flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
            <AlertCircle className="w-4 h-4" /> 活かしきれていない課題
          </h3>
          <ul className="space-y-2">
            {power.challenges.map((c, i) => (
              <li key={i} className="text-sm text-[#1a1a2e] flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Indicators */}
      {indicators.length > 0 && (
        <section className="mb-10">
          <SectionHeading title="指標" subtitle="主要データの推移" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {indicators.map((ind) => (
              <StatCard key={ind.id} indicator={ind} />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indicators.slice(0, 2).map((ind) => (
              <div key={ind.id} className="bg-white border border-[#e5e1da] rounded-xl p-4">
                <p className="text-xs text-[#6b7280] mb-2">{ind.name}（{ind.unit}）の推移</p>
                <MiniTrendChart data={ind.trend} unit={ind.unit} color={colors.accent} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related movements */}
      {movements.length > 0 && (
        <section className="mb-10">
          <SectionHeading title="関連する動き" subtitle="この力に関わる議員・行政・地域の動向" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {movements.slice(0, 4).map((movement) => {
              const relatedActors = getActorsForMovement(movement);
              const relatedPowers = movement.powerSlugs
                .map((s) => getPowerBySlug(s))
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
        </section>
      )}

      {/* Sources */}
      {relatedSources.length > 0 && (
        <section className="mb-8">
          <SourceList sources={relatedSources} />
        </section>
      )}
    </PageContainer>
  );
}
