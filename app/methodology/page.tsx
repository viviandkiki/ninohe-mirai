import type { Metadata } from "next";
import { sources, updates } from "@/lib/data";
import PageContainer from "@/components/PageContainer";
import SectionHeading from "@/components/SectionHeading";
import SourceList from "@/components/SourceList";
import UpdateBadge from "@/components/UpdateBadge";
import indicatorRegistryRaw from "@/data/manual/indicator_registry.json";

const INDICATOR_REGISTRY = indicatorRegistryRaw as Array<{
  id: string;
  name: string;
  category: string;
  sourceUrl: string;
  updateCadence: string;
  status: string;
}>;

export const metadata: Metadata = {
  title: "調査方法",
  description: "ニノヘミライのデータ収集・整理方法と出典一覧を公開します。",
};

const DATA_SOURCES = [
  { name: "岩手県オープンデータカタログ（二戸市）", url: "https://iwate.dataeye.jp/datasets?organization_id=13", type: "市", items: ["人口", "施設・インフラ", "AED設置場所", "子育て施設"] },
  { name: "e-Stat（政府統計の総合窓口）", url: "https://www.e-stat.go.jp/", type: "国", items: ["国勢調査", "経済センサス", "住民基本台帳"] },
  { name: "二戸市公式サイト", url: "https://www.city.ninohe.lg.jp/menu/25", type: "市", items: ["人口ビジョン・総合戦略", "決算概要", "財務諸表", "計画審議"] },
  { name: "二戸市議会", url: "https://www.city.ninohe.lg.jp/info/2148", type: "市", items: ["議会審議情報", "議会だより", "会議録"] },
  { name: "岩手県公式統計", url: "https://www.pref.iwate.jp/", type: "県", items: ["観光統計", "農業統計", "医師統計"] },
];

const PROCESSING_STEPS = [
  { label: "収集", desc: "公官庁・自治体が公開しているCSV・PDF・Webページから原データを収集" },
  { label: "変換", desc: "JSON形式に標準化。年度・単位・地域コードを統一" },
  { label: "検証", desc: "Zodスキーマで型チェック・値域チェックを実施" },
  { label: "掲載", desc: "編集部レビューを経て本サイトに掲載" },
];

export default function MethodologyPage() {
  return (
    <PageContainer narrow>
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#2e7d8c] uppercase tracking-widest mb-1">METHODOLOGY</p>
        <SectionHeading title="調査方法" subtitle="データの収集・整理プロセスと出典" />
      </div>

      {/* Basic policy */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-3">基本方針</h2>
        <div className="space-y-3 text-sm text-[#6b7280] leading-relaxed">
          <p>
            ニノヘミライは、二戸市・岩手県・国の公開データを一次情報として使用します。
            データ加工を行う場合は、その手法と根拠を明示します。
          </p>
          <p>
            「6つの力」という枠組みは、本サイト独自の整理です。
            行政の公式分類とは異なる場合があります。
          </p>
          <p>
            カスコア（Kascore）は、複数の定量指標と定性評価を組み合わせた編集部独自の指数です。
            各力の状態を0-100のスコアと評価ラベル（A〜D）で表します。
          </p>
        </div>
      </section>

      {/* Data pipeline */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-4">データパイプライン</h2>
        <div className="flex items-start gap-0">
          {PROCESSING_STEPS.map((step, i) => (
            <div key={i} className="flex-1 relative">
              <div className="bg-white border border-[#e5e1da] rounded-xl p-3 mr-1">
                <p className="text-[11px] font-semibold text-[#2e7d8c] mb-0.5">{step.label}</p>
                <p className="text-[11px] text-[#6b7280] leading-snug">{step.desc}</p>
              </div>
              {i < PROCESSING_STEPS.length - 1 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 text-center text-[#e5e1da] text-xs">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Data source table */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-4">データ出典一覧</h2>
        <div className="bg-white border border-[#e5e1da] rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#f7f4ef] border-b border-[#e5e1da]">
                <th className="text-left px-4 py-2.5 text-[#6b7280] font-medium">出典名</th>
                <th className="text-left px-4 py-2.5 text-[#6b7280] font-medium">区分</th>
                <th className="text-left px-4 py-2.5 text-[#6b7280] font-medium hidden sm:table-cell">使用データ</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((src, i) => (
                <tr key={i} className="border-b border-[#e5e1da] last:border-0">
                  <td className="px-4 py-3">
                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                      className="text-[#2e7d8c] hover:underline font-medium">
                      {src.name}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      src.type === "国" ? "bg-blue-50 text-blue-600" :
                      src.type === "県" ? "bg-emerald-50 text-emerald-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>{src.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[#6b7280] hidden sm:table-cell">
                    {src.items.join("、")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Indicator implementation ledger */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-4">指標実装台帳</h2>
        <p className="text-xs text-[#6b7280] mb-3 leading-relaxed">
          以下の指標を定点観測対象として管理しています。
          状態が <span className="bg-amber-50 text-amber-600 px-1 rounded text-[10px] font-medium">manual</span> のものは編集部が手動で確認・更新します。
          <span className="bg-slate-100 text-[#6b7280] px-1 rounded text-[10px] font-medium ml-1">planned</span> は自動取得の実装を準備中です。
        </p>
        <div className="bg-white border border-[#e5e1da] rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="bg-[#f7f4ef] border-b border-[#e5e1da]">
                <th className="text-left px-3 py-2 text-[#6b7280] font-medium w-12">ID</th>
                <th className="text-left px-3 py-2 text-[#6b7280] font-medium">指標名</th>
                <th className="text-left px-3 py-2 text-[#6b7280] font-medium hidden sm:table-cell">分野</th>
                <th className="text-left px-3 py-2 text-[#6b7280] font-medium hidden md:table-cell">更新頻度</th>
                <th className="text-left px-3 py-2 text-[#6b7280] font-medium w-16">状態</th>
              </tr>
            </thead>
            <tbody>
              {INDICATOR_REGISTRY.map((ind) => (
                <tr key={ind.id} className="border-b border-[#e5e1da] last:border-0 hover:bg-[#f7f4ef]/50">
                  <td className="px-3 py-2 font-mono text-[10px] text-[#6b7280]">{ind.id}</td>
                  <td className="px-3 py-2">
                    <a href={ind.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[#2e7d8c] hover:underline">{ind.name}</a>
                  </td>
                  <td className="px-3 py-2 text-[#6b7280] hidden sm:table-cell">{ind.category}</td>
                  <td className="px-3 py-2 text-[#6b7280] hidden md:table-cell">{ind.updateCadence}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      ind.status === "active" ? "bg-emerald-50 text-emerald-600" :
                      ind.status === "manual" ? "bg-amber-50 text-amber-600" :
                      "bg-slate-100 text-[#6b7280]"
                    }`}>{ind.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Indicator selection criteria */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-3">指標の選定基準</h2>
        <ul className="space-y-2 text-sm text-[#6b7280]">
          {[
            "公的機関が公開している統計を優先する",
            "時系列データ（複数年）で推移が確認できるもの",
            "市民にとって直感的に理解しやすい指標",
            "「6つの力」の各側面を代表するもの",
            "推計値の場合はその旨を明記する",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#2e7d8c] mt-0.5 shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Disclaimer */}
      <section className="mb-10 bg-[#f7f4ef] border border-[#e5e1da] rounded-xl p-5">
        <h2 className="text-sm font-bold text-[#1a1a2e] mb-2">免責事項</h2>
        <p className="text-sm text-[#6b7280] leading-relaxed">
          本サイトの情報は最大限正確を期していますが、公式情報との差異が生じる場合があります。
          重要な判断には必ず各公式サイトの最新情報をご確認ください。
          また、「活かされている資源」「活かしきれていない課題」の評価および「カスコア」は編集部の主観を含みます。
        </p>
      </section>

      {/* Update history */}
      <section className="mb-10">
        <SectionHeading title="更新履歴" />
        <div className="space-y-2">
          {updates.map((upd) => (
            <div key={upd.id} className="py-2 border-b border-[#e5e1da]">
              <UpdateBadge update={upd} />
            </div>
          ))}
        </div>
      </section>

      {/* All sources */}
      <section>
        <SourceList sources={sources} title="使用データ出典一覧" />
      </section>
    </PageContainer>
  );
}
