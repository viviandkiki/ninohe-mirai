"use client";

import { Calendar } from "lucide-react";
import type { Movement } from "@/lib/schemas";

function CouncilChip({ movement }: { movement: Movement }) {
  const dateStr = movement.date.slice(0, 7).replace("-", "年") + "月";
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const isRecent = new Date(movement.date) >= cutoff;

  return (
    <div className="flex-shrink-0 w-80 dark-card rounded-2xl p-5 neon-border carousel-card">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="flex items-center gap-1 text-sm text-[#6b7280]">
          <Calendar className="w-3.5 h-3.5" />
          {dateStr}
        </span>
        {isRecent && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#2e7d8c]/20 text-[#4dd4e7] font-semibold border border-[#2e7d8c]/30">
            直近1年
          </span>
        )}
      </div>
      <p className="text-base font-bold text-white leading-snug mb-2 line-clamp-2">
        {movement.title}
      </p>
      <p className="text-sm text-[#9ca3af] leading-relaxed line-clamp-2">
        {movement.summary}
      </p>
    </div>
  );
}

export default function CouncilCarousel({ movements }: { movements: Movement[] }) {
  const doubled = [...movements, ...movements];

  return (
    <div className="carousel-wrapper py-2">
      <div className="carousel-track-right">
        {doubled.map((m, i) => (
          <CouncilChip key={i} movement={m} />
        ))}
      </div>
    </div>
  );
}
