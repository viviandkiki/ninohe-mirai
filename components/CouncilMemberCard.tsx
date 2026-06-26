import type { CouncilMember } from "@/lib/schemas";

interface CouncilMemberCardProps {
  member: CouncilMember;
  factionColor: string;
}

export default function CouncilMemberCard({ member, factionColor }: CouncilMemberCardProps) {
  return (
    <div className="bg-white border border-[#e5e1da] rounded-xl p-4">
      {/* 役職バッジ */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {(member.role === "議長" || member.role === "副議長") && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1e3a5f] text-white">
            {member.role}
          </span>
        )}
        {member.isNew2023 && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            新
          </span>
        )}
      </div>

      {/* 名前 */}
      <h3 className="text-base font-bold text-[#1a1a2e] leading-tight">{member.name}</h3>
      <p className="text-xs text-[#6b7280] mb-2">（{member.nameKana}）</p>

      {/* 詳細情報 */}
      <dl className="space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-[#9ca3af] shrink-0 w-12">会派</dt>
          <dd>
            <span className={`inline-block px-1.5 py-0.5 rounded border text-xs font-medium ${factionColor}`}>
              {member.faction}
            </span>
          </dd>
        </div>
        {member.party !== "無所属" && (
          <div className="flex gap-2">
            <dt className="text-[#9ca3af] shrink-0 w-12">政党</dt>
            <dd className="text-[#4b5563]">{member.party}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-[#9ca3af] shrink-0 w-12">委員会</dt>
          <dd className="text-[#4b5563]">{member.committees.join("・")}</dd>
        </div>
        {member.councilOps && (
          <div className="flex gap-2">
            <dt className="text-[#9ca3af] shrink-0 w-12">議運</dt>
            <dd className="text-[#4b5563]">{member.councilOps}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-[#9ca3af] shrink-0 w-12">地区</dt>
          <dd className="text-[#4b5563]">{member.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-[#9ca3af] shrink-0 w-12">得票数</dt>
          <dd className="text-[#4b5563] tabular-nums font-medium">{member.votes2023.toLocaleString()}票</dd>
        </div>
      </dl>

      {member.note && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          {member.note}
        </p>
      )}
    </div>
  );
}
