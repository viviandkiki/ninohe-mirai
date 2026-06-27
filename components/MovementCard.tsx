import { MOVEMENT_TYPE_MAP, formatDate } from "@/lib/utils";
import type { Movement, Actor, Power } from "@/lib/schemas";
import PowerBadge from "./PowerBadge";

interface MovementCardProps {
  movement: Movement;
  relatedActors?: Actor[];
  relatedPowers?: Power[];
  sourceUrl?: string;
  sourceTitle?: string;
}

export default function MovementCard({ movement, relatedActors = [], relatedPowers = [], sourceUrl, sourceTitle }: MovementCardProps) {
  const typeInfo = MOVEMENT_TYPE_MAP[movement.type];

  const inner = (
    <div className={`h-full bg-white border border-slate-200 rounded-xl p-5 flex flex-col${sourceUrl ? " hover:border-[#2e7d8c]/50 hover:shadow-md transition-shadow" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <time className="text-xs text-slate-500">{formatDate(movement.date)}</time>
        {sourceUrl && (
          <span className="ml-auto text-xs text-[#2e7d8c] flex items-center gap-0.5">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" />
              <path d="M8 1h3v3M11 1 6 6" />
            </svg>
            ソース
          </span>
        )}
      </div>

      <h3 className="text-base font-bold text-slate-800 mb-2 leading-snug">{movement.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{movement.summary}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto">
        {relatedPowers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {relatedPowers.map((power) => (
              <PowerBadge key={power.slug} power={power} />
            ))}
          </div>
        )}

        {relatedActors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {relatedActors.map((actor) => (
              <span key={actor.id} className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                {actor.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {sourceTitle && (
        <p className="mt-3 text-xs text-[#94a3b8]">出典：{sourceTitle}</p>
      )}
    </div>
  );

  if (sourceUrl) {
    return (
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl">
        {inner}
      </a>
    );
  }

  return <div>{inner}</div>;
}
