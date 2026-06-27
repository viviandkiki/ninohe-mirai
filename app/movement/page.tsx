import type { Metadata } from "next";
import { movements, getActorsForMovement, getPowerBySlug, getSourceById } from "@/lib/data";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import MovementCard from "@/components/MovementCard";
import { MOVEMENT_TYPE_MAP } from "@/lib/utils";
import type { MovementType } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "動き",
  description: "二戸市の議員・行政・地域の動向をまとめています。",
};

const sorted = [...movements].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

function groupByMonth(items: typeof sorted) {
  const groups: Record<string, typeof sorted> = {};
  for (const item of items) {
    const key = item.date.slice(0, 7);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

const TYPES: MovementType[] = ["policy", "event", "initiative", "announcement"];

export default function MovementPage() {
  const grouped = groupByMonth(sorted);
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <PageContainer>
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">MOVEMENTS</p>
        <SectionHeading title="動き" subtitle="議員・行政・地域の動向" />
        <p className="text-sm text-[#6b7280] leading-relaxed max-w-2xl">
          二戸市に関わる政策決定・地域活動・イベント・発表をまとめています。各動きがどの「力」と関連するかも示しています。
        </p>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TYPES.map((type) => {
          const meta = MOVEMENT_TYPE_MAP[type];
          return (
            <span key={type} className={`px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}>
              {meta.label}
            </span>
          );
        })}
      </div>

      {/* Empty state */}
      {months.length === 0 && (
        <div className="py-16 text-center text-[#6b7280]">
          <p className="text-lg mb-2">動きはまだ登録されていません</p>
          <p className="text-sm">今後、議員・行政・地域の動向を順次追加していきます。</p>
        </div>
      )}

      {/* Grouped by month */}
      <div className="space-y-10">
        {months.map((month) => {
          const [year, mon] = month.split("-");
          const label = `${year}年${parseInt(mon)}月`;
          const items = grouped[month];
          return (
            <section key={month}>
              <h2 className="text-sm font-semibold text-[#6b7280] border-b border-[#e5e1da] pb-2 mb-4">
                {label}
                <span className="ml-2 text-xs font-normal text-[#6b7280]">{items.length}件</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((movement) => {
                  const relatedActors = getActorsForMovement(movement);
                  const relatedPowers = movement.powerSlugs
                    .map((slug) => getPowerBySlug(slug))
                    .filter((p): p is NonNullable<typeof p> => p !== undefined);
                  const source = movement.sourceId ? getSourceById(movement.sourceId) : undefined;
                  return (
                    <MovementCard
                      key={movement.id}
                      movement={movement}
                      relatedActors={relatedActors}
                      relatedPowers={relatedPowers}
                      sourceUrl={source?.url}
                      sourceTitle={source?.title}
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
          掲載内容は公開情報をもとに編集部が整理したものです。内容の正確性には最大限配慮していますが、最新情報は各公式サイトをご確認ください。
        </p>
      </div>
    </PageContainer>
  );
}
