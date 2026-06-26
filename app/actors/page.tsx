import type { Metadata } from "next";
import { actors, getPowersForActor } from "@/lib/data";
import { mayor, councilInfo, activeMembers, formerMembers, getMembersByFaction, FACTION_ORDER } from "@/lib/council-data";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import ActorCard from "@/components/ActorCard";
import CouncilMemberCard from "@/components/CouncilMemberCard";
import { ACTOR_TYPE_MAP } from "@/lib/utils";
import type { ActorType } from "@/lib/schemas";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "担い手",
  description: "二戸市の行政・議会・地域団体・NPOの動向を整理しています。",
};

const FACTION_COLORS: Record<string, string> = {
  "にのへ未来創生会": "bg-blue-50 text-blue-800 border-blue-200",
  "清和会": "bg-emerald-50 text-emerald-800 border-emerald-200",
  "優和会": "bg-amber-50 text-amber-800 border-amber-200",
  "日本共産党二戸市議団": "bg-red-50 text-red-800 border-red-200",
  "無会派": "bg-slate-100 text-slate-700 border-slate-200",
};

const NON_COUNCIL_TYPES: ActorType[] = ["community", "npo", "official"];

export default function ActorsPage() {
  const factionMap = getMembersByFaction(activeMembers);
  const nonOfficialActors = actors.filter((a) => a.type !== "official");
  const officialActors = actors.filter((a) => a.type === "official");
  const communityActors = actors.filter((a) => a.type === "community");
  const npoActors = actors.filter((a) => a.type === "npo");

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">ACTORS</p>
        <SectionHeading title="担い手" subtitle="行政・議会・地域団体・NPOの動向" />
        <p className="text-sm text-[#6b7280] leading-relaxed max-w-2xl mb-3">
          二戸市の資源と未来に関わる主な担い手を整理しています。
          議員情報は二戸市議会議員名簿（令和5年8月10日現在）をもとに掲載しています。
        </p>
      </div>

      {/* 市長 */}
      <section className="mb-10" aria-labelledby="section-mayor">
        <h2 id="section-mayor" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
          市長
        </h2>
        <div className="bg-white border border-[#e5e1da] rounded-xl p-5 max-w-lg">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e3a5f] text-white">市長</span>
                <span className="text-xs text-[#6b7280]">{mayor.termStart.slice(0, 7).replace("-", "年")}月〜</span>
              </div>
              <h3 className="text-xl font-bold text-[#1a1a2e]">{mayor.name}</h3>
              <p className="text-xs text-[#6b7280] mt-0.5">（{mayor.nameKana}）{mayor.party}</p>
            </div>
          </div>
          <p className="text-sm text-[#6b7280] leading-relaxed mt-3">{mayor.note}</p>
          <div className="mt-3 text-xs text-[#6b7280]">
            <span>任期: {mayor.termStart.replace(/-/g, "/")} 〜 {mayor.termEnd.replace(/-/g, "/")}</span>
            <span className="ml-4">出典: {mayor.source}</span>
          </div>
        </div>
      </section>

      {/* 議会基本情報 */}
      <section className="mb-10" aria-labelledby="section-council-info">
        <h2 id="section-council-info" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
          議会概要
        </h2>
        <div className="bg-white border border-[#e5e1da] rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-[#4b5563] mb-0.5">現在の定数</p>
              <p className="text-2xl font-bold text-[#111827]">{councilInfo.capacity}<span className="text-sm font-normal text-[#4b5563] ml-1">名</span></p>
            </div>
            <div>
              <p className="text-xs text-[#4b5563] mb-0.5">前回選挙</p>
              <p className="text-base font-semibold text-[#111827]">{councilInfo.lastElection}</p>
            </div>
            <div>
              <p className="text-xs text-[#4b5563] mb-0.5">前回投票率</p>
              <p className="text-2xl font-bold text-[#111827]">{councilInfo.lastElectionTurnout}<span className="text-sm font-normal text-[#4b5563] ml-0.5">%</span></p>
            </div>
            <div>
              <p className="text-xs text-[#4b5563] mb-0.5">次回選挙</p>
              <p className="text-base font-semibold text-[#111827]">{councilInfo.nextElection}予定</p>
            </div>
          </div>
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            ※ {councilInfo.note}
          </p>
          <a
            href={councilInfo.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#2e7d8c] hover:underline"
          >
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
            出典：{councilInfo.source}
          </a>
        </div>

        {/* 会派別サマリ */}
        <div className="flex flex-wrap gap-2 mb-2">
          {FACTION_ORDER.map((faction) => {
            const members = factionMap.get(faction);
            if (!members) return null;
            return (
              <span key={faction} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${FACTION_COLORS[faction] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {faction} {members.length}名
              </span>
            );
          })}
        </div>
      </section>

      {/* 議員一覧（現任） */}
      <section className="mb-10" aria-labelledby="section-members">
        <h2 id="section-members" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-6">
          議員一覧（現任 {activeMembers.length}名）
          <span className="ml-2 text-xs font-normal text-[#6b7280]">2023年7月当選 / 任期：2023年7月31日〜2027年7月30日</span>
        </h2>

        <div className="space-y-8">
          {FACTION_ORDER.map((faction) => {
            const members = factionMap.get(faction);
            if (!members || members.length === 0) return null;
            return (
              <div key={faction}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${FACTION_COLORS[faction] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                    {faction}
                  </span>
                  <span className="text-xs text-[#6b7280]">{members.length}名</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {members.map((member) => (
                    <CouncilMemberCard key={member.id} member={member} factionColor={FACTION_COLORS[member.faction] ?? "bg-slate-100 text-slate-700 border-slate-200"} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 辞職・前任議員 */}
      {formerMembers.length > 0 && (
        <section className="mb-10" aria-labelledby="section-former">
          <h2 id="section-former" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
            前任・辞職議員
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formerMembers.map((member) => (
              <div key={member.id} className="bg-[#f7f4ef] border border-[#e5e1da] rounded-xl p-4 opacity-80">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                    {member.faction}（辞職）
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1a1a2e]">{member.name}</h3>
                <p className="text-xs text-[#6b7280] mt-0.5">（{member.nameKana}） 得票 {member.votes2023.toLocaleString()}票</p>
                {member.note && (
                  <p className="text-xs text-[#6b7280] mt-2 leading-relaxed">{member.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 地域団体・経済 */}
      <section className="mb-10" aria-labelledby="section-community">
        <h2 id="section-community" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
          地域・経済・産業団体
          <span className="ml-2 text-xs font-normal text-[#6b7280]">（{communityActors.length}団体）</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {communityActors.map((actor) => {
            const relatedPowers = getPowersForActor(actor);
            return (
              <ActorCard key={actor.id} actor={actor} relatedPowers={relatedPowers} />
            );
          })}
        </div>
      </section>

      {/* NPO・市民活動 */}
      {npoActors.length > 0 && (
        <section className="mb-10" aria-labelledby="section-npo">
          <h2 id="section-npo" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
            NPO・市民活動
            <span className="ml-2 text-xs font-normal text-[#6b7280]">（{npoActors.length}団体）</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {npoActors.map((actor) => {
              const relatedPowers = getPowersForActor(actor);
              return (
                <ActorCard key={actor.id} actor={actor} relatedPowers={relatedPowers} />
              );
            })}
          </div>
        </section>
      )}

      {/* 行政（県等） */}
      {officialActors.filter((a) => a.id !== "actor-mayor").length > 0 && (
        <section className="mb-10" aria-labelledby="section-official">
          <h2 id="section-official" className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 mb-4">
            行政機関
            <span className="ml-2 text-xs font-normal text-[#6b7280]">（{officialActors.filter((a) => a.id !== "actor-mayor").length}機関）</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {officialActors.filter((a) => a.id !== "actor-mayor").map((actor) => {
              const relatedPowers = getPowersForActor(actor);
              return (
                <ActorCard key={actor.id} actor={actor} relatedPowers={relatedPowers} />
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-6 p-5 bg-[#f7f4ef] border border-[#e5e1da] rounded-xl">
        <p className="text-xs text-[#6b7280] leading-relaxed">
          議員情報は二戸市議会議員名簿（令和5年8月10日現在）および公開情報をもとに掲載しています。
          団体情報は公開情報に基づき編集部が整理したものです。
          ご意見・訂正依頼は、お問い合わせページよりご連絡ください。
        </p>
      </div>
    </PageContainer>
  );
}
