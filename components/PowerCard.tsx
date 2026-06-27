import Link from "next/link";
import { Briefcase, TrendingUp, BookOpen, Users, Shield, Home, ArrowRight } from "lucide-react";
import { POWER_COLOR_MAP, TREND_MAP } from "@/lib/utils";
import ScoreBar from "./ScoreBar";
import type { Power } from "@/lib/schemas";
import type { PowerSlug } from "@/lib/schemas";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  TrendingUp,
  BookOpen,
  Users,
  Shield,
  Home,
};

interface PowerCardProps {
  power: Power;
  indicatorCount?: number;
}

export default function PowerCard({ power, indicatorCount }: PowerCardProps) {
  const colors = POWER_COLOR_MAP[power.slug as PowerSlug];
  const trend = TREND_MAP[power.trend];
  const Icon = ICON_MAP[power.icon] ?? Briefcase;

  return (
    <Link
      href={`/powers/${power.slug}`}
      className={`group block bg-white rounded-xl border border-[#e5e1da] ${colors.leftBorder} p-5 hover:shadow-lg transition-all hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors.badge}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-medium ${trend.color}`}>
          {trend.icon} {trend.label}
        </span>
      </div>

      <h3 className={`text-base font-bold ${colors.text} mb-0.5`}>{power.name}</h3>
      <p className="text-sm text-[#475569] mb-3">{power.description}</p>

      {power.score !== undefined && (
        <ScoreBar score={power.score} className="mb-3" />
      )}

      <p className={`text-sm font-semibold ${colors.text} mb-2`}>{power.headline}</p>

      <p className="text-sm text-[#475569] leading-relaxed line-clamp-3 mb-4">{power.summary}</p>

      {indicatorCount !== undefined && (
        <p className="text-xs text-[#6b7280] mb-2">指標 {indicatorCount}件</p>
      )}

      <div className={`flex items-center gap-1 text-sm font-semibold ${colors.text} group-hover:gap-2 transition-all`}>
        詳細を見る <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
