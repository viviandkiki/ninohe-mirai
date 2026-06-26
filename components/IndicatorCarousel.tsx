"use client";

import SourceBadge from "@/components/SourceBadge";
import type { SourceTier, GeographyScope } from "@/lib/sources";

interface KpiItem {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeUp?: boolean;
  sourceNote?: string;
  accentColor?: string;
  updatedAt?: string;
  sourceTier?: SourceTier;
  geographyScope?: GeographyScope;
}

function KpiChip({ item }: { item: KpiItem }) {
  return (
    <div
      className="flex-shrink-0 w-52 dark-card rounded-2xl p-5 neon-border carousel-card"
      style={{ borderLeftColor: item.accentColor ?? "#2e7d8c", borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="text-sm font-bold text-[#9ca3af]">{item.title}</p>
        {item.sourceTier && (
          <SourceBadge tier={item.sourceTier} scope={item.geographyScope} size="xs" />
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span
          className="text-3xl font-black tabular-nums leading-none glow-text"
          style={{ color: item.accentColor ?? "#4dd4e7" }}
        >
          {typeof item.value === "number" ? item.value.toLocaleString("ja-JP") : item.value}
        </span>
        {item.unit && (
          <span className="text-base text-[#6b7280] font-medium">{item.unit}</span>
        )}
      </div>
      {item.change && (
        <p className={`text-sm font-semibold ${item.changeUp ? "text-emerald-400" : "text-red-400"}`}>
          {item.changeUp ? "▲" : "▼"} {item.change}
        </p>
      )}
      {item.sourceNote && (
        <p className="text-xs text-[#4b5563] mt-1.5">出典: {item.sourceNote}</p>
      )}
    </div>
  );
}

export default function IndicatorCarousel({ items }: { items: KpiItem[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="carousel-wrapper py-2">
      <div className="carousel-track-left">
        {doubled.map((item, i) => (
          <KpiChip key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
