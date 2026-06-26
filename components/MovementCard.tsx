import { MOVEMENT_TYPE_MAP, formatDate } from "@/lib/utils";
import type { Movement, Actor, Power } from "@/lib/schemas";
import PowerBadge from "./PowerBadge";

interface MovementCardProps {
  movement: Movement;
  relatedActors?: Actor[];
  relatedPowers?: Power[];
}

export default function MovementCard({ movement, relatedActors = [], relatedPowers = [] }: MovementCardProps) {
  const typeInfo = MOVEMENT_TYPE_MAP[movement.type];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <time className="text-xs text-slate-400">{formatDate(movement.date)}</time>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{movement.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{movement.summary}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
    </div>
  );
}
