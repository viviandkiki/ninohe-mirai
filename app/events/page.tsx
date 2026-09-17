import type { Metadata } from "next";
import { Database, Radio, RefreshCw, ShieldCheck } from "lucide-react";
import EventExplorer from "@/components/EventExplorer";
import { events } from "@/lib/events";

export const metadata: Metadata = {
  title: "二戸イベントカレンダー",
  description: "二戸市内のイベントを日付・カテゴリ・地区から探し、開催場所をGoogleマップで確認できます。",
};

export const dynamic = "force-dynamic";

const SOURCE_GROUPS = [
  {
    title: "現在収録している一次情報",
    description: "開催日時・会場・申込の要否を公式ページで確認して掲載しています。",
    links: [
      { label: "二戸市観光ツーリズム協会 催事", href: "https://www.ninohe-kanko.com/event" },
      { label: "二戸市公式 イベントカレンダー", href: "https://www.city.ninohe.lg.jp/Info/326" },
    ],
  },
  {
    title: "主催者・会場の発信",
    description: "定期市や小規模マルシェは、主催者と会場の発信を確認して掲載します。",
    links: [
      { label: "なにゃーとよ市の会", href: "https://mix.jpn.org/yoichi" },
      { label: "なにゃーと公式サイト", href: "https://nanyato-sisetu.com/" },
      { label: "二戸青果市場 日曜朝市", href: "https://www.city.ninohe.lg.jp/info/2451" },
    ],
  },
  {
    title: "地域メディア・SNSの発信",
    description: "WalkerplusやXで催しを発見し、公式・主催者情報と照合してから公開します。",
    links: [
      { label: "Walkerplus 岩手県イベント", href: "https://www.walkerplus.com/event_list/ar0203/" },
      { label: "田中舘愛橘記念科学館 公式X", href: "https://x.com/T_Aikitu_sci" },
      { label: "岩手県県北広域振興局 公式X", href: "https://x.com/iwate_kennpoku" },
      { label: "おでかけ二戸イベント情報", href: "https://mix.jpn.org/" },
      { label: "広報にのへ", href: "https://www.city.ninohe.lg.jp/div/jouhou/koho/index.html" },
    ],
  },
];

export default function EventsPage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const nowIso = new Date().toISOString();
  const structuredData = events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.start,
    endDate: event.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: event.address,
      geo: {
        "@type": "GeoCoordinates",
        latitude: event.latitude,
        longitude: event.longitude,
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
    url: event.sourceUrl,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 py-7 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <header className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="inline-flex items-center rounded-full bg-[#e0f2f7] px-3 py-1 text-sm font-bold text-[#0e6b7c]">
            NINOHE EVENT MAP
          </span>
          <span className="text-sm text-slate-500">公式・主催者情報を確認し、発見元も表示</span>
        </div>
        <h1 className="font-black tracking-tight text-slate-950">二戸のイベントを、日付と地図から探す</h1>
        <p className="mt-3 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-600">
          お祭り、マルシェ、体験講座など、二戸市内のお出かけ情報をひとつにまとめました。
          行きたいイベントを選ぶと、会場をGoogleマップですぐ確認できます。
        </p>
      </header>

      <EventExplorer events={events} googleMapsApiKey={googleMapsApiKey} nowIso={nowIso} />

      <section className="mt-12 sm:mt-16" aria-labelledby="source-heading">
        <div className="max-w-3xl mb-6">
          <p className="text-xs font-bold tracking-[0.18em] text-[#0e6b7c] mb-2">DATA SOURCES</p>
          <h2 id="source-heading" className="text-2xl sm:text-3xl font-black text-slate-900">どこから情報を集めるか</h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            網羅性より先に正確性を守り、公式情報を優先します。同じ催しが複数サイトにある場合は一つにまとめ、確認日と元ページを残します。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {SOURCE_GROUPS.map((group, index) => (
            <article key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${index === 0 ? "bg-[#e0f2f7] text-[#0e6b7c]" : "bg-[#f1f5f9] text-slate-600"}`}>
                  {index === 0 ? (
                    <ShieldCheck className="w-6 h-6" aria-hidden="true" />
                  ) : index === 1 ? (
                    <Database className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Radio className="w-6 h-6" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{group.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{group.description}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-[#0e6b7c] underline underline-offset-4 hover:text-[#095766]">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-[#0f172a] text-white p-6 sm:p-8" aria-labelledby="operation-heading">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 lg:gap-7 items-start">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#4dd4e7]" aria-hidden="true" />
          </div>
          <div>
            <h2 id="operation-heading" className="text-2xl font-black text-white">「全部載っている」に近づける運用</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-white/75">
              <div>
                <p className="font-black text-white mb-1">1. 公式情報を定期確認</p>
                <p className="text-sm leading-relaxed">観光協会、市公式、施設サイトに加え、主催者SNSや地域ブログも巡回します。</p>
              </div>
              <div>
                <p className="font-black text-white mb-1">2. 主催者から受け付け</p>
                <p className="text-sm leading-relaxed">地域団体や店舗が同じ項目で投稿できる受付フォームを次段階で用意します。</p>
              </div>
              <div>
                <p className="font-black text-white mb-1">3. 公開前に人が確認</p>
                <p className="text-sm leading-relaxed">個人発信は発見の入口として扱い、日時・会場を主催者に確認してから反映します。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
