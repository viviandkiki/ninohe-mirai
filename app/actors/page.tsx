import type { Metadata } from "next";
import { actors, getPowersForActor } from "@/lib/data";
import { councilInfo } from "@/lib/council";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import ActorCard from "@/components/ActorCard";
import { ACTOR_TYPE_MAP } from "@/lib/utils";
import type { ActorType } from "@/lib/schemas";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "担い手",
  description: "二戸市の行政・議会・地域団体・NPOの動向を整理しています。",
};

const TYPE_ORDER: ActorType[] = ["official", "council", "community", "npo"];

export default function ActorsPage() {
  const grouped = TYPE_ORDER.map((type) => ({
    type,
    info: ACTOR_TYPE_MAP[type],
    actors: actors.filter((a) => a.type === type),
  }));

  const totalCount = actors.length;

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">ACTORS</p>
        <SectionHeading title="担い手" subtitle="行政・議会・地域団体・NPOの動向" />
        <p className="text-sm text-[#6b7280] leading-relaxed max-w-2xl mb-3">
          二戸市の資源と未来に関わる主な担い手を整理しています。
          各担い手がどの「力」に関わる活動をしているかを示します。
          氏名は公開情報に基づき掲載しています。
        </p>
        <p className="text-xs text-[#6b7280]">掲載 {totalCount} 名・団体</p>
      </div>

      {/* 議会基本情報 */}
      <div className="bg-white border border-[#e2ddd6] rounded-xl p-5 mb-8">
        <p className="text-xs font-semibold text-[#2e7d8c] uppercase tracking-widest mb-3">COUNCIL INFO</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-[#4b5563] mb-0.5">現在の定数</p>
            <p className="text-2xl font-bold text-[#111827]">{councilInfo.capacity}<span className="text-sm font-normal text-[#4b5563] ml-1">人</span></p>
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
            <p className="text-base font-semibold text-[#111827]">{councilInfo.nextElection}</p>
          </div>
        </div>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          ※ {councilInfo.nextElection}の選挙より定数が{councilInfo.capacity}人から<strong>{councilInfo.nextCapacity}人</strong>に削減予定です。
        </p>
        <a
          href={councilInfo.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#2e7d8c] hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          出典：{councilInfo.source}
        </a>
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TYPE_ORDER.map((type) => {
          const info = ACTOR_TYPE_MAP[type];
          const count = actors.filter((a) => a.type === type).length;
          return (
            <span key={type} className={`px-2.5 py-1 rounded-full text-xs font-medium ${info.color}`}>
              {info.label} {count}名
            </span>
          );
        })}
      </div>

      {totalCount === 0 && (
        <div className="py-16 text-center text-[#6b7280]">
          <p className="text-lg mb-2">担い手情報はまだ登録されていません</p>
          <p className="text-sm">今後、行政・議会・地域団体の情報を順次追加していきます。</p>
        </div>
      )}

      <div className="space-y-10">
        {grouped.map(({ type, info, actors: groupActors }) => {
          if (groupActors.length === 0) return null;
          return (
            <section key={type}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-bold text-[#1a1a2e] border-b border-[#e5e1da] pb-2 w-full">
                  {info.label}
                  <span className="ml-2 text-xs font-normal text-[#6b7280]">（{groupActors.length}名・団体）</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groupActors.map((actor) => {
                  const relatedPowers = getPowersForActor(actor);
                  return (
                    <ActorCard
                      key={actor.id}
                      actor={actor}
                      relatedPowers={relatedPowers}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-10 p-5 bg-[#f7f4ef] border border-[#e5e1da] rounded-xl">
        <p className="text-xs text-[#6b7280] leading-relaxed">
          掲載情報は公開情報をもとに編集部が整理したものです。
          個人情報の取り扱いに関するご意見・訂正依頼は、お問い合わせページよりご連絡ください。
        </p>
      </div>
    </PageContainer>
  );
}
