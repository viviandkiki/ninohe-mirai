import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import UpdateBadge from "./UpdateBadge";
import RadarChartOverview from "./RadarChartOverview";
import type { UpdateLog } from "@/lib/schemas";

interface HeroStat {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
}

interface HeroSectionProps {
  latestUpdate?: UpdateLog;
  stats?: HeroStat[];
  radarData?: { subject: string; score: number; fullMark: number }[];
}

export default function HeroSection({ latestUpdate, stats, radarData }: HeroSectionProps) {
  const defaultStats: HeroStat[] = [
    { label: "総人口", value: "25,680人", change: "0.9%減", up: false },
    { label: "就業者数", value: "11,240人", change: "1.2%減", up: false },
    { label: "移住定住者", value: "64人", change: "前年比+18人", up: true },
    { label: "市民満足度", value: "68%", change: "2pt上昇", up: true },
  ];

  const displayStats = stats ?? defaultStats;

  return (
    <section className="bg-[#f7f4ef] border-b border-[#e5e1da]">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        {latestUpdate && (
          <div className="mb-5">
            <UpdateBadge update={latestUpdate} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: copy + stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>岩手県 二戸市 ／ PUBLIC DASHBOARD</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] leading-tight tracking-tight mb-4">
              人口だけでは見えない、
              <br />
              二戸の底力を
              <br />
              可視化する。
            </h1>

            <p className="text-sm text-[#6b7280] leading-relaxed max-w-lg mb-6">
              「ニノヘミライ」は、二戸市のさまざまな資源を6つの力に整理し、見える資本と見えない資本の両方から地域の現在地と可能性を市民に届いていく公共ダッシュボードです。
            </p>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
              {displayStats.map((stat, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#e5e1da] p-3">
                  <p className="text-[11px] text-[#6b7280] mb-0.5">{stat.label}</p>
                  <p className="text-base font-bold text-[#1a1a2e] leading-tight">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-[11px] font-medium ${stat.up ? "text-emerald-600" : "text-[#c9614a]"}`}>
                      {stat.up ? "▲" : "▼"} {stat.change}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/powers"
                className="inline-flex items-center justify-center gap-2 bg-[#2e7d8c] hover:bg-[#256e7c] text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                6つの力を見る
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-[#e5e1da] hover:bg-[#e5e1da]/60 text-[#6b7280] font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                データを探る
              </Link>
            </div>
          </div>

          {/* Right: radar chart */}
          {radarData && radarData.length > 0 && (
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-xl border border-[#e5e1da] p-4">
                <p className="text-xs font-medium text-[#1a1a2e] mb-1">二戸の6つの力</p>
                <p className="text-[11px] text-[#6b7280] mb-3">2026年度 総合スコア</p>
                <RadarChartOverview data={radarData} />
                <p className="text-[10px] text-[#6b7280] text-center mt-1">
                  表内は0-100点。詳細は各セクションへ。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wave divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-10 fill-[#e5e1da]/40">
          <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
