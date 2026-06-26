interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeUp?: boolean;
  sourceNote?: string;
  sourceUrl?: string;
  accentColor?: string;
  updatedAt?: string;
  context?: string;
}

export default function KpiCard({
  title,
  value,
  unit = "",
  change,
  changeUp,
  sourceNote,
  sourceUrl,
  accentColor = "#2e7d8c",
  updatedAt,
  context,
}: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 border border-[var(--color-border)] border-l-4"
      style={{ borderLeftColor: accentColor }}
    >
      <p className="text-xs text-[var(--color-text-muted)] mb-1 leading-tight font-medium">
        {title}
      </p>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-[var(--color-text)] tabular-nums leading-none">
          {typeof value === "number" ? value.toLocaleString("ja-JP") : value}
        </span>
        {unit && <span className="text-sm text-[var(--color-text-muted)]">{unit}</span>}
      </div>
      {change && (
        <p
          className={`text-xs font-medium ${
            changeUp ? "text-emerald-600" : "text-[var(--color-coral)]"
          }`}
        >
          {changeUp ? "▲" : "▼"} {change}
        </p>
      )}
      {context && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-snug">
          {context}
        </p>
      )}
      {sourceNote && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 leading-snug">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              出典: {sourceNote}
            </a>
          ) : (
            <>出典: {sourceNote}</>
          )}
          {updatedAt && <span className="ml-1 opacity-70">({updatedAt})</span>}
        </p>
      )}
    </div>
  );
}
