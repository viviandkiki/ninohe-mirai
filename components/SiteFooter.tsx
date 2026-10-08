import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#1e2a3a] bg-[#050810] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 font-bold mb-3">
              <span className="text-xl text-white font-black tracking-tight">ニノヘミライ</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-3">
              荻野光希が個人で運営する、二戸市の非公式な地域情報ダッシュボードです。
              二戸市・二戸市議会の公式サイトではありません。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              コンテンツ
            </p>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/events", label: "二戸イベントカレンダー" },
                { href: "/powers", label: "まちの今：6つのレンズ" },
                { href: "/graph", label: "言葉の地図" },
                { href: "/movement", label: "議会と地域の動き" },
                { href: "/council-videos", label: "議会放送アーカイブ" },
                { href: "/actors", label: "担い手" },
                { href: "/methodology", label: "データの根拠" },
                { href: "/about", label: "このサイトについて" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-white/60 hover:text-[#4dd4e7] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Data policy */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
              データポリシー
            </p>
            <ul className="space-y-2 text-base text-white/60 leading-relaxed">
              <li>・ 掲載データは公開情報に基づきます</li>
              <li>・ 事実と運営者の要約は分けて表示します</li>
              <li>・ 個人情報は必要最小限に扱います</li>
              <li>・ 発言量だけで人物を評価しません</li>
              <li>・ 候補者の優劣・ランキングは行いません</li>
            </ul>
            <p className="text-xs text-white/40 mt-3">
              主な出典：二戸市・岩手県・国統計・二戸市議会
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/privacy" className="text-white/60 hover:text-[#4dd4e7] transition-colors">プライバシー方針</Link>
              <Link href="/terms" className="text-white/60 hover:text-[#4dd4e7] transition-colors">利用条件</Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-white/30 leading-relaxed">
            掲載データは公開情報をもとに運営者が独自に整理したものです。
            最新・正確な情報は各公式サイトをご確認ください。
          </p>
          <p className="text-xs text-white/20 shrink-0">© 2026 荻野光希 / ニノヘミライ</p>
        </div>
      </div>
    </footer>
  );
}
