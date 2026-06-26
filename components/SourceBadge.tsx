import { TIER_BADGE } from "@/lib/sources";
import type { SourceTier, GeographyScope } from "@/lib/sources";

interface SourceBadgeProps {
  tier: SourceTier;
  scope?: GeographyScope;
  className?: string;
  size?: "xs" | "sm";
}

export default function SourceBadge({ tier, scope, className = "", size = "xs" }: SourceBadgeProps) {
  const badge = TIER_BADGE[tier];
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${textSize} font-medium ${badge.bg} ${badge.text} ${badge.border} ${className}`}
    >
      {badge.label}
      {scope && scope !== "二戸市" && (
        <span className="opacity-70">（{scope}）</span>
      )}
    </span>
  );
}
