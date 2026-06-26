import { TREND_MAP } from "@/lib/utils";
import type { Indicator } from "@/lib/schemas";

interface StatCardProps {
  indicator: Indicator;
  showTrend?: boolean;
}

export default function StatCard({ indicator, showTrend = true }: StatCardProps) {
  const trendDirection =
    indicator.trend.length >= 2
      ? indicator.trend[indicator.trend.length - 1].value > indicator.trend[0].value
        ? "up"
        : indicator.trend[indicator.trend.length - 1].value < indicator.trend[0].value
        ? "down"
        : "stable"
      : "stable";

  const trend = TREND_MAP[trendDirection];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-500 leading-tight">{indicator.name}</span>
        {showTrend && (
          <span className={`text-xs font-medium ${trend.color} whitespace-nowrap ml-2`}>
            {trend.icon} {trend.label}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-slate-800 tabular-nums">
          {indicator.value.toLocaleString("ja-JP")}
        </span>
        <span className="text-sm text-slate-500">{indicator.unit}</span>
      </div>

      <p className="text-xs text-slate-400">{indicator.year}年</p>

      {indicator.notes && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-2">
          {indicator.notes}
        </p>
      )}
    </div>
  );
}
