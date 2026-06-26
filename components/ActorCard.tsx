import { ACTOR_TYPE_MAP } from "@/lib/utils";
import type { Actor, Power } from "@/lib/schemas";
import PowerBadge from "./PowerBadge";

interface ActorCardProps {
  actor: Actor;
  relatedPowers?: Power[];
}

export default function ActorCard({ actor, relatedPowers = [] }: ActorCardProps) {
  const typeInfo = ACTOR_TYPE_MAP[actor.type];

  return (
    <div className="bg-white border border-[#e5e1da] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-[#6b7280]">{actor.lastActive} 確認</span>
          </div>
          <h3 className="text-base font-bold text-[#1a1a2e]">{actor.name}</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">{actor.role} ／ {actor.affiliation}</p>
        </div>
      </div>

      <p className="text-sm text-[#6b7280] leading-relaxed mb-4">{actor.summary}</p>

      {relatedPowers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {relatedPowers.map((power) => (
            <PowerBadge key={power.slug} power={power} />
          ))}
        </div>
      )}
    </div>
  );
}
