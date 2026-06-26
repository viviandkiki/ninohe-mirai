import { getScoreColor } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ScoreBar({ score, label, showLabel = true, className = "" }: ScoreBarProps) {
  const colors = getScoreColor(score);
  const displayLabel = label ?? (score >= 75 ? "A-" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 55 ? "C+" : "C");

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[#6b7280]">カスコア</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.bar} text-white leading-none`}>
              {displayLabel}
            </span>
            <span className={`text-xs font-semibold ${colors.text}`}>
              {score} <span className="text-[#6b7280] font-normal">/ 100</span>
            </span>
          </div>
        </div>
      )}
      <div className="h-1.5 bg-[#e5e1da] rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`カスコア ${score} / 100 (${displayLabel})`}
        />
      </div>
    </div>
  );
}
